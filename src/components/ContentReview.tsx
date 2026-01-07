import React from 'react';
import { UnifiedDashboardLayout } from './layout/UnifiedDashboardLayout';
import { useCaseHistory } from '@/hooks/useCaseHistory';
import { CaseList } from '@/components/CaseList';
import { Card, CardContent } from '@/components/ui/card';
import { Pagination } from './ui/Pagination';
import { Loader2 } from 'lucide-react';

interface ContentReviewProps {
  onViewTask: (caseId: string, type: string, status?: string) => void;
}

export function ContentReview({ onViewTask }: ContentReviewProps) {
  const { cases, loading, error, page, totalPages, goToPage } = useCaseHistory();

  return (
    <UnifiedDashboardLayout pageKey="historial">
      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-0">
          {loading && cases.length === 0 ? (
            <div className="flex justify-center p-12"><Loader2 className="animate-spin text-yellow-500 h-8 w-8" /></div>
          ) : error ? (
            <div className="text-red-500 p-8 text-center">{error}</div>
          ) : (
            <>
              <CaseList 
                 cases={cases} 
                 onViewTask={onViewTask} 
                 isLoading={loading}
                 isEnrichedFormat={true}
                 title="Archivo General"
                 description="Base de datos histórica de análisis desinfodémicos."
              />
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={goToPage}
                isLoading={loading}
              />
            </>
          )}
        </CardContent>
      </Card>
    </UnifiedDashboardLayout>
  );
}
