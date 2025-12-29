import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Info, Users, Bot, User, CheckCircle, Clock } from 'lucide-react';
import { CaseDiagnosisForm } from './CaseDiagnosisForm';
import { TextAIAnalysis } from './TextAIAnalysis';

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

    // AI Summary is now handled by the top-level AnalysisScoreBanner
    // We only focus on the diagnosis form here

    const votes = data?.human_votes?.entries || [];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Note for Expert */}
            <div className="bg-[#FFFCE8] p-5 rounded-2xl border-2 border-yellow-200/50 shadow-inner flex flex-col justify-center mb-6">
                <h4 className="text-[10px] font-black mb-3 flex items-center gap-2 text-amber-900 uppercase tracking-tighter opacity-60">
                    <Info className="h-3 w-3" />
                    Nota para el Experto
                </h4>
                <p className="text-xs font-bold text-amber-900/80 leading-relaxed">
                    Tu diagnóstico final es lo que determinará la etiqueta pública de este contenido en el ecosistema.
                </p>
            </div>

            {/* Diagnosis Form */}
            <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 p-2 shadow-sm">
                <CaseDiagnosisForm
                    caseId={data?.id || 'new'}
                    aiAnalysis={data?.ai_analysis}
                    initialMarkers={data?.ai_analysis?.classification?.indiceCumplimientoAMI?.score < 60 ? ['falso'] : []}
                    onBack={() => { }} // Not needed in tab view
                    onSubmit={onSubmitDiagnosis}
                    isSubmitting={isSubmitting}
                />
            </div>

            {/* Detailed AI Analysis Context (AMI Section) */}
            {contentType === 'text' && (
                <div className="pt-4">
                    <TextAIAnalysis data={data} />
                </div>
            )}
        </div>
    );
}

