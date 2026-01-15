// mockProfileData.ts
// Mock data for full Profile UI testing

export const mockProfileData = {
  id: "a1902d64-47c7-4629-b6cc-b8c49019a3b5",
  nombre_completo: "Gabriel Pino",
  numero_telefono: "584241279330",
  departamento: "test",
  ciudad: "test",
  fecha_nacimiento: "1994-12-15",
  email: "gabpno@gmail.com",
  password: null,
  role: "epidemiologo",
  confirmar_password: null,
  reputation: 0,
  xp: 101,
  badges: [
    {
      id: "badge-1",
      name: "Vigilante Bronce",
      tier: "bronze",
      icon: "/src/assets/badges/bronze.svg",
      piReward: 10,
      unlocked: true,
      unlockedAt: "2026-01-10T18:18:17.994+00:00",
      description: "Primer caso validado",
      requirement: "Validar 1 caso"
    },
    {
      id: "badge-2",
      name: "Analista Plata",
      tier: "silver",
      icon: "/src/assets/badges/silver.svg",
      piReward: 25,
      unlocked: false,
      unlockedAt: null,
      description: "Validar 10 casos",
      requirement: "Validar 10 casos"
    },
    {
      id: "badge-3",
      name: "Detective Oro",
      tier: "gold",
      icon: "/src/assets/badges/gold.svg",
      piReward: 50,
      unlocked: true,
      unlockedAt: "2026-01-12T14:00:00.000+00:00",
      description: "Detectar 1 deepfake",
      requirement: "Detectar 1 deepfake"
    },
    {
      id: "badge-4",
      name: "Maestro Platino",
      tier: "platinum",
      icon: "/src/assets/badges/platinum.svg",
      piReward: 100,
      unlocked: false,
      unlockedAt: null,
      description: "Validar 100 casos",
      requirement: "Validar 100 casos"
    },
    {
      id: "badge-5",
      name: "Leyenda Diamante",
      tier: "diamond",
      icon: "/src/assets/badges/diamond.svg",
      piReward: 250,
      unlocked: false,
      unlockedAt: null,
      description: "Validar 500 casos",
      requirement: "Validar 500 casos"
    }
  ],
  photo: "/src/assets/avatars/Avatars-11.svg",
  avatar: "/src/assets/avatars/Avatars-11.svg",
  current_streak: 7,
  last_activity_at: "2026-01-14T18:18:17.994+00:00",
  profile_rewarded: true,
  best_streak: 15,
  stats: {
    cases_registered: 12,
    validations_performed: 34,
    global_ranking: 4,
    total_users: 14,
    next_rank_progress: {
      current: 101,
      target: 501,
      label: "Cibernauta Novato"
    }
  },
  achievements: [
    {
      id: "ach-1",
      name: "Validación Inicial",
      description: "Completa tu primera validación de caso.",
      icon: "/src/assets/achievements/ach-1.svg",
      piReward: 10,
      current: 1,
      target: 1,
      percent: 100,
      completed: true
    },
    {
      id: "ach-2",
      name: "Racha de 7 días",
      description: "Mantén una racha de 7 días consecutivos de actividad.",
      icon: "/src/assets/achievements/ach-2.svg",
      piReward: 20,
      current: 7,
      target: 7,
      percent: 100,
      completed: true
    },
    {
      id: "ach-3",
      name: "Validaciones en progreso",
      description: "Alcanza 50 validaciones de casos.",
      icon: "/src/assets/achievements/ach-3.svg",
      piReward: 50,
      current: 34,
      target: 50,
      percent: 68,
      completed: false
    },
    {
      id: "ach-4",
      name: "Detective de Deepfakes",
      description: "Detecta 5 deepfakes.",
      icon: "/src/assets/achievements/ach-4.svg",
      piReward: 100,
      current: 1,
      target: 5,
      percent: 20,
      completed: false
    },
    {
      id: "ach-5",
      name: "Leyenda",
      description: "Completa 500 validaciones de casos.",
      icon: "/src/assets/achievements/ach-5.svg",
      piReward: 250,
      current: 34,
      target: 500,
      percent: 7,
      completed: false
    }
  ],
  summary: {
    streak: { current: 7, best: 15 },
    recentBadges: [
      {
        id: "badge-3",
        name: "Detective Oro",
        tier: "gold",
        icon: "/src/assets/badges/gold.svg",
        piReward: 50,
        unlocked: true,
        unlockedAt: "2026-01-12T14:00:00.000+00:00",
        description: "Detectar 1 deepfake",
        requirement: "Detectar 1 deepfake"
      },
      {
        id: "badge-1",
        name: "Vigilante Bronce",
        tier: "bronze",
        icon: "/src/assets/badges/bronze.svg",
        piReward: 10,
        unlocked: true,
        unlockedAt: "2026-01-10T18:18:17.994+00:00",
        description: "Primer caso validado",
        requirement: "Validar 1 caso"
      }
    ],
    achievementsInProgress: [
      {
        id: "ach-3",
        name: "Validaciones en progreso",
        description: "Alcanza 50 validaciones de casos.",
        icon: "/src/assets/achievements/ach-3.svg",
        piReward: 50,
        current: 34,
        target: 50,
        percent: 68,
        completed: false
      },
      {
        id: "ach-4",
        name: "Detective de Deepfakes",
        description: "Detecta 5 deepfakes.",
        icon: "/src/assets/achievements/ach-4.svg",
        piReward: 100,
        current: 1,
        target: 5,
        percent: 20,
        completed: false
      }
    ]
  },
  kpi: {
    totalPI: 180,
    unlockedBadges: 2,
    totalBadges: 5,
    completedAchievements: 2,
    totalAchievements: 5
  },
  generalStats: {
    casesRegistered: 12,
    validations: 34,
    consensusAverage: 87,
    deepfakesDetected: 1,
    caseViews: 42
  },
  rankingStats: {
    ranking: 4,
    totalUsers: 14,
    topPercent: 29,
    currentStreak: 7,
    bestStreak: 15,
    badgesCount: 2,
    achievementsCount: 2,
    totalPI: 180
  }
};
