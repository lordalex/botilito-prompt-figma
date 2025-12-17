import React, { useState } from 'react';
import {
  Briefcase, CheckCircle2, Bot, XCircle, Search, Filter,
  ChevronLeft, ChevronRight, Eye, Smartphone, RefreshCcw
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCaseHistory } from '@/hooks/useCaseHistory';
import { CaseDetailDialog } from '@/components/CaseDetailDialog';
import { generateDisplayId } from '@/utils/humanVerification/api';

export function ContentReview() {
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
      
      {/* Banner */}
      <div className="relative w-full bg-[#FFE55C] rounded-2xl p-6 shadow-sm overflow-hidden border border-yellow-400/20">
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-24 h-24 bg-gray-800 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transform rotate-[-5deg]">
             <Smartphone className="h-12 w-12 text-white" />
             <div className="absolute -bottom-2 -right-2 bg-yellow-400 p-1 rounded-full border-2 border-gray-800">
               <span className="font-bold text-xs text-gray-900">B</span>
             </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              ¡Ey parcero! Acá está el historial
              <span className="text-2xl">📊🔍</span>
            </h1>
            <p className="text-gray-800/80 max-w-3xl leading-relaxed font-medium">
              Puedes filtrar por estado, tipo de contenido y buscar lo que necesites.
            </p>
          </div>
        </div>
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2"></div>
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
              {cases.map((item) => (
                <div 
                  key={item.id} 
                  className="p-4 hover:bg-yellow-50/30 cursor-pointer group transition-colors" 
                  onClick={() => setSelectedId(item.id)}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="font-mono bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-semibold">{item.displayId || generateDisplayId(item)}</span>
                        <span className="font-mono bg-gray-100 px-1 rounded">{new Date(item.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <Badge variant="secondary" className="text-[10px] h-5">{item.submission_type}</Badge>
                      </div>
                      <h4 className="font-semibold text-gray-900 line-clamp-1">{item.title || "Sin título"}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{item.summary || "..."}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <Eye className="h-5 w-5 text-gray-400 group-hover:text-yellow-600" />
                      </Button>
                      <Badge 
                        className={
                          item.consensus?.state === 'human_consensus' 
                            ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                        }
                      >
                        {item.consensus?.state === 'human_consensus' ? 'Verificado' : 'IA'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
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

      {/* Detailed View Component */}
      <CaseDetailDialog caseId={selectedId} onClose={() => setSelectedId(null)} />
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
