import React, { useState } from 'react';
import { useHistorialData } from '../utils/historial/useHistorialData';
import type { HistorialCaseUI } from '../utils/historial/types';
import { Search, Filter, ArrowUpDown, Calendar, FileText, Image, Video, Link, Users, AlertCircle, CheckCircle, XCircle, RefreshCw, ArrowLeft, ExternalLink, Clock, TrendingUp } from 'lucide-react';
import { CaseDetailView } from './CaseDetailView';
import { CaseListItem } from './CaseListItem';
import type { ValidationCaseListItemDTO, AMIComplianceLevel, ConsensusState } from '@/types/validation';


/**
 * Helper to map Historial submission type to CaseListItem content type
 */
function mapHistorialType(type: string): ValidationCaseListItemDTO['contentType'] {
  const t = type.toLowerCase();
  if (t.includes('text')) return 'texto';
  if (t.includes('image')) return 'imagen';
  if (t.includes('video')) return 'video';
  if (t.includes('audio')) return 'audio';
  if (t.includes('url')) return 'url';
  return 'texto';
}

/**
 * Helper to map Historial verdict/labels to AMI Level
 */
function mapToAMILevel(caseData: HistorialCaseUI): AMIComplianceLevel {
  // Try to find a label that matches AMI levels
  const amiLabel = caseData.diagnosticLabels.find(l =>
    l.label.includes('AMI') ||
    l.label.includes('Alteraciones') ||
    l.label.includes('Generado') ||
    l.label.includes('Manipulado')
  );

  if (amiLabel) {
    if (amiLabel.label.includes('Desarrolla')) return 'Desarrolla las estrategias AMI';
    if (amiLabel.label.includes('Cumple')) return 'Cumple las premisas AMI';
    if (amiLabel.label.includes('Requiere')) return 'Requiere un enfoque AMI';
    if (amiLabel.label.includes('No cumple')) return 'No cumple las premisas AMI';
    if (amiLabel.label.includes('Generado')) return 'No cumple las premisas AMI'; // Map AI gen to fail or warning
  }

  // Fallback map from finalVerdict if simplified
  const v = caseData.finalVerdict.toLowerCase();
  if (v.includes('desarrolla')) return 'Desarrolla las estrategias AMI';
  if (v.includes('requiere')) return 'Requiere un enfoque AMI';

  return 'Requiere un enfoque AMI'; // Default fallback
}

export function Historial() {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  const {
    loading,
    error,
    summaryData,
    cases,
    filteredCount,
    refresh,
    currentPage,
    totalPages,
    setCurrentPage,
  } = useHistorialData();

  // Transform historial cases to validation list items
  const listItems: ValidationCaseListItemDTO[] = cases.map(c => ({
    id: c.id,
    caseCode: c.displayId,
    contentType: mapHistorialType(c.submissionType),
    title: c.title,
    summary: c.summary,
    createdAt: c.createdAt,
    reportedBy: 'Usuario Anónimo', // HistorialCaseUI might miss this, default
    humanValidatorsCount: c.humanVotesCount,
    consensusState: (c.consensusState as ConsensusState) || 'ai_only',
    theme: c.diagnosticLabels.find(l => l.bg.includes('purple') || l.label === 'Forense')?.label ||
      c.diagnosticLabels.find(l => l.bg.includes('red') || l.label === 'Desinformódico')?.label ||
      'General',
    amiScore: c.riskScore || 0,
    amiLevel: mapToAMILevel(c),
  }));

  // Show detail view when a case is selected
  if (selectedCaseId) {
    return (
      <CaseDetailView
        caseId={selectedCaseId}
        onBackToList={() => setSelectedCaseId(null)}
        mode="ai" 
      />
    );
  }

  // List view
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">
              📚 Historial de Casos
            </h1>
            <p className="text-gray-600">
              Registro completo de todos los casos analizados por Botilito
            </p>
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        {/* KPIs */}
        {summaryData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-md border-2 border-yellow-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <FileText className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total de Casos</p>
                  <p className="text-2xl font-bold text-gray-800">{summaryData.cases?.length ?? 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md border-2 border-blue-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Documentos</p>
                  <p className="text-2xl font-bold text-gray-800">{summaryData.pagination?.returnedCount ?? 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md border-2 border-green-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mostrando</p>
                  <p className="text-2xl font-bold text-gray-800">{filteredCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md border-2 border-purple-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Con Verificación</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {cases.filter(c => c.humanVotesCount > 0).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-yellow-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando historial...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-bold text-red-800">Error al cargar el historial</h3>
            </div>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Cases List */}
      {!loading && !error && cases.length === 0 && (
        <div className="max-w-7xl mx-auto text-center py-20">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No se encontraron casos</p>
        </div>
      )}

      {!loading && !error && cases.length > 0 && (
        <div className="max-w-7xl mx-auto">
          <div className="space-y-4">
            {listItems.map((caseItem) => (
              <CaseListItem
                key={caseItem.id}
                caseItem={caseItem}
                onClick={() => setSelectedCaseId(caseItem.id)}
                className="hover:shadow-lg transition-shadow border-2 border-transparent hover:border-yellow-400"
              />
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && cases.length > 0 && (
        <div className="max-w-7xl mx-auto mt-8 flex justify-center items-center gap-4">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="text-gray-700">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}

