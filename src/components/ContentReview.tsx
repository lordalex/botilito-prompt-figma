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
 * ├── StatsCards (4 cards: Total, Verified, AI Only, Misinformation)
 * ├── ErrorState (conditional - red banner if error)
 * └── CaseList (shared component with custom title/description)
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
 * onViewTask callback navigates to case detail
 * ```
 *
 * ### Props:
 * - onViewTask(caseId, 'caseDetail', 'completed'): Navigate to case detail view
 *
 * ### Reusable Patterns:
 * 1. **CaseList Integration**: Pass isEnrichedFormat=true for CaseEnriched[] data
 * 2. **Stats Derivation**: Stats come from hook, computed from cases array
 * 3. **Botilito Banner**: Consistent yellow banner with mascot
 *
 * @see useCaseHistory.ts - Data fetching hook
 * @see CaseList.tsx - Shared list component
 * @see HumanVerification.tsx - Similar page for validation workflow
 */

import React from 'react';
import botilitoImage from '@/assets/botilito-mascot.png';
import {
  Bot, CheckCircle, Clock, AlertTriangle, Fingerprint, RefreshCcw
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCaseHistory } from '@/hooks/useCaseHistory';
import { CaseList } from './CaseList';

interface ContentReviewProps {
  /** Callback when a case is selected - navigates to detail view */
  onViewTask: (jobId: string, type: string, status?: string) => void;
}

export function ContentReview({ onViewTask }: ContentReviewProps) {
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

  // Handle case selection - navigate to detail view
  const handleSelectCase = (caseId: string, contentType: string) => {
    onViewTask(caseId, 'caseDetail', 'completed');
  };

  return (
    <div className="w-full space-y-6 px-6 pt-6">

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

      {/* Cases List - Using shared CaseList component */}
      {!error && (
        <CaseList
          cases={cases}
          onViewTask={handleSelectCase}
          isLoading={loading}
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
  );
}

