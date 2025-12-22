import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/providers/NotificationProvider';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { ScrollArea } from './ui/scroll-area';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Users, 
  Bot, 
  Brain,
  Shield,
  Clock,
  X,
  MoreHorizontal,
  FileText,
  FileImage,
  FileAudio
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Notification } from '@/types/notification';

// Helper to format time since notification
const timeSince = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 0) return "ahora";
    let interval = seconds / 31536000;
    if (interval > 1) return `hace ${Math.floor(interval)} años`;
    interval = seconds / 2592000;
    if (interval > 1) return `hace ${Math.floor(interval)} meses`;
    interval = seconds / 86400;
    if (interval > 1) return `hace ${Math.floor(interval)} días`;
    interval = seconds / 3600;
    if (interval > 1) return `hace ${Math.floor(interval)} h`;
    interval = seconds / 60;
    if (interval > 1) return `hace ${Math.floor(interval)} min`;
    return `hace ${Math.floor(seconds)} s`;
};

export function GlobalNotifications() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead
  } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    // If actionable, perform the action on main click as well
    if (notification.metadata?.actionable && notification.metadata?.job_id) {
        navigate(`/upload/${notification.metadata.job_id}`);
    }
  };

  const handleActionClick = (e: React.MouseEvent, notification: Notification) => {
    e.stopPropagation(); // Prevent parent onClick from firing
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    
    const jobId = notification.metadata?.job_id;
    if (jobId) {
      navigate(`/upload/${jobId}`);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      case 'system': return <Bot className="h-4 w-4 text-purple-500" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getSourceIcon = (metadata: any) => {
    switch (metadata?.source) {
      case 'dashboard': return <Shield className="h-3 w-3" />;
      case 'ai-analysis': return <FileText className="h-3 w-3" />;
      case 'audio-upload': return <FileAudio className="h-3 w-3" />;
      case 'upload': return <FileImage className="h-3 w-3" />;
      case 'system': return <Bot className="h-3 w-3" />;
      default: return <Bell className="h-3 w-3" />;
    }
  };

  const getSourceLabel = (metadata: any) => {
    switch (metadata?.source) {
      case 'dashboard': return 'Centro de Control';
      case 'ai-analysis': return 'Análisis de Texto';
      case 'audio-upload': return 'Análisis de Audio';
      case 'upload': return 'Análisis de Imagen';
      case 'system': return 'Sistema';
      default: return 'Botilito';
    }
  };

  const markAllAsRead = () => {
    markAsRead(undefined, true);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
          <Bell className="h-5 w-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1"
              >
                <Badge 
                  variant="destructive" 
                  className="h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Notificaciones</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} nuevas
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="h-6 px-2 text-xs"
                >
                  Marcar todas como leídas
                </Button>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-96">
          <div className="space-y-1 p-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">No tienes notificaciones</p>
                <p className="text-xs text-muted-foreground">Te notificaremos cuando haya novedades</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`relative p-3 rounded-lg border transition-all duration-200 hover:bg-muted/50 cursor-pointer ${
                    !notification.is_read 
                      ? 'bg-blue-50/50 border-blue-200 hover:bg-blue-50' 
                      : 'bg-background border-border'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.is_read ? 'font-medium' : 'font-normal'}`}>
                        {notification.title}
                      </p>
                      
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          {getSourceIcon(notification.metadata)}
                          <span>{getSourceLabel(notification.metadata)}</span>
                          <span className="mx-1">•</span>
                          <Clock className="h-3 w-3" />
                          <span>{timeSince(notification.created_at)}</span>
                        </div>
                        
                        {notification.metadata?.actionable && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={(e) => handleActionClick(e, notification)}
                          >
                            Ver detalles
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
