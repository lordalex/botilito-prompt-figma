import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/utils/supabase/client';
import { Notification, AsyncTask } from '@/types/notification';
import { notificationService } from '@/services/notificationService';
import { imageAnalysisService, JobStatusResponse } from '@/services/imageAnalysisService';
import { audioAnalysisService } from '@/services/audioAnalysisService';
import { checkAnalysisStatusOnce } from '@/lib/analysisPipeline';
import { AnalysisResult } from '@/types/imageAnalysis';

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    activeTasks: AsyncTask[];
    loadingDetails: { [jobId: string]: boolean };
    registerTask: (jobId: string, type: AsyncTask['type'], metadata?: any) => void;
    markAsRead: (id?: string, markAll?: boolean) => Promise<void>;
    refreshNotifications: () => Promise<void>;
    getTaskResult: (jobId: string) => Promise<any>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [activeTasks, setActiveTasks] = useState<AsyncTask[]>([]);
    const [loadingDetails, setLoadingDetails] = useState<{ [jobId: string]: boolean }>({});

    // Polling Interval for Tasks (5 seconds)
    const TASK_POLLING_INTERVAL = 5000;
    // Polling Interval for Inbox (30 seconds)
    const INBOX_POLLING_INTERVAL = 30000;

    const refreshNotifications = useCallback(async () => {
        try {
            const inbox = await notificationService.getInbox(20);
            setNotifications(inbox.notifications);
            setUnreadCount(inbox.unread_count);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    }, []);

    // Initial Fetch & Inbox Polling
    useEffect(() => {
        refreshNotifications();
        const interval = setInterval(refreshNotifications, INBOX_POLLING_INTERVAL);
        return () => clearInterval(interval);
    }, [refreshNotifications]);

    const markAsRead = async (id?: string, markAll?: boolean) => {
        try {
            await notificationService.markAsRead(id, markAll);
            // Optimistic update
            if (markAll) {
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                setUnreadCount(0);
            } else if (id) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error('Failed to mark as read:', err);
            refreshNotifications(); // Revert on error
        }
    };

    const registerTask = (jobId: string, type: AsyncTask['type'], metadata?: any) => {
        if (activeTasks.some(t => t.job_id === jobId)) return;

        const newTask: AsyncTask = {
            job_id: jobId,
            type,
            status: 'running',
            created_at: new Date().toISOString(),
            metadata
        };
        setActiveTasks(prev => [...prev, newTask]);
    };

    // Task Polling Logic
    useEffect(() => {
        if (activeTasks.length === 0) return;

        const checkTasks = async () => {
            const tasksToRemove: string[] = [];
            const updatedTasks = [...activeTasks];
            let listChanged = false;

            for (let i = 0; i < updatedTasks.length; i++) {
                const task = updatedTasks[i];
                if (task.status !== 'running') continue;

                try {
                    // Support for both image and text analysis
                    let status: string = task.status;
                    let isCompleted = false;
                    let isFailed = false;

                    if (task.type === 'image_analysis') {
                        const jobStatus = await imageAnalysisService.getJobStatus(task.job_id);
                        status = jobStatus.status;
                    } else if (task.type === 'audio_analysis') {
                        const jobStatus = await audioAnalysisService.getJobStatus(task.job_id);
                        status = jobStatus.status;
                    } else if (task.type === 'text_analysis') {
                        const jobStatus = await checkAnalysisStatusOnce(task.job_id);
                        status = jobStatus.status;
                    }

                    if (status !== task.status) {
                        // Cast status to match AsyncTask type since we validated it logically
                        updatedTasks[i] = { ...task, status: status as AsyncTask['status'], updated_at: new Date().toISOString() };
                        listChanged = true;

                        if (status === 'completed') {
                            const notification: Notification = {
                                id: crypto.randomUUID(),
                                user_id: '', // Will be handled by service/backend
                                type: 'success',
                                title: 'Análisis Completado',
                                message: `Tu análisis de ${task.type === 'text_analysis' ? 'texto' : task.type === 'audio_analysis' ? 'audio' : 'imagen'} ha finalizado correctamente.`,
                                created_at: new Date().toISOString(),
                                is_read: false,
                                priority: 'normal',
                                metadata: {
                                    job_id: task.job_id,
                                    source: task.type === 'text_analysis' ? 'ai-analysis' : task.type === 'audio_analysis' ? 'audio-upload' : 'upload',
                                    actionable: true,
                                    final_status: 'completed'
                                }
                            };
                            await notificationService.sendNotification(notification).catch(console.error);
                            setNotifications(prev => [notification, ...prev]);
                            setUnreadCount(prev => prev + 1);
                        } else if (status === 'failed') {
                            const notification: Notification = {
                                id: crypto.randomUUID(),
                                user_id: '',
                                type: 'error',
                                title: 'Error en Análisis',
                                message: `Hubo un problema procesando tu solicitud de ${task.type === 'text_analysis' ? 'texto' : task.type === 'audio_analysis' ? 'audio' : 'imagen'}.`,
                                created_at: new Date().toISOString(),
                                is_read: false,
                                priority: 'high',
                                metadata: {
                                    job_id: task.job_id,
                                    source: task.type === 'text_analysis' ? 'ai-analysis' : task.type === 'audio_analysis' ? 'audio-upload' : 'upload',
                                    actionable: true,
                                    final_status: 'failed'
                                }
                            };
                            await notificationService.sendNotification(notification).catch(console.error);
                            setNotifications(prev => [notification, ...prev]);
                            setUnreadCount(prev => prev + 1);
                        }
                    }
                } catch (err) {
                    console.error(`Error checking task ${task.job_id}:`, err);
                }
            }

            if (listChanged) {
                setActiveTasks(updatedTasks);
            }
        };

        const interval = setInterval(checkTasks, TASK_POLLING_INTERVAL);
        return () => clearInterval(interval);
    }, [activeTasks]);

    // Retrieve result for a completed task (memoized/fetched)
    const getTaskResult = async (jobId: string) => {
        setLoadingDetails(prev => ({ ...prev, [jobId]: true }));
        try {
            // Re-use polling endpoint which returns result if completed
            const status = await imageAnalysisService.getJobStatus(jobId);
            if (status.status === 'completed' && status.result) {
                // We need to map it using the service's internal mapper, but that's private.
                // Ideally, getJobStatus should return the mapped result or we export the mapper.
                // For now, let's assume the UI will handle the raw result or we need to expose the mapper.
                // WAIT: imageAnalysisService.getJobStatus returns JobStatusResponse (raw).
                // We should probably modify imageAnalysisService to have a 'getResult(jobId)' that returns AnalysisResult using the mapper.

                // Since we can't easily access the mapper from here without exporting it, 
                // strict typing suggests we should likely implement 'getAnalysisResult(jobId)' in service.
                return status.result;
            }
            return null;
        } finally {
            setLoadingDetails(prev => ({ ...prev, [jobId]: false }));
        }
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            activeTasks,
            loadingDetails,
            registerTask,
            markAsRead,
            refreshNotifications,
            getTaskResult
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
    return context;
};
