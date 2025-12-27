import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

interface AnalysisSidebarRecommendationsProps {
    recommendations: string[];
}

export function AnalysisSidebarRecommendations({
    recommendations
}: AnalysisSidebarRecommendationsProps) {
    if (!recommendations || recommendations.length === 0) return null;

    return (
        <Card className="bg-[#FFFCE8] border-yellow-200 border-2 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-2 pt-4 px-4 bg-yellow-100/50">
                <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-amber-900">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    Recomendaciones
                </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-3">
                <ul className="space-y-3">
                    {recommendations.map((rec, index) => (
                        <li key={index} className="text-xs font-bold text-amber-800/80 flex items-start gap-2 leading-relaxed">
                            <span className="text-amber-400 mt-1 font-black">•</span>
                            <span>{rec}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
