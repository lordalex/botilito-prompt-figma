// BadgesTab.tsx
// Fase 6: BadgesTab
// Archivo generado según el plan de desarrollo

import React from 'react';
import { Badge } from '../types';

export interface BadgesTabProps {
  badges: Badge[];
  totalPI: number;
}

const TIER_LABELS: Record<string, string> = {
  bronze: 'Insignias Bronce',
  silver: 'Insignias Plata',
  gold: 'Insignias Oro',
  platinum: 'Insignias Platino',
  diamond: 'Insignias Diamante',
};

const TIER_COLORS: Record<string, string> = {
  bronze: 'border-[#CD7F32] text-[#CD7F32] bg-[#FFF8F0]',
  silver: 'border-[#C0C0C0] text-[#C0C0C0] bg-[#F8F8F8]',
  gold: 'border-[#FFD700] text-[#FFD700] bg-[#FFFDE7]',
  platinum: 'border-[#E5E4E2] text-[#E5E4E2] bg-[#F4F4F4]',
  diamond: 'border-[#B9F2FF] text-[#3B82F6] bg-[#F0F9FF]',
};

export const BadgesTab: React.FC<BadgesTabProps> = ({ badges, totalPI }) => {
  const totalBadges = badges.length;
  const unlockedBadges = badges.filter(b => b.unlocked).length;

  // Agrupar insignias por tier
  const grouped = badges.reduce<Record<string, Badge[]>>((acc, badge) => {
    acc[badge.tier] = acc[badge.tier] || [];
    acc[badge.tier].push(badge);
    return acc;
  }, {});

  return (
    <div className="w-full max-w-7xl mx-auto py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold text-gray-900 text-base">
          Mis Insignias
        </span>
        <span className="text-sm text-gray-700">
          {unlockedBadges} de {totalBadges} insignias desbloqueadas ({totalPI} PI ganados)
        </span>
      </div>

      {/* Secciones por tier */}
      {Object.keys(TIER_LABELS).map(tier => (
        <div key={tier} className="mb-8">
          <h3 className={`text-sm font-bold mb-3 ${TIER_COLORS[tier]}`}>{TIER_LABELS[tier]}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(grouped[tier] || []).map((badge, idx) => {
              const isUnlocked = badge.unlocked;
              return (
                <div
                  key={badge.id || idx}
                  className={`border rounded-xl p-4 flex flex-col gap-2 shadow-sm ${TIER_COLORS[tier]} ${isUnlocked ? '' : 'opacity-60'}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${isUnlocked ? TIER_COLORS[tier] : 'border-gray-300 bg-gray-100'}`}>
                      {badge.icon ? (
                        <img src={badge.icon} alt={badge.name} className="w-6 h-6" />
                      ) : (
                        <span className="text-xs font-bold text-gray-700">{badge.name[0]}</span>
                      )}
                    </div>
                    <span className="font-semibold text-gray-900 text-base">{badge.name}</span>
                  </div>
                  <span className="text-xs text-gray-600 mb-1">{badge.description}</span>
                  <span className="text-xs text-gray-500 mb-1">{badge.requirement}</span>
                  {/* Estado visual y PI */}
                  <div className="flex items-center justify-between mt-2">
                    {isUnlocked ? (
                      <span className="text-green-600 text-xs font-bold flex items-center gap-1">✓ Desbloqueada</span>
                    ) : (
                      <span className="text-gray-400 text-xs font-bold flex items-center gap-1">🔒 Bloqueada</span>
                    )}
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ml-2 ${isUnlocked ? 'bg-orange-200 text-orange-800' : 'bg-gray-200 text-gray-500'}`}>+{badge.piReward} PI</span>
                  </div>
                  {/* Fecha de desbloqueo */}
                  {isUnlocked && badge.unlockedAt && (
                    <span className="text-xs text-gray-500 mt-1">{new Date(badge.unlockedAt).toLocaleDateString('es-ES')}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
