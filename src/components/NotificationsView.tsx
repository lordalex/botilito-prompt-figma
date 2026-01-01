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

export function NotificationsView({ onViewTask }: NotificationsViewProps) {
    const { notifications, unreadCount, markAsRead } = useNotifications();
    const [filter, setFilter] = useState<'all' | 'unread' | 'info' | 'success' | 'warning' | 'error'>('all');

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

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.is_read) {
            markAsRead(notification.id);
        }

        if (notification.metadata?.actionable && notification.metadata?.job_id) {
            // Map the metadata source to the job type expected by the App component
            const jobType = notification.metadata?.source === 'upload' ? 'image_analysis' :
                notification.metadata?.source === 'audio-upload' ? 'audio_analysis' :
                    notification.metadata?.source === 'ai-analysis' ? 'text_analysis' : 'unknown';

            const status = notification.metadata?.final_status || 'unknown';

            if (jobType !== 'unknown') {
                onViewTask(notification.metadata.job_id, jobType, status);
            }
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
                                className="justify-start"
                                onClick={() => setFilter('all')}
                            >
                                Todas
                                <Badge variant="secondary" className="ml-auto text-xs">{notifications.length}</Badge>
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
                                            className={`flex items-start p-4 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50 ${!notification.is_read ? 'bg-blue-50/50 border-blue-200' : 'bg-card'
                                                }`}
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <div className="mr-4 mt-1">
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    {/* Changed to flex-col on mobile? No, the screenshot shows desktop width but constrained column. */}
                                                    {/* Actually, let's keep it row but handle overflow better. */}
                                                    <p className={`text-sm font-medium leading-none ${!notification.is_read ? 'text-black' : ''} pr-4`}>
                                                        {notification.title}
                                                    </p>
                                                    <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                                                        {new Date(notification.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {notification.message}
                                                </p>
                                                {notification.metadata?.actionable && (
                                                    <Button
                                                        variant="link"
                                                        className="px-0 h-auto text-xs mt-2"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleNotificationClick(notification);
                                                        }}
                                                    >
                                                        Ver detalles &rarr;
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
