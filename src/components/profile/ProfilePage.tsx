// ProfilePage.tsx
// Fase 9: ProfilePage (Integración)
// Archivo generado según el plan de desarrollo

import React, { useState, useEffect } from 'react';
import { ProfileHeader } from './ProfileHeader';
import { BadgesAndKPI } from './BadgesAndKPI';
import { ProfileTabs } from './ProfileTabs';
import { Separator } from '../ui/separator';
import { mockProfileData } from './mockProfileData';

const ProfilePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);


  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      setProfile(mockProfileData);
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

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

  if (!profile) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Banner: BotilitoValidationBanner (placeholder) */}
      <div className="mb-6">
        <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-center text-sm">
          <span>Espacio reservado para el banner de validación de Botilito</span>
        </div>
      </div>

      {/* Composición principal */}
      <div className="rounded-lg p-6 border-primary border-2">
        {/* Adaptar props según el nuevo mockProfileData */}
        <ProfileHeader
          avatarUrl={profile.avatar}
          displayName={profile.nombre_completo}
          email={profile.email}
          level={profile.xp}
          rank={profile.role}
          region={profile.ciudad}
          memberSince={new Date(profile.fecha_nacimiento)}
          bio={profile.departamento}
          currentPI={profile.kpi?.totalPI || 0}
          nextRankPI={profile.stats?.next_rank_progress?.target || 0}
          nextRankName={profile.stats?.next_rank_progress?.label || ''}
          ranking={profile.rankingStats?.ranking || 0}
          totalUsers={profile.rankingStats?.totalUsers || 0}
        />
        <Separator />
        <div className="mt-8">
          <BadgesAndKPI
            badges={profile.badges}
            stats={{
              casesRegistered: profile.generalStats?.casesRegistered || 0,
              validations: profile.generalStats?.validations || 0,
              currentStreak: profile.rankingStats?.currentStreak || 0,
              ranking: profile.rankingStats?.ranking || 0,
            }}
          />
        </div>
      </div>
      <div className="mt-8">
        <ProfileTabs profileData={profile} />
      </div>
    </div>
  );
};

export default ProfilePage;
