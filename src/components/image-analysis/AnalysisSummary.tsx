import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { AnalysisSummary as IAnalysisSummary } from '@/types/imageAnalysis';

interface Props {
    summary: IAnalysisSummary;
}

export function AnalysisSummary({ summary }: Props) {
    // Ensure strict number parsing to avoid NaN warnings
    let riskScore = Number(summary.risk_score);
    if (isNaN(riskScore)) riskScore = 0;

    const isSafe = riskScore < 30;
    const isMedium = riskScore >= 30 && riskScore < 70;

    const borderColor = isSafe ? 'border-green-500' : isMedium ? 'border-yellow-500' : 'border-red-500';
    const textColor = isSafe ? 'text-green-600' : isMedium ? 'text-yellow-600' : 'text-red-600';
    const bgColor = isSafe ? 'bg-green-50' : isMedium ? 'bg-yellow-50' : 'bg-red-50';

    return (
        <Card className={`border-2 ${borderColor} ${bgColor}`}>
            <CardContent className="p-6 flex flex-col md:flex-row gap-8 items-center">
                {/* Circle Score */}
                <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="72"
                            cy="72"
                            r="60"
                            fill="transparent"
                            stroke="#e5e7eb"
                            strokeWidth="12"
                        />
                        <circle
                            cx="72"
                            cy="72"
                            r="60"
                            fill="transparent"
                            stroke={isSafe ? "#22c55e" : isMedium ? "#eab308" : "#ef4444"}
                            strokeWidth="12"
                            strokeDasharray={376.99}
                            strokeDashoffset={376.99 - (376.99 * riskScore) / 100}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
                        <span className={`text-3xl font-bold ${textColor}`}>{riskScore}%</span>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Confianza</span>
                    </div>
                </div>

                {/* Diagnosis Text */}
                <div className="flex-1 w-full">
                    <div className="flex items-start gap-4">
                        {isSafe ?
                            <CheckCircle className="text-green-600 w-6 h-6 mt-1.5 flex-shrink-0" /> :
                            <XCircle className="text-red-600 w-6 h-6 mt-1.5 flex-shrink-0" />
                        }
                        <div className="space-y-4 flex-1">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 leading-none mb-1">Diagnóstico</h3>
                                <div className={`font-bold ${textColor} text-xl flex items-center gap-2`}>
                                    {summary.global_verdict}
                                </div>
                            </div>

                            <p className="text-sm text-gray-700 leading-relaxed font-medium">
                                {summary.diagnosis}
                            </p>

                            <div className="pt-2">
                                <div className="flex justify-between text-sm font-bold mb-2">
                                    <span className="flex items-center gap-2 text-gray-700">
                                        <span className="inline-block"><AlertCircle className="w-4 h-4" /></span>
                                        Puntuación de Riesgo
                                    </span>
                                    <span className={textColor}>{riskScore}/100</span>
                                </div>
                                <Progress value={riskScore} className={`h-3 rounded-full bg-gray-200 ${isSafe ? "[&>div]:bg-green-500" : "[&>div]:bg-red-500"}`} />
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
