import React, { useState } from 'react';
import { useNotifications } from '@/providers/NotificationProvider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, AlertCircle, Info, Bell, Check, Trash2, Filter } from 'lucide-react';
import { Notification } from '@/types/notification';

interface NotificationsViewProps {
    onViewTask: (jobId: string, type: string, status?: string) => void;
}

// Add api import
import { api } from '@/services/api';
import { useAuth } from '@/providers/AuthProvider';

/**
 * NotificationsView Component (v2.0.0 - Active Sync)
 * 
 * Updated navigation logic to use new metadata schema:
 * - metadata.status: 'processing' | 'completed' | 'failed'
 * - metadata.doc_id: Present when completed - navigate to /dashboard/analysis/{doc_id}
 * - metadata.job_id: Always present - used for processing status or fallback
 * - metadata.error: Present when failed - show error message
 * 
 * Navigation Rules:
 * 1. Completed: Redirect to /dashboard/analysis/{doc_id}
 * 2. Processing: Redirect to /dashboard/status/{job_id} (polling page)
 * 3. Failed: Show error modal/toast with metadata.error
 */
export function NotificationsView({ onViewTask }: NotificationsViewProps) {
    const { session } = useAuth(); // Get session for authenticated requests
    const { notifications, unreadCount, markAsRead } = useNotifications();
    const [filter, setFilter] = useState<'all' | 'unread' | 'info' | 'success' | 'warning' | 'error'>('all');
    const [isLoadingDetails, setIsLoadingDetails] = useState<string | null>(null); // Track which notification is loading

    const uniqueNotifications = React.useMemo(() => {
        const seenJobs = new Set<string>();
        return notifications.filter(n => {
            const jobId = n.metadata?.job_id;
            if (jobId) {
                if (seenJobs.has(jobId)) return false;
                seenJobs.add(jobId);
            }
            return true;
        });
    }, [notifications]);

    const filteredNotifications = uniqueNotifications.filter(n => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !n.is_read;
        return n.type === filter;
    });

    const handleMarkAllRead = () => {
        markAsRead(undefined, true);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />;
            default: return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    /**
     * Handle notification click with new v1.3.0 metadata schema
     */
    /**
     * Handle notification click with robust status checking (v2.0.1)
     * 
     * 1. If status_url exists, fetch fresh status (job might be completed now vs processing when notif created)
     * 2. If valid result found in fresh status, use THAT id (case_id/doc_id) for navigation
     * 3. Fallback to existing metadata if fetch fails or no URL
     */
    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.is_read) {
            markAsRead(notification.id);
        }

        const metadata = notification.metadata;
        if (!metadata?.job_id) return;

        // PRIORITY 1: Always check fresh status via status_url if available
        // This prevents using stale 'doc_id' from metadata which causes "Case not found"
        if (metadata.status_url && session) {
            try {
                setIsLoadingDetails(notification.id);
                const freshStatus = await api.generic.get(session, metadata.status_url);

                // Check if job is now completed
                if (freshStatus.status === 'completed') {
                    // Edge case: Job completed but returned an error result (e.g. "Not found")
                    if (freshStatus.result?.error) {
                        console.error("Job completed with internal error:", freshStatus.result.error);
                        onViewTask(metadata.job_id, 'error', 'failed');
                        return;
                    }

                    // Extract ID - commonly result.id, doc_id, or case_id
                    const validId = freshStatus.result?.id || freshStatus.result?.case_id || freshStatus.result?.resolved_case_id || freshStatus.doc_id || metadata.doc_id;

                    if (validId) {
                        onViewTask(validId, 'analysis', 'completed');
                        return;
                    }
                } else if (freshStatus.status === 'failed') {
                    onViewTask(metadata.job_id, 'error', 'failed');
                    return;
                }
            } catch (error) {
                console.error("Failed to fetch fresh job status:", error);
                // Fall through to fallback behavior below on error
            } finally {
                setIsLoadingDetails(null);
            }
        }

        // PRIORITY 2: Fallback to existing metadata (Optimistic / Offline)
        if (metadata.status === 'completed' && metadata.doc_id) {
            onViewTask(metadata.doc_id, 'analysis', 'completed');
            return;
        }

        if (metadata.status === 'failed' && metadata.error) {
            onViewTask(metadata.job_id, 'error', 'failed');
            return;
        }

        // Fallback: Navigation based on existing metadata
        const status = metadata.status;
        const jobId = metadata.job_id;

        if (status === 'processing') {
            onViewTask(jobId, 'status', 'processing');
        } else {
            // Default fallback
            onViewTask(jobId, 'analysis', status || 'unknown');
        }
    };


    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Centro de Notificaciones</h1>
                    <p className="text-muted-foreground">Gestiona tus alertas y actualizaciones del sistema.</p>
                </div>
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
                            <Check className="mr-2 h-4 w-4" /> Marcar todo como leído
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center">
                                <Filter className="mr-2 h-4 w-4" /> Filtros
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-1">
                            <Button
                                variant={filter === 'all' ? 'secondary' : 'ghost'}
                                className={`justify-start ${filter === 'all' ? 'bg-[#FFD700] hover:bg-[#fae255] text-black font-medium' : ''}`}
                                onClick={() => setFilter('all')}
                            >
                                Todas
                                <Badge variant="secondary" className="ml-auto text-xs bg-white/50">{notifications.length}</Badge>
                            </Button>
                            <Button
                                variant={filter === 'unread' ? 'secondary' : 'ghost'}
                                className="justify-start"
                                onClick={() => setFilter('unread')}
                            >
                                No leídas
                                {unreadCount > 0 && <Badge variant="destructive" className="ml-auto text-xs">{unreadCount}</Badge>}
                            </Button>
                            <div className="my-2 border-t" />
                            <Button variant={filter === 'info' ? 'secondary' : 'ghost'} className="justify-start text-xs" onClick={() => setFilter('info')}>
                                <Info className="mr-2 h-3 w-3 text-blue-500" /> Información
                            </Button>
                            <Button variant={filter === 'success' ? 'secondary' : 'ghost'} className="justify-start text-xs" onClick={() => setFilter('success')}>
                                <CheckCircle className="mr-2 h-3 w-3 text-green-500" /> Éxito
                            </Button>
                            <Button variant={filter === 'warning' ? 'secondary' : 'ghost'} className="justify-start text-xs" onClick={() => setFilter('warning')}>
                                <AlertTriangle className="mr-2 h-3 w-3 text-yellow-500" /> Advertencia
                            </Button>
                            <Button variant={filter === 'error' ? 'secondary' : 'ghost'} className="justify-start text-xs" onClick={() => setFilter('error')}>
                                <AlertCircle className="mr-2 h-3 w-3 text-red-500" /> Error
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Bandeja de Entrada</CardTitle>
                            <CardDescription>
                                {filteredNotifications.length === 0
                                    ? "No hay notificaciones que coincidan con el filtro."
                                    : `Mostrando ${filteredNotifications.length} notificaciones.`
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {filteredNotifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                    <Bell className="h-12 w-12 mb-4 opacity-20" />
                                    <p>No tienes notificaciones en esta vista.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredNotifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`flex items-start p-4 rounded-xl border transition-all cursor-pointer hover:shadow-sm ${!notification.is_read ? 'bg-white border-l-4 border-l-[#FFD700]' : 'bg-white border-gray-100'
                                                }`}
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <div className="mr-4 mt-1">
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex flex-col mb-1">
                                                    <p className={`text-sm font-medium leading-tight ${!notification.is_read ? 'text-black' : ''}`}>
                                                        {notification.title}
                                                    </p>
                                                    <span className="text-[10px] text-muted-foreground mt-1">
                                                        {new Date(notification.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {notification.message}
                                                </p>
                                                {notification.metadata?.job_id && (
                                                    <Button
                                                        variant="link"
                                                        className="px-0 h-auto text-xs mt-2 text-[#FFD700] hover:text-[#e6c200] font-medium"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleNotificationClick(notification);
                                                        }}
                                                        disabled={isLoadingDetails === notification.id}
                                                    >
                                                        {isLoadingDetails === notification.id ? 'Cargando status...' : 'Ver detalles →'}
                                                    </Button>
                                                )}
                                            </div>
                                            {!notification.is_read && (
                                                <div className="ml-4 flex-shrink-0 self-center">
                                                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
