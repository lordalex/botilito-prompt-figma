export interface ProfileTabsProps {
  profileData: ProfileData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export interface ProfileTabComponentProps {
  profileData: ProfileData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}
// ============================================
// INTERFACES DE API (respuesta del backend)
// ============================================

/** Respuesta del endpoint GET /profileCRUD */
export interface ProfileAPIResponse {
  data: UserProfileAPI;
  challenges_progress: ChallengeProgressAPI[];
}

/** Modelo del perfil desde la API */
export interface UserProfileAPI {
  id: string;
  email: string;
  nombre_completo: string;
  ciudad: string;
  photo?: string;
  xp: number;
  current_streak: number;
  best_streak: number;
  badges: string[];  // Solo nombres de insignias
  stats: {
    cases_registered: number;
    validations_performed: number;
    global_ranking: number;
    total_users: number;
    next_rank_progress: {
      current: number;
      target: number;
      label: string;
    };
  };
}

/** Progreso de retos desde la API */
export interface ChallengeProgressAPI {
  id: string;
  title: string;
  description: string;
  badge_name: string;
  completed: boolean;
  percent: number;
  reward_display: string;  // "+150 PI"
}
// Tipos base para Perfil de Usuario

export interface ProfileData {
  user: {
    id: string;
    displayName: string;
    email: string;
    avatarUrl: string;
    level: number;
    rank: string;
    region: string;
    memberSince: Date; // Unificado: siempre Date
    bio: string;
  };
  gamification: {
    currentPI: number;
    nextRankPI: number;
    nextRankName: string;
    ranking: number;
    totalUsers: number;
    currentStreak: number;
    bestStreak: number;
  };
  stats: {
    casesRegistered: number;
    validations: number;
    consensusAverage: number;
    deepfakesDetected: number;
    caseViews: number;
  };
  badges: Badge[];
  achievements: Achievement[];
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  unlocked: boolean;
  unlockedAt?: Date;
  piReward: number;
  description: string;
  requirement: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  current: number;
  target: number;
  piReward: number;
  completed: boolean;
}

// Interfaz para stats rápidos (Quick Stats)
export interface UserStats {
  casesRegistered: number;
  validations: number;
  currentStreak: number;
  ranking: number;
}
