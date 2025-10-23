import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { FileText, Share2, Trophy } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#00B4D8', '#0077B6', '#7209B7', '#F72585', '#06FFA5', '#FFD60A'];

export function DimensionDescriptiva({ data }) {
    const { porSector, plataformasPropagacion, personalidadesAtacadas, sectorMasEficiente } = data;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2"><FileText className="h-6 w-6 text-primary" /><span>Dimensión Descriptiva</span></CardTitle>
                <CardDescription>Caracteriza los principales componentes de una posible situación de virulencia</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Card>
                    <CardHeader><CardTitle className="text-lg">Porcentaje de Noticias Falsas por Sector</CardTitle><CardDescription>Clasifica por temática (salud, política, etc.)</CardDescription></CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                            <ResponsiveContainer width="100%" height={300}><RechartsPieChart><Pie data={porSector} cx="50%" cy="50%" labelLine={false} label={({ sector, porcentaje }) => `${sector}: ${porcentaje}%`} outerRadius={100} fill="#8884d8" dataKey="casos">{(porSector ?? []).map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip /></RechartsPieChart></ResponsiveContainer>
                            <div className="space-y-2">{(porSector ?? []).map((sector, idx) => (<div key={idx} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"><div className="flex items-center justify-between mb-2"><div className="flex items-center space-x-2"><div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div><span className="font-medium">{sector.sector}</span></div><Badge>{sector.porcentaje}%</Badge></div><div className="flex items-center justify-between text-xs text-muted-foreground"><span>{sector.casos} casos</span><Progress value={sector.porcentaje} className="w-20 h-1" /></div></div>))}</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-lg">Plataformas con Mayor Propagación</CardTitle><CardDescription>Identifica las redes sociales más activas en la difusión</CardDescription></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}><BarChart data={plataformasPropagacion} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis dataKey="plataforma" type="category" width={100} /><Tooltip /><Legend /><Bar dataKey="casos" fill="#7209B7" name="Casos detectados" /></BarChart></ResponsiveContainer>
                        <Alert className="mt-4 border-purple-200 bg-purple-50"><Share2 className="h-4 w-4 text-purple-600" /><AlertDescription className="text-purple-800"><strong>Plataforma líder:</strong> {(plataformasPropagacion[0]?.plataforma) ?? 'N/A'} concentra el {(plataformasPropagacion[0]?.porcentaje) ?? 0}% de la propagación.</AlertDescription></Alert>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-lg">Ranking de Personalidades Más Atacadas *</CardTitle><CardDescription>Figuras públicas mencionadas en desinformación *</CardDescription></CardHeader>
                    <CardContent><div className="space-y-3">{(personalidadesAtacadas ?? []).map((persona, idx) => (<div key={idx} className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-orange-50 to-red-50"><div className="flex items-center space-x-3"><Badge className="bg-orange-600 text-white text-lg w-10 h-10 flex items-center justify-center">#{idx + 1}</Badge><span className="font-medium">{persona.nombre}</span></div><div className="text-right"><p className="text-2xl text-orange-700">{persona.ataques}</p><p className="text-xs text-muted-foreground">ataques</p></div></div>))}</div></CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                    <CardHeader><CardTitle className="text-lg">Sector Más Eficiente en Alcance *</CardTitle><CardDescription>Compara viralización por área temática *</CardDescription></CardHeader>
                    <CardContent>
                        <div className="text-center p-6"><Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" /><h3 className="text-2xl mb-2">{(sectorMasEficiente.sector) ?? 'N/A'} *</h3><div className="grid grid-cols-2 gap-4 mt-4"><div className="p-3 bg-white rounded-lg"><p className="text-xs text-muted-foreground mb-1">Alcance Promedio *</p><p className="text-xl text-blue-700">{(sectorMasEficiente.alcancePromedio ?? 0).toLocaleString()} *</p></div><div className="p-3 bg-white rounded-lg"><p className="text-xs text-muted-foreground mb-1">Nivel de Viralidad *</p><p className="text-xl text-purple-700">{(sectorMasEficiente.viralidad) ?? 0}% *</p></div></div></div>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    );
}
