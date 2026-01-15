import React, { useState } from 'react';
import { Award, BarChart3, Activity, Star } from 'lucide-react';

const TABS = [
  { key: 'resumen', label: 'Resumen', icon: Activity },
  { key: 'insignias', label: 'Insignias', icon: Award },
  { key: 'logros', label: 'Logros', icon: Star },
  { key: 'estadisticas', label: 'Estadísticas', icon: BarChart3 },
];

export const ProfileTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('resumen');

  // Lazy loading: solo renderizar el contenido del tab activo
  const renderTabContent = () => {
    switch (activeTab) {
      case 'resumen':
        return <div className="py-4">Contenido del Resumen</div>;
      case 'insignias':
        return <div className="py-4">Contenido de Insignias</div>;
      case 'logros':
        return <div className="py-4">Contenido de Logros</div>;
      case 'estadisticas':
        return <div className="py-4">Contenido de Estadísticas</div>;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto mt-6">
      {/* Floating Navigation Tabs */}
      <div className="relative z-20 flex justify-center px-4 w-full pb-4">
        <div className="bg-gray-100 backdrop-blur-sm p-1 rounded-full shadow-sm border border-gray-200 flex items-center justify-center w-full">
          <div className="flex items-center gap-1 w-full">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap
                    ${
                      isActive
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50/50 hover:text-gray-900'
                    }
                  `}
                  type="button"
                  aria-selected={isActive}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-gray-900' : 'text-gray-500'}`} />
                  <span className="text-xs">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-[400px]">
        {renderTabContent()}
      </div>
    </div>
  );
};
