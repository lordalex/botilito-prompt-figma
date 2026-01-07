import React, { useState } from 'react';
import { UnifiedDashboardLayout } from './layout/UnifiedDashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { useHumanVerification } from '@/hooks/useHumanVerification';
import { CaseList } from '@/components/CaseList';
import { HumanValidationForm } from '@/components/HumanValidationForm';
import { Loader2 } from 'lucide-react';
import { Pagination } from './ui/Pagination';

export function HumanVerification() {
  const { 
    cases, 
    isLoading, 
    error, 
    refresh,
    page,
    totalPages,
    goToPage
  } = useHumanVerification();
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
  };

  const handleVoteSuccess = () => {
    setSelectedCaseId(null);
    refresh();
  };

  return (
    <UnifiedDashboardLayout pageKey="validacion">
      {selectedCaseId ? (
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => setSelectedCaseId(null)}
            className="mb-4 text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1"
          >
            ← Volver a la lista
          </button>
          <HumanValidationForm 
            caseId={selectedCaseId} 
            aiVerdictLabel="Análisis Previo" 
            aiRiskScore={50} // This should ideally come from the case data
            onVoteSuccess={handleVoteSuccess} 
          />
        </div>
      ) : (
        <Card className="shadow-sm border-gray-200">
          <CardContent className="p-6">
            {isLoading && cases.length === 0 ? (
               <div className="flex justify-center p-12"><Loader2 className="animate-spin text-yellow-500 h-8 w-8" /></div>
            ) : error ? (
               <div className="text-red-500 p-8 text-center">{error}</div>
            ) : (
              <>
                <CaseList 
                  cases={cases} 
                  isLoading={isLoading} 
                  onViewTask={handleSelectCase} 
                  isEnrichedFormat={true}
                  title="Casos Pendientes de Validación"
                  description="Tu experiencia ayuda a entrenar el modelo AMI."
                />
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={goToPage}
                  isLoading={isLoading}
                />
              </>
            )}
          </CardContent>
        </Card>
      )}
    </UnifiedDashboardLayout>
  );
}
