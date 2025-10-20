import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { X, Bell, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface Notification {
  id: string;
  type: 'alert' | 'success' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
  region?: string;
}

export function FloatingNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  // Simular notificaciones en tiempo real
  useEffect(() => {
    const mockNotifications = [
      {
        id: '1',
        type: 'alert' as const,
        title: 'Brote detectado',
        message: 'Incremento súbito de casos en Región Andina (+45% en 1h)',
        timestamp: new Date(),
        region: 'Andina'
      },
      {
        id: '2',
        type: 'warning' as const,
        title: 'Patrón anómalo',
        message: 'Campaña coordinada detectada en WhatsApp',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        region: 'Caribe'
      },
      {
        id: '3',
        type: 'success' as const,
        title: 'Neutralización exitosa',
        message: '156 casos verificados como falsos en última hora',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        region: 'Nacional'
      }
    ];

    setNotifications(mockNotifications);

    // Simular nuevas notificaciones cada 30 segundos
    const interval = setInterval(() => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: Math.random() > 0.5 ? 'info' : 'warning',
        title: 'Nueva actividad detectada',
        message: `${Math.floor(Math.random() * 50 + 10)} casos nuevos registrados`,
        timestamp: new Date(),
        region: ['Andina', 'Caribe', 'Pacífico'][Math.floor(Math.random() * 3)]
      };

      setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'alert': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-orange-50 border-orange-200';
      case 'success': return 'bg-green-50 border-green-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
    
    if (diff < 60) return 'ahora';
    if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
    return `hace ${Math.floor(diff / 86400)}d`;
  };

  if (!isVisible || notifications.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-24 right-6 z-40"
      >
        <Button
          onClick={() => setIsVisible(true)}
          className="bg-primary hover:bg-primary/90 shadow-lg rounded-full p-3"
        >
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[20px] h-5 rounded-full flex items-center justify-center">
              {notifications.length}
            </Badge>
          )}
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="fixed top-24 right-6 w-80 z-40">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-3"
      >
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-sm rounded-lg border shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-primary" />
              <span className="font-medium">Alertas en Tiempo Real</span>
              <Badge variant="destructive" className="animate-pulse">
                {notifications.length}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Notifications */}
        <AnimatePresence>
          {notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              transition={{ delay: index * 0.1 }}
              className={`${getBgColor(notification.type)} border rounded-lg p-4 shadow-lg backdrop-blur-sm`}
            >
              <div className="flex items-start space-x-3">
                <div className="mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium truncate">{notification.title}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeNotification(notification.id)}
                      className="h-5 w-5 p-0 opacity-50 hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {notification.message}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    {notification.region && (
                      <Badge variant="outline" className="text-xs">
                        {notification.region}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(notification.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Actions */}
        {notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/95 backdrop-blur-sm rounded-lg border shadow-lg p-3"
          >
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setNotifications([])}
                className="flex-1 text-xs"
              >
                Marcar como leídas
              </Button>
              <Button
                size="sm"
                className="flex-1 text-xs"
              >
                Ver todas
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}