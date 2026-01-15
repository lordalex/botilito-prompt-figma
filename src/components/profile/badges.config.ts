import {
  Target,
  Calendar,
  BookOpen,
  Search,
  CheckCircle,
  Flame,
  Eye,
  Users,
  TrendingUp,
  Shield,
  Award,
  Star,
  Crown,
  Gem,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface BadgeMetadata {
  id: string;
  name: string;
  description: string;
  requirement: string;
  tier: BadgeTier;
  piReward: number;
  icon: LucideIcon;
}

// ============================================
// INSIGNIAS BRONCE - Nivel inicial
// ============================================
const BRONZE_BADGES: BadgeMetadata[] = [
  {
    id: 'primer-diagnostico',
    name: 'Primer Diagnóstico',
    description: 'Registra tu primer caso desinfodemico',
    requirement: '1 caso registrado',
    tier: 'bronze',
    piReward: 50,
    icon: Target,
  },
  {
    id: 'vigilante-constante',
    name: 'Vigilante Constante',
    description: 'Registra casos durante 7 días consecutivos',
    requirement: '7 días de racha',
    tier: 'bronze',
    piReward: 100,
    icon: Calendar,
  },
  {
    id: 'explorador-ami',
    name: 'Explorador AMI',
    description: 'Aplica criterios AMI al analizar 5 casos de contenido',
    requirement: '5 casos analizados con enfoque AMI',
    tier: 'bronze',
    piReward: 75,
    icon: BookOpen,
  },
];

// ============================================
// INSIGNIAS PLATA - Nivel intermedio
// ============================================
const SILVER_BADGES: BadgeMetadata[] = [
  {
    id: 'detector-serial',
    name: 'Detector Serial',
    description: 'Registra 50 casos desinfodemicos',
    requirement: '50 casos registrados',
    tier: 'silver',
    piReward: 200,
    icon: Search,
  },
  {
    id: 'verificador-experto',
    name: 'Verificador Experto',
    description: 'Logra 80% de precisión en tus registros',
    requirement: '80% de precisión',
    tier: 'silver',
    piReward: 250,
    icon: CheckCircle,
  },
  {
    id: 'compromiso-inquebrantable',
    name: 'Compromiso Inquebrantable',
    description: 'Mantén una racha de 30 días',
    requirement: '30 días de racha',
    tier: 'silver',
    piReward: 400,
    icon: Flame,
  },
];

// ============================================
// INSIGNIAS ORO - Nivel avanzado
// ============================================
const GOLD_BADGES: BadgeMetadata[] = [
  {
    id: 'cazador-deepfakes',
    name: 'Cazador de Deepfakes',
    description: 'Identifica correctamente 10 deepfakes',
    requirement: '10 deepfakes detectados',
    tier: 'gold',
    piReward: 500,
    icon: Eye,
  },
  {
    id: 'validador-experto',
    name: 'Validador Experto',
    description: 'Completa 100 validaciones humanas de casos',
    requirement: '100 validaciones',
    tier: 'gold',
    piReward: 750,
    icon: Users,
  },
  {
    id: 'impacto-viral',
    name: 'Impacto Viral',
    description: 'Tus casos han sido vistos 10,000 veces',
    requirement: '10K visualizaciones',
    tier: 'gold',
    piReward: 600,
    icon: TrendingUp,
  },
];

// ============================================
// INSIGNIAS PLATINO - Nivel experto
// ============================================
const PLATINUM_BADGES: BadgeMetadata[] = [
  {
    id: 'maestro-forense',
    name: 'Maestro Forense',
    description: 'Analiza con precisión 500 contenidos multimedia',
    requirement: '500 análisis forenses',
    tier: 'platinum',
    piReward: 1000,
    icon: Shield,
  },
  {
    id: 'defensor-comunidad',
    name: 'Defensor de la Comunidad',
    description: 'Valida y verifica 200 casos registrados por la comunidad',
    requirement: '200 casos comunitarios validados',
    tier: 'platinum',
    piReward: 1200,
    icon: Award,
  },
  {
    id: 'inmunizador-digital',
    name: 'Inmunizador Digital',
    description: 'Tus validaciones han servido a más de 1000 usuarios',
    requirement: '1,000 visualizaciones de un caso',
    tier: 'platinum',
    piReward: 1500,
    icon: Zap,
  },
];

// ============================================
// INSIGNIAS DIAMANTE - Nivel legendario
// ============================================
const DIAMOND_BADGES: BadgeMetadata[] = [
  {
    id: 'leyenda-ami',
    name: 'Leyenda AMI',
    description: 'Alcanza 10,000 puntos de inmunización',
    requirement: '10K puntos',
    tier: 'diamond',
    piReward: 2000,
    icon: Star,
  },
  {
    id: 'guardian-elite',
    name: 'Guardián Elite',
    description: 'Mantén racha de 365 días',
    requirement: '365 días de racha',
    tier: 'diamond',
    piReward: 3000,
    icon: Crown,
  },
  {
    id: 'erradicador-desinfodemia',
    name: 'Erradicador Desinfodemico',
    description: 'Identifica y registra 1,000 casos validados',
    requirement: '1,000 casos validados',
    tier: 'diamond',
    piReward: 2500,
    icon: Gem,
  },
];

// ============================================
// CONFIGURACIÓN CONSOLIDADA
// ============================================

/** Todas las insignias del sistema */
export const ALL_BADGES: BadgeMetadata[] = [
  ...BRONZE_BADGES,
  ...SILVER_BADGES,
  ...GOLD_BADGES,
  ...PLATINUM_BADGES,
  ...DIAMOND_BADGES,
];

/** Insignias agrupadas por tier */
export const BADGES_BY_TIER: Record<BadgeTier, BadgeMetadata[]> = {
  bronze: BRONZE_BADGES,
  silver: SILVER_BADGES,
  gold: GOLD_BADGES,
  platinum: PLATINUM_BADGES,
  diamond: DIAMOND_BADGES,
};

/** Mapa de ID a metadata para lookups rápidos */
export const BADGES_MAP: Record<string, BadgeMetadata> = ALL_BADGES.reduce(
  (acc, badge) => ({ ...acc, [badge.id]: badge }),
  {}
);

/** Mapa de nombre a metadata (para mapear desde API que retorna string[]) */
export const BADGES_BY_NAME: Record<string, BadgeMetadata> = ALL_BADGES.reduce(
  (acc, badge) => ({ ...acc, [badge.name]: badge }),
  {}
);

// ============================================
// CONFIGURACIÓN DE TIERS
// ============================================

export interface TierConfig {
  label: string;
  labelPlural: string;
  color: {
    border: string;
    bg: string;
    iconBg: string;
    iconBgLocked: string;
    text: string;
    progressBg: string;
    progressBar: string;
  };
}

export const TIER_CONFIG: Record<BadgeTier, TierConfig> = {
  bronze: {
    label: 'Bronce',
    labelPlural: 'Insignias Bronce',
    color: {
      border: 'border-orange-700',
      bg: 'bg-white',
      iconBg: 'bg-orange-700',
      iconBgLocked: 'bg-gray-200',
      text: 'text-orange-800',
      progressBg: 'bg-orange-100',
      progressBar: 'bg-orange-700',
    },
  },
  silver: {
    label: 'Plata',
    labelPlural: 'Insignias Plata',
    color: {
      border: 'border-gray-400',
      bg: 'bg-gray-50',
      iconBg: 'bg-gray-500',
      iconBgLocked: 'bg-gray-200',
      text: 'text-gray-700',
      progressBg: 'bg-gray-200',
      progressBar: 'bg-gray-500',
    },
  },
  gold: {
    label: 'Oro',
    labelPlural: 'Insignias Oro',
    color: {
      border: 'border-yellow-500',
      bg: 'bg-yellow-50',
      iconBg: 'bg-yellow-500',
      iconBgLocked: 'bg-gray-200',
      text: 'text-yellow-700',
      progressBg: 'bg-yellow-100',
      progressBar: 'bg-yellow-500',
    },
  },
  platinum: {
    label: 'Platino',
    labelPlural: 'Insignias Platino',
    color: {
      border: 'border-slate-400',
      bg: 'bg-slate-50',
      iconBg: 'bg-slate-500',
      iconBgLocked: 'bg-gray-200',
      text: 'text-slate-700',
      progressBg: 'bg-slate-200',
      progressBar: 'bg-slate-500',
    },
  },
  diamond: {
    label: 'Diamante',
    labelPlural: 'Insignias Diamante',
    color: {
      border: 'border-blue-400',
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-500',
      iconBgLocked: 'bg-gray-200',
      text: 'text-blue-700',
      progressBg: 'bg-blue-100',
      progressBar: 'bg-blue-500',
    },
  },
};

/** Orden de tiers para renderizado */
export const TIER_ORDER: BadgeTier[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

// ============================================
// UTILIDADES
// ============================================

/**
 * Obtiene metadata de una insignia por su nombre
 * Útil para enriquecer el array string[] que retorna la API
 */
export function getBadgeByName(name: string): BadgeMetadata | undefined {
  return BADGES_BY_NAME[name];
}

/**
 * Obtiene metadata de una insignia por su ID
 */
export function getBadgeById(id: string): BadgeMetadata | undefined {
  return BADGES_MAP[id];
}

/**
 * Calcula el total de PI posible de todas las insignias
 */
export function getTotalPossiblePI(): number {
  return ALL_BADGES.reduce((sum, badge) => sum + badge.piReward, 0);
}

/**
 * Obtiene el total de insignias por tier
 */
export function getBadgeCountByTier(): Record<BadgeTier, number> {
  return TIER_ORDER.reduce(
    (acc, tier) => ({
      ...acc,
      [tier]: BADGES_BY_TIER[tier].length,
    }),
    {} as Record<BadgeTier, number>
  );
}
