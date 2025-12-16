import { useState, useEffect, useCallback } from 'react';
import {
  fetchVerificationSummary,
  transformCasesForUI,
  getUserVerificationStats
} from './api';
import type { VerificationSummaryResult } from './types';
import { supabase } from '../supabase/client';

/**
 * Custom hook to manage verification data
 */
export function useVerificationData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<VerificationSummaryResult | null>(null);
  const [cases, setCases] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch verification summary data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch summary data
        const summary = await fetchVerificationSummary();
        setSummaryData(summary);

        // Transform cases for UI
        const transformedCases = transformCasesForUI(summary.cases);
        setCases(transformedCases);

        // Get current user stats if logged in
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const stats = await getUserVerificationStats(session.user.id);
          setUserStats(stats);
        }
      } catch (err) {
        console.error('Error loading verification data:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar los datos');
        setCases([]); // Set to empty array on error
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [refreshKey]);

  // Function to refresh data
  const refresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  return {
    loading,
    error,
    summaryData,
    cases,
    userStats,
    refresh
  };
}