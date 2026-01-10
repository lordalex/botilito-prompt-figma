/**
 * @file useCaseHistory.ts
 * @description React hook for fetching and managing case history data.
 *
 * ## LLM CONTEXT - HOOK ARCHITECTURE
 *
 * This hook powers the "Historial" (History) tab in ContentReview.tsx.
 * It fetches case list from fetchHistorialCases (using /search endpoint)
 * and KPI stats from mapa-desinfodemico-verbose endpoint.
 *
 * ### Data Sources:
 * 1. **Case List**: fetchHistorialCases → /search endpoint with consensus_filter: "present"
 * 2. **KPI Stats**: mapa-desinfodemico-verbose endpoint
 *    - total_cases → stats.total
 *    - verificados → stats.verified
 *    - pendientes → stats.aiOnly
 *    - desinfodemico → stats.misinformation
 *    - forense → stats.forensic
 *
 * ### KEY DIFFERENCE from Human Verification:
 * - Historial uses consensus_filter: "present" (cases already voted on)
 * - HumanVerification uses consensus_filter: "missing" (pending validation)
 * - Both use /summary endpoint with select_fields: ["id", "created_at", "type", "overview", "community"]
 *
 * ### Data Flow:
 * ```
 * fetchHistorialCases(page, pageSize)
 *     ↓
 * API: POST /functions/v1/search-dto/summary
 *     ↓
 * Payload: { consensus_filter: "present", page, limit, select_fields }
 *     ↓
 * Response enrichment (theme, AMI levels, display IDs)
 *     ↓
 * CaseEnriched[] stored in state
 *
 * + (in parallel)
 *
 * api.mapaDesinfodemico.getDashboardData(session)
 *     ↓
 * API: POST /functions/v1/mapa-desinfodemico-verbose
 *     ↓
 * KPI stats (total_cases, verificados, pendientes, etc.)
 *     ↓
 * stats state updated
 * ```
 *
 * ### State Management:
 * - `cases`: Array of enriched case objects
 * - `loading`: Boolean for loading state
 * - `error`: Error message string (null if no error)
 * - `stats`: KPI statistics from mapa-desinfodemico-verbose
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
 * @see @/utils/humanVerification/api.ts - API functions for case list
 * @see @/services/api.ts - Centralized API service (mapaDesinfodemico.getDashboardData)
 * @see useHumanVerification.ts - Similar hook for validation tab
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { fetchHistorialCases } from '@/utils/humanVerification/api';
import { api } from '@/services/api';
import type { CaseEnriched } from '@/utils/humanVerification/types';
import { getCachedData, setCachedData, CACHE_KEYS } from '@/utils/sessionCache';
import { useAuth } from '@/providers/AuthProvider';

export function useCaseHistory() {
  const { session } = useAuth();
  
  // Data State
  const [cases, setCases] = useState<CaseEnriched[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stats State (fetched from mapa-desinfodemico-verbose)
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    aiOnly: 0,
    misinformation: 0,
    forensic: 0
  });

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
        // Only use cache if it has actual data (not empty)
        if (cached && cached.cases && cached.cases.length > 0) {
          setCases(cached.cases);
          setHasMore(cached.hasMore);
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      setError(null);
      setCurrentPage(1);

      // Use /search endpoint with select_fields including insights (per API docs)
      const result = await fetchHistorialCases(1, pageSize);

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

  // Separate effect for Stats using centralized API service
  useEffect(() => {
    const loadStats = async () => {
      if (!session) return;
      
      try {
        console.log('📊 Fetching KPIs from mapa-desinfodemico-verbose...');
        const result = await api.mapaDesinfodemico.getDashboardData(session);
        
        // Map response fields to stats state
        if (result.kpi) {
          setStats({
            total: result.kpi.total_cases ?? 0,
            verified: result.kpi.verificados ?? 0,
            aiOnly: result.kpi.pendientes ?? 0,
            misinformation: result.kpi.desinfodemico ?? 0,
            forensic: result.kpi.forense ?? 0
          });
          console.log('✅ KPIs loaded:', result.kpi);
        }
      } catch (e) {
        console.error("❌ Error fetching KPIs:", e);
        // Keep default zeros on error
      }
    };
    loadStats();
  }, [session]); // Reload if session changes

  // Load more - appends to existing cases
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;

      const result = await fetchHistorialCases(nextPage, pageSize);

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

  // Trigger fetch on filter changes (re-fetch list)
  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  // Client-side filtering for status (if API doesn't support status filter yet)
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
