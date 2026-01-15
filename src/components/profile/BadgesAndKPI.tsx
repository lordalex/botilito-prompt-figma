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
  // Si no hay badges del API, generar placeholders grises (15 por defecto según el plan)
  const displayBadges =
    badges.length > 0
      ? badges
      : Array.from({ length: 15 }, (_, idx) => ({
          id: `placeholder-${idx}`,
          name: `Insignia ${idx + 1}`,
          icon: '',
          tier: 'bronze' as const,
          unlocked: false,
          piReward: 0,
          description: '',
          requirement: '',
        }));

  const totalBadges = displayBadges.length;
  const unlockedBadges = displayBadges.filter((b) => b.unlocked).length;
  const totalPI = getTotalPI(displayBadges);

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
          ];
          const IconComponent = icons[idx % icons.length];

          return (
            <div
              key={badge.id || idx}
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                badge.unlocked ? tierColors[badge.tier] : tierColors.locked
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
