// api-mapper.ts
// Transforma la respuesta real de la API a los tipos normalizados de UI

import {
  ProfileAPIResponse,
  ProfileData,
  Badge,
  Achievement,
  ChallengeProgressAPI,
} from './types';
import { BADGES_METADATA } from './badges.config';

function safeBadge(name: string, unlocked: boolean, idx: number): Badge {
  const meta = BADGES_METADATA[name] || {};
  return {
    id: `badge-${idx}`,
    name,
    icon: meta.icon || '',
    tier: meta.tier || 'bronze',
    unlocked,
    unlockedAt: undefined, // No viene de API
    piReward: meta.piReward || 0,
    description: meta.description || '',
    requirement: meta.requirement || '',
  };
}

export function mapBadgesFromAPI(apiBadges: string[]): Badge[] {
  // Todos los badges de la API se consideran desbloqueados
  return apiBadges.map((name, idx) => safeBadge(name, true, idx));
}

export function mapAchievementsFromAPI(challenges: ChallengeProgressAPI[]): Achievement[] {
  return challenges.map((ch) => ({
    id: ch.id,
    name: ch.title,
    description: ch.description,
    icon: BADGES_METADATA[ch.badge_name]?.icon || '',
    current: Math.round(ch.percent),
    target: 100,
    piReward: parseInt(ch.reward_display.replace(/[^\d]/g, '')) || 0,
    completed: ch.completed,
  }));
}

export function transformAPIToProfileData(apiResponse: ProfileAPIResponse): ProfileData {
  const { data, challenges_progress } = apiResponse;
  return {
    user: {
      id: data.id,
      displayName: data.nombre_completo,
      email: data.email,
      avatarUrl: data.photo || '',
      level: 1, // MOCK
      rank: data.stats.next_rank_progress.label,
      region: data.ciudad,
      memberSince: new Date(), // MOCK
      bio: '', // MOCK
    },
    gamification: {
      currentPI: data.xp,
      nextRankPI: data.stats.next_rank_progress.target,
      nextRankName: '', // MOCK: derivar si hay config de rangos
      ranking: data.stats.global_ranking,
      totalUsers: data.stats.total_users,
      currentStreak: data.current_streak,
      bestStreak: data.best_streak,
    },
    stats: {
      casesRegistered: data.stats.cases_registered,
      validations: data.stats.validations_performed,
      consensusAverage: 0, // MOCK
      deepfakesDetected: 0, // MOCK
      caseViews: 0, // MOCK
    },
    badges: mapBadgesFromAPI(data.badges),
    achievements: mapAchievementsFromAPI(challenges_progress),
  };
}
