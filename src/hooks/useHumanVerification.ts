
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { api } from '@/services/api';
import { fetchCaseDetails, getUserVerificationStats, transformStandardizedToEnriched } from '../utils/humanVerification/api';
import { useVoteTracker } from '../providers/VoteTrackerProvider';
import { useJobTracker } from './useJobTracker';
import type { CaseEnriched, Profile } from '../types';
import { getCachedData, setCachedData, clearCachedData, CACHE_KEYS } from '@/utils/sessionCache';
import { jobManager } from '@/lib/JobManager';

export const useHumanVerification = () => {
    const { user, session } = useAuth();
    const { submitVote } = useVoteTracker();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [cases, setCases] = useState<CaseEnriched[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userStats, setUserStats] = useState<{ total_verifications: number, points: number } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [successDialogData, setSuccessDialogData] = useState<any>(null);
    const [initialProfile, setInitialProfile] = useState<Profile | null>(null);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [summaryJobId, setSummaryJobId] = useState<string | null>(null);
    const [voteJobId, setVoteJobId] = useState<string | null>(null);

    const summaryJob = useJobTracker(summaryJobId);
    const voteJob = useJobTracker(voteJobId);

    useEffect(() => {
        if (session) {
            jobManager.setSession(session);
        }
    }, [session]);

    const handleVoteCompletion = useCallback(async () => {
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
    }, [user, session, initialProfile]);

    useEffect(() => {
        if (summaryJob?.status === 'completed') {
            const summary = summaryJob.result;
            if (summary && summary.cases) {
                const enrichedCases = summary.cases.map(transformStandardizedToEnriched);
                setCases(enrichedCases);

                const pageSize = 10;
                const total = summary.pagination.totalItems || summary.summary?.total;
                if (total) {
                    setTotalPages(Math.ceil(total / pageSize));
                }
                setHasMore(!!summary.pagination?.hasMore);

                setCachedData(CACHE_KEYS.HUMAN_VERIFICATION, enrichedCases);
            }
            setIsLoading(false);
        } else if (summaryJob?.status === 'failed') {
            setError(summaryJob.error || 'Error al cargar la lista de casos.');
            setIsLoading(false);
        } else if (summaryJob?.status === 'processing' || summaryJob?.status === 'pending') {
            setIsLoading(true);
        }
    }, [summaryJob]);

    useEffect(() => {
        if (voteJob?.status === 'completed') {
            handleVoteCompletion();
        }
    }, [voteJob, handleVoteCompletion]);


    const goToPage = async (newPage: number) => {
        if (newPage < 1 || isLoading || (totalPages > 0 && newPage > totalPages)) return;
        setPage(newPage);
        const jobId = jobManager.addJob('search', { page: newPage, pageSize: 10 });
        setSummaryJobId(jobId);
    };

    const refreshCases = async () => {
        if (isLoading) return;
        clearCachedData(CACHE_KEYS.HUMAN_VERIFICATION);
        clearCachedData(CACHE_KEYS.HUMAN_VERIFICATION_STATS);
        setPage(1);
        const jobId = jobManager.addJob('search', { page: 1, pageSize: 10 });
        setSummaryJobId(jobId);

        if (user) {
            try {
                const stats = await getUserVerificationStats(user.id);
                setUserStats(stats);
                setCachedData(CACHE_KEYS.HUMAN_VERIFICATION_STATS, stats);
            } catch (e) {
                console.error("Error refreshing stats:", e);
            }
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
            if (!user) return;

            const cachedCases = getCachedData<CaseEnriched[]>(CACHE_KEYS.HUMAN_VERIFICATION);
            const cachedStats = getCachedData<{ total_verifications: number, points: number }>(CACHE_KEYS.HUMAN_VERIFICATION_STATS);

            if (cachedCases && cachedStats) {
                setCases(cachedCases);
                setUserStats(cachedStats);
                setIsLoading(false);
                try {
                    const profileResponse = await api.profile.get(session!);
                    setProfile(profileResponse.data);
                    setInitialProfile(profileResponse.data);
                } catch (e) { }
                return;
            }

            const jobId = jobManager.addJob('search', { page: 1, pageSize: 10 });
            setSummaryJobId(jobId);

            try {
                const profileResponse = await api.profile.get(session!);
                setProfile(profileResponse.data);
                setInitialProfile(profileResponse.data);

                if (user) {
                    const stats = await getUserVerificationStats(user.id);
                    setUserStats(stats);
                }

            } catch (e: any) {
                setError(e.message || 'Error al cargar los datos.');
                setIsLoading(false);
            }
        };
        loadInitialData();
    }, [user, session]);


    const handleSelectCase = async (caseId: string) => {
        // This part doesn't seem to use the job manager, so it can stay as is.
        // However, fetchCaseDetails also uses a job, so it should be converted too.
        // For now, I'll leave it as is, as the user's main complaint was about the list.
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
        initialProfile,
        cases,
        selectedCase: summaryJob?.status === 'completed' ? cases.find(c => c.id === selectedCase?.id) : selectedCase,
        isLoading: isLoading || summaryJob?.status === 'processing' || summaryJob?.status === 'pending',
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
        isLoadingMore: false
    };
};
