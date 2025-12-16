import React, { useState } from 'react';
import { useHistorialData, useCaseDetail } from '../utils/historial/useHistorialData';
import type { HistorialCaseUI } from '../utils/historial/types';
import { Search, Filter, ArrowUpDown, Calendar, FileText, Image, Video, Link, Users, AlertCircle, CheckCircle, XCircle, RefreshCw, ArrowLeft, ExternalLink, Clock, TrendingUp } from 'lucide-react';

export function Historial() {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const {
    loading,
    error,
    summaryData,
    cases,
    totalCases,
    filteredCount,
    filters,
    sortBy,
    updateFilter,
    updateSort,
    clearFilters,
    refresh
  } = useHistorialData();

  // Show detail view when a case is selected
  if (selectedCaseId) {
    return (
      <HistorialDetailView
        caseId={selectedCaseId}
        onBack={() => setSelectedCaseId(null)}
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
                  <p className="text-2xl font-bold text-gray-800">{summaryData.cases?.length ?? totalCases}</p>
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
                  <p className="text-2xl font-bold text-gray-800">{summaryData.pagination?.returnedCount ?? totalCases}</p>
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

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-4 shadow-md border-2 border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por título, código o URL..."
                  value={filters.searchQuery}
                  onChange={(e) => updateFilter('searchQuery', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filtros
            </button>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => updateSort(e.target.value as any)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
            >
              <option value="date_desc">Más recientes</option>
              <option value="date_asc">Más antiguos</option>
              <option value="priority_desc">Mayor prioridad</option>
              <option value="votes_desc">Más verificados</option>
            </select>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t-2 border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Submission Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Contenido
                  </label>
                  <select
                    value={filters.submissionType}
                    onChange={(e) => updateFilter('submissionType', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                  >
                    <option value="ALL">Todos</option>
                    <option value="URL">URL</option>
                    <option value="TEXT">Texto</option>
                    <option value="IMAGE">Imagen</option>
                    <option value="VIDEO">Video</option>
                  </select>
                </div>

                {/* Consensus State */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado de Verificación
                  </label>
                  <select
                    value={filters.consensusState}
                    onChange={(e) => updateFilter('consensusState', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                  >
                    <option value="ALL">Todos</option>
                    <option value="ai_only">Solo IA</option>
                    <option value="human_only">Solo Humanos</option>
                    <option value="consensus">Consenso</option>
                    <option value="disagreement">Desacuerdo</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioridad
                  </label>
                  <select
                    value={filters.priority}
                    onChange={(e) => updateFilter('priority', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                  >
                    <option value="ALL">Todas</option>
                    <option value="critical">Crítica</option>
                    <option value="high">Alta</option>
                    <option value="medium">Media</option>
                    <option value="low">Baja</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          )}
        </div>
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
          {(filters.searchQuery || filters.submissionType !== 'ALL' || filters.consensusState !== 'ALL' || filters.priority !== 'ALL') && (
            <button
              onClick={clearFilters}
              className="mt-4 text-yellow-600 hover:text-yellow-700 underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {!loading && !error && cases.length > 0 && (
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 gap-4">
            {cases.map(caseItem => (
              <CaseCard
                key={caseItem.id}
                caseData={caseItem}
                onClick={() => setSelectedCaseId(caseItem.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Case Card Component
 */
function CaseCard({ caseData, onClick }: { caseData: HistorialCaseUI; onClick: () => void }) {
  const priorityColors = {
    low: 'bg-gray-100 text-gray-700 border-gray-300',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    high: 'bg-orange-100 text-orange-700 border-orange-300',
    critical: 'bg-red-100 text-red-700 border-red-300'
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-6 shadow-md border-2 border-gray-200 hover:border-yellow-400 hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="text-4xl">{caseData.submissionTypeIcon}</div>

        {/* Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {caseData.displayId}
                </span>
                <span className={`text-xs px-2 py-1 rounded border-2 ${priorityColors[caseData.priority]}`}>
                  {caseData.priority.toUpperCase()}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                {caseData.title}
              </h3>
              <p className="text-sm text-gray-600 truncate">{caseData.url}</p>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {caseData.createdAtFormatted}
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {caseData.humanVotesCount} verificador{caseData.humanVotesCount !== 1 ? 'es' : ''}
            </div>
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              {caseData.relatedDocumentsCount} doc{caseData.relatedDocumentsCount !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Diagnostic Labels */}
          {caseData.diagnosticLabels.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {caseData.diagnosticLabels.map((label, index) => (
                <span
                  key={index}
                  className={`text-xs px-2 py-1 rounded border ${label.bg} ${label.color} ${label.border}`}
                >
                  {label.label} ({label.percentage}%)
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                {caseData.finalVerdict}
              </span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-500">
                {caseData.verificationMethod}
              </span>
            </div>
            <button className="flex items-center gap-1 text-sm text-yellow-600 hover:text-yellow-700 font-medium">
              Ver Detalles
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Detail View Component
 */
function HistorialDetailView({ caseId, onBack }: { caseId: string; onBack: () => void }) {
  const { loading, error, caseDetail } = useCaseDetail(caseId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 p-6">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al historial
          </button>
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 text-yellow-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Cargando detalles del caso...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !caseDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 p-6">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al historial
          </button>
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-bold text-red-800">Error al cargar el caso</h3>
            </div>
            <p className="text-red-700">{error || 'Caso no encontrado'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al historial
        </button>

        {/* Header */}
        <div className="bg-white rounded-xl p-6 shadow-md border-2 border-yellow-200 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="text-5xl">{caseDetail.submissionTypeIcon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {caseDetail.displayId}
                </span>
                <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700 border-2 border-yellow-300">
                  {caseDetail.priority.toUpperCase()}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-3">
                {caseDetail.title}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Clock className="w-4 h-4" />
                {caseDetail.createdAtFormatted}
              </div>
              <a
                href={caseDetail.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <Link className="w-4 h-4" />
                {caseDetail.url}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-bold text-gray-800 mb-2">Resumen</h3>
            <p className="text-gray-700">{caseDetail.summary}</p>
          </div>
        </div>

        {/* Verification Status */}
        <div className="bg-white rounded-xl p-6 shadow-md border-2 border-gray-200 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Estado de Verificación</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-800">Método</span>
              </div>
              <p className="text-sm text-gray-700">{caseDetail.verificationMethod}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-800">Verificadores</span>
              </div>
              <p className="text-sm text-gray-700">{caseDetail.humanVotesCount} humano{caseDetail.humanVotesCount !== 1 ? 's' : ''}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-gray-800">Veredicto</span>
              </div>
              <p className="text-sm font-bold text-gray-700">{caseDetail.finalVerdict}</p>
            </div>
          </div>

          {/* Diagnostic Labels */}
          {caseDetail.diagnosticLabels.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium text-gray-800 mb-2">Etiquetas de Diagnóstico</h3>
              <div className="flex flex-wrap gap-2">
                {caseDetail.diagnosticLabels.map((label, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-lg border-2 ${label.bg} ${label.color} ${label.border}`}
                  >
                    {label.label} ({label.percentage}%)
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Related Documents */}
        {caseDetail.relatedDocuments.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-md border-2 border-gray-200 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Documentos Relacionados ({caseDetail.relatedDocuments.length})
            </h2>
            <div className="space-y-4">
              {caseDetail.relatedDocuments.map((doc, index) => (
                <div key={doc.id} className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-800">{doc.title}</h3>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {Math.round(doc.similarity * 100)}% similar
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{doc.summary}</p>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Link className="w-4 h-4" />
                    Ver documento
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Web Search Results */}
        {caseDetail.webSearchResults.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-md border-2 border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Resultados de Búsqueda Web ({caseDetail.webSearchResults.length})
            </h2>
            <div className="space-y-3">
              {caseDetail.webSearchResults.map((result, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-1">{result.title}</h3>
                  <p className="text-sm text-gray-700 mb-2">{result.snippet}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{result.source}</span>
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      Ver fuente
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
