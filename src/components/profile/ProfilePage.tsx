// ProfilePage.tsx
// Fase 9: ProfilePage (Integración)
// Archivo generado según el plan de desarrollo

import React from 'react';
import { ProfileHeader } from './ProfileHeader';
import { BadgesAndKPI } from './BadgesAndKPI';
import { ProfileTabs } from './ProfileTabs';
import { Separator } from '../ui/separator';
import { useProfile } from '../../hooks/useProfile';
import { BotilitoBanner } from '../ui/botilito-validation-banner';

const ProfilePage: React.FC = () => {
  const { data: profileData, loading, error, refresh } = useProfile();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Skeleton minimal */}
        <div className="animate-pulse space-y-6">
          <div className="h-16 bg-gray-200 rounded w-1/2" />
          <div className="h-10 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold mb-2">Error al cargar el perfil</h2>
          <p>{error}</p>
          <p className="mt-2 text-sm">Por favor, intenta recargar la página o contacta soporte si el problema persiste.</p>
        </div>
      </div>
    );
  }

  if (!profileData) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Banner: BotilitoValidationBanner (placeholder) */}
      <BotilitoBanner text="Perfil de usuario" />

      {/* Composición principal */}
      <div className="rounded-lg p-6 border-primary border-2">
        {/* Adaptar props según el nuevo mockProfileData */}
        <ProfileHeader
          avatarUrl={profileData.user.avatarUrl}
          displayName={profileData.user.displayName}
          email={profileData.user.email}
          level={profileData.user.level}
          rank={profileData.user.rank}
          region={profileData.user.region}
          memberSince={profileData.user.memberSince}
          bio={profileData.user.bio}
          currentPI={profileData.gamification.currentPI}
          nextRankPI={profileData.gamification.nextRankPI}
          nextRankName={profileData.gamification.nextRankName}
          ranking={profileData.gamification.ranking}
          totalUsers={profileData.gamification.totalUsers}
        />
        <Separator />
        <div className="mt-8">
          <BadgesAndKPI
            badges={profileData.badges}
            stats={{
              casesRegistered: profileData.stats.casesRegistered,
              validations: profileData.stats.validations,
              currentStreak: profileData.gamification.currentStreak,
              ranking: profileData.gamification.ranking,
            }}
          />
        </div>
      </div>
      <div className="mt-8">
        <ProfileTabs profileData={profileData} loading={loading} error={error} refresh={refresh} />
      </div>
    </div>
  );
};

export default ProfilePage;
