import React from 'react';
import { useNotifications } from '@/providers/NotificationProvider';
import { Bell, CheckCircle, AlertTriangle, Info, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export function NotificationCenter({ onViewTask, onViewAllNotifications }: {
    onViewTask: (jobId: string, type: string, status?: string) => void;
    onViewAllNotifications?: () => void;
}) {
    const {
        notifications,
        unreadCount,
        activeTasks,
        markAsRead,
        loadingDetails,
    } = useNotifications();

    const handleViewTask = (jobId: string, metadata: any) => {
        // Map the metadata source to the job type expected by the App component
        const jobType = metadata?.source === 'upload' ? 'image_analysis' :
            metadata?.source === 'audio-upload' ? 'audio_analysis' :
                metadata?.source === 'ai-analysis' ? 'text_analysis' : 'unknown';

        const status = metadata?.final_status || 'unknown';

        if (jobType !== 'unknown') {
            onViewTask(jobId, jobType, status);
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
        return notifications.filter(n => {
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

                <Tabs defaultValue="inbox" className="w-full">
                    <TabsList className="w-full justify-start rounded-none h-auto p-0 border-b">
                        <TabsTrigger value="inbox" className="flex-1 py-2 text-xs rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                            Bandeja
                        </TabsTrigger>
                        <TabsTrigger value="tasks" className="flex-1 py-2 text-xs rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                            Tareas Activas {activeTasks.length > 0 && `(${activeTasks.length})`}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="inbox" className="m-0">
                        <ScrollArea className="h-[300px]">
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
                                                className="p-3 text-sm hover:bg-gray-50 transition-colors bg-blue-50/50"
                                                onClick={() => markAsRead(n.id)}
                                            >
                                                <div className="flex gap-3 items-start">
                                                    <div className="mt-1">{getIcon(n.type)}</div>
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex items-start justify-between">
                                                            <p className="font-medium leading-none text-black pr-2 mt-0.5">
                                                                {n.title}
                                                            </p>
                                                            <p className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">
                                                                {new Date(n.created_at).toLocaleString()}
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
                                                                    className="h-6 text-xs px-0"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleViewTask(n.metadata!.job_id, n.metadata);
                                                                        markAsRead(n.id);
                                                                    }}
                                                                >
                                                                    Ver detalles &rarr;
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

                    </TabsContent>

                    <TabsContent value="tasks" className="m-0">
                        <ScrollArea className="h-[300px]">
                            {activeTasks.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground text-xs">
                                    No hay tareas activas
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {activeTasks.map(task => (
                                        <div
                                            key={task.job_id}
                                            className="p-3 text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                                            onClick={() => onViewTask(task.job_id, task.type)}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-semibold text-xs uppercase tracking-wider text-gray-500">
                                                    {task.type.replace('_', ' ')}
                                                </span>
                                                <Badge variant={
                                                    task.status === 'completed' ? 'secondary' :
                                                        task.status === 'failed' ? 'destructive' : 'outline'
                                                } className="text-[10px] h-5 px-1.5">
                                                    {task.status === 'running' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                                                    {task.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-muted-foreground font-mono truncate max-w-[150px]">
                                                    ID: {task.job_id.slice(0, 8)}...
                                                </span>
                                                <Button variant="link" size="sm" className="h-6 text-xs">
                                                    Ver Progreso
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </TabsContent>
                </Tabs>

                {onViewAllNotifications && (
                    <div className="p-2 border-t bg-gray-50 flex justify-center">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs text-muted-foreground h-8"
                            onClick={() => {
                                onViewAllNotifications();
                                // We might want to close the popover here, but PopoverPrimitive doesn't expose easy close control without controlled state.
                                // Users usually click outside to close, or navigating might unmount/remount things in a way that closes it (not guaranteed with Popover).
                                // For now, just firing the action is enough.
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
