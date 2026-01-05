import React, { useState, useEffect } from 'react';
import { Briefcase, CheckCircle2, Bot, XCircle, Search, Eye, RefreshCcw, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCaseHistory } from '@/hooks/useCaseHistory';
import { ContentUploadResult } from '@/components/ContentUploadResult';
import { lookupCase } from '@/services/vectorAsyncService';

export function ContentReview() {
  const { cases, loading, error, stats, refresh } = useCaseHistory();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fullCaseData, setFullCaseData] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedId) {
      setDetailLoading(true);
      setDetailError(null);
      lookupCase(selectedId)
        .then(data => {
          if (!data) throw new Error("No se encontró información para este caso.");
          setFullCaseData(data);
        })
        .catch(err => {
          console.error(err);
          setDetailError("Error al cargar los detalles del caso.");
          setFullCaseData(null);
        })
        .finally(() => setDetailLoading(false));
    } else {
      setFullCaseData(null);
      setDetailError(null);
    }
  }, [selectedId]);

  if (selectedId) {
    if (detailLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFDA00]"></div>
          <p className="mt-4 text-gray-500 font-medium">Cargando caso...</p>
        </div>
      );
    }
    
    if (detailError || !fullCaseData) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error</h3>
          <p className="text-gray-500 mb-6">{detailError || "No se pudo cargar el caso."}</p>
          <Button onClick={() => setSelectedId(null)} variant="outline">Volver al historial</Button>
        </div>
      );
    }

    return (
      <ContentUploadResult 
        result={fullCaseData} 
        onReset={() => setSelectedId(null)} 
        backLabel="Volver al Historial"
      />
    );
  }

  return (
    <div className="w-full space-y-8 p-6 bg-gray-50 min-h-screen font-sans">
      <div className="relative w-full bg-[#FFE55C] rounded-2xl p-6 shadow-sm overflow-hidden border border-yellow-400/20">
        <div className="flex items-center gap-6 relative z-10">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Historial de Casos <span className="text-2xl">📊</span>
            </h1>
            <p className="text-gray-800/80 max-w-3xl leading-relaxed font-medium">
              Registro completo de todos los contenidos analizados por Botilito.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-900">Listado de Casos</h2>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} disabled={loading} className="gap-2">
          <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      <Card className="border-gray-200 shadow-sm bg-white">
        <CardContent className="p-0">
          {error ? (
            <div className="p-12 text-center text-red-500"><p>{error}</p></div>
          ) : loading && cases.length === 0 ? (
            <div className="p-12 text-center space-y-4"><div className="animate-spin h-8 w-8 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto"></div><p>Cargando...</p></div>
          ) : cases.length === 0 ? (
            <div className="p-12 text-center text-gray-500"><p>No se encontraron resultados.</p></div>
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
                        <Badge variant="secondary" className="text-[10px] h-5">{item.submission_type}</Badge>
                      </div>
                      <h4 className="font-semibold text-gray-900 line-clamp-1">{item.title || "Sin título"}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{item.summary || "..."}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <Eye className="h-5 w-5 text-gray-400 group-hover:text-yellow-600" />
                      </Button>
                      <Badge className={item.consensus?.state === 'human_consensus' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                        {item.consensus?.state === 'human_consensus' ? 'Verificado' : 'IA'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
