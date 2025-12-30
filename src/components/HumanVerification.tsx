import { useState, useEffect } from 'react';
import { useHumanVerification } from '../hooks/useHumanVerification';
import { HumanVerificationDetail } from './HumanVerificationDetail';
import { VerificationSuccessDialog } from './VerificationSuccessDialog';
import { VoteSubmittedDialog } from './VoteSubmittedDialog';
import { CaseValidationList } from './CaseValidationList';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2 } from 'lucide-react';
import { LoadingView } from './LoadingView';
import type { CaseEnrichedCompatible } from '../types/validation';

// Mock data basado en el diseño Figma
const MOCK_CASES: CaseEnrichedCompatible[] = [
  {
    id: 'mock-1',
    displayId: 'T-WB-20241015-156',
    title: 'Las vacunas contra COVID-19 causan problemas cardíacos en el 90% de los vacunado...',
    status: 'pending',
    summary: 'Afirmación sobre efectos adversos de vacunas COVID-19 en el sistema cardiovascular',
    url: 'https://example.com/covid-vaccines',
    created_at: '2024-01-15T06:30:00Z',
    submission_type: 'Text',
    human_votes: {
      count: 8,
    },
    consensus: {
      state: 'ai_only',
      final_labels: [],
    },
    metadata: {
      reported_by: {
        id: 'user-123',
        name: 'usuario_123',
      },
      ai_analysis: {
        summaries: {
          theme: 'Desinformódico',
        },
        classification: {
          indiceCumplimientoAMI: {
            nivel: 'Requiere un enfoque AMI',
            score: 3.5,
          },
        },
      },
    },
  },
  {
    id: 'mock-2',
    displayId: 'I-FB-20241015-234',
    title: 'imagen_manifestacion_2024.jpg...',
    status: 'pending',
    summary: 'Análisis forense de imagen de manifestación',
    url: 'https://example.com/imagen_manifestacion_2024.jpg',
    created_at: '2024-01-15T05:15:00Z',
    submission_type: 'Image',
    human_votes: {
      count: 5,
    },
    consensus: {
      state: 'ai_only',
      final_labels: [],
    },
    metadata: {
      reported_by: {
        id: 'user-456',
        name: 'usuario_456',
      },
      ai_analysis: {
        summaries: {
          theme: 'Forense',
        },
        classification: {
          indiceCumplimientoAMI: {
            nivel: 'No cumple las premisas AMI',
            score: 2.0,
          },
        },
      },
      screenshot: 'https://example.com/screenshots/mock-2.png',
    },
  },
  {
    id: 'mock-3',
    displayId: 'V-YT-20241015-089',
    title: 'declaraciones_presidente_economia.mp4...',
    status: 'pending',
    summary: 'Análisis forense de video con declaraciones económicas',
    url: 'https://example.com/declaraciones_presidente_economia.mp4',
    created_at: '2024-01-15T04:45:00Z',
    submission_type: 'Video',
    human_votes: {
      count: 3,
    },
    consensus: {
      state: 'ai_only',
      final_labels: [],
    },
    metadata: {
      reported_by: {
        id: 'user-789',
        name: 'usuario_789',
      },
      ai_analysis: {
        summaries: {
          theme: 'Forense',
        },
        classification: {
          indiceCumplimientoAMI: {
            nivel: 'Cumple las premisas AMI',
            score: 5.0,
          },
        },
      },
    },
  },
  {
    id: 'mock-4',
    displayId: 'A-WA-20241014-312',
    title: 'audio_emergencia_sanitaria.m4a...',
    status: 'pending',
    summary: 'Análisis forense de audio sobre emergencia sanitaria',
    url: 'https://example.com/audio_emergencia_sanitaria.m4a',
    created_at: '2024-01-14T12:20:00Z',
    submission_type: 'Audio',
    human_votes: {
      count: 6,
    },
    consensus: {
      state: 'ai_only',
      final_labels: [],
    },
    metadata: {
      reported_by: {
        id: 'user-321',
        name: 'usuario_321',
      },
      ai_analysis: {
        summaries: {
          theme: 'Forense',
        },
        classification: {
          indiceCumplimientoAMI: {
            nivel: 'Generado por IA',
            score: 1.5,
          },
        },
      },
    },
  },
  {
    id: 'mock-5',
    displayId: 'T-TW-20241013-445',
    title: 'El gobierno anuncia nueva reforma tributaria que eliminará impuestos a las grand...',
    status: 'pending',
    summary: 'Información sobre nueva reforma tributaria gubernamental',
    url: 'https://example.com/reforma-tributaria',
    created_at: '2024-01-13T10:10:00Z',
    submission_type: 'Text',
    human_votes: {
      count: 2,
    },
    consensus: {
      state: 'ai_only',
      final_labels: [],
    },
    metadata: {
      reported_by: {
        id: 'user-555',
        name: 'usuario_555',
      },
      ai_analysis: {
        summaries: {
          theme: 'Desinformódico',
        },
        classification: {
          indiceCumplimientoAMI: {
            nivel: 'Desarrolla las estrategias AMI',
            score: 4.8,
          },
        },
      },
    },
  },
];

