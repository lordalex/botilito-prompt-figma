import { useState, useEffect } from 'react';
import { useHumanVerification } from '../hooks/useHumanVerification';
import { HumanVerificationDetail } from './HumanVerificationDetail';
import { VerificationSuccessDialog } from './VerificationSuccessDialog';
import { VoteSubmittedDialog } from './VoteSubmittedDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2 } from 'lucide-react';
import { LoadingView } from './LoadingView';
import { generateDisplayId } from '../utils/humanVerification/api';

const levels = [
    { level: 1, title: 'VIGILANTE CENTINELA', subtitle: 'Primera Línea de Defensa', minXP: 0, maxXP: 500, badge: '👁️' },
    { level: 2, title: 'EPIDEMIÓLOGO DIGITAL VOLUNTARIO', subtitle: 'Analista de Contagio', minXP: 500, maxXP: 2000, badge: '🔬' },
    { level: 3, title: 'ESPECIALISTA EN INMUNOLOGÍA INFORMATIVA', subtitle: 'Educomunicador Estratégico', minXP: 2000, maxXP: 999999, badge: '💉' }
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
            const currentLevel = levels.find(l => currentXP >= l.minXP && currentXP < l.maxXP) || levels[0];
            const nextLevel = levels.find(l => l.level === currentLevel.level + 1);
            const progressToNext = nextLevel ? ((currentXP - currentLevel.minXP) / (nextLevel.minXP - currentLevel.minXP)) * 100 : 100;

            setGamificationData({
                currentXP: currentXP,
                nextLevelXP: nextLevel?.minXP || currentLevel.maxXP,
                levelTitle: currentLevel.title,
                progress: progressToNext
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
        return <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>;
    }

    if (selectedCase) {
        return <HumanVerificationDetail
            caseData={selectedCase}
            onBackToList={handleBackToList}
            onSubmit={handleSubmitVerification}
            isSubmitting={isSubmitting}
        />;
    }

    return (
        <div className="container mx-auto p-4">
            <VoteSubmittedDialog
                isOpen={showVoteSubmittedDialog}
                onClose={handleCloseVoteSubmittedDialog}
            />
            <VerificationSuccessDialog
                isOpen={showSuccessDialog}
                onClose={handleCloseSuccessDialog}
                gamificationData={successDialogData}
            />
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Tu Impacto como Verificador</CardTitle>
                </CardHeader>
                <CardContent>
                    {gamificationData && profile ? (
                        <>
                            <div className="flex justify-between items-center mb-2">
                                <p className="font-bold">{gamificationData.levelTitle}</p>
                                <p className="text-sm">{userStats?.total_verifications || 0} verificaciones</p>
                            </div>
                            <Progress value={gamificationData.progress} className="mb-2" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{gamificationData.currentXP} XP</span>
                                <span>{gamificationData.nextLevelXP} XP</span>
                            </div>
                        </>
                    ) : <Loader2 className="h-4 w-4 animate-spin" />}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Casos Pendientes de Verificación Humana</CardTitle>
                    <CardDescription>Tu análisis es crucial para determinar la veracidad de estos contenidos.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {cases.map((c, index) => (
                            <Card key={index} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="outline" className="font-mono text-xs bg-gray-50">
                                            {c.displayId || generateDisplayId(c)}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-lg">{c.title || 'Sin título'}</CardTitle>
                                    <div className="text-xs text-muted-foreground">
                                        <span>{new Date(c.created_at).toLocaleDateString()}</span> | <span>Votos: {c.human_votes?.count || 0}</span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm mb-4 line-clamp-2">{c.summary || 'No hay resumen disponible.'}</p>
                                    <div className="flex justify-between items-center">
                                        <Button onClick={() => handleSelectCase(c.id)} disabled={!c.id}>Verificar Ahora</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}