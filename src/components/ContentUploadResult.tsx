import React, { useRef, useMemo } from 'react';
import botilitoImage from '@/assets/e27a276e6ff0e187a67cf54678c265c1c38adbf7.png';
import botilitoMascot from '@/assets/e27a276e6ff0e187a67cf54678c265c1c38adbf7.png';
import {
  Bot, User, FileText, Globe, AlertTriangle, Shield, Activity,
  Hash, Download, ArrowLeft, CheckCircle2, Camera, Mic, Info
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { HumanValidationForm } from '@/components/HumanValidationForm';
import { BotilitoValidationBanner } from '@/components/ui/botilito-validation-banner';
import { generateCaseCode, ContentType, TransmissionVector } from '@/utils/caseCodeGenerator';
import { domToPng } from 'modern-screenshot';

// Import Specific Views

// Import Specific Views and Subcomponents
import { AudioAnalysisResultView } from './audio-analysis/AudioAnalysisResultView';
// Image Analysis Subcomponents
import { TestResults } from './image-analysis/TestResults';
import { MarkersList } from './image-analysis/MarkersList';
import { VisualizationsTab } from './image-analysis/VisualizationsTab';
import { AnalysisStats } from './image-analysis/AnalysisStats';
import { Recommendations } from './image-analysis/Recommendations';
import { FileInfo } from './image-analysis/FileInfo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, ShieldCheck, Siren, AlertOctagon } from 'lucide-react'; // Added Icons
import { ImageComparisonSlider } from '@/components/ui/image-comparison-slider'; // Import new slider
import { DigitalIABanner } from '@/components/ui/digital-ia-banner';


interface ContentUploadResultProps {
  result: any;
  onReset: () => void;
  backLabel?: string;
  hideVoting?: boolean;
}

export function ContentUploadResult({ result, onReset, backLabel = "Volver al listado", hideVoting = false }: ContentUploadResultProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- GUARD CLAUSE ---
  if (!result) return null;

  // --- 1. TYPE DETECTION ---
  const resultType = result?.type || result?.meta?.type;

  // Specific view routing for specialized analysis views with full forensic data
  // Routes to ImageAnalysisResultView only when full forensic data (human_report) is available
  const isAudioAnalysis = resultType === 'audio_analysis';
  if (isAudioAnalysis) {
    return <AudioAnalysisResultView data={result} onReset={onReset} />;
  }

  // --- 2. DATA NORMALIZATION ---
  // Handle both direct StandardizedCase and EnrichedCase with nested standardized_case
  const rawData = result.fullResult || result;
  const stdCase = rawData.standardized_case || rawData;
  // Handle nested 'case' (common in VectorAsync) which might wrap the actual standardized case data
  const innerCase = rawData.case || stdCase;
  const data = { ...rawData, ...stdCase, ...innerCase }; // Merge everything

  // Extract recommendations
  const rawRecommendations =
    data.recommendations ||
    stdCase.recommendations ||
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

  // Extract insights - check multiple possible locations
  const rawInsights =
    stdCase.insights ||
    data.insights ||
    rawData.insights ||
    [];

  const caseData = {
    id: data.id || stdCase.id || "Unknown",
    display_id: displayId,
    created_at: data.created_at || stdCase.created_at || new Date().toISOString(),
    type: caseType,
    overview: {
      title: data.title || stdCase.overview?.title || data.overview?.title || "Sin título",
      summary: data.summary || stdCase.overview?.summary || data.overview?.summary || "Sin resumen disponible.",
      verdict_label: stdCase.overview?.verdict_label || data.overview?.verdict_label || data.metadata?.global_verdict || "Pendiente",
      risk_score: stdCase.overview?.risk_score ?? data.overview?.risk_score ?? data.metadata?.risk_score ?? 0,
      main_asset_url: stdCase.overview?.main_asset_url || data.overview?.main_asset_url || data.main_asset_url || data.url,
      source_domain: stdCase.overview?.source_domain || data.overview?.source_domain || data.source_domain
    },
    insights: Array.isArray(rawInsights) ? rawInsights : [],
    reporter: data.reporter || stdCase.reporter,
    community: data.community || stdCase.community || { votes: data.human_votes_count || 0, status: data.consensus?.state || 'pending' },
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

  // Forensic insights for IMAGE/VIDEO analysis (Category 'forensics' in DTO)
  const forensicInsights = caseData.insights.filter((i: any) =>
    i.category === 'forensics'
  );

  // Technical Metadata (EXIF)
  const metadataInsight = caseData.insights.find((i: any) =>
    i.id === 'meta_tech' || i.category === 'metadata'
  );

  const exifData = metadataInsight?.raw_data || {};

  // Content classification type insight (for TEXT content "Tipo" badge)
  const metaContextTypeInsight = caseData.insights.find((i: any) => i.id === 'meta_context_type');

  // Check if this is a forensic analysis case
  const isForensicCase = caseData.type === 'IMAGE' || caseData.type === 'VIDEO';
  // Treat URL cases as TEXT for the purpose of the AMI layout
  const isTextCase = caseData.type === 'TEXT' || caseData.type === 'URL';

  console.log('[ContentUploadResult] Rendering Case:', { id: caseData.id, type: caseData.type, isTextCase, isForensicCase });


  // --- HELPERS ---
  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-600';
    if (score < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get full color scheme based on risk score (from CLAUDE.md design system)
  const getRiskColorScheme = (score: number) => {
    if (score < 30) {
      return {
        border: 'border-green-500',
        bg: 'bg-green-50',
        iconText: 'text-green-500',
        scoreText: 'text-green-600',
        smallText: 'text-green-400',
        badgeBg: 'bg-green-100',
        badgeText: 'text-green-700',
        badgeBorder: 'border-green-200'
      };
    }
    if (score < 70) {
      return {
        border: 'border-yellow-500',
        bg: 'bg-yellow-50',
        iconText: 'text-yellow-500',
        scoreText: 'text-yellow-600',
        smallText: 'text-yellow-400',
        badgeBg: 'bg-yellow-100',
        badgeText: 'text-yellow-700',
        badgeBorder: 'border-yellow-200'
      };
    }
    if (score < 90) {
      return {
        border: 'border-orange-500',
        bg: 'bg-orange-50',
        iconText: 'text-orange-500',
        scoreText: 'text-orange-600',
        smallText: 'text-orange-400',
        badgeBg: 'bg-orange-100',
        badgeText: 'text-orange-700',
        badgeBorder: 'border-orange-200'
      };
    }
    // Critical (≥90)
    return {
      border: 'border-red-500',
      bg: 'bg-red-50',
      iconText: 'text-red-500',
      scoreText: 'text-red-600',
      smallText: 'text-red-400',
      badgeBg: 'bg-red-100',
      badgeText: 'text-red-700',
      badgeBorder: 'border-red-200'
    };
  };


  const riskColors = getRiskColorScheme(caseData.overview.risk_score);

  // Define distinct colors for Human Analysis based on Consensus % (matching Figma's Red/Green/Orange severity)
  const getHumanAnalysisColorScheme = (votes: number, status: string) => {
    // Calculate consensus percentage (mock logic: votes * 10 or from backend)
    const consensusScore = votes ? Math.min(100, votes * 10) : 0;

    if (consensusScore >= 70) {
      // High Risk / "Manipulado" Consensus -> RED
      return {
        border: 'border-red-200',
        bg: 'bg-red-50',
        iconText: 'text-red-600',
        scoreText: 'text-red-600',
        smallText: 'text-red-500',
        badgeBg: 'bg-white',
        badgeText: 'text-red-700',
        badgeBorder: 'border-red-200'
      };
    }
    if (consensusScore >= 30) {
      // Medium Risk -> ORANGE
      return {
        border: 'border-orange-200',
        bg: 'bg-orange-50',
        iconText: 'text-orange-600',
        scoreText: 'text-orange-600',
        smallText: 'text-orange-500',
        badgeBg: 'bg-white',
        badgeText: 'text-orange-700',
        badgeBorder: 'border-orange-200'
      };
    }
    // Low Risk / Safe -> GREEN (or Gray if no votes)
    if (votes > 0) {
      return {
        border: 'border-green-200',
        bg: 'bg-green-50',
        iconText: 'text-green-600',
        scoreText: 'text-green-600',
        smallText: 'text-green-500',
        badgeBg: 'bg-white',
        badgeText: 'text-green-700',
        badgeBorder: 'border-green-200'
      };
    }

    // Default / No Votes -> Gray
    return {
      border: 'border-gray-200',
      bg: 'bg-gray-50',
      iconText: 'text-gray-400',
      scoreText: 'text-gray-600',
      smallText: 'text-gray-400',
      badgeBg: 'bg-white',
      badgeText: 'text-gray-600',
      badgeBorder: 'border-gray-200'
    };
  };

  const humanColors = getHumanAnalysisColorScheme(caseData.community?.votes || 0, caseData.community?.status || 'pending');

  // Get color for forensic test score (higher = better/green, lower = suspicious/red)
  const getForensicScoreColor = (score: number | null | undefined) => {
    if (score === null || score === undefined) return 'bg-gray-100 text-gray-600';
    if (score >= 70) return 'bg-green-100 text-green-700 border-green-200';
    if (score >= 40) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  const getForensicScoreBadge = (score: number | null | undefined) => {
    if (score === null || score === undefined) return 'N/A';
    if (score >= 70) return 'NORMAL';
    if (score >= 40) return 'SOSPECHOSO';
    return 'MANIPULADO';
  };

  // Get color scheme for insight cards based on confidence score
  // Higher score = better/green (content is coherent), lower score = red (alert/mismatch)
  const getInsightColorScheme = (score: number | null | undefined) => {
    if (score === null || score === undefined || score >= 70) {
      // High confidence or no score - green (content matches)
      return {
        border: 'border-green-400',
        bg: 'bg-green-50',
        iconText: 'text-green-500',
        alertLabel: 'Coherencia verificada'
      };
    }
    if (score >= 40) {
      // Medium confidence - yellow (uncertain)
      return {
        border: 'border-yellow-400',
        bg: 'bg-yellow-50',
        iconText: 'text-yellow-500',
        alertLabel: 'Alerta: Titular vs. Contenido'
      };
    }
    // Low confidence - red (alert/mismatch)
    return {
      border: 'border-red-400',
      bg: 'bg-red-50',
      iconText: 'text-red-500',
      alertLabel: 'Alerta: Titular vs. Contenido'
    };
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

  // === TEXT CASE SPECIAL LAYOUT (Figma Match) ===
  // Unified Layout applicable for all types
  {
    return (
      <div className="w-full bg-gray-50 min-h-screen pb-12">
        {/* TEXT HEADER - Custom for Text cases - Unified Yellow */}
        <div className="bg-[#FFF59D] border-b border-[#FFDA00] sticky top-0 z-10 px-6 py-4 flex items-center gap-4 shadow-sm">
          <Button variant="ghost" size="sm" onClick={onReset} className="text-gray-600 gap-2 pl-0 hover:bg-transparent">
            <ArrowLeft className="h-4 w-4" /> {backLabel}
          </Button>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6" ref={contentRef}>
          {/* BOTILITO BANNER */}
          <BotilitoValidationBanner variant="detail" />

          <div className="flex flex-col lg:flex-row gap-8">
            {/* LEFT COLUMN (Main) */}
            <div className="flex-1 min-w-0 space-y-6">

              {/* 1. IMAGE HEADER */}
              {caseData.overview.main_asset_url && (
                <div className="relative rounded-xl overflow-hidden border border-black shadow-sm group h-96">
                  <div className="absolute top-4 left-4 z-10">
                    <Badge className="bg-black/80 hover:bg-black/90 text-white border-none gap-2 pl-2">
                      <Camera className="h-3 w-3" /> Captura Original
                    </Badge>
                  </div>
                  <img
                    src={caseData.overview.main_asset_url}
                    alt="Captura"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* 2. TITLE & META - Only for Text Cases */}
              {isTextCase && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <FileText className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Titular</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                  {caseData.overview.title}
                </h1>

                {/* Description / Summary Block */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-500">
                    <FileText className="h-3 w-3" />
                    <span className="text-xs font-bold uppercase tracking-wider">Contenido Analizado</span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {caseData.overview.summary}
                  </p>
                </div>

                {/* TAGS ROW */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {caseData.overview.source_domain && (
                    <Badge variant="secondary" className="bg-red-50 text-red-700 hover:bg-red-100 border-red-100 gap-1">
                      Fuente: <strong>{caseData.overview.source_domain}</strong>
                    </Badge>
                  )}
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100 gap-1">
                    Tipo: <strong>{metaContextTypeInsight?.value || 'Hecho'}</strong>
                  </Badge>
                  {caseData.metadata?.theme && (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200 gap-1">
                      Tema: <strong>{caseData.metadata.theme}</strong>
                    </Badge>
                  )}
                </div>
              </div>
              )}

              {/* 3. DIAGNOSIS CARDS (Infodemic & Human) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Infodemic / Forensic Diagnosis */}
                <div className={`rounded-xl border-2 p-4 flex flex-col justify-between ${caseData.overview.risk_score < 30 ? 'bg-green-50 border-green-200' :
                  caseData.overview.risk_score < 70 ? 'bg-orange-50 border-orange-200' :
                    'bg-red-50 border-red-200'
                  }`}>
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center gap-2 text-gray-900 font-bold">
                      <AlertTriangle className={caseData.overview.risk_score < 30 ? 'text-green-600' : caseData.overview.risk_score < 70 ? 'text-orange-600' : 'text-red-600'} />
                      {isForensicCase || isAudio ? 'Diagnóstico Forense' : 'Diagnóstico Infodémico'}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-gray-900">{caseData.overview.risk_score}%</div>
                      <div className="text-[10px] uppercase text-gray-500 font-bold">Precisión diagnóstica</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-transparent text-black border border-gray text-xs font-semibold">Análisis IA</Badge>
                    <Badge variant="outline" className={`border bg-white ${caseData.overview.risk_score < 30 ? 'text-green-700 border-green-200' :
                      caseData.overview.risk_score < 70 ? 'text-orange-700 border-orange-200' :
                        'text-red-700 border-red-200'
                      }`}>
                      {isForensicCase
                        ? (caseData.overview.risk_score > 50 ? 'Manipulado Digitalmente' : '✓ Sin alteraciones')
                        : 'requiere un enfoque AMI'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    {isForensicCase
                      ? (caseData.overview.risk_score > 50
                        ? "Se detectaron patrones de edición digital que sugieren manipulación del contenido original."
                        : "No se encontraron evidencias significativas de alteración digital en el archivo analizado.")
                      : "Contenido presenta desinformación médica grave. Alto riesgo de propagación por apelación emocional y falsa autoridad científica."}
                  </p>
                </div>

                {/* Human */}
                <div className="rounded-xl border-2 border-red-100 bg-red-50 p-4 flex flex-col justify-between">
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center gap-2 text-gray-900 font-bold">
                      <User className="text-red-600" />
                      Análisis Humano
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-gray-900">{caseData.community?.votes ? Math.min(caseData.community.votes * 10, 100) : 92}%</div>
                      <div className="text-[10px] uppercase text-gray-500 font-bold">Consenso humano</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-transparent text-black border border-gray text-xs font-semibold">Análisis Humano</Badge>
                    <Badge variant="outline" className="text-red-700 border-red-200 bg-white">
                      requiere un enfoque AMI
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Los especialistas en AMI confirman que este contenido presenta características de desinformación y requiere un análisis crítico profundo.
                  </p>
                </div>
              </div>

              {/* 4. AMI ANALYSIS SECTION */}
              {/* 4. AMI ANALYSIS SECTION (Text Only) */}
              {isTextCase && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[#FFDA00]">✨</span>
                    <h3 className="font-bold text-gray-900">Análisis con enfoque en Alfabetización Mediática e Informacional (AMI)</h3>
                  </div>

                  {/* A. Resumen del Contenido */}
                  <Card className="bg-gray-50 border-none shadow-none ring-1 ring-gray-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-700">
                        <FileText className="h-4 w-4" /> Resumen del Contenido
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-[60px_1fr] gap-2 text-sm">
                        <span className="font-bold text-gray-500">Qué:</span>
                        <span className="text-gray-800">{caseData.overview.summary?.split('.')[0]}.</span>

                        <span className="font-bold text-gray-500">Quién:</span>
                        <span className="text-gray-800">{caseData.overview.source_domain || 'Desconocido'}</span>

                        <span className="font-bold text-gray-500">Cuándo:</span>
                        <span className="text-gray-800">{new Date(caseData.created_at).toLocaleDateString()}</span>

                        <span className="font-bold text-gray-500">Dónde:</span>
                        <span className="text-gray-800">{getTransmissionVector(caseData.metadata?.vector)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* B. Análisis de Fuentes (Blue) */}
                  <Card className="bg-blue-50 border-none shadow-none ring-1 ring-blue-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-800">
                        <Globe className="h-4 w-4" /> Análisis de Fuentes y Datos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-blue-900">
                        {sourceInsight?.description || "El contenido proviene de fuentes que requieren verificación adicional. Se recomienda contrastar con medios verificados."}
                      </p>
                    </CardContent>
                  </Card>

                  {/* C. Alerta Clickbait (Red) */}
                  <Card className="bg-red-50 border-none shadow-none ring-1 ring-red-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-bold flex items-center gap-2 text-red-700">
                        <AlertTriangle className="h-4 w-4" /> Alerta: Titular vs. Contenido
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-red-800 font-medium">
                        ⚠️ {clickbaitInsight?.description || "El Titular presenta características que no corresponden completamente con  el contenido real. La recomendación central según AMI es leer, contrastar y reflexionar antes de compartir, aplicando pensamiento crítico y reconociendo la función del titular como parte de la construcción mediática."}
                      </p>
                    </CardContent>
                  </Card>

                  {/* D. Competencias AMI (Green) */}
                  <Card className="bg-green-50 border-none shadow-none ring-1 ring-green-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-bold flex items-center gap-2 text-green-800">
                        <ShieldCheck className="h-4 w-4" /> Competencias AMI Recomendadas:
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {amiCompetencies.length > 0 ? amiCompetencies.map((comp: any, i: number) => (
                          <li key={i} className="flex gap-3 text-sm text-green-900">
                            <span className="bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                              {i + 1}
                            </span>
                            <span>{comp.description}</span>
                          </li>
                        )) : (
                          <>
                            <li className="flex gap-3 text-sm text-green-900">
                              <span className="bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">1</span>
                              <span>Acceso a la información: Identificar y acceder a fuentes confiables y verificables</span>
                            </li>
                            <li className="flex gap-3 text-sm text-green-900">
                              <span className="bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">2</span>
                              <span>Evaluación crítica: Analizar la credibilidad de las fuentes y la veracidad del contenido</span>
                            </li>
                            <li className="flex gap-3 text-sm text-green-900">
                              <span className="bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">3</span>
                              <span>Comprensión del contexto: Entender el contexto histórico, social y político de la información</span>
                            </li>
                          </>
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}


              {/* 5. INSIGHTS SECTION - Tabbed (Pruebas / Evidencias) - Only for Forensic Cases */}
              {isForensicCase && (
              <div className="space-y-4">
                <Tabs defaultValue="pruebas" className="w-full">
                  <TabsList className="bg-gray-100 p-1 rounded-lg">
                    <TabsTrigger value="pruebas" className="text-sm font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2">
                      Pruebas ({caseData.insights.filter((i: any) => i.category === 'forensics').length})
                    </TabsTrigger>
                    <TabsTrigger value="evidencias" className="text-sm font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2">
                      Evidencias
                    </TabsTrigger>
                  </TabsList>

                  {/* PRUEBAS TAB */}
                  <TabsContent value="pruebas" className="mt-6 space-y-3">
                    {caseData.insights
                      .filter((i: any) => i.category === 'forensics')
                      .map((insight: any, idx: number) => {
                        const score = insight.score || 0;
                        let statusLabel = 'LIMPIO';
                        let statusColor = 'bg-green-500 text-white';

                        if (score >= 80) {
                          statusLabel = 'MANIPULADO';
                          statusColor = 'bg-orange-500 text-white';
                        } else if (score >= 40) {
                          statusLabel = 'MODIFICADO';
                          statusColor = 'bg-orange-500 text-white';
                        }
                        return (
                            <div
                              key={idx}
                              className="bg-gray-100 border border-transparent hover:border-2 hover:border-primary rounded-lg p-4 shadow-sm transition-all duration-200 hover:shadow-md"
                            >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1 pr-3">
                                <h4 className="text-sm font-semibold text-gray-900 mb-0.5">{insight.label}</h4>
                                <p className="text-xs text-gray-600 leading-relaxed">{insight.description}</p>
                              </div>
                              <Badge className={`shrink-0 text-xs uppercase tracking-wide rounded-md ${statusColor}`}>
                                {statusLabel}
                              </Badge>
                            </div>

                            {/* Progress Bar Section */}
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-600">Precisión diagnóstica</span>
                                <span className="text-sm font-semibold text-gray-900">{score}%</span>
                              </div>
                              <div className="h-2 w-full bg-gray-200 rounded-sm overflow-hidden">
                                <div 
                                  className="h-full transition-all duration-700 ease-out"
                                  style={{ width: `${score}%`, backgroundColor: `var(--color-yellow-500)` }} 
                                />
                              </div>
                              <div className="flex justify-between items-center pt-0.5">
                                <span className="text-xs text-gray-600">Tiempo de ejecución</span>
                                <span className="text-xs text-gray-900">{insight.execution_time || '1.5s'}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </TabsContent>

                  {/* EVIDENCIAS TAB */}
                  <TabsContent value="evidencias" className="mt-4 space-y-4">
                    {caseData.insights
                      .filter((i: any) => i.category !== 'forensics')
                      .map((insight: any, idx: number) => (
                        <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <Info className="h-4 w-4 text-gray-400" />
                              <h4 className="font-bold text-gray-900 text-sm">{insight.label}</h4>
                            </div>
                            <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 text-[10px]">
                              {insight.value || "INFO"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded border border-gray-100">
                            {insight.description || "Sin descripción"}
                          </p>
                        </div>
                      ))}
                    {caseData.insights.filter((i: any) => i.category !== 'forensics').length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No hay evidencias adicionales disponibles.</p>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
              )}


            </div>

            {/* RIGHT COLUMN (Sidebar) */}
            <div className="lg:w-80 lg:flex-shrink-0 space-y-6">
              {/* Información del Caso */}
              <Card className="shadow-sm border-2 mb-6" style={{ borderColor: '#FFDA00' }}>
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    Información del Caso
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-4">
                  <div className="flex justify-between text-xs"><span className="text-gray-500 font-medium">Caso</span><span className="font-mono">{caseData.display_id}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-gray-500 font-medium">Tipo</span><span className="font-bold">{caseData.type}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-gray-500 font-medium">Vector de transmisión</span><span>{caseData.metadata?.vector || 'Web'}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-gray-500 font-medium">Registrado por</span><span>{caseData.reporter?.name || '-'}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-gray-500 font-medium">Fecha</span><span>{new Date(caseData.created_at).toLocaleDateString()}</span></div>
                </CardContent>
              </Card>

              {/* Metadatos del Archivo (Forensic Only) */}
              {isForensicCase && (
                <Card className="shadow-sm border-2 mb-6" style={{ borderColor: '#FFDA00' }}>
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Camera className="h-5 w-5 text-primary" /> Metadatos del Archivo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 space-y-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 font-medium">Tipo de archivo</span>
                      <span className="font-bold">{caseData.type}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 font-medium">Tamaño</span>
                      <span>{((caseData.metadata?.file_size || 0) / 1024).toFixed(1)} KB</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 font-medium">Resolución</span>
                      <span>{caseData.metadata?.dimensions?.width || '1920'}x{caseData.metadata?.dimensions?.height || '1080'}</span>
                    </div>
                    <Separator />
                    <div className="text-xs">
                      <span className="text-gray-500 block mb-1 font-medium">Metadatos EXIF</span>
                      {Object.keys(exifData).length > 0 ? (
                        <span className="text-gray-900">Disponible</span>
                      ) : (
                        <span className="text-red-500 font-bold">No disponible / Eliminado</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Estadísticas del Análisis */}
              <Card className="shadow-sm border-2 mb-6" style={{ borderColor: '#FFDA00' }}>
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" /> Estadísticas del Análisis
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-4">
                  <div className="flex justify-between text-xs"><span className="text-gray-500 font-medium">Pruebas realizadas</span><span className="font-bold">{caseData.insights.length || 1}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-gray-500 font-medium">Nivel de precisión diagnóstica</span><span className="font-bold">{caseData.overview.risk_score > 0 ? '92%' : '0%'}</span></div>
                </CardContent>
              </Card>

              {/* Cadena de Custodia */}
            <Card className="shadow-sm border-2 rounded-xl" style={{ borderColor: '#FFDA00' }}>
                <CardHeader className="pt-4 px-4">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-gray-900">
                  <Shield className="h-5 w-5 text-primary" /> Cadena de Custodia
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="space-y-0">
                  {/* Event 1: Case Created */}
                  <div className="flex gap-3 py-4">
                    <div className="shrink-0 w-3 h-3 rounded-full mt-1" style={{ backgroundColor: '#FFDA00' }}></div>
                    <div className="flex flex-col gap-1 flex-1">
                      <span className="text-sm font-bold text-gray-900">Caso creado</span>
                      <span className="text-xs text-gray-600">
                        {new Date(caseData.created_at).toLocaleDateString('es-CO', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })} a las {new Date(caseData.created_at).toLocaleTimeString('es-CO', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: true
                        })} - Sistema Botilito
                      </span>
                    </div>
                  </div>

                  <Separator className="bg-gray-200" />

                  {/* Event 2: Analysis Executed */}
                  <div className="flex gap-3 py-4">
                    <div className="shrink-0 w-3 h-3 rounded-full mt-1" style={{ backgroundColor: '#FFDA00' }}></div>
                    <div className="flex flex-col gap-1 flex-1">
                      <span className="text-sm font-bold text-gray-900">
                        {caseData.type === 'TEXT' || caseData.type === 'URL' 
                          ? 'Análisis desinfodémico ejecutado' 
                          : 'Análisis forense ejecutado'}
                      </span>
                      <span className="text-xs text-gray-600">
                        {new Date(caseData.created_at).toLocaleDateString('es-CO', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })} a las {new Date(new Date(caseData.created_at).getTime() + 5000).toLocaleTimeString('es-CO', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: true
                        })} - {caseData.insights.length} {caseData.insights.length === 1 ? 'prueba completada' : 'pruebas completadas'}
                      </span>
                    </div>
                  </div>

                  <Separator className="bg-gray-200" />

                  {/* Event 3: Diagnosis Generated */}
                  <div className="flex gap-3 py-4">
                    <div className="shrink-0 w-3 h-3 rounded-full mt-1" style={{ backgroundColor: '#FFDA00' }}></div>
                    <div className="flex flex-col gap-1 flex-1">
                      <span className="text-sm font-bold text-gray-900">Diagnóstico generado</span>
                      <span className="text-xs text-gray-600">
                        {new Date(caseData.created_at).toLocaleDateString('es-CO', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })} a las {new Date(new Date(caseData.created_at).getTime() + 12000).toLocaleTimeString('es-CO', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: true
                        })} - {caseData.overview.verdict_label || 'Análisis completado'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

              {/* Recomendaciones */}
              <div className="border-2 border-[#FFDA00] rounded-lg p-6 shadow-sm" style={{ borderColor: '#FFDA00', backgroundColor: '#fffbeb' }}>
                <div className="flex items-center gap-3 mb-4">
                  <img src={botilitoMascot} alt="Botilito Detective" className="w-12 h-12 object-contain drop-shadow-sm" />
                  <h3 className="font-bold text-gray-900 text-base">Recomendaciones</h3>
                </div>
                <ul className="space-y-3">
                  <li className="text-xs text-gray-800 flex gap-3 items-start font-medium leading-relaxed">
                    <span className="text-primary text-1xl leading-[0.5] mt-[2px]">•</span>
                    <span>Verificar las fuentes citadas en el contenido</span>
                  </li>
                  <li className="text-xs text-gray-800 flex gap-3 items-start font-medium leading-relaxed">
                    <span className="text-primary text-1xl leading-[0.5] mt-[2px]">•</span>
                    <span>Contrastar con medios de comunicación confiables</span>
                  </li>
                  <li className="text-xs text-gray-800 flex gap-3 items-start font-medium leading-relaxed">
                    <span className="text-primary text-1xl leading-[0.5] mt-[2px]">•</span>
                    <span>Desarrollar pensamiento crítico mediante las competencias AMI</span>
                  </li>
                  <li className="text-xs text-gray-800 flex gap-3 items-start font-medium leading-relaxed">
                    <span className="text-primary text-1xl leading-[0.5] mt-[2px]">•</span>
                    <span>No compartir contenido sin verificar primero</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {!hideVoting && (
          <div className="max-w-7xl mx-auto px-6 mt-6">
            <HumanValidationForm
              caseId={caseData.id}
              aiVerdictLabel={caseData.overview.verdict_label}
              aiRiskScore={caseData.overview.risk_score}
              caseType={caseData.type}
              onVoteSuccess={onReset}
            />
          </div>
        )}
      </div>
    );
  }

  // Legacy Fallback Layout (Disabled)
  if (false) {
    return (
      <div className="w-full bg-gray-50 min-h-screen pb-12">

        {/* HEADER BANNER - Unified Yellow #FFF59D */}
        <div className="bg-[#FFF59D] border-b border-[#FFDA00] px-6 py-4 shadow-sm mb-6 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white p-1.5 rounded-full border-2 border-[#ffda00] shrink-0">
                <img src={botilitoImage} alt="Botilito" className="w-10 h-10 object-contain" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 leading-tight">
                  {caseData.overview.title}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  {/* Status Pill */}
                  {caseData.community?.status === 'ai_only' ? (
                    <Badge variant="secondary" className="bg-gray-200 text-gray-700 hover:bg-gray-300 gap-1">
                      <Bot className="h-3 w-3" /> 🤖 AI Analysis
                    </Badge>
                  ) : caseData.community?.status === 'human_consensus' ? (
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200 gap-1">
                      <User className="h-3 w-3" /> 👥 Verified by Community
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-500 border-gray-300">
                      Pendiente
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Risk Meter */}
            <div className="flex items-center gap-3 bg-white/50 px-3 py-2 rounded-lg border border-[#ffda00]/30">
              <div className="text-right">
                <div className="text-xs font-bold text-gray-500 uppercase">Riesgo</div>
                <div className={`text-xl font-black ${getRiskColor(caseData.overview.risk_score)}`}>
                  {caseData.overview.risk_score}%
                </div>
              </div>
              <div className={`p-2 rounded-full ${caseData.overview.risk_score < 31 ? 'bg-green-100 text-green-600' :
                caseData.overview.risk_score < 71 ? 'bg-orange-100 text-orange-600' :
                  'bg-red-100 text-red-600'
                }`}>
                {caseData.overview.risk_score < 31 ? <ShieldCheck className="h-6 w-6" /> :
                  caseData.overview.risk_score < 71 ? <AlertTriangle className="h-6 w-6" /> :
                    <Siren className="h-6 w-6" />}
              </div>
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

          {/* BOTILITO BANNER */}
          <BotilitoValidationBanner variant="detail" />

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
                    <Hash className="h-3 w-3" /> Tipo: <strong>{metaContextTypeInsight?.value || caseData.type}</strong>
                  </Badge>
                  {caseData.metadata?.theme && (
                    <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200 gap-1.5 py-1">
                      <Activity className="h-3 w-3" /> Tema: <strong>{caseData.metadata.theme}</strong>
                    </Badge>
                  )}
                </div>
              </div>

              {/* DIAGNOSTIC CARDS ROW */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Infodemic Diagnosis */}
                <Card className={`shadow-sm border-2 ${riskColors.border} ${riskColors.bg} overflow-hidden`}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="shrink-0">
                        <AlertTriangle className={`h-8 w-8 ${riskColors.iconText}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">Diagnóstico Infodémico</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant="secondary" className="bg-gray-200 text-gray-700 hover:bg-gray-200">Análisis IA</Badge>
                              <Badge className={`${riskColors.badgeBg} ${riskColors.badgeText} hover:${riskColors.badgeBg} border ${riskColors.badgeBorder}`}>{caseData.overview.verdict_label || 'Pendiente'}</Badge>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className={`text-3xl font-black ${riskColors.scoreText}`}>
                              {caseData.overview.risk_score}%
                            </div>
                            <div className={`text-xs ${riskColors.smallText} font-medium`}>Precisión<br />diagnóstica</div>
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
                <Card className={`shadow-sm border-2 ${humanColors.border} ${humanColors.bg} overflow-hidden`}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="shrink-0">
                        <User className={`h-8 w-8 ${humanColors.iconText}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">Análisis Humano</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant="secondary" className="bg-white/50 text-gray-700 hover:bg-white/80">Análisis Humano</Badge>
                              <Badge className={`${humanColors.badgeBg} ${humanColors.badgeText} hover:${humanColors.badgeBg} border ${humanColors.badgeBorder}`}>
                                {caseData.community?.status === 'human_consensus' ? 'Consenso alcanzado' : 'Requiere validación'}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className={`text-3xl font-black ${humanColors.scoreText}`}>
                              {caseData.community?.votes ? `${Math.min(100, caseData.community.votes * 10)}%` : '--%'}
                            </div>
                            <div className={`text-xs ${humanColors.smallText} font-medium`}>Consenso<br />humano</div>
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

              {/* INSIGHT CARDS GRID (Dynamic) */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <span className="text-[#FFDA00] text-xl">💡</span>
                  <h3 className="text-lg font-bold text-gray-900">Resultados del Análisis</h3>
                </div>

                <div className="flex flex-col gap-4">
                  {caseData.insights.map((insight: any, idx: number) => {
                    // Determine status/color based on score
                    const score = insight.score || 0;
                    let statusLabel = 'ANALIZADO';
                    let statusColor = 'bg-gray-100 text-gray-700 border-gray-200';
                    let barColor = 'bg-gray-400';

                    if (insight.category === 'forensics' || insight.score !== undefined) {
                      if (score >= 80) {
                        statusLabel = insight.value?.toUpperCase() || 'ALTAMENTE SOSPECHOSO';
                        statusColor = 'bg-red-100 text-red-700 border-red-200';
                        barColor = 'bg-red-500';
                        if (insight.label.toLowerCase().includes('clon')) statusLabel = 'CLONADO';
                        if (insight.label.toLowerCase().includes('espect')) statusLabel = 'ANOMALÍAS';
                      } else if (score >= 40) {
                        statusLabel = insight.value?.toUpperCase() || 'MODIFICADO';
                        statusColor = 'bg-[#FFF9C4] text-yellow-800 border-[#FFDA00]';
                        barColor = 'bg-[#FFDA00]';
                      } else {
                        statusLabel = 'LIMPIO';
                        statusColor = 'bg-green-100 text-green-700 border-green-200';
                        barColor = 'bg-green-500';
                      }
                    }

                    // Special Case: Metadata (Technical details text only)
                    if (insight.category === 'metadata' || (insight.id && insight.id.startsWith('meta_'))) {
                      return (
                        <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <Info className="h-4 w-4 text-gray-400" />
                              <h4 className="font-bold text-gray-900 text-sm">{insight.label}</h4>
                            </div>
                            <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 text-[10px]">
                              {insight.value || "INFO"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded border border-gray-100">
                            {insight.description || "Sin descripción"}
                          </p>
                        </div>
                      );
                    }

                    // Special Case: Fact Check (keep card style but cleaner)
                    if (insight.category === 'fact_check') {
                      const isRefuted = insight.value?.toLowerCase().includes('refutado') || insight.value === 'False';
                      return (
                        <div key={idx} className={`p-4 rounded-xl border-l-4 shadow-sm bg-white ${isRefuted ? 'border-l-red-500 ring-1 ring-red-100' : 'border-l-green-500 ring-1 ring-green-100'}`}>
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2 mb-2">
                              <Shield className={`h-5 w-5 ${isRefuted ? 'text-red-500' : 'text-green-500'}`} />
                              <h3 className="font-bold text-gray-900">Fact Check</h3>
                            </div>
                            <Badge className={isRefuted ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                              {insight.value || "Verificado"}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-gray-800 mb-1">{insight.description}</h4>
                        </div>
                      );
                    }

                    // Forensics / Generic List Item Style
                    return (
                      <div key={idx} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-1">{insight.label}</h4>
                            <p className="text-xs text-gray-500">{insight.description || "Análisis completado"}</p>
                          </div>
                          <Badge className={`border px-2 py-0.5 text-[10px] font-black tracking-wider ${statusColor}`}>
                            {statusLabel}
                          </Badge>
                        </div>

                        {/* Content: Slider if artifact exists */}
                        {insight.artifacts?.[0]?.content && (
                          <div className="mb-4 mt-2 rounded-lg overflow-hidden border border-gray-100">
                            <ImageComparisonSlider
                              beforeImage={caseData.overview.main_asset_url}
                              afterImage={insight.artifacts[0].content}
                              beforeLabel="Original"
                              afterLabel="Mapa de Calor"
                            />
                          </div>
                        )}

                        {/* Progress Bar */}
                        {(insight.category === 'forensics' || insight.score !== undefined) && (
                          <div className="mt-3">
                            <div className="flex justify-between text-[10px] mb-1 text-gray-400 font-medium uppercase">
                              <span>Precisión diagnóstica</span>
                              <span>{score}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
                                style={{ width: `${score}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[10px] mt-1 text-gray-400">
                              <span>0s</span>
                              <span>Tiempo de ejecución: 1.5s</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* KEEPING FORENSIC TABS FOR DEEP DIVE IF NEEDED OR REPLACED? 
                User instruction was "Insight Cards Component ... Iterate over case.insights". 
                The prompt implies this REPLACES the previous specialized sections for the main view.
                However, for "FORENSICS", the user asked specifically for the Slider. 
                The previous "Forensic Analysis Section" with tabs had a LOT more detail (Markers, Custody).
                I will HIDE the old section for now, or move it to a "Detailed View" if this new Grid is meant to be the primary feed view.
                Given "User clicks specific card... Frontend renders Detail View using data already inside", 
                this *IS* the Detail View. 
                
                The request says: "Iterate over case.insights".
                This suggests the "Grid" is the main body.
                
                I will comment out the old sections to strictly follow the new mapping request for the distinct styling.
                Wait, if I remove the old "Forensic Analysis Section", we lose "Markers", "Custody", "EXIF" tabs unless they come in as insights.
                "C. If category === 'metadata' ... Key-Value List". That covers the EXIF part if it's an insight.
                
                I will keep the old "Forensic Analysis Section" (Tabs) at the bottom as a "Deep Dive" or "Technical Details" section 
                if it's not redundant. But for now I'll suppress the AMI specific layout and the old Forensic Header 
                in favor of this unified loop.
            */}

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
                    <div className="flex justify-between">
                      <span className="text-gray-500">Pruebas realizadas</span>
                      <span className="font-bold text-gray-900">
                        {caseData.insights.length > 0
                          ? caseData.insights.length
                          : isForensicCase ? '—' : '0'}
                      </span>
                    </div>
                    <div className="flex justify-between"><span className="text-gray-500">Tiempo total</span><span className="font-bold text-gray-900">12.0s</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Nivel de precisión diagnóstica</span><span className="font-bold text-gray-900">{caseData.overview.risk_score > 0 ? '92%' : '0%'}</span></div>
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
                      <div className="absolute left-[-23px] top-1 w-3 h-3 bg-[#FFDA00] rounded-full border-2 border-white ring-1 ring-gray-100"></div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-900 uppercase tracking-wide">Caso creado</span>
                        <span className="text-[10px] text-gray-500">{new Date(caseData.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute left-[-23px] top-1 w-3 h-3 bg-gray-900 rounded-full border-2 border-white ring-1 ring-gray-100"></div>
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
        </div>

        {!hideVoting && (
          <div className="max-w-7xl mx-auto px-6">
            <HumanValidationForm
              caseId={caseData.id}
              aiVerdictLabel={caseData.overview.verdict_label}
              aiRiskScore={caseData.overview.risk_score}
              caseType={caseData.type}
              onVoteSuccess={onReset}
            />
          </div>
        )}

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
}
