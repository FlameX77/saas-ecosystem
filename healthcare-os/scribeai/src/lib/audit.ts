import { createClient } from './supabase/server';

export async function logAction(
  action: string,
  metadata: any = {},
  options: { clinic_id?: string; doctor_id?: string } = {}
) {
  const supabase = await createClient();
  
  // 1. Resolve Identity
  let { clinic_id, doctor_id } = options;
  if (!clinic_id || !doctor_id) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      doctor_id = doctor_id || user.id;
      // Fetch clinic_id if not provided
      if (!clinic_id) {
        const { data: doctor } = await supabase
          .from('doctors')
          .select('clinic_id')
          .eq('id', user.id)
          .single();
        clinic_id = doctor?.clinic_id;
      }
    }
  }

  if (!clinic_id) {
    console.warn('Audit: Skipping log due to missing clinic_id', { action });
    return;
  }

  // 2. Perform Insert
  const { error } = await supabase.from('audit_logs').insert({
    clinic_id,
    doctor_id,
    action,
    metadata,
  });

  if (error) {
    console.error('Audit Log Error:', error);
  }
}
