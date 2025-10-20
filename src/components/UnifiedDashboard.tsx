import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import { 
  Activity, TrendingUp, TrendingDown, AlertTriangle, Shield, 
  Zap, Clock, MapPin, Users, Globe, Bug, Stethoscope, 
  Target, Thermometer, ShieldCheck, AlertOctagon, Eye, Microscope,
  FileText, Image, Video, Volume2, CheckCircle, BarChart3
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { WhatsAppIcon, FacebookIcon, TwitterIcon, TelegramIcon, TikTokIcon, WebIcon } from './PlatformIcons';

export function UnifiedDashboard() {
  const [timeRange, setTimeRange] = useState('24h');
  const [region, setRegion] = useState('colombia');

  // Datos del Dashboard original
  const dashboardStats = [
    { title: 'Total Contenidos', value: '1,247', icon: FileText, change: '+12%' },
    { title: 'Analizados por IA', value: '1,089', icon: CheckCircle, change: '+8%' },
    { title: 'Verificados Humanos', value: '456', icon: Users, change: '+15%' },
    { title: 'En Proceso', value: '158', icon: Clock, change: '-3%' },
  ];

  // Datos epidemiológicos del Mapa Desinfodémico
  const epidemicStats = [
    { title: 'Casos Activos', value: '2,847', icon: Bug, change: '+15%', color: 'text-red-600', bgColor: 'bg-red-50' },
    { title: 'Tasa de Infección', value: '3.2/h', icon: Activity, change: '+8%', color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { title: 'Inmunidad Digital', value: '67%', icon: Shield, change: '+2%', color: 'text-green-600', bgColor: 'bg-green-50' },
    { title: 'Tiempo Promedio Detección', value: '4.2h', icon: Clock, change: '-12%', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  ];

  const verificationData = [
    { month: 'Ene', contenidos: 85, verificados: 72 },
    { month: 'Feb', contenidos: 120, verificados: 98 },
    { month: 'Mar', contenidos: 150, verificados: 145 },
    { month: 'Abr', contenidos: 180, verificados: 165 },
    { month: 'May', contenidos: 210, verificados: 189 },
    { month: 'Jun', contenidos: 185, verificados: 176 },
  ];

  const infectivityData = [
    { time: '00:00', casos: 120, nuevos: 23, resueltos: 15 },
    { time: '04:00', casos: 145, nuevos: 31, resueltos: 18 },
    { time: '08:00', casos: 189, nuevos: 67, resueltos: 24 },
    { time: '12:00', casos: 234, nuevos: 89, resueltos: 35 },
    { time: '16:00', casos: 298, nuevos: 112, resueltos: 48 },
    { time: '20:00', casos: 267, nuevos: 78, resueltos: 109 },
    { time: '24:00', casos: 189, nuevos: 45, resueltos: 123 },
  ];

  const pieData = [
    { name: 'Veraz', value: 65, color: '#00E676' },
    { name: 'Desinformación', value: 20, color: '#F72585' },
    { name: 'Satírico', value: 10, color: '#FF6B35' },
    { name: 'Fuera de Contexto', value: 5, color: '#7209B7' },
  ];

  const contentTypes = [
    { name: 'Texto', value: 45, icon: FileText },
    { name: 'Imagen', value: 30, icon: Image },
    { name: 'Video', value: 20, icon: Video },
    { name: 'Audio', value: 5, icon: Volume2 },
  ];

  const transmissionVectors = [
    { platform: 'WhatsApp', cases: 856, percentage: 28, color: '#25D366' },
    { platform: 'Facebook', cases: 723, percentage: 24, color: '#1877F2' },
    { platform: 'Twitter/X', cases: 534, percentage: 18, color: '#000000' },
    { platform: 'Telegram', cases: 298, percentage: 10, color: '#0088CC' },
    { platform: 'TikTok', cases: 267, percentage: 9, color: '#FF0050' },
    { platform: 'Web', cases: 334, percentage: 11, color: '#4285F4' },
  ];

  const geographicSpread = [
    { region: 'Región Andina', casos: 1456, tasa: 5.2, estado: 'Brote Activo' },
    { region: 'Región Caribe', casos: 934, tasa: 4.1, estado: 'En Aumento' },
    { region: 'Región Pacífico', casos: 687, tasa: 3.8, estado: 'Controlado' },
    { region: 'Región Orinoquía', casos: 234, tasa: 2.3, estado: 'Estable' },
    { region: 'Región Amazonia', casos: 156, tasa: 1.9, estado: 'Bajo Control' },
    { region: 'Región Insular', casos: 43, tasa: 0.8, estado: 'Bajo Control' },
  ];

  const getRegionStatus = (estado: string) => {
    switch (estado) {
      case 'Brote Crítico':
        return <Badge className="bg-red-100 text-red-800 border-red-300">🔴 {estado}</Badge>;
      case 'Brote Activo':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-300">🟡 {estado}</Badge>;
      case 'En Aumento':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">📈 {estado}</Badge>;
      case 'Controlado':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">🔵 {estado}</Badge>;
      case 'Estable':
        return <Badge className="bg-green-100 text-green-800 border-green-300">🟢 {estado}</Badge>;
      case 'Bajo Control':
        return <Badge className="bg-green-100 text-green-800 border-green-300">✅ {estado}</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'WhatsApp': return WhatsAppIcon;
      case 'Facebook': return FacebookIcon;
      case 'Twitter/X': return TwitterIcon;
      case 'Telegram': return TelegramIcon;
      case 'TikTok': return TikTokIcon;
      case 'Web': return WebIcon;
      default: return Globe;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center space-x-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            <span>Dashboard & Mapa Desinfodémico</span>
          </h1>
          <p className="text-muted-foreground">
            Análisis integral de verificación y monitoreo epidemiológico de desinformación
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Última hora</SelectItem>
              <SelectItem value="24h">24 horas</SelectItem>
              <SelectItem value="7d">7 días</SelectItem>
              <SelectItem value="30d">30 días</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="colombia">Colombia</SelectItem>
              <SelectItem value="andina">Región Andina</SelectItem>
              <SelectItem value="caribe">Región Caribe</SelectItem>
              <SelectItem value="pacifico">Región Pacífico</SelectItem>
              <SelectItem value="orinoquia">Región Orinoquía</SelectItem>
              <SelectItem value="amazonia">Región Amazonia</SelectItem>
              <SelectItem value="insular">Región Insular</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Alert de Brote */}
      <Alert className="border-red-200 bg-red-50">
        <AlertOctagon className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>⚠️ Alerta Epidemiológica:</strong> Se detectó un brote de desinformación sobre tratamientos médicos. 
          Tasa de contagio: +45% en las últimas 6 horas. <Button variant="outline" size="sm" className="ml-2">Ver Detalles</Button>
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/20 p-1 rounded-lg">
          <TabsTrigger 
            value="dashboard" 
            className="border border-gray-300 data-[state=active]:bg-secondary data-[state=active]:text-black data-[state=active]:shadow-sm transition-all duration-200 rounded-md font-medium"
          >
            Dashboard de Verificación
          </TabsTrigger>
          <TabsTrigger 
            value="epidemic" 
            className="border border-gray-300 data-[state=active]:bg-secondary data-[state=active]:text-black data-[state=active]:shadow-sm transition-all duration-200 rounded-md font-medium"
          >
            Análisis Epidemiológico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Statistics Cards - Dashboard */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {dashboardStats.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">{stat.title}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className={`${stat.change.includes('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                    {' '}desde el mes pasado
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Content Analysis Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Análisis por Mes</CardTitle>
                <CardDescription>
                  Contenidos analizados vs verificados por humanos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={verificationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Bar dataKey="contenidos" fill="var(--color-primary)" name="Analizados" />
                    <Bar dataKey="verificados" fill="var(--color-chart-2)" name="Verificados" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Verification Results */}
            <Card>
              <CardHeader>
                <CardTitle>Resultados de Verificación</CardTitle>
                <CardDescription>
                  Distribución de etiquetas asignadas por la IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}: {item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Types Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Tipos de Contenido</CardTitle>
              <CardDescription>Distribución por tipo de media analizada</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentTypes.map((type) => (
                  <div key={type.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <type.icon className="h-5 w-5 text-muted-foreground" />
                      <span>{type.name}</span>
                    </div>
                    <div className="flex items-center space-x-3 min-w-0 flex-1 ml-[35px]">
                      <Progress value={type.value} className="flex-1" />
                      <span className="text-sm text-muted-foreground">{type.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>Últimas verificaciones y análisis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: 'Imagen', status: 'Veraz', user: 'Ana García', time: 'Hace 5 min' },
                  { type: 'Video', status: 'Desinformación', user: 'Carlos López', time: 'Hace 12 min' },
                  { type: 'Texto', status: 'Satírico', user: 'María Torres', time: 'Hace 23 min' },
                  { type: 'Audio', status: 'Fuera de Contexto', user: 'Luis Martín', time: 'Hace 1h' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">{activity.type}</Badge>
                      <Badge 
                        variant={
                          activity.status === 'Veraz' ? 'default' :
                          activity.status === 'Desinformación' ? 'destructive' :
                          'secondary'
                        }
                      >
                        {activity.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Verificado por {activity.user} • {activity.time}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="epidemic" className="space-y-6">
          {/* Métricas Epidemiológicas Principales */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {epidemicStats.map((stat) => (
              <Card key={stat.title}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className={`text-xs ${stat.change.includes('+') ? 'text-red-600' : 'text-green-600'}`}>
                        {stat.change} vs período anterior
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Curva de Infectividad */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <span>Curva de Infectividad</span>
                </CardTitle>
                <CardDescription>
                  Propagación de desinformación en tiempo real
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={infectivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="casos" 
                      stackId="1" 
                      stroke="#F72585" 
                      fill="#F7258540" 
                      name="Casos Activos"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="nuevos" 
                      stackId="2" 
                      stroke="#FF6B35" 
                      fill="#FF6B3540" 
                      name="Nuevos Casos"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="resueltos" 
                      stackId="3" 
                      stroke="#00E676" 
                      fill="#00E67640" 
                      name="Casos Resueltos"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Vectores de Transmisión */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <span>Vectores de Transmisión</span>
                </CardTitle>
                <CardDescription>
                  Plataformas de mayor propagación
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transmissionVectors.map((platform) => {
                    const PlatformIcon = getPlatformIcon(platform.platform);
                    return (
                      <div key={platform.platform} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: `${platform.color}15` }}
                            >
                              <PlatformIcon 
                                className="w-5 h-5" 
                                style={{ color: platform.color }}
                              />
                            </div>
                            <span className="font-medium">{platform.platform}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{platform.cases} casos</div>
                            <div className="text-sm text-muted-foreground">{platform.percentage}%</div>
                          </div>
                        </div>
                        <Progress value={platform.percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Propagación Geográfica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span>Propagación Geográfica</span>
              </CardTitle>
              <CardDescription>
                Estado epidemiológico por región
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {geographicSpread.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                    <div>
                      <div className="font-medium">{item.region}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.casos.toLocaleString()} casos • Tasa: {item.tasa}/hora
                      </div>
                    </div>
                    <div className="text-right">
                      {getRegionStatus(item.estado)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Panel de Control Epidemiológico */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Thermometer className="h-5 w-5 text-primary" />
                  <span>Temperatura Desinfodémica</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-600 mb-2">🌡️ 7.8°C</div>
                  <div className="text-sm text-muted-foreground">Estado: Fiebre Alta</div>
                  <Progress value={78} className="mt-3" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <span>Efectividad de Vacunas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Verificación de Fuentes:</span>
                    <span className="font-bold text-green-600">89%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Educación Digital:</span>
                    <span className="font-bold text-green-600">76%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Fact-Checking:</span>
                    <span className="font-bold text-green-600">84%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-primary" />
                  <span>Vigilancia Epidemiológica</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sensores Activos:</span>
                    <span className="font-bold text-primary">1,247</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cobertura:</span>
                    <span className="font-bold text-primary">94.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tiempo de Detección:</span>
                    <span className="font-bold text-primary">4.2 min</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}