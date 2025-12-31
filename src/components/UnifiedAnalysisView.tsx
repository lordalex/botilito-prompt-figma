import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Loader2, Bot, Users, CheckCircle, AlertTriangle, XCircle, ArrowLeft, Image as ImageIcon, Video, Volume2, FileText, Link2, Tag, Clock, MapPin, User, Zap, Search, Shield, Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import botilitoMascot from '@/assets/botilito-mascot.png';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { TextAIAnalysis } from './TextAIAnalysis';
import { ImageAIAnalysis } from './ImageAIAnalysis';
import { AudioAIAnalysis } from './AudioAIAnalysis';
import { HumanDiagnosisTab } from './HumanDiagnosisTab';
import { CaseDiagnosisForm } from './CaseDiagnosisForm';
import { TestResults } from './image-analysis/TestResults';
import { AudioTestResults } from './audio-analysis/AudioTestResults';
import { VisualizationsTab } from './image-analysis/VisualizationsTab';
import { AnalysisSidebarMetadata } from './analysis-shared/AnalysisSidebarMetadata';
import { AnalysisSidebarStats } from './analysis-shared/AnalysisSidebarStats';
import { AnalysisSidebarRecommendations } from './analysis-shared/AnalysisSidebarRecommendations';
import { AnalysisSidebarVotes } from './analysis-shared/AnalysisSidebarVotes';
import { AnalysisVerdictCards } from './analysis-shared/AnalysisVerdictCards';
import { AnalysisSidebarCaseInfo } from './analysis-shared/AnalysisSidebarCaseInfo';
import { AnalysisSidebarChainOfCustody } from './analysis-shared/AnalysisSidebarChainOfCustody';
import { useAnalysisSidebarData } from '@/hooks/useAnalysisSidebarData';




interface UnifiedAnalysisViewProps {
    data: any;
    contentType: 'text' | 'image' | 'audio';
    onReset: () => void;
    onSubmitDiagnosis: (diagnosis: any) => void;
    isSubmittingDiagnosis?: boolean;
    // Shared metadata
    caseNumber?: string;
    timestamp?: string;
    reportedBy?: string;
    title?: string;
    screenshot?: string;
    mode?: 'ai' | 'human';
    // Loading State
    isLoading?: boolean;
    progress?: { step: string; status: string; percent?: number };
}

