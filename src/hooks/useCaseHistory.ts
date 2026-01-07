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
 * const { cases, loading, error, stats, hasMore, loadMore, loadingMore, refresh } = useCaseHistory();
 *
 * return (
 *   <CaseList
 *     cases={cases}
 *     isLoading={loading}
 *     isEnrichedFormat={true}  // CRITICAL: Must be true for CaseEnriched[]
 *     hasMore={hasMore}
 *     onLoadMore={loadMore}
 *     isLoadingMore={loadingMore}
 *   />
 * );
 * ```
 *
 * @see ContentReview.tsx - Consumer component
 * @see @/utils/humanVerification/api.ts - API functions
 * @see useHumanVerification.ts - Similar hook for validation tab
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { fetchVerificationSummary } from '@/utils/humanVerification/api';
import type { CaseEnriched } from '@/utils/humanVerification/types';
import { getCachedData, setCachedData, CACHE_KEYS } from '@/utils/sessionCache';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchVerificationSummary } from '@/utils/humanVerification/api';
import type { CaseEnriched } from '@/utils/humanVerification/types';
import { getCachedData, setCachedData, CACHE_KEYS } from '@/utils/sessionCache';

export function useCaseHistory() {
  // Data State
  const [cases, setCases] = useState<CaseEnriched[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stats State
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    aiOnly: 0,
    misinformation: 0,
    forensic: 0
  });

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);

  // Filter State
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchCases = useCallback(async (newPage: number, forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      const [result, nextPageResult] = await Promise.all([
        fetchVerificationSummary(newPage, pageSize),
        fetchVerificationSummary(newPage + 1, 1)
      ]);
      
      const fetchedCases = result.cases || [];
      const more = nextPageResult.cases.length > 0;

      setHasMore(more);
      setCases(fetchedCases);
      setPage(newPage);

      if (more) {
        setTotalPages(newPage + 1);
      } else {
        setTotalPages(newPage);
      }

      if (newPage === 1) {
        const summaryStats = await fetchHistoryStats();
        setStats(summaryStats);
      }

    } catch (err: any) {
      console.error('Error fetching history:', err);
      setError(String(err.message || err) || "Error desconocido al cargar historial");
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchCases(1);
  }, [fetchCases]);

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && (newPage <= totalPages || hasMore)) {
      fetchCases(newPage);
    }
  };
  
  const refresh = () => {
    fetchCases(1, true);
  };

  const filteredCases = useMemo(() => {
    if (statusFilter === 'all') return cases;
    return cases.filter(c => {
      if (statusFilter === 'verified') return c.consensus?.state === 'human_consensus';
      if (statusFilter === 'ai_only') return c.consensus?.state === 'ai_only';
      if (statusFilter === 'misinfo') return c.metadata?.global_verdict === 'TAMPERED';
      return true;
    });
  }, [cases, statusFilter]);

  return {
    cases: filteredCases,
    loading,
    error,
    stats,
    page,
    totalPages,
    goToPage,
    filters: {
      statusFilter,
      setStatusFilter
    },
    refresh,
  };
}
