import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Level1AnalysisItem } from '@/types/imageAnalysis';

interface Props {
    tests: Level1AnalysisItem[];
}

export function TestResults({ tests }: Props) {
    return (
        <div className="space-y-4">
            {tests.map((test, index) => {
                // Significance > 0.5 usually implies suspicion in this new model, though strictly it's significance of finding.
                // We'll treat high significance as "warning" color.
                const isSignificant = test.significance_score > 0.5;

                const badgeVariant = isSignificant ? 'destructive' : 'secondary';
                const badgeColorClass = isSignificant ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-100 text-green-800 hover:bg-green-200';
                const progressColor = isSignificant ? 'bg-orange-500' : 'bg-green-500';

                return (
                    <Card key={index} className="overflow-hidden border border-gray-100 shadow-sm">
                        <CardContent className="p-5">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="font-bold text-base text-gray-900">{test.algorithm}</h4>
                                    <p className="text-xs text-gray-500 mt-1 font-medium">Nivel 1: Análisis Técnico</p>
                                </div>
                                <Badge className={`uppercase px-2 py-0.5 text-[10px] font-bold tracking-wider ${badgeColorClass}`}>
                                    {isSignificant ? 'Relevante' : 'Normal'}
                                </Badge>
                            </div>

                            <p className="text-sm text-gray-700 mb-4 bg-gray-50 p-3 rounded-md border border-gray-100 italic">
                                "{test.interpretation}"
                            </p>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs items-end">
                                    <span className="font-bold text-gray-700">Relevancia del Hallazgo</span>
                                    <span className="font-bold text-gray-900 text-sm">{Math.round(test.significance_score * 100)}%</span>
                                </div>
                                <Progress
                                    value={test.significance_score * 100}
                                    className={`h-2.5 rounded-full bg-gray-100 [&>div]:${progressColor}`}
                                />
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
