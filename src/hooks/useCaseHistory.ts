/**
 * @file useCaseHistory.ts
 * @description React hook for fetching and managing case history data.
 *
 * ## LLM CONTEXT - HOOK ARCHITECTURE
 *
 * This hook powers the "Historial" (History) tab in ContentReview.tsx.
 * It fetches the same data as useHumanVerification but is used for viewing
 * completed/historical cases rather than pending validation cases.
 *
 * ### Why Use fetchVerificationSummary?
 * Both Historial and Validación Humana need IDENTICAL data transformations:
 * - Theme color mapping
 * - AMI level badge generation
 * - Reporter name extraction
 * - Display ID formatting
 *
 * By using the same API function, we guarantee visual consistency across tabs.
 *
 * ### Data Flow:
 * ```
 * fetchVerificationSummary(page, pageSize)
 *     ↓
 * API: GET /functions/v1/get-verification-summary
 *     ↓
 * Response enrichment (theme, AMI levels, display IDs)
 *     ↓
 * CaseEnriched[] stored in state
 *     ↓
 * Passed to CaseList with isEnrichedFormat=true
 * ```
 *
 * ### State Management:
 * - `cases`: Array of enriched case objects
 * - `loading`: Boolean for loading state
 * - `error`: Error message string (null if no error)
 * - `stats`: Derived statistics (total, verified, aiOnly, misinformation)
 * - `pagination`: Page controls (currentPage, setCurrentPage, hasMore)
 * - `filters`: Status filter controls (not fully implemented on backend yet)
 *
 * ### Usage Example:
 * ```tsx
 * const { cases, loading, error, stats, refresh } = useCaseHistory();
 *
 * return (
 *   <CaseList
 *     cases={cases}
 *     isLoading={loading}
 *     isEnrichedFormat={true}  // CRITICAL: Must be true for CaseEnriched[]
 *   />
 * );
 * ```
 *
 * @see ContentReview.tsx - Consumer component
 * @see @/utils/humanVerification/api.ts - API functions
 * @see useHumanVerification.ts - Similar hook for validation tab
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchVerificationSummary } from '@/utils/humanVerification/api';
import type { CaseEnriched } from '@/utils/humanVerification/types';

export function useCaseHistory() {
  // Data State
  const [cases, setCases] = useState<CaseEnriched[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchCases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the same API function as HumanVerification for consistent transformations
      const result = await fetchVerificationSummary(currentPage, pageSize);

      setCases(result.cases || []);
      setHasMore(result.pagination.hasMore);

    } catch (err: any) {
      console.error('Error fetching history:', err);
      setError(String(err.message || err) || "Error desconocido al cargar historial");
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  // Trigger fetch on filter changes
  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  // Client-side filtering for status (if API doesn't support status filter yet)
  // Note: ideally status filtering happens on backend, but for now we filter the current page
  const filteredCases = useMemo(() => {
    if (statusFilter === 'all') return cases;
    return cases.filter(c => {
      if (statusFilter === 'verified') return c.consensus?.state === 'human_consensus';
      if (statusFilter === 'ai_only') return c.consensus?.state === 'ai_only';
      if (statusFilter === 'misinfo') return c.metadata?.global_verdict === 'TAMPERED';
      return true;
    });
  }, [cases, statusFilter]);

  // Stats derived from current view (approximate since we don't have global aggregation endpoint)
  const stats = {
    total: cases.length,
    verified: cases.filter(c => c.consensus?.state === 'human_consensus').length,
    aiOnly: cases.filter(c => c.consensus?.state === 'ai_only').length,
    misinformation: cases.filter(c => c.metadata?.global_verdict === 'TAMPERED').length
  };

  return {
    cases: filteredCases,
    loading,
    error,
    stats,
    pagination: {
      currentPage,
      setCurrentPage,
      pageSize,
      hasMore,
    },
    filters: {
      statusFilter,
      setStatusFilter
    },
    refresh: fetchCases
  };
}
