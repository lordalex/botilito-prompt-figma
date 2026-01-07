import React from 'react';
import botilitoImage from '@/assets/e27a276e6ff0e187a67cf54678c265c1c38adbf7.png';
import { Info } from 'lucide-react';

interface TabItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface DashboardLayoutProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: any) => void;
  children: React.ReactNode;
  lastUpdate?: string;
  headerAction?: React.ReactNode;
}

export function DashboardLayout({
  tabs,
  activeTab,
  onTabChange,
  children,
  lastUpdate,
  headerAction
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50/20 font-sans pb-12">
      
      {/* 1. HERO BANNER */}
      <div className="w-full bg-[#ffe97a] pt-10 pb-20 border-b border-[#e5d053]">
        <div className="max-w-5xl mx-auto px-6 text-center">
          
          <div className="flex flex-col items-center gap-6 mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-black rounded-2xl border-4 border-black shadow-sm overflow-hidden flex items-center justify-center relative z-10 transform -rotate-2">
                 <img src={botilitoImage} alt="Botilito" className="w-full h-full object-contain scale-110" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-full h-full bg-black/10 rounded-2xl -z-10 transform rotate-2"></div>
            </div>

            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-3">
                ¡Qué hubo parce! 🗺️ Este es el Mapa Desinfodémico en tiempo real
              </h1>
              <p className="text-gray-800 font-medium leading-relaxed text-base">
                Acá podés ver el panorama epidemiológico de la desinformación: casos activos por región, indicadores de magnitud/alcance/impacto, rankings de colaboradores, y todo el análisis forense de contenidos. ¡Vamos a combatir la desinfodemia juntos! 💪🦠
              </p>
            </div>
          </div>

          {headerAction && (
            <div className="flex justify-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {headerAction}
            </div>
          )}

        </div>
      </div>

      {/* 2. SUB-NAVIGATION BAR (Floating Pill Overlapping) */}
      {/* Adjusted -mt to -6 to prevent cutting into the banner too much */}
      <div className="relative -mt-8 z-20 px-4 mb-8">
        <div className="max-w-5xl mx-auto bg-white p-2 rounded-full shadow-xl border border-gray-100 flex items-center justify-center w-full">
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide p-1 w-full justify-between md:justify-center">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap
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

      {/* 3. MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 min-h-[600px]">
        {children}
      </main>

      {/* 4. FOOTER */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-center gap-2 text-gray-400 text-sm py-8 border-t border-gray-200">
          <Info className="h-4 w-4" />
          <p>
            Datos sincronizados en tiempo real desde el nodo central. Última actualización: {lastUpdate || new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>

    </div>
  );
}
