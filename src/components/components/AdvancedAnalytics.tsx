import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Activity, Zap, Shield, Clock
} from 'lucide-react';

export function AdvancedAnalytics() {
  // Datos para la curva epidemiológica
  const epidemiologicalCurve = [
    { fecha: '18 Oct', casosNuevos: 45, casosNeutralizados: 32, tasaR0: 1.2 },
    { fecha: '19 Oct', casosNuevos: 67, casosNeutralizados: 41, tasaR0: 1.4 },
    { fecha: '20 Oct', casosNuevos: 89, casosNeutralizados: 56, tasaR0: 1.6 },
    { fecha: '21 Oct', casosNuevos: 134, casosNeutralizados: 78, tasaR0: 1.8 },
    { fecha: '22 Oct', casosNuevos: 198, casosNeutralizados: 112, tasaR0: 2.1 },
    { fecha: '23 Oct', casosNuevos: 267, casosNeutralizados: 145, tasaR0: 2.3 },
    { fecha: '24 Oct', casosNuevos: 342, casosNeutralizados: 189, tasaR0: 2.5 },
    { fecha: '25 Oct', casosNuevos: 298, casosNeutralizados: 234, tasaR0: 2.2 },
    { fecha: '26 Oct', casosNuevos: 234, casosNeutralizados: 267, tasaR0: 1.9 },
    { fecha: '27 Oct', casosNuevos: 189, casosNeutralizados: 198, tasaR0: 1.7 },
  ];

  // Datos de infectividad por hora
  const infectivityData = [
    { time: '00:00', casos: 120, nuevos: 23, resueltos: 15 },
    { time: '04:00', casos: 145, nuevos: 31, resueltos: 18 },
    { time: '08:00', casos: 189, nuevos: 67, resueltos: 24 },
    { time: '12:00', casos: 234, nuevos: 89, resueltos: 35 },
    { time: '16:00', casos: 298, nuevos: 112, resueltos: 48 },
    { time: '20:00', casos: 267, nuevos: 78, resueltos: 109 },
    { time: '24:00', casos: 189, nuevos: 45, resueltos: 123 },
  ];

  // Datos de vectores de transmisión
  const transmissionVectors = [
    { platform: 'WhatsApp', cases: 856, percentage: 28, color: '#25D366' },
    { platform: 'Facebook', cases: 723, percentage: 24, color: '#1877F2' },
    { platform: 'Twitter/X', cases: 534, percentage: 18, color: '#000000' },
    { platform: 'Telegram', cases: 298, percentage: 10, color: '#0088CC' },
    { platform: 'TikTok', cases: 267, percentage: 9, color: '#FF0050' },
    { platform: 'Web', cases: 334, percentage: 11, color: '#4285F4' },
  ];

  return (
    <div className="grid gap-6">
      {/* Curva Epidemiológica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary" />
            <span>Curva Epidemiológica de Desinformación</span>
          </CardTitle>
          <CardDescription>
            Evolución temporal de casos nuevos, neutralizados y tasa R₀
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={epidemiologicalCurve}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="fecha" 
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                
                <Line 
                  type="monotone" 
                  dataKey="casosNuevos" 
                  stroke="#FF4444" 
                  strokeWidth={3}
                  dot={{ fill: '#FF4444', strokeWidth: 2, r: 5 }}
                  name="Casos Nuevos"
                />
                
                <Line 
                  type="monotone" 
                  dataKey="casosNeutralizados" 
                  stroke="#00E676" 
                  strokeWidth={3}
                  dot={{ fill: '#00E676', strokeWidth: 2, r: 4 }}
                  name="Casos Neutralizados"
                />
                
                <Line 
                  type="monotone" 
                  dataKey="tasaR0" 
                  stroke="#FFD60A" 
                  strokeWidth={2}
                  dot={{ fill: '#FFD60A', strokeWidth: 2, r: 4 }}
                  name="Tasa R₀"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Métricas epidemiológicas */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium text-red-700">Velocidad de Contagio</span>
              </div>
              <div className="text-2xl font-semibold text-red-800 mt-2">1.7x</div>
              <div className="text-xs text-red-600">casos/hora</div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-700">Tasa de Inmunización</span>
              </div>
              <div className="text-2xl font-semibold text-green-800 mt-2">73%</div>
              <div className="text-xs text-green-600">verificaciones exitosas</div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-700">Período Incubación</span>
              </div>
              <div className="text-2xl font-semibold text-yellow-800 mt-2">2.3h</div>
              <div className="text-xs text-yellow-600">tiempo de propagación</div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-700">Índice Epidémico</span>
              </div>
              <div className="text-2xl font-semibold text-blue-800 mt-2">Alto</div>
              <div className="text-xs text-blue-600">fase exponencial</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos adicionales */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Infectividad por hora */}
        <Card>
          <CardHeader>
            <CardTitle>Infectividad por Hora</CardTitle>
            <CardDescription>
              Casos nuevos vs casos resueltos por hora del día
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={infectivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="nuevos" 
                    stackId="1" 
                    stroke="#FF4444" 
                    fill="#FF4444" 
                    fillOpacity={0.6}
                    name="Casos Nuevos"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="resueltos" 
                    stackId="2" 
                    stroke="#00E676" 
                    fill="#00E676" 
                    fillOpacity={0.6}
                    name="Casos Resueltos"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Vectores de transmisión */}
        <Card>
          <CardHeader>
            <CardTitle>Vectores de Transmisión</CardTitle>
            <CardDescription>
              Plataformas con mayor propagación de desinformación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transmissionVectors.map((vector, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: vector.color }}
                    ></div>
                    <span className="text-sm font-medium">{vector.platform}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-sm font-semibold">{vector.cases.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">{vector.percentage}%</div>
                    </div>
                    <div className="w-20">
                      <div className="bg-muted rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${vector.percentage * 4}%`,
                            backgroundColor: vector.color 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}