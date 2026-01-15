import React from 'react';
import {
  Target,
  Calendar,
  BookOpen,
  Shield,
  CheckCircle,
  Eye,
  Users,
  TrendingUp,
  Zap,
  Award,
  Star,
  Crown,
  Gem,
  Lock,
  Flame,
} from 'lucide-react';
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
  return badges.filter((b) => b.unlocked).reduce((acc, b) => acc + b.piReward, 0);
}

export const BadgesAndKPI: React.FC<BadgesAndKPIProps> = ({ badges, stats }) => {
  // Siempre mostrar 15 iconos: badges reales + placeholders locked
  const TOTAL_BADGES = 15;
  const realBadges = badges.slice(0, TOTAL_BADGES);
  const placeholdersNeeded = Math.max(0, TOTAL_BADGES - realBadges.length);
  
  const placeholders = Array.from({ length: placeholdersNeeded }, (_, idx) => ({
    id: `placeholder-${idx}`,
    name: `Insignia ${idx + 1}`,
    icon: '',
    tier: 'bronze' as const,
    unlocked: false,
    piReward: 0,
    description: '',
    requirement: '',
  }));

  // Combinar reales + placeholders, ordenar unlocked primero
  const displayBadges = [...realBadges, ...placeholders].sort((a, b) =>
    a.unlocked === b.unlocked ? 0 : a.unlocked ? -1 : 1
  );

  const totalBadges = TOTAL_BADGES;
  const unlockedBadges = realBadges.filter((b) => b.unlocked).length;
  const totalPI = getTotalPI(realBadges);

  // Colores por tier
  const tierColors: Record<string, string> = {
    unlocked: 'bg-amber-700',
    closest: 'bg-gray-400',
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
        {displayBadges.map((badge, idx) => {
          // Mapeo de iconos por índice
          const icons = [
            Target,
            Calendar,
            BookOpen,
            Shield,
            CheckCircle,
            Eye,
            Users,
            TrendingUp,
            Zap,
            Award,
            Star,
            Crown,
            Gem,
            Lock,
            Flame,
          ];
          const IconComponent = icons[idx % icons.length];

          return (
            <div
              key={badge.id || idx}
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                badge.unlocked ? tierColors.unlocked : tierColors.locked
              } shadow-md`}
              title={badge.name}
            >
              <IconComponent
                className={`w-6 h-6 ${badge.unlocked ? 'text-white' : 'text-gray-400'}`}
                strokeWidth={2.5}
              />
            </div>
          );
        })}
      </div>

      {/* Quick Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col items-center">
          <Target className="w-8 h-8 text-blue-600 mb-2" strokeWidth={2} />
          <span className="text-2xl font-bold">{stats.casesRegistered}</span>
          <span className="text-xs text-gray-700 mt-2">Casos Registrados</span>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col items-center">
          <Users className="w-8 h-8 text-green-600 mb-2" strokeWidth={2} />
          <span className="text-2xl font-bold">{stats.validations}</span>
          <span className="text-xs text-gray-700 mt-2">Validaciones</span>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex flex-col items-center">
          <Flame className="w-8 h-8 text-orange-600 mb-2" strokeWidth={2} />
          <span className="text-2xl font-bold">{stats.currentStreak}</span>
          <span className="text-xs text-gray-700 mt-2">Racha Actual</span>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex flex-col items-center">
          <Award className="w-8 h-8 text-purple-600 mb-2" strokeWidth={2} />
          <span className="text-2xl font-bold">#{stats.ranking}</span>
          <span className="text-xs text-gray-700 mt-2">Ranking</span>
        </div>
      </div>
    </div>
  );
};
