import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { 
  Settings, Bell, Shield, Zap, Eye, Globe, 
  Database, ExternalLink, Save, RefreshCw
} from 'lucide-react';

export function ExtensionSettings() {
  const [settings, setSettings] = useState({
    autoAnalysis: true,
    showBadges: true,
    notifications: true,
    analyzeOnHover: false,
    highlightSuspicious: true,
    shareAnonymously: true,
    language: 'es'
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <Settings className="h-8 w-8 text-primary" />
          <h1 className="text-2xl">Configuración de Botilito</h1>
        </div>
        <p className="text-muted-foreground">
          Personaliza cómo la extensión detecta y te notifica sobre desinformación
        </p>
      </div>

      <div className="space-y-4">
        {/* Análisis Automático */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-primary" />
              <span>Análisis Automático</span>
            </CardTitle>
            <CardDescription>
              Configura cómo y cuándo Botilito analiza el contenido
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Analizar páginas automáticamente</Label>
                <p className="text-sm text-muted-foreground">
                  Botilito analizará las páginas que visites
                </p>
              </div>
              <Switch
                checked={settings.autoAnalysis}
                onCheckedChange={() => toggleSetting('autoAnalysis')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mostrar badges en páginas</Label>
                <p className="text-sm text-muted-foreground">
                  Muestra indicadores visuales en contenido analizado
                </p>
              </div>
              <Switch
                checked={settings.showBadges}
                onCheckedChange={() => toggleSetting('showBadges')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Analizar al pasar el cursor</Label>
                <p className="text-sm text-muted-foreground">
                  Análisis rápido al mantener el cursor sobre texto
                </p>
              </div>
              <Switch
                checked={settings.analyzeOnHover}
                onCheckedChange={() => toggleSetting('analyzeOnHover')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notificaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-primary" />
              <span>Notificaciones</span>
            </CardTitle>
            <CardDescription>
              Controla cómo te notificamos sobre contenido sospechoso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Activar notificaciones</Label>
                <p className="text-sm text-muted-foreground">
                  Recibe alertas sobre contenido no verificado
                </p>
              </div>
              <Switch
                checked={settings.notifications}
                onCheckedChange={() => toggleSetting('notifications')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Resaltar contenido sospechoso</Label>
                <p className="text-sm text-muted-foreground">
                  Destaca visualmente contenido con señales de alerta
                </p>
              </div>
              <Switch
                checked={settings.highlightSuspicious}
                onCheckedChange={() => toggleSetting('highlightSuspicious')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacidad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <span>Privacidad y Datos</span>
            </CardTitle>
            <CardDescription>
              Gestiona cómo compartimos tus datos para mejorar el servicio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Compartir análisis anónimamente</Label>
                <p className="text-sm text-muted-foreground">
                  Ayuda a mejorar Botilito compartiendo datos anónimos
                </p>
              </div>
              <Switch
                checked={settings.shareAnonymously}
                onCheckedChange={() => toggleSetting('shareAnonymously')}
              />
            </div>

            <div className="p-3 bg-secondary/20 rounded-lg border border-secondary/40">
              <div className="flex items-start space-x-2">
                <Eye className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p className="text-sm">
                    Nunca compartimos información personal. Solo enviamos patrones 
                    de desinformación para mejorar la detección global.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-primary" />
              <span>Estadísticas de Uso</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl">2,847</p>
                <p className="text-xs text-muted-foreground">Páginas analizadas</p>
              </div>
              <div>
                <p className="text-2xl">142</p>
                <p className="text-xs text-muted-foreground">Alertas emitidas</p>
              </div>
              <div>
                <p className="text-2xl">95%</p>
                <p className="text-xs text-muted-foreground">Precisión</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acciones */}
        <div className="flex space-x-3">
          <Button className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Restablecer
          </Button>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t text-center space-y-2">
          <Button 
            variant="ghost" 
            className="text-sm"
            onClick={() => window.open('https://botilito.app', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir aplicación web completa
          </Button>
          <div className="flex items-center justify-center space-x-2">
            <Badge variant="secondary">Versión 1.0.0</Badge>
            <span className="text-xs text-muted-foreground">•</span>
            <p className="text-xs text-muted-foreground">Digital-IA © 2024</p>
          </div>
        </div>
      </div>
    </div>
  );
}
