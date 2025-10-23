"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { api } from '@/utils/apiService'; // Importación correcta
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/providers/AuthProvider'; // Importación necesaria para la sesión

type VoteStatus = 'idle' | 'processing' | 'completed' | 'failed';
type TrackedVote = { jobId: string; status: VoteStatus; };

interface VoteTrackerContextType {
  trackedVotes: Record<string, TrackedVote>;
  trackNewVote: (caseId: string, jobId: string) => void;
  getVoteStatusForCase: (caseId: string) => VoteStatus;
  setRefreshCallback: (fn: () => void) => void;
}

const VoteTrackerContext = createContext<VoteTrackerContextType | undefined>(undefined);
const VOTE_JOBS_STORAGE_KEY = 'botilito-vote-jobs';
const POLLING_INTERVAL_MS = 5000;

export const VoteTrackerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [trackedVotes, setTrackedVotes] = useState<Record<string, TrackedVote>>({});
    const refreshCallback = useRef<(() => void) | null>(null);
    const { toast } = useToast();
    const { session } = useAuth(); // Obtener la sesión del contexto de autenticación

    useEffect(() => {
        try {
            const saved = localStorage.getItem(VOTE_JOBS_STORAGE_KEY);
            if (saved) setTrackedVotes(JSON.parse(saved));
        } catch (e) { console.warn("Failed to load vote jobs", e); }
    }, []);

    useEffect(() => {
        localStorage.setItem(VOTE_JOBS_STORAGE_KEY, JSON.stringify(trackedVotes));
    }, [trackedVotes]);

    const trackNewVote = useCallback((caseId: string, jobId: string) => {
        toast({ title: "Diagnóstico Enviado", description: `Tu análisis para el caso ${caseId.split('-').pop()} se está procesando.` });
        setTrackedVotes(prev => ({ ...prev, [caseId]: { jobId, status: 'processing' } }));
    }, [toast]);

    const getVoteStatusForCase = useCallback((caseId: string): VoteStatus => {
        return trackedVotes[caseId]?.status || 'idle';
    }, [trackedVotes]);

    useEffect(() => {
        const intervalId = setInterval(async () => {
            if (!session) return; // No hacer polling si no hay sesión
            const votesToPoll = Object.entries(trackedVotes).filter(([, vote]) => vote.status === 'processing' && vote.jobId);
            if (votesToPoll.length === 0) return;

            for (const [caseId, vote] of votesToPoll) {
                try {
                    // Usar la API unificada
                    const result = await api.voting.getStatus(session, vote.jobId);
                    if (result.status === 'completed' || result.status === 'failed') {
                        setTrackedVotes(prev => {
                            const newVotes = { ...prev };
                            if (result.status === 'completed') {
                                delete newVotes[caseId];
                            } else {
                                newVotes[caseId] = { ...newVotes[caseId], status: 'failed' };
                            }
                            return newVotes;
                        });

                        if (result.status === 'completed') {
                            toast({ title: "✅ Diagnóstico Confirmado", description: `Tu análisis para el caso ${caseId.split('-').pop()} se guardó.` });
                            refreshCallback.current?.();
                        } else {
                            toast({ variant: "destructive", title: "Error en Diagnóstico" });
                        }
                    }
                } catch (error) {
                    console.error(`[VotePoller] Error for case ${caseId}:`, error);
                    setTrackedVotes(prev => ({ ...prev, [caseId]: { ...prev[caseId], status: 'failed' } }));
                }
            }
        }, POLLING_INTERVAL_MS);

        return () => clearInterval(intervalId);
    }, [trackedVotes, toast, session]); // Añadir session a las dependencias

    const value = { trackedVotes, trackNewVote, getVoteStatusForCase, setRefreshCallback: (fn: () => void) => { refreshCallback.current = fn; } };
    return <VoteTrackerContext.Provider value={value}>{children}</VoteTrackerContext.Provider>;
};

export const useVoteTracker = (): VoteTrackerContextType => {
    const context = useContext(VoteTrackerContext);
    if (context === undefined) throw new Error("useVoteTracker must be used within a VoteTrackerProvider.");
    return context;
};
