import React, { useState } from 'react';
import { ExtensionPopup } from './ExtensionPopup';
import { InPageOverlay } from './InPageOverlay';
import { QuickAnalysisBadge } from './QuickAnalysisBadge';
import { ExtensionSettings } from './ExtensionSettings';

type ViewType = 'popup' | 'overlay' | 'badge' | 'settings';

export function ExtensionApp() {
  const [currentView, setCurrentView] = useState<ViewType>('popup');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Demo Controls */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md border-2 border-primary">
          <h2 className="text-lg mb-3">
            🎨 Vista Previa de Extensión de Navegador
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCurrentView('popup')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentView === 'popup'
                  ? 'bg-primary text-black'
                  : 'bg-secondary/40 hover:bg-secondary'
              }`}
            >
              Popup Principal
            </button>
            <button
              onClick={() => setCurrentView('overlay')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentView === 'overlay'
                  ? 'bg-primary text-black'
                  : 'bg-secondary/40 hover:bg-secondary'
              }`}
            >
              Overlay In-Page
            </button>
            <button
              onClick={() => setCurrentView('badge')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentView === 'badge'
                  ? 'bg-primary text-black'
                  : 'bg-secondary/40 hover:bg-secondary'
              }`}
            >
              Badge Rápido
            </button>
            <button
              onClick={() => setCurrentView('settings')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentView === 'settings'
                  ? 'bg-primary text-black'
                  : 'bg-secondary/40 hover:bg-secondary'
              }`}
            >
              Configuración
            </button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Estas son las interfaces que verán los usuarios en la extensión del navegador
          </p>
        </div>
      </div>

      {/* Current View */}
      <div className="flex justify-center items-start min-h-[600px]">
        {currentView === 'popup' && (
          <div className="shadow-2xl rounded-lg overflow-hidden border-4 border-black">
            <ExtensionPopup />
          </div>
        )}

        {currentView === 'overlay' && (
          <div className="relative w-full max-w-4xl h-[600px] bg-white rounded-lg shadow-inner p-8">
            <div className="text-center mb-4">
              <p className="text-muted-foreground">
                Simulación de página web con overlay de análisis
              </p>
            </div>
            <div className="prose max-w-none">
              <h1>Artículo de Ejemplo</h1>
              <p>
                Este es un ejemplo de cómo se vería el overlay de Botilito sobre 
                una página web real. El overlay aparece cuando se detecta contenido 
                sospechoso y puede ser posicionado estratégicamente.
              </p>
            </div>
            <InPageOverlay position={{ x: 50, y: 150 }} />
          </div>
        )}

        {currentView === 'badge' && (
          <div className="relative w-full max-w-4xl h-[600px] bg-white rounded-lg shadow-inner p-8">
            <div className="text-center mb-4">
              <p className="text-muted-foreground">
                Ejemplos de badges de verificación rápida
              </p>
            </div>
            <div className="space-y-8">
              <QuickAnalysisBadge 
                status="safe" 
                position={{ x: 100, y: 100 }}
              />
              <QuickAnalysisBadge 
                status="warning" 
                position={{ x: 100, y: 250 }}
              />
              <QuickAnalysisBadge 
                status="alert" 
                position={{ x: 100, y: 400 }}
              />
            </div>
          </div>
        )}

        {currentView === 'settings' && (
          <div className="w-full max-w-4xl">
            <ExtensionSettings />
          </div>
        )}
      </div>
    </div>
  );
}
