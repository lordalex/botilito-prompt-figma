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
      
      {/* Botilito Header - Styled Info Card */}
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-4">
        <div className="bg-[#ffe97a] border-2 border-[#ffda00] rounded-lg p-4 shadow-lg">
          <div className="flex items-center space-x-4">
            <img
              src={botilitoImage}
              alt="Botilito"
              className="w-24 h-24 object-contain mt-[0px] mr-[16px] mb-[-18px] ml-[0px]"
            />
            <div className="flex-1">
              <p className="text-xl">
                ¡Qué hubo parce! 🗺️ Este es el Mapa Desinfodémico en tiempo real
              </p>
              <p className="text-sm mt-1 opacity-80">
                Acá podés ver el panorama epidemiológico de la desinformación: casos activos por región, indicadores de magnitud/alcance/impacto, rankings de colaboradores, y todo el análisis forense de contenidos. ¡Vamos a combatir la desinfodemia juntos! 💪🦠
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Navigation Tabs - Simple clean design matching production */}
      <div className="relative z-20 flex justify-center px-4 w-full pb-4">
        <div className="bg-gray-100 backdrop-blur-sm p-1 rounded-full shadow-sm border border-gray-200 flex items-center justify-center w-full max-w-7xl">
          <div className="flex items-center gap-1 w-full">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`
                    flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-3 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap
                    ${isActive 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50/50 hover:text-gray-900'}
                  `}
                >
                  <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-gray-900' : 'text-gray-500'}`} />
                  {/* Mobile: solo icono, Desktop: icono + texto */}
                  <span className="hidden sm:inline lg:inline">{tab.label}</span>
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
