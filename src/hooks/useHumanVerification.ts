import { useState, useEffect } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { api } from '@/services/api';
import { fetchVerificationSummary, fetchCaseDetails, getUserVerificationStats } from '../utils/humanVerification/api';
import { useVoteTracker } from '../providers/VoteTrackerProvider';
import { useJobTracker } from './useJobTracker';
import type { CaseEnriched, Profile } from '../types';
import { getCachedData, setCachedData, clearCachedData, CACHE_KEYS } from '@/utils/sessionCache';

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
        if (newPage < 1 || isLoading || (totalPages > 0 && newPage > totalPages)) return;
        setIsLoading(true); // Show main loading spinner or list skeleton
        try {
            const summary = await fetchVerificationSummary(newPage, 10);

            setCases(summary.cases); // REPLACE cases, do not append
            setHasMore(summary.pagination.hasMore);
            setPage(newPage);

            const total = summary.pagination.totalItems || summary.summary?.total;
            if (total) {
                setTotalPages(Math.ceil(total / 10));
            }
        } catch (e: any) {
            console.error("Error loading page:", e);
            setError("Error al cargar la página.");
        } finally {
            setIsLoading(false);
        }
    };

    const refreshCases = async () => {
        if (isLoading) return;
        // Clear cache to force fresh fetch
        clearCachedData(CACHE_KEYS.HUMAN_VERIFICATION);
        clearCachedData(CACHE_KEYS.HUMAN_VERIFICATION_STATS);

        setIsLoading(true);
        setError(null);
        try {
            const [summary, stats] = await Promise.all([
                fetchVerificationSummary(1, 10),
                user ? getUserVerificationStats(user.id) : Promise.resolve(null)
            ]);

            setCases(summary.cases);
            setHasMore(summary.pagination.hasMore);
            setPage(1);
            const total = summary.pagination.totalItems || summary.summary?.total;
            if (total) {
                setTotalPages(Math.ceil(total / 10));
            }
            if (stats) {
                setUserStats(stats);
            }

            // Re-cache the fresh results
            setCachedData(CACHE_KEYS.HUMAN_VERIFICATION, summary.cases);
            if (stats) {
                setCachedData(CACHE_KEYS.HUMAN_VERIFICATION_STATS, stats);
            }
        } catch (e: any) {
            console.error("Error refreshing cases:", e);
            setError("Error al actualizar la lista.");
        } finally {
            setIsLoading(false);
        }
    };

    // Initial load logic also needs to set totalPages
    useEffect(() => {
        const loadInitialData = async () => {
            if (!user) return;

            // Check cache first for cases
            const cachedCases = getCachedData<CaseEnriched[]>(CACHE_KEYS.HUMAN_VERIFICATION);
            const cachedStats = getCachedData<{ total_verifications: number, points: number }>(CACHE_KEYS.HUMAN_VERIFICATION_STATS);

            if (cachedCases && cachedStats) {
                setCases(cachedCases);
                setUserStats(cachedStats);
                setIsLoading(false);
                // Still fetch profile for current permissions
                try {
                    const profileResponse = await api.profile.get(session!);
                    setProfile(profileResponse.data);
                    setInitialProfile(profileResponse.data);
                } catch (e) {
                    // Profile fetch can fail silently if we have cached data
                }
                return;
            }

            setIsLoading(true);
            try {
                const profileResponse = await api.profile.get(session!);
                const userProfile = profileResponse.data;
                setProfile(userProfile);
                setInitialProfile(userProfile);

                const [summary, stats] = await Promise.all([
                    fetchVerificationSummary(1, 10),
                    getUserVerificationStats(user.id)
                ]);

                setCases(summary.cases);
                setHasMore(summary.pagination.hasMore);
                const total = summary.pagination.totalItems || summary.summary?.total;
                if (total) {
                    setTotalPages(Math.ceil(total / 10));
                }
                setUserStats(stats);

                // Cache the results
                setCachedData(CACHE_KEYS.HUMAN_VERIFICATION, summary.cases);
                setCachedData(CACHE_KEYS.HUMAN_VERIFICATION_STATS, stats);
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

        page,
        hasMore,
        goToPage,
        totalPages,
        refreshCases,
        isLoadingMore: false // Deprecated but kept for compat if needed, though unused now
    };
};
