export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: NotificationType;
    priority: NotificationPriority;
    is_read: boolean;
    metadata?: Record<string, any>;
    created_at: string;
}

export interface AsyncTask {
    job_id: string;
    type: 'image_analysis' | 'text_analysis';
    status: 'created' | 'running' | 'completed' | 'failed';
    created_at: string;
    updated_at?: string;
    metadata?: Record<string, any>; // file info, etc.
}

export interface InboxResponse {
    unread_count: number;
    notifications: Notification[];
}
