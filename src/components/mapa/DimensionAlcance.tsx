import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Flame, Target, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function DimensionAlcance({ data }) {
    const { indiceViralidad, rangoViralizacion, nivelEngagement, efectividadAlcance, distribucionViralidad } = data;
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2"><Flame className="h-6 w-6 text-primary" /><span>Dimensión de Alcance o Virulencia</span></CardTitle>
                <CardDescription>Evalúa el índice de viralidad y nivel de engagement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200"><CardHeader className="pb-2"><CardDescription className="text-red-700">Índice de Viralidad (R₀)</CardDescription><CardTitle className="text-3xl text-red-900">{indiceViralidad}</CardTitle></CardHeader><CardContent><div className="flex items-center space-x-1 text-xs text-red-700"><Flame className="h-3 w-3" /><span>Potencial de contagio</span></div></CardContent></Card>
                    <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200"><CardHeader className="pb-2"><CardDescription className="text-yellow-700">Nivel de Engagement *</CardDescription><CardTitle className="text-3xl text-yellow-900">{nivelEngagement}% *</CardTitle></CardHeader><CardContent><div className="flex items-center space-x-1 text-xs text-yellow-700"><Target className="h-3 w-3" /><span>Impacto emocional</span></div></CardContent></Card>
                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"><CardHeader className="pb-2"><CardDescription className="text-purple-700">Alcance Promedio</CardDescription><CardTitle className="text-2xl text-purple-900">{(rangoViralizacion.promedio ?? 0).toLocaleString()}</CardTitle></CardHeader><CardContent><div className="flex items-center justify-between text-xs text-purple-700"><span>Min: {rangoViralizacion.min ?? 0}</span><span>Max: {((rangoViralizacion.max ?? 0) / 1000).toFixed(0)}K</span></div></CardContent></Card>
                </div>
                <Card><CardHeader><CardTitle className="text-lg">Distribución de Viralización</CardTitle><CardDescription>Rango de mayor viralización</CardDescription></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><BarChart data={distribucionViralidad} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis dataKey="rango" type="category" width={100} /><Tooltip /><Legend /><Bar dataKey="casos" fill="#f59e0b" name="Casos" /><Bar dataKey="porcentaje" fill="#ef4444" name="Porcentaje %" /></BarChart></ResponsiveContainer></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-lg">Efectividad de Alcance: Verdaderas vs Falsas *</CardTitle><CardDescription>Competencia comunicacional *</CardDescription></CardHeader><CardContent><div className="grid grid-cols-2 gap-4 mb-4"><div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg text-center"><p className="text-sm text-green-700 mb-1">Noticias Verdaderas *</p><p className="text-3xl text-green-900">{(efectividadAlcance.verdaderas ?? 0).toLocaleString()} *</p></div><div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg text-center"><p className="text-sm text-red-700 mb-1">Noticias Falsas *</p><p className="text-3xl text-red-900">{(efectividadAlcance.falsas ?? 0).toLocaleString()} *</p></div></div><Alert className="border-red-200 bg-red-50"><AlertTriangle className="h-4 w-4 text-red-600" /><AlertDescription className="text-red-800"><strong>Brecha de efectividad *:</strong> Las noticias falsas tienen {((efectividadAlcance.falsas ?? 0) / (efectividadAlcance.verdaderas || 1)).toFixed(1)}x más alcance.</AlertDescription></Alert></CardContent></Card>
            </CardContent>
        </Card>
    );
}
