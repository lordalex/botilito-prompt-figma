import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BarChart2, 
  Stethoscope, 
  Map, 
  Crown,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { PanoramaView } from './mapa/views/PanoramaView';
import { IndicadoresView } from './mapa/views/IndicadoresView';
import { DiagnosticoView } from './mapa/views/DiagnosticoView';
import { ColaboradoresView } from './mapa/views/ColaboradoresView';
import { fetchDashboardData } from './mapa/api';
import { DashboardResponse, Region, TimeFrame } from './mapa/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MapaLayout } from './mapa/layout/MapaLayout';

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
    <MapaLayout
      region={region}
      setRegion={setRegion}
      timeframe={timeframe}
      setTimeframe={setTimeframe}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      tabs={tabs}
    >
      {/* Content Injection */}
      {loading && (
        <div className="flex flex-col items-center justify-center h-96 bg-white rounded-3xl shadow-sm border border-gray-100">
          <Loader2 className="h-12 w-12 animate-spin text-[#ffda00] mb-4" />
          <p className="text-gray-500 font-medium text-lg">Actualizando epidemiología en tiempo real...</p>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error de Conexión</AlertTitle>
          <AlertDescription>{error}. Por favor verifica tu conexión e intenta nuevamente.</AlertDescription>
        </Alert>
      )}

      {!loading && !error && data && (
        <>
          {activeTab === 'panorama' && <PanoramaView kpi={data.kpi} evolution={data.evolution_chart} radar={data.radar_dimensions} />}
          {activeTab === 'indicadores' && <IndicadoresView data={data.indicators} />}
          {activeTab === 'diagnostico' && <DiagnosticoView data={data.detailed_metrics} />}
          {activeTab === 'colaboradores' && <ColaboradoresView />}
          {activeTab === 'geografico' && (
            <div className="flex flex-col items-center justify-center h-[500px] bg-slate-50 rounded-3xl border-2 border-dashed border-gray-200">
              <div className="bg-white p-6 rounded-full shadow-sm mb-6">
                <Map className="h-16 w-16 text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-600">Mapa de Calor Geográfico</h3>
              <p className="text-gray-400 mt-2 text-lg">Visualización geográfica no disponible en esta versión de API.</p>
            </div>
          )}
        </>
      )}
    </MapaLayout>
  );
}
