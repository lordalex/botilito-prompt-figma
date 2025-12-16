import { useState, useEffect, useCallback } from 'react';
import {
  fetchHistorialData,
  transformCasesToUI,
  transformCaseToDetail,
  filterCases,
  sortCases
} from './api';
import type {
  HistorialSummaryResult,
  HistorialCaseUI,
  HistorialCaseDetail,
  HistorialSortBy
} from './types';

/**
 * Custom hook to manage historial data with filtering and sorting
 */
export function useHistorialData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<HistorialSummaryResult | null>(null);
  const [allCases, setAllCases] = useState<HistorialCaseUI[]>([]);
  const [filteredCases, setFilteredCases] = useState<HistorialCaseUI[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Filter state
  const [filters, setFilters] = useState({
    submissionType: 'ALL',
    consensusState: 'ALL',
    priority: 'ALL',
    searchQuery: ''
  });

  // Sort state
  const [sortBy, setSortBy] = useState<HistorialSortBy>('date_desc');

  // Fetch data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchHistorialData();
        setSummaryData(data);

        // API returns data.cases, not data.recent_cases
        const cases = transformCasesToUI(data.cases);
        setAllCases(cases);
        setFilteredCases(cases);
      } catch (err) {
        console.error('Error loading historial data:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar el historial');
        setAllCases([]);
        setFilteredCases([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [refreshKey]);

  // Apply filters and sorting when they change
  useEffect(() => {
    let result = allCases;

    // Apply filters
    result = filterCases(result, filters);

    // Apply sorting
    result = sortCases(result, sortBy);

    setFilteredCases(result);
  }, [allCases, filters, sortBy]);

  // Update filter
  const updateFilter = useCallback((filterName: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  }, []);

  // Update sort
  const updateSort = useCallback((newSortBy: HistorialSortBy) => {
    setSortBy(newSortBy);
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      submissionType: 'ALL',
      consensusState: 'ALL',
      priority: 'ALL',
      searchQuery: ''
    });
  }, []);

  // Get case detail
  const getCaseDetail = useCallback((caseId: string): HistorialCaseDetail | null => {
    if (!summaryData) return null;

    const caseData = summaryData.cases.find(c => c.id === caseId);
    if (!caseData) return null;

    return transformCaseToDetail(caseData);
  }, [summaryData]);

  // Refresh data
  const refresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  return {
    loading,
    error,
    summaryData,
    cases: filteredCases,
    totalCases: allCases.length,
    filteredCount: filteredCases.length,
    filters,
    sortBy,
    updateFilter,
    updateSort,
    clearFilters,
    getCaseDetail,
    refresh
  };
}

/**
 * Hook to fetch a single case detail
 */
export function useCaseDetail(caseId: string | null) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [caseDetail, setCaseDetail] = useState<HistorialCaseDetail | null>(null);

  useEffect(() => {
    if (!caseId) {
      setCaseDetail(null);
      setLoading(false);
      return;
    }

    async function loadCaseDetail() {
      try {
        setLoading(true);
        setError(null);

        // Fetch full data and extract the specific case
        const data = await fetchHistorialData();
        const caseData = data.cases.find(c => c.id === caseId);

        if (!caseData) {
          throw new Error('Caso no encontrado');
        }

        const detail = transformCaseToDetail(caseData);
        setCaseDetail(detail);
      } catch (err) {
        console.error('Error loading case detail:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar el caso');
        setCaseDetail(null);
      } finally {
        setLoading(false);
      }
    }

    loadCaseDetail();
  }, [caseId]);

  return {
    loading,
    error,
    caseDetail
  };
}
