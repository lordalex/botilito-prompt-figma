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
 * { cases, loading, error, stats, refresh }
 *     ↓
 * StatsCards use stats for counts
 *     ↓
 * CaseList receives cases with isEnrichedFormat=true
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
import botilitoImage from 'figma:asset/e27a276e6ff0e187a67cf54678c265c1c38adbf7.png';
import {
  Briefcase, CheckCircle2, Bot, XCircle, RefreshCcw
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
    error,
    stats,
    refresh
  } = useCaseHistory();

  // Handle case selection - navigate to detail view
  const handleSelectCase = (caseId: string, contentType: string) => {
    onViewTask(caseId, 'caseDetail', 'completed');
  };

  return (
    <div className="w-full space-y-8 p-6 bg-gray-50 min-h-screen font-sans">

      {/* Franja de Botilito */}
      <div className="bg-[#ffe97a] border-2 border-[#ffda00] rounded-lg p-4 shadow-lg">
        <div className="flex items-center space-x-4">
          <img
            src={botilitoImage}
            alt="Botilito"
            className="w-24 h-24 object-contain mt-[0px] mr-[16px] mb-[-18px] ml-[0px]"
          />
          <div className="flex-1">
            <p className="text-xl">
              ¡Ey parcero! Acá está el historial 📊🔍
            </p>
            <p className="text-sm mt-1 opacity-80">
              Puedes filtrar por tipo de contenido y buscar lo que necesites.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-900">Historial de Casos</h2>
          <p className="text-muted-foreground">Registro completo de todos los contenidos analizados.</p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} disabled={loading} className="gap-2">
          <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Stats Cards (Based on current view) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={<Briefcase className="text-yellow-600" />} bg="bg-yellow-50" value={stats.total} label="Total Casos" />
        <StatsCard icon={<CheckCircle2 className="text-green-600" />} bg="bg-green-50" value={stats.verified} label="Verificados" />
        <StatsCard icon={<Bot className="text-blue-600" />} bg="bg-blue-50" value={stats.aiOnly} label="Solo IA" />
        <StatsCard icon={<XCircle className="text-red-600" />} bg="bg-red-50" value={stats.misinformation} label="Desinformación" />
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
          title="Historial de Casos"
          description="Registro completo de todos los casos analizados por Botilito"
          emptyMessage="No se encontraron casos en el historial"
        />
      )}
    </div>
  );
}

function StatsCard({ icon, bg, value, label }: any) {
  return (
    <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`p-3 rounded-xl ${bg}`}>{icon}</div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
