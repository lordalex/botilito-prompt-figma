import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Level1AnalysisItem, Level2Integration } from '@/types/imageAnalysis';

interface Props {
    level1: Level1AnalysisItem[];
    level2: Level2Integration;
}

export function MarkersList({ level1, level2 }: Props) {
    // Filter significant findings
    const markers = level1.filter(item => item.significance_score > 0.4);

    if (markers.length === 0 && level2.tampering_type === 'Inexistente') {
        return (
            <div className="text-center p-8 text-gray-500">
                <p>No se encontraron marcadores sospechosos en el análisis forense.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Metadata Risk Marker if high */}
            {level2.metadata_risk_score > 0.5 && (
                <Card className="border-l-4 border-l-red-500 shadow-sm border-t border-r border-b border-gray-100">
                    <CardContent className="p-5">
                        <div className="flex justify-between items-start">
                            <h4 className="font-bold text-gray-900 text-base">Riesgo en Metadatos</h4>
                            <Badge className="bg-red-600 uppercase text-[10px] px-2 py-0.5 font-bold tracking-wider hover:bg-red-700">
                                CRITICO
                            </Badge>
                        </div>
                        <Badge variant="secondary" className="mt-2 bg-gray-100 text-gray-600 border-0 text-[10px] uppercase tracking-wide px-2 py-0.5">
                            Metadatos SW
                        </Badge>
                        <p className="text-sm text-gray-600 mt-3 font-medium">
                            Se detectaron firmas de software de edición de imágenes en los metadatos.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Tampering Type Marker */}
            {level2.tampering_type !== 'Inexistente' && (
                <Card className="border-l-4 border-l-orange-500 shadow-sm border-t border-r border-b border-gray-100">
                    <CardContent className="p-5">
                        <div className="flex justify-between items-start">
                            <h4 className="font-bold text-gray-900 text-base">Tipo de Manipulación Detectada</h4>
                            <Badge className="bg-orange-500 uppercase text-[10px] px-2 py-0.5 font-bold tracking-wider hover:bg-orange-600">
                                ALTO
                            </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-3 font-medium">
                            {level2.tampering_type}
                        </p>
                    </CardContent>
                </Card>
            )}

            {markers.map((marker, index) => {
                const isCritical = marker.significance_score > 0.8;
                const severityClass = isCritical ? 'bg-red-600' : 'bg-orange-500';
                const severityLabel = isCritical ? 'CRITICAL' : 'HIGH';

                return (
                    <Card key={index} className={`border-l-4 ${isCritical ? 'border-l-red-500' : 'border-l-orange-500'} shadow-sm border-t border-r border-b border-gray-100`}>
                        <CardContent className="p-5">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-gray-900 text-base">{marker.algorithm}</h4>
                                <Badge className={`${severityClass} uppercase text-[10px] px-2 py-0.5 font-bold tracking-wider hover:${severityClass}`}>
                                    {severityLabel}
                                </Badge>
                            </div>

                            <p className="text-sm text-gray-600 mt-3 font-medium">
                                {marker.interpretation}
                            </p>

                            <div className="flex justify-between items-center mt-3 border-t border-gray-100 pt-3">
                                <span className="text-xs font-semibold text-gray-500">Relevancia</span>
                                <span className="text-sm font-bold text-gray-900">{Math.round(marker.significance_score * 100)}%</span>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
