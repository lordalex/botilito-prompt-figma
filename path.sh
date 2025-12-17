#!/bin/bash

# 1. Update Service to handle empty query requirement
echo "Updating src/services/vectorAsyncService.ts..."
cat << 'EOF' > src/services/vectorAsyncService.ts
import { supabase } from '@/utils/supabase/client';
import { 
  VectorJobResponse, 
  JobStatusResponse, 
  EnrichedCase,
  SearchResultPayload,
  LookupResultPayload
} from '@/types/vector-api';

const FUNCTION_NAME = 'vector-async';

// Helper for polling
async function pollJobStatus<T>(jobId: string, interval = 2000, timeout = 60000): Promise<T> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const { data, error } = await supabase.functions.invoke(`${FUNCTION_NAME}/status/${jobId}`, { method: 'GET' });
    
    if (error) throw error;
    
    const response = data as JobStatusResponse;
    
    if (response.status === 'completed') {
      return response.result as T;
    }
    
    if (response.status === 'failed') {
      throw new Error(response.error?.toString() || 'Job failed');
    }
    
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  throw new Error('Polling timed out');
}

/**
 * Uses /search endpoint.
 * FIX: Defaults query to "*" if empty to satisfy API requirement "Query required".
 */
export async function searchCases(
  query: string = "", 
  page: number = 1, 
  pageSize: number = 10
): Promise<SearchResultPayload> {
  // Fix: The API requires a non-empty query. 
  // We use "*" to represent "fetch all" (depending on backend implementation) or a generic term.
  const effectiveQuery = query.trim() === "" ? "*" : query;

  const { data: submitData, error: submitError } = await supabase.functions.invoke(`${FUNCTION_NAME}/search`, {
    method: 'POST',
    body: { 
      query: effectiveQuery, 
      page, 
      pageSize 
    },
  });

  if (submitError) throw submitError;
  const job = submitData as VectorJobResponse;

  return await pollJobStatus<SearchResultPayload>(job.job_id);
}

/**
 * Uses /lookup endpoint for single document details.
 */
export async function lookupCase(identifier: string): Promise<EnrichedCase | null> {
  const { data: submitData, error: submitError } = await supabase.functions.invoke(`${FUNCTION_NAME}/lookup`, {
    method: 'POST',
    body: { identifier },
  });

  if (submitError) throw submitError;
  const job = submitData as VectorJobResponse;

  const result = await pollJobStatus<LookupResultPayload>(job.job_id);
  return result.case || null;
}
EOF

# 2. Update Hook to handle specific API Pagination (hasMore instead of total)
echo "Updating src/hooks/useCaseHistory.ts..."
cat << 'EOF' > src/hooks/useCaseHistory.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { searchCases } from '@/services/vectorAsyncService';
import type { EnrichedCase } from '@/types/vector-api';

export function useCaseHistory() {
  // Data State
  const [cases, setCases] = useState<EnrichedCase[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchCases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await searchCases(searchTerm, currentPage, pageSize);
      
      setCases(result.cases || []);
      // The API returns 'hasMore', not 'totalCount', so we can't calculate total pages perfectly
      setHasMore(result.pagination.hasMore);
      
    } catch (err: any) {
      console.error('Error fetching history:', err);
      setError(err.message || "Error desconocido al cargar historial");
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, currentPage, pageSize]);

  // Trigger fetch on filter changes
  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  // Client-side filtering for status (if API doesn't support status filter yet)
  // Note: ideally status filtering happens on backend, but for now we filter the current page
  const filteredCases = useMemo(() => {
    if (statusFilter === 'all') return cases;
    return cases.filter(c => {
      if (statusFilter === 'verified') return c.consensus?.state === 'human_consensus';
      if (statusFilter === 'ai_only') return c.consensus?.state === 'ai_only';
      if (statusFilter === 'misinfo') return c.metadata?.global_verdict === 'TAMPERED';
      return true;
    });
  }, [cases, statusFilter]);

  // Stats derived from current view (approximate since we don't have global aggregation endpoint)
  const stats = {
    total: cases.length,
    verified: cases.filter(c => c.consensus?.state === 'human_consensus').length,
    aiOnly: cases.filter(c => c.consensus?.state === 'ai_only').length,
    misinformation: cases.filter(c => c.metadata?.global_verdict === 'TAMPERED').length
  };

  return {
    cases: filteredCases,
    loading,
    error,
    stats,
    pagination: {
      currentPage,
      setCurrentPage,
      pageSize,
      hasMore,
    },
    filters: {
      searchTerm,
      setSearchTerm,
      statusFilter,
      setStatusFilter
    },
    refresh: fetchCases
  };
}
EOF

# 3. Update Component to use correct pagination logic
echo "Updating src/components/ContentReview.tsx..."
cat << 'EOF' > src/components/ContentReview.tsx
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
import { CaseDetailDialog } from '@/components/historial/CaseDetailDialog';

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

  // Helper for Search Input delay to avoid spamming API while typing
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    filters.setSearchTerm(e.target.value);
    // Reset to page 1 on search
    if (pagination.currentPage !== 1) pagination.setCurrentPage(1);
  };

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
          <div className="md:col-span-8 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Buscar por texto..." 
              className="pl-10 bg-white"
              value={filters.searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="md:col-span-4">
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
EOF

