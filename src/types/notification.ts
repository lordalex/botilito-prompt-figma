export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationPriority = 'low' | 'normal' | 'high';

/**
 * Notification Metadata Schema (v2.0.0 - Active Sync)
 * 
 * Dynamic data attached to notifications for routing and state tracking.
 * 
 * The backend uses "Active Sync on Fetch":
 * When GET /inbox is called, the server:
 * 1. Checks any pending jobs in analysis_jobs table
 * 2. Polls the Analysis Engine using stored status_url
 * 3. If job status changed, inserts new notification and updates job record
 * 4. Returns fresh inbox list
 * 
 * Metadata Fields:
 * - job_id: UUID of the analysis job (always present)
 * - status: Current job status
 * - doc_id: UUID of final document (present when status === 'completed')
 * - error: Error description (present when status === 'failed')
 * 
 * Navigation Rules:
 * - completed + doc_id → /analysis/{doc_id}
 * - processing → /status/{job_id}
 * - failed + error → Show error modal/toast
 */
export interface NotificationMetadata {
    job_id: string;
    status: 'processing' | 'completed' | 'failed';
    doc_id?: string;        // Present if status is 'completed'
    error?: string;         // Present if status is 'failed'
    status_url?: string;    // URL to check latest status
    [key: string]: any;     // Allow additional properties for extensibility
}

/**
 * Notification Item
 * 
 * Represents a single notification in the user's inbox.
 * Multiple notifications can exist for the same job (e.g., "Started" + "Finished")
 * to provide a timeline/history.
 */
export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: NotificationType;
    priority: NotificationPriority;
    is_read: boolean;
    metadata?: NotificationMetadata;
    created_at: string;
}

/**
 * Target for manual notification dispatch
 */
export interface NotificationTarget {
    type: 'single' | 'broadcast_role';
    value: string;
}

/**
 * Content for notification creation
 */
export interface NotificationContent {
    title: string;
    message?: string;
    type?: NotificationType;
    priority?: NotificationPriority;
    metadata?: NotificationMetadata;
}

/**
 * Manual send request (admin/system use)
 */
export interface SendRequest {
    target: NotificationTarget;
    content: NotificationContent;
}

export interface PaginationMeta {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    unreadCount: number;
}

/**
 * Response from GET /inbox
 */
export interface InboxResponse {
    data: Notification[];
    meta: PaginationMeta;
}
