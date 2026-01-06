import React from 'react';
import { Badge } from '../ui/badge';
import { Users, Bot, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { useTextAnalysisData } from '@/hooks/useTextAnalysisData';

interface AnalysisVerdictCardsProps {
    data: any;
    contentType: 'text' | 'image' | 'audio';
    mode?: 'ai' | 'human';
}

export function AnalysisVerdictCards({ data, contentType, mode }: AnalysisVerdictCardsProps) {
    // 1. EXTRACT DATA
    const { icoScore, diagnosticoAMI } = useTextAnalysisData(data);

    // AI Data Preparation
    const aiScore = icoScore?.percent || 0;
    const aiVerdict = icoScore?.nivel || 'Análisis Completado';
    // Logic for AI "Requiere enfoque AMI" or not. 
    // Assuming high score means it's good (develops AMI) or low means it's bad (requires AMI)?
    // The previous logic was: >= 70 ? 'Desarrolla las premisas AMI' : 'Requiere un enfoque AMI'
    // But verify the data meaning. Usually 100% compliance means GOOD.
    // If compliance is low, it REQUIRES AMI approach.
    const aiRequiresAMI = aiScore < 70; // Assuming < 70 means it lacks AMI quality, so it requires it? 
    // Wait, let's stick to the simpler text map from previous banner.
    // "Desarrolla las premisas AMI" (Good) vs "Requiere un enfoque AMI" (Bad/Warning)
    const aiLabel = aiScore >= 70 ? 'Desarrolla las premisas AMI' : 'Requiere un enfoque AMI';
    const aiLabelColor = aiScore >= 70 ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200';
    const aiIcon = aiScore >= 70 ? CheckCircle : AlertTriangle;
    const aiIconColor = aiScore >= 70 ? 'text-emerald-500' : 'text-red-500';
    const aiBg = aiScore >= 70 ? 'bg-emerald-50' : 'bg-red-50';
    const aiTitleColor = aiScore >= 70 ? 'text-emerald-900' : 'text-red-900';

    // Human Data Preparation (Consensus)
    // We need to look for Human Votes or a Human Report.
    // data.human_votes might contain the votes.
    const humanVotes = data?.human_votes?.entries || [];
    const totalVotes = humanVotes.length;
    // Calculate consensus
    const agreeVotes = humanVotes.filter((v: any) => v.vote === 'agree').length;
    const disagreeVotes = humanVotes.filter((v: any) => v.vote === 'disagree').length;

    // Determine Human Consensus Score
    // If most agree with AI, the Human Score mimics AI score? Or is it a separate score?
    // The design shows "Análisis Humano 92%". If they agree, maybe it's the same score.
    // If they disagree, maybe it's the inverse?
    // Let's assume for now if they AGREE, we show the AI score as confirmed.
    // If they DISAGREE, we might show a lower score or the inverse.
    // Simple logic:
    // Consensus % = (Agree / Total) * 100 ?
    // But the image shows 92% for both.
    // Let's display the AI score for Human if consensus is 'agree'.
    // Or just show the % of agreement as the score. "92% de acuerdo".
    // The prompt says: "labels replaced by Agree/Disagree... explanation as before... format of presentation... is this".
    // Design text: "Los especialistas en AMI confirman que este contenido..."

    let humanScore = 0;
    let humanLabel = "Pendiente de Análisis";
    let humanDescription = "Aún no hay suficientes votos de la comunidad para generar un consenso.";
    let humanVariant = 'neutral'; // neutral, agree, disagree

    if (totalVotes > 0) {
        const agreePercent = (agreeVotes / totalVotes) * 100;

        if (agreePercent >= 50) {
            humanScore = aiScore; // They agree, so the score stands
            humanLabel = aiLabel; // They confirm the label
            humanDescription = "Los especialistas en AMI confirman que este contenido coincide con la evaluación automatizada.";
            humanVariant = 'agree';
        } else {
            // They disagree
            // If AI said "Requires AMI" (Bad) and Humans disagree, it means Humans think it's Good?
            // Or they disagree with the specific finding.
            humanScore = 100 - aiScore; // Invert? Or just show disagreement.
            humanLabel = aiScore >= 70 ? 'Requiere un enfoque AMI' : 'Desarrolla las premisas AMI'; // Opposite
            humanDescription = "La comunidad de expertos discrepa del análisis automatizado, sugiriendo una interpretación diferente.";
            humanVariant = 'disagree';
        }
    } else {
        // Fallback for demo/no votes
        // If mode is 'human' and we are viewing layout, maybe show placeholder or "Sin votos"
    }

    // Styles for Human Card based on consensus
    const humanBg = humanVariant === 'agree' ? aiBg : (humanVariant === 'disagree' ? 'bg-amber-50' : 'bg-slate-50');
    const humanBorder = humanVariant === 'agree' ? (aiScore >= 70 ? 'border-emerald-200' : 'border-red-200') : (humanVariant === 'disagree' ? 'border-amber-200' : 'border-slate-200');
    // ... complete styles logic

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mb-8">

            {/* 1. AI Analysis Card */}
            <div className={`relative overflow-hidden rounded-[2rem] p-6 md:p-8 border-2 ${aiScore >= 70 ? 'border-emerald-100' : 'border-red-100'} ${aiBg}`}>
                <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-2xl ${aiScore >= 70 ? 'bg-white text-emerald-600 shadow-sm' : 'bg-white text-red-600 shadow-sm'}`}>
                            <AlertTriangle className="w-8 h-8" />
                            {/* Note: Icon logic might need to adhere to specific type (Info vs Warning). Using AlertTriangle for 'Requiere AMI' is good. CheckCircle for others.*/}
                        </div>
                        <div className="flex flex-col items-end">
                            <div className={`text-4xl md:text-5xl font-black tracking-tighter ${aiScore >= 70 ? 'text-emerald-900' : 'text-red-900'}`}>
                                {aiScore}%
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Precisión</span>
                        </div>
                    </div>

                    {/* Content */}
                    <div>
                        <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="secondary" className="bg-white/60 hover:bg-white/80 text-slate-700 border-0">
                                Análisis IA
                            </Badge>
                            <Badge className={`${aiLabelColor} border shadow-none`}>
                                {aiLabel}
                            </Badge>
                        </div>
                        <h3 className={`text-xl font-bold mb-2 ${aiTitleColor}`}>
                            Diagnóstico Infodémico
                        </h3>
                        <p className="text-sm font-medium leading-relaxed opacity-80">
                            {diagnosticoAMI || "El contenido ha sido procesado por nuestros modelos de detección de patrones."}
                        </p>
                    </div>
                </div>
            </div>

            {/* 2. Human Analysis Card */}
            <div className={`relative overflow-hidden rounded-[2rem] p-6 md:p-8 border-2 bg-slate-50 border-slate-100`}>
                {/* Note: In a real app we'd style this dynamically too, assuming neutral for now if no votes */}
                <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div className="p-3 rounded-2xl bg-white text-slate-600 shadow-sm">
                            <Users className="w-8 h-8" />
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="text-4xl md:text-5xl font-black tracking-tighter text-slate-800">
                                {totalVotes > 0 ? `${Math.round(humanScore)}%` : '--'}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Consenso</span>
                        </div>
                    </div>

                    {/* Content */}
                    <div>
                        <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="secondary" className="bg-white/60 hover:bg-white/80 text-slate-700 border-0">
                                Análisis Humano
                            </Badge>
                            {totalVotes > 0 && (
                                <Badge className={`${humanVariant === 'agree' ? aiLabelColor : 'bg-amber-100 text-amber-700 border-amber-200'} border shadow-none`}>
                                    {humanLabel}
                                </Badge>
                            )}
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-slate-900">
                            Análisis Humano
                        </h3>
                        <p className="text-sm font-medium leading-relaxed opacity-80 text-slate-600">
                            {humanDescription}
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
}
