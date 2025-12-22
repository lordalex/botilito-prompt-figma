import React from 'react';
import { useNotifications } from '@/providers/NotificationProvider';
import { Bell, CheckCircle, AlertTriangle, Info, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export function NotificationCenter({ onViewTask }: { onViewTask: (jobId: string, type: string) => void }) {
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
        
        if (jobType !== 'unknown') {
            onViewTask(jobId, jobType);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
            case 'system': return <RefreshCw className="h-4 w-4 text-blue-500" />;
            default: return <Info className="h-4 w-4 text-gray-500" />;
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
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
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground text-xs">
                                    No hay notificaciones
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {notifications.map(n => (
                                        <div
                                            key={n.id}
                                            className={`p-3 text-sm hover:bg-gray-50 transition-colors ${!n.is_read ? 'bg-blue-50/50' : ''}`}
                                            onClick={() => !n.is_read && markAsRead(n.id)}
                                        >
                                            <div className="flex gap-3 items-start">
                                                <div className="mt-1">{getIcon(n.type)}</div>
                                                <div className="flex-1 space-y-1">
                                                    <p className={`font-medium leading-none ${!n.is_read ? 'text-black' : 'text-gray-600'}`}>
                                                        {n.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                                        {n.message}
                                                    </p>
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-[10px] text-gray-400">
                                                            {new Date(n.created_at).toLocaleString()}
                                                        </p>
                                                        {n.metadata?.actionable && n.metadata?.job_id && (
                                                            <Button variant="link" size="sm" className="h-6 text-xs" onClick={() => handleViewTask(n.metadata!.job_id, n.metadata)}>
                                                                Ver
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
            </PopoverContent>
        </Popover>
    );
}
