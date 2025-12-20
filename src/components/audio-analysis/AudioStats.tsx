import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
    testsExecuted: number;
    anomaliesFound: number;
    processingTimeSeconds?: number;
    speakersDetected?: number;
}

export function AudioStats({ testsExecuted, anomaliesFound, processingTimeSeconds, speakersDetected }: Props) {
    return (
        <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-base font-bold">Estadísticas del Análisis</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
                <div className="space-y-3 pt-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">Pruebas ejecutadas</span>
                        <span className="font-bold text-gray-900">{testsExecuted}/10</span>
                    </div>
                    {processingTimeSeconds && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 font-medium">Tiempo total</span>
                            <span className="font-bold text-gray-900">{processingTimeSeconds.toFixed(1)}s</span>
                        </div>
                    )}
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">Anomalías</span>
                        <span className={`font-bold ${anomaliesFound > 0 ? 'text-red-500' : 'text-green-600'}`}>
                            {anomaliesFound}
                        </span>
                    </div>
                    {speakersDetected !== undefined && speakersDetected > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 font-medium">Hablantes detectados</span>
                            <span className="font-bold text-gray-900">{speakersDetected}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
