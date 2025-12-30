import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import botilitoMascot from '@/assets/botilito-mascot.png';

interface AnalysisSidebarRecommendationsProps {
    recommendations: string[];
}

export function AnalysisSidebarRecommendations({
    recommendations
}: AnalysisSidebarRecommendationsProps) {
    if (!recommendations || recommendations.length === 0) return null;

    return (
        <Card className="border-2 border-[#ffda00] bg-[#fffbeb] rounded-md">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                    {/* <img
                        src={botilitoMascot}
                        alt="Botilito"
                        className="h-[48px] w-[48px] object-contain"
                    /> */}
                    <CardTitle className="text-[16px] leading-[24px] font-medium text-black">
                        Recomendaciones
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <ul className="space-y-3">
                    {recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <span className="text-[#ffda00] text-[14px] mt-0.5 flex-shrink-0">•</span>
                            <span className="text-[14px] leading-[21px] text-[#1f2937]">{rec}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
