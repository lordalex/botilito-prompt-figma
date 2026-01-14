// ProfileTabs.tsx
// Fase 4: ProfileTabs (Contenedor)
// Archivo generado según el plan de desarrollo

import React, { useState } from 'react';

const TABS = [
  { key: 'resumen', label: 'Resumen' },
  { key: 'insignias', label: 'Insignias' },
  { key: 'logros', label: 'Logros' },
  { key: 'estadisticas', label: 'Estadísticas' },
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
      <div className="flex items-center border-b border-gray-200 mb-2">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`px-6 py-2 font-medium text-sm rounded-t transition-colors duration-200 focus:outline-none
              ${activeTab === tab.key
                ? 'bg-yellow-300 text-yellow-900 border-b-2 border-yellow-400'
                : 'bg-transparent text-gray-700 hover:bg-yellow-100'}`}
            onClick={() => setActiveTab(tab.key)}
            type="button"
            aria-selected={activeTab === tab.key}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-b shadow p-4 min-h-[120px]">
        {renderTabContent()}
      </div>
    </div>
  );
}
