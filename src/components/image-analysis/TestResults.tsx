import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TestResult } from '@/types/imageAnalysis';

interface Props {
    tests: TestResult[];
}

export function TestResults({ tests }: Props) {
    return (
        <div className="space-y-4">
            {tests.map((test, index) => {
                const isTampered = test.verdict === 'TAMPERED';
                const badgeVariant = isTampered ? 'destructive' : 'secondary';
                // Using specfic colors to match the design (Manipulated = orange/red)
                const badgeColorClass = isTampered ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-100 text-green-800 hover:bg-green-200';
                const progressColor = isTampered ? 'bg-red-500' : 'bg-green-500';

                return (
                    <Card key={index} className="overflow-hidden border border-gray-100 shadow-sm">
                        <CardContent className="p-5">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="font-bold text-base text-gray-900">{test.name}</h4>
                                    <p className="text-xs text-gray-500 mt-1 font-medium">{test.description}</p>
                                </div>
                                <Badge className={`uppercase px-2 py-0.5 text-[10px] font-bold tracking-wider ${badgeColorClass}`}>
                                    {test.verdict}
                                </Badge>
                            </div>

                            <div className="space-y-2 mt-4">
                                <div className="flex justify-between text-xs items-end">
                                    <span className="font-bold text-gray-700">Confianza</span>
                                    <span className="font-bold text-gray-900 text-sm">{Math.round(test.confidence * 100)}%</span>
                                </div>
                                <Progress
                                    value={test.confidence * 100}
                                    className={`h-2.5 rounded-full bg-gray-100 [&>div]:${progressColor}`}
                                />
                                <div className="flex justify-end pt-2">
                                    <span className="text-[11px] font-semibold text-gray-400">
                                        Tiempo de ejecución {(test.executionTimeMs / 1000).toFixed(1)}s
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