const USE_MOCK_DATA = true;

const levels = [
  {
    level: 1,
    title: 'VIGILANTE CENTINELA',
    subtitle: 'Primera Línea de Defensa',
    minXP: 0,
    maxXP: 500,
    badge: '👁️',
  },
  {
    level: 2,
    title: 'EPIDEMIÓLOGO DIGITAL VOLUNTARIO',
    subtitle: 'Analista de Contagio',
    minXP: 500,
    maxXP: 2000,
    badge: '🔬',
  },
  {
    level: 3,
    title: 'ESPECIALISTA EN INMUNOLOGÍA INFORMATIVA',
    subtitle: 'Educomunicador Estratégico',
    minXP: 2000,
    maxXP: 999999,
    badge: '💉',
  },
];

export function HumanVerification() {
  const {
    profile,
    initialProfile,
    cases,
    selectedCase,
    isLoading,
    error,
    userStats,
    isSubmitting,
    voteJob,
    showSuccessDialog,
    successDialogData,
    setShowSuccessDialog,
    handleSelectCase,
    handleSubmitVerification,
    handleBackToList,
  } = useHumanVerification();

  const [showVoteSubmittedDialog, setShowVoteSubmittedDialog] = useState(false);
  const [gamificationData, setGamificationData] = useState<any>(null);

  useEffect(() => {
    if (voteJob?.status === 'processing') {
      setShowVoteSubmittedDialog(true);
    }
    if (voteJob?.status === 'completed') {
      setShowVoteSubmittedDialog(false);
    }
  }, [voteJob]);

  useEffect(() => {
    if (profile) {
      const currentXP = profile.xp;
      const currentLevel = levels.find((l) => currentXP >= l.minXP && currentXP < l.maxXP) || levels[0];
      const nextLevel = levels.find((l) => l.level === currentLevel.level + 1);
      const progressToNext = nextLevel
        ? ((currentXP - currentLevel.minXP) / (nextLevel.minXP - currentLevel.minXP)) * 100
        : 100;

      setGamificationData({
        currentXP: currentXP,
        nextLevelXP: nextLevel?.minXP || currentLevel.maxXP,
        levelTitle: currentLevel.title,
        progress: progressToNext,
      });
    }
  }, [profile]);

  const handleCloseVoteSubmittedDialog = () => {
    setShowVoteSubmittedDialog(false);
    handleBackToList();
  };

  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
    handleBackToList();
  };

  if (isLoading && !selectedCase) {
    return <LoadingView message="Cargando casos para verificación..." />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (selectedCase) {
    return (
      <HumanVerificationDetail
        caseData={selectedCase}
        onBackToList={handleBackToList}
        onSubmit={handleSubmitVerification}
        isSubmitting={isSubmitting}
      />
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <VoteSubmittedDialog isOpen={showVoteSubmittedDialog} onClose={handleCloseVoteSubmittedDialog} />
      <VerificationSuccessDialog
        isOpen={showSuccessDialog}
        onClose={handleCloseSuccessDialog}
        gamificationData={successDialogData}
      />

      {/* Banner de Botilito */}
      <div
        className="flex items-center gap-4 p-4 rounded-2xl border-2"
        style={{ backgroundColor: 'var(--accent)', borderColor: 'var(--primary)' }}
      >
        <img
          src="/src/assets/e27a276e6ff0e187a67cf54678c265c1c38adbf7.png"
          alt="Botilito"
          className="h-16 w-16 object-contain"
        />
        <p className="text-lg font-medium text-gray-800">
          ¡Ey, mi llave! Ayúdame a mejorar mis diagnósticos validando estos casos 🕵️
        </p>
      </div>

      {/* Título de sección */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Validación Humana</h1>
        <p className="text-gray-600">
          Revisa y valida los diagnósticos realizados por la IA para mejorar la precisión del sistema
        </p>
      </div>

      <CaseValidationList
        cases={USE_MOCK_DATA ? MOCK_CASES : cases}
        onSelectCase={handleSelectCase}
        isLoading={isLoading}
        isEnrichedFormat={true}
      />
    </div>
  );
}
