import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { Database, Activity, CheckCircle2, Syringe } from 'lucide-react';
import { KPIData, TimePoint, RadarDimensions } from '../types';

interface PanoramaViewProps {
  kpi: KPIData;
  evolution: TimePoint[];
  radar: RadarDimensions;
}

export function PanoramaView({ kpi, evolution, radar }: PanoramaViewProps) {
  
  const rMag = Number(radar?.magnitude) || 0;
  const rTemp = Number(radar?.temporality) || 0;
  const rReach = Number(radar?.reach) || 0;
  const rImp = Number(radar?.impact) || 0;
  const rResp = Number(radar?.response) || 0;

  const maxVal = Math.max(rMag, rTemp, rReach, rImp, rResp);
  const domainMax = maxVal <= 5 ? 5 : 100;

  const radarData = [
    { subject: 'Magnitud', A: rMag, fullMark: domainMax },
    { subject: 'Temporalidad', A: rTemp, fullMark: domainMax },
    { subject: 'Alcance', A: rReach, fullMark: domainMax },
    { subject: 'Impacto', A: rImp, fullMark: domainMax },
    { subject: 'Respuesta', A: rResp, fullMark: domainMax },
  ];

  const hasEvolutionData = evolution && evolution.length > 0;

  const calculateTrend = (key: keyof TimePoint) => {
    if (!evolution || evolution.length < 2) return null;
    const current = evolution[evolution.length - 1][key] as number;
    const previous = evolution[evolution.length - 2][key] as number;
    if (previous === 0) return null;
    const percent = ((current - previous) / previous) * 100;
    return percent;
  };

  const caseTrend = calculateTrend('cases');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Cases */}
        <Card className="shadow-sm hover:shadow-md transition-all bg-white border border-blue-100 rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Total de Casos</p>
                <div className="text-4xl font-extrabold text-gray-900">{kpi?.total_cases?.toLocaleString() || 0}</div>
                <div className="mt-2 flex items-center text-xs font-bold text-red-500">
                  {caseTrend !== null ? (
                    <>
                      <span className="mr-1">{caseTrend > 0 ? '↗' : '↘'}</span>
                      {Math.abs(caseTrend).toFixed(1)}% esta semana
                    </>
                  ) : (
                    <span className="text-gray-400">Sin datos históricos</span>
                  )}
                </div>
              </div>
              <div className="h-16 w-16 rounded-full bg-[#2563EB] flex items-center justify-center shadow-lg shadow-blue-200">
                <Database className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Cases */}
        <Card className="shadow-sm hover:shadow-md transition-all bg-white border border-orange-100 rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Casos Activos</p>
                <div className="text-4xl font-extrabold text-gray-900">{kpi?.active_cases?.toLocaleString() || 0}</div>
                <div className="mt-2 flex items-center text-xs font-bold text-[#EA580C]">
                  🔥 En análisis
                </div>
              </div>
              <div className="h-16 w-16 rounded-full bg-[#EA580C] flex items-center justify-center shadow-lg shadow-orange-200">
                <Activity className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consensus */}
        <Card className="shadow-sm hover:shadow-md transition-all bg-white border border-green-100 rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Consenso Promedio</p>
                <div className="text-4xl font-extrabold text-gray-900">{kpi?.average_consensus || '0%'}</div>
                <div className="mt-2 flex items-center text-xs font-bold text-[#16A34A]">
                   👥 {evolution && evolution[evolution.length-1]?.validations} validaciones
                </div>
              </div>
              <div className="h-16 w-16 rounded-full bg-[#16A34A] flex items-center justify-center shadow-lg shadow-green-200">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PI Generated */}
        <Card className="shadow-sm hover:shadow-md transition-all bg-white border border-yellow-100 rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">PI Generados</p>
                <div className="text-4xl font-extrabold text-gray-900">{kpi?.pi_generated?.toLocaleString() || 0}</div>
                <div className="mt-2 flex items-center text-xs font-bold text-gray-500">
                  👤 {kpi?.active_users || 0} usuarios activos
                </div>
              </div>
              <div className="h-16 w-16 rounded-full bg-[#FACC15] flex items-center justify-center shadow-lg shadow-yellow-200">
                <Syringe className="h-8 w-8 text-black" />
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      <Card className="shadow-sm border border-gray-100 rounded-xl overflow-hidden bg-white">
        <CardHeader className="pb-2 border-b border-gray-50/50 flex flex-row items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
             <Activity className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-gray-900">Evolución Temporal (Últimas 8 Semanas)</CardTitle>
            <p className="text-sm text-gray-500">Casos registrados, validaciones humanas, consenso promedio y PI generados</p>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div style={{ width: '100%', height: 400 }}>
            {hasEvolutionData ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evolution} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, {month:'short', day:'numeric'})} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} label={{ value: 'Casos / Validaciones', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} label={{ value: 'PI / Consenso', angle: 90, position: 'insideRight', fill: '#9ca3af', fontSize: 10 }} />
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} labelFormatter={(str) => new Date(str).toLocaleDateString()} />
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

      <Card className="shadow-sm border border-gray-100 rounded-xl overflow-hidden bg-white">
        <CardHeader className="pb-2 border-b border-gray-50/50 flex flex-row items-center gap-3">
          <div className="p-2 bg-purple-50 rounded-lg">
             <Activity className="h-5 w-5 text-purple-600" />
          </div>
          <div>
             <CardTitle className="text-lg font-bold text-gray-900">Radar de Dimensiones Epidemiológicas</CardTitle>
             <p className="text-sm text-gray-500">Visualización multidimensional del estado de la infodemia (Escala: 0 - {domainMax})</p>
          </div>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-10">
          <div style={{ width: '100%', maxWidth: '700px', height: 450 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                <PolarGrid gridType="polygon" stroke="#e2e8f0" strokeWidth={1} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#374151', fontSize: 13, fontWeight: 700 }} />
                <PolarRadiusAxis angle={90} domain={[0, domainMax]} tick={{ fill: '#94a3b8', fontSize: 10 }} tickCount={6} axisLine={false} />
                <Radar name="Estado Actual" dataKey="A" stroke="#a855f7" strokeWidth={3} fill="#a855f7" fillOpacity={0.4} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
