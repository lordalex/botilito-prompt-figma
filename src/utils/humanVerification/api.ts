import { supabase } from '../supabase/client';
import { api } from '../../services/api';
import type { JobStatusResponse, VerificationSummaryResult, CaseEnriched } from './types';

/**
 * Generate a display ID for a case
 * Format: VECTOR-TIPO-REGION-TEMA-HASH
 * Example: WE-TX-LA-PO-22D
 */
export function generateDisplayId(caseData: CaseEnriched): string {
  // VECTOR: Detect from URL
  const vector = detectVector(caseData.url || '');

  // TIPO: From submission_type
  const tipo = getTipoCode(caseData.submission_type);

  // REGION: Default to LA (LatAm) - can be enhanced later
  const region = 'LA';

  // TEMA: Default to GE (General) - can be enhanced from diagnostic_labels
  const tema = getTemaFromLabels(caseData.diagnostic_labels);

  // HASH: First 3 characters of UUID, uppercase
  const hash = caseData.id.replace(/-/g, '').substring(0, 3).toUpperCase();

  return `${vector}-${tipo}-${region}-${tema}-${hash}`;
}

/**
 * Detect platform/vector from URL
 */
function detectVector(url: string): string {
  if (!url) return 'OT'; // Other

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase().replace('www.', '');

    const vectorMap: Record<string, string> = {
      'whatsapp.com': 'WH',
      'web.whatsapp.com': 'WH',
      'facebook.com': 'FA',
      'fb.com': 'FA',
      'fb.watch': 'FA',
      'twitter.com': 'XX',
      'x.com': 'XX',
      'instagram.com': 'IG',
      'tiktok.com': 'TK',
      'youtube.com': 'YT',
      'youtu.be': 'YT',
      'telegram.org': 'TL',
      't.me': 'TL',
      'reddit.com': 'RD',
      'linkedin.com': 'LI',
    };

    if (vectorMap[hostname]) {
      return vectorMap[hostname];
    }

    for (const [domain, code] of Object.entries(vectorMap)) {
      if (hostname.includes(domain.split('.')[0])) {
        return code;
      }
    }

    return 'WE'; // Web (default)
  } catch {
    return 'OT'; // Other
  }
}

/**
 * Get content type code
 */
function getTipoCode(submissionType: string | undefined): string {
  const tipoMap: Record<string, string> = {
    'text': 'TX',
    'url': 'TX',
    'image': 'IM',
    'video': 'VI',
    'audio': 'AU',
  };
  return tipoMap[(submissionType || 'text').toLowerCase()] || 'TX';
}

/**
 * Get theme code from diagnostic labels
 */
function getTemaFromLabels(labels: string[] | undefined): string {
  if (!labels || labels.length === 0) return 'GE'; // General

  // Map diagnostic labels to theme codes
  const temaMap: Record<string, string> = {
    'teoria_conspirativa': 'CO', // Conspiración
    'discurso_odio': 'OD', // Odio
    'discurso_odio_racismo': 'OD',
    'discurso_odio_sexismo': 'OD',
    'incitacion_violencia': 'VI', // Violencia
    'bot_coordinado': 'BO', // Bot
    'sensacionalista': 'SE', // Sensacionalismo
    'falso': 'FA', // Falso
    'enganoso': 'EN', // Engañoso
    'verdadero': 'VE', // Verdadero
  };

  for (const label of labels) {
    if (temaMap[label]) {
      return temaMap[label];
    }
  }

  return 'GE'; // General
}

async function pollJobStatus(jobId: string): Promise<any> {
  const { data: { session } } = await supabase.auth.getSession();
  const maxAttempts = 30;
  const pollInterval = 2000;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const data: JobStatusResponse = await api.ingestion.getStatus(session!, jobId);

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
    const { data: { session } } = await supabase.auth.getSession();
    const { job_id } = await api.humanVerification.getSummary(session, page, pageSize);

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
    const { data: { session } } = await supabase.auth.getSession();
    const { job_id } = await api.humanVerification.getCaseDetails(session, caseId);

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


export async function submitHumanVerificationJob(submission: {
  caseId: string;
  labels: string[];
  notes?: string;
}): Promise<{ job_id: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  return api.humanVerification.submitJob(session, submission);
}


export async function submitHumanVerification(submission: {
  caseId: string;
  labels: string[];
  notes?: string;
}): Promise<{ success: boolean; message: string, result?: any }> {
  try {
    const { job_id } = await submitHumanVerificationJob(submission);
    const { data: { session } } = await supabase.auth.getSession();

    // Poll for the result
    const maxAttempts = 15;
    const pollInterval = 1000;
    for (let i = 0; i < maxAttempts; i++) {
        const data: JobStatusResponse = await api.voting.getStatus(session, job_id);

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
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      // Return a default structure if there's no session, to avoid crashes.
      return { total_verifications: 0, points: 0 };
    }
    
    // The profile endpoint returns the full user profile, including gamification stats.
    const profile = await api.profile.get(session, userId);

    // Map the API response to the structure expected by the UI.
    // 'reputation' is used as the count of verifications.
    // 'xp' is used as the points.
    return {
      total_verifications: profile.reputation || 0,
      points: profile.xp || 0,
    };
  } catch (error) {
    console.error('Error fetching user verification stats:', error);
    // In case of an error, return a default object to prevent UI crashes.
    return { total_verifications: 0, points: 0 };
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

