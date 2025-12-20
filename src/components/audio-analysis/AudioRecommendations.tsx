import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
    recommendations: string[];
}

export function AudioRecommendations({ recommendations }: Props) {
    return (
        <Card className="bg-[#FFFCE8] border-yellow-200">
            <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-base font-bold">Recomendaciones</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
                <ul className="space-y-2">
                    {recommendations.map((rec, index) => (
                        <li key={index} className="text-sm font-medium text-gray-700 flex items-start gap-2">
                            <span className="text-yellow-400 mt-1">•</span>
                            <span>{rec}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
