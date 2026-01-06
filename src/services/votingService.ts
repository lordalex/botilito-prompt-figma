import { supabase } from '@/utils/supabase/client';

export interface VoteRequest {
  case_id: string;
  classification: string;
  reason: string;
}

export async function submitVote(payload: VoteRequest) {
  const { data, error } = await supabase.functions.invoke('vote-auth-async-verbose/submit', {
    method: 'POST',
    body: payload,
  });

  if (error) {
    console.error('Error submitting vote:', error);
    throw new Error(error.message || 'Error al enviar la validación');
  }

  return data;
}
