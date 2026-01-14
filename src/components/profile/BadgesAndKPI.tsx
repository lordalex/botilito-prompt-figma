// BadgesAndKPI.tsx
// Fase 3: BadgesAndKPI
// Archivo generado según el plan de desarrollo

import React from 'react';
import { Badge } from './types';

export interface BadgesAndKPIProps {
  badges: Badge[];
  stats: {
    casesRegistered: number;
    validations: number;
    currentStreak: number;
    ranking: number;
  };
}

// Componente base (estructura, sin UI ni lógica interna)
export const BadgesAndKPI: React.FC<BadgesAndKPIProps> = (props) => {
  // Estructura base, sin implementación UI
  return (
    <div>
      {/* Header insignias: "Insignias Ganadas (X/Y)" + badge "+Z PI" */}
      {/* Badge icons strip: fila de 15 iconos circulares */}
      {/* Quick Stats grid: 4 cards (Casos, Validaciones, Racha, Ranking) */}
      {/* TODO: Implementar UI según plan en siguientes fases */}
      <span>BadgesAndKPI (estructura base)</span>
    </div>
  );
}
