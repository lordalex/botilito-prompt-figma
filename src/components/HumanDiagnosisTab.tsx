import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Info, Users, Bot, User, CheckCircle, Clock } from 'lucide-react';
import { CaseDiagnosisForm } from './CaseDiagnosisForm';

interface HumanDiagnosisTabProps {
    data: any;
    contentType: 'text' | 'image' | 'audio';
    onSubmitDiagnosis: (diagnosis: any) => void;
    isSubmitting: boolean;
}

export function HumanDiagnosisTab({
    data,
    contentType,
    onSubmitDiagnosis,
    isSubmitting
}: HumanDiagnosisTabProps) {

    // Extract AI summary findings for the "additive" design
    const getAISummary = () => {
        if (contentType === 'text') {
            const score = data?.ai_analysis?.classification?.indiceCumplimientoAMI?.score;
            const nivel = data?.ai_analysis?.classification?.indiceCumplimientoAMI?.nivel;
            return (
                <div className="flex items-center gap-4 bg-primary/5 p-4 rounded-xl border border-primary/10">
                    <div className="bg-white p-3 rounded-full border-2 border-primary/20 shadow-sm">
                        <span className="text-2xl font-bold text-primary">{score || '??'}</span>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-primary/80 uppercase tracking-wider">PUNTUACIÓN ICA (IA)</p>
                        <p className="text-base font-bold">{nivel || 'Análisis no disponible'}</p>
                    </div>
                </div>
            );
        }
        // For Image/Audio
        const verdict = data?.human_report?.level_3_verdict?.final_label || data?.human_report?.verdict?.conclusion;
        return (
            <div className="flex items-center gap-4 bg-primary/5 p-4 rounded-xl border border-primary/10">
                <div className="bg-white p-3 rounded-full border-2 border-primary/20 shadow-sm">
                    <Bot className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-primary/80 uppercase tracking-wider">VEREDICTO IA</p>
                    <p className="text-base font-bold">{verdict || 'Análisis forense completado'}</p>
                </div>
            </div>
        );
    };

    const votes = data?.human_votes?.entries || [];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Context Section: AI Findings Narrative */}
            <Card className="border-2 border-primary/5 shadow-sm overflow-hidden rounded-3xl group">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-5 px-6">
                    <CardTitle className="text-base font-black flex items-center gap-2 text-slate-800 uppercase tracking-widest">
                        <Bot className="h-5 w-5 text-primary" />
                        Contexto del Análisis de IA
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-4">
                            <div className="flex items-center gap-4">
                                {getAISummary()}
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed font-medium italic border-l-4 border-primary/10 pl-4 py-1">
                                {contentType === 'text'
                                    ? "Este análisis de Botilito sirve como punto de partida para tu diagnóstico humano. Valida si los criterios AMI corresponden a la intención del autor."
                                    : "Los marcadores forenses detectados por la IA deben ser validados mediante inspección humana para descartar falsos positivos."}
                            </p>
                        </div>
                        <div className="bg-[#FFFCE8] p-5 rounded-2xl border-2 border-yellow-200/50 shadow-inner flex flex-col justify-center">
                            <h4 className="text-[10px] font-black mb-3 flex items-center gap-2 text-amber-900 uppercase tracking-tighter opacity-60">
                                <Info className="h-3 w-3" />
                                Nota para el Experto
                            </h4>
                            <p className="text-xs font-bold text-amber-900/80 leading-relaxed">
                                Tu diagnóstico final es lo que determinará la etiqueta pública de este contenido en el ecosistema.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Diagnosis Form */}
            <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 p-2 shadow-sm">
                <CaseDiagnosisForm
                    caseId={data?.id || 'new'}
                    initialMarkers={data?.ai_analysis?.classification?.indiceCumplimientoAMI?.score < 60 ? ['falso'] : []}
                    onBack={() => { }} // Not needed in tab view
                    onSubmit={onSubmitDiagnosis}
                    isSubmitting={isSubmitting}
                />
            </div>
        </div>
    );
}

