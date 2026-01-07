import React from 'react';
import bannersConfig from '@/config/banners.json';
import { getBotIcon } from '@/utils/botIcons';
import { Info } from 'lucide-react';

export interface TabDefinition {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface UnifiedDashboardLayoutProps {
  pageKey: keyof typeof bannersConfig;
  tabs?: TabDefinition[];
  activeTab?: string;
  onTabChange?: (id: any) => void;
  headerContent?: React.ReactNode; 
  children: React.ReactNode;
  lastUpdate?: string;
}

export function UnifiedDashboardLayout({
  pageKey,
  tabs,
  activeTab,
  onTabChange,
  headerContent,
  children,
  lastUpdate
}: UnifiedDashboardLayoutProps) {
  
  const config = bannersConfig[pageKey];
  const botIcon = getBotIcon(config.botImage);

  return (
    <div className="min-h-screen bg-white font-sans pb-12">
      
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        
        {/* --- 1. SLIM CONTAINED BANNER --- */}
        <div className="w-full bg-[#ffe97a] rounded-xl border border-yellow-400/50 p-4 md:p-6 mb-8 relative flex flex-col md:flex-row items-center gap-6 overflow-hidden shadow-sm">
            
            {/* Mascot - Positioned for layout */}
            <div className="shrink-0 relative z-10 -ml-2 md:-ml-4">
               <img src={botIcon} alt="Botilito" className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-md" />
            </div>

            {/* Text Content */}
            <div className="flex-1 text-center md:text-left relative z-10">
               <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight mb-2">
                 {config.speechBubble}
               </h1>
               
               <p className="text-gray-800 text-sm leading-relaxed opacity-90 max-w-4xl hidden md:block">
                 {config.subtitle}
               </p>

               {/* Injected Header Content (e.g. Filters) */}
               {headerContent && (
                 <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
                   {headerContent}
                 </div>
               )}
            </div>
        </div>

        {/* --- 2. SUB-NAVIGATION (Optional) --- */}
        {tabs && tabs.length > 0 && onTabChange && (
          <div className="mb-8 border-b border-gray-100 pb-1">
             <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => onTabChange(tab.id)}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap
                        ${isActive 
                          ? 'bg-yellow-400 text-black shadow-sm' 
                          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                      `}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? 'text-black' : 'text-gray-400'}`} />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
             </div>
          </div>
        )}

        {/* --- 3. MAIN CONTENT --- */}
        <main className="min-h-[500px]">
          {children}
        </main>

        {/* --- 4. FOOTER --- */}
        <footer className="mt-12 pt-8 border-t border-gray-100">
          <div className="flex items-center justify-center gap-2 text-gray-400 text-xs font-medium">
            <Info className="h-4 w-4" />
            <p>
              Botilito Platform • Datos sincronizados en tiempo real. Última actualización: {lastUpdate || new Date().toLocaleTimeString()}
            </p>
          </div>
        </footer>

      </div>
    </div>
  );
}
