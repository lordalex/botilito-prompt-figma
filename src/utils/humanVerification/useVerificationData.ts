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

        // Use mock data as fallback
        setCases(getMockCases());
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

/**
 * Get mock cases for fallback
 */
function getMockCases() {
  return [
    {
      id: 'T-WB-20241014-001',
      type: 'text',
      title: 'Artículo sobre tratamiento alternativo para diabetes',
      content: 'Un nuevo estudio revela que beber agua con limón en ayunas puede curar la diabetes tipo 2 en solo 30 días. Médicos de Harvard confirman la efectividad del tratamiento...',
      headline: 'Descubren cura milagrosa para diabetes: solo agua con limón en ayunas',
      url: 'https://noticiasfalsas.com/cura-diabetes-limon',
      source: { name: 'Noticias Falsas', url: 'https://noticiasfalsas.com' },
      theme: 'Salud y Medicina',
      aiAnalysis: {
        veracity: 'Posible Desinformación',
        confidence: 0.89,
        detectedMarkers: ['enganoso', 'sensacionalista', 'no_verificable'],
        issues: ['No se encontraron estudios de Harvard sobre este tema', 'Afirmaciones médicas sin respaldo científico'],
        summary: 'El contenido presenta patrones epidemiológicos consistentes con desinformación médica.',
        sources: ['WhatsApp', 'Facebook', 'Twitter'],
        markersDetected: [
          { type: 'Engañoso', confidence: 0.89 },
          { type: 'Sensacionalista', confidence: 0.85 }
        ]
      },
      humanVotes: 0,
      consensusState: 'ai_only',
      priority: 'high',
      createdAt: new Date().toISOString()
    },
    {
      id: 'I-FB-20241014-002',
      type: 'image',
      title: 'Imagen manipulada de protesta',
      content: 'Fotografía que supuestamente muestra disturbios violentos en manifestación pacífica',
      headline: 'Violencia extrema en protestas del centro',
      url: 'https://facebook.com/post/12345',
      source: { name: 'Facebook', url: 'https://facebook.com' },
      theme: 'Política',
      aiAnalysis: {
        veracity: 'Desinformación Confirmada',
        confidence: 0.95,
        detectedMarkers: ['manipulado', 'sin_contexto', 'falso'],
        issues: ['Imagen editada digitalmente', 'Fecha no corresponde al evento'],
        summary: 'Contenido manipulado con alto potencial de viralización.',
        sources: ['Facebook', 'Twitter'],
        markersDetected: [
          { type: 'Manipulado', confidence: 0.95 },
          { type: 'Falso', confidence: 0.92 }
        ]
      },
      humanVotes: 3,
      consensusState: 'consensus',
      priority: 'critical',
      createdAt: new Date().toISOString()
    }
  ];
}