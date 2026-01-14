// SummaryTab.tsx
// Fase 5: SummaryTab
// Archivo generado según el plan de desarrollo

import React from 'react';
import { Badge, Achievement } from '../types';

export interface SummaryTabProps {
  streak: { current: number; best: number };
  recentBadges: Badge[];
  achievementsInProgress: Achievement[];
}

// Componente base (estructura, sin UI ni lógica interna)
export const SummaryTab: React.FC<SummaryTabProps> = (props) => {
  // Estructura base, sin implementación UI
  return (
    <div>
      {/* Header sección: "Resumen de Actividad" + subtítulo */}
      {/* Streak Card: card naranja con días y mejor racha */}
      {/* Recent Badges: grid 2x2 últimas 4 insignias con fecha + PI */}
      {/* Achievements In Progress: 3 cards con barra progreso + % */}
      {/* TODO: Implementar UI según plan en siguientes fases */}
      <span>SummaryTab (estructura base)</span>
    </div>
  );
}
