import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { Activity } from 'lucide-react';
import { KPIData, TimePoint, RadarDimensions } from '../types';

interface PanoramaViewProps {
  kpi: KPIData;
  evolution: TimePoint[];
  radar: RadarDimensions;
}

export function PanoramaView({ kpi, evolution, radar }: PanoramaViewProps) {
  
  // 1. Prepare Radar Data
  const rMag = Number(radar?.magnitude) || 0;
  const rTemp = Number(radar?.temporality) || 0;
  const rReach = Number(radar?.reach) || 0;
  const rImp = Number(radar?.impact) || 0;
  const rResp = Number(radar?.response) || 0;

  // 2. Determine Scale Domain dynamically
  const maxVal = Math.max(rMag, rTemp, rReach, rImp, rResp);
  // If values are small (<= 10), assume 0-5 or 0-10 scale. Otherwise 0-100.
  // Using 5 as default for small scores (typical 1-5 Likert or similar)
  const domainMax = maxVal <= 5 ? 5 : 100;

  const radarData = [
    { subject: 'Magnitud', A: rMag, fullMark: domainMax },
    { subject: 'Temporalidad', A: rTemp, fullMark: domainMax },
    { subject: 'Alcance', A: rReach, fullMark: domainMax },
    { subject: 'Impacto', A: rImp, fullMark: domainMax },
    { subject: 'Respuesta', A: rResp, fullMark: domainMax },
  ];

  const hasEvolutionData = evolution && evolution.length > 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Evolution Chart (Full Width) */}
      <Card className="shadow-sm border border-gray-100 rounded-xl overflow-hidden bg-white">
        <CardHeader className="pb-2 border-b border-gray-50/50">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg font-bold text-gray-900">
              Evolución Temporal
            </CardTitle>
          </div>
          <p className="text-sm text-gray-500 pl-7">Casos registrados, validaciones humanas y PI generados en el periodo seleccionado.</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div style={{ width: '100%', height: 400 }}>
            {hasEvolutionData ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evolution} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{fontSize: 12, fill: '#6b7280'}} 
                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                    dy={10}
                  />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    labelFormatter={(str) => new Date(str).toLocaleDateString()}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                  <Line yAxisId="left" type="monotone" dataKey="cases" name="Casos Registrados" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                  <Line yAxisId="left" type="monotone" dataKey="validations" name="Validaciones" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                  <Line yAxisId="right" type="monotone" dataKey="pi" name="PI Generados" stroke="#eab308" strokeWidth={3} dot={{r: 4, fill: '#eab308', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <p>No hay datos suficientes para graficar</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Radar Chart (Full Width Centered) */}
      <Card className="shadow-sm border border-gray-100 rounded-xl overflow-hidden bg-white">
        <CardHeader className="pb-2 border-b border-gray-50/50">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg font-bold text-gray-900">
              Radar de Dimensiones Epidemiológicas
            </CardTitle>
          </div>
          <p className="text-sm text-gray-500 pl-7">Visualización multidimensional del estado de la infodemia (Escala: 0 - {domainMax})</p>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-10">
          <div style={{ width: '100%', maxWidth: '700px', height: 450 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#4b5563', fontSize: 13, fontWeight: 600 }} 
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, domainMax]} 
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                  tickCount={6}
                  axisLine={false} 
                />
                <Radar 
                  name="Estado Actual" 
                  dataKey="A" 
                  stroke="#a855f7" 
                  strokeWidth={3} 
                  fill="#a855f7" 
                  fillOpacity={0.5} 
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
