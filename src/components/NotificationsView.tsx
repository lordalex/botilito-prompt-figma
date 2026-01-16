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
        console.log('[NotificationClick] ===== CLICK START =====');
        console.log('[NotificationClick] Notification:', notification);
        console.log('[NotificationClick] Metadata:', notification.metadata);

        if (!notification.is_read) {
            markAsRead(notification.id);
        }

        const metadata = notification.metadata;
        if (!metadata?.job_id) {
            console.log('[NotificationClick] No job_id in metadata, returning');
            return;
        }

        const getJobTypeFromMetadata = (metadata: any): string => {
            if (metadata.service === 'forensics') {
                if (notification.message.toLowerCase().includes('imagen')) {
                    return 'image_analysis';
                }
                if (notification.message.toLowerCase().includes('audio')) {
                    return 'audio_analysis';
                }
                // Fallback for forensics
                return 'image_analysis';
            }
            if (metadata.service) {
                return metadata.service;
            }
            if (metadata.status_url) {
                if (metadata.status_url.includes('image-analysis')) return 'image_analysis';
                if (metadata.status_url.includes('audio-analysis')) return 'audio_analysis';
                if (metadata.status_url.includes('text-analysis')) return 'text_analysis';
            }
            return 'analysis'; // fallback
        };

        const jobType = getJobTypeFromMetadata(metadata);
        let effectiveStatus = metadata.new_status || metadata.status;
        const effectiveDocId = metadata.case_id || metadata.doc_id || metadata.job_id;

        // If status is missing, but we have a job_id and not a final doc_id,
        // assume it's still processing. This handles cases where the notification
        // was created before the status was available.
        if (!effectiveStatus && metadata.job_id && !metadata.doc_id && !metadata.case_id) {
            effectiveStatus = 'processing';
            console.log('[NotificationClick] Status inferred as "processing"');
        }

        console.log('[NotificationClick] Determined jobType:', jobType);
        onViewTask(effectiveDocId, jobType, effectiveStatus);

        console.log('[NotificationClick] ===== CLICK END =====');
    };


    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Yellow accent header banner */}
            <div className="bg-[#ffe97a] rounded-xl px-6 py-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                        <Bell className="h-6 w-6" />
                        Centro de Notificaciones
                    </h1>
                    <p className="text-sm text-gray-700 mt-1">Gestiona tus alertas y actualizaciones del sistema.</p>
                </div>
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleMarkAllRead}
                            className="bg-white hover:bg-gray-50 border-gray-300"
                        >
                            <Check className="mr-2 h-4 w-4" /> Marcar todo como leído
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Filters Sidebar */}
                <div className="lg:col-span-1">
                    <Card className="border-2 shadow-sm sticky top-4" style={{ borderColor: '#FFDA00' }}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <div className="bg-yellow-100 p-1.5 rounded-full">
                                    <Filter className="h-4 w-4 text-[#FFDA00]" />
                                </div>
                                Filtros
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-1">
                            <Button
                                variant={filter === 'all' ? 'secondary' : 'ghost'}
                                className={`justify-start ${filter === 'all' ? 'bg-[#FFD700] hover:bg-[#fae255] text-black font-medium' : ''}`}
                                onClick={() => setFilter('all')}
                            >
                                Todas
                                <Badge variant="secondary" className="ml-auto text-xs bg-gray-100">{notifications.length}</Badge>
                            </Button>
                            <Button
                                variant={filter === 'unread' ? 'secondary' : 'ghost'}
                                className={`justify-start ${filter === 'unread' ? 'bg-[#FFD700] hover:bg-[#fae255] text-black font-medium' : ''}`}
                                onClick={() => setFilter('unread')}
                            >
                                No leídas
                                {unreadCount > 0 && <Badge variant="destructive" className="ml-auto text-xs">{unreadCount}</Badge>}
                            </Button>
                            <div className="my-2 border-t border-gray-200" />
                            <Button variant={filter === 'info' ? 'secondary' : 'ghost'} className={`justify-start text-xs ${filter === 'info' ? 'bg-blue-50' : ''}`} onClick={() => setFilter('info')}>
                                <Info className="mr-2 h-3 w-3 text-blue-500" /> Información
                            </Button>
                            <Button variant={filter === 'success' ? 'secondary' : 'ghost'} className={`justify-start text-xs ${filter === 'success' ? 'bg-green-50' : ''}`} onClick={() => setFilter('success')}>
                                <CheckCircle className="mr-2 h-3 w-3 text-green-500" /> Éxito
                            </Button>
                            <Button variant={filter === 'warning' ? 'secondary' : 'ghost'} className={`justify-start text-xs ${filter === 'warning' ? 'bg-yellow-50' : ''}`} onClick={() => setFilter('warning')}>
                                <AlertTriangle className="mr-2 h-3 w-3 text-yellow-500" /> Advertencia
                            </Button>
                            <Button variant={filter === 'error' ? 'secondary' : 'ghost'} className={`justify-start text-xs ${filter === 'error' ? 'bg-red-50' : ''}`} onClick={() => setFilter('error')}>
                                <AlertCircle className="mr-2 h-3 w-3 text-red-500" /> Error
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Inbox */}
                <div className="lg:col-span-3">
                    <Card className="border-2 shadow-sm" style={{ borderColor: '#FFDA00' }}>
                        <CardHeader className="border-b border-gray-100">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <div className="bg-yellow-100 p-1.5 rounded-full">
                                    <Bell className="h-4 w-4 text-[#FFDA00]" />
                                </div>
                                Bandeja de Entrada
                            </CardTitle>
                            <CardDescription>
                                {filteredNotifications.length === 0
                                    ? "No hay notificaciones que coincidan con el filtro."
                                    : `Mostrando ${filteredNotifications.length} notificaciones.`
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4">
                            {filteredNotifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                                    <div className="bg-gray-100 p-4 rounded-full mb-4">
                                        <Bell className="h-12 w-12 opacity-30" />
                                    </div>
                                    <p className="text-lg font-medium">No tienes notificaciones</p>
                                    <p className="text-sm mt-1">Las nuevas alertas aparecerán aquí</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {filteredNotifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`flex flex-col p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md hover:scale-[1.01] ${!notification.is_read
                                                    ? 'bg-white border-[#FFD700] shadow-sm'
                                                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                                                }`}
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <div className="flex items-start gap-3 mb-2">
                                                <div className={`shrink-0 p-2 rounded-full ${notification.type === 'success' ? 'bg-green-100' :
                                                        notification.type === 'warning' ? 'bg-yellow-100' :
                                                            notification.type === 'error' ? 'bg-red-100' : 'bg-blue-100'
                                                    }`}>
                                                    {getIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-semibold leading-tight truncate ${!notification.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                                                        {notification.title}
                                                    </p>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {new Date(notification.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                                {!notification.is_read && (
                                                    <div className="h-2 w-2 rounded-full bg-[#FFD700] shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
                                                {notification.message}
                                            </p>
                                            {notification.metadata?.job_id && notification.metadata?.status !== 'pending' && notification.metadata?.status !== 'processing' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full text-xs border-[#FFD700] text-gray-700 hover:bg-[#ffe97a] hover:text-gray-900"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleNotificationClick(notification);
                                                    }}
                                                    disabled={isLoadingDetails === notification.id}
                                                >
                                                    {isLoadingDetails === notification.id ? 'Cargando...' : 'Ver detalles →'}
                                                </Button>
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
