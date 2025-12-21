import React from 'react';
import { AIAnalysisReport } from '@/types/imageAnalysis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, AlertTriangle, Zap } from 'lucide-react';

interface AIAnalysisDetailsProps {
    report: AIAnalysisReport;
}

const getSignificanceColor = (score: number) => {
    if (score > 0.75) return 'text-red-500';
    if (score > 0.5) return 'text-yellow-600';
    return 'text-gray-500';
};

export function AIAnalysisDetails({ report }: AIAnalysisDetailsProps) {
    if (!report) return null;

    const { level_1_analysis, level_2_integration, level_3_verdict } = report;

    return (
        <div className="space-y-6">
            {/* Level 2: Holistic Integration */}
            <Card className="rounded-xl border-l-4 border-blue-500">
                <CardHeader>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                        <Zap className="h-5 w-5 text-blue-500" />
                        Análisis Holístico de IA
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="text-sm font-semibold mb-1">Síntesis de la IA</p>
                        <p className="text-xs text-gray-600">{level_2_integration.synthesis_notes}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                            <p className="text-gray-500">Tipo de Manipulación</p>
                            <p className="font-semibold">{level_2_integration.tampering_type}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Consistencia de Pruebas</p>
                            <p className="font-semibold flex items-center">
                                <span className={`mr-1.5 font-bold ${level_2_integration.consistency_score > 0.7 ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {Math.round(level_2_integration.consistency_score * 100)}%
                                </span>
                                {level_2_integration.consistency_score > 0.7 ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                )}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Level 1: Granular Analysis */}
            <div>
                <h3 className="text-base font-bold mb-3">Desglose por Algoritmo</h3>
                <div className="space-y-3">
                    {level_1_analysis.map((item, index) => (
                        <Card key={index} className="rounded-xl">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                    <p className="font-semibold text-sm">{item.algorithm}</p>
                                    <Badge variant="outline" className={getSignificanceColor(item.significance_score)}>
                                        Relevancia: {Math.round(item.significance_score * 100)}%
                                    </Badge>
                                </div>
                                <p className="text-xs text-gray-600 mt-2">{item.interpretation}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
