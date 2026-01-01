export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationPriority = 'low' | 'normal' | 'high';

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

export interface NotificationTarget {
    type: 'single' | 'multiple' | 'broadcast_role';
    value: string | string[];
}

export interface NotificationContent {
    title: string;
    message?: string;
    type?: NotificationType;
    priority?: NotificationPriority;
    metadata?: Record<string, any>;
}

export interface SendRequest {
    target: NotificationTarget;
    content: NotificationContent;
}

export interface AsyncTask {
    job_id: string;
    type: 'image_analysis' | 'text_analysis' | 'audio_analysis';
    status: 'created' | 'running' | 'completed' | 'failed';
    created_at: string;
    updated_at?: string;
    metadata?: Record<string, any>; // file info, etc.
}

export interface InboxResponse {
    unread_count: number;
    notifications: Notification[];
}
