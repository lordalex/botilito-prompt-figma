import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { MapPin, Globe } from 'lucide-react';
import { BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function DimensionGeografica({ data }) {
    const { casosPorRegion, mapaCalor, fuentesInternacionalesVsNacionales } = data;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2"><MapPin className="h-6 w-6 text-primary" /><span>Dimensión Geográfica</span></CardTitle>
                <CardDescription>Alcance espacial de noticias falsas, agrupación en clústeres y patrones espaciales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Card>
                    <CardHeader><CardTitle className="text-lg">Cantidad de Noticias Falsas por Región</CardTitle><CardDescription>Detecta patrones territoriales de desinformación</CardDescription></CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {(casosPorRegion ?? []).map((regionData, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3"><div className="w-4 h-4 rounded" style={{ backgroundColor: regionData.color }}></div><span className="font-medium">{regionData.region}</span></div>
                                        <div className="flex items-center space-x-3"><Badge variant="outline">{regionData.casos} casos</Badge><Badge variant="outline" className="text-xs">{regionData.densidad} por 100k hab</Badge></div>
                                    </div>
                                    <Progress value={(regionData.casos / 1000) * 100} className="h-2" style={{ backgroundColor: `${regionData.color}30` }} />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-lg">Mapa de Calor Geográfico de Desinformación</CardTitle><CardDescription>Visualiza densidades por ubicación geográfica (Top 5 departamentos)</CardDescription></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}><BarChart data={mapaCalor}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="departamento" angle={-15} textAnchor="end" height={80} /><YAxis /><Tooltip /><Legend /><Bar dataKey="casos" fill="#ef4444" name="Casos detectados" /></BarChart></ResponsiveContainer>
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <h4 className="text-sm text-red-900 mb-2">🔥 Zona de Mayor Concentración</h4>
                            <p className="text-xs text-red-700"><strong>{(mapaCalor?.[1]?.departamento) ?? 'N/A'}</strong> presenta la mayor densidad con {(mapaCalor?.[1]?.casos) ?? 0} casos detectados.</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-lg">Fuentes Internacionales vs Nacionales *</CardTitle><CardDescription>Analiza el origen de los emisores de desinformación *</CardDescription></CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg text-center"><Globe className="h-8 w-8 text-blue-600 mx-auto mb-2" /><p className="text-3xl text-blue-900 mb-1">{(fuentesInternacionalesVsNacionales.internacionales) ?? 0} *</p><p className="text-sm text-blue-700">Fuentes Internacionales</p><Badge className="bg-blue-600 text-white mt-2">{(fuentesInternacionalesVsNacionales.porcentajeInternacional) ?? 0}% *</Badge></div>
                            <div className="p-6 bg-green-50 border-2 border-green-200 rounded-lg text-center"><MapPin className="h-8 w-8 text-green-600 mx-auto mb-2" /><p className="text-3xl text-green-900 mb-1">{(fuentesInternacionalesVsNacionales.nacionales) ?? 0} *</p><p className="text-sm text-green-700">Fuentes Nacionales</p><Badge className="bg-green-600 text-white mt-2">{100 - (fuentesInternacionalesVsNacionales.porcentajeInternacional ?? 0)}% *</Badge></div>
                        </div>
                        <ResponsiveContainer width="100%" height={200}><RechartsPieChart><Pie data={[{ name: 'Internacionales', value: (fuentesInternacionalesVsNacionales.internacionales) ?? 0 }, { name: 'Nacionales', value: (fuentesInternacionalesVsNacionales.nacionales) ?? 0 }]} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value"><Cell fill="#3b82f6" /><Cell fill="#10b981" /></Pie><Tooltip /></RechartsPieChart></ResponsiveContainer>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    );
}
