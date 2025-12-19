import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalysisStats as IAnalysisStats } from '@/types/imageAnalysis';

interface Props {
    stats: IAnalysisStats;
}

export function AnalysisStats({ stats }: Props) {
    return (
        <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-base font-bold">Estadísticas del Análisis</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
                <div className="space-y-3 pt-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">Pruebas ejecutadas</span>
                        <span className="font-bold text-gray-900">{stats.tests_executed}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">Tiempo total</span>
                        <span className="font-bold text-gray-900">{(stats.processing_time_ms / 1000).toFixed(1)}s</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">Marcadores</span>
                        <span className="font-bold text-red-500">{stats.markers_found}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
