import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { MapPin, Globe, Radio } from 'lucide-react';
import { BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardResponse } from '@/types/mapaDesinfodemico';

interface DimensionGeograficaProps {
    data: DashboardResponse | null;
}

export function DimensionGeografica({ data }: DimensionGeograficaProps) {
    const metrics = data?.detailed_metrics;

    // Map API data to visualization props
    // We use 'source_diversity' as a proxy for International Sources count if not explicitly separated
    const intSources = metrics?.magnitude?.source_diversity ?? 0;
    // 'channel_amplitude' used as proxy for National/Local spread
    const natSources = metrics?.reach?.channel_amplitude ?? 0;

    const totalSources = intSources + natSources;
    const intPercent = totalSources > 0 ? Math.round((intSources / totalSources) * 100) : 0;
    const natPercent = 100 - intPercent;

    const pieData = [
        { name: 'Internacionales', value: intSources },
        { name: 'Nacionales', value: natSources }
    ];

    return (
        <Card className="animate-in fade-in duration-500">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-6 w-6 text-primary" />
                    <span>Dimensión Geográfica y de Alcance</span>
                </CardTitle>
                <CardDescription>Alcance espacial y origen de los vectores de desinformación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Fuentes Section - Mapped from Magnitude/Reach metrics */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Fuentes Internacionales vs Nacionales</CardTitle>
                        <CardDescription>Origen estimado de los emisores basado en diversidad de fuentes y amplitud de canales</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="p-6 bg-blue-50 border-2 border-blue-100 rounded-lg text-center flex flex-col items-center">
                                <Globe className="h-10 w-10 text-blue-600 mb-3" />
                                <p className="text-3xl font-bold text-blue-900 mb-1">{intSources}</p>
                                <p className="text-sm text-blue-700 font-medium">Fuentes Diversas (Proxy Intl)</p>
                                <Badge className="bg-blue-600 text-white mt-3 hover:bg-blue-700">{intPercent}% del Total</Badge>
                            </div>
                            <div className="p-6 bg-green-50 border-2 border-green-100 rounded-lg text-center flex flex-col items-center">
                                <Radio className="h-10 w-10 text-green-600 mb-3" />
                                <p className="text-3xl font-bold text-green-900 mb-1">{natSources}</p>
                                <p className="text-sm text-green-700 font-medium">Canales Locales (Proxy Nac)</p>
                                <Badge className="bg-green-600 text-white mt-3 hover:bg-green-700">{natPercent}% del Total</Badge>
                            </div>
                        </div>

                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsPieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        <Cell fill="#3b82f6" />
                                        <Cell fill="#10b981" />
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Impact Section - Replacing missing Regional Map with Impact Data */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Impacto Demográfico y Exposición</CardTitle>
                        <CardDescription>Estimación de población expuesta a contenidos desinfodémicos</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-medium text-gray-700">Tasa de Penetración</span>
                                <span className="font-bold text-gray-900">{metrics?.impact?.penetration_rate ?? "N/A"}</span>
                            </div>
                            <Progress value={parseFloat(metrics?.impact?.penetration_rate ?? "0")} className="h-2" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">Población Expuesta</p>
                                <p className="text-xl font-bold text-gray-900">{(metrics?.impact?.exposed_population ?? 0).toLocaleString()}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">Exposición Acumulada</p>
                                <p className="text-xl font-bold text-gray-900">{(metrics?.impact?.cumulative_exposure ?? 0).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="p-3 bg-yellow-50 text-yellow-800 text-xs rounded-lg border border-yellow-100 flex gap-2">
                            <MapPin className="h-4 w-4 shrink-0" />
                            <span>
                                <strong>Nota:</strong> La desagregación detallada por región o departamento no está disponible en la vista actual de datos. Se muestran métricas globales de alcance e impacto.
                            </span>
                        </div>
                    </CardContent>
                </Card>

            </CardContent>
        </Card>
    );
}
