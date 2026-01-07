import { supabase } from '../supabase/client';
import { api } from '../../services/api';
import type { JobStatusResponse, VerificationSummaryResult, CaseEnriched } from './types';

/**
 * Generate a display ID for a case
 * Format: TYPE-VECTOR-YYYYMMDD-SEQ
 * Example: T-WB-20241015-156 (Text from Web, Oct 15 2024, sequence 156)
 * 
 * TYPE: T=Text, I=Image, V=Video, A=Audio
 * VECTOR: WB=Web, WH=WhatsApp, FA=Facebook, XX=Twitter/X, IG=Instagram, etc.
 * DATE: YYYYMMDD from created_at
 * SEQ: First 3 digits from UUID converted to number
 */
export function generateDisplayId(caseData: any): string {
  // Handle both StandardizedCase and legacy formats
  const id = caseData.id || '';
  const createdAt = caseData.created_at;
  const url = caseData.url || caseData.overview?.source_domain || '';
  const type = caseData.type || caseData.submission_type || 'text';

  // TYPE: Single letter based on content type
  const typeCode = getTypeCode(type);

  // VECTOR: Detect from URL or source_domain
  const vector = detectVector(url);

  // DATE: Format YYYYMMDD from created_at
  const dateStr = formatDateCode(createdAt);

  // SEQ: Convert first 3 chars of UUID to a 3-digit sequence
  const seq = getSequenceNumber(id);

  return `${typeCode}-${vector}-${dateStr}-${seq}`;
}

/**
 * Get single letter type code
 */
function getTypeCode(type: string): string {
  const t = (type || 'text').toLowerCase();
  if (t.includes('image') || t === 'media') return 'I';
  if (t.includes('video')) return 'V';
  if (t.includes('audio')) return 'A';
  return 'T'; // Text default
}

/**
 * Format date as YYYYMMDD
 */
function formatDateCode(createdAt: string | undefined): string {
  if (!createdAt) return new Date().toISOString().slice(0, 10).replace(/-/g, '');
  try {
    const date = new Date(createdAt);
    return date.toISOString().slice(0, 10).replace(/-/g, '');
  } catch {
    return new Date().toISOString().slice(0, 10).replace(/-/g, '');
  }
}

/**
 * Convert UUID prefix to sequence number
 */
function getSequenceNumber(id: string): string {
  if (!id) return '000';
  // Take first 3 hex chars and convert to number (0-4095), then pad to 3 digits
  const hexPart = id.replace(/-/g, '').substring(0, 3);
  const num = parseInt(hexPart, 16) % 1000;
  return num.toString().padStart(3, '0');
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

/**
 * Determine theme based on case type
 */
function determineTheme(type: string): 'Forense' | 'Desinformódico' {
  const forensicTypes = ['image', 'video', 'audio'];
  return forensicTypes.includes(type?.toLowerCase()) ? 'Forense' : 'Desinformódico';
}

/**
 * Determine AMI level based on case type and analysis results
 */
function determineAmiLevel(std: any): string | undefined {
  const type = std.type?.toLowerCase();
  const title = std.overview?.title || '';
  const verdictLabel = std.overview?.verdict_label || '';

  // For forensic cases (image/video/audio), derive from verdict
  if (['image', 'video', 'audio'].includes(type)) {
    const combinedText = `${title} ${verdictLabel}`.toUpperCase();

    if (combinedText.includes('AUTÉNTICO') || combinedText.includes('AUTHENTIC')) {
      return 'Cumple las premisas AMI'; // Shows "✓ Sin alteraciones"
    }
    if (combinedText.includes('MANIPULADO') || combinedText.includes('MANIPULATED')) {
      return 'No cumple las premisas AMI'; // Shows "Manipulado Digitalmente"
    }
    if (combinedText.includes('SINTÉTICO') || combinedText.includes('SYNTHETIC') ||
      combinedText.includes('GENERADO POR IA') || combinedText.includes('AI GENERATED')) {
      return 'Generado por IA';
    }
    // Default for forensic with unclear verdict
    return 'Requiere un enfoque AMI';
  }

  // For text/URL cases, calculate from AMI criteria insights
  const amiInsights = (std.insights || []).filter((i: any) =>
    i.id?.startsWith('ami_crit') || i.category === 'content_quality'
  );

  if (amiInsights.length > 0) {
    const avgScore = amiInsights.reduce((sum: number, i: any) => sum + (i.score || 0), 0) / amiInsights.length;

    if (avgScore >= 80) return 'Desarrolla las estrategias AMI';
    if (avgScore >= 60) return 'Cumple las premisas AMI';
    if (avgScore >= 40) return 'Requiere un enfoque AMI';
    return 'No cumple las premisas AMI';
  }

  // Default if no AMI data available
  return undefined;
}

/**
 * Transform StandardizedCase to CaseEnriched for backward compatibility
 */
function transformStandardizedToEnriched(std: any): CaseEnriched {
  // Extract diagnostic labels from insights
  const diagnostic_labels = (std.insights || [])
    .map((i: any) => i.label || i.value)
    .filter((l: any) => typeof l === 'string');

  // [Refinement] Map categories to UI Themes (Forense, Desinformódico)
  // This ensures Historial.tsx picks up the correct theme
  const categories = new Set((std.insights || []).map((i: any) => i.category));
  if (categories.has('forensics') || categories.has('technical_analysis')) {
    if (!diagnostic_labels.includes('Forense')) diagnostic_labels.push('Forense');
  }
  if (categories.has('fact_check') || categories.has('content_analysis')) {
    if (!diagnostic_labels.includes('Desinformódico')) diagnostic_labels.push('Desinformódico');
  }

  // Map community data to human_votes
  const human_votes = {
    count: std.community?.votes || 0,
    statistics: [], // DTO simplified
    entries: [] // DTO simplified
  };

  // Map consent/consensus
  const consensusState = std.community?.status || 'ai_only';

  // Map priority (default to medium if not found)
  const priority = std.overview?.risk_score > 80 ? 'critical' :
    std.overview?.risk_score > 60 ? 'high' :
      std.overview?.risk_score > 40 ? 'medium' : 'low';

  return {
    id: std.id,
    displayId: generateDisplayId(std),
    title: std.overview?.title || 'Sin Título',
    status: std.lifecycle?.job_status || 'completed',
    summary: std.overview?.summary || '',
    content: std.overview?.summary || '', // Fallback
    url: std.overview?.source_domain || '',
    created_at: std.created_at,
    submission_type: std.type ? (std.type.charAt(0).toUpperCase() + std.type.slice(1).toLowerCase()) : 'Text',
    human_votes,
    diagnostic_labels,
    metadata: {
      screenshotUrl: std.overview?.main_asset_url,
      reported_by: std.reporter, // Map reporter to metadata.reported_by for list display
      theme: determineTheme(std.type), // Theme badge: "Forense" or "Desinformódico"
      amiLevel: determineAmiLevel(std), // AMI compliance level badge
      ...std.metadata
    },
    state: consensusState === 'consensus' || consensusState === 'human_only' ? 'human_consensus' : 'ai_only',
    final_labels: [std.overview?.verdict_label].filter(Boolean),
    priority,
    consensus: {
      state: consensusState,
      final_labels: [std.overview?.verdict_label].filter(Boolean)
    },
    // Keep raw DTO just in case we migrated UI to use it
    standardized_case: std
  } as CaseEnriched & { standardized_case?: any };
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
      // Map cases to enriched format
      const enrichedCases = result.cases.map(transformStandardizedToEnriched);
      return {
        ...result,
        cases: enrichedCases
      };
    }
    throw new Error("API response did not contain 'cases'");

  } catch (error) {
    console.error('Error fetching verification summary:', error);
    throw error;
  }
}

