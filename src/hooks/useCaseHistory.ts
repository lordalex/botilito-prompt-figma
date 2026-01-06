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

export function useCaseHistory() {
  // Data State
  const [cases, setCases] = useState<CaseEnriched[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter & Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');

  // Track if initial load has happened to prevent duplicate fetches
  const initialLoadDone = useRef(false);

  // Initial fetch - replaces cases
  const fetchCases = useCallback(async (forceRefresh = false) => {
    try {
      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cached = getCachedData<{ cases: CaseEnriched[], hasMore: boolean }>(CACHE_KEYS.CASE_HISTORY);
        if (cached) {
          setCases(cached.cases);
          setHasMore(cached.hasMore);
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      setError(null);
      setCurrentPage(1);

      // Use the same API function as HumanVerification for consistent transformations
      const result = await fetchVerificationSummary(1, pageSize);

      setCases(result.cases || []);
      setHasMore(result.pagination.hasMore);

      // Cache the result
      setCachedData(CACHE_KEYS.CASE_HISTORY, {
        cases: result.cases || [],
        hasMore: result.pagination.hasMore,
      });

    } catch (err: any) {
      console.error('Error fetching history:', err);
      setError(String(err.message || err) || "Error desconocido al cargar historial");
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  // Load more - appends to existing cases
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;

      const result = await fetchVerificationSummary(nextPage, pageSize);

      // Append new cases to existing ones
      setCases(prev => [...prev, ...(result.cases || [])]);
      setHasMore(result.pagination.hasMore);
      setCurrentPage(nextPage);

    } catch (err: any) {
      console.error('Error loading more cases:', err);
      // Don't clear existing cases on load more error
    } finally {
      setLoadingMore(false);
    }
  }, [currentPage, pageSize, loadingMore, hasMore]);

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
    misinformation: cases.filter(c => c.metadata?.global_verdict === 'TAMPERED').length,
    forensic: cases.filter(c =>
      c.submission_type === 'IMAGE' ||
      c.submission_type === 'VIDEO' ||
      c.submission_type === 'AUDIO' ||
      c.submission_type === 'Image' ||
      c.submission_type === 'Video' ||
      c.submission_type === 'Audio'
    ).length
  };

  return {
    cases: filteredCases,
    loading,
    loadingMore,
    error,
    stats,
    hasMore,
    loadMore,
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
    refresh: () => fetchCases(true) // Force refresh bypasses cache
  };
}
