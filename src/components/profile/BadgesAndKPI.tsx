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

// Utilidad para contar PI total de insignias desbloqueadas
function getTotalPI(badges: Badge[]) {
  return badges.filter(b => b.unlocked).reduce((acc, b) => acc + b.piReward, 0);
}

export const BadgesAndKPI: React.FC<BadgesAndKPIProps> = ({ badges, stats }) => {
  const totalBadges = badges.length;
  const unlockedBadges = badges.filter(b => b.unlocked).length;
  const totalPI = getTotalPI(badges);

  // Colores por tier
  const tierColors: Record<string, string> = {
    bronze: 'bg-[#CD7F32]',
    silver: 'bg-[#C0C0C0]',
    gold: 'bg-[#FFD700]',
    platinum: 'bg-[#E5E4E2]',
    diamond: 'bg-[#B9F2FF]',
    locked: 'bg-gray-200',
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-4">
      {/* Header insignias */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 text-base">
            Insignias Ganadas ({unlockedBadges}/{totalBadges})
          </span>
        </div>
        <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow border border-yellow-300">
          +{totalPI} PI
        </span>
      </div>

      {/* Badge icons strip */}
      <div className="flex gap-3 mb-4 flex-wrap">
        {badges.map((badge, idx) => (
          <div
            key={badge.id || idx}
            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${badge.unlocked ? tierColors[badge.tier] : tierColors.locked} ${badge.unlocked ? 'border-yellow-400' : 'border-gray-300'} shadow`}
            title={badge.name}
          >
            {/* Icono: si hay, mostrar; si no, inicial */}
            {badge.icon ? (
              <img src={badge.icon} alt={badge.name} className="w-6 h-6" />
            ) : (
              <span className="text-xs font-bold text-gray-700">{badge.name[0]}</span>
            )}
          </div>
        ))}
      </div>

      {/* Quick Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col items-center">
          <span className="text-2xl font-bold text-blue-700">{stats.casesRegistered}</span>
          <span className="text-xs text-gray-700 mt-1">Casos Registrados</span>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col items-center">
          <span className="text-2xl font-bold text-green-700">{stats.validations}</span>
          <span className="text-xs text-gray-700 mt-1">Validaciones</span>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex flex-col items-center">
          <span className="text-2xl font-bold text-orange-700">{stats.currentStreak}</span>
          <span className="text-xs text-gray-700 mt-1">Racha Actual</span>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex flex-col items-center">
          <span className="text-2xl font-bold text-purple-700">#{stats.ranking}</span>
          <span className="text-xs text-gray-700 mt-1">Ranking</span>
        </div>
      </div>
    </div>
  );
}
