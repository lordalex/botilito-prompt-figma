import { useState, useEffect } from 'react';
import { useHumanVerification } from '../hooks/useHumanVerification';
import { VerificationSuccessDialog } from './VerificationSuccessDialog';
import { VoteSubmittedDialog } from './VoteSubmittedDialog';
import { CaseValidationList } from './CaseValidationList';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2 } from 'lucide-react';
import { LoadingView } from './LoadingView';
import { UnifiedAnalysisView } from './UnifiedAnalysisView';
import type { CaseEnrichedCompatible } from '../types/validation';

// MOCK_CASES removed to ensure real API data usage

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

  // Adapter for UnifiedAnalysisView submission
  const handleUnifiedSubmit = (diagnosis: any) => {
    handleSubmitVerification({
      caseId: diagnosis.caseId,
      labels: [diagnosis.vote], // Map single vote to labels array
      notes: diagnosis.notas
    });
  };

  if (selectedCase) {
    // Normalize content type
    let contentType: 'text' | 'image' | 'audio' = 'text';
    const type = selectedCase.submission_type?.toLowerCase();
    if (type?.includes('image')) contentType = 'image';
    if (type?.includes('audio')) contentType = 'audio';
    // Video treated as image/visual for now or fallback

    return (
      <UnifiedAnalysisView
        data={selectedCase}
        contentType={contentType}
        onReset={handleBackToList}
        onSubmitDiagnosis={handleUnifiedSubmit}
        isSubmittingDiagnosis={isSubmitting}
        isLoading={false}
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
        cases={cases}
        onSelectCase={handleSelectCase}
        isLoading={isLoading}
        isEnrichedFormat={true}
      />
    </div>
  );
}
