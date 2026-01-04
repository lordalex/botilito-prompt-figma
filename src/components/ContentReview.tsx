import React, { useState } from 'react';
import botilitoImage from 'figma:asset/e27a276e6ff0e187a67cf54678c265c1c38adbf7.png';
import {
  Briefcase, CheckCircle2, Bot, XCircle, RefreshCcw, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCaseHistory } from '@/hooks/useCaseHistory';
import { transformHumanCaseToUI } from '@/services/analysisPresentationService';
import { CaseDetailDialog } from '@/components/CaseDetailDialog'; // Maybe remove this if we navigate away?
import { CaseListItem } from './CaseListItem';
import { transformEnrichedToListItem, CaseEnrichedCompatible } from '@/types/validation';

interface ContentReviewProps {
  onViewTask: (jobId: string, type: string, status?: string) => void;
}

export function ContentReview({ onViewTask }: ContentReviewProps) {
  const {
    cases,
    loading,
    error,
    stats,
    pagination,
    filters,
    refresh
  } = useCaseHistory();

  const [selectedId, setSelectedId] = useState<string | null>(null);

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
              Puedes filtrar por estado, tipo de contenido y buscar lo que necesites.
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
        <StatsCard icon={<Briefcase className="text-yellow-600" />} bg="bg-yellow-50" value={stats.total} label="Mostrados" />
        <StatsCard icon={<CheckCircle2 className="text-green-600" />} bg="bg-green-50" value={stats.verified} label="Verificados" />
        <StatsCard icon={<Bot className="text-blue-600" />} bg="bg-blue-50" value={stats.aiOnly} label="Solo IA" />
        <StatsCard icon={<XCircle className="text-red-600" />} bg="bg-red-50" value={stats.misinformation} label="Desinformación" />
      </div>

      {/* List */}
      <Card className="border-gray-200 shadow-sm bg-white">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-gray-900">Listado de Casos</h3>
            <Badge variant="outline" className="text-xs">Página {pagination.currentPage}</Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 bg-gray-50/50 border-b border-gray-100 grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-12">
            <Select value={filters.statusFilter} onValueChange={filters.setStatusFilter}>
              <SelectTrigger className="bg-white"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="verified">Verificados</SelectItem>
                <SelectItem value="ai_only">Solo IA</SelectItem>
                <SelectItem value="misinfo">Desinformación</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <CardContent className="p-0">
          {error ? (
            <div className="p-12 text-center text-red-500">
              <p>Ocurrió un error al cargar los datos.</p>
              <p className="text-sm mt-2">{error}</p>
            </div>
          ) : loading && cases.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <div className="animate-spin h-8 w-8 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-500">Cargando...</p>
            </div>
          ) : cases.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p>No se encontraron resultados.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {cases.map((rawItem: any) => {
                const item = transformHumanCaseToUI(rawItem);
                if (!item) return null;

                // Transform to list item DTO
                const listItem = transformEnrichedToListItem(item as unknown as CaseEnrichedCompatible);

                return (
                  <CaseListItem
                    key={listItem.id}
                    caseItem={listItem}
                    onClick={(id, contentType) => onViewTask(id, 'caseDetail', 'completed')}
                    className="hover:shadow-lg transition-shadow border-2 border-transparent hover:border-yellow-400"
                  />
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/30">
            <Button
              variant="outline" size="sm"
              onClick={() => pagination.setCurrentPage(p => Math.max(1, p - 1))}
              disabled={pagination.currentPage === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> Anterior
            </Button>

            <span className="text-sm font-medium text-gray-600">
              Página {pagination.currentPage}
            </span>

            <Button
              variant="outline" size="sm"
              onClick={() => pagination.setCurrentPage(p => p + 1)}
              disabled={!pagination.hasMore || loading}
            >
              Siguiente <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal fallback if needed, but usually we navigate now */}
      {selectedId && <CaseDetailDialog caseId={selectedId} onClose={() => setSelectedId(null)} />}
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
