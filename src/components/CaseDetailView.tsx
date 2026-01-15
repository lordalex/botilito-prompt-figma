import React from 'react';
import { useCaseDetail } from '@/hooks/useCaseDetail';
import { ContentUploadResult } from './ContentUploadResult';
import { useAuth } from '@/providers/AuthProvider';
import { Loader2, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';

interface CaseDetailViewProps {
    caseId: string;
    onBackToList: () => void;
    onVerificationSuccess?: (caseId: string) => void;
}

export function CaseDetailView({
    caseId,
    onBackToList,
}: CaseDetailViewProps) {
    const { caseDetail, loading, error } = useCaseDetail(caseId);
    const { profile } = useAuth();

    console.log('[CaseDetailView] DEBUG: Mounting view for caseId:', caseId);

    React.useEffect(() => {
        console.log('[CaseDetailView] DEBUG: useEffect triggered for caseDetail update', {
            caseId,
            hasData: !!caseDetail,
            loading,
            error
        });
    }, [caseDetail, loading, error, caseId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Cargando detalles del caso...</p>
            </div>
        );
    }

    if (error || !caseDetail) {
        return (
            <div className="text-center p-8 space-y-4">
                <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
                <p className="text-lg font-medium">{error || 'Caso no encontrado.'}</p>
                <Button variant="outline" onClick={onBackToList}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a la lista
                </Button>
            </div>
        );
    }

    const isCibernauta = profile?.role === 'Cibernauta';

    // For non-cibernauta, voting is shown.
    // For cibernauta, it's hidden.
    const hideVoting = isCibernauta;
    console.log({ caseDetail });

    return (
        <ContentUploadResult
            result={caseDetail}
            onReset={onBackToList}
            hideVoting={hideVoting}
            backLabel="Volver"
        />
    );
}
