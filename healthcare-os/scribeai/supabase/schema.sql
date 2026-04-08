-- Enable vector and UUID extensions
create extension if not exists "uuid-ossp";
create extension if not exists "vector";

-- CLINICS
create table clinics (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  subscription_tier text default 'trial',
  subscription_status text default 'active',
  trial_ends_at timestamptz default (now() + interval '14 days'),
  stripe_customer_id text,
  stripe_subscription_id text,
  consultation_count int default 0,
  organization_id uuid, -- For Enterprise hierarchy
  soap_template text, -- Custom prompt template
  created_at timestamptz default now()
);

-- DOCTORS
create table doctors (
  id uuid primary key references auth.users on delete cascade,
  clinic_id uuid references clinics on delete cascade,
  full_name text not null,
  email text not null,
  role text default 'doctor', -- doctor, scribe, billing_admin
  created_at timestamptz default now()
);

-- PATIENTS
create table patients (
  id uuid primary key default uuid_generate_v4(),
  clinic_id uuid references clinics on delete cascade,
  full_name text not null,
  age int,
  gender text,
  phone text,
  notes text,
  created_at timestamptz default now()
);

-- CONSULTATIONS
create table consultations (
  id uuid primary key default uuid_generate_v4(),
  clinic_id uuid references clinics on delete cascade,
  doctor_id uuid references doctors,
  patient_id uuid references patients,
  audio_url text,
  transcript text,
  soap_note jsonb,
  language text default 'en',
  duration_seconds int,
  chief_complaint text,
  status text default 'pending',
  modified_at timestamptz default now(),
  modified_by uuid references doctors,
  created_at timestamptz default now()
);

-- INDEXES
create index on doctors(clinic_id);
create index on patients(clinic_id);
create index on consultations(clinic_id);
create index on consultations(doctor_id);

-- TRIGGER to check patient clinic_id matches consultation clinic_id
create or replace function check_consultation_patient_clinic()
returns trigger as $$
declare
  patient_clinic_id uuid;
begin
  if NEW.patient_id is not null then
    select clinic_id into patient_clinic_id from patients where id = NEW.patient_id;
    if patient_clinic_id != NEW.clinic_id then
      raise exception 'Patient does not belong to the same clinic as the consultation.';
    end if;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger tr_check_consultation_patient
  before insert or update on consultations
  for each row execute function check_consultation_patient_clinic();

create index on consultations(patient_id);
create index on consultations(created_at desc);

-- AUDIT LOGS
create table audit_logs (
  id uuid primary key default uuid_generate_v4(),
  clinic_id uuid references clinics on delete cascade,
  doctor_id uuid references doctors,
  action text not null,
  metadata jsonb,
  created_at timestamptz default now()
);

create index on audit_logs(clinic_id);
create index on audit_logs(doctor_id);
create index on audit_logs(created_at desc);

-- INVITATIONS
create table invitations (
  id uuid primary key default uuid_generate_v4(),
  clinic_id uuid references clinics on delete cascade not null,
  inviter_id uuid references doctors not null,
  email text not null,
  role text default 'doctor', -- doctor, scribe, billing_admin
  status text default 'pending', -- pending, accepted, expired
  token uuid default uuid_generate_v4() not null unique,
  created_at timestamptz default now(),
  expires_at timestamptz default now() + interval '7 days'
);

create index on invitations(clinic_id);
create index on invitations(token);
create index on invitations(email);

-- WEBHOOKS (EHR Integration)
create table webhooks (
  id uuid primary key default uuid_generate_v4(),
  clinic_id uuid references clinics on delete cascade,
  url text not null,
  secret text not null,
  event_types text[] default '{note.generated}',
  is_active boolean default true,
  created_at timestamptz default now()
);

create table webhook_deliveries (
  id uuid primary key default uuid_generate_v4(),
  webhook_id uuid references webhooks on delete cascade,
  event_type text not null,
  payload jsonb,
  status_code int,
  success boolean,
  created_at timestamptz default now()
);

create index on webhooks(clinic_id);
create index on webhook_deliveries(webhook_id);

-- RLS
alter table clinics enable row level security;
alter table doctors enable row level security;
alter table patients enable row level security;
alter table consultations enable row level security;
alter table audit_logs enable row level security;
alter table invitations enable row level security;
alter table webhooks enable row level security;
alter table webhook_deliveries enable row level security;

-- FUNCTION for getting user's clinic_id
create or replace function get_clinic_id()
returns uuid
language sql security definer stable set search_path = public
as $$
  select clinic_id from doctors where id = auth.uid() limit 1;
$$;

-- POLICIES
create policy "clinics view" on clinics for select
  using (id = get_clinic_id());

create policy "doctors clinic view" on doctors for select
  using (clinic_id = get_clinic_id());

create policy "doctors profile edit" on doctors for update
  using (id = auth.uid());

create policy "patients own clinic" on patients for all
  using (clinic_id = get_clinic_id());

-- Consultations
create policy "consultations select" on consultations for select
  using (clinic_id = get_clinic_id());

create policy "consultations insert" on consultations for insert
  with check (clinic_id = get_clinic_id() and doctor_id = auth.uid());

create policy "consultations update" on consultations for update
  using (clinic_id = get_clinic_id());

create policy "consultations delete" on consultations for delete
  using (clinic_id = get_clinic_id());

-- Audit Logs
create policy "audit_logs select" on audit_logs for select
  using (clinic_id = get_clinic_id());

-- Invitations
create policy "invitations select" on invitations for select
  using (clinic_id = get_clinic_id());

-- Webhooks
create policy "webhooks select" on webhooks for select
  using (clinic_id = get_clinic_id());
create policy "webhooks insert" on webhooks for insert
  with check (clinic_id = get_clinic_id());
create policy "webhooks update" on webhooks for update
  using (clinic_id = get_clinic_id());
create policy "webhooks delete" on webhooks for delete
  using (clinic_id = get_clinic_id());

create policy "webhook_deliveries select" on webhook_deliveries for select
  using (webhook_id in (select id from webhooks where clinic_id = get_clinic_id()));

-- KNOWLEDGE BASE (Helpdoc Integration)
create table knowledge_base (
  id uuid primary key default uuid_generate_v4(),
  clinic_id uuid references clinics on delete cascade,
  title text not null,
  content text not null,
  metadata jsonb,
  embedding vector(1536), 
  source_type text default 'manual', -- manual, note, research
  source_id uuid, -- Reference to consultation_id or patient_id
  created_at timestamptz default now()
);

create index on knowledge_base(clinic_id);
create index on knowledge_base using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

alter table knowledge_base enable row level security;

create policy "knowledge_base select" on knowledge_base for select
  using (clinic_id = get_clinic_id() or clinic_id is null);

create policy "knowledge_base insert" on knowledge_base for insert
  with check (clinic_id = get_clinic_id());

create policy "knowledge_base delete" on knowledge_base for delete
  using (clinic_id = get_clinic_id());

-- STORAGE bucket for audio recordings
insert into storage.buckets (id, name, public) values ('recordings', 'recordings', false)
  on conflict (id) do nothing;

create policy "clinic storage access" on storage.objects for all
  using (
    bucket_id = 'recordings' and 
    (storage.foldername(name))[1] = get_clinic_id()::text
  );