/**
 * Fetch JUST the stats/summary without loading a large list of cases.
 * Used for the "Historial" header counters.
 */
export async function fetchHistoryStats(): Promise<{ total: number; verified: number; aiOnly: number; misinformation: number; forensic: number }> {
  try {
    // Request a summary with pageSize=1 just to get the metadata/total counts
    // Assuming the backend returns the 'summary' object or 'pagination.totalItems'
    const result = await fetchVerificationSummary(1, 1);

    // If the API returns a top-level summary object (best case)
    if (result.summary) {
      return {
        total: result.summary.total ?? 0,
        verified: result.summary.verified ?? 0,
        aiOnly: result.summary.aiOnly ?? 0,
        misinformation: result.summary.misinformation ?? 0,
        forensic: result.summary.forensic ?? 0
      };
    }

    // Fallback: If API only returns totalItems in pagination
    if (result.pagination && typeof result.pagination.totalItems === 'number') {
      return {
        total: result.pagination.totalItems,
        verified: 0, // Cannot know without specific endpoint
        aiOnly: 0,
        misinformation: 0,
        forensic: 0
      };
    }

    return { total: 0, verified: 0, aiOnly: 0, misinformation: 0, forensic: 0 };
  } catch (e) {
    console.error("Error fetching history stats:", e);
    return { total: 0, verified: 0, aiOnly: 0, misinformation: 0, forensic: 0 };
  }
}

export async function fetchVerifiedCasesForImmunization(page: number, pageSize: number): Promise<VerificationSummaryResult> {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    // We search for cases that contain the consensus object in their metadata/content
    const query = '"consensus": {';
    const { job_id } = await api.ingestion.search(session!, query, page, pageSize);

    if (!job_id) {
      throw new Error('No se recibió un ID de trabajo válido');
    }

    const result = await pollJobStatus(job_id);
    if ('cases' in result) {
      // Map cases to enriched format
      const enrichedCases = result.cases.map(transformStandardizedToEnriched);
      return {
        ...result,
        cases: enrichedCases
      };
    }
    throw new Error("API response did not contain 'cases'");

  } catch (error) {
    console.error('Error fetching verified cases for immunization:', error);
    throw error;
  }
}

export async function fetchCaseDetails(caseId: string): Promise<CaseEnriched> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    // Use the lookup endpoint which returns the DTO
    const { job_id } = await api.humanVerification.getCaseDetails(session, caseId);

    const result = await pollJobStatus(job_id);

    // Result might be inside 'case' or just the object if using standard search-dto/lookup? 
    // The previous code checked for 'case'. 
    // If the new API returns { case: StandardizedCase } or just StandardizedCase?
    // User response for search-dto/status was { cases: [...] }.
    // Lookup usually returns a single item. Let's assume it wraps in 'case' or is the item.

    let rawCase = null;
    if ('case' in result) {
      rawCase = result.case;
    } else if ('cases' in result && result.cases.length > 0) {
      rawCase = result.cases[0];
    } else {
      // Fallback: maybe result IS the case if it has 'id' and 'overview'
      if (result.id && result.overview) {
        rawCase = result;
      }
    }

    if (rawCase) {
      return transformStandardizedToEnriched(rawCase);
    }

    throw new Error("API response did not contain a valid case object");

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
    const profile = await api.profile.getById(session, userId);

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

