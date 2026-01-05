#!/bin/bash

# =================================================================
# REFACTOR: ContentUploadResult.tsx
# - Fix Asset Preview (Image vs Audio logic)
# - Move Human Validation to full width (bottom)
# - Strict color mapping
# =================================================================

echo "Refactoring src/components/ContentUploadResult.tsx..."

cat << 'EOF' > src/components/ContentUploadResult.tsx
import React, { useRef } from 'react';
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

  const caseData = {
    id: data.id || "Unknown",
    created_at: data.created_at || new Date().toISOString(),
    type: (data.type || data.submission_type || 'TEXT').toUpperCase(),
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
    metadata: data.metadata || { theme: data.theme, region: data.region, vector: data.vector },
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

  const handleDownloadImage = () => { alert("Descarga de imagen próximamente."); };

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

        {/* ASSET PREVIEW (Dynamic based on Type) */}
        {caseData.overview.main_asset_url && (
          <div className="mb-8 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-black relative group">
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
              <div className="w-full bg-gray-100 flex justify-center">
                <img 
                  src={caseData.overview.main_asset_url} 
                  alt="Analyzed Media" 
                  className="max-h-[500px] w-auto object-contain"
                />
              </div>
            )}
          </div>
        )}

        {/* TITLE & SUMMARY BLOCK */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2 text-gray-500">
              <FileText className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Titular</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
              {caseData.overview.title}
            </h1>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2 text-gray-500">
              <Activity className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Resumen del Análisis</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-[#ffda00]">
              <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                {caseData.overview.summary}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 pt-2">
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

        {/* TWO-COLUMN LAYOUT (Analysis | Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* LEFT COLUMN (2/3) - MAIN ANALYSIS */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* DIAGNOSTIC CARDS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Infodemic Diagnosis */}
              <Card className="shadow-sm border-gray-200 overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-5 flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                        <AlertTriangle className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Diagnóstico Infodémico</h3>
                        <div className="text-xs text-gray-500 font-medium mt-1">Análisis IA</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-black ${getRiskColor(caseData.overview.risk_score)}`}>
                        {caseData.overview.risk_score}%
                      </div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Nivel de Riesgo</div>
                    </div>
                  </div>
                  <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                    <p className="text-sm text-gray-900 font-medium">{caseData.overview.verdict_label}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Human Analysis */}
              <Card className="shadow-sm border-gray-200 overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-5 flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0">
                        <User className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Análisis Humano</h3>
                        <div className="text-xs text-gray-500 font-medium mt-1">
                          {caseData.community?.status === 'ai_only' ? 'Sin consenso' : 'Consenso Humano'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-gray-300">
                        {caseData.community?.votes > 0 ? `${Math.min(100, caseData.community.votes * 10)}%` : '--%'}
                      </div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Consenso</div>
                    </div>
                  </div>
                  <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                    <p className="text-sm text-gray-500 font-medium">
                      {caseData.community?.votes === 0 
                        ? "Aún no hay suficientes votos." 
                        : `${caseData.community?.votes} expertos han participado.`}
                    </p>
                  </div>
                </CardContent>
              </Card>
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
                  <Card className="shadow-sm border-red-200 bg-red-50/50">
                    <CardHeader className="pb-2 pt-4 px-4">
                      <CardTitle className="text-sm font-bold flex items-center gap-2 text-red-800">
                        <AlertTriangle className="h-4 w-4" /> Alerta: Titular vs. Contenido
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {clickbaitInsight.description}
                      </p>
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

          {/* RIGHT COLUMN (1/3) - Sidebar */}
          <div className="space-y-6">
            
            {/* Case Info */}
            <Card className="shadow-sm border-t-4 border-t-[#FFDA00]">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#FFDA00]" /> Información del Caso
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                <div className="flex justify-between text-sm"><span className="text-gray-500">ID</span><span className="font-mono font-medium text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded text-xs">{caseData.id.substring(0,8).toUpperCase()}</span></div>
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
            <Card className="shadow-sm border-l-4 border-l-[#FFDA00]">
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
            <Card className="shadow-sm">
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

            {/* Recommendations (Dynamic) */}
            {caseData.recommendations.length > 0 && (
              <div className="bg-[#FFFCE8] border border-[#FFDA00]/30 rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Bot className="h-4 w-4 text-[#FFDA00]" />
                  <span className="font-bold text-gray-900 text-sm">Recomendaciones</span>
                </div>
                <ul className="space-y-2">
                  {caseData.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="text-xs text-gray-700 flex gap-2 items-start">
                      <span className="text-[#FFDA00] font-bold mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

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
EOF

echo "✅ ContentUploadResult.tsx updated successfully."

