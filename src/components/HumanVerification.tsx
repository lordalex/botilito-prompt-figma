import React, { useState, useEffect } from 'react';
import { useHumanVerification } from '@/hooks/useHumanVerification';
import { CaseList } from '@/components/CaseList';
import { ContentUploadResult } from '@/components/ContentUploadResult';
import { lookupCase } from '@/services/vectorAsyncService';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { GlobalLoader } from '@/components/ui/GlobalLoader';

export function HumanVerification() {
  const { cases, isLoading, handleSelectCase, goToPage, page, totalPages, hasMore } = useHumanVerification();
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [fullCaseData, setFullCaseData] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Hook into CaseList callback
  const onViewTask = (caseId: string) => {
    setSelectedCaseId(caseId);
  };

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
    }
  }, [selectedCaseId]);

  if (selectedCaseId) {
    if (detailLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFDA00]"></div>
          <p className="mt-4 text-gray-500">Cargando...</p>
        </div>
      );
    }

    if (detailError || !fullCaseData) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-bold">Error</h3>
          <p className="text-gray-500 mb-4">{detailError || "No se pudo cargar el caso."}</p>
          <Button onClick={() => setSelectedCaseId(null)} variant="outline">Volver</Button>
        </div>
      );
    }

    return (
      <ContentUploadResult
        result={fullCaseData}
        onReset={() => setSelectedCaseId(null)}
        backLabel="Volver al listado"
      />
    );
  }

  return (
    <div className="relative min-h-[60vh]">
      {isLoading && <GlobalLoader message="Cargando casos para valoración..." />}

      <div className={`p-6 transition-opacity duration-300 ${isLoading ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
        <h1 className="text-2xl font-bold mb-4">Validación Humana</h1>
        <p className="text-gray-600 mb-6">Revisa y vota en los casos pendientes para ayudar a la comunidad.</p>

        <CaseList
          cases={cases}
          onViewTask={onViewTask}
          isLoading={false} // Disable internal loader to avoid double loading indicators
          isEnrichedFormat={true}
          title="Casos por Validar"
          description="Tu opinión es vital para el consenso"
          onPageChange={goToPage}
          currentPage={page}
          totalPages={totalPages}
          hasMore={hasMore}
        />
      </div>
    </div>
  );
}
