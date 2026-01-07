import { useState, useEffect } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { api } from '@/services/api';
import { fetchVerificationSummary, fetchCaseDetails, getUserVerificationStats } from '../utils/humanVerification/api';
import { useVoteTracker } from '../providers/VoteTrackerProvider';
import { useJobTracker } from './useJobTracker';
import type { CaseEnriched, Profile } from '../types';
import { getCachedData, setCachedData, CACHE_KEYS } from '@/utils/sessionCache';

export const useHumanVerification = () => {
    const { user, session } = useAuth();
    const { submitVote } = useVoteTracker();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [cases, setCases] = useState<CaseEnriched[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [selectedCase, setSelectedCase] = useState<CaseEnriched | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userStats, setUserStats] = useState<{ total_verifications: number, points: number } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [voteJobId, setVoteJobId] = useState<string | null>(null);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [successDialogData, setSuccessDialogData] = useState<any>(null);
    // Helper to prevent concurrent page fetches if needed (reusing isLoading for now is fine)


    const voteJob = useJobTracker(voteJobId);

    const [initialProfile, setInitialProfile] = useState<Profile | null>(null);

    const [totalPages, setTotalPages] = useState<number>(0);

    const goToPage = async (newPage: number) => {
        if (newPage < 1 || isLoading || (totalPages > 0 && newPage > totalPages && newPage !== totalPages + 1)) return;
        setIsLoading(true);
        try {
            const [summary, nextPageSummary] = await Promise.all([
                fetchVerificationSummary(newPage, 10),
                fetchVerificationSummary(newPage + 1, 1)
            ]);

            const more = nextPageSummary.cases.length > 0;
            setHasMore(more);
            setCases(summary.cases);
            setPage(newPage);

            if (more) {
                setTotalPages(newPage + 1);
            } else {
                setTotalPages(newPage);
            }
        } catch (e: any) {
            setError(e.message || 'Error al cargar la página.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                const [profileResponse, summary, nextPageSummary, stats] = await Promise.all([
                    api.profile.get(session!),
                    fetchVerificationSummary(1, 10),
                    fetchVerificationSummary(2, 1),
                    getUserVerificationStats(user.id)
                ]);
                
                const userProfile = profileResponse.data;
                setProfile(userProfile);
                setInitialProfile(userProfile);

                if (userProfile?.role === 'cibernauta') {
                    setIsLoading(false);
                    return;
                }

                const more = nextPageSummary.cases.length > 0;
                setHasMore(more);
                setCases(summary.cases);
                
                if (more) {
                    setTotalPages(2);
                } else {
                    setTotalPages(1);
                }
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

    const refresh = async () => {
        // Clear cache for both cases and stats
        setCachedData(CACHE_KEYS.HUMAN_VERIFICATION, null);
        setCachedData(CACHE_KEYS.HUMAN_VERIFICATION_STATS, null);
        
        // Reset state and reload data
        setIsLoading(true);
        setError(null);
        setPage(1); // Reset to first page
        
        try {
            if (!user || !session) {
                throw new Error("Usuario no autenticado.");
            }

            const profileResponse = await api.profile.get(session);
            const userProfile = profileResponse.data;
            setProfile(userProfile);
            setInitialProfile(userProfile);

            if (userProfile?.role === 'cibernauta') {
                setCases([]);
                setHasMore(false);
                setTotalPages(0);
                setUserStats(null);
                setIsLoading(false);
                return;
            }

            const [summary, stats] = await Promise.all([
                fetchVerificationSummary(1, 10), // Fetch page 1
                getUserVerificationStats(user.id)
            ]);

            setCases(summary.cases);
            setHasMore(summary.pagination.hasMore);
            const total = summary.pagination.totalItems || summary.summary?.total;
            setTotalPages(total ? Math.ceil(total / 10) : 0);
            setUserStats(stats);

            // Update cache with new data
            setCachedData(CACHE_KEYS.HUMAN_VERIFICATION, summary.cases);
            setCachedData(CACHE_KEYS.HUMAN_VERIFICATION_STATS, stats);
        } catch (e: any) {
            setError(e.message || 'Error al recargar los datos.');
        } finally {
            setIsLoading(false);
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
        refresh, // Expose refresh function

        page,
        hasMore,
        goToPage,
        totalPages,
        isLoadingMore: false // Deprecated but kept for compat if needed, though unused now
    };
};
