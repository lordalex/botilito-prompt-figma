import { useState, useEffect, useMemo } from 'react';
import { useHumanVerification } from '../hooks/useHumanVerification';
import { UnifiedAnalysisView } from './UnifiedAnalysisView';
import { transformHumanCaseToUI } from '../services/analysisPresentationService';
import { VerificationSuccessDialog } from './VerificationSuccessDialog';
import { VoteSubmittedDialog } from './VoteSubmittedDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2, FileText, Image, Video, Music, Calendar, User, Users as UsersIcon, ChevronRight } from 'lucide-react';
import { LoadingView } from './LoadingView';
import { generateDisplayId } from '../utils/humanVerification/api';

const levels = [
    { level: 1, title: 'VIGILANTE CENTINELA', subtitle: 'Primera Línea de Defensa', minXP: 0, maxXP: 500, badge: '👁️' },
    { level: 2, title: 'EPIDEMIÓLOGO DIGITAL VOLUNTARIO', subtitle: 'Analista de Contagio', minXP: 500, maxXP: 2000, badge: '🔬' },
    { level: 3, title: 'ESPECIALISTA EN INMUNOLOGÍA INFORMATIVA', subtitle: 'Educomunicador Estratégico', minXP: 2000, maxXP: 999999, badge: '💉' }
];

/**
 * Get content type info for display
 */
const getContentTypeInfo = (submissionType: string | undefined): {
    icon: React.ReactNode;
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
} => {
    const type = (submissionType || 'text').toLowerCase();

    if (type.includes('image') || type === 'media') {
        return {
            icon: <Image className="h-5 w-5" />,
            label: 'Forense',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: 'border-l-purple-500'
        };
    }
    if (type.includes('video')) {
        return {
            icon: <Video className="h-5 w-5" />,
            label: 'Forense',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-l-blue-500'
        };
    }
    if (type.includes('audio')) {
        return {
            icon: <Music className="h-5 w-5" />,
            label: 'Forense',
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-l-green-500'
        };
    }
    // Default: text
    return {
        icon: <FileText className="h-5 w-5" />,
        label: 'Desinfodémico',
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-l-amber-500'
    };
};

/**
 * Get verdict badge styling based on case data
 */
const getVerdictBadge = (caseData: any): { label: string; className: string } | null => {
    const labels = caseData.diagnostic_labels || [];
    const consensus = caseData.consensus?.state;

    // Check for specific verdicts
    if (labels.includes('falso') || labels.includes('desinformacion')) {
        return { label: 'Requiere un enfoque AMI', className: 'bg-red-100 text-red-700 border-red-200' };
    }
    if (labels.includes('manipulado')) {
        return { label: 'Manipulado Digitalmente', className: 'bg-amber-100 text-amber-700 border-amber-200' };
    }
    if (labels.includes('verdadero')) {
        return { label: '✓ Sin alteraciones', className: 'bg-green-100 text-green-700 border-green-200' };
    }

    // If no specific verdict, return null
    return null;
};

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

    // Prepare data for Unified View
    const unifiedCaseData = useMemo(() => {
        return selectedCase ? transformHumanCaseToUI(selectedCase) : null;
    }, [selectedCase]);

    if (isLoading && !selectedCase) {
        return <LoadingView message="Cargando casos para verificación..." />;
    }

    if (error) {
        return <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>;
    }

    if (selectedCase && unifiedCaseData) {
        // Determine content type from standardized_case type or legacy metadata
        const getContentType = (): 'text' | 'image' | 'audio' => {
            // Check new DTO type field first
            if (unifiedCaseData.type) {
                const type = unifiedCaseData.type.toLowerCase();
                if (type === 'image' || type === 'video') return 'image';
                if (type === 'audio') return 'audio';
                return 'text';
            }

            // Fallback to legacy forensic detection
            const isForensic = unifiedCaseData?.raw?.metadata?.is_forensic || selectedCase.metadata?.is_forensic;
            if (isForensic) {
                const hasImageDetails = unifiedCaseData?.raw?.all_documents?.[0]?.result?.details?.[0]?.original_frame;
                if (hasImageDetails) return 'image';
            }

            // Check submission_type from raw.metadata or case metadata
            const submissionType = (
                unifiedCaseData?.raw?.metadata?.submission_type ||
                selectedCase.metadata?.submission_type ||
                ''
            ).toLowerCase();

            if (submissionType.includes('image') || submissionType === 'media') return 'image';
            if (submissionType.includes('audio')) return 'audio';

            return 'text';
        };

        // Get main asset URL from StandardizedCase (main_asset_url) or legacy format
        const mainAssetUrl = unifiedCaseData.mainAssetUrl ||
            unifiedCaseData.overview?.main_asset_url ||
            unifiedCaseData.metadata?.screenshot ||
            selectedCase.metadata?.screenshot;

        return <UnifiedAnalysisView
            data={unifiedCaseData}
            contentType={getContentType()}
            mode="human"
            title={unifiedCaseData.title || selectedCase.title}
            caseNumber={generateDisplayId(selectedCase)}
            timestamp={unifiedCaseData.created_at || selectedCase.created_at}
            reportedBy={unifiedCaseData.reporter?.name || "Comunidad"}
            screenshot={mainAssetUrl}
            onReset={handleBackToList}
            onSubmitDiagnosis={handleSubmitVerification}
            isSubmittingDiagnosis={isSubmitting}
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
                    <CardTitle>Casos Pendientes de Validación Humana</CardTitle>
                    <CardDescription>Tu análisis es crucial para determinar la veracidad de estos contenidos.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {cases.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                No hay casos pendientes de verificación en este momento.
                            </p>
                        ) : cases.map((c) => {
                            const typeInfo = getContentTypeInfo(c.submission_type);
                            const verdictBadge = getVerdictBadge(c);
                            const displayId = c.displayId || generateDisplayId(c);
                            const createdDate = new Date(c.created_at);

                            return (
                                <div
                                    key={c.id}
                                    onClick={() => c.id && handleSelectCase(c.id)}
                                    className={`flex items-stretch rounded-lg border-l-4 ${typeInfo.borderColor} bg-gradient-to-r from-amber-50 to-white hover:from-amber-100 hover:to-amber-50 transition-all cursor-pointer shadow-sm hover:shadow-md`}
                                >
                                    {/* Content Type Icon */}
                                    <div className={`flex items-center justify-center px-4 ${typeInfo.bgColor}`}>
                                        <div className={typeInfo.color}>
                                            {typeInfo.icon}
                                        </div>
                                    </div>

                                    {/* Main Content */}
                                    <div className="flex-1 p-4">
                                        {/* Header Row: Case ID + Type Badge + Title */}
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-mono text-xs text-gray-500">
                                                Caso: {displayId}
                                            </span>
                                            <Badge variant="outline" className={`text-xs ${typeInfo.bgColor} ${typeInfo.color} border-current`}>
                                                ⚡ {typeInfo.label}
                                            </Badge>
                                            <span className="font-medium text-gray-900 truncate">
                                                {c.title || 'Sin título'}
                                            </span>
                                        </div>

                                        {/* Metadata Row */}
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {createdDate.toLocaleDateString('es-CO', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <User className="h-3 w-3" />
                                                Reportado por: {c.metadata?.reported_by?.name || 'usuario'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <UsersIcon className="h-3 w-3" />
                                                {c.human_votes?.count || 0} validadores humanos
                                            </span>
                                        </div>
                                    </div>

                                    {/* Verdict Badge (right side) */}
                                    <div className="flex items-center px-4">
                                        {verdictBadge ? (
                                            <Badge className={`${verdictBadge.className} border`}>
                                                {verdictBadge.label}
                                            </Badge>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-2 hover:bg-slate-100"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (c.id) handleSelectCase(c.id);
                                                }}
                                            >
                                                Validar
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}