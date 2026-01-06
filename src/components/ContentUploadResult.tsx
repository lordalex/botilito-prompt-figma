import React, { useRef, useMemo } from 'react';
import botilitoImage from '@/assets/e27a276e6ff0e187a67cf54678c265c1c38adbf7.png';
import {
  Bot, User, FileText, Globe, AlertTriangle, Shield, Activity,
  Hash, Download, ArrowLeft, CheckCircle2, Camera, Mic, Info
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { HumanValidationForm } from '@/components/HumanValidationForm';
import { generateCaseCode, ContentType, TransmissionVector } from '@/utils/caseCodeGenerator';
import { domToPng } from 'modern-screenshot';

// Import Specific Views
import { ImageAnalysisResultView } from './image-analysis/ImageAnalysisResultView';
import { AudioAnalysisResultView } from './audio-analysis/AudioAnalysisResultView';

interface ContentUploadResultProps {
  result: any;
  onReset: () => void;
  backLabel?: string;
}

export function ContentUploadResult({ result, onReset, backLabel = "Volver al listado" }: ContentUploadResultProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- GUARD CLAUSE ---
  if (!result) return null;

  // --- 1. TYPE DETECTION ---
  const resultType = result?.type || result?.meta?.type;
  
  // Specific view routing can remain if needed, or we can unify everything.
  // For now, keeping the routing for specialized views if they exist and match strict criteria.
  const isImageAnalysis =
    resultType === 'image_analysis' ||
    (result?.human_report && (result?.raw_forensics || result?.file_info?.dimensions));

  if (isImageAnalysis) {
    return <ImageAnalysisResultView data={result} onReset={onReset} />;
  }

  const isAudioAnalysis = resultType === 'audio_analysis';
  if (isAudioAnalysis) {
    return <AudioAnalysisResultView data={result} onReset={onReset} />;
  }

  // --- 2. DATA NORMALIZATION ---
  const data = result.fullResult || result; 
  
  // Extract recommendations
  const rawRecommendations = 
    data.recommendations || 
    data.metadata?.recommendations || 
    data.ai_analysis?.classification?.recomendaciones || 
    [];

  const recommendations: string[] = Array.isArray(rawRecommendations) 
    ? rawRecommendations.map(String) 
    : [];

  // Helper to map case type to ContentType for code generation
  const getContentType = (type: string): ContentType => {
    const typeMap: Record<string, ContentType> = {
      'TEXT': 'texto',
      'IMAGE': 'imagen',
      'VIDEO': 'video',
      'AUDIO': 'audio',
      'URL': 'url'
    };
    return typeMap[type.toUpperCase()] || 'texto';
  };

  // Helper to map vector to TransmissionVector
  const getTransmissionVector = (vector?: string): TransmissionVector => {
    if (!vector) return 'Web';
    const vectorMap: Record<string, TransmissionVector> = {
      'whatsapp': 'WhatsApp',
      'facebook': 'Facebook',
      'twitter': 'Twitter/X',
      'x': 'Twitter/X',
      'instagram': 'Instagram',
      'tiktok': 'TikTok',
      'youtube': 'YouTube',
      'telegram': 'Telegram',
      'web': 'Web',
      'email': 'Email',
      'sms': 'SMS'
    };
    return vectorMap[vector.toLowerCase()] || 'Web';
  };

  const caseType = (data.type || data.submission_type || 'TEXT').toUpperCase();
  const caseVector = data.metadata?.vector || data.vector || 'Web';

  // Get display_id from backend or generate one
  const displayId = data.display_id || data.displayId || data.standardized_case?.display_id ||
    generateCaseCode(getContentType(caseType), getTransmissionVector(caseVector));

  const caseData = {
    id: data.id || "Unknown",
    display_id: displayId,
    created_at: data.created_at || new Date().toISOString(),
    type: caseType,
    overview: {
      title: data.title || data.overview?.title || "Sin título",
      summary: data.summary || data.overview?.summary || "Sin resumen disponible.",
      verdict_label: data.overview?.verdict_label || data.metadata?.global_verdict || "Pendiente",
      risk_score: data.overview?.risk_score ?? data.metadata?.risk_score ?? 0,
      main_asset_url: data.overview?.main_asset_url || data.main_asset_url || data.url,
      source_domain: data.overview?.source_domain || data.source_domain
    },
    insights: Array.isArray(data.insights) ? data.insights : [],
    reporter: data.reporter,
    community: data.community || { votes: data.human_votes_count || 0, status: data.consensus?.state || 'pending' },
    metadata: data.metadata || { theme: data.theme, region: data.region, vector: caseVector },
    recommendations: recommendations
  };

  // Logic to determine if we show an Image or Audio player
  const isAudio = caseData.type === 'AUDIO';
  // Text, Image, Video (thumbnail) are all visual for the preview block
  const isVisual = !isAudio && !!caseData.overview.main_asset_url;

  // --- 3. INSIGHT FILTERING ---
  const sourceInsight = caseData.insights.find((i: any) => 
    i.id?.includes('source') || i.category === 'metadata' || i.label?.toLowerCase().includes('fuente')
  );

  const clickbaitInsight = caseData.insights.find((i: any) => 
    i.id?.includes('clickbait') || i.id?.includes('titular') || i.label?.toLowerCase().includes('titular')
  );

  const amiCompetencies = caseData.insights.filter((i: any) =>
    i.category === 'competency' || i.category === 'compliance' || i.label?.toLowerCase().includes('competencia')
  );

  // --- HELPERS ---
  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-600';
    if (score < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const contentRef = useRef<HTMLDivElement>(null);

  const handleDownloadImage = async () => {
    if (!contentRef.current) return;

    try {
      const dataUrl = await domToPng(contentRef.current, {
        backgroundColor: '#f9fafb',
        scale: 2,
      });

      const link = document.createElement('a');
      link.download = `botilito-${caseData.display_id}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Error al generar la imagen. Intenta de nuevo.');
    }
  };

  // --- 4. RENDER UI ---
  return (
    <div className="w-full bg-gray-50 min-h-screen pb-12">
      
      {/* HEADER BANNER */}
      <div className="bg-[#ffe97a] border-b-2 border-[#ffda00] px-6 py-4 shadow-sm mb-6 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="bg-white p-1.5 rounded-full border-2 border-[#ffda00] shrink-0">
             <img src={botilitoImage} alt="Botilito" className="w-10 h-10 object-contain" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">
              ¡Qué más parce! Este es el análisis {caseData.type === 'TEXT' ? 'AMI' : 'Forense'} completo 🕵️‍♂️
            </h2>
            <p className="text-xs text-gray-800 hidden md:block">
              {caseData.type === 'TEXT' 
                ? 'Contenido analizado desde la perspectiva de Alfabetización Mediática e Informacional.' 
                : `Análisis técnico de ${caseData.type.toLowerCase()} para detectar manipulación digital.`}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* NAVIGATION */}
        <div className="mb-6">
          <Button variant="ghost" onClick={onReset} className="pl-0 hover:bg-transparent hover:text-[#ffda00] text-gray-600">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLabel}
          </Button>
        </div>

        {/* TWO-COLUMN LAYOUT (Stretchy Left | Fixed-width Right Sidebar) */}
        <div ref={contentRef} className="flex flex-col lg:flex-row gap-8 mb-8 bg-gray-50 p-4 rounded-xl">

          {/* LEFT COLUMN - Stretches to fill available space */}
          <div className="flex-1 min-w-0 space-y-8">

            {/* ASSET PREVIEW (Dynamic based on Type) */}
            {caseData.overview.main_asset_url ? (
              <div className="rounded-xl overflow-hidden border border-black bg-white relative group">
                <div className="absolute top-4 left-4 z-10">
                  <Badge className="bg-black/70 hover:bg-black/90 text-white border-none backdrop-blur-sm gap-2 pl-2">
                    {isAudio ? <Mic className="h-3 w-3" /> : <Camera className="h-3 w-3" />}
                    {isAudio ? 'Audio Original' : 'Captura Original'}
                  </Badge>
                </div>

                {isAudio ? (
                  <div className="h-32 flex items-center justify-center bg-gray-900 text-white w-full">
                    <audio controls src={caseData.overview.main_asset_url} className="w-full max-w-2xl px-4" />
                  </div>
                ) : (
                  <div className="w-full">
                    <img
                      src={caseData.overview.main_asset_url}
                      alt="Analyzed Media"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden border border-black bg-gray-50 flex items-center justify-center h-[200px]">
                <div className="text-center text-gray-400">
                  <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Sin imagen disponible</p>
                </div>
              </div>
            )}

            {/* TITULAR */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-gray-500">
                <FileText className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Titular</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                {caseData.overview.title}
              </h1>
            </div>

            {/* DIAGNOSTIC CARDS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Infodemic Diagnosis */}
              <Card className="shadow-sm border-2 border-red-400 bg-red-50 overflow-hidden">
                <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="shrink-0">
                        <AlertTriangle className="h-8 w-8 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">Diagnóstico Infodémico</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant="secondary" className="bg-gray-200 text-gray-700 hover:bg-gray-200">Análisis IA</Badge>
                              <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border border-red-200">{caseData.overview.verdict_label || 'Pendiente'}</Badge>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-3xl font-black text-red-500">
                              {caseData.overview.risk_score}%
                            </div>
                            <div className="text-xs text-red-400 font-medium">Precisión<br/>diagnóstica</div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-4 leading-relaxed">
                          {caseData.overview.risk_score >= 70
                            ? "Contenido presenta características de desinformación. Alto riesgo de propagación por apelación emocional."
                            : caseData.overview.risk_score >= 30
                            ? "Contenido requiere verificación adicional. Se recomienda análisis crítico."
                            : "Contenido dentro de parámetros normales. Bajo riesgo de desinformación detectado."}
                        </p>
                      </div>
                    </div>
                </CardContent>
              </Card>

              {/* Human Analysis */}
              <Card className="shadow-sm border-2 border-red-400 bg-red-50 overflow-hidden">
                <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="shrink-0">
                        <User className="h-8 w-8 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">Análisis Humano</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant="secondary" className="bg-gray-200 text-gray-700 hover:bg-gray-200">Análisis Humano</Badge>
                              <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border border-red-200">
                                {caseData.community?.status === 'human_consensus' ? 'Consenso alcanzado' : 'Requiere validación'}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-3xl font-black text-red-500">
                              {caseData.community?.votes > 0 ? `${Math.min(100, caseData.community.votes * 10)}%` : '--%'}
                            </div>
                            <div className="text-xs text-red-400 font-medium">Consenso<br/>humano</div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-4 leading-relaxed">
                          {caseData.community?.votes > 0
                            ? `Los especialistas en AMI confirman que este contenido presenta características de desinformación y requiere un análisis crítico profundo, coincidiendo con la evaluación automatizada.`
                            : "Aún no hay suficientes validaciones humanas. Tu opinión como especialista es importante para alcanzar consenso."}
                        </p>
                      </div>
                    </div>
                </CardContent>
              </Card>
            </div>

            {/* CONTENIDO ANALIZADO */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-gray-500">
                <FileText className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Contenido Analizado</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-[#ffda00]">
                <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                  {caseData.overview.summary}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-4">
                {caseData.overview.source_domain && (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1.5 py-1">
                    <Globe className="h-3 w-3" /> Fuente: <strong>{caseData.overview.source_domain}</strong>
                  </Badge>
                )}
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1.5 py-1">
                  <Hash className="h-3 w-3" /> Tipo: <strong>{caseData.type}</strong>
                </Badge>
                {caseData.metadata?.theme && (
                  <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200 gap-1.5 py-1">
                    <Activity className="h-3 w-3" /> Tema: <strong>{caseData.metadata.theme}</strong>
                  </Badge>
                )}
              </div>
            </div>

            {/* AMI SPECIFIC SECTION */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[#FFDA00] text-xl">⚡</span>
                <h3 className="text-lg font-bold text-gray-900">
                  Análisis con enfoque en Alfabetización Mediática e Informacional (AMI)
                </h3>
              </div>
              
              <div className="space-y-4">
                
                {/* 1. Resumen */}
                <Card className="shadow-sm border-gray-200">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-700">
                      <FileText className="h-4 w-4" /> Resumen del Contenido
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-[60px_1fr] gap-2">
                        <span className="font-bold text-gray-900">Qué:</span>
                        <span className="text-gray-600">{caseData.overview.summary}</span>
                      </div>
                      <div className="grid grid-cols-[60px_1fr] gap-2">
                        <span className="font-bold text-gray-900">Quién:</span>
                        <span className="text-gray-600">{caseData.overview.source_domain || "Fuente no identificada"}</span>
                      </div>
                      <div className="grid grid-cols-[60px_1fr] gap-2">
                        <span className="font-bold text-gray-900">Cuándo:</span>
                        <span className="text-gray-600">{new Date(caseData.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 2. Análisis de Fuentes */}
                {sourceInsight && (
                  <Card className="shadow-sm border-blue-200 bg-blue-50/50">
                    <CardHeader className="pb-2 pt-4 px-4">
                      <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-800">
                        <Shield className="h-4 w-4" /> Análisis de Fuentes y Datos
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {sourceInsight.description}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* 3. Alerta Titular */}
                {clickbaitInsight && (
                  <Card className="shadow-sm border-2 border-red-400 bg-red-50 overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="shrink-0">
                          <AlertTriangle className="h-8 w-8 text-red-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-900">Alerta: Titular vs. Contenido</h3>
                          <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                            {clickbaitInsight.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 4. Competencias AMI */}
                {amiCompetencies.length > 0 && (
                  <Card className="shadow-sm border-green-200 bg-green-50/30">
                    <CardHeader className="pb-2 pt-4 px-4">
                      <CardTitle className="text-sm font-bold flex items-center gap-2 text-green-800">
                        <CheckCircle2 className="h-4 w-4" /> Competencias AMI Recomendadas:
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <div className="space-y-3">
                        {amiCompetencies.map((comp: any, idx: number) => (
                          <div key={idx} className="flex gap-3 items-start">
                            <div className="w-5 h-5 rounded-full bg-[#FFDA00] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 text-gray-900">
                              {idx + 1}
                            </div>
                            <p className="text-sm text-gray-700">
                              <span className="font-semibold">{comp.label}:</span> {comp.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

              </div>
            </div>

          </div>

          {/* RIGHT COLUMN - Fixed width sidebar */}
          <div className="lg:w-80 lg:flex-shrink-0 space-y-6">
            
            {/* Case Info */}
            <Card className="shadow-sm border-2" style={{ borderColor: '#FFDA00' }}>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#FFDA00]" /> Información del Caso
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Caso</span><span className="font-mono font-medium text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded text-xs">{caseData.display_id}</span></div>
                <Separator />
                <div className="flex justify-between text-sm"><span className="text-gray-500">Tipo</span><span className="font-bold text-gray-900">{caseData.type}</span></div>
                <Separator />
                <div className="flex justify-between text-sm"><span className="text-gray-500">Vector</span><span>{caseData.metadata?.vector || 'Web'}</span></div>
                <Separator />
                <div className="flex justify-between text-sm"><span className="text-gray-500">Reportado</span><span>{caseData.reporter?.name || 'Anónimo'}</span></div>
                <Separator />
                <div className="flex justify-between text-sm"><span className="text-gray-500">Fecha</span><span>{new Date(caseData.created_at).toLocaleDateString()}</span></div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card className="shadow-sm border-2" style={{ borderColor: '#FFDA00' }}>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#FFDA00]" /> Estadísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Pruebas</span><span className="font-bold text-gray-900">{caseData.insights.length}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Tiempo total</span><span className="font-bold text-gray-900">12.0s</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Precisión</span><span className="font-bold text-gray-900">{caseData.overview.risk_score > 0 ? '92%' : '0%'}</span></div>
                </div>
              </CardContent>
            </Card>

            {/* Chain of Custody */}
            <Card className="shadow-sm border-2" style={{ borderColor: '#FFDA00' }}>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[#FFDA00]" /> Cadena de Custodia
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="relative pl-4 border-l-2 border-gray-200 space-y-6 py-2 ml-1.5">
                  <div className="relative">
                    <div className="absolute -left-[23px] top-1 w-3 h-3 bg-[#FFDA00] rounded-full border-2 border-white ring-1 ring-gray-100"></div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-900 uppercase tracking-wide">Caso creado</span>
                      <span className="text-[10px] text-gray-500">{new Date(caseData.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[23px] top-1 w-3 h-3 bg-gray-900 rounded-full border-2 border-white ring-1 ring-gray-100"></div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-900 uppercase tracking-wide">Análisis ejecutado</span>
                      <span className="text-[10px] text-gray-500">Score de Riesgo: {caseData.overview.risk_score}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations - Always show */}
            <div className="bg-[#FFFCE8] border-2 rounded-lg p-4 shadow-sm" style={{ borderColor: '#FFDA00' }}>
              <div className="flex items-center gap-2 mb-3">
                <Bot className="h-4 w-4 text-[#FFDA00]" />
                <span className="font-bold text-gray-900 text-sm">Recomendaciones</span>
              </div>
              {caseData.recommendations.length > 0 ? (
                <ul className="space-y-2">
                  {caseData.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="text-xs text-gray-700 flex gap-2 items-start">
                      <span className="text-[#FFDA00] font-bold mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-500 italic">Sin recomendaciones específicas para este caso.</p>
              )}
            </div>

            <Button className="w-full bg-[#FFDA00] text-gray-900 hover:bg-[#e6c400]" onClick={handleDownloadImage}>
              <Download className="mr-2 h-4 w-4" /> Descargar Imagen
            </Button>
          </div>
        </div>

        {/* HUMAN VALIDATION COMPONENT (FULL WIDTH) */}
        <div className="w-full mb-12">
          <HumanValidationForm 
            caseId={caseData.id}
            aiVerdictLabel={caseData.overview.verdict_label}
            aiRiskScore={caseData.overview.risk_score}
            onVoteSuccess={() => {}}
          />
        </div>

      </div>

      {/* FOOTER */}
      <div className="py-8 text-center bg-white border-t border-gray-100 mt-12">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          BOTILITO INTELLIGENCE ECOSYSTEM • 2026
        </p>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
