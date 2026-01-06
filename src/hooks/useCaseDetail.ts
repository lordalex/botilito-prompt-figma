// src/hooks/useCaseDetail.ts
import { useState, useCallback, useEffect } from 'react';
import { lookupCase } from '@/services/vectorAsyncService';
import type { EnrichedCase, StandardizedCase } from '@/types/vector-api';

/** Case data returned by lookup - can be either legacy or new DTO format */
type CaseData = EnrichedCase | StandardizedCase;

export function useCaseDetail(caseId: string | null) {
  const [data, setData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!caseId) {
      setData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await lookupCase(caseId);
      setData(result);
    } catch (err: any) {
      console.error('Error fetching case detail:', err);
      setError(err.message || 'Error al cargar los detalles del caso');
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return {
    caseDetail: data,
    loading,
    error,
    reload: fetchDetail
  };
}

