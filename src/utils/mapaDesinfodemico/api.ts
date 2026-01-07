// src/utils/mapaDesinfodemico/api.ts
import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/providers/AuthProvider';
import type { DashboardResponse } from '@/types/mapaDesinfodemico';

/**
 * Hook to fetch the dashboard data for Mapa Desinfodémico.
 * Triggers aggregation pipeline via POST using the centralized API service.
 */
export function useDashboardData() {
  const { session } = useAuth();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchMetrics() {
      if (!session) return;

      try {
        setLoading(true);
        // Defaulting to nacional scope and weekly timeframe
        const result = await api.mapaDesinfodemico.getDashboardData(session, 'nacional', 'weekly');

        if (isMounted) {
          setData(result);
        }
      } catch (e: any) {
        if (isMounted) {
          console.error("Error fetching dashboard data:", e);
          setError(e.message || "Error desconocido al cargar el tablero");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchMetrics();

    return () => {
      isMounted = false;
    };
  }, [session]);

  return { data, loading, error };
}
