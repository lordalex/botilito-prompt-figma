import { fetchVerificationSummary } from '../humanVerification/api';
import { supabase } from '../supabase/client';
import type { HistorialSummaryResult, HistorialCaseUI, HistorialCaseDetail } from './types';
import type { RecentCase } from '../humanVerification/types';
import { DIAGNOSTIC_LABELS } from '../humanVerification/types';

/**
 * Fetch historial data (reuses the same endpoint as Human Verification)
 * Uses the async job pattern implementation
 */
export async function fetchHistorialData(page: number, pageSize: number): Promise<HistorialSummaryResult> {
  return await fetchVerificationSummary(page, pageSize);
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
 * Generate display ID for a case
 * Format: TYPE-SOURCE-YYYYMMDD-NNN
 * Example: T-WB-20241015-156
 */
export function generateDisplayId(caseData: RecentCase): string {
  // Type prefix
  const typeMap: Record<string, string> = {
    'URL': 'U',
    'TEXT': 'T',
    'IMAGE': 'I',
    'VIDEO': 'V'
  };
  const typePrefix = typeMap[caseData.submission_type] || 'X';

  // Source from URL
  let sourcePrefix = 'XX';
  try {
    const url = new URL(caseData.url);
    const hostname = url.hostname.replace('www.', '');
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      sourcePrefix = parts[parts.length - 2].substring(0, 2).toUpperCase();
    }
  } catch (e) {
    // Invalid URL, use default
  }

  // Date
  const date = new Date(caseData.created_at);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  // Sequential number (use last 3 chars of UUID)
  const seqNum = caseData.id.substring(0, 3).toUpperCase();

  return `${typePrefix}-${sourcePrefix}-${dateStr}-${seqNum}`;
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
    submissionType: caseData.submission_type,
    submissionTypeIcon: getSubmissionTypeIcon(caseData.submission_type),
    createdAt: caseData.created_at,
    createdAtFormatted: formatDate(caseData.created_at),
    humanVotesCount: caseData.human_votes_count,
    diagnosticLabels,
    finalVerdict: getFinalVerdict(caseData.consensus.final_labels),
    verificationMethod: getVerificationMethodLabel(caseData.consensus.state),
    consensusState: caseData.consensus.state,
    priority: caseData.priority,
    relatedDocumentsCount: caseData.related_documents.length,
    webSearchResultsCount: caseData.web_search_results.length
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
