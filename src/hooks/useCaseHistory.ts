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
