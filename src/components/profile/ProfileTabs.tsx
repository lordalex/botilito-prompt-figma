import React, { useState } from 'react';
import { Sparkles, Award, Trophy, BarChart3 } from 'lucide-react';
import { SummaryTab } from './tabs/SummaryTab';
import { BadgesTab } from './tabs/BadgesTab';
import { AchievementsTab } from './tabs/AchievementsTab';
import { StatsTab } from './tabs/StatsTab';

const TABS = [
  { key: 'resumen', label: 'Resumen', icon: Sparkles },
  { key: 'insignias', label: 'Insignias', icon: Award },
  { key: 'logros', label: 'Logros', icon: Trophy },
  { key: 'estadisticas', label: 'Estadísticas', icon: BarChart3 },
];

// TODO: Reemplazar estos mocks con datos reales desde ProfilePage
const mockStreak = { current: 0, best: 0 };
const mockBadges = [];
const mockAchievements = [];
const mockRecentBadges = [];
const mockAchievementsInProgress = [];
const mockGeneralStats = {
  casesRegistered: 0,
  validations: 0,
  consensusAverage: 0,
  deepfakesDetected: 0,
  caseViews: 0,
};
const mockRankingStats = {
  ranking: 0,
  totalUsers: 0,
  topPercent: 0,
  currentStreak: 0,
  bestStreak: 0,
  badgesCount: 0,
  achievementsCount: 0,
  totalPI: 0,
};

export const ProfileTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('resumen');

  // Lazy loading: solo renderizar el contenido del tab activo
  const renderTabContent = () => {
    switch (activeTab) {
      case 'resumen':
        return (
          <SummaryTab
            streak={mockStreak}
            recentBadges={mockRecentBadges}
            achievementsInProgress={mockAchievementsInProgress}
          />
        );
      case 'insignias':
        return <BadgesTab badges={mockBadges} totalPI={0} />;
      case 'logros':
        return <AchievementsTab achievements={mockAchievements} />;
      case 'estadisticas':
        return <StatsTab generalStats={mockGeneralStats} rankingStats={mockRankingStats} />;
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
