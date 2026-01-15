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
    // Bronze badges
    {
      id: "badge-bronze-1",
      name: "Primer Diagnóstico",
      tier: "bronze",
      icon: "/src/assets/badges/bronze.svg",
      piReward: 50,
      unlocked: true,
      unlockedAt: "2026-01-10T18:18:17.994+00:00",
      description: "Registra tu primer caso desinfodemico",
      requirement: "1 caso registrado"
    },
    {
      id: "badge-bronze-2",
      name: "Vigilante Constante",
      tier: "bronze",
      icon: "/src/assets/badges/bronze.svg",
      piReward: 100,
      unlocked: true,
      unlockedAt: "2026-01-09T14:00:00.000+00:00",
      description: "Registra casos durante 7 días consecutivos",
      requirement: "7 días de racha"
    },
    {
      id: "badge-bronze-3",
      name: "Explorador AMI",
      tier: "bronze",
      icon: "/src/assets/badges/bronze.svg",
      piReward: 75,
      unlocked: true,
      unlockedAt: "2026-01-08T10:00:00.000+00:00",
      description: "Aplica criterios AMI al analizar 5 casos de contenido",
      requirement: "5 casos analizados con enfoque AMI"
    },
    // Silver badges
    {
      id: "badge-silver-1",
      name: "Detector Serial",
      tier: "silver",
      icon: "/src/assets/badges/silver.svg",
      piReward: 200,
      unlocked: true,
      unlockedAt: "2026-01-07T12:00:00.000+00:00",
      description: "Registra 50 casos desinfodemicos",
      requirement: "50 casos registrados"
    },
    {
      id: "badge-silver-2",
      name: "Verificador Experto",
      tier: "silver",
      icon: "/src/assets/badges/silver.svg",
      piReward: 250,
      unlocked: true,
      unlockedAt: "2026-01-06T09:00:00.000+00:00",
      description: "Logra 80% de precisión en tus registros",
      requirement: "80% de precisión"
    },
    {
      id: "badge-silver-3",
      name: "Compromiso Inquebrantable",
      tier: "silver",
      icon: "/src/assets/badges/silver.svg",
      piReward: 400,
      unlocked: false,
      unlockedAt: null,
      description: "Mantén una racha de 30 días",
      requirement: "30 días de racha"
    },
    // Gold badges
    {
      id: "badge-gold-1",
      name: "Cazador de Deepfakes",
      tier: "gold",
      icon: "/src/assets/badges/gold.svg",
      piReward: 500,
      unlocked: false,
      unlockedAt: null,
      description: "Identifica correctamente 10 deepfakes",
      requirement: "10 deepfakes detectados"
    },
    {
      id: "badge-gold-2",
      name: "Validador Experto",
      tier: "gold",
      icon: "/src/assets/badges/gold.svg",
      piReward: 750,
      unlocked: false,
      unlockedAt: null,
      description: "Completa 100 validaciones humanas de casos",
      requirement: "100 validaciones"
    },
    {
      id: "badge-gold-3",
      name: "Impacto Viral",
      tier: "gold",
      icon: "/src/assets/badges/gold.svg",
      piReward: 600,
      unlocked: false,
      unlockedAt: null,
      description: "Tus casos han sido vistos 10,000 veces",
      requirement: "10K visualizaciones"
    },
    // Platinum badges
    {
      id: "badge-platinum-1",
      name: "Maestro Forense",
      tier: "platinum",
      icon: "/src/assets/badges/platinum.svg",
      piReward: 1000,
      unlocked: false,
      unlockedAt: null,
      description: "Analiza con precisión 500 contenidos multimedia",
      requirement: "500 análisis forenses"
    },
    {
      id: "badge-platinum-2",
      name: "Defensor de la Comunidad",
      tier: "platinum",
      icon: "/src/assets/badges/platinum.svg",
      piReward: 1200,
      unlocked: false,
      unlockedAt: null,
      description: "Valida y verifica 200 casos registrados por la comunidad",
      requirement: "200 casos comunitarios validados"
    },
    {
      id: "badge-platinum-3",
      name: "Inmunizador Digital",
      tier: "platinum",
      icon: "/src/assets/badges/platinum.svg",
      piReward: 1500,
      unlocked: false,
      unlockedAt: null,
      description: "Tus validaciones han servido a más de 1000 usuarios",
      requirement: "1,000 visualizaciones de un caso"
    },
    // Diamond badges
    {
      id: "badge-diamond-1",
      name: "Leyenda AMI",
      tier: "diamond",
      icon: "/src/assets/badges/diamond.svg",
      piReward: 2000,
      unlocked: false,
      unlockedAt: null,
      description: "Alcanza 10,000 puntos de inmunización",
      requirement: "10K puntos"
    },
    {
      id: "badge-diamond-2",
      name: "Guardián Elite",
      tier: "diamond",
      icon: "/src/assets/badges/diamond.svg",
      piReward: 3000,
      unlocked: false,
      unlockedAt: null,
      description: "Mantén racha de 365 días",
      requirement: "365 días de racha"
    },
    {
      id: "badge-diamond-3",
      name: "Erradicador Desinfodemico",
      tier: "diamond",
      icon: "/src/assets/badges/diamond.svg",
      piReward: 2500,
      unlocked: false,
      unlockedAt: null,
      description: "Identifica y registra 1,000 casos validados",
      requirement: "1,000 casos validados"
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
    totalPI: 675,
    unlockedBadges: 5,
    totalBadges: 15,
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
    badgesCount: 5,
    achievementsCount: 2,
    totalPI: 675
  }
};
