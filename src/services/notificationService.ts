import { supabase } from '@/utils/supabase/client';

const NOTIFICATION_API_URL = 'https://mdkswlgcqsmgfmcuorxq.supabase.co/functions/v1/notifications';

import { InboxResponse, Notification, SendRequest } from '@/types/notification';

export const notificationService = {
    getInbox: async (limit = 20, unreadOnly = false): Promise<InboxResponse> => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No active session');

        const params = new URLSearchParams({
            limit: limit.toString(),
            unread: unreadOnly ? 'true' : 'false',
            _t: new Date().getTime().toString() // Prevent browser caching
        });

        const response = await fetch(`${NOTIFICATION_API_URL}/inbox?${params}`, {
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });

        if (!response.ok) throw new Error('Failed to fetch inbox');
        return await response.json();
    },

    markAsRead: async (notificationId?: string, markAll = false) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No active session');

        const response = await fetch(`${NOTIFICATION_API_URL}/read`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
                notification_id: notificationId,
                mark_all: markAll
            })
        });

        if (!response.ok) throw new Error('Failed to mark as read');
        return await response.json();
    },

    sendNotification: async (notification: Partial<Notification>) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No active session');

        // Transform to DispatchPayload format expected by the Edge Function
        const payload: SendRequest = {
            target: {
                type: 'single',
                value: notification.user_id || session.user.id
            },
            content: {
                title: notification.title || 'Notification',
                message: notification.message,
                type: notification.type || 'info',
                priority: notification.priority || 'normal',
                metadata: notification.metadata || {}
            }
        };

        const response = await fetch(`${NOTIFICATION_API_URL}/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to send notification: ${error}`);
        }

        return await response.json();
    }

};
