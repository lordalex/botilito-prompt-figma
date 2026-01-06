import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, XCircle, ShieldCheck, ShieldAlert } from 'lucide-react';

interface AudioVerdict {
    conclusion: string;
    confidence: number;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
}

interface Props {
    verdict: AudioVerdict;
    authenticityScore?: number;
    manipulationDetected?: boolean;
}

export function AudioAnalysisSummary({ verdict, authenticityScore, manipulationDetected }: Props) {
    if (!verdict) return null;

    // Use authenticity score if available, otherwise derive from confidence and risk
    let riskScore = 0;
    if (authenticityScore !== undefined) {
        // Authenticity is inverse of risk (high authenticity = low risk)
        riskScore = (1 - authenticityScore) * 100;
    } else {
        // Derive from risk level and confidence
        const riskLevelMap = { low: 20, medium: 50, high: 75, critical: 95 };
        riskScore = riskLevelMap[verdict.risk_level] * verdict.confidence;
    }

    // Override if manipulation explicitly detected
    if (manipulationDetected) {
        riskScore = Math.max(riskScore, 70);
    }

    const isSafe = riskScore < 30;
    const isMedium = riskScore >= 30 && riskScore < 70;

    const borderColor = isSafe ? 'border-green-500' : isMedium ? 'border-yellow-500' : 'border-red-500';
    const textColor = isSafe ? 'text-green-600' : isMedium ? 'text-yellow-600' : 'text-red-600';
    const bgColor = isSafe ? 'bg-green-50' : isMedium ? 'bg-yellow-50' : 'bg-red-50';
    const progressColor = isSafe ? 'bg-green-500' : isMedium ? 'bg-yellow-500' : 'bg-red-500';

    // Determine label based on risk
    const getVerdictLabel = () => {
        if (manipulationDetected) return 'Manipulación Detectada';
        if (riskScore < 30) return 'Auténtico';
        if (riskScore < 50) return 'Posible Edición';
        if (riskScore < 70) return 'Cuestionable';
        return 'Sintético / Manipulado';
    };

    // Get verdict type for display
    const getVerdictType = () => {
        if (manipulationDetected || riskScore >= 70) return 'Sintético (IA)';
        if (riskScore >= 50) return 'Cuestionable';
        if (riskScore >= 30) return 'Inconcluso';
        return 'Auténtico';
    };

    return (
        <Card className={`border-2 ${borderColor} ${bgColor} overflow-hidden`}>
            <CardContent className="p-6 flex flex-col md:flex-row gap-8 items-start md:items-center">
                {/* Circle Score - Left aligned on desktop */}
                <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center mx-auto md:mx-0">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="64"
                            cy="64"
                            r="56"
                            fill="transparent"
                            stroke="currentColor"
                            className="text-gray-200"
                            strokeWidth="10"
                        />
                        <circle
                            cx="64"
                            cy="64"
                            r="56"
                            fill="transparent"
                            stroke="currentColor"
                            className={textColor}
                            strokeWidth="10"
                            strokeDasharray={351.86}
                            strokeDashoffset={351.86 - (351.86 * (verdict.confidence * 100)) / 100}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
                        <span className={`text-3xl font-bold ${textColor}`}>{Math.round(verdict.confidence * 100)}%</span>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Confianza</span>
                    </div>
                </div>

                {/* Content - Right / Expanded */}
                <div className="flex-1 w-full space-y-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            {isSafe ?
                                <ShieldCheck className="text-green-600 w-5 h-5" /> :
                                <ShieldAlert className="text-red-600 w-5 h-5" />
                            }
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">Diagnóstico</h3>
                            <span className={`text-sm font-medium ${textColor}`}>
                                {getVerdictType()}
                            </span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed mt-2">
                            {verdict.conclusion}
                        </p>
                    </div>

                    <div className="pt-2">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                            <span className="flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5" />
                                Puntuación de Riesgo
                            </span>
                            <span className={textColor}>{Math.round(riskScore)}/100</span>
                        </div>
                        <Progress value={riskScore} className={`h-2.5 rounded-full bg-gray-200 [&>div]:${progressColor}`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
