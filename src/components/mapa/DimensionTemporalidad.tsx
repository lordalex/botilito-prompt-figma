import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Zap, Radio, Clock, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DimensionNoData } from './DimensionNoData';

export function DimensionTemporalidad({ data }) {
  if (!data) return <DimensionNoData label="Dimensión de Temporalidad" />;

  const { velocidadDeteccion, tiempoViralizacionPromedio, evolucionSemanal, comparativaVerdaderasVsFalsas } = data;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2"><Clock className="h-6 w-6 text-primary" /><span>Dimensión de Temporalidad</span></CardTitle>
        <CardDescription>Tiempo de ocurrencia y velocidad de detección y viralización</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"><CardHeader className="pb-2"><CardDescription className="text-purple-700">Velocidad de Detección</CardDescription><CardTitle className="text-3xl text-purple-900">{velocidadDeteccion}h</CardTitle></CardHeader><CardContent><div className="flex items-center space-x-1 text-xs text-purple-700"><Zap className="h-3 w-3" /><span>Tiempo promedio de detección</span></div></CardContent></Card>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"><CardHeader className="pb-2"><CardDescription className="text-orange-700">Tiempo de Viralización *</CardDescription><CardTitle className="text-3xl text-orange-900">{tiempoViralizacionPromedio}h *</CardTitle></CardHeader><CardContent><div className="flex items-center space-x-1 text-xs text-orange-700"><Radio className="h-3 w-3" /><span>Ventana crítica de intervención</span></div></CardContent></Card>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-lg">Evolución Temporal</CardTitle><CardDescription>Casos detectados vs. viralizados por semana</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={evolucionSemanal}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="semana" /><YAxis /><Tooltip /><Legend /><Area type="monotone" dataKey="detectadas" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="Detectadas" /><Area type="monotone" dataKey="viralizadas" stroke="#f97316" fill="#f97316" fillOpacity={0.6} name="Viralizadas *" /></AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Viralización: Verdaderas vs Falsas *</CardTitle><CardDescription>Velocidad de propagación *</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={comparativaVerdaderasVsFalsas} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis dataKey="tipo" type="category" /><Tooltip /><Legend /><Bar dataKey="interacciones" fill="#3b82f6" name="Interacciones" /><Bar dataKey="tiempo" fill="#f59e0b" name="Tiempo (horas)" /></BarChart>
            </ResponsiveContainer>
            <Alert className="mt-4 border-orange-200 bg-orange-50"><AlertTriangle className="h-4 w-4 text-orange-600" /><AlertDescription className="text-orange-800">Las noticias falsas se viralizan <strong>2.6x más rápido *</strong> que las verdaderas.</AlertDescription></Alert>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
