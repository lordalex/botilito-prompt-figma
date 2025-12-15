import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { api as profileApi } from '../lib/apiService';
import { fetchVerificationSummary, fetchCaseDetails, submitHumanVerification, getUserVerificationStats } from '../utils/humanVerification/api';
import { CaseEnriched, VerificationSummaryResult, DiagnosticLabel, DiagnosticLabelGroup } from '../utils/humanVerification/types';
import { HumanVerificationDetail } from './HumanVerificationDetail';
import { VerificationSuccessDialog } from './VerificationSuccessDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { ArrowLeft, Check, ChevronsUpDown, ExternalLink, HelpCircle, Loader2, ThumbsDown, ThumbsUp, UserCheck, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Profile } from '../types/profile';

import { LoadingView } from './LoadingView';

const levels = [
    { level: 1, title: 'VIGILANTE CENTINELA', subtitle: 'Primera Línea de Defensa', minXP: 0, maxXP: 500, badge: '👁️' },
    { level: 2, title: 'EPIDEMIÓLOGO DIGITAL VOLUNTARIO', subtitle: 'Analista de Contagio', minXP: 500, maxXP: 2000, badge: '🔬' },
    { level: 3, title: 'ESPECIALISTA EN INMUNOLOGÍA INFORMATIVA', subtitle: 'Educomunicador Estratégico', minXP: 2000, maxXP: 999999, badge: '💉' }
];

export function HumanVerification() {
    const { user, session } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [cases, setCases] = useState<CaseEnriched[]>([]);
    const [selectedCase, setSelectedCase] = useState<CaseEnriched | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userStats, setUserStats] = useState<{ total_verifications: number, points: number } | null>(null);
    const [gamificationData, setGamificationData] = useState<{ currentXP: number, nextLevelXP: number, levelTitle: string, progress: number } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [successDialogData, setSuccessDialogData] = useState<any>(null);

    useEffect(() => {
        const loadInitialData = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                const [profileData, summary, stats] = await Promise.all([
                    profileApi.profile.get(session),
                    fetchVerificationSummary(1, 10),
                    getUserVerificationStats(user.id)
                ]);
                setProfile(profileData);
                setCases(summary.cases);
                setUserStats(stats);
            } catch (e: any) {
                setError(e.message || 'Error al cargar los datos.');
            } finally {
                setIsLoading(false);
            }
        };
        loadInitialData();
    }, [user]);

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


    const handleSelectCase = async (caseId: string) => {
        if (!caseId) {
            setError('No se puede cargar un caso sin un ID válido.');
            return;
        }
        setIsLoading(true);
        try {
            const details = await fetchCaseDetails(caseId);
            setSelectedCase(details);
        } catch (e: any) {
            setError(e.message || 'Error al cargar el detalle del caso.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitVerification = async (submission: { caseId: string, labels: string[], notes?: string }) => {
        if (!selectedCase || !profile) return;
        setIsSubmitting(true);
        const initialXP = profile.xp;
        const initialBadges = profile.badges || [];
        try {
            await submitHumanVerification(submission);
            
            // Refresh data
            if(user) {
                const [profileData, summary, stats] = await Promise.all([
                    profileApi.profile.get(session),
                    fetchVerificationSummary(1, 10),
                    getUserVerificationStats(user.id)
                ]);
                setProfile(profileData);
                setCases(summary.cases);
                setUserStats(stats);

                const finalXP = profileData.xp;
                const pointsEarned = finalXP - initialXP;
                
                const finalBadges = profileData.badges || [];
                const newBadge = finalBadges.find(b => !initialBadges.includes(b));

                setSuccessDialogData({
                    pointsEarned: pointsEarned,
                    newBadge: newBadge,
                    newBadgeIcon: '🏆',
                    newBadgeDescription: '',
                });
                setShowSuccessDialog(true);
            }
        } catch (e: any) {
            setError(e.message || 'Error al enviar la verificación.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBackToList = () => {
        setSelectedCase(null);
    };
    
    const handleCloseSuccessDialog = () => {
        setShowSuccessDialog(false);
        setSelectedCase(null); // Go back to list after success
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
                                    <CardTitle className="text-lg">{c.id}</CardTitle>
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

