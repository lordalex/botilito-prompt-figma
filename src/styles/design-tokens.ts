/**
 * BOTILITO DESIGN TOKENS
 * ======================
 * Comprehensive color and style reference for analysis result views
 *
 * OFFICIAL DESIGNER COLORS (DO NOT CHANGE WITHOUT DESIGNER APPROVAL)
 *
 * Use this file as the single source of truth for colors across:
 * - Image Analysis Results
 * - Audio Analysis Results
 * - Video Analysis Results
 * - Content Analysis Results
 */

// =============================================================================
// BRAND COLORS (Botilito Identity)
// =============================================================================
export const BRAND = {
  // Primary yellow - used for primary actions, highlights, CTAs
  primary: '#FFDA00',           // Amarillo principal (botones/CTAs)
  primaryHover: '#E6C400',

  // Secondary yellow - used for banners, backgrounds, highlights
  secondary: '#FFE97A',         // Amarillo resaltado
  secondaryLight: '#FFF4B8',

  // Botilito banner
  bannerBg: '#FFE97A',
  bannerBorder: '#FFDA00',
} as const;

// =============================================================================
// RISK LEVEL COLORS
// =============================================================================
export const RISK_COLORS = {
  // Safe / Low Risk (score < 30)
  safe: {
    primary: '#22C55E',      // green-500
    light: '#DCFCE7',        // green-100
    dark: '#166534',         // green-800
    border: '#22C55E',       // green-500
    bg: '#F0FDF4',           // green-50
    text: '#15803D',         // green-700
    tailwind: {
      bg: 'bg-green-50',
      border: 'border-green-500',
      text: 'text-green-600',
      progress: 'bg-green-500',
    }
  },

  // Medium Risk (score 30-70)
  medium: {
    primary: '#EAB308',      // yellow-500
    light: '#FEF9C3',        // yellow-100
    dark: '#854D0E',         // yellow-800
    border: '#EAB308',       // yellow-500
    bg: '#FEFCE8',           // yellow-50
    text: '#CA8A04',         // yellow-600
    tailwind: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-500',
      text: 'text-yellow-600',
      progress: 'bg-yellow-500',
    }
  },

  // High Risk / Critical (score > 70)
  high: {
    primary: '#EF4444',      // red-500
    light: '#FEE2E2',        // red-100
    dark: '#991B1B',         // red-800
    border: '#EF4444',       // red-500
    bg: '#FEF2F2',           // red-50
    text: '#DC2626',         // red-600
    tailwind: {
      bg: 'bg-red-50',
      border: 'border-red-500',
      text: 'text-red-600',
      progress: 'bg-red-500',
    }
  },
} as const;

// =============================================================================
// VERDICT/STATUS BADGE COLORS
// Official Designer Colors - Colores de Pruebas y Marcadores
// =============================================================================
/**
 * IMPORTANT: Badge vs Progress Bar colors differ for MANIPULATED!
 * - MANIPULATED badge = Orange (#f97316) but progress bar = Red (#ef4444)
 * - This is because the badge shows the TYPE, but progress shows SEVERITY
 */
export const BADGE_COLORS = {
  // Authentic / Normal - Verde (AUTHENTIC): #22c55e (green-500)
  authentic: {
    bg: '#DCFCE7',           // green-100
    text: '#166534',         // green-800
    tailwind: 'bg-green-100 text-green-800 hover:bg-green-200',
    progressTailwind: 'bg-green-500',
    label: 'AUTÉNTICO',
    labelEn: 'AUTHENTIC',
  },

  // Manipulated - Naranja badge, Rojo progress bar
  manipulated: {
    bg: '#F97316',           // orange-500 (badge)
    text: '#FFFFFF',         // white
    tailwind: 'bg-orange-500 hover:bg-orange-600 text-white',
    progressTailwind: 'bg-red-500',  // Red progress bar!
    label: 'MANIPULADO',
    labelEn: 'MANIPULATED',
  },

  // Synthetic / AI Generated - Rojo (SYNTHETIC): #dc2626 (red-600)
  synthetic: {
    bg: '#DC2626',           // red-600
    text: '#FFFFFF',         // white
    tailwind: 'bg-red-600 hover:bg-red-700 text-white',
    progressTailwind: 'bg-red-600',
    label: 'SINTÉTICO',
    labelEn: 'SYNTHETIC',
  },

  // Uncertain / Warning - Amarillo (WARNING): #eab308 (yellow-500)
  uncertain: {
    bg: '#EAB308',           // yellow-500
    text: '#FFFFFF',         // white
    tailwind: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    progressTailwind: 'bg-yellow-500',
    label: 'INCIERTO',
    labelEn: 'UNCERTAIN',
  },

  // High Severity - Naranja (HIGH): #f97316 (orange-500)
  highSeverity: {
    bg: '#F97316',           // orange-500
    text: '#FFFFFF',         // white
    tailwind: 'bg-orange-500 hover:bg-orange-600 text-white',
    progressTailwind: 'bg-orange-500',
    label: 'ALTA SEVERIDAD',
    labelEn: 'HIGH SEVERITY',
  },

  // Critical - Rojo (CRITICAL): #dc2626 (red-600)
  critical: {
    bg: '#DC2626',           // red-600
    text: '#FFFFFF',         // white
    tailwind: 'bg-red-600 hover:bg-red-700 text-white',
    progressTailwind: 'bg-red-600',
    label: 'CRÍTICO',
    labelEn: 'CRITICAL',
  },

  // Relevant / Warning (for test findings) - Naranja: #f97316 (orange-500)
  relevant: {
    bg: '#F97316',           // orange-500
    text: '#FFFFFF',         // white
    tailwind: 'bg-orange-500 hover:bg-orange-600 text-white',
    progressTailwind: 'bg-orange-500',
    label: 'RELEVANTE',
    labelEn: 'RELEVANT',
  },

  // Normal (for test findings) - Verde: #22c55e (green-500)
  normal: {
    bg: '#DCFCE7',           // green-100
    text: '#166534',         // green-800
    tailwind: 'bg-green-100 text-green-800 hover:bg-green-200',
    progressTailwind: 'bg-green-500',
    label: 'NORMAL',
    labelEn: 'NORMAL',
  },
} as const;

