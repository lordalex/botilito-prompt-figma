import React, { useMemo } from 'react';
import { Badge } from '../ui/badge';
import { BookOpen, Bot, ShieldAlert, CheckCircle, HelpCircle } from 'lucide-react';
import { useTextAnalysisData } from '@/hooks/useTextAnalysisData';

interface AnalysisScoreBannerProps {
    data: any;
    contentType: 'text' | 'image' | 'audio';
}

export function AnalysisScoreBanner({ data, contentType }: AnalysisScoreBannerProps) {
    // 1. TEXT ANALYSIS (AMI)
    const { icoScore, diagnosticoAMI } = useTextAnalysisData(data);

    if (contentType === 'text' && icoScore) {
        return (
            <div className="w-full mb-8">
                <div className="flex items-center gap-2 mb-2 px-1">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-bold text-slate-800">Alfabetización Mediática e Informacional (AMI)</h3>
                </div>

                <div className="bg-gray-900 text-white p-6 md:p-8 rounded-[2rem] shadow-2xl border border-white/5 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden w-full">
                    {/* Background Effects */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-10 rounded-full -mr-32 -mt-32" style={{ filter: 'blur(80px)' }} />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500 opacity-5 rounded-full -ml-32 -mb-32" style={{ filter: 'blur(80px)' }} />

                    {/* Circular Score */}
                    <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full transform -rotate-90 drop-shadow-xl" viewBox="0 0 144 144">
                            <circle cx="72" cy="72" r="64" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                            <circle cx="72" cy="72" r="64" stroke="currentColor" strokeWidth="12" fill="transparent"
                                strokeDasharray={402}
                                strokeDashoffset={402 - (402 * (Math.min(1, icoScore.score > 1 ? icoScore.score / 100 : icoScore.score)))}
                                className="text-primary transition-all duration-1000 ease-out"
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black tracking-tighter text-white">
                                {icoScore.percent}
                            </span>
                            <span className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em] mt-1">Puntos</span>
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 text-center md:text-left relative z-10 w-full">
                        <div className="flex flex-col md:items-start items-center">
                            <Badge variant="secondary" className={`bg-primary/20 text-primary border-primary/30 mb-3 px-3 py-1 text-xs font-bold uppercase tracking-widest w-fit`}>
                                Criterio Unificado
                            </Badge>
                            <h4 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight text-white">
                                {icoScore.percent >= 70 ? 'Desarrolla las premisas AMI' : 'Requiere un enfoque AMI'}
                            </h4>
                            <p className="text-sm md:text-base text-slate-400 leading-relaxed max-w-2xl italic">
                                "{diagnosticoAMI || 'El contenido ha sido evaluado bajo los lineamientos de Alfabetización Mediática e Informacional.'}"
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 2. IMAGE & AUDIO ANALYSIS (Verdict Based)
    if (contentType === 'image' || contentType === 'audio') {
        // Extract verdict safely
        const verdict = data?.human_report?.level_3_verdict?.final_label ||
            data?.human_report?.verdict?.conclusion ||
            data?.ai_analysis?.verdict ||
            'Análisis completado';

        const isSecure = verdict.toLowerCase().includes('verdadero') || verdict.toLowerCase().includes('auténtico');
        const isDanger = verdict.toLowerCase().includes('falso') || verdict.toLowerCase().includes('manipulado');

        return (
            <div className="w-full mb-8">
                <div className="flex items-center gap-2 mb-2 px-1">
                    <Bot className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-bold text-slate-800">Diagnóstico Forense IA</h3>
                </div>

                <div className="bg-gray-900 text-white p-6 md:p-8 rounded-[2rem] shadow-2xl border border-white/5 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden w-full">
                    {/* Background Effects */}
                    <div className={`absolute top-0 right-0 w-64 h-64 ${isSecure ? 'bg-emerald-500' : isDanger ? 'bg-red-500' : 'bg-primary'} opacity-10 rounded-full -mr-32 -mt-32`} style={{ filter: 'blur(80px)' }} />

                    {/* Icon Visualization */}
                    <div className="relative w-32 h-32 flex items-center justify-center shrink-0 bg-white/5 rounded-full border border-white/10">
                        {isSecure ? (
                            <CheckCircle className="h-16 w-16 text-emerald-400" />
                        ) : isDanger ? (
                            <ShieldAlert className="h-16 w-16 text-red-400" />
                        ) : (
                            <Bot className="h-16 w-16 text-primary" />
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 text-center md:text-left relative z-10 w-full">
                        <div className="flex flex-col md:items-start items-center">
                            <Badge variant="secondary" className={`bg-white/10 text-white border-white/20 mb-3 px-3 py-1 text-xs font-bold uppercase tracking-widest w-fit`}>
                                Veredicto Automático
                            </Badge>
                            <h4 className="text-2xl md:text-4xl font-black mb-3 tracking-tight text-white uppercase">
                                {verdict}
                            </h4>
                            <p className="text-sm md:text-base text-slate-400 leading-relaxed max-w-2xl italic">
                                "El sistema ha detectado marcadores forenses que sugieren este veredicto. Se recomienda la validación humana para confirmación final."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
