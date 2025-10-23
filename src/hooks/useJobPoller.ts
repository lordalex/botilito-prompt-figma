import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { jobManager, type Job, JobType } from '@/lib/JobManager';
import { api } from '@/utils/apiService';
import { useToast } from './ui/use-toast';

interface PollerOptions {
  enabled?: boolean;
  interval?: number;
  timeout?: number;
}

export const useJobPoller = (jobId: string | null, jobType: JobType, options: PollerOptions = {}) => {
    const { enabled = true, interval = 10000, timeout = 60000 } = options;
    const { session } = useAuth();
    const { toast } = useToast();
    
    // El estado del hook es el propio trabajo, obtenido del manager
    const [job, setJob] = useState<Job | null>(jobId ? jobManager.getJob(jobId) : null);
    
    // Usamos refs para los temporizadores para no causar re-renders
    const pollerInterval = useRef<number | null>(null);
    const pollerTimeout = useRef<number | null>(null);

    useEffect(() => {
        const handleJobUpdate = (updatedJob: Job) => {
            if (updatedJob.id === jobId) {
                setJob({ ...updatedJob });
            }
        };

        jobManager.on('job:updated', handleJobUpdate);
        // Sincronizar estado inicial al montar o al cambiar el jobId
        setJob(jobId ? jobManager.getJob(jobId) : null);

        return () => {
            jobManager.off('job:updated', handleJobUpdate);
        };
    }, [jobId]);

    useEffect(() => {
        const cleanup = () => {
            if (pollerInterval.current) clearInterval(pollerInterval.current);
            if (pollerTimeout.current) clearTimeout(pollerTimeout.current);
            pollerInterval.current = null;
            pollerTimeout.current = null;
        };

        if (!enabled || !jobId || !session || job?.status === 'completed' || job?.status === 'failed' || job?.status === 'timeout') {
            cleanup();
            return;
        }

        const poll = async () => {
            try {
                let result;
                if (jobType === 'ingestion') result = await api.ingestion.getStatus(session, job.apiJobId!);
                else if (jobType === 'voting') result = await api.voting.getStatus(session, job.apiJobId!);
                else if (jobType === 'search') result = await api.search.getStatus(session, job.apiJobId!);

                if (result?.status === 'completed') {
                    jobManager.updateJob(jobId, { status: 'completed', result: result.result, progress: 100, endTime: Date.now() });
                } else if (result?.status === 'failed') {
                    jobManager.updateJob(jobId, { status: 'failed', error: result.error?.message || 'Job failed' });
                } else {
                    // Si sigue en proceso, solo actualizamos el progreso para dar feedback visual
                    jobManager.updateJob(jobId, { progress: Math.min((job?.progress || 0) + 10, 95) });
                }
            } catch (error: any) {
                jobManager.updateJob(jobId, { status: 'failed', error: 'Polling request failed.' });
            }
        };

        if (job?.status === 'pending') {
             // El JobManager se encarga de moverlo a 'processing', aquí solo esperamos.
        } else if (job?.status === 'processing') {
            if (!pollerInterval.current) {
                pollerInterval.current = setInterval(poll, interval);
            }
            if (!pollerTimeout.current) {
                pollerTimeout.current = setTimeout(() => {
                    jobManager.updateJob(jobId, { status: 'timeout', error: 'La operación excedió el tiempo límite.' });
                    toast({ variant: "destructive", title: "Tiempo de espera excedido" });
                }, timeout);
            }
        }

        return cleanup;

    }, [job, jobId, jobType, session, enabled, interval, timeout, toast]);

    return { 
        job, 
        isLoading: job?.status === 'pending' || job?.status === 'processing',
        isError: job?.status === 'failed' || job?.status === 'timeout',
    };
};
