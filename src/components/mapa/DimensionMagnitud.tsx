import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { TrendingUp, Bot, Users, Database } from 'lucide-react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DimensionNoData } from './DimensionNoData';

export function DimensionMagnitud({ data }) {
  if (!data) return <DimensionNoData label="Dimensión de Magnitud" />;

  const {
    noticiasReportadas,
    noticiasReportadasSemana,
    deteccionesPorIA,
    tiempoDeteccionIA,
    deteccionesPorHumanos,
    tiempoDeteccionHumanos,
    fuentesGeneradoras
  } = data;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2"><Database className="h-6 w-6 text-primary" /><span>Dimensión de Magnitud</span></CardTitle>
        <CardDescription>Cuantifica el volumen total de contenidos reportados, detectados como falsos por IA y validados por humanos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"><CardHeader className="pb-2"><CardDescription className="text-blue-700">Noticias Reportadas</CardDescription><CardTitle className="text-3xl text-blue-900">{(noticiasReportadas ?? 0).toLocaleString()}</CardTitle></CardHeader><CardContent><div className="flex items-center justify-between text-xs text-blue-700"><span>Esta semana: +{noticiasReportadasSemana ?? 0}</span><TrendingUp className="h-3 w-3" /></div></CardContent></Card>
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200"><CardHeader className="pb-2"><CardDescription className="text-red-700">Detectadas por IA</CardDescription><CardTitle className="text-3xl text-red-900">{(deteccionesPorIA ?? 0).toLocaleString()}</CardTitle></CardHeader><CardContent><div className="flex items-center justify-between text-xs text-red-700"><span>Tiempo promedio: {tiempoDeteccionIA ?? 0}h *</span><Bot className="h-3 w-3" /></div></CardContent></Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"><CardHeader className="pb-2"><CardDescription className="text-green-700">Validadas por Humanos</CardDescription><CardTitle className="text-3xl text-green-900">{(deteccionesPorHumanos ?? 0).toLocaleString()}</CardTitle></CardHeader><CardContent><div className="flex items-center justify-between text-xs text-green-700"><span>Tiempo promedio: {tiempoDeteccionHumanos ?? 0}h *</span><Users className="h-3 w-3" /></div></CardContent></Card>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-lg">Evolución de Noticias Reportadas *</CardTitle><CardDescription>Tendencia de reportes por unidad de tiempo y mecanismo *</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={[{ mes: 'Ene', reportadas: 890, iaDetectadas: 745, humanasValidadas: 712 }, { mes: 'Feb', reportadas: 1120, iaDetectadas: 934, humanasValidadas: 889 }, { mes: 'Mar', reportadas: 1456, iaDetectadas: 1189, humanasValidadas: 1134 }, { mes: 'Abr', reportadas: noticiasReportadas, iaDetectadas: deteccionesPorIA, humanasValidadas: deteccionesPorHumanos }]}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="mes" /><YAxis /><Tooltip /><Legend /><Area type="monotone" dataKey="reportadas" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Reportadas" /><Area type="monotone" dataKey="iaDetectadas" stackId="2" stroke="#ef4444" fill="#ef4444" name="IA Detectadas" /><Area type="monotone" dataKey="humanasValidadas" stackId="3" stroke="#10b981" fill="#10b981" name="Validadas Humanos" /></AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Ranking de Fuentes Generadoras</CardTitle><CardDescription>Identifica los actores clave que generan contenido falso</CardDescription></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {fuentesGeneradoras.map((fuente, idx) => (<div key={idx} className="p-4 border rounded-lg bg-gradient-to-r from-red-50 to-orange-50"><div className="flex items-center justify-between mb-2"><div className="flex items-center space-x-3"><Badge className="bg-red-600 text-white">#{idx + 1}</Badge><div><p className="font-medium">{fuente.fuente}</p><p className="text-xs text-muted-foreground">{fuente.tipo}</p></div></div><div className="text-right"><p className="text-2xl text-red-700">{fuente.casos}</p><p className="text-xs text-muted-foreground">casos detectados</p></div></div><Progress value={(fuente.casos / (fuentesGeneradoras[0]?.casos || 1)) * 100} className="h-2" /></div>))}
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
