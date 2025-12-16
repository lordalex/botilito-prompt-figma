"use client";
import React, { createContext, useContext, useCallback } from 'react';
import { jobManager } from '@/lib/JobManager';
import { useToast } from '@/hooks/use-toast';

interface VoteTrackerContextType {
  submitVote: (payload: any) => string;
}

const VoteTrackerContext = createContext<VoteTrackerContextType | undefined>(undefined);

export const VoteTrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { toast } = useToast();

    const submitVote = useCallback((payload: any) => {
        const jobId = jobManager.addJob('voting', payload);
        toast({ title: "Diagnóstico Enviado", description: `Tu análisis se está procesando.` });
        return jobId;
    }, [toast]);

    const value = { submitVote };

    return (
        <VoteTrackerContext.Provider value={value}>
            {children}
        </VoteTrackerContext.Provider>
    );
};

export const useVoteTracker = (): VoteTrackerContextType => {
    const context = useContext(VoteTrackerContext);
    if (context === undefined) {
        throw new Error("useVoteTracker must be used within a VoteTrackerProvider.");
    }
    return context;
};