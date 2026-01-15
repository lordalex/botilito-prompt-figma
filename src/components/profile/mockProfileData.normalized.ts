import type { ProfileData, Badge, Achievement } from './types';
import { mockProfileData } from './mockProfileData';

function toDate(value: unknown): Date | undefined {
  if (typeof value !== 'string' || value.trim() === '') return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function normalizeBadges(): Badge[] {
  const rawBadges = Array.isArray((mockProfileData as any).badges) ? (mockProfileData as any).badges : [];
  return rawBadges
    .filter((b: any) => b && typeof b === 'object')
    .map((b: any) => ({
      id: typeof b.id === 'string' ? b.id : '',
      name: typeof b.name === 'string' ? b.name : '',
      icon: typeof b.icon === 'string' ? b.icon : '',
      tier: (b.tier === 'bronze' || b.tier === 'silver' || b.tier === 'gold' || b.tier === 'platinum' || b.tier === 'diamond') ? b.tier : 'bronze',
      unlocked: typeof b.unlocked === 'boolean' ? b.unlocked : false,
      unlockedAt: toDate(b.unlockedAt),
      piReward: typeof b.piReward === 'number' && Number.isFinite(b.piReward) ? b.piReward : 0,
      description: typeof b.description === 'string' ? b.description : '',
      requirement: typeof b.requirement === 'string' ? b.requirement : '',
    }));
}

function normalizeAchievements(): Achievement[] {
  const rawAchievements = Array.isArray((mockProfileData as any).achievements)
    ? (mockProfileData as any).achievements
    : [];

  return rawAchievements
    .filter((a: any) => a && typeof a === 'object')
    .map((a: any) => ({
      id: typeof a.id === 'string' ? a.id : '',
      name: typeof a.name === 'string' ? a.name : '',
      description: typeof a.description === 'string' ? a.description : '',
      icon: typeof a.icon === 'string' ? a.icon : '',
      current: typeof a.current === 'number' && Number.isFinite(a.current) ? a.current : 0,
      target: typeof a.target === 'number' && Number.isFinite(a.target) ? a.target : 0,
      piReward: typeof a.piReward === 'number' && Number.isFinite(a.piReward) ? a.piReward : 0,
      completed: typeof a.completed === 'boolean' ? a.completed : false,
    }));
}

export const mockProfileDataNormalized: ProfileData = {
  user: {
    id: (mockProfileData as any).id ?? '',
    displayName: (mockProfileData as any).nombre_completo ?? '',
    email: (mockProfileData as any).email ?? '',
    avatarUrl: (mockProfileData as any).photo ?? (mockProfileData as any).avatar ?? '',
    level: 1,
    rank: (mockProfileData as any).stats?.next_rank_progress?.label ?? '',
    region: (mockProfileData as any).ciudad ?? '',
    memberSince: new Date((mockProfileData as any).fecha_nacimiento ?? Date.now()),
    bio: (mockProfileData as any).departamento ?? '',
  },
  gamification: {
    currentPI: (mockProfileData as any).xp ?? 0,
    nextRankPI: (mockProfileData as any).stats?.next_rank_progress?.target ?? 0,
    nextRankName: (mockProfileData as any).stats?.next_rank_progress?.label ?? '',
    ranking: (mockProfileData as any).stats?.global_ranking ?? 0,
    totalUsers: (mockProfileData as any).stats?.total_users ?? 0,
    currentStreak: (mockProfileData as any).current_streak ?? 0,
    bestStreak: (mockProfileData as any).best_streak ?? 0,
  },
  stats: {
    casesRegistered: (mockProfileData as any).stats?.cases_registered ?? 0,
    validations: (mockProfileData as any).stats?.validations_performed ?? 0,
    consensusAverage: 0,
    deepfakesDetected: 0,
    caseViews: 0,
  },
  badges: normalizeBadges(),
  achievements: normalizeAchievements(),
};