export function UnifiedAnalysisView({
    data,
    contentType,
    onReset,
    onSubmitDiagnosis,
    isSubmittingDiagnosis = false,
    caseNumber,
    timestamp,
    reportedBy,
    title,
    screenshot,
    mode = 'ai',
    isLoading,
    progress
}: UnifiedAnalysisViewProps) {

    // Handle Loading State Internally
    if (isLoading) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="text-center space-y-2 pt-12">
                    <h1 className="flex items-center justify-center space-x-3 text-xl font-semibold">
                        <Bot className="h-8 w-8 text-primary animate-pulse" />
                        <span>Análisis IA en progreso...</span>
                    </h1>
                    <p className="text-muted-foreground">
                        Botilito está procesando tu contenido.
                    </p>
                </div>
                <div className="max-w-md mx-auto">
                    <Card className="border-2 border-primary/10 shadow-lg rounded-md">
                        <CardHeader>
                            <CardTitle className="text-center text-lg">Estado del Análisis</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-medium">
                                    <span>Etapa: {progress?.step || 'Iniciando...'}</span>
                                    <span className="text-primary">{progress?.percent || 0}%</span>
                                </div>
                                <Progress value={progress?.percent || (progress?.status === 'completed' ? 100 : 10)} className="h-2" />
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                                <p className="text-xs text-slate-500 italic flex items-center justify-center gap-2">
                                    {progress?.status === 'processing' && <Loader2 className="h-3 w-3 animate-spin" />}
                                    {progress?.status || 'Preparando motores...'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const {
        metadataProps,
        statsProps,
        recommendations,
        communityVotes,
        showVotes,
        caseInfoProps,
        chainOfCustodyEvents
    } = useAnalysisSidebarData({ data, contentType, mode });


    // Forensic mode detection and state
    const isForensic = contentType === 'image' || contentType === 'audio';
    const [forensicTab, setForensicTab] = useState<'pruebas' | 'evidencias'>('pruebas');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Get all available images from forensic data (all_documents + related_documents)
    const getAvailableImages = () => {
        if (contentType !== 'image') return [];

        const images: string[] = [];

        // Get images from all_documents
        const allDocs = data?.raw?.all_documents || [];
        allDocs.forEach((doc: any) => {
            const details = doc?.result?.details || [];
            details.forEach((detail: any) => {
                if (detail.original_frame) {
                    images.push(detail.original_frame);
                }
            });
        });

        // Also get from related_documents if available
        const relatedDocs = data?.raw?.related_documents || [];
        relatedDocs.forEach((doc: any) => {
            const details = doc?.result?.details || [];
            details.forEach((detail: any) => {
                if (detail.original_frame) {
                    images.push(detail.original_frame);
                }
            });
        });

        return images;
    };

    const availableImages = getAvailableImages();

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? availableImages.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev === availableImages.length - 1 ? 0 : prev + 1));
    };

    // Helper: Get forensic verdict info from data
    const getForensicVerdictInfo = () => {
        // [NEW] Support for StandardizedCase
        if (data?.standardized_case || data?.overview) {
            const std = data?.standardized_case || data;
            const confidence = std.overview?.risk_score || 0;
            const verdict = std.overview?.verdict_label || 'PENDING';
            // Logic for warning based on score or verdict
            const isWarning = confidence < 60 || (verdict && (verdict.includes('Manipulado') || verdict.includes('Generado') || verdict.includes('Requiere')));

            return {
                verdict,
                confidence,
                isWarning,
                description: isWarning ? 'Se detectaron posibles manipulaciones.' : 'No se detectaron alteraciones significativas.'
            };
        }

        if (contentType === 'image') {
            const verdict = data?.summary?.global_verdict || data?.human_report?.verdict || 'PENDING';
            const confidence = data?.summary?.manipulation_probability || data?.human_report?.manipulation_probability || 0;
            // Legacy warning logic
            const isWarning = (confidence * 100) > 50 || (verdict && !verdict.includes('Authentic'));
            return {
                verdict,
                confidence,
                isWarning,
                description: isWarning ? 'Posible manipulación detectada en la imagen.' : 'Imagen auténtica según análisis forense.'
            };
        }
        if (contentType === 'audio') {
            const verdict = data?.human_report?.verdict || 'PENDING';
            const confidence = data?.human_report?.audio_forensics?.authenticity_score || 0;
            // Legacy warning logic
            const isWarning = (confidence * 100) < 50 || (verdict && (verdict.includes('Fake') || verdict.includes('Cloned')));
            return {
                verdict,
                confidence: confidence * 100,
                isWarning,
                description: isWarning ? 'Posible manipulación o clonación de voz detectada.' : 'Audio auténtico según análisis forense.'
            };
        }
        return {
            verdict: 'PENDING',
            confidence: 0,
            isWarning: false,
            description: 'Análisis pendiente.'
        };
    };

    // Helper: Get colors based on verdict
    const getForensicColors = (verdict: string) => {
        const v = verdict?.toUpperCase() || '';
        // Add Spanish checks for standardized verdict labels
        if (v.includes('AUTHENTIC') || v.includes('CLEAN') || v === 'ORIGINAL_VERIFICADO' || v.includes('SIN ALTERACIONES') || v.includes('CUMPLE')) {
            return { border: 'border-green-500', bg: 'bg-green-50', text: 'text-green-600', badgeBg: 'bg-green-100' };
        }
        if (v.includes('MANIPULATED') || v.includes('MANIPULADO') || v.includes('REQUIERE')) {
            return { border: 'border-orange-500', bg: 'bg-orange-50', text: 'text-orange-600', badgeBg: 'bg-orange-100' };
        }
        if (v.includes('SYNTHETIC') || v.includes('SINTETICO') || v.includes('GENERADO') || v.includes('NO CUMPLE')) {
            return { border: 'border-red-500', bg: 'bg-red-50', text: 'text-red-600', badgeBg: 'bg-red-100' };
        }
        return { border: 'border-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-600', badgeBg: 'bg-yellow-100' };
    };

    // Helper: Get icon based on verdict
    const getVerdictIcon = (verdict: string) => {
        const v = verdict?.toUpperCase() || '';
        if (v.includes('AUTHENTIC') || v.includes('CLEAN') || v === 'ORIGINAL_VERIFICADO' || v.includes('SIN ALTERACIONES')) return CheckCircle;
        if (v.includes('MANIPULATED') || v.includes('MANIPULADO') || v.includes('REQUIERE')) return AlertTriangle;
        if (v.includes('SYNTHETIC') || v.includes('SINTETICO') || v.includes('GENERADO') || v.includes('NO CUMPLE')) return Bot;
        return XCircle;
    };

    // Get forensic tests from data
    const getForensicTests = () => {
        // [NEW] Support for StandardizedCase
        if (data?.standardized_case?.insights || data?.insights) {
            const insights = data?.standardized_case?.insights || data?.insights || [];
            // Filter for forensic category if needed, or just return all for visual
            return insights.filter((i: any) => i.category === 'forensics' || i.category === 'content_quality');
        }

        if (contentType === 'image') {
            return data?.details || data?.level1_analysis || [];
        }
        if (contentType === 'audio') {
            return data?.details || [];
        }
        return [];
    };

    // Helper: Extract content info from data
    const getContentInfo = () => {
        // [NEW] Support for StandardizedCase
        if (data?.standardized_case || data?.overview) {
            const std = data?.standardized_case || data;
            return {
                title: std.overview?.title || 'Contenido Analizado',
                summary: std.overview?.summary || 'Sin resumen disponible',
                tags: {
                    source: std.overview?.source_domain || 'Fuente desconocida',
                    type: std.type?.toUpperCase() || contentType.toUpperCase(),
                    theme: 'Análisis Estandarizado' // Could fetch from insights
                }
            };
        }

        // For text content
        if (contentType === 'text') {
            const classification = data?.classification || data?.ai_analysis?.classification || {};
            const amiData = classification?.indiceCumplimientoAMI || {};
            return {
                title: title || data?.title || classification?.titulo || 'Contenido analizado',
                summary: data?.summary || data?.content || classification?.resumen || 'No hay resumen disponible.',
                tags: {
                    source: classification?.tipoFuente || amiData?.tipoFuente || 'Fuente desconocida',
                    type: classification?.tipoContenido || amiData?.clasificacion || 'Hecho',
                    theme: classification?.tema || amiData?.contextoTematico || 'General'
                }
            };
        }
        // For image/audio
        return {
            title: title || data?.file_info?.filename || 'Archivo multimedia',
            summary: data?.human_report?.summary || data?.summary?.description || 'Análisis forense del archivo.',
            tags: {
                source: data?.source || 'Archivo subido',
                type: contentType.toUpperCase(),
                theme: 'Análisis Forense'
            }
        };
    };

    // Helper: Get infodemic verdict info
    const getInfodemicVerdictInfo = () => {
        // [NEW] Support for StandardizedCase
        if (data?.standardized_case || data?.overview) {
            const std = data?.standardized_case || data;
            const score = std.overview?.risk_score || 0;
            const verdict = std.overview?.verdict_label || 'Requiere un enfoque AMI';
            const isWarning = score < 60 || verdict.includes('Requiere') || verdict.includes('No cumple');
            return {
                verdict,
                confidence: score,
                isWarning,
                description: isWarning
                    ? 'El contenido presenta riesgos identificados por el análisis.'
                    : 'El contenido cumple con los parámetros analizados.'
            };
        }

        const classification = data?.classification || data?.ai_analysis?.classification || {};
        const amiData = classification?.indiceCumplimientoAMI || {};
        const score = amiData?.score || classification?.score || 0;
        const nivel = amiData?.nivel || classification?.nivel || 'Requiere un enfoque AMI';
        const isWarning = score < 70 || (typeof nivel === 'string' && nivel.toLowerCase().includes('requiere'));
        return {
            verdict: nivel,
            confidence: score,
            isWarning,
            description: amiData?.explicacion || classification?.explicacion ||
                (isWarning
                    ? 'Contenido presenta características que requieren análisis crítico profundo.'
                    : 'El contenido cumple con los criterios de Alfabetización Mediática e Informacional.')
        };
    };

    // Helper: Get human consensus info
    const getHumanConsensusInfo = () => {
        // [NEW] Support for StandardizedCase (community)
        if (data?.standardized_case?.community || data?.community) {
            const community = data?.standardized_case?.community || data?.community;
            // Mock consensus derived from votes if only integer provided
            // or check if 'status' field helps
            return {
                verdict: community?.status || 'Pendiente',
                confidence: 0, // DTO simplified
                hasVotes: (community?.votes || 0) > 0,
                description: (community?.votes || 0) > 0
                    ? `Validado por ${community.votes} miembros de la comunidad.`
                    : 'Aún no hay suficientes votos de la comunidad.'
            };
        }

        const votes = communityVotes || [];
        const hasVotes = votes.length > 0;

        // Calculate consensus from votes
        let consensusVerdict = 'Pendiente';
        let consensusPercent = 0;

        if (hasVotes) {
            const requiereVotes = votes.filter((v: any) => v.vote === 'requiere').length;
            const desarrollaVotes = votes.filter((v: any) => v.vote === 'desarrolla').length;
            const total = votes.length;

            if (requiereVotes > desarrollaVotes) {
                consensusVerdict = 'Requiere un enfoque AMI';
                consensusPercent = Math.round((requiereVotes / total) * 100);
            } else {
                consensusVerdict = 'Desarrolla las premisas AMI';
                consensusPercent = Math.round((desarrollaVotes / total) * 100);
            }
        }

        return {
            verdict: consensusVerdict,
            confidence: consensusPercent,
            hasVotes,
            description: hasVotes
                ? 'Los especialistas en AMI confirman que este contenido presenta características identificadas por el análisis automatizado.'
                : 'Aún no hay suficientes votos de la comunidad para establecer consenso.'
        };
    };

    // Helper: Get source details
    const getSourceDetails = () => {
        // [NEW] Support StandardizedCase
        if (data?.standardized_case || data?.overview) {
            const std = data?.standardized_case || data;
            return {
                what: std.overview?.summary || 'Contenido analizado',
                who: std.reporter?.name || std.overview?.source_domain || 'Fuente desconocida',
                when: std.created_at ? new Date(std.created_at).toLocaleDateString('es-CO') : (timestamp ? new Date(timestamp).toLocaleDateString('es-CO') : 'Fecha desconocida'),
                where: std.overview?.source_domain || 'Plataforma externa'
            };
        }

        const classification = data?.classification || data?.ai_analysis?.classification || {};
        const metadata = data?.metadata || {};
        return {
            what: data?.content || data?.summary || classification?.resumen || 'Contenido no disponible',
            who: classification?.tipoFuente || metadata?.source || 'Fuente desconocida',
            when: timestamp ? new Date(timestamp).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Fecha desconocida',
            where: metadata?.vector || data?.source_data?.platform || 'WhatsApp, Facebook, Twitter'
        };
    };

    const renderAIAnalysis = () => {
        switch (contentType) {
            case 'text':
                return <TextAIAnalysis
                    data={data}
                    title={title}
                    screenshot={screenshot || data?.metadata?.screenshot || data?.standardized_case?.overview?.main_asset_url || data?.overview?.main_asset_url || data?.mainAssetUrl}
                />;
            case 'image':
                return <ImageAIAnalysis data={data} />;
            case 'audio':
                return <AudioAIAnalysis data={data} />;
            default:
                return null;
        }
    };

    const renderVisualContext = () => {
        let visualUrl = null;
        let isAudio = false;

        if (contentType === 'text') {
            visualUrl = data?.source_data?.screenshot || screenshot;
        } else if (contentType === 'image') {
            visualUrl = data?.local_image_url || data?.file_info?.url;
        } else if (contentType === 'audio') {
            visualUrl = data?.local_audio_url || data?.file_info?.url;
            isAudio = true;
        }

        if (!visualUrl) return null;

        return (
            <div className="mb-8 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm bg-slate-50 relative group">
                {isAudio ? (
                    <div className="p-8 flex flex-col items-center justify-center gap-4 bg-slate-100/50">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 22h.5c.5 0 1-.2 1.4-.6.4-.4.6-.9.6-1.4V7.5L14.5 2H6c-.5 0-1 .2-1.4.6C4.2 3 4 3.5 4 4v3" /><polyline points="14 2 14 8 20 8" /><path d="M10 20v-1a2 2 0 1 1 4 0v1a2 2 0 1 1-4 0Z" /><path d="M6 20v-1a2 2 0 1 0-4 0v1a2 2 0 1 0 4 0Z" /><path d="M2 19v-3a6 6 0 0 1 12 0v3" /></svg>
                        </div>
                        <audio controls className="w-full max-w-md custom-audio-player" src={visualUrl} />
                        <p className="text-xs text-slate-400 font-mono mt-2">AUDIO DE PRUEBA</p>
                    </div>
                ) : (
                    <div className="relative">
                        <img
                            src={visualUrl}
                            alt="Visual Context"
                            className="w-full h-auto max-h-[400px] object-cover object-top hover:object-contain transition-all duration-500 cursor-zoom-in bg-slate-200"
                        />
                        <Badge className="absolute bottom-4 right-4 bg-black/70 hover:bg-black/80 text-white backdrop-blur-sm shadow-lg pointer-events-none">
                            {contentType === 'text' ? 'CAPTURA DE FUENTE' : 'IMAGEN ORIGINAL'}
                        </Badge>
                    </div>
                )}
            </div>
        );
    };




    // Get all derived data
    const contentInfo = getContentInfo();
    const aiVerdictInfo = contentType === 'text' ? getInfodemicVerdictInfo() : getForensicVerdictInfo();
    const humanConsensus = getHumanConsensusInfo();
    const sourceDetails = getSourceDetails();
    const forensicTests = getForensicTests();

    // Colors based on verdict
    const isWarning = aiVerdictInfo.isWarning || aiVerdictInfo.confidence < 70;

    // Updated to match Figma (Rose/Red for warning, Emerald for success)
    const verdictColors = isWarning
        ? {
            border: 'border-rose-200',
            bg: 'bg-rose-50',
            text: 'text-rose-600',
            badgeBg: 'bg-rose-500 text-white',
            progress: 'bg-rose-500'
        }
        : {
            border: 'border-emerald-200',
            bg: 'bg-emerald-50',
            text: 'text-emerald-600',
            badgeBg: 'bg-emerald-500 text-white',
            progress: 'bg-emerald-500'
        };

    // Get visual URL for preview
    const getVisualUrl = () => {
        if (contentType === 'text') {
            return data?.standardized_case?.overview?.main_asset_url ||
                data?.overview?.main_asset_url ||
                data?.metadata?.screenshotUrl ||
                data?.source_data?.screenshot ||
                screenshot;
        }
        if (contentType === 'image') {
            // Try to get from forensic structure first (all_documents)
            if (availableImages.length > 0) {
                return availableImages[currentImageIndex];
            }
            // Fallback to old structure
            return data?.local_image_url || data?.file_info?.url;
        }
        if (contentType === 'audio') return data?.local_audio_url || data?.file_info?.url;
        return null;
    };
    const visualUrl = getVisualUrl();

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:pt-5 space-y-6" >
            {/* ========== BOTILITO BANNER ========== */}
            < div className="bg-[#ffe97a] border-2 border-[#ffda00] rounded-lg p-4 shadow-lg mb-6" >
                <div className="flex items-center space-x-4">
                    <img
                        src={botilitoMascot}
                        alt="Botilito"
                        className="w-24 h-24 object-contain"
                    />
                    <div className="flex-1">
                        <p className="text-xl">
                            ¡Qué más parce! Este es el análisis AMI completo 📰🎓
                        </p>
                        <p className="text-sm mt-1 opacity-80">
                            Contenido analizado desde la perspectiva de Alfabetización Mediática e Informacional. ¡Desarrolla tus competencias críticas! 💡
                        </p>
                    </div>
                </div>
            </div >

            {/* ========== BACK BUTTON ========== */}
            < Button variant="ghost" onClick={onReset} className="text-gray-600 hover:text-black" >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al listado
            </Button >

            {/* ========== MAIN GRID: 70% / 30% ========== */}
            < div className="flex gap-6" >

                {/* ========== LEFT COLUMN (70%) ========== */}
                < div className="flex-1 min-w-0 space-y-6" >

                    {/* IMAGE/AUDIO PREVIEW - Figma: Dark card with rounded-full badge */}
                    {
                        visualUrl && (
                            <Card className="border-2 border-black bg-[#0a0e1a] rounded-md relative overflow-hidden">

                                {contentType === 'audio' ? (
                                    <div className="relative w-full bg-gray-900 p-8 flex flex-col items-center justify-center">
                                        {/* Badge for audio */}
                                        <div className="absolute top-4 left-6 bg-black/80 text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-2 backdrop-blur-sm z-30">
                                            <FileText className="h-4 w-4" />
                                            Audio Original
                                        </div>
                                        <div className="w-20 h-20 rounded-full bg-[#ffda00] flex items-center justify-center mb-4">
                                            <Volume2 className="h-10 w-10 text-black" />
                                        </div>
                                        <audio controls className="w-full max-w-md" src={visualUrl} />
                                    </div>
                                ) : (
                                    <div className="relative w-full bg-gray-900 h-[500px] flex items-end justify-center py-12 px-8">
                                        {/* Badge for image */}
                                        <div className="absolute top-4 left-2 bg-black/80 text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-2 backdrop-blur-sm z-30">
                                            <FileText className="h-4 w-4" />
                                            Imagen Original
                                        </div>

                                        <img
                                            src={visualUrl}
                                            alt="Captura Original"
                                            className="max-w-full max-h-[500px] w-auto h-auto object-contain"
                                        />

                                        {/* Navigation arrows for multiple images */}
                                        {availableImages.length > 1 && (
                                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 mb-2">
                                                <button
                                                    className="text-white bg-black/80 hover:bg-black/95 rounded-full h-12 w-12 flex items-center justify-center transition-colors shadow-lg backdrop-blur-sm"
                                                    onClick={handlePrevImage}
                                                    type="button"
                                                >
                                                    <ChevronLeft className="h-7 w-7" />
                                                </button>
                                                <div className="bg-black/80 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm font-medium shadow-lg">
                                                    {currentImageIndex + 1} / {availableImages.length}
                                                </div>
                                                <button
                                                    className="text-white bg-black/80 hover:bg-black/95 rounded-full h-12 w-12 flex items-center justify-center transition-colors shadow-lg backdrop-blur-sm"
                                                    onClick={handleNextImage}
                                                    type="button"
                                                >
                                                    <ChevronRight className="h-7 w-7" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Card>
                        )
                    }

                    {/* CONTENT INFO SECTION - Figma: Card with explicit font sizes */}
                    <Card className="border border-[#e5e7eb] bg-white rounded-md">
                        <CardContent className="p-6">
                            {/* Titular */}
                            <div className="mb-4 pb-4 border-b border-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText className="h-4 w-4 text-[#6b7280]" />
                                    <span className="text-[14px] leading-[20px] text-[#4a5565]">Titular</span>
                                </div>
                                <h2 className="text-[20px] leading-[30px] text-black font-medium">
                                    {contentInfo.title}
                                </h2>
                            </div>

                            {/* Contenido Analizado */}
                            <div className="flex items-center gap-2 mb-3">
                                <FileText className="h-4 w-4 text-[#6b7280]" />
                                <span className="text-[14px] leading-[20px] text-[#4a5565]">Contenido Analizado</span>
                            </div>
                            <p className="text-[14px] leading-[24px] text-[#1f2937]">
                                {contentInfo.summary}
                            </p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
                                <Badge variant="outline" className="bg-red-50 border-red-200 text-red-700 text-[12px]">
                                    <Flame className="h-3 w-3 mr-1" />
                                    Fuente: {contentInfo.tags.source}
                                </Badge>
                                <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 text-[12px]">
                                    Tipo: {contentInfo.tags.type}
                                </Badge>
                                <Badge variant="outline" className="bg-gray-50 border-gray-200 text-gray-700 text-[12px]">
                                    <Tag className="h-3 w-3 mr-1" />
                                    Tema: {contentInfo.tags.theme}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* TWO DIAGNOSIS CARDS - Figma: 36px percentage, font-normal */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Card 1: AI Diagnosis (Diagnóstico Infodémico) */}
                        <Card className={`border-2 ${verdictColors.border} ${verdictColors.bg} rounded-xl shadow-sm`}>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-gray-100">
                                            <AlertTriangle className={`h-6 w-6 ${verdictColors.text}`} />
                                        </div>
                                        <div>
                                            <h3 className="text-[18px] font-semibold text-gray-900 mb-2 leading-tight">
                                                Diagnóstico Infodémico
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge variant="secondary" className="bg-gray-200/80 text-gray-700 text-[11px] font-medium border-0">
                                                    Análisis IA
                                                </Badge>
                                                <Badge className={`text-[11px] font-medium border-0 ${verdictColors.badgeBg}`}>
                                                    {aiVerdictInfo.verdict}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0 ml-2">
                                        <div className={`text-[42px] leading-none font-bold tracking-tight ${verdictColors.text}`}>
                                            {Math.round(aiVerdictInfo.confidence)}%
                                        </div>
                                        <div className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold mt-1">Precisión</div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-black/5">
                                    <p className="text-[13px] leading-relaxed text-gray-700 font-medium">
                                        {aiVerdictInfo.description}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Card 2: Human Consensus (Análisis Humano) */}
                        <Card className={`border-2 ${verdictColors.border} ${verdictColors.bg} rounded-xl shadow-sm`}>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-gray-100">
                                            <Users className={`h-6 w-6 ${verdictColors.text}`} />
                                        </div>
                                        <div>
                                            <h3 className="text-[18px] font-semibold text-gray-900 mb-2 leading-tight">
                                                Análisis Humano
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge variant="secondary" className="bg-gray-200/80 text-gray-700 text-[11px] font-medium border-0">
                                                    Análisis Humano
                                                </Badge>
                                                <Badge className={`text-[11px] font-medium border-0 ${humanConsensus.hasVotes ? verdictColors.badgeBg : 'bg-gray-300 text-gray-600'}`}>
                                                    {humanConsensus.verdict}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0 ml-2">
                                        <div className={`text-[42px] leading-none font-bold tracking-tight ${humanConsensus.hasVotes ? verdictColors.text : 'text-gray-400'}`}>
                                            {humanConsensus.hasVotes ? `${humanConsensus.confidence}%` : '--%'}
                                        </div>
                                        <div className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold mt-1">Consenso</div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-black/5">
                                    <p className="text-[13px] leading-relaxed text-gray-700 font-medium">
                                        {humanConsensus.description}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* AMI ANALYSIS SECTION - Figma: Full card with colored sub-sections */}
                    <Card className="border border-[#e5e7eb] bg-white rounded-md">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-primary" />
                                <span className="text-[18px] leading-[24px] font-normal text-black">
                                    Análisis con enfoque en Alfabetización Mediática e Informacional (AMI)
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 pt-0">
                            <div className="space-y-6">

                                {/* 1. Resumen del Contenido (Qué, Quién, Cuándo, Dónde) */}
                                <div className="bg-gray-50 border border-gray-200 rounded-[8px] p-4">
                                    <h4 className="text-[14px] font-medium text-black mb-3">
                                        📋 Resumen del Contenido
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-2">
                                            <span className="text-[12px] font-medium text-gray-600 min-w-[60px]">Qué:</span>
                                            <p className="text-[13px] leading-[20px] text-gray-700 flex-1">
                                                {sourceDetails.what}
                                            </p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-[12px] font-medium text-gray-600 min-w-[60px]">Quién:</span>
                                            <p className="text-[13px] leading-[20px] text-gray-700 flex-1">
                                                {sourceDetails.who}
                                            </p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-[12px] font-medium text-gray-600 min-w-[60px]">Cuándo:</span>
                                            <p className="text-[13px] leading-[20px] text-gray-700 flex-1">
                                                {sourceDetails.when}
                                            </p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-[12px] font-medium text-gray-600 min-w-[60px]">Dónde:</span>
                                            <p className="text-[13px] leading-[20px] text-gray-700 flex-1">
                                                {sourceDetails.where}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Análisis de Fuentes y Datos */}
                                <div className="bg-blue-50 border border-blue-200 rounded-[8px] p-4">
                                    <h4 className="text-[14px] font-medium text-black mb-2 flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-blue-600" />
                                        Análisis de Fuentes y Datos
                                    </h4>
                                    <p className="text-[13px] leading-[20px] text-gray-700">
                                        El contenido proviene de fuentes que requieren verificación adicional. Se recomienda contrastar con medios verificados y fuentes oficiales.
                                    </p>
                                </div>

                                {/* 3. Alerta: Titular vs Contenido (Clickbait) */}
                                <div className={`border-2 rounded-[8px] p-4 ${isWarning ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                                    <h4 className="text-[14px] font-medium text-black mb-2 flex items-center gap-2">
                                        <AlertTriangle className={`h-4 w-4 ${isWarning ? 'text-red-600' : 'text-green-600'}`} />
                                        Alerta: Titular vs. Contenido
                                    </h4>
                                    <p className="text-[13px] leading-[20px] text-gray-700">
                                        {isWarning
                                            ? '⚠️ El titular presenta características de clickbait o sensacionalismo que no corresponden completamente con el contenido real.'
                                            : '✓ El titular es coherente con el contenido presentado.'}
                                    </p>
                                </div>

                                {/* 4. Competencias AMI Recomendadas */}
                                <div className="bg-green-50 border border-green-200 rounded-[8px] p-4">
                                    <h4 className="text-[14px] font-medium text-black mb-3 flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        Competencias AMI Recomendadas:
                                    </h4>
                                    <div className="space-y-2">
                                        {[
                                            'Acceso a la información: Identificar y acceder a fuentes confiables y verificables',
                                            'Evaluación crítica: Analizar la credibilidad de las fuentes y la veracidad del contenido',
                                            'Comprensión del contexto: Entender el contexto histórico, social y político de la información',
                                            'Producción responsable: Compartir información verificada y evitar la propagación de desinformación'
                                        ].map((competencia, index) => {
                                            const colonIndex = competencia.indexOf(':');
                                            const beforeColon = colonIndex !== -1 ? competencia.substring(0, colonIndex) : competencia;
                                            const afterColon = colonIndex !== -1 ? competencia.substring(colonIndex) : '';

                                            return (
                                                <div key={index} className="flex items-start gap-2 p-3 rounded-[6px]">
                                                    <div className="w-5 h-5 rounded-full bg-[#ffda00] flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <span className="text-[10px] text-black font-medium">{index + 1}</span>
                                                    </div>
                                                    <p className="text-[13px] leading-[20px] text-gray-700">
                                                        <span className="font-semibold">{beforeColon}</span>{afterColon}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                            </div>
                        </CardContent>
                    </Card>
                </div >

                {/* ========== RIGHT COLUMN - SIDEBAR (30%) ========== */}
                < div className="w-[320px] flex-shrink-0 space-y-4 sticky top-8" >
                    <AnalysisSidebarCaseInfo {...caseInfoProps} />
                    <AnalysisSidebarStats stats={statsProps.length > 0 ? statsProps : [
                        { label: 'Pruebas realizadas', value: '1' },
                        { label: 'Tiempo total', value: '12.0s' },
                        { label: 'Nivel de precisión diagnóstica', value: `${Math.round((data?.ai_analysis?.confidence || data?.confidence || 0) * 100)}%` }
                    ]} />
                    <AnalysisSidebarChainOfCustody events={chainOfCustodyEvents} />
                    <AnalysisSidebarRecommendations recommendations={recommendations} />
                </div >
            </div >

            {/* ========== VALIDATION PANEL (Full Width) ========== */}
            < div className="mt-8" >
                <CaseDiagnosisForm
                    caseId={caseInfoProps.caseNumber || caseNumber || 'new'}
                    aiAnalysis={data?.ai_analysis || data}
                    initialMarkers={[]}
                    onBack={onReset}
                    onSubmit={onSubmitDiagnosis}
                    isSubmitting={isSubmittingDiagnosis}
                />
            </div >

            {/* ========== FOOTER ========== */}
            < div className="text-center pb-8 pt-4" >
                <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">
                    Botilito Intelligence Ecosystem • {new Date().getFullYear()}
                </p>
            </div >
        </div >
    );
}

