import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ExternalLink, MapPin, Tag, Globe, TrendingUp } from 'lucide-react';
import { DimensionNoData } from './DimensionNoData';

export function DimensionCampana({ data }) {
    if (!data) return <DimensionNoData label="Dimensión de Campaña Relacional" />;

    const { urlMasReportada, regionMasActiva, detallesRelacionales } = data;

    // Helper to clean URL as requested (ignoring numbers 1 to 4)
    // Interpretation: remove patterns like /1/, -1, _1 etc for numbers 1-4
    const cleanUrlDisplay = (url: string) => {
        try {
            const domain = new URL(url).hostname;
            // Remove numbers 1 to 4 from the path/query for display if they appear as standalone identifiers
            let cleaned = url.replace(/[\/\-_][1-4](\/|$|\.)/g, '$1');
            return cleaned;
        } catch (e) {
            return url;
        }
    };

    return (
        <Card className="border-primary/20 shadow-lg">
            <CardHeader className="bg-primary/5">
                <CardTitle className="flex items-center space-x-2 text-primary">
                    <TrendingUp className="h-6 w-6" />
                    <span>Dimensión de Campaña Relacional</span>
                </CardTitle>
                <CardDescription>
                    Análisis de propagación coordinada y focos regionales de actividad
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
                {/* Métricas Destacadas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-red-800 flex items-center">
                                <Globe className="h-4 w-4 mr-2" />
                                URL Más Reportada (Relacional)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs font-mono bg-white/50 p-2 rounded border border-red-100 break-all mb-2">
                                {cleanUrlDisplay(urlMasReportada)}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-red-600 font-bold uppercase">Estado: Bajo Vigilancia</span>
                                <Badge variant="destructive">Alta Prioridad</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-blue-800 flex items-center">
                                <MapPin className="h-4 w-4 mr-2" />
                                Región Más Activa (Flags/Etiquetas)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-900">{regionMasActiva}</div>
                            <p className="text-xs text-blue-700 mt-1">Mayor densidad de etiquetas IA y Humanas</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabla de Datos Relacionales */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center">
                            <Tag className="h-5 w-5 mr-2 text-primary" />
                            Distribución de Campañas Flagged
                        </h3>
                    </div>

                    <div className="rounded-md border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted text-muted-foreground font-medium">
                                <tr>
                                    <th className="py-3 px-4 text-left">URL Analizada (Cleaned)</th>
                                    <th className="py-3 px-4 text-center">Reportes</th>
                                    <th className="py-3 px-4 text-left">Región</th>
                                    <th className="py-3 px-4 text-left">Etiquetas (IA/Human)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {detallesRelacionales.map((item: any, idx: number) => (
                                    <tr key={idx} className="border-t hover:bg-muted/30 transition-colors">
                                        <td className="py-3 px-4 max-w-xs truncate font-mono text-xs">
                                            <div className="flex items-center space-x-2">
                                                <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                                <span title={item.url}>{cleanUrlDisplay(item.url)}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-center font-bold text-primary">
                                            {item.reportes}
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge variant="outline" className="font-normal">
                                                {item.region}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex flex-wrap gap-1">
                                                {item.etiquetas.map((tag: string, tidx: number) => (
                                                    <Badge key={tidx} variant="secondary" className="text-[10px] bg-yellow-100 text-yellow-800 border-yellow-200">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
