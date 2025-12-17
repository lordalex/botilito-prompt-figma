// Types for Vector-Async API v2.4.0

export interface JobInitiatedResponse {
  job_id: string;
}

export interface JobStatusResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: SearchResultList | SearchResultSingle;
  error?: any;
  trace_log?: any[];
}

export interface SearchResultList {
  cases: CaseEnriched[];
  pagination: {
    page: number;
    pageSize: number;
    returnedCount: number;
    hasMore: boolean;
  };
}

export interface SearchResultSingle {
    case: CaseEnriched;
}

export type VerificationSummaryResult = SearchResultList;

export interface CaseEnriched {
  id: string;
  displayId?: string; // Generated code like "WE-TX-LA-PO-22D"
  title: string;
  status: string;
  summary: string;
  content?: string;
  url?: string;
  created_at: string;
  submission_type: 'Text' | 'URL';
  human_votes?: {
    count: number;
    statistics: {
        label: string;
        count: number;
        percentage: number;
    }[];
    entries: {
      vote: string;
      reason?: string;
      date: string;
      user: {
        id: string;
        full_name: string;
        reputation: number;
        role: string;
      }
    }[];
  };
  diagnostic_labels: string[];
  metadata: any;
  case_judgement?: {
      reasoning: string;
      final_verdict: string;
      recommendation: string;
  };
  consensus?: {
    state: 'human_consensus' | 'ai_only';
    final_labels: string[];
  };
}

// Keep these constants as they are used by the UI components
export const DIAGNOSTIC_LABELS: Record<string, {
  label: string;
  color: string;
  bg: string;
  border: string;
  virulencia: number;
  descripcion: string;
}> = {
  'verdadero': {
    label: 'Verdadero',
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    virulencia: 0,
    descripcion: 'Información verificada y respaldada por fuentes confiables'
  },
  'falso': {
    label: 'Falso',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    virulencia: 90,
    descripcion: 'Información completamente falsa sin sustento verificable'
  },
  'enganoso': {
    label: 'Engañoso',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    virulencia: 75,
    descripcion: 'Mezcla hechos reales con interpretaciones falsas o exageradas'
  },
  'satirico': {
    label: 'Satírico/Humorístico',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    virulencia: 20,
    descripcion: 'Contenido humorístico o satírico que puede confundirse con noticias reales'
  },
  'manipulado': {
    label: 'Manipulado',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    virulencia: 85,
    descripcion: 'Contenido editado o alterado para cambiar su significado original'
  },
  'sin_contexto': {
    label: 'Sin contexto',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    virulencia: 60,
    descripcion: 'Contenido real usado fuera de su contexto temporal o situacional'
  },
  'no_verificable': {
    label: 'No verificable',
    color: 'text-gray-600',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    virulencia: 35,
    descripcion: 'Información que no puede confirmarse con fuentes disponibles'
  },
  'teoria_conspirativa': {
    label: 'Teoría conspirativa',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    virulencia: 80,
    descripcion: 'Narrativas que sugieren conspiraciones sin evidencia sólida'
  },
  'discurso_odio': {
    label: 'Discurso de odio',
    color: 'text-red-800',
    bg: 'bg-red-100',
    border: 'border-red-300',
    virulencia: 95,
    descripcion: 'Contenido que promueve odio o discriminación'
  },
  'incitacion_violencia': {
    label: 'Incitación a la violencia',
    color: 'text-red-900',
    bg: 'bg-red-100',
    border: 'border-red-400',
    virulencia: 98,
    descripcion: 'Contenido que promueve o incita actos violentos'
  },
  'bot_coordinado': {
    label: 'Bot/Coordinado',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    virulencia: 65,
    descripcion: 'Contenido generado o amplificado por cuentas automatizadas'
  },
  'sensacionalista': {
    label: 'Sensacionalista',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    virulencia: 55,
    descripcion: 'Exagera o dramatiza para generar clics o emociones fuertes'
  }
};

export const CONSENSUS_STATES = {
  'ai_only': {
    label: 'Solo IA',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    description: 'Verificado únicamente por IA'
  },
  'human_only': {
    label: 'Solo Humano',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    description: 'Verificado únicamente por humanos'
  },
  'consensus': {
    label: 'Consenso',
    color: 'text-green-600',
    bg: 'bg-green-50',
    description: 'IA y humanos coinciden'
  },
  'disagreement': {
    label: 'Desacuerdo',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    description: 'IA y humanos difieren'
  }
};

export const PRIORITY_LEVELS = {
  'low': {
    label: 'Baja',
    color: 'text-gray-600',
    bg: 'bg-gray-50'
  },
  'medium': {
    label: 'Media',
    color: 'text-yellow-600',
    bg: 'bg-yellow-50'
  },
  'high': {
    label: 'Alta',
    color: 'text-orange-600',
    bg: 'bg-orange-50'
  },
  'critical': {
    label: 'Crítica',
    color: 'text-red-600',
    bg: 'bg-red-50'
  }
};