import React from 'react';
import { Badge } from './ui/badge';
import { Zap, FileText, Shield, AlertTriangle, CheckCircle, Info, Calendar, MapPin, User, Search } from 'lucide-react';
import { useTextAnalysisData } from '@/hooks/useTextAnalysisData';

interface TextAIAnalysisProps {
    data: any;
    title?: string;
    screenshot?: string;
    markersDetected?: any[];
}

export function TextAIAnalysis({ data, title, screenshot, markersDetected }: TextAIAnalysisProps) {
    // Use the hook to get consistent data extraction
    const {
        summaries,
        specificAnalysis,
        competencies,
        sourceData,
        caseData
    } = useTextAnalysisData(data);

    // Helper items for Summary Section
    const summaryItems = [
        {
            label: "Qué",
            icon: Search,
            content: summaries?.short?.text || summaries?.summary || summaries?.headline || "No disponible"
        },
        {
            label: "Quién",
            icon: User,
            content: summaries?.source || sourceData?.author || sourceData?.hostname || "Desconocido"
        },
        {
            label: "Cuándo",
            icon: Calendar,
            content: sourceData?.date ? new Date(sourceData.date).toLocaleDateString('es-CO') : "Fecha desconocida"
        },
        {
            label: "Dónde",
            icon: MapPin,
            content: summaries?.region || caseData?.vector_de_transmision || caseData?.metadata?.vector_de_transmision || "Ubicación no detectada"
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Análisis con enfoque en Alfabetización Mediática e Informacional (AMI)
                </h3>
            </div>

            {/* 1. Resumen del Contenido */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">Resumen del Contenido</h4>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {summaryItems.map((item, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline gap-2 text-sm">
                            <span className="font-bold text-slate-900 min-w-[60px]">{item.label}:</span>
                            <span className="text-slate-600 leading-relaxed text-sm md:text-sm">
                                {item.content}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. Análisis de Fuentes y Datos */}
            {specificAnalysis?.analisis_fuentes_datos && (
                <div className="bg-sky-50 border border-sky-100 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-2 w-2 rounded-full bg-sky-500" />
                        <h4 className="text-xs font-black text-sky-800 uppercase tracking-widest">Análisis de Fuentes y Datos</h4>
                    </div>
                    <p className="text-sm text-sky-900/80 leading-relaxed font-medium">
                        {specificAnalysis.analisis_fuentes_datos.analisis}
                    </p>
                </div>
            )}

            {/* 3. Alerta: Titular vs Contenido */}
            {specificAnalysis?.titular_vs_contenido && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <h4 className="text-xs font-black text-red-800 uppercase tracking-widest">Alerta: Titular vs. Contenido</h4>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-red-400">
                            <AlertTriangle className="h-3 w-3" />
                            {specificAnalysis.titular_vs_contenido.es_clickbait ?
                                "Posible Clickbait Detectado" :
                                "El titular presenta características que requieren revisión"
                            }
                        </div>
                        <p className="text-sm text-red-900/80 leading-relaxed font-medium">
                            {specificAnalysis.titular_vs_contenido.analisis}
                        </p>
                    </div>
                </div>
            )}

            {/* 4. Competencias AMI Recomendadas */}
            {competencies && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        <h4 className="text-xs font-black text-emerald-800 uppercase tracking-widest">Competencias AMI Recomendadas:</h4>
                    </div>

                    <div className="grid gap-3">
                        {/* 1. Acceso */}
                        {competencies.acceso_informacion && (
                            <div className="flex gap-3 items-start">
                                <div className="bg-emerald-200 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm mt-0.5 min-w-[20px] text-center">1</div>
                                <div className="text-xs text-emerald-900/80 leading-snug">
                                    <span className="font-bold text-emerald-900">Acceso a la información:</span> Identificar y acceder a fuentes confiables y verificables.
                                </div>
                            </div>
                        )}

                        {/* 2. Evaluación */}
                        {competencies.evaluacion_critica && (
                            <div className="flex gap-3 items-start">
                                <div className="bg-emerald-200 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm mt-0.5 min-w-[20px] text-center">2</div>
                                <div className="text-xs text-emerald-900/80 leading-snug">
                                    <span className="font-bold text-emerald-900">Evaluación crítica:</span> Analizar la credibilidad de las fuentes y la veracidad del contenido.
                                </div>
                            </div>
                        )}
                        {/* 3. Comprensión */}
                        {competencies.comprension_contexto && (
                            <div className="flex gap-3 items-start">
                                <div className="bg-emerald-200 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm mt-0.5 min-w-[20px] text-center">3</div>
                                <div className="text-xs text-emerald-900/80 leading-snug">
                                    <span className="font-bold text-emerald-900">Comprensión del contexto:</span> Entender el contexto histórico, social y político de la información.
                                </div>
                            </div>
                        )}
                        {/* 4. Producción */}
                        {competencies.produccion_responsable && (
                            <div className="flex gap-3 items-start">
                                <div className="bg-emerald-200 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm mt-0.5 min-w-[20px] text-center">4</div>
                                <div className="text-xs text-emerald-900/80 leading-snug">
                                    <span className="font-bold text-emerald-900">Producción responsable:</span> Compartir información verificada y evitar la propagación de desinformación.
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

