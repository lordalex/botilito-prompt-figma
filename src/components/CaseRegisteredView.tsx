import React from 'react';
import botilitoImage from 'figma:asset/e27a276e6ff0e187a67cf54678c265c1c38adbf7.png';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Video,
  Volume2,
  Link2,
  AlertCircle,
  Info,
  CircleCheck,
  FileSearchIcon,
  Search,
  Clock,
  Loader2
} from 'lucide-react';

interface CaseRegisteredViewProps {
  caseData: {
    caseCode: string;
    createdAt: string;
    contentType: 'texto' | 'imagen' | 'video' | 'audio' | 'url';
    analysisType: string;
    fileName?: string;
    fileSize?: string;
    vector?: string;
  };
  onReportAnother: () => void;
  jobId?: string;
}

// Configuración de iconos por tipo de contenido
const contentTypeIcons = {
  texto: FileText,
  imagen: ImageIcon,
  video: Video,
  audio: Volume2,
  url: Link2,
} as const;

const contentTypeLabels = {
  texto: 'Texto',
  imagen: 'Imagen',
  video: 'Video',
  audio: 'Audio',
  url: 'URL',
} as const;

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return (
    date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }) +
    ' - ' +
    date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    })
  );
}

import { getJobStatus } from '../utils/aiAnalysis';
import { imageAnalysisService } from '@/services/imageAnalysisService';

