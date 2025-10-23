import React, { useState } from 'react';
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
  MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Notification {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success' | 'system';
  title: string;
  message: string;
  timestamp: string;
  source: 'dashboard' | 'ai-analysis' | 'verification' | 'upload' | 'system';
  read: boolean;
  actionable?: boolean;
}

export function GlobalNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'critical',
      title: 'Brote epidemiológico detectado',
      message: 'Incremento del 45% en casos de desinformación médica en Región Andina',
      timestamp: 'hace 12 min',
      source: 'dashboard',
      read: false,
      actionable: true
    },
    {
      id: '2',
      type: 'warning',
      title: 'Patrón anómalo en redes sociales',
      message: 'IA detectó campaña coordinada de desinformación en WhatsApp',
      timestamp: 'hace 25 min',
      source: 'ai-analysis',
      read: false,
      actionable: true
    },
    {
      id: '3',
      type: 'success',
      title: 'Verificación completada',
      message: 'Contenido analizado y marcado como veraz - ID: #VER-2024-1089',
      timestamp: 'hace 1h',
      source: 'verification',
      read: true,
      actionable: false
    },
    {
      id: '4',
      type: 'info',
      title: 'Nuevo contenido para analizar',
      message: 'Se ha subido un video para análisis de veracidad',
      timestamp: 'hace 2h',
      source: 'upload',
      read: true,
      actionable: true
    },
    {
      id: '5',
      type: 'system',
      title: 'Actualización del sistema',
      message: 'Nuevas funcionalidades de IA disponibles',
      timestamp: 'hace 3h',
      source: 'system',
      read: true,
      actionable: false
    },
    {
      id: '6',
      type: 'warning',
      title: 'Tasa de verificación baja',
      message: 'Solo 67% de contenidos verificados en las últimas 24h',
      timestamp: 'hace 4h',
      source: 'dashboard',
      read: true,
      actionable: true
    },
    {
      id: '7',
      type: 'info',
      title: 'Informe semanal disponible',
      message: 'Reporte de actividad epidemiológica listo para descarga',
      timestamp: 'hace 6h',
      source: 'dashboard',
      read: true,
      actionable: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      case 'system': return <Bot className="h-4 w-4 text-purple-500" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'dashboard': return <Shield className="h-3 w-3" />;
      case 'ai-analysis': return <Brain className="h-3 w-3" />;
      case 'verification': return <Users className="h-3 w-3" />;
      case 'upload': return <Bot className="h-3 w-3" />;
      case 'system': return <Bot className="h-3 w-3" />;
      default: return <Bell className="h-3 w-3" />;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'dashboard': return 'Centro de Control';
      case 'ai-analysis': return 'Análisis IA';
      case 'verification': return 'Verificación';
      case 'upload': return 'Subida de Contenido';
      case 'system': return 'Sistema';
      default: return 'Botilito';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
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
                  className="h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center animate-pulse"
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
            <div className="flex items-center space-x-1">
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={clearAllNotifications}>
                    <X className="mr-2 h-3 w-3" />
                    Limpiar todas
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
                    !notification.read 
                      ? 'bg-blue-50/50 border-blue-200 hover:bg-blue-50' 
                      : 'bg-background border-border'
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <p className={`text-sm ${!notification.read ? 'font-medium' : 'font-normal'}`}>
                          {notification.title}
                        </p>
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-100"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          {getSourceIcon(notification.source)}
                          <span>{getSourceLabel(notification.source)}</span>
                          <span>•</span>
                          <Clock className="h-3 w-3" />
                          <span>{notification.timestamp}</span>
                        </div>
                        
                        {notification.actionable && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Aquí puedes agregar lógica para acciones específicas
                            }}
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
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full text-sm text-muted-foreground hover:text-foreground"
                onClick={() => {
                  // Aquí puedes navegar a una página de notificaciones completa si la implementas
                }}
              >
                Ver todas las notificaciones
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}