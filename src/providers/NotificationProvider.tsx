import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/utils/supabase/client';
import { Notification } from '@/types/notification';
import { notificationService } from '@/services/notificationService';

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    loadingDetails: { [jobId: string]: boolean };
    pollingInterval: number;
    markAsRead: (id?: string, markAll?: boolean) => Promise<void>;
    refreshNotifications: () => Promise<void>;
    getTaskResult: (jobId: string) => Promise<any>;
    setPollingInterval: (ms: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/**
 * NotificationProvider (v2.0.0 - Active Sync on Fetch)
 * 
 * **MAJOR CHANGE:** This provider no longer manages active tasks or polls job statuses.
 * 
 * The server implements "Active Sync on Fetch" - when GET /inbox is called, the backend:
 * 1. Checks any pending jobs in analysis_jobs table
 * 2. Polls the Analysis Engine using stored status_url
 * 3. If job status changed, inserts new notification and updates job record
 * 4. Returns fresh inbox list
 * 
 * Client responsibilities:
 * - Poll /inbox regularly (default: 30s) to trigger server-side sync
 * - Display notifications and manage read status
 * - Navigate to appropriate views based on notification metadata
 * 
 * Removed:
 * - activeTasks state (no longer needed)
 * - registerTask function (server handles this)
 * - Client-side job polling logic (handled by server)
 * - TASK_POLLING_INTERVAL (no longer needed)
 */
export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loadingDetails, setLoadingDetails] = useState<{ [jobId: string]: boolean }>({});

    // Initialize polling interval from localStorage or default to 30s (recommended in v1.3.0)
    const [pollingInterval, setPollingIntervalState] = useState<number>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('notificationPollingInterval');
            return saved ? parseInt(saved, 10) : 30000;
        }
        return 30000;
    });

    const setPollingInterval = (ms: number) => {
        setPollingIntervalState(ms);
        localStorage.setItem('notificationPollingInterval', ms.toString());
    };

    const refreshNotifications = useCallback(async () => {
        try {
            const inbox = await notificationService.getInbox(20);
            setNotifications(inbox.data);
            setUnreadCount(inbox.meta.unreadCount);
        } catch (err: any) {
            // Suppress "No active session" error as it is expected when logged out
            if (err.message === 'No active session') return;
            console.error('Failed to fetch notifications:', err);
        }
    }, []);

    // Initial Fetch & Inbox Polling
    // The server will automatically check pending jobs and update notifications when this is called
    useEffect(() => {
        refreshNotifications();
        const interval = setInterval(refreshNotifications, pollingInterval);
        return () => clearInterval(interval);
    }, [refreshNotifications, pollingInterval]);

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

    // Retrieve result for a completed task (if needed by UI)
    // This is kept for backward compatibility but should rarely be used
    // since notifications now contain doc_id for direct navigation
    const getTaskResult = async (jobId: string) => {
        setLoadingDetails(prev => ({ ...prev, [jobId]: true }));
        try {
            // Implementation would depend on which analysis API to call
            // For now, return null since this should be handled by direct doc_id navigation
            return null;
        } finally {
            setLoadingDetails(prev => ({ ...prev, [jobId]: false }));
        }
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            loadingDetails,
            pollingInterval,
            markAsRead,
            refreshNotifications,
            getTaskResult,
            setPollingInterval
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
