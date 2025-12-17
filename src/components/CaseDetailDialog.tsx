// src/components/historial/CaseDetailDialog.tsx
import React from 'react';
import { 
  Bot, 
  FileText, 
  Activity, 
  Users, 
  Database,
  ExternalLink,
  AlertTriangle,
  Tag
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useCaseDetail } from '@/hooks/useCaseDetail';

interface CaseDetailDialogProps {
  caseId: string | null;
  onClose: () => void;
}

export function CaseDetailDialog({ caseId, onClose }: CaseDetailDialogProps) {
  // Uses its own hook and service
  const { caseDetail, loading, error } = useCaseDetail(caseId);

  return (
    <Dialog open={!!caseId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        
        {/* Header */}
        <DialogHeader className="p-6 border-b border-gray-100 bg-gray-50/80 backdrop-blur-sm z-10 shrink-0">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <span className="bg-gray-100 px-2 py-1 rounded">ID: {caseId || "..."}</span>
              <span>•</span>
              <span>{caseDetail ? new Date(caseDetail.created_at).toLocaleString() : 'Cargando...'}</span>
            </div>
            <DialogTitle className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
              {loading ? <Skeleton className="h-8 w-3/4" /> : (caseDetail?.title || "Detalle del Documento")}
            </DialogTitle>
            
            {!loading && caseDetail && (
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-sm bg-white shadow-sm">
                  {caseDetail.submission_type}
                </Badge>
                <Badge className={
                  caseDetail.consensus?.state === 'human_consensus' 
                    ? 'bg-green-100 text-green-800 border-green-200' 
                    : 'bg-blue-100 text-blue-800 border-blue-200'
                }>
                  {caseDetail.consensus?.state === 'human_consensus' ? 'Verificado por Humanos' : 'Solo IA'}
                </Badge>
              </div>
            )}
          </div>
          <DialogDescription className="sr-only">Detalles completos del caso</DialogDescription>
        </DialogHeader>
        
        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-6 md:p-8 space-y-8">
            {loading ? (
              <DetailSkeleton />
            ) : error ? (
              <div className="text-center py-20 text-red-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{error}</p>
              </div>
            ) : caseDetail ? (
              <>
                {/* Summary */}
                <section className="bg-yellow-50/50 border border-yellow-100 rounded-xl p-5 shadow-sm">
                  <h3 className="text-lg font-bold text-yellow-800 mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Resumen Analítico
                  </h3>
                  <p className="text-gray-800 leading-relaxed">
                    {caseDetail.summary || "No hay resumen disponible."}
                  </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* AI Analysis */}
                    <section>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                        <Bot className="h-5 w-5 text-blue-600" />
                        Análisis de IA
                      </h3>
                      <Card>
                        <CardContent className="p-5 space-y-6">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-500">Veredicto Global</span>
                              <Badge 
                                variant={caseDetail.metadata?.global_verdict === 'TAMPERED' ? "destructive" : "secondary"}
                                className="text-base px-3 py-1"
                              >
                                {caseDetail.metadata?.global_verdict || 'N/A'}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <span className="font-medium text-gray-500">Nivel de Confianza</span>
                              <span className="font-bold text-blue-700">
                                {((caseDetail.metadata?.confidence_score || 0) * 100).toFixed(1)}%
                              </span>
                            </div>
                            <Progress value={(caseDetail.metadata?.confidence_score || 0) * 100} className="h-2" />
                          </div>

                          <Separator />

                          <div className="space-y-3">
                            <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                              <Tag className="h-4 w-4" /> Etiquetas
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {caseDetail.diagnostic_labels?.map((label, i) => (
                                <Badge key={i} variant="outline">{label}</Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </section>

                    {/* Tech Data */}
                    <section>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                        <Activity className="h-5 w-5 text-purple-600" />
                        Datos Técnicos
                      </h3>
                      <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2 font-mono text-gray-600 border border-gray-200">
                        <div className="flex justify-between">
                          <span>Latencia:</span>
                          <span className="text-gray-900">{caseDetail.metadata?.duration_ms || 0} ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cacheado:</span>
                          <span className="text-gray-900">{caseDetail.metadata?.cached ? "Sí" : "No"}</span>
                        </div>
                      </div>
                    </section>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                        <Users className="h-5 w-5 text-green-600" />
                        Verificación Comunitaria
                      </h3>
                      <Card className="bg-green-50/30 border-green-100">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-gray-600">Total Votos</span>
                            <span className="text-2xl font-bold text-green-700">
                              {caseDetail.human_votes?.count || 0}
                            </span>
                          </div>
                          {/* Visualization of votes would go here */}
                        </CardContent>
                      </Card>
                    </section>

                    <section>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                        <Database className="h-5 w-5 text-gray-600" />
                        Contenido Original
                      </h3>
                      <Card className="bg-gray-50">
                        <CardContent className="p-4">
                          <ScrollArea className="h-48 rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-600">
                            {caseDetail.content || "Contenido no disponible."}
                          </ScrollArea>
                          {caseDetail.url && (
                            <div className="mt-4">
                              <Button variant="outline" className="w-full gap-2" onClick={() => window.open(caseDetail.url!, '_blank')}>
                                <ExternalLink className="h-4 w-4" />
                                Ver Fuente
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </section>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </ScrollArea>
        <DialogFooter className="p-4 border-t border-gray-100 bg-gray-50/50">
          <Button variant="ghost" onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="grid grid-cols-2 gap-8">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}

