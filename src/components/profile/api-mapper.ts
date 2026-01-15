// api-mapper.ts
// Transforma la respuesta real de la API a los tipos normalizados de UI

import {
  ProfileAPIResponse,
  ProfileData,
  Badge,
  Achievement,
  ChallengeProgressAPI,
} from './types';
import { BADGES_BY_NAME } from './badges.config';

function safeBadge(name: string, unlocked: boolean, idx: number): Badge {
  const meta = BADGES_BY_NAME[name];
  return {
    id: `badge-${idx}`,
    name,
    icon: typeof meta?.icon === 'string' ? meta.icon : '',
    tier: meta?.tier ?? 'bronze',
    unlocked,
    unlockedAt: undefined, // No viene de API
    piReward: meta?.piReward ?? 0,
    description: meta?.description ?? '',
    requirement: meta?.requirement ?? '',
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
    icon: '',
    current: Number.isFinite(ch.percent) ? Math.round(ch.percent) : Number.NaN,
    target: 100,
    piReward: (() => {
      const parsed = parseInt(ch.reward_display.replace(/[^\d]/g, ''), 10);
      return Number.isFinite(parsed) ? parsed : Number.NaN;
    })(),
    completed: ch.completed,
  }));
}

function isEmptyString(value: unknown): value is '' {
  return typeof value === 'string' && value.trim() === '';
}

function isNonFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isFinite(value);
}

// Utilidad para fallback seguro (NO sobreescribe valores reales)
function fallback<T>(apiValue: T | undefined | null, mockValue: T): T {
  if (apiValue === undefined || apiValue === null) return mockValue;
  if (isEmptyString(apiValue)) return mockValue;
  if (isNonFiniteNumber(apiValue)) return mockValue;
  return apiValue;
}

function mergeAchievementsWithMock(apiAchievements: Achievement[], mockAchievements?: Achievement[]): Achievement[] {
  if (!mockAchievements || mockAchievements.length === 0) return apiAchievements;

  const mockById = new Map<string, Achievement>();
  const mockByName = new Map<string, Achievement>();
  for (const m of mockAchievements) {
    if (m.id) mockById.set(m.id, m);
    if (m.name) mockByName.set(m.name, m);
  }

  return apiAchievements.map((a) => {
    const m = mockById.get(a.id) ?? mockByName.get(a.name);
    if (!m) return a;

    return {
      ...a,
      name: fallback(a.name, m.name),
      description: fallback(a.description, m.description),
      icon: fallback(a.icon, m.icon),
      current: fallback(a.current, m.current),
      target: fallback(a.target, m.target),
      piReward: fallback(a.piReward, m.piReward),
      completed: a.completed,
    };
  });
}

// Nuevo: acepta mockProfileData como segundo argumento para fallback
export function transformAPIToProfileData(apiResponse: ProfileAPIResponse, mockProfileData?: ProfileData): ProfileData {
  const { data, challenges_progress } = apiResponse;
  const mock = mockProfileData;

  const apiAchievements =
    challenges_progress && challenges_progress.length > 0
      ? mapAchievementsFromAPI(challenges_progress)
      : undefined;

  const achievements = apiAchievements
    ? mergeAchievementsWithMock(apiAchievements, mock?.achievements)
    : (mock?.achievements ?? []);

  return {
    user: {
      id: fallback(data.id, mock?.user.id ?? ''),
      displayName: fallback(data.nombre_completo, mock?.user.displayName ?? ''),
      email: fallback(data.email, mock?.user.email ?? ''),
      avatarUrl: fallback(data.photo, mock?.user.avatarUrl ?? ''),
      level: mock?.user.level ?? 1, // MOCK siempre
      rank: fallback(data.stats.next_rank_progress.label, mock?.user.rank ?? ''),
      region: fallback(data.ciudad, mock?.user.region ?? ''),
      memberSince: mock?.user.memberSince ?? new Date(), // MOCK siempre
      bio: mock?.user.bio ?? '', // MOCK siempre
    },
    gamification: {
      currentPI: fallback(data.xp, mock?.gamification.currentPI ?? 0),
      nextRankPI: fallback(data.stats.next_rank_progress.target, mock?.gamification.nextRankPI ?? 0),
      nextRankName: mock?.gamification.nextRankName ?? '', // MOCK siempre
      ranking: fallback(data.stats.global_ranking, mock?.gamification.ranking ?? 0),
      totalUsers: fallback(data.stats.total_users, mock?.gamification.totalUsers ?? 0),
      currentStreak: fallback(data.current_streak, mock?.gamification.currentStreak ?? 0),
      bestStreak: fallback(data.best_streak, mock?.gamification.bestStreak ?? 0),
    },
    stats: {
      casesRegistered: fallback(data.stats.cases_registered, mock?.stats.casesRegistered ?? 0),
      validations: fallback(data.stats.validations_performed, mock?.stats.validations ?? 0),
      consensusAverage: mock?.stats.consensusAverage ?? 0, // MOCK siempre
      deepfakesDetected: mock?.stats.deepfakesDetected ?? 0, // MOCK siempre
      caseViews: mock?.stats.caseViews ?? 0, // MOCK siempre
    },
    badges:
      data.badges && data.badges.length > 0
        ? mapBadgesFromAPI(data.badges)
        : (mock?.badges ?? []),
    achievements,
  };
}