export function CaseRegisteredView({ caseData, onReportAnother, jobId }: CaseRegisteredViewProps) {
  const ContentIcon = contentTypeIcons[caseData.contentType];
  const [analysisStatus, setAnalysisStatus] = React.useState<'pending' | 'processing' | 'completed' | 'failed' | null>(null);

  console.log('[CaseRegisteredView] Props received:', { 
    jobId, 
    contentType: caseData.contentType,
    caseCode: caseData.caseCode
  });

  // Polling for job status if jobId is provided
  React.useEffect(() => {
    console.log('[CaseRegisteredView] useEffect triggered with jobId:', jobId);
    if (!jobId) {
      console.warn('[CaseRegisteredView] No jobId provided, skipping polling');
      return;
    }

    let intervalId: NodeJS.Timeout | null = null;
    let isActive = true;

    const checkStatus = async () => {
      try {
        // Use imageAnalysisService for image content type
        if (caseData.contentType === 'imagen') {
          console.log('[CaseRegisteredView] Checking image status for jobId:', jobId);
          const response = await imageAnalysisService.getJobStatus(jobId);
          console.log('[CaseRegisteredView] Image status response:', response);
          if (isActive) {
            setAnalysisStatus(response.status);
            
            // Stop polling if completed or failed
            if (response.status === 'completed' || response.status === 'failed') {
              console.log('[CaseRegisteredView] Image analysis finished:', response.status);
              if (intervalId) clearInterval(intervalId);
            }
          }
        } else {
          // Use text-analysis for other content types
          console.log('[CaseRegisteredView] Checking text/url status for jobId:', jobId);
          const response = await getJobStatus(jobId);
          console.log('[CaseRegisteredView] Text/URL status response:', response);
          if (isActive) {
            setAnalysisStatus(response.status);
            
            // Stop polling if completed or failed
            if (response.status === 'completed' || response.status === 'failed') {
              console.log('[CaseRegisteredView] Text/URL analysis finished:', response.status);
              if (intervalId) clearInterval(intervalId);
            }
          }
        }
      } catch (err) {
        console.error("[CaseRegisteredView] Error checking job status", err);
        if (intervalId) clearInterval(intervalId);
      }
    };

    // Initial check
    checkStatus();

    // Start polling every 15 seconds
    intervalId = setInterval(checkStatus, 15000);

    return () => {
      isActive = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [jobId, caseData.contentType]);

  const isAnalysisComplete = analysisStatus === 'completed';
  const isAnalysisProcessing = analysisStatus === 'processing' || analysisStatus === 'pending';

  console.log('[CaseRegisteredView] Current state:', { 
    jobId, 
    contentType: caseData.contentType,
    analysisStatus, 
    isAnalysisComplete, 
    isAnalysisProcessing 
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      {/* Main card with yellow background */}
      <Card
        className="w-full max-w-4xl border-2 shadow-2xl overflow-hidden"
        style={{
          backgroundColor: 'var(--accent)',
          borderColor: 'var(--primary)',
          borderRadius: '0.5rem 0.5rem 0 0'
        }}
      >
        <CardContent className="p-6 space-y-4">
          {/* Header with Botilito */}
          <div className="flex items-start gap-4">
            <img src={botilitoImage} alt="Botilito" className="w-20 h-20 object-contain shrink-0" />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                ✅ ¡Listo parce! Tu caso ya quedó registrado
              </h2>
              <p className="text-sm text-gray-700 mt-1">
                Ya recibí tu reporte y lo analicé. Ahora un experto humano va a revisar mi diagnóstico para
                estar seguros. Te aviso cuando esté listo, ¿vale? 😉
              </p>

              {/* Case code and date */}
              <div className="flex items-center justify-between mt-4">
                <div>
                  {/* XP Award Replacement */}
                  <p className="text-xs text-gray-600">Recompensa:</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🏆</span>
                    <p className="text-lg font-bold font-mono text-gray-900">15 XP Ganados</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">📅 Fecha y hora:</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(caseData.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* White content section */}
      <Card className="w-full max-w-4xl -mt-1 border-2 border-t-0 shadow-lg" style={{ borderRadius: '0 0 0.5rem 0.5rem' }}>
        <CardContent className="p-4 space-y-4">
          {/* Two columns: Contenido Reportado + Cadena de Custodia */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contenido Reportado */}
            <Card className="border-2" style={{ borderColor: 'var(--primary)', backgroundColor: '#fffbeb' }}>
              <CardHeader className="pt-3 px-4">
                <CardTitle
                  className="text-sm font-semibold flex items-center gap-2"
                  style={{ color: '#d97706' }}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                  >
                    <Info className="h-5 w-5" style={{ color: '#d97706' }} />
                  </div>
                  Contenido Reportado
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                {/* Tipo y Análisis */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-md p-2 border" style={{ borderColor: 'var(--primary)' }}>
                    <p className="text-[10px] text-gray-500 mb-0.5">Tipo:</p>
                    <p className="text-xs font-medium text-gray-900 flex items-center gap-1">
                      <ContentIcon className="h-3.5 w-3.5 text-gray-600" style={{ color: 'var(--primary)' }} />
                      {contentTypeLabels[caseData.contentType]}
                    </p>
                  </div>
                  <div className="bg-white rounded-md p-2 border" style={{ borderColor: 'var(--primary)' }}>
                    <p className="text-[10px] text-gray-500 mb-0.5">Análisis:</p>
                    <p className="text-xs font-medium text-gray-900 flex items-center gap-1">
                      {caseData.analysisType}
                    </p>
                  </div>
                </div>

                {/* Archivo o URL */}
                {caseData.fileName && (
                  <div className="bg-white rounded-md p-2 border" style={{ borderColor: 'var(--primary)' }}>
                    <p className="text-[10px] text-gray-500 mb-0.5">
                      {caseData.contentType === 'url' ? 'URL:' : 'Archivo:'}
                    </p>
                    <p className="text-xs font-medium text-gray-900 break-all">
                      {caseData.fileName}
                    </p>
                  </div>
                )}

                {/* Tamaño y Vector */}
                <div className="grid grid-cols-2 gap-3">
                  {caseData.fileSize && (
                    <div className="bg-white rounded-md p-2 border" style={{ borderColor: 'var(--primary)' }}>
                      <p className="text-[10px] text-gray-500 mb-0.5">Tamaño:</p>
                      <p className="text-xs font-medium text-gray-900">{caseData.fileSize}</p>
                    </div>
                  )}
                  {caseData.vector && (
                    <div className="bg-white rounded-md p-2 border" style={{ borderColor: 'var(--primary)' }}>
                      <p className="text-[10px] text-gray-500 mb-0.5"> Vector: </p>
                      <p className="text-xs font-medium text-gray-900">{caseData.vector}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Cadena de Custodia */}
            <Card className="border-2" style={{ borderColor: '#60a5fa', backgroundColor: '#eff6ff' }}>
              <CardHeader className="pt-3 px-4">
                <CardTitle
                  className="text-sm font-semibold flex items-center gap-2"
                  style={{ color: '#2563eb' }}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                  >
                    <CircleCheck className="h-5 w-5" style={{ color: '#2563eb' }} />
                  </div>
                  Cadena de Custodia Iniciada
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="relative">
                  {/* Grid: columna 1 fija para iconos (32px), columna 2 para contenido */}
                  <div className="grid" style={{ gridTemplateColumns: '32px 1fr', columnGap: '12px' }}>
                    {/* Step 1 */}
                    <div className="flex items-start justify-center">
                      <div className="z-10">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center">
                          <CircleCheck className="h-5 w-5 text-white" style={{ color: 'var(--color-green-500)' }} />
                        </div>
                      </div>
                    </div>
                    <div className="pb-3">
                      <p className="text-xs font-medium text-gray-900">Caso recibido y registrado</p>
                      <p className="text-[10px] text-gray-500">{formatDate(caseData.createdAt).split(' - ')[1]}</p>
                    </div>

                    {/* Step 2: Análisis automatizado */}
                    <div className="flex items-start justify-center">
                      <div className="z-10">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center">
                          {isAnalysisComplete ? (
                            <CircleCheck className="h-5 w-5 text-white" style={{ color: 'var(--color-green-500)' }} />
                          ) : isAnalysisProcessing ? (
                            <Loader2 className="h-5 w-5 animate-spin" style={{ color: '#d97706' }} />
                          ) : (
                            <Clock className="h-5 w-5" style={{ color: '#d97706' }} />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="pb-3">
                      <p className="text-xs font-medium text-gray-900">
                        {isAnalysisComplete ? 'Análisis automatizado completado' : 'Análisis automatizado iniciado'}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {isAnalysisProcessing && (
                          <span className="text-amber-600 font-medium">Procesando...</span>
                        )}
                        {!isAnalysisProcessing && formatDate(caseData.createdAt).split(' - ')[1]}
                      </p>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-start justify-center">
                      <div className="z-10">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isAnalysisComplete ? '' : 'bg-gray-100'}`}>
                          <FileSearchIcon
                            className="h-5 w-5"
                            style={{ color: isAnalysisComplete ? 'var(--color-blue-500)' : '#9ca3af' }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="pb-3">
                      <p className={`text-xs font-medium ${isAnalysisComplete ? 'text-gray-900' : 'text-gray-400'}`}>
                        Validación por especialista humano
                      </p>
                      <p className="text-[10px]" style={{ color: isAnalysisComplete ? '#2563eb' : '#9ca3af' }}>
                        {isAnalysisComplete ? `En cola de revisión - ${formatDate(new Date().toISOString()).split(' - ')[1]}` : 'Pendiente'}
                      </p>
                    </div>

                    {/* Step 4 */}
                    <div className="flex items-start justify-center">
                      <div className="z-10">
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-white border border-gray-300"></div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-400">Diagnóstico final (IA+Red humana)</p>
                      <p className="text-[10px] text-gray-400">Pendiente</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Warning about AI */}
          <Card className="border border-orange-200 bg-orange-50">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-orange-800">Advertencia sobre el uso de IA</h4>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    El análisis automatizado utiliza IA para detectar posibles alteraciones en operaciones de{' '}
                    <strong>forensica digital</strong> y aplicar análisis de contenidos con un enfoque{' '}
                    <strong>estrictamente AMI</strong>.
                  </p>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    <strong>Esta tecnología tiene un margen de error</strong> y puede generar falsos positivos
                    o no detectar todas las manipulaciones. Actualmente se encuentra en{' '}
                    <strong>entrenamiento permanente</strong>.
                  </p>
                  <p className="text-xs text-gray-700">
                    Para más información, lee nuestro{' '}
                    <a href="#" className="text-orange-600 hover:underline font-medium">
                      descargo de responsabilidad
                    </a>
                    .
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action button */}
          <Button
            className="w-full text-gray-900 font-medium py-5"
            style={{ backgroundColor: 'var(--primary)' }}
            onClick={onReportAnother}
          >
            <Upload className="h-4 w-4 mr-2" />
            Reportar otro contenido
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
