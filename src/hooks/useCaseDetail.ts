// src/hooks/useCaseDetail.ts
/**
 * Hook to fetch full case details via lookup API.
 * 
 * IMPORTANT: This hook must ALWAYS call lookupCase when caseId changes.
 * No caching or memoization should prevent fresh data from being fetched.
 */
import { useState, useEffect, useRef } from 'react';
import { lookupCase } from '@/services/vectorAsyncService';
import type { EnrichedCase, StandardizedCase } from '@/types/vector-api';

/** Case data returned by lookup - can be either legacy or new DTO format */
type CaseData = EnrichedCase | StandardizedCase;

export function useCaseDetail(caseId: string | null) {
  const [data, setData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track the current caseId being fetched to handle race conditions
  const currentCaseIdRef = useRef<string | null>(null);

  useEffect(() => {
    // If caseId is null/empty, reset state and return
    if (!caseId) {
      setData(null);
      setLoading(false);
      setError(null);
      currentCaseIdRef.current = null;
      return;
    }

    // Track this request
    currentCaseIdRef.current = caseId;

    // IMMEDIATELY set loading=true BEFORE any async operation
    setLoading(true);
    setError(null);
    setData(null); // Clear stale data

    const fetchData = async () => {
      console.log('[useCaseDetail] Starting lookupCase for caseId:', caseId);

      try {
        const result = await lookupCase(caseId);

        // Only update state if this is still the current request
        if (currentCaseIdRef.current === caseId) {
          console.log('[useCaseDetail] lookupCase returned:', result);
          setData(result);
          setError(null);
        }
      } catch (err: any) {
        console.error('[useCaseDetail] Error fetching case detail:', err);
        // Only update state if this is still the current request
        if (currentCaseIdRef.current === caseId) {
          setError(err.message || 'Error al cargar los detalles del caso');
          setData(null);
        }
      } finally {
        // Only update loading if this is still the current request
        if (currentCaseIdRef.current === caseId) {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [caseId]);

  // Derived loading state: we're loading if caseId is set but we don't have data yet
  const isLoading = caseId ? (loading || (!data && !error)) : false;

  return {
    caseDetail: data,
    loading: isLoading,
    error,
    reload: () => {
      if (caseId) {
        setLoading(true);
        setError(null);
        setData(null);
        lookupCase(caseId).then(setData).catch((err) => setError(err.message)).finally(() => setLoading(false));
      }
    }
  };
}
