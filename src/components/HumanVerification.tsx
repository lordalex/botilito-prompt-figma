import React, { useState } from 'react';
import { useHumanVerification } from '@/hooks/useHumanVerification';
import { useCaseDetail } from '@/hooks/useCaseDetail';
import { CaseList } from '@/components/CaseList';
import { ContentUploadResult } from '@/components/ContentUploadResult';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import { GlobalLoader } from '@/components/ui/GlobalLoader';
import { BotilitoValidationBanner } from '@/components/ui/botilito-validation-banner';

export function HumanVerification() {
  const { cases, isLoading, goToPage, page, totalPages, hasMore, refreshCases } = useHumanVerification();
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  // Use useCaseDetail to fetch FULL case data via lookup when a case is selected
  const { caseDetail, loading: caseLoading, error: caseError } = useCaseDetail(selectedCaseId);

  // Hook into CaseList callback
  const onViewTask = (caseId: string) => {
    console.log('[HumanVerification] onViewTask called with caseId:', caseId);
    setSelectedCaseId(caseId);
  };

  // Case Detail View
  if (selectedCaseId) {
    console.log('[HumanVerification] selectedCaseId:', selectedCaseId, 'caseLoading:', caseLoading, 'caseDetail:', caseDetail);
    // Loading state for case details
    if (caseLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-gray-500">Cargando detalles del caso...</p>
        </div>
      );
    }

    // Error or case not found
    if (caseError || !caseDetail) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-bold">Error</h3>
          <p className="text-gray-500 mb-4">{caseError || 'No se pudo encontrar el caso.'}</p>
          <Button onClick={() => setSelectedCaseId(null)} variant="outline">Volver</Button>
        </div>
      );
    }

    // Render full case with ContentUploadResult
    return (
      <ContentUploadResult
        result={caseDetail}
        onReset={() => setSelectedCaseId(null)}
        backLabel="Volver al listado"
        hideVoting={false}
      />
    );
  }

  // Case List View
  return (
    <div className="relative min-h-[60vh] max-w-7xl mx-auto">
      {isLoading && <GlobalLoader message="Cargando casos para valoración..." />}

      <div className={`p-6 transition-opacity duration-300 ${isLoading ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>

        <BotilitoValidationBanner />

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Validación Humana</h1>
          <p className="text-gray-600">Revisa y valida los diagnósticos realizados por la IA para mejorar la precisión del sistema</p>
        </div>

        <CaseList
          cases={cases}
          onViewTask={onViewTask}
          isLoading={false}
          isEnrichedFormat={true}
          title="Casos por Validar"
          description="Tu opinión es vital para el consenso"
          onPageChange={goToPage}
          currentPage={page}
          totalPages={totalPages}
          hasMore={hasMore}
          onRefresh={refreshCases}
          isRefreshing={isLoading}
        />
      </div>
    </div>
  );
}
