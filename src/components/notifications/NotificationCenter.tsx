import React, { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { api } from '@/services/api';
import { useNotifications } from '@/providers/NotificationProvider';
import { Bell, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * NotificationCenter Component (v2.0.0 - Active Sync)
 * 
 * Updated for Active Sync on Fetch architecture:
 * - Removed "Tareas Activas" tab (no longer needed - server handles job tracking)
 * - Updated click handlers to use new metadata schema (status, doc_id, error)
 * - Simplified to single inbox view showing all notifications
 */
export function NotificationCenter({ onViewTask, onViewAllNotifications }: {
    onViewTask: (jobId: string, type: string, status?: string) => void;
    onViewAllNotifications?: () => void;
}) {
    const { session } = useAuth();
    const [isLoadingDetails, setIsLoadingDetails] = useState<string | null>(null);
    const {
        notifications,
        unreadCount,
        markAsRead,
    } = useNotifications();

    /**
     * Handle notification click with robust status checking (v2.0.1)
     */
    const handleViewTask = async (metadata: any, notificationId: string) => {
        if (!metadata?.job_id) return;

        // PRIORITY 1: Always check fresh status via status_url if available
        if (metadata.status_url && session) {
            try {
                setIsLoadingDetails(notificationId);
                const freshStatus = await api.generic.get(session, metadata.status_url);

                if (freshStatus.status === 'completed') {
                    // Edge case: Job completed but returned an error result (e.g. "Not found")
                    if (freshStatus.result?.error) {
                        console.error("Job completed with internal error:", freshStatus.result.error);
                        onViewTask(metadata.job_id, 'error', 'failed');
                        return;
                    }

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
            } finally {
                setIsLoadingDetails(null);
            }
        }

        // PRIORITY 2: Fallback to existing metadata
        if (metadata.status === 'completed' && metadata.doc_id) {
            onViewTask(metadata.doc_id, 'analysis', 'completed');
            return;
        }

        if (metadata.status === 'failed' && metadata.error) {
            onViewTask(metadata.job_id, 'error', 'failed');
            return;
        }

        // Fallback
        const jobId = metadata.job_id;
        if (metadata.status === 'processing') {
            onViewTask(jobId, 'status', 'processing');
        } else {
            onViewTask(jobId, 'analysis', metadata.status || 'unknown');
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
            default: return <Info className="h-4 w-4 text-gray-500" />;
        }
    };

    const uniqueNotifications = React.useMemo(() => {
        const seenJobs = new Set<string>();
        return (notifications || []).filter(n => {
            const jobId = n.metadata?.job_id;
            if (jobId) {
                if (seenJobs.has(jobId)) return false;
                seenJobs.add(jobId);
            }
            return true;
        });
    }, [notifications]);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-12 w-12 rounded-full p-0 bg-white hover:bg-primary transition-colors"
                >
                    <Bell className="h-5 w-5 text-gray-800" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="p-3 border-b flex justify-between items-center bg-gray-50">
                    <h4 className="font-semibold text-sm">Notificaciones</h4>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => markAsRead(undefined, true)}>
                            Marcar todo leído
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[400px]">
                    {uniqueNotifications.filter(n => !n.is_read).length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-xs">
                            No hay notificaciones nuevas
                        </div>
                    ) : (
                        <div className="divide-y">
                            {uniqueNotifications
                                .filter(n => !n.is_read)
                                .map(n => (
                                    <div
                                        key={n.id}
                                        className={`p-3 text-sm hover:bg-gray-50 transition-all border-b last:border-0 cursor-pointer ${!n.is_read
                                            ? 'bg-white border-l-4 border-l-[#FFD700] pl-2'
                                            : 'bg-white pl-3'
                                            }`}
                                        onClick={() => markAsRead(n.id)}
                                    >
                                        <div className="flex gap-3 items-start">
                                            <div className="mt-1">{getIcon(n.type)}</div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex flex-col mb-1">
                                                    <p className={`font-medium leading-tight pr-2 ${!n.is_read ? 'text-black' : 'text-gray-600'}`}>
                                                        {n.title}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground mt-1">
                                                        {new Date(n.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <p className="text-xs text-muted-foreground line-clamp-2">
                                                    {n.message}
                                                </p>
                                                <div className="flex justify-start items-center">
                                                    {n.metadata?.job_id && (
                                                        <Button
                                                            variant="link"
                                                            size="sm"
                                                            className="h-6 text-xs px-0 text-[#FFD700] hover:text-[#e6c200] font-medium"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleViewTask(n.metadata, n.id);
                                                                markAsRead(n.id);
                                                            }}
                                                            disabled={isLoadingDetails === n.id}
                                                        >
                                                            {isLoadingDetails === n.id ? 'Cargando...' : 'Ver detalles →'}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </ScrollArea>

                {onViewAllNotifications && (
                    <div className="p-2 border-t bg-gray-50 flex justify-center">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs text-muted-foreground h-8"
                            onClick={() => {
                                onViewAllNotifications();
                            }}
                        >
                            Ver todas las notificaciones
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover >
    );
}
