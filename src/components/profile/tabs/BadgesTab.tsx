// BadgesTab.tsx
// Fase 6: BadgesTab
// Archivo generado según el plan de desarrollo

import React from 'react';
import { Badge } from '../types';

export interface BadgesTabProps {
  badges: Badge[];
  totalPI: number;
}

// Componente base (estructura, sin UI ni lógica interna)
export const BadgesTab: React.FC<BadgesTabProps> = (props) => {
  // Estructura base, sin implementación UI
  return (
    <div>
      {/* Header: "X de Y insignias desbloqueadas (Z PI ganados)" */}
      {/* Section headers: por tier (Bronce, Plata, Oro, Platino, Diamante) */}
      {/* Badge Detail Card: icono, nombre, descripción, requisito, estado */}
      {/* Estados visuales: ✓ Desbloqueada (verde) / 🔒 Bloqueada (gris + PI) */}
      {/* TODO: Implementar UI según plan en siguientes fases */}
      <span>BadgesTab (estructura base)</span>
    </div>
  );
}
