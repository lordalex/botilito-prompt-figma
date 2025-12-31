import { fetchVerificationSummary, fetchCaseDetails as fetchEnrichedCaseDetails } from '../humanVerification/api';
import { supabase } from '../supabase/client';
import type { HistorialSummaryResult, HistorialCaseUI, HistorialCaseDetail, RecentCase } from './types';
import { DIAGNOSTIC_LABELS } from '../humanVerification/types';

/**
 * Fetch historial data (reuses the same endpoint as Human Verification)
 * Uses the async job pattern implementation
 */
export async function fetchHistorialData(page: number, pageSize: number): Promise<HistorialSummaryResult> {
  return await fetchVerificationSummary(page, pageSize);
}

/**
 * Fetch complete case details
 * Reuses the logic from Human Verification which uses the standardized endpoint
 *
 * @param caseId - The UUID or display ID of the case
 * @returns Complete case details with merged AI + human analysis
 */
export async function fetchCaseDetails(caseId: string) {
  try {
    console.log('🔍 Fetching case details for caseId:', caseId);

    // Fetch enriched case using the shared logic
    const enrichedCase = await fetchEnrichedCaseDetails(caseId);

    // Check if we need to transform it further to match specific Historial expectations
    // HistorialCaseDetail expects 'relatedDocuments', 'webSearchResults' which are in CaseEnriched
    // So enrichedCase should be sufficient or need minimal transformation

    // Returning the enriched case directly as it matches the structure expected by transformCaseToDetail
    // or we can apply transformCaseToDetail here if the caller expects the UI object directly?
    // useHistorialData calls fetchCaseDetails and then sets caseDetail.
    // Wait, useCaseDetail hook calls fetchCaseDetails.
    // The previous implementation returned `data` (JSON).
    // useCaseDetail received it at line 110: `const detail = await fetchCaseDetails(...)`
    // And set it to `setCaseDetail(detail)`.
    // The previous `fetchCaseDetails` returned raw JSON.
    // But `useCaseDetail` expects `HistorialCaseDetail`.
    // `HistorialCaseDetail` is an interface extending `HistorialCaseUI`.
    // The previous `fetchCaseDetails` returned the raw JSON from backend?
    // And `useCaseDetail` just used it?
    // Wait, `HistorialDetailView` uses `HistorialCaseDetail`.

    // Let's verify if I should transform it here.
    // `useCaseDetail` hook (lines 106-121 in useHistorialData.ts):
    // const detail = await fetchCaseDetails(caseId);
    // setCaseDetail(detail);

    // So fetchCaseDetails MUST return `HistorialCaseDetail`.

    // So I need to use `transformCaseToDetail`.

    const uiDetail = transformCaseToDetail(enrichedCase);
    return uiDetail;

  } catch (error) {
    console.error('❌ Error fetching case details:', error);
    throw error;
  }
}

/**
 * Generate display ID for a case (v2.0)
 * Format: VECTOR-TIPO-REGION-TEMA-HASH
 * Example: WE-TX-LA-GE-4E8
 */
export function generateDisplayId(caseData: RecentCase): string {
  // VECTOR: Detect from URL
  const vector = detectVector(caseData.url || '');

  // TIPO: From submission_type
  const tipo = getTipoCode(caseData.submission_type);

  // REGION: Default to LA (LatAm) - can be enhanced later
  const region = 'LA';

  // TEMA: From diagnostic labels
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
    'TEXT': 'TX',
    'URL': 'TX',
    'IMAGE': 'IM',
    'VIDEO': 'VI',
    'AUDIO': 'AU',
  };
  return tipoMap[(submissionType || 'TEXT').toUpperCase()] || 'TX';
}

/**
 * Get theme code from diagnostic labels
 */
