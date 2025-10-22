import { supabase } from '../supabase/client';
import type { VerificationSummaryResponse, VerificationSummaryResult } from './types';

// Vector Async Summary API base URL
const VECTOR_SUMMARY_URL = 'https://mdkswlgcqsmgfmcuorxq.supabase.co/functions/v1/vector-async/summary';

/**
 * Fetch verification summary data
 * Returns cases pending human verification and system statistics
 *
 * @returns Verification summary with KPIs, recent cases, and distributions
 * @throws Error if API request fails
 */
export async function fetchVerificationSummary(): Promise<VerificationSummaryResult> {
  try {
    const response = await fetch(VECTOR_SUMMARY_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
      throw new Error(error.error || `Error ${response.status}: ${response.statusText}`);
    }

    const data: VerificationSummaryResponse = await response.json();

    // Check if the response is already completed
    if (data.status === 'completed' && data.result) {
      return data.result;
    }

    // If status is pending or processing, we might need to poll
    // For now, we'll throw an error if data is not ready
    if (data.status === 'failed') {
      throw new Error(data.error?.message || 'La generación del resumen falló');
    }

    throw new Error('Los datos aún no están listos. Por favor, intenta de nuevo.');
  } catch (error) {
    console.error('Error fetching verification summary:', error);
    throw error;
  }
}

/**
 * Submit human verification for a case
 *
 * @param caseId - The case ID to verify
 * @param labels - Array of diagnostic labels
 * @param notes - Optional verification notes
 * @param userId - User ID performing the verification
 * @returns Success status
 */
export async function submitHumanVerification(
  caseId: string,
  labels: string[],
  notes?: string,
  userId?: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Get current session if userId not provided
    let verifierId = userId;
    if (!verifierId) {
      const { data: { session } } = await supabase.auth.getSession();
      verifierId = session?.user?.id;
    }

    if (!verifierId) {
      throw new Error('Usuario no autenticado');
    }

    // This would need to be implemented with the actual endpoint
    // For now, we'll create a placeholder structure
    const { data, error } = await supabase
      .from('human_verifications')
      .insert({
        case_id: caseId,
        user_id: verifierId,
        labels,
        notes,
        created_at: new Date().toISOString()
      });

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: 'Verificación enviada exitosamente'
    };
  } catch (error) {
    console.error('Error submitting human verification:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error al enviar verificación'
    };
  }
}

/**
 * Get verification statistics for a user
 *
 * @param userId - User ID
 * @returns User verification statistics
 */
export async function getUserVerificationStats(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_verification_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw error;
    }

    return data || {
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

/**
 * Mock function to simulate fetching a specific case's details
 * In production, this would fetch from the actual case endpoint
 *
 * @param caseId - The case ID to fetch
 * @returns Detailed case information
 */
export async function fetchCaseDetails(caseId: string) {
  try {
    const { data, error } = await supabase
      .from('cases')
      .select(`
        *,
        documents_vectors (
          url,
          metadata,
          content
        ),
        case_labels (
          label,
          source,
          confidence
        )
      `)
      .eq('id', caseId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching case details:', error);
    throw error;
  }
}

/**
 * Transform API response to UI-friendly format
 */
export function transformCasesForUI(cases: VerificationSummaryResult['recent_cases']) {
  return cases.map(caseData => ({
    id: caseData.id,
    type: caseData.submission_type.toLowerCase(),
    title: caseData.title,
    content: caseData.related_documents[0]?.summary || '',
    headline: caseData.title,
    url: caseData.url,
    source: {
      name: new URL(caseData.url).hostname.replace('www.', ''),
      url: caseData.url
    },
    theme: 'General', // This would need to be extracted from metadata
    aiAnalysis: {
      veracity: getVeracityFromLabels(caseData.diagnostic_labels),
      confidence: 0.85, // This would need to come from AI analysis
      detectedMarkers: caseData.diagnostic_labels,
      issues: [], // Would need to be extracted from AI analysis
      summary: `Caso con ${caseData.human_votes_count} votos humanos. Estado de consenso: ${caseData.consensus.state}`,
      sources: [caseData.submission_type],
      markersDetected: caseData.diagnostic_labels.map(label => ({
        type: label,
        confidence: 0.8 // Would need actual confidence scores
      }))
    },
    humanVotes: caseData.human_votes_count,
    consensusState: caseData.consensus.state,
    priority: caseData.priority,
    createdAt: caseData.created_at,
    relatedDocuments: caseData.related_documents,
    webSearchResults: caseData.web_search_results
  }));
}

/**
 * Helper function to determine veracity from labels
 */
function getVeracityFromLabels(labels: string[]): string {
  if (labels.includes('falso')) return 'Desinformación';
  if (labels.includes('enganoso')) return 'Posible Desinformación';
  if (labels.includes('verdadero')) return 'Información Verificada';
  if (labels.includes('sin_contexto')) return 'Sin Contexto';
  if (labels.includes('no_verificable')) return 'No Verificable';
  return 'Pendiente de Verificación';
}