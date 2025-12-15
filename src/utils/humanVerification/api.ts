import { supabase } from '../supabase/client';
import type { JobInitiatedResponse, JobStatusResponse, VerificationSummaryResult, CaseEnriched } from './types';
import { 
    SUMMARY_ENDPOINT, 
    LOOKUP_ENDPOINT, 
    STATUS_ENDPOINT, 
    VOTE_SUBMIT_ENDPOINT,
    VOTE_API_URL
} from '../../lib/apiEndpoints';

// Helper to get Supabase token
async function getSupabaseToken() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('No active session. Please log in.');
  }
  return session.access_token;
}

async function pollJobStatus(jobId: string): Promise<any> {
  const maxAttempts = 30;
  const pollInterval = 2000;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const response = await fetch(`${STATUS_ENDPOINT}/${jobId}`);
    if (!response.ok) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      attempts++;
      continue;
    }

    const data: JobStatusResponse = await response.json();

    if (data.status === 'completed' && data.result) {
      return data.result;
    }

    if (data.status === 'failed') {
      const errorMessage = typeof data.error === 'string' ? data.error : (data.error as any)?.message;
      throw new Error(errorMessage || 'El trabajo de la API falló');
    }

    await new Promise(resolve => setTimeout(resolve, pollInterval));
    attempts++;
  }

  throw new Error('Tiempo de espera agotado para el trabajo de la API.');
}

export async function fetchVerificationSummary(page: number, pageSize: number): Promise<VerificationSummaryResult> {
  try {
    const createResponse = await fetch(SUMMARY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page, pageSize }),
    });

    if (!createResponse.ok) {
      const error = await createResponse.json().catch(() => ({ error: 'Error desconocido' }));
      throw new Error(error.error || `Error ${createResponse.status}: ${createResponse.statusText}`);
    }

    const { job_id }: JobInitiatedResponse = await createResponse.json();

    if (!job_id) {
      throw new Error('No se recibió un ID de trabajo válido');
    }

    const result = await pollJobStatus(job_id);
    if ('cases' in result) {
        return result;
    }
    throw new Error("API response did not contain 'cases'");

  } catch (error) {
    console.error('Error fetching verification summary:', error);
    throw error;
  }
}

export async function fetchCaseDetails(caseId: string): Promise<CaseEnriched> {
  try {
    const createResponse = await fetch(LOOKUP_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: caseId }),
    });

    if (!createResponse.ok) {
      throw new Error('Failed to start lookup job');
    }

    const { job_id } = await createResponse.json();

    const result = await pollJobStatus(job_id);
    if ('case' in result) {
        return result.case;
    }
    throw new Error("API response did not contain a 'case' object");

  } catch (error) {
    console.error('Error fetching case details:', error);
    throw error;
  }
}


export async function submitHumanVerification(submission: {
  caseId: string;
  labels: string[];
  notes?: string;
}): Promise<{ success: boolean; message: string, result?: any }> {
  try {
    const token = await getSupabaseToken();
    const { caseId, labels, notes } = submission;

    // For simplicity, we'll handle one label at a time.
    const classification = labels[0];

    const payload = {
        case_id: caseId,
        classification: classification,
        reason: notes
    };

    const createResponse = await fetch(VOTE_SUBMIT_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
    });

    if (!createResponse.ok) {
        const errorData = await createResponse.json().catch(() => ({ error: 'Error desconocido al enviar el voto' }));
        throw new Error(errorData.error || `Fallo al enviar el voto con estado: ${createResponse.status}`);
    }

    const { job_id }: JobInitiatedResponse = await createResponse.json();

    // Poll for the result
    const maxAttempts = 15;
    const pollInterval = 1000;
    for (let i = 0; i < maxAttempts; i++) {
        const statusResponse = await fetch(`${VOTE_API_URL}/status/${job_id}`);
        const data: JobStatusResponse = await statusResponse.json();

        if (data.status === 'completed') {
            return {
              success: true,
              message: 'Diagnóstico procesado exitosamente.',
              result: data.result
            };
        }
        if (data.status === 'failed') {
            throw new Error('El procesamiento del voto falló.');
        }
        await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error('Tiempo de espera agotado para el procesamiento del voto.');

  } catch (error) {
    console.error('Error submitting human verification:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error al enviar la verificación'
    };
  }
}


export async function getUserVerificationStats(userId: string) {


  try {


    // TODO: The table 'user_verification_stats' was not found, and 'observations' lacks a 'user_id' column.


    // This function is temporarily returning mock data to prevent app crashes.


    return {


      total_verifications: 0,


      accurate_verifications: 0,


      accuracy_rate: 0,


      points: 0,


      level: 1,


      streak: 0


    };


  } catch (error) {


    console.error('Error fetching user verification stats:', error);


    return null;


  }


}





export function transformCasesForUI(cases: CaseEnriched[]) {


  if (!cases) return [];


  return cases.map(caseData => ({


    ...caseData,


    type: caseData.submission_type?.toLowerCase() || 'text',


    content: caseData.summary || '',


    headline: caseData.title,


    screenshot: caseData.metadata?.screenshotUrl || 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=800',


    source: {


      name: caseData.url ? new URL(caseData.url).hostname.replace('www.', '') : 'N/A',


      url: caseData.url


    },


    aiAnalysis: {


      detectedMarkers: caseData.diagnostic_labels,


    },


    humanVotes: caseData.human_votes?.count || 0,


    consensusState: caseData.consensus?.state || 'N/A',


    priority: 'medium',


    createdAt: caseData.created_at,


  }));


}





function getVeracityFromLabels(labels: string[]): string {


  if (!labels) return 'Pendiente de Verificación';


  if (labels.includes('falso')) return 'Desinformación';


  if (labels.includes('enganoso')) return 'Posible Desinformación';


  if (labels.includes('verdadero')) return 'Información Verificada';


  if (labels.includes('sin_contexto')) return 'Sin Contexto';


  if (labels.includes('no_verificable')) return 'No Verificable';


  return 'Pendiente de Verificación';


}

