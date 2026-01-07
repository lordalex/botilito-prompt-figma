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
