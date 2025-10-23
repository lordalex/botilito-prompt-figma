import { useState, useEffect } from 'react';
import { jobManager, type Job } from '@/lib/JobManager';

/**
 * Hook de React para suscribirse a las actualizaciones de un trabajo específico del JobManager.
 * @param jobId El ID del trabajo a seguir.
 * @returns El estado más reciente del trabajo, o null si no hay jobId.
 */
export const useJobTracker = (jobId: string | null) => {
    const [job, setJob] = useState<Job | null>(jobId ? jobManager.getJob(jobId) || null : null);

    useEffect(() => {
        if (!jobId) {
            setJob(null);
            return;
        }

        const handleUpdate = (updatedJob: Job) => {
            if (updatedJob.id === jobId) {
                // Se crea un nuevo objeto para forzar la re-renderización
                setJob({ ...updatedJob });
            }
        };

        const initialJob = jobManager.getJob(jobId);
        setJob(initialJob || null);

        // Suscribirse a los eventos de actualización
        jobManager.on('job:updated', handleUpdate);

        // Limpiar la suscripción al desmontar el componente
        return () => {
            jobManager.off('job:updated', handleUpdate);
        };
    }, [jobId]);

    return job;
};
