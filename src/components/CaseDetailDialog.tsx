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
import { generateDisplayId } from '@/utils/humanVerification/api';

interface CaseDetailDialogProps {
  caseId: string | null;
  onClose: () => void;
}

export function CaseDetailDialog({ caseId, onClose }: CaseDetailDialogProps) {
  // Uses its own hook and service
  const { caseDetail, loading, error } = useCaseDetail(caseId);

  return (
    <Dialog open={!!caseId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="!w-[90vw] !min-w-[320px] sm:!w-[88vw] md:!w-[80vw] lg:!w-[900px] xl:!w-[1000px] !max-w-[1200px] !max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        
        {/* Header */}
        <DialogHeader className="p-3 sm:p-4 md:p-6 border-b border-gray-100 bg-gray-50/80 backdrop-blur-sm z-10 flex-shrink-0">
          <div className="flex flex-col gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground font-mono flex-wrap">
              <span className="bg-yellow-100 text-yellow-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-semibold text-[10px] sm:text-xs">
                {caseDetail ? (caseDetail.displayId || generateDisplayId(caseDetail)) : "..."}
              </span>
              <span>•</span>
              <span className="text-[10px] sm:text-xs truncate max-w-[200px] sm:max-w-none">{caseDetail ? new Date(caseDetail.created_at).toLocaleString() : 'Cargando...'}</span>
            </div>
            <DialogTitle className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 leading-tight line-clamp-2">
              {loading ? <Skeleton className="h-8 w-3/4" /> : (caseDetail?.title || "Detalle del Documento")}
            </DialogTitle>
            
            {!loading && caseDetail && (
              <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1 flex-wrap">
                <Badge variant="outline" className="text-[10px] sm:text-xs md:text-sm bg-white shadow-sm px-1.5 sm:px-2 py-0.5">
                  {caseDetail.submission_type}
                </Badge>
                <Badge className={
                  caseDetail.consensus?.state === 'human_consensus' 
                    ? 'bg-green-100 text-green-800 border-green-200 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5' 
                    : 'bg-blue-100 text-blue-800 border-blue-200 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5'
                }>
                  {caseDetail.consensus?.state === 'human_consensus' ? 'Verificado' : 'Solo IA'}
                </Badge>
              </div>
            )}
          </div>
          <DialogDescription className="sr-only">Detalles completos del caso</DialogDescription>
        </DialogHeader>
        
        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
            {loading ? (
              <DetailSkeleton />
            ) : error ? (
              <div className="text-center py-12 text-red-500">
                <AlertTriangle className="h-10 w-10 mx-auto mb-4 opacity-50" />
                <p>{error}</p>
              </div>
            ) : caseDetail ? (
              <>
                {/* Summary */}
                <section className="bg-yellow-50/50 border border-yellow-100 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 shadow-sm">
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-yellow-800 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    <span>Resumen Analítico</span>
                  </h3>
                  <div className="h-32 md:h-36 overflow-y-auto rounded-md border border-yellow-200 bg-white p-3 md:p-4 text-sm text-gray-800">
                    <p className="leading-relaxed text-xs sm:text-sm md:text-base whitespace-pre-wrap break-words">
                      La imagen presenta un veredicto general de 'AUTÉNTICO' por parte del sistema. Sin embargo, el valor de 'Análisis de Nivel de Error (Compresión)' es de 0.68, lo cual sugiere una manipulación de compresión significativa o re-guardado que podría afectar la calidad de la imagen, pero no necesariamente la autenticidad del contenido. Visualmente, el color dominante azul/cyan en la piel de la persona y en la mayoría de los objetos (sombrero, poncho, taza, bolso, cafetera, cesta) es una inconsistencia lógica visual notoria y antinatural, especialmente en comparación con el fondo que mantiene tonos más realistas para un paisaje. Esta inconsistencia de color es un indicativo claro de que la imagen ha sido alterada o procesada artificialmente para aplicar un filtro de color o una técnica de inversión de color/tono a los elementos en primer plano sin afectar el fondo de la misma manera. El texto en el paquete de café es ilegible debido a la baja resolución o al procesamiento de color. Aunque el sistema la etiqueta como auténtica, las severas inconsistencias de color apuntan a una alteración visual significativa, no inherente a la captura original. La imagen presenta un veredicto general de 'AUTÉNTICO' por parte del sistema. Sin embargo, el valor de 'Análisis de Nivel de Error (Compresión)' es de 0.68, lo cual sugiere una manipulación de compresión significativa o re-guardado que podría afectar la calidad de la imagen, pero no necesariamente la autenticidad del contenido. Visualmente, el color dominante azul/cyan en la piel de la persona y en la mayoría de los objetos (sombrero, poncho, taza, bolso, cafetera, cesta) es una inconsistencia lógica visual notoria y antinatural, especialmente en comparación con el fondo que mantiene tonos más realistas para un paisaje. Esta inconsistencia de color es un indicativo claro de que la imagen ha sido alterada o procesada artificialmente para aplicar un filtro de color o una técnica de inversión de color/tono a los elementos en primer plano sin afectar el fondo de la misma manera. El texto en el paquete de café es ilegible debido a la baja resolución o al procesamiento de color. Aunque el sistema la etiqueta como auténtica, las severas inconsistencias de color apuntan a una alteración visual significativa, no inherente a la captura original.
                    </p>
                  </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                  {/* Left Column */}
                  <div className="space-y-3 sm:space-y-4">
                    {/* AI Analysis */}
                    <section>
                      <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2 border-b pb-1.5 sm:pb-2">
                        <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                        <span>Análisis de IA</span>
                      </h3>
                      <Card>
                        <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-500">Veredicto Global</span>
                              <Badge 
                                variant={caseDetail.metadata?.global_verdict === 'TAMPERED' ? "destructive" : "secondary"}
                                className="text-sm md:text-base px-2 md:px-3 py-1"
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
                      <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2 border-b pb-2">
                        <Activity className="h-5 w-5 text-purple-600 flex-shrink-0" />
                        Datos Técnicos
                      </h3>
                      <div className="bg-gray-50 rounded-xl p-3 md:p-4 text-sm space-y-2 font-mono text-gray-600 border border-gray-200">
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
                  <div className="space-y-4">
                    <section>
                      <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2 border-b pb-2">
                        <Users className="h-5 w-5 text-green-600 flex-shrink-0" />
                        Verificación Comunitaria
                      </h3>
                      <Card className="bg-green-50/30 border-green-100">
                        <CardContent className="p-4">
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
                      <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2 border-b pb-2">
                        <Database className="h-5 w-5 text-gray-600 flex-shrink-0" />
                        Contenido Original
                      </h3>
                      <Card className="bg-gray-50">
                        <CardContent className="p-3 md:p-4">
                          <div className="h-32 md:h-36 overflow-y-auto rounded-md border border-gray-200 bg-white p-3 md:p-4 text-sm text-gray-600">
                            <p className="whitespace-pre-wrap break-words">
                              {caseDetail.content || "Contenido no disponible."}
                            </p>
                          </div>
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
        </div>
        <DialogFooter className="p-2.5 sm:p-3 md:p-4 border-t border-gray-100 bg-gray-50/50 flex-shrink-0 p-3">
          <Button variant="ghost" onClick={onClose} className="text-sm">Cerrar</Button>
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

