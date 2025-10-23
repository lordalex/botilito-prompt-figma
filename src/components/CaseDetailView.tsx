import React, { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { api } from '../utils/apiService';
import { jobManager } from '@/lib/JobManager';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { Loader2, ArrowLeft, Send, AlertTriangle } from 'lucide-react';

interface CaseDetailViewProps {
  caseId: string;
  onBackToList: () => void;
  onVerificationSuccess: (caseId: string) => void;
}

export function CaseDetailView({ caseId, onBackToList, onVerificationSuccess }: CaseDetailViewProps) {
    const { session } = useAuth();
    const [caseData, setCaseData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (!session) return;
        setIsLoading(true);
        api.crud.search(session, {
            nombreTabla: 'cases',
            criteriosBusqueda: { id: caseId }
        }).then(response => {
            if (response.resultados && response.resultados.length > 0) {
                setCaseData(response.resultados[0]);
            } else {
                throw new Error("Caso no encontrado.");
            }
        }).catch(err => {
            console.error(err);
            toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los detalles del caso." });
        }).finally(() => {
            setIsLoading(false);
        });
    }, [caseId, session, toast]);

    const handleSubmit = async () => {
        if (!session) return;
        setIsSubmitting(true);
        try {
            const diagnosisPayload = {
                case_id: caseId,
                classification: 'falso', // Datos del formulario irían aquí
                reason: 'Justificación de prueba',
            };
            jobManager.addJob('voting', diagnosisPayload);
            toast({ title: "✅ Diagnóstico Enviado", description: "Tu análisis se está procesando en segundo plano." });
            onVerificationSuccess(caseId);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error al Enviar", description: error.message });
            setIsSubmitting(false); // Solo poner en false si hay error
        }
    };

    if (isLoading) return <div className="flex justify-center items-center h-96"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    if (!caseData) return (
        <div className="text-center p-8">
            <AlertTriangle className="mx-auto h-8 w-8 text-destructive" />
            <p className="mt-2">Caso no encontrado.</p>
            <Button variant="outline" onClick={onBackToList} className="mt-4">Volver</Button>
        </div>
    );
    
    return (
        <div className="space-y-6">
            <Button variant="outline" onClick={onBackToList}><ArrowLeft className="mr-2 h-4 w-4" />Volver a la lista</Button>
            <Card>
                <CardHeader>
                    <CardTitle>{caseData.title || 'Detalle del Caso'}</CardTitle>
                    <CardDescription>ID del Caso: {caseData.id}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm">{caseData.content || "Contenido no disponible."}</p>
                    {/* Aquí iría el formulario de diagnóstico completo */}
                    <div className="flex justify-end mt-6">
                        <Button onClick={handleSubmit} disabled={isSubmitting} size="lg">
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? 'Procesando...' : 'Enviar Diagnóstico'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
