// StatsTab.tsx
// Fase 8: StatsTab
// Archivo generado según el plan de desarrollo

import React from 'react';

export interface StatsTabProps {
  generalStats: {
    casesRegistered: number;
    validations: number;
    consensusAverage: number;
    deepfakesDetected: number;
    caseViews: number;
  };
  rankingStats: {
    ranking: number;
    totalUsers: number;
    topPercent: number;
    currentStreak: number;
    bestStreak: number;
    badgesCount: number;
    achievementsCount: number;
    totalPI: number;
  };
}

// Componente base (estructura, sin UI ni lógica interna)
export const StatsTab: React.FC<StatsTabProps> = (props) => {
  // Estructura base, sin implementación UI
  return (
    <div>
      {/* Panel izquierdo: "Estadísticas Generales" - 5 filas con valores */}
      {/* Panel derecho: "Ranking y Logros" - cards con métricas */}
      {/* Ranking Card: #156 de 5,432 + "Top 3%" badge */}
      {/* PI Total Card: gran número + icono trofeo */}
      {/* TODO: Implementar UI según plan en siguientes fases */}
      <span>StatsTab (estructura base)</span>
    </div>
  );
}
