import React, { useState } from 'react';
import { useHumanVerification } from '@/hooks/useHumanVerification';
import { CaseList } from '@/components/CaseList';
import { ContentUploadResult } from '@/components/ContentUploadResult';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { GlobalLoader } from '@/components/ui/GlobalLoader';

export function HumanVerification() {
  const { cases, isLoading, handleSelectCase, goToPage, page, totalPages, hasMore, refreshCases } = useHumanVerification();
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  // Hook into CaseList callback
  const onViewTask = (caseId: string) => {
    setSelectedCaseId(caseId);
  };

  // Find the selected case from the already-loaded cases array
  // Each case has standardized_case with full DTO data
  const selectedCase = selectedCaseId
    ? cases.find(c => c.id === selectedCaseId)
    : null;

  // Use the embedded standardized_case (full DTO) or fall back to the enriched case itself
  const fullCaseData = selectedCase?.standardized_case || selectedCase;

  if (selectedCaseId) {
    // Case not found in loaded cases array (shouldn't normally happen)
    if (!fullCaseData) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-bold">Error</h3>
          <p className="text-gray-500 mb-4">No se pudo encontrar el caso en la lista.</p>
          <Button onClick={() => setSelectedCaseId(null)} variant="outline">Volver</Button>
        </div>
      );
    }

    return (
      <ContentUploadResult
        result={fullCaseData}
        onReset={() => setSelectedCaseId(null)}
        backLabel="Volver al listado"
        hideVoting={false}
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
          onRefresh={refreshCases}
          isRefreshing={isLoading}
        />
      </div>
    </div>
  );
}
