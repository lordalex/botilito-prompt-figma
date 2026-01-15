import React, { useState } from 'react';
import { Award, Trophy, BarChart3, Activity } from 'lucide-react';
import { SummaryTab } from './tabs/SummaryTab';
import { BadgesTab } from './tabs/BadgesTab';
import { AchievementsTab } from './tabs/AchievementsTab';
import { StatsTab } from './tabs/StatsTab';
import type { ProfileTabsProps } from './types';

const TABS = [
  { key: 'resumen', label: 'Resumen', icon: Activity },
  { key: 'insignias', label: 'Insignias', icon: Award },
  { key: 'logros', label: 'Logros', icon: Trophy },
  { key: 'estadisticas', label: 'Estadísticas', icon: BarChart3 },
];

function getUnlockedBadgesTotalPI(badges: Array<{ unlocked: boolean; piReward: number }>): number {
  return badges.filter((b) => b.unlocked).reduce((acc, b) => acc + (Number.isFinite(b.piReward) ? b.piReward : 0), 0);
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({ profileData }) => {
  const [activeTab, setActiveTab] = useState('resumen');

  if (!profileData) return null;

  const unlockedBadges = profileData.badges.filter((b) => b.unlocked);
  const recentBadges = unlockedBadges.slice(0, 2);

  const achievementsInProgress = profileData.achievements.filter((a) => !a.completed).slice(0, 3);
  const achievementsCompletedCount = profileData.achievements.filter((a) => a.completed).length;

  const totalPIFromBadges = getUnlockedBadgesTotalPI(profileData.badges);

  const ranking = profileData.gamification.ranking;
  const totalUsers = profileData.gamification.totalUsers;
  const topPercent = totalUsers > 0 && ranking > 0
    ? Math.min(100, Math.max(1, Math.round((ranking / totalUsers) * 100)))
    : 0;

  // Lazy loading: solo renderizar el contenido del tab activo
  const renderTabContent = () => {
    switch (activeTab) {
      case 'resumen':
        return (
          <SummaryTab
            streak={{
              current: profileData.gamification.currentStreak,
              best: profileData.gamification.bestStreak,
            }}
            recentBadges={recentBadges}
            achievementsInProgress={achievementsInProgress}
          />
        );
      case 'insignias':
        return <BadgesTab badges={profileData.badges} totalPI={totalPIFromBadges} />;
      case 'logros':
        return <AchievementsTab achievements={profileData.achievements} />;
      case 'estadisticas':
        return (
          <StatsTab
            generalStats={profileData.stats}
            rankingStats={{
              ranking: profileData.gamification.ranking,
              totalUsers: profileData.gamification.totalUsers,
              topPercent,
              currentStreak: profileData.gamification.currentStreak,
              bestStreak: profileData.gamification.bestStreak,
              badgesCount: unlockedBadges.length,
              achievementsCount: achievementsCompletedCount,
              totalPI: profileData.gamification.currentPI,
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto mt-6">
      {/* Floating Navigation Tabs */}
      <div className="relative z-20 flex justify-center px-4 w-full pb-4">
        <div className="bg-gray-100 backdrop-blur-sm p-1 rounded-full shadow-sm border border-gray-200 flex items-center justify-center w-full">
          <div className="flex items-center gap-1 w-full">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap
                    ${
                      isActive
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50/50 hover:text-gray-900'
                    }
                  `}
                  type="button"
                  aria-selected={isActive}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-gray-900' : 'text-gray-500'}`} />
                  <span className="text-xs">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-[400px]">
        {renderTabContent()}
      </div>
    </div>
  );
};
