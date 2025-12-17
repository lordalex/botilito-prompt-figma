import { useState, useEffect, useCallback } from 'react';
import {
  fetchHistorialData,
  transformCasesToUI,
  transformCaseToDetail,
  fetchCaseDetails,
} from './api';
import type {
  HistorialSummaryResult,
  HistorialCaseUI,
  HistorialCaseDetail,
  HistorialSortBy
} from './types';

/**
 * Custom hook to manage historial data with pagination
 */
export function useHistorialData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<HistorialSummaryResult | null>(null);
  const [cases, setCases] = useState<HistorialCaseUI[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Fetch data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchHistorialData(currentPage, itemsPerPage);
        setSummaryData(data);

        const uiCases = transformCasesToUI(data.cases);
        setCases(uiCases);

        if (data.pagination.hasMore) {
          setTotalPages(currentPage + 1);
        } else {
          setTotalPages(currentPage);
        }

      } catch (err) {
        console.error('Error loading historial data:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar el historial');
        setCases([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [refreshKey, currentPage]);

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
    cases,
    totalCases: summaryData?.pagination.totalItems ?? 0,
    filteredCount: cases.length,
    getCaseDetail,
    refresh,
    currentPage,
    setCurrentPage,
    totalPages,
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
        const detail = await fetchCaseDetails(caseId as string);
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
