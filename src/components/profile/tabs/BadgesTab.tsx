import React from 'react';
import { Badge } from '../types';
import { Award } from 'lucide-react';
import { TIER_ORDER, TIER_CONFIG, getBadgeByName, type BadgeTier } from '../badges.config';

export interface BadgesTabProps {
  badges: Badge[];
  totalPI: number;
}

export const BadgesTab: React.FC<BadgesTabProps> = ({ badges, totalPI }) => {
  const totalBadges = badges.length;
  const unlockedBadges = badges.filter((b) => b.unlocked).length;

  // Agrupar insignias por tier
  const grouped = badges.reduce<Record<BadgeTier, Badge[]>>((acc, badge) => {
    acc[badge.tier] = acc[badge.tier] || [];
    acc[badge.tier].push(badge);
    return acc;
  }, {} as Record<BadgeTier, Badge[]>);

  return (
    <div className="w-full mx-auto py-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Award className="w-5 h-5 text-primary" strokeWidth={2.5} />
          <h2 className="text-lg font-bold text-gray-900">Mis Insignias</h2>
        </div>
        <p className="text-sm text-gray-600">
          {unlockedBadges} de {totalBadges} insignias desbloqueadas ({totalPI} PI ganados)
        </p>
      </div>

      {/* Secciones por tier */}
      {TIER_ORDER.map((tier) => {
        const tierBadges = grouped[tier] || [];
        if (tierBadges.length === 0) return null;

        const tierConfig = TIER_CONFIG[tier];
        const tierColors = tierConfig.color;

        return (
          <div key={tier} className="mb-8">
            <h3 className={`text-sm font-bold mb-4 ${tierColors.text}`}>🏆 {tierConfig.labelPlural}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tierBadges.map((badge, idx) => {
                const isUnlocked = badge.unlocked;
                const badgeMetadata = getBadgeByName(badge.name);
                const IconComponent = badgeMetadata?.icon || Award;

                return (
                  <div
                    key={badge.id || idx}
                    className={`border ${tierColors.border} rounded-lg p-2 flex flex-col ${
                      isUnlocked ? 'bg-white' : 'bg-gray-50 opacity-70'
                    }`}
                  >
                    {/* Icon centered */}
                    <div className="flex justify-center mb-3">
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center ${
                          isUnlocked ? tierColors.iconBg : tierColors.iconBgLocked
                        }`}
                      >
                        <IconComponent className="w-9 h-9 text-white" strokeWidth={2} />
                      </div>
                    </div>

                    {/* Badge name */}
                    <h4 className="font-semibold text-gray-900 text-center text-base mb-2">{badge.name}</h4>

                    {/* Description */}
                    <p className="text-xs text-gray-600 text-center mb-2">{badge.description}</p>

                    {/* Requirement */}
                    <p className="text-xs text-gray-900 font-semibold text-center py-1 mb-3 border rounded-full">
                      {badge.requirement}
                    </p>

                    {/* Status row */}
                    <div className="w-full mb-2">
                      {isUnlocked ? (
                        <div className={`text-xs font-bold text-white ${tierColors.iconBg} py-1 rounded-full flex items-center justify-center gap-1`}>
                          ✓ Desbloqueado
                        </div>
                      ) : (
                        <div className="text-xs font-medium text-gray-500 bg-gray-200 py-1 rounded-full text-center">
                          {badge.piReward} PI
                        </div>
                      )}
                    </div>

                    {/* Date for unlocked badges */}
                    {isUnlocked && badge.unlockedAt && (
                      <div className="text-center text-xs text-gray-500">
                        {new Date(badge.unlockedAt).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
