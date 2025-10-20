import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { motion } from 'motion/react';
import { 
  Activity, TrendingUp, TrendingDown, Zap, Shield, 
  Clock, Target, Thermometer, Radio, Wifi
} from 'lucide-react';

export function RealTimeStats() {
  const [systemHealth, setSystemHealth] = useState(98);
  const [activeConnections, setActiveConnections] = useState(1247);
  const [processingSpeed, setProcessingSpeed] = useState(87);

  // Actualización en tiempo real de métricas
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemHealth(prev => Math.min(100, Math.max(85, prev + (Math.random() - 0.5) * 2)));
      setActiveConnections(prev => prev + Math.floor(Math.random() * 10 - 5));
      setProcessingSpeed(prev => Math.min(100, Math.max(70, prev + (Math.random() - 0.5) * 5)));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getHealthColor = (value: number) => {
    if (value >= 95) return 'text-green-600';
    if (value >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBadge = (value: number) => {
    if (value >= 95) return <Badge className="bg-green-100 text-green-800">Excelente</Badge>;
    if (value >= 85) return <Badge className="bg-yellow-100 text-yellow-800">Bueno</Badge>;
    return <Badge className="bg-red-100 text-red-800">Alerta</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Estado del Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary" />
            <span>Estado del Sistema</span>
          </CardTitle>
          <CardDescription>
            Monitoreo en tiempo real del rendimiento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Salud del Sistema */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Salud del Sistema</span>
              {getHealthBadge(systemHealth)}
            </div>
            <div className="flex items-center space-x-2">
              <motion.div
                key={systemHealth}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className={`text-2xl font-semibold ${getHealthColor(systemHealth)}`}
              >
                {Math.round(systemHealth)}%
              </motion.div>
              <Progress value={systemHealth} className="flex-1" />
            </div>
          </div>

          {/* Conexiones Activas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Conexiones Activas</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600">Online</span>
              </div>
            </div>
            <motion.div
              key={activeConnections}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-2xl font-semibold text-blue-600"
            >
              {activeConnections.toLocaleString()}
            </motion.div>
          </div>

          {/* Velocidad de Procesamiento */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Velocidad de Procesamiento</span>
              <Badge variant="outline" className="text-xs">
                {processingSpeed >= 90 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {processingSpeed >= 90 ? 'Alta' : processingSpeed >= 75 ? 'Media' : 'Baja'}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <motion.div
                key={processingSpeed}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-2xl font-semibold text-orange-600"
              >
                {Math.round(processingSpeed)}%
              </motion.div>
              <Progress value={processingSpeed} className="flex-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Epidemiológicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Thermometer className="h-5 w-5 text-primary" />
            <span>Métricas Epidemiológicas</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-50 rounded-lg p-3">
              <div className="flex items-center space-x-1 mb-1">
                <Zap className="h-3 w-3 text-red-500" />
                <span className="text-xs font-medium text-red-700">R₀ Actual</span>
              </div>
              <div className="text-lg font-semibold text-red-800">2.3</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-3">
              <div className="flex items-center space-x-1 mb-1">
                <Shield className="h-3 w-3 text-green-500" />
                <span className="text-xs font-medium text-green-700">Inmunidad</span>
              </div>
              <div className="text-lg font-semibold text-green-800">67%</div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center space-x-1 mb-1">
                <Clock className="h-3 w-3 text-blue-500" />
                <span className="text-xs font-medium text-blue-700">T. Detección</span>
              </div>
              <div className="text-lg font-semibold text-blue-800">4.2h</div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="flex items-center space-x-1 mb-1">
                <Target className="h-3 w-3 text-yellow-500" />
                <span className="text-xs font-medium text-yellow-700">Precisión</span>
              </div>
              <div className="text-lg font-semibold text-yellow-800">94.8%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actividad de Red */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Radio className="h-5 w-5 text-primary" />
            <span>Actividad de Red</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">APIs Activas</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">8/8</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Latencia Promedio</span>
            <span className="text-sm font-medium">127ms</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Última Sincronización</span>
            <span className="text-sm text-muted-foreground">hace 45s</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Próxima Actualización</span>
            <span className="text-sm text-muted-foreground">en 1m 15s</span>
          </div>

          {/* Indicador de transmisión */}
          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Wifi className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-medium">Transmisión en Vivo</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Recibiendo datos epidemiológicos en tiempo real de 6 regiones
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}