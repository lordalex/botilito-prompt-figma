import { useState, useEffect } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { api } from '@/services/api';
import { fetchVerificationSummary, fetchCaseDetails, getUserVerificationStats } from '../utils/humanVerification/api';
import { useVoteTracker } from '../providers/VoteTrackerProvider';
import { useJobTracker } from './useJobTracker';
import type { CaseEnriched, Profile } from '../types';

export const useHumanVerification = () => {
    const { user, session } = useAuth();
    const { submitVote } = useVoteTracker();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [cases, setCases] = useState<CaseEnriched[]>([]);
    const [selectedCase, setSelectedCase] = useState<CaseEnriched | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userStats, setUserStats] = useState<{ total_verifications: number, points: number } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [voteJobId, setVoteJobId] = useState<string | null>(null);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [successDialogData, setSuccessDialogData] = useState<any>(null);

    const voteJob = useJobTracker(voteJobId);

    const [initialProfile, setInitialProfile] = useState<Profile | null>(null);

    useEffect(() => {
        const loadInitialData = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                // 1. Fetch Profile first to check permissions
                const profileResponse = await api.profile.get(session!);
                const userProfile = profileResponse.data;
                setProfile(userProfile);
                setInitialProfile(userProfile);

                // 2. Check Role - Optimization: Don't fetch cases if user can't see them
                if (userProfile?.role === 'cibernauta') {
                    setIsLoading(false);
                    return;
                }

                // 3. Fetch Case Data only if authorized
                const [summary, stats] = await Promise.all([
                    fetchVerificationSummary(1, 10),
                    getUserVerificationStats(user.id)
                ]);

                setCases(summary.cases);
                setUserStats(stats);
            } catch (e: any) {
                setError(e.message || 'Error al cargar los datos.');
            } finally {
                setIsLoading(false);
            }
        };
        loadInitialData();
    }, [user, session]);

    useEffect(() => {
        const handleVoteCompletion = async () => {
            if (!user || !initialProfile) return;
            try {
                const profileResponse = await api.profile.get(session!);
                const newProfile = profileResponse.data;
                setProfile(newProfile);

                if (newProfile) {
                    const pointsEarned = newProfile.xp - initialProfile.xp;
                    const newBadge = newProfile.badges?.find(b => !initialProfile.badges?.includes(b));
                    setSuccessDialogData({ pointsEarned, newBadge });
                } else {
                    setSuccessDialogData({ pointsEarned: 10, newBadge: null });
                }
                setShowSuccessDialog(true);
            } catch (e: any) {
                console.error('Failed to refetch profile', e);
            }
        };

        if (voteJob?.status === 'completed') {
            handleVoteCompletion();
        }
    }, [voteJob?.status, user, session, initialProfile]);

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
        try {
            const payload = {
                case_id: submission.caseId,
                classification: submission.labels[0],
                reason: submission.notes,
            };
            const jobId = submitVote(payload);
            setVoteJobId(jobId);
        } catch (e: any) {
            setError(e.message || 'Error al enviar la verificación.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBackToList = () => {
        setSelectedCase(null);
    };

    return {
        profile,
        initialProfile, // Return initial profile
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
    };
};
