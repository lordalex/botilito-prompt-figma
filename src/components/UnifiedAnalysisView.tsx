import React from 'react';
import { Bot, Users } from 'lucide-react';
import { Badge } from './ui/badge';
import { TextAIAnalysis } from './TextAIAnalysis';
import { ImageAIAnalysis } from './ImageAIAnalysis';
import { AudioAIAnalysis } from './AudioAIAnalysis';
import { HumanDiagnosisTab } from './HumanDiagnosisTab';
import { AnalysisSidebarMetadata } from './analysis-shared/AnalysisSidebarMetadata';
import { AnalysisSidebarStats } from './analysis-shared/AnalysisSidebarStats';
import { AnalysisSidebarRecommendations } from './analysis-shared/AnalysisSidebarRecommendations';
import { AnalysisSidebarVotes } from './analysis-shared/AnalysisSidebarVotes';
import { AnalysisScoreBanner } from './analysis-shared/AnalysisScoreBanner';
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
    mode = 'ai'
}: UnifiedAnalysisViewProps) {

    const {
        metadataProps,
        statsProps,
        recommendations,
        communityVotes,
        showVotes
    } = useAnalysisSidebarData({ data, contentType, mode });


    const renderAIAnalysis = () => {
        switch (contentType) {
            case 'text':
                return <TextAIAnalysis data={data} title={title} screenshot={screenshot} />;
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




    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:pt-5 space-y-6">
            {/* Botilito Greeting Banner */}
            <div className="bg-[#ffe97a] border-2 border-[#ffda00] rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-center gap-4">
                <div className="bg-white p-2 rounded-full shadow-inner">
                    <Bot className="h-10 w-10 text-primary" />
                </div>
                <div>
                    <h2 className="text-lg font-bold">¡Diagnóstico completado, parcero! ⚡</h2>
                    <p className="text-sm opacity-80">He analizado el contenido con mis algoritmos de última generación. Ahora, ¡necesitamos tu ojo clínico!</p>
                </div>
            </div>

            {/* Unified Case Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border-2 border-primary/10 shadow-sm">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-900">
                        <h1 className="text-2xl font-extrabold tracking-tight">Caso: {title || 'Análisis de Contenido'}</h1>
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 ml-2 font-mono">
                            #{caseNumber || 'N/A'}
                        </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                        {timestamp && <span className="flex items-center gap-1">Fecha: {new Date(timestamp).toLocaleString('es-CO')}</span>}
                        {reportedBy && <span className="flex items-center gap-1">• Reportado por: <strong className="text-slate-700">{reportedBy}</strong></span>}
                        <span className="flex items-center gap-1">• Tipo: <strong className="text-primary">{contentType.toUpperCase()}</strong></span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onReset}
                        className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-primary transition-all hover:bg-primary/5 rounded-xl border-2 border-slate-100 hover:border-primary/20 shadow-sm"
                    >
                        Cerrar y Nuevo
                    </button>
                </div>
            </div>

            {/* Full Width Visual Context & Score Layer */}
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 delay-100">
                {/* 1. Visual Context (Screenshot/Image/Audio) - 100% Width */}
                {renderVisualContext()}

                {/* 2. Analysis Score Banner (AMI) - 100% Width */}
                <AnalysisScoreBanner data={data} contentType={contentType} />
            </div>

            {/* Main Content Area: 2-Column Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-in fade-in zoom-in-95 duration-300 delay-300">
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-8">

                    {mode === 'ai' ? (
                        renderAIAnalysis()
                    ) : (
                        <HumanDiagnosisTab
                            data={data}
                            contentType={contentType}
                            onSubmitDiagnosis={onSubmitDiagnosis}
                            isSubmitting={isSubmittingDiagnosis}
                        />
                    )}
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6 lg:sticky lg:top-8">
                    {showVotes && (
                        <AnalysisSidebarVotes votes={communityVotes} />
                    )}

                    <AnalysisSidebarMetadata
                        {...metadataProps}
                    />

                    {statsProps.length > 0 && <AnalysisSidebarStats stats={statsProps} />}

                    <AnalysisSidebarRecommendations recommendations={recommendations} />
                </div>

            </div>

            <div className="text-center pb-8 pt-4">
                <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">
                    Botilito Intelligence Ecosystem • {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
}

