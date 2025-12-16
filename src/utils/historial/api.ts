import { fetchVerificationSummary } from '../humanVerification/api';
import { supabase } from '../supabase/client';
import type { HistorialSummaryResult, HistorialCaseUI, HistorialCaseDetail, RecentCase, RelatedDocument, WebSearchResult } from './types';
import type { CaseEnriched } from '../humanVerification/types';
import { DIAGNOSTIC_LABELS } from '../humanVerification/types';

/**
 * Fetch historial data (reuses the same endpoint as Human Verification)
 * Uses the async job pattern implementation
 */
export async function fetchHistorialData(): Promise<HistorialSummaryResult> {
  return await fetchVerificationSummary();
}

/**
 * Fetch complete case details from /vector-async/case-detail/{caseId}
 * This endpoint provides pre-processed data specifically for the detail view
 * Requires authentication
 *
 * @param caseId - The UUID or display ID of the case
 * @returns Complete case details with merged AI + human analysis
 */
export async function fetchCaseDetails(caseId: string) {
  try {
    // Get current session for auth token
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('Usuario no autenticado');
    }

    console.log('🔍 Fetching case details for caseId:', caseId);

    const response = await fetch(
      `https://mdkswlgcqsmgfmcuorxq.supabase.co/functions/v1/vector-async/case-detail/${caseId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      }
    );

    console.log('📡 Response status:', response.status, response.statusText);

    if (!response.ok) {
      // Try to get error details from response body
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        console.error('❌ Server error details:', errorData);
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        // Response body might not be JSON
        const errorText = await response.text();
        console.error('❌ Server error text:', errorText);
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ Case details received:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching case details:', error);
    throw error;
  }
}

/**
 * Generate display ID for a case - v2.0
 * Format: VECTOR-TIPO-REGION-TEMA-HASH
 * Example: WE-TX-LA-PO-22D
 *
 * Components:
 * - VECTOR (2 chars): Platform of origin (WE=Web, WH=WhatsApp, FA=Facebook, etc.)
 * - TIPO (2 chars): Content type (TX=Text/URL, IM=Image, VI=Video, AU=Audio)
 * - REGION (2 chars): Geographic area (LA=LatAm, CO=Colombia, VE=Venezuela, etc.)
 * - TEMA (2 chars): Theme category (PO=Politics, IN=International, EC=Economy, etc.)
 * - HASH (3 chars): First 3 characters of UUID (uppercase)
 */
export function generateDisplayId(caseData: RecentCase): string {
  // VECTOR: Detect from URL
  const vector = detectVector(caseData.url);

  // TIPO: From submission_type
  const tipo = getTipoCode(caseData.submission_type);

  // REGION: From API field (when available) or fallback
  const region = getRegionCode(extractRegionFromCase(caseData));

  // TEMA: From API field (when available) or fallback to related_documents
  const tema = getTemaCode(extractThemeFromCase(caseData));

  // HASH: First 3 characters of UUID, uppercase
  const hash = caseData.id.replace(/-/g, '').substring(0, 3).toUpperCase();

  return `${vector}-${tipo}-${region}-${tema}-${hash}`;
}

/**
 * Detect platform/vector from URL
 * Returns 2-letter uppercase code for known platforms
 */
function detectVector(url: string): string {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase().replace('www.', '');

    // Known social media platforms
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

    // Check exact matches
    if (vectorMap[hostname]) {
      return vectorMap[hostname];
    }

    // Check if hostname contains known platform names
    for (const [domain, code] of Object.entries(vectorMap)) {
      if (hostname.includes(domain.split('.')[0])) {
        return code;
      }
    }

    // Default: Web
    return 'WE';
  } catch {
    // Invalid URL, default to Web
    return 'WE';
  }
}

/**
 * Get content type code from submission_type
 */
function getTipoCode(submissionType: string): string {
  const tipoMap: Record<string, string> = {
    'URL': 'TX',
    'TEXT': 'TX',
    'Text': 'TX',
    'IMAGE': 'IM',
    'Image': 'IM',
    'VIDEO': 'VI',
    'Video': 'VI',
    'AUDIO': 'AU',
    'Audio': 'AU',
  };
  return tipoMap[submissionType] || 'TX';
}

/**
 * Get region code from region string
 */
function getRegionCode(region: string): string {
  const regionMap: Record<string, string> = {
    'America Latina': 'LA',
    'Latinoamerica': 'LA',
    'Latin America': 'LA',
    'Colombia': 'CO',
    'Venezuela': 'VE',
    'America del Norte': 'NA',
    'Norteamerica': 'NA',
    'North America': 'NA',
    'Estados Unidos': 'NA',
    'United States': 'NA',
    'Europa': 'EU',
    'Europe': 'EU',
    'Global': 'GL',
    'Mundial': 'GL',
    'Asia': 'AS',
    'Africa': 'AF',
    'Oceania': 'OC',
    'N/A': 'XX',
  };
  return regionMap[region] || 'XX';
}

/**
 * Get theme code from theme string
 */
function getTemaCode(theme: string): string {
  const temaMap: Record<string, string> = {
    'Politica': 'PO',
    'Politics': 'PO',
    'Internacional': 'IN',
    'International': 'IN',
    'Economia': 'EC',
    'Economy': 'EC',
    'Salud': 'SA',
    'Health': 'SA',
    'Sucesos': 'SU',
    'Events': 'SU',
    'Deportes': 'DE',
    'Sports': 'DE',
    'Tecnologia': 'TE',
    'Technology': 'TE',
    'Ambiente': 'AM',
    'Environment': 'AM',
    'Social': 'SO',
    'Otro': 'OT',
    'Other': 'OT',
  };
  return temaMap[theme] || 'OT';
}

/**
 * Extract theme from case data
 * Priority: caseData.theme > related_documents[0].theme > default
 */
function extractThemeFromCase(caseData: RecentCase): string {
  // Check if theme is directly available (future API support)
  if ((caseData as any).theme) {
    return (caseData as any).theme;
  }

  // Fallback: Extract from first related document
  if (caseData.related_documents?.length > 0) {
    const firstDoc = caseData.related_documents[0] as any;
    if (firstDoc.theme) {
      return firstDoc.theme;
    }
  }

  return 'Otro';
}

/**
 * Extract region from case data
 * Priority: caseData.region > default
 */
function extractRegionFromCase(caseData: RecentCase): string {
  // Check if region is directly available (future API support)
  if ((caseData as any).region) {
    return (caseData as any).region;
  }

  // Default: Not determined
  return 'N/A';
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
 * Handles CaseEnriched from API with proper field mapping
 */
export function transformCaseToUI(caseData: RecentCase): HistorialCaseUI {
  // Calculate diagnostic label percentages
  const diagnosticLabels = (caseData.diagnostic_labels || []).map((label, index, arr) => {
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

  // Map CaseEnriched fields to HistorialCaseUI
  // CaseEnriched has: human_votes?.count, not human_votes_count
  const humanVotesCount = caseData.human_votes?.count ?? 0;

  // Get consensus with defaults
  const consensusState = caseData.consensus?.state ?? 'ai_only';
  const consensusFinalLabels = caseData.consensus?.final_labels ?? [];

  // Map consensus state to UI state (API uses 'human_consensus', UI expects 'consensus')
  const mappedConsensusState = consensusState === 'human_consensus' ? 'consensus' : consensusState;

  // CaseEnriched doesn't have related_documents, web_search_results, or priority
  // These would come from the case-detail endpoint, not the summary
  const relatedDocs = (caseData as any).related_documents ?? [];
  const webResults = (caseData as any).web_search_results ?? [];
  const priority = (caseData as any).priority ?? 'medium';

  return {
    id: caseData.id,
    displayId: generateDisplayId(caseData),
    title: caseData.title,
    url: caseData.url || '',
    submissionType: mapSubmissionType(caseData.submission_type),
    submissionTypeIcon: getSubmissionTypeIcon(caseData.submission_type),
    createdAt: caseData.created_at,
    createdAtFormatted: formatDate(caseData.created_at),
    humanVotesCount,
    diagnosticLabels,
    finalVerdict: getFinalVerdict(consensusFinalLabels),
    verificationMethod: getVerificationMethodLabel(mappedConsensusState),
    consensusState: mappedConsensusState as 'ai_only' | 'human_only' | 'consensus' | 'disagreement',
    priority: priority as 'low' | 'medium' | 'high' | 'critical',
    relatedDocumentsCount: relatedDocs.length,
    webSearchResultsCount: webResults.length
  };
}

/**
 * Map submission_type from API format to UI format
 */
function mapSubmissionType(type: string): 'URL' | 'TEXT' | 'IMAGE' | 'VIDEO' {
  const typeMap: Record<string, 'URL' | 'TEXT' | 'IMAGE' | 'VIDEO'> = {
    'Text': 'TEXT',
    'URL': 'URL',
    'Image': 'IMAGE',
    'Video': 'VIDEO',
    'TEXT': 'TEXT',
    'IMAGE': 'IMAGE',
    'VIDEO': 'VIDEO'
  };
  return typeMap[type] || 'TEXT';
}

/**
 * Transform case to detail view format
 * Handles CaseEnriched from API with proper field mapping
 */
export function transformCaseToDetail(caseData: RecentCase): HistorialCaseDetail {
  const baseCase = transformCaseToUI(caseData);

  // CaseEnriched doesn't have related_documents or web_search_results
  // These would come from a separate case-detail API call
  const relatedDocs = (caseData as any).related_documents ?? [];
  const webResults = (caseData as any).web_search_results ?? [];

  // Generate summary from CaseEnriched.summary or related documents
  let summary = caseData.summary || 'Sin resumen disponible';
  if (!summary && relatedDocs.length > 0) {
    summary = relatedDocs[0].summary;
  }

  // Get consensus with defaults
  const consensusState = caseData.consensus?.state ?? 'ai_only';
  const mappedState = consensusState === 'human_consensus' ? 'consensus' : consensusState;

  return {
    ...baseCase,
    relatedDocuments: relatedDocs as RelatedDocument[],
    webSearchResults: webResults as WebSearchResult[],
    consensus: {
      state: mappedState as 'ai_only' | 'human_only' | 'consensus' | 'disagreement',
      final_labels: caseData.consensus?.final_labels ?? []
    },
    summary
  };
}

/**
 * Transform all cases to UI format
 */
export function transformCasesToUI(cases: RecentCase[]): HistorialCaseUI[] {
  if (!cases || !Array.isArray(cases)) {
    return [];
  }
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