// =============================================================================
// PROGRESS BAR COLORS
// Official Designer Colors
// =============================================================================
export const PROGRESS_COLORS = {
  // By result type
  authentic: 'bg-green-500',      // #22c55e - Verde (AUTHENTIC)
  manipulated: 'bg-red-500',      // #ef4444 - Rojo (MANIPULATED)
  synthetic: 'bg-red-600',        // #dc2626 - Rojo (SYNTHETIC)
  uncertain: 'bg-yellow-500',     // #eab308 - Amarillo (WARNING)

  // By risk/severity level
  safe: 'bg-green-500',           // #22c55e - Verde
  medium: 'bg-yellow-500',        // #eab308 - Amarillo (WARNING)
  high: 'bg-orange-500',          // #f97316 - Naranja (HIGH severity)
  critical: 'bg-red-500',         // #ef4444 - Rojo (CRITICAL)
} as const;

// =============================================================================
// CARD STYLES
// =============================================================================
export const CARD_STYLES = {
  // File Info Card
  fileInfo: {
    border: 'border-yellow-200',
    iconColor: 'text-amber-500',
    bg: 'bg-white',
  },

  // Stats Card
  stats: {
    border: 'border-gray-100',
    bg: 'bg-white',
  },

  // Recommendations Card
  recommendations: {
    bg: 'bg-[#FFFCE8]',      // Light cream/yellow
    border: 'border-yellow-200',
    bulletColor: 'text-yellow-400',
  },

  // Test Result Card
  testResult: {
    border: 'border-gray-100',
    bg: 'bg-white',
  },

  // Summary Card (dynamic based on risk)
  summary: {
    getSummaryStyle: (riskScore: number) => {
      if (riskScore < 30) {
        return {
          border: 'border-green-500',
          bg: 'bg-green-50',
          text: 'text-green-600',
          progress: 'bg-green-500',
        };
      } else if (riskScore < 70) {
        return {
          border: 'border-yellow-500',
          bg: 'bg-yellow-50',
          text: 'text-yellow-600',
          progress: 'bg-yellow-500',
        };
      } else {
        return {
          border: 'border-red-500',
          bg: 'bg-red-50',
          text: 'text-red-600',
          progress: 'bg-red-500',
        };
      }
    },
  },
} as const;

// =============================================================================
// BUTTON STYLES
// =============================================================================
export const BUTTON_STYLES = {
  // Download report
  download: 'bg-white hover:bg-gray-50 border border-gray-200 text-gray-900',

  // Share analysis
  share: 'bg-green-50 hover:bg-green-100 border border-green-200 text-green-800',

  // Report another / New analysis
  newAnalysis: 'bg-secondary hover:bg-primary text-primary-foreground',
} as const;

// =============================================================================
// TEXT COLORS
// =============================================================================
export const TEXT_COLORS = {
  // Primary text
  primary: 'text-gray-900',

  // Secondary text
  secondary: 'text-gray-700',

  // Muted text
  muted: 'text-gray-500',

  // Disabled/unavailable
  disabled: 'text-gray-400',

  // Warning text (e.g., "IA detectado", "Inconsistente")
  warning: 'text-orange-500',

  // Error text
  error: 'text-red-500',

  // Success text
  success: 'text-green-600',
} as const;

// =============================================================================
// TIMELINE/CHAIN OF CUSTODY
// =============================================================================
export const TIMELINE_COLORS = {
  nodeBg: 'bg-yellow-100',
  nodeBorder: 'border-yellow-400',
  nodeInner: 'bg-yellow-500',
  line: 'bg-gray-200',
} as const;

// =============================================================================
// AUDIO-SPECIFIC COLORS (Visualizations)
// =============================================================================
export const AUDIO_COLORS = {
  // Waveform
  waveform: {
    bg: 'from-primary/10 via-primary/30 to-primary/10',
    bars: 'bg-primary/60',
  },

  // Spectrogram gradient
  spectrogram: {
    gradient: 'from-purple-900 via-red-600 to-yellow-400',
  },
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get badge configuration based on result type
 */
export function getBadgeConfig(result: 'authentic' | 'manipulated' | 'synthetic' | 'uncertain', confidence: number = 1) {
  if (result === 'manipulated') {
    return BADGE_COLORS.manipulated;
  }
  if (result === 'synthetic') {
    return BADGE_COLORS.synthetic;
  }
  if (result === 'uncertain' || confidence < 0.5) {
    return BADGE_COLORS.uncertain;
  }
  return BADGE_COLORS.authentic;
}

/**
 * Get progress bar color based on result type
 */
export function getProgressColor(result: 'authentic' | 'manipulated' | 'synthetic' | 'uncertain') {
  return PROGRESS_COLORS[result];
}

/**
 * Get risk level colors based on score (0-100)
 */
export function getRiskColors(score: number) {
  if (score < 30) return RISK_COLORS.safe;
  if (score < 70) return RISK_COLORS.medium;
  return RISK_COLORS.high;
}

/**
 * Get summary card styles based on risk score
 */
export function getSummaryCardStyles(riskScore: number) {
  return CARD_STYLES.summary.getSummaryStyle(riskScore);
}