function getTemaFromLabels(labels: string[] | undefined): string {
  if (!labels || labels.length === 0) return 'GE'; // General

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

/**
 * Get icon for submission type
 */
export function getSubmissionTypeIcon(type: string): string {
  const iconMap: Record<string, string> = {
    'URL': '📰',
    'TEXT': '📝',
    'IMAGE': '🖼️',
    'VIDEO': '🎥'
  };
  return iconMap[type] || '📄';
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `Hace ${diffMins} min`;
  } else if (diffHours < 24) {
    return `Hace ${diffHours}h`;
  } else if (diffDays < 7) {
    return `Hace ${diffDays}d`;
  } else {
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

/**
 * Get verification method label
 */
export function getVerificationMethodLabel(state: string): string {
  const labelMap: Record<string, string> = {
    'ai_only': 'Solo IA',
    'human_only': 'Verificado por humanos',
    'consensus': 'Consenso IA + Humanos',
    'disagreement': 'En revisión'
  };
  return labelMap[state] || 'Pendiente';
}

/**
 * Get final verdict from consensus
 */
export function getFinalVerdict(finalLabels: string[]): string {
  if (finalLabels.length === 0) {
    return 'Pendiente de verificación';
  }

  // Priority order for verdict
  if (finalLabels.includes('falso')) return 'Falso';
  if (finalLabels.includes('enganoso')) return 'Engañoso';
  if (finalLabels.includes('manipulado')) return 'Manipulado';
  if (finalLabels.includes('sin_contexto')) return 'Sin contexto';
  if (finalLabels.includes('verdadero')) return 'Verdadero';
  if (finalLabels.includes('no_verificable')) return 'No verificable';

  return finalLabels[0] || 'Sin clasificar';
}

/**
 * Transform case to UI format for list view
 */
export function transformCaseToUI(caseData: RecentCase): HistorialCaseUI {
  // Calculate diagnostic label percentages
  const diagnosticLabels = caseData.diagnostic_labels.map((label, index, arr) => {
    const labelInfo = DIAGNOSTIC_LABELS[label] || {
      label: label,
      color: 'text-gray-600',
      bg: 'bg-gray-50',
      border: 'border-gray-200'
    };

    return {
      label: labelInfo.label,
      percentage: Math.round(100 / arr.length), // Equal distribution for now
      color: labelInfo.color,
      bg: labelInfo.bg,
      border: labelInfo.border
    };
  });

  return {
    id: caseData.id,
    displayId: generateDisplayId(caseData),
    title: caseData.title,
    url: caseData.url,
    submissionType: (caseData.submission_type?.toUpperCase() || 'TEXT') as 'URL' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO',
    submissionTypeIcon: getSubmissionTypeIcon(caseData.submission_type?.toUpperCase() || 'TEXT'),
    createdAt: caseData.created_at,
    createdAtFormatted: formatDate(caseData.created_at),
    humanVotesCount: caseData.human_votes?.count || 0,
    diagnosticLabels,
    finalVerdict: getFinalVerdict(caseData.consensus?.final_labels || []),
    verificationMethod: getVerificationMethodLabel(caseData.consensus?.state || 'ai_only'),
    consensusState: (caseData.consensus?.state as 'ai_only' | 'human_only' | 'consensus' | 'disagreement') || 'ai_only',
    priority: caseData.priority || 'low',
    relatedDocumentsCount: caseData.related_documents?.length || 0,
    webSearchResultsCount: caseData.web_search_results?.length || 0,
    summary: caseData.summary || caseData.related_documents?.[0]?.summary || 'Sin resumen disponible',
    riskScore: caseData.standardized_case?.overview?.risk_score || 0
  };
}

/**
 * Transform case to detail view format
 */
export function transformCaseToDetail(caseData: RecentCase): HistorialCaseDetail {
  const baseCase = transformCaseToUI(caseData);

  // Generate summary from related documents
  let summary = 'Sin resumen disponible';
  if (caseData.related_documents.length > 0) {
    summary = caseData.related_documents[0].summary;
  }

  return {
    ...baseCase,
    relatedDocuments: caseData.related_documents,
    webSearchResults: caseData.web_search_results,
    consensus: caseData.consensus,
    summary
  };
}

/**
 * Transform all cases to UI format
 */
export function transformCasesToUI(cases: RecentCase[]): HistorialCaseUI[] {
  return cases.map(transformCaseToUI);
}

/**
 * Filter cases by criteria
 */
export function filterCases(
  cases: HistorialCaseUI[],
  filters: {
    submissionType?: string;
    consensusState?: string;
    priority?: string;
    searchQuery?: string;
  }
): HistorialCaseUI[] {
  return cases.filter(caseItem => {
    // Filter by submission type
    if (filters.submissionType && filters.submissionType !== 'ALL') {
      if (caseItem.submissionType !== filters.submissionType) {
        return false;
      }
    }

    // Filter by consensus state
    if (filters.consensusState && filters.consensusState !== 'ALL') {
      if (caseItem.consensusState !== filters.consensusState) {
        return false;
      }
    }

    // Filter by priority
    if (filters.priority && filters.priority !== 'ALL') {
      if (caseItem.priority !== filters.priority) {
        return false;
      }
    }

    // Filter by search query
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      const matchesTitle = caseItem.title.toLowerCase().includes(query);
      const matchesDisplayId = caseItem.displayId.toLowerCase().includes(query);
      const matchesUrl = caseItem.url.toLowerCase().includes(query);

      if (!matchesTitle && !matchesDisplayId && !matchesUrl) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sort cases
 */
export function sortCases(
  cases: HistorialCaseUI[],
  sortBy: 'date_desc' | 'date_asc' | 'priority_desc' | 'votes_desc'
): HistorialCaseUI[] {
  const sorted = [...cases];

  switch (sortBy) {
    case 'date_desc':
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case 'date_asc':
      sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      break;
    case 'priority_desc':
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      sorted.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
      break;
    case 'votes_desc':
      sorted.sort((a, b) => b.humanVotesCount - a.humanVotesCount);
      break;
  }

  return sorted;
}
