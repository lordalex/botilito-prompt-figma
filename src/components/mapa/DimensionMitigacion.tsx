import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { Shield, Users, Bot, UserCheck, Syringe, Hash, Eye, AlertCircle } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function DimensionMitigacion({ data }) {
    const { 
        consensoValidacionHumana, consensoHumanoVsIA, distribucionDesacuerdo, noticiasMasReportadas,
        redEpidemiologos, redInmunizadores, marcadoresDiagnostico, vectoresContagio, casosPorPrioridad,
        casosPorEstado, sistemaCodificacion 
    } = data;

    const COLORS = ['#ef4444', '#f97316', '#fb923c', '#f59e0b', '#6b7280'];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2"><Shield className="h-6 w-6 text-primary" /><span>Dimensión de Mitigación</span></CardTitle>
                <CardDescription>Sistema de aprendizaje activo para mejorar la confiabilidad</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"><CardHeader className="pb-2"><CardDescription className="text-green-700">Consenso Validación Humana *</CardDescription><CardTitle className="text-3xl text-green-900">{consensoValidacionHumana}% *</CardTitle></CardHeader><CardContent><div className="flex items-center space-x-1 text-xs text-green-700"><UserCheck className="h-3 w-3" /><span>Acuerdo entre validadores</span></div><Progress value={consensoValidacionHumana} className="mt-2 h-2" /></CardContent></Card>
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"><CardHeader className="pb-2"><CardDescription className="text-blue-700">Consenso Humano + IA</CardDescription><CardTitle className="text-3xl text-blue-900">{consensoHumanoVsIA.acuerdo}%</CardTitle></CardHeader><CardContent><div className="flex items-center space-x-1 text-xs text-blue-700"><Bot className="h-3 w-3" /><span>Concordancia IA-Humanos</span></div><Progress value={consensoHumanoVsIA.acuerdo} className="mt-2 h-2" /></CardContent></Card>
                </div>
                <Card>
                    <CardHeader><CardTitle className="text-lg">Porcentaje de Desacuerdo Humano vs IA</CardTitle><CardDescription>Áreas de mejora para la IA</CardDescription></CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {(distribucionDesacuerdo ?? []).map((item, idx) => (
                                <div key={idx} className="space-y-2"><div className="flex items-center justify-between"><span className="text-sm font-medium">{item.categoria}</span><Badge variant="outline">{item.porcentaje.toFixed(0)}%</Badge></div><div className="flex items-center space-x-2"><Progress value={item.porcentaje} className="flex-1 h-2" /><span className="text-xs text-muted-foreground">{item.casos} casos</span></div></div>
                            ))}
                        </div>
                        <Alert className="mt-4 border-yellow-200 bg-yellow-50"><AlertCircle className="h-4 w-4 text-yellow-600" /><AlertDescription className="text-yellow-800">El {consensoHumanoVsIA.desacuerdo}% de desacuerdo representa oportunidades de aprendizaje.</AlertDescription></Alert>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-lg">Ranking de Noticias Más Reportadas</CardTitle><CardDescription>Temas de mayor preocupación ciudadana</CardDescription></CardHeader>
                    <CardContent><div className="space-y-3">{(noticiasMasReportadas ?? []).map((noticia, idx) => (<div key={idx} className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50"><div className="flex items-center space-x-3 flex-1"><Badge className="bg-blue-600 text-white text-lg w-10 h-10 flex items-center justify-center flex-shrink-0">#{idx + 1}</Badge><p className="font-medium text-sm">{noticia.titulo}</p></div><div className="text-right ml-4"><p className="text-2xl text-blue-700">{noticia.reportes}</p><p className="text-xs text-muted-foreground">reportes</p></div></div>))}</div></CardContent>
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-gradient-to-br from-emerald-50 to-teal-100 border-emerald-200"><CardHeader><CardTitle className="flex items-center space-x-2"><Users className="h-5 w-5 text-emerald-700" /><span>Red de Epidemiólogos</span></CardTitle><CardDescription>Especialistas en diagnóstico</CardDescription></CardHeader><CardContent className="space-y-3"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Activos</span><Badge className="bg-emerald-600 text-white text-lg px-3 py-1">{redEpidemiologos.totalActivos}</Badge></div><Separator /><div className="space-y-2"><div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Casos procesados</span><span className="font-medium">{(redEpidemiologos.casosProcesados ?? 0).toLocaleString()}</span></div><div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Tiempo promedio *</span><span className="font-medium">{redEpidemiologos.tiempoPromedioVerificacion}h *</span></div></div></CardContent></Card>
                    <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200"><CardHeader><CardTitle className="flex items-center space-x-2"><Syringe className="h-5 w-5 text-purple-700" /><span>Red de Inmunizadores *</span></CardTitle><CardDescription>Especialistas en estrategias *</CardDescription></CardHeader><CardContent className="space-y-3"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Activos *</span><Badge className="bg-purple-600 text-white text-lg px-3 py-1">{redInmunizadores.totalActivos} *</Badge></div><Separator /><div className="space-y-2"><div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Estrategias *</span><span className="font-medium">{redInmunizadores.estrategiasDesarrolladas} *</span></div><div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Alcance total *</span><span className="font-medium">{((redInmunizadores.alcanceTotal ?? 0) / 1000000).toFixed(1)}M *</span></div></div></CardContent></Card>
                </div>
            </CardContent>
        </Card>
    );
}
