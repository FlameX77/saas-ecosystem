-- SQL Migration for Personalized Context Memory

CREATE TABLE public.contact_memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
    last_visit TIMESTAMP WITH TIME ZONE,
    service_interest TEXT,
    communication_preference TEXT,
    past_responses TEXT,
    sentiment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(contact_id)
);

-- Enable RLS
ALTER TABLE public.contact_memories ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage active org contacts' memories
CREATE POLICY "Users can manage contact_memories in their org"
ON public.contact_memories
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.contacts c 
  WHERE c.id = contact_memories.contact_id 
  AND c.org_id IN (
      SELECT org_id FROM public.profiles WHERE id = auth.uid()
  )
));
