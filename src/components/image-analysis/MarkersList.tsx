import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Marker } from '@/types/imageAnalysis';

interface Props {
    markers: Marker[];
}

export function MarkersList({ markers }: Props) {
    if (markers.length === 0) {
        return (
            <div className="text-center p-8 text-gray-500">
                <p>No se encontraron marcadores sospechosos.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {markers.map((marker, index) => {
                const severityColors = {
                    low: 'bg-blue-500',
                    medium: 'bg-yellow-500',
                    high: 'bg-orange-500',
                    critical: 'bg-red-600'
                };

                const severityClass = severityColors[marker.severity.toLowerCase()] || 'bg-gray-500';

                return (
                    <Card key={index} className="border-l-4 border-l-red-500 shadow-sm border-t border-r border-b border-gray-100">
                        <CardContent className="p-5">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-gray-900 text-base">{marker.description.split(':')[0]}</h4>
                                <Badge className={`${severityClass} uppercase text-[10px] px-2 py-0.5 font-bold tracking-wider hover:${severityClass}`}>
                                    {marker.severity.toUpperCase()}
                                </Badge>
                            </div>

                            <Badge variant="secondary" className="mt-2 bg-gray-100 text-gray-600 hover:bg-gray-200 text-[10px] uppercase tracking-wide px-2 py-0.5 border-0">
                                {marker.category}
                            </Badge>

                            <p className="text-sm text-gray-600 mt-3 font-medium">
                                {marker.description}
                            </p>

                            <div className="mt-4 bg-gray-50 p-3 rounded-md border border-gray-100">
                                <p className="text-xs text-gray-700">
                                    <span className="font-bold text-gray-900">Evidencia:</span> {marker.evidence}
                                </p>
                            </div>

                            <div className="flex justify-between items-center mt-3 border-t border-gray-100 pt-3">
                                <span className="text-xs font-semibold text-gray-500">Confianza del marcador</span>
                                <span className="text-sm font-bold text-gray-900">{Math.round(marker.confidence * 100)}%</span>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
