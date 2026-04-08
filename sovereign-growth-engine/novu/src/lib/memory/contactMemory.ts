import { SupabaseClient } from '@supabase/supabase-js';

export interface ContactMemory {
  id?: string;
  contact_id: string;
  last_visit?: string | null;
  service_interest?: string | null;
  communication_preference?: string | null;
  past_responses?: string | null;
  sentiment?: string | null;
  updated_at?: string;
}

export async function getMemory(supabase: SupabaseClient, contactId: string): Promise<ContactMemory | null> {
  const { data, error } = await supabase
    .from('contact_memories')
    .select('*')
    .eq('contact_id', contactId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    console.error('Error fetching contact memory:', error);
    return null;
  }
  return data;
}

export async function updateMemory(supabase: SupabaseClient, contactId: string, data: Partial<ContactMemory>) {
  const memory = await getMemory(supabase, contactId);

  if (memory) {
    const { error } = await supabase
      .from('contact_memories')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('contact_id', contactId);
    if (error) console.error('Error updating memory:', error);
  } else {
    const { error } = await supabase
      .from('contact_memories')
      .insert({ contact_id: contactId, ...data });
    if (error) console.error('Error creating memory:', error);
  }
}
