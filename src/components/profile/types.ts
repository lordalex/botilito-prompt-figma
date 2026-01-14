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
