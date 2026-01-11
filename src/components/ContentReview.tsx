/**
 * @file ContentReview.tsx
 * @description Historial (History) tab component showing all analyzed cases.
 *
 * ## LLM CONTEXT - PAGE COMPONENT
 *
 * This component renders the "Historial" tab in the main application.
 * It displays a historical view of all cases analyzed by Botilito.
 *
 * ### Key Differences from HumanVerification.tsx:
 * - HumanVerification: Shows pending cases awaiting human validation
 * - ContentReview: Shows ALL cases (completed, verified, etc.) for historical review
 *
 * ### Component Structure:
 * ```
 * ContentReview
 * ├── BotilitoBanner (yellow #ffe97a with mascot image)
 * ├── HeaderSection (title + refresh button)
 * ├── StatsCards (5 cards: Total, Verified, AI Only, Misinformation, Forensic)
 * ├── ErrorState (conditional - red banner if error)
 * └── CaseList (shared component with pagination)
 * ```
 *
 * ### Data Flow:
 * ```
 * useCaseHistory hook
 *     ↓
 * { cases, loading, loadingMore, error, stats, hasMore, loadMore, refresh }
 *     ↓
 * StatsCards use stats for counts
 *     ↓
 * CaseList receives cases + pagination props (hasMore, onLoadMore, isLoadingMore)
 *     ↓
 * onViewTask callback → lookupCase → ContentUploadResult
 * ```
 *
 * @see useCaseHistory.ts - Data fetching hook
 * @see CaseList.tsx - Shared list component (same as HumanVerification)
 * @see HumanVerification.tsx - Similar page for validation workflow
 */

import React, { useState, useEffect } from 'react';
import botilitoImage from '@/assets/botilito-mascot.png';
import {
  Bot, CheckCircle, Clock, AlertTriangle, Fingerprint, RefreshCcw, AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCaseHistory } from '@/hooks/useCaseHistory';
import { CaseList } from './CaseList';
import { ContentUploadResult } from '@/components/ContentUploadResult';
import { lookupCase } from '@/services/vectorAsyncService';

import { GlobalLoader } from '@/components/ui/GlobalLoader';

export function ContentReview() {
  // ... (keep hooks and state)
  const {
    cases,
    loading,
    loadingMore,
    error,
    stats,
    hasMore,
    loadMore,
    refresh
  } = useCaseHistory();

  // ... (keep exact same detail state & effect logic)
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [fullCaseData, setFullCaseData] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedCaseId) {
      setDetailLoading(true);
      setDetailError(null);
      lookupCase(selectedCaseId)
        .then(data => {
          if (!data) throw new Error("Datos no encontrados");
          setFullCaseData(data);
        })
        .catch(err => {
          console.error(err);
          setDetailError("Error al cargar los detalles.");
          setFullCaseData(null);
        })
        .finally(() => setDetailLoading(false));
    } else {
      setFullCaseData(null);
      setDetailError(null);
    }
  }, [selectedCaseId]);

  const handleSelectCase = (caseId: string, contentType: string) => {
    setSelectedCaseId(caseId);
  };

  // ... (keep detail view returns)
  if (selectedCaseId && detailLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFDA00]"></div>
        <p className="mt-4 text-gray-500">Cargando caso...</p>
      </div>
    );
  }

  if (selectedCaseId && (detailError || !fullCaseData)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold">Error</h3>
        <p className="text-gray-500 mb-4">{detailError || "No se pudo cargar el caso."}</p>
        <Button onClick={() => setSelectedCaseId(null)} variant="outline">Volver al Historial</Button>
      </div>
    );
  }

  if (selectedCaseId && fullCaseData) {
    return (
      <ContentUploadResult
        result={fullCaseData}
        onReset={() => setSelectedCaseId(null)}
        backLabel="Volver al Historial"
        hideVoting={true}
      />
    );
  }

  // Main list view
  return (
    <div className="relative min-h-[60vh]">
      {/* Global Floating Loader */}
      {loading && <GlobalLoader message="Cargando historial de casos..." />}

      <div className={`w-full space-y-6 px-6 pt-6 transition-opacity duration-300 ${loading ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>

        {/* Mensaje de Botilito */}
        <div className="bg-[#ffe97a] border-2 border-[#ffda00] rounded-lg p-4 shadow-lg">
          <div className="flex items-center space-x-4">
            <img
              src={botilitoImage}
              alt="Botilito"
              className="w-24 h-24 object-contain mt-[0px] mr-[16px] mb-[-18px] ml-[0px]"
            />
            <div className="flex-1">
              <p className="text-xl">
                ¡Qué más parce! Acá está el historial completo de casos
              </p>
              <p className="text-sm mt-1 opacity-80">
                Todos los contenidos analizados, desde multimedia forense hasta desinformación. ¡Revisa, filtra y comparte!
              </p>
            </div>
          </div>
        </div>

        {/* Título */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Historial de Casos</h1>
            <p className="text-muted-foreground">
              Registro completo de todos los contenidos analizados por Botilito
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading} className="gap-2">
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>

        {/* Estadísticas rápidas */}
        <div className="flex flex-wrap gap-4">
          <Card className="flex-1 min-w-[180px]">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-3 bg-primary/10 rounded">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Casos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1 min-w-[180px]">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-3 bg-emerald-100 rounded">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.verified}</p>
                  <p className="text-sm text-muted-foreground">Verificados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1 min-w-[180px]">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-3 bg-orange-100 rounded">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.aiOnly}</p>
                  <p className="text-sm text-muted-foreground">Pendientes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1 min-w-[180px]">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-3 bg-red-100 rounded">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.misinformation}</p>
                  <p className="text-sm text-muted-foreground">Desinfodémico</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1 min-w-[180px]">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-3 bg-blue-100 rounded">
                  <Fingerprint className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.forensic || 0}</p>
                  <p className="text-sm text-muted-foreground">Forense</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-6 bg-red-50 border-2 border-red-200 rounded-xl text-center">
            <p className="text-red-700 font-medium">Ocurrió un error al cargar los datos.</p>
            <p className="text-sm text-red-600 mt-2">{error}</p>
          </div>
        )}

        {/* Cases List - Using shared CaseList component (same as HumanVerification) */}
        {!error && (
          <CaseList
            cases={cases}
            onViewTask={handleSelectCase}
            isLoading={false} // Disable internal loading to avoid double spinners
            isEnrichedFormat={true}
            title="Listado de Casos Históricos"
            description="Todos los contenidos procesados y su estado de validación"
            emptyMessage="No se encontraron casos en el historial"
            hasMore={hasMore}
            onLoadMore={loadMore}
            isLoadingMore={loadingMore}
          />
        )}
      </div>
    </div>
  );
}
