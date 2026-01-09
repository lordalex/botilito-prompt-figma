#!/bin/bash

# 1. Update PanoramaView.tsx to show Radar Ticks
echo "Enabling Radar Ticks in src/components/mapa/views/PanoramaView.tsx..."
cat << 'EOF' > src/components/mapa/views/PanoramaView.tsx
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

  // Calculate dynamic trends
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
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Cases */}
        <Card className="shadow-sm hover:shadow-md transition-all bg-white border border-blue-100 rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Total de Casos</p>
                <div className="text-4xl font-extrabold text-gray-900">{kpi?.total_cases?.toLocaleString() || 0}</div>
              </div>
              <div className="p-3 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-100">
                <Database className="h-7 w-7" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-red-500">
              {caseTrend !== null ? (
                <>
                  <span className="mr-1">{caseTrend > 0 ? '↗' : '↘'}</span>
                  {Math.abs(caseTrend).toFixed(1)}% esta semana
                </>
              ) : (
                <span className="text-gray-400">Sin datos históricos</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Cases */}
        <Card className="shadow-sm hover:shadow-md transition-all bg-white border border-orange-100 rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Casos Activos</p>
                <div className="text-4xl font-extrabold text-gray-900">{kpi?.active_cases?.toLocaleString() || 0}</div>
              </div>
              <div className="p-3 rounded-full bg-orange-600 text-white shadow-lg shadow-orange-100">
                <Activity className="h-7 w-7" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-orange-600">
              🔥 En análisis epidemiológico
            </div>
          </CardContent>
        </Card>

        {/* Consensus */}
        <Card className="shadow-sm hover:shadow-md transition-all bg-white border border-green-100 rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Consenso Promedio</p>
                <div className="text-4xl font-extrabold text-gray-900">{kpi?.average_consensus || '0%'}</div>
              </div>
              <div className="p-3 rounded-full bg-green-500 text-white shadow-lg shadow-green-100">
                <CheckCircle2 className="h-7 w-7" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-green-600">
              Alta confianza comunitaria
            </div>
          </CardContent>
        </Card>

        {/* PI Generated */}
        <Card className="shadow-sm hover:shadow-md transition-all bg-white border border-yellow-100 rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">PI Generados</p>
                <div className="text-4xl font-extrabold text-gray-900">{kpi?.pi_generated?.toLocaleString() || 0}</div>
              </div>
              <div className="p-3 rounded-full bg-yellow-400 text-gray-900 shadow-lg shadow-yellow-100">
                <Syringe className="h-7 w-7" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-gray-500">
              👤 {kpi?.active_users || 0} usuarios activos
            </div>
          </CardContent>
        </Card>

      </div>

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
EOF

# 2. Update MapaDesinfodemico.tsx for Wide Navigation Pill
echo "Updating Layout in src/components/MapaDesinfodemico.tsx..."
cat << 'EOF' > src/components/MapaDesinfodemico.tsx
import React, { useState, useEffect } from 'react';
import botilitoImage from '@/assets/e27a276e6ff0e187a67cf54678c265c1c38adbf7.png';
import { 
  LayoutDashboard, 
  BarChart2, 
  Stethoscope, 
  Map, 
  Crown,
  Info,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { PanoramaView } from './mapa/views/PanoramaView';
import { IndicadoresView } from './mapa/views/IndicadoresView';
import { DiagnosticoView } from './mapa/views/DiagnosticoView';
import { ColaboradoresView } from './mapa/views/ColaboradoresView';
import { fetchDashboardData } from './mapa/api';
import { DashboardResponse, Region, TimeFrame } from './mapa/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type Tab = 'panorama' | 'indicadores' | 'diagnostico' | 'geografico' | 'colaboradores';

export function MapaDesinfodemico() {
  const [activeTab, setActiveTab] = useState<Tab>('panorama');
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [region, setRegion] = useState<Region>('andina');
  const [timeframe, setTimeframe] = useState<TimeFrame>('weekly');

  const tabs = [
    { id: 'panorama', label: 'Panorama', icon: LayoutDashboard },
    { id: 'indicadores', label: 'Indicadores', icon: BarChart2 },
    { id: 'diagnostico', label: 'Diagnóstico', icon: Stethoscope },
    { id: 'geografico', label: 'Geográfico', icon: Map },
    { id: 'colaboradores', label: 'Top Colaboradores', icon: Crown },
  ];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchDashboardData(region, timeframe);
        setData(response);
      } catch (err: any) {
        setError(err.message || 'Error cargando datos del dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [region, timeframe]);

  return (
    <div className="min-h-screen bg-gray-50/20 pb-12 font-sans">
      
      {/* Botilito Header - Full Width Yellow Hero */}
      <div className="w-full bg-[#ffe97a] pt-10 pb-24 border-b border-[#e5d053]">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="flex flex-col items-center space-y-6">
            
            {/* Logo & Title */}
            <div className="flex flex-col items-center gap-4">
              <div className="bg-white p-3 rounded-full border-4 border-white shadow-sm ring-1 ring-black/5">
                 <img src={botilitoImage} alt="Botilito" className="w-20 h-20 object-contain" />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                Mapa Desinfodémico
              </h1>
            </div>

            {/* Filters Centered */}
            <div className="flex flex-wrap justify-center gap-4">
              <Select value={region} onValueChange={(v: Region) => setRegion(v)}>
                <SelectTrigger className="w-[180px] bg-white border-0 shadow-sm rounded-lg h-11 font-semibold text-gray-700 hover:bg-gray-50 transition-colors focus:ring-0">
                  <SelectValue placeholder="Región" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="andina">Región Andina</SelectItem>
                  <SelectItem value="caribe">Región Caribe</SelectItem>
                  <SelectItem value="pacifica">Región Pacífica</SelectItem>
                  <SelectItem value="global">Consolidado Nacional</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={timeframe} onValueChange={(v: TimeFrame) => setTimeframe(v)}>
                <SelectTrigger className="w-[160px] bg-white border-0 shadow-sm rounded-lg h-11 font-semibold text-gray-700 hover:bg-gray-50 transition-colors focus:ring-0">
                  <SelectValue placeholder="Periodo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diario</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensual</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>
        </div>
      </div>

      {/* Floating Navigation Tabs - WIDE STRIP (max-w-5xl) */}
      <div className="relative -mt-12 z-20 flex justify-center px-4 w-full">
        <div className="bg-white p-2 rounded-full shadow-xl border border-gray-100 flex items-center justify-center w-full max-w-5xl">
          <div className="flex space-x-2 overflow-x-auto scrollbar-hide p-1 w-full justify-between md:justify-center">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`
                    flex items-center gap-2 px-4 md:px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap
                    ${isActive 
                      ? 'bg-[#1f2937] text-white shadow-md transform scale-[1.02]' 
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}
                  `}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-[#ffda00]' : 'text-gray-400'}`} />
                  <span className="hidden md:inline">{tab.label}</span>
                  <span className="md:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-12">
        <div className="min-h-[500px]">
          {loading && (
            <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl shadow-sm border border-gray-100 mt-4">
              <Loader2 className="h-12 w-12 animate-spin text-[#ffda00] mb-4" />
              <p className="text-gray-500 font-medium text-lg">Actualizando epidemiología en tiempo real...</p>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mb-6 mt-4 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error de Conexión</AlertTitle>
              <AlertDescription>{error}. Por favor verifica tu conexión e intenta nuevamente.</AlertDescription>
            </Alert>
          )}

          {!loading && !error && data && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              {activeTab === 'panorama' && <PanoramaView kpi={data.kpi} evolution={data.evolution_chart} radar={data.radar_dimensions} />}
              {activeTab === 'indicadores' && <IndicadoresView data={data.indicators} />}
              {activeTab === 'diagnostico' && <DiagnosticoView data={data.detailed_metrics} />}
              {activeTab === 'colaboradores' && <ColaboradoresView />}
              {activeTab === 'geografico' && (
                <div className="flex flex-col items-center justify-center h-[500px] bg-slate-50 rounded-2xl border-2 border-dashed border-gray-200 mt-4">
                  <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                    <Map className="h-12 w-12 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-600">Mapa de Calor Geográfico</h3>
                  <p className="text-gray-400 mt-2">Visualización geográfica no disponible en esta versión de API.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-16 flex items-center justify-center gap-2 text-gray-400 text-sm py-8 border-t border-gray-200">
          <Info className="h-4 w-4" />
          <p>
            Datos sincronizados en tiempo real desde el nodo central. Última actualización: {new Date().toLocaleTimeString()}
          </p>
        </div>

      </div>
    </div>
  );
}
EOF

echo "Applied fixes for Radar Chart and Navigation Bar."

