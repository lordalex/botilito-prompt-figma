import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Level3Verdict } from '@/types/imageAnalysis';

interface Props {
    verdict: Level3Verdict;
}

export function AnalysisSummary({ verdict }: Props) {
    if (!verdict) return null;

    // Ensure strict number parsing to avoid NaN warnings
    let riskScore = Number(verdict.manipulation_probability);
    if (isNaN(riskScore)) riskScore = 0;

    const isSafe = riskScore < 30;
    const isMedium = riskScore >= 30 && riskScore < 70;

    const borderColor = isSafe ? 'border-green-500' : isMedium ? 'border-yellow-500' : 'border-red-500';
    const textColor = isSafe ? 'text-green-600' : isMedium ? 'text-yellow-600' : 'text-red-600';
    const bgColor = isSafe ? 'bg-green-50' : isMedium ? 'bg-yellow-50' : 'bg-red-50';
    const progressColor = isSafe ? "bg-green-500" : isMedium ? "bg-yellow-500" : "bg-red-500";

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
                            strokeDashoffset={351.86 - (351.86 * riskScore) / 100}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
                        <span className={`text-3xl font-bold ${textColor}`}>{Math.round(riskScore)}%</span>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Probabilidad</span>
                    </div>
                </div>

                {/* Content - Right / Expanded */}
                <div className="flex-1 w-full space-y-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            {isSafe ?
                                <CheckCircle className="text-green-600 w-5 h-5" /> :
                                <XCircle className="text-red-600 w-5 h-5" />
                            }
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">Veredicto</h3>
                        </div>
                        <div className={`text-2xl font-bold ${textColor}`}>
                            {verdict.final_label}
                        </div>
                    </div>

                    <p className="text-sm text-gray-700 leading-relaxed">
                        {verdict.user_explanation}
                    </p>

                    <div className="pt-2">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                            <span className="flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5" />
                                Severidad de Manipulación
                            </span>
                            <span className={textColor}>{Math.round(verdict.severity_index * 100)}/100</span>
                        </div>
                        <Progress value={riskScore} className={`h-2.5 rounded-full bg-gray-200 [&>div]:${progressColor}`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
