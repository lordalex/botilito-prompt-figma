import { useState, useEffect, useCallback } from 'react';
import { getDashboardSummary } from '@/services/vectorAsyncService';
import { SearchResultPayload } from '@/types/vector-api';

export function useDashboardStats() {
  const [data, setData] = useState<SearchResultPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getDashboardSummary(1, 20); // Top 20 casos recientes
      setData(result);
    } catch (err: any) {
      console.error('Error loading dashboard stats:', err);
      setError(err.message || 'Error al conectar con el servidor de análisis');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { data, loading, error, refresh: loadStats };
}
