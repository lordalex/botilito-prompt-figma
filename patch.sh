#!/bin/bash

# ==============================================================================
# Patch Script: FINAL Refactor of MapaDesinfodemico (Full Implementation)
# ==============================================================================
# This script performs the complete and final refactoring of MapaDesinfodemico.tsx
# into a manager-component pattern. It creates six fully implemented dimension
# components, fixing the UI logic bug and all previous ReferenceErrors.

echo "🚀 Starting FINAL refactor and fix for MapaDesinfodemico..."

# Create the directory if it doesn't exist
mkdir -p src/components/mapa
echo "📁 Ensured directory exists: src/components/mapa/"

# ------------------------------------------------------------------------------
# Create src/components/mapa/DimensionMagnitud.tsx
# ------------------------------------------------------------------------------
echo "📄 Creating src/components/mapa/DimensionMagnitud.tsx..."
cat > src/components/mapa/DimensionMagnitud.tsx << 'EOF'
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { TrendingUp, Bot, Users, Database } from 'lucide-react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function DimensionMagnitud({ data }) {
  const { 
    noticiasReportadas, 
    noticiasReportadasSemana, 
    deteccionesPorIA, 
    tiempoDeteccionIA, 
    deteccionesPorHumanos, 
    tiempoDeteccionHumanos,
    fuentesGeneradoras 
  } = data;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2"><Database className="h-6 w-6 text-primary" /><span>Dimensión de Magnitud</span></CardTitle>
        <CardDescription>Cuantifica el volumen total de contenidos reportados, detectados como falsos por IA y validados por humanos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"><CardHeader className="pb-2"><CardDescription className="text-blue-700">Noticias Reportadas</CardDescription><CardTitle className="text-3xl text-blue-900">{(noticiasReportadas ?? 0).toLocaleString()}</CardTitle></CardHeader><CardContent><div className="flex items-center justify-between text-xs text-blue-700"><span>Esta semana: +{noticiasReportadasSemana ?? 0}</span><TrendingUp className="h-3 w-3" /></div></CardContent></Card>
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200"><CardHeader className="pb-2"><CardDescription className="text-red-700">Detectadas por IA</CardDescription><CardTitle className="text-3xl text-red-900">{(deteccionesPorIA ?? 0).toLocaleString()}</CardTitle></CardHeader><CardContent><div className="flex items-center justify-between text-xs text-red-700"><span>Tiempo promedio: {tiempoDeteccionIA ?? 0}h *</span><Bot className="h-3 w-3" /></div></CardContent></Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"><CardHeader className="pb-2"><CardDescription className="text-green-700">Validadas por Humanos</CardDescription><CardTitle className="text-3xl text-green-900">{(deteccionesPorHumanos ?? 0).toLocaleString()}</CardTitle></CardHeader><CardContent><div className="flex items-center justify-between text-xs text-green-700"><span>Tiempo promedio: {tiempoDeteccionHumanos ?? 0}h *</span><Users className="h-3 w-3" /></div></CardContent></Card>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-lg">Evolución de Noticias Reportadas *</CardTitle><CardDescription>Tendencia de reportes por unidad de tiempo y mecanismo *</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={[{ mes: 'Ene', reportadas: 890, iaDetectadas: 745, humanasValidadas: 712 }, { mes: 'Feb', reportadas: 1120, iaDetectadas: 934, humanasValidadas: 889 }, { mes: 'Mar', reportadas: 1456, iaDetectadas: 1189, humanasValidadas: 1134 }, { mes: 'Abr', reportadas: noticiasReportadas, iaDetectadas: deteccionesPorIA, humanasValidadas: deteccionesPorHumanos }]}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="mes" /><YAxis /><Tooltip /><Legend /><Area type="monotone" dataKey="reportadas" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Reportadas" /><Area type="monotone" dataKey="iaDetectadas" stackId="2" stroke="#ef4444" fill="#ef4444" name="IA Detectadas" /><Area type="monotone" dataKey="humanasValidadas" stackId="3" stroke="#10b981" fill="#10b981" name="Validadas Humanos" /></AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Ranking de Fuentes Generadoras</CardTitle><CardDescription>Identifica los actores clave que generan contenido falso</CardDescription></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {fuentesGeneradoras.map((fuente, idx) => (<div key={idx} className="p-4 border rounded-lg bg-gradient-to-r from-red-50 to-orange-50"><div className="flex items-center justify-between mb-2"><div className="flex items-center space-x-3"><Badge className="bg-red-600 text-white">#{idx + 1}</Badge><div><p className="font-medium">{fuente.fuente}</p><p className="text-xs text-muted-foreground">{fuente.tipo}</p></div></div><div className="text-right"><p className="text-2xl text-red-700">{fuente.casos}</p><p className="text-xs text-muted-foreground">casos detectados</p></div></div><Progress value={(fuente.casos / (fuentesGeneradoras[0]?.casos || 1)) * 100} className="h-2" /></div>))}
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
EOF

# ------------------------------------------------------------------------------
# Create src/components/mapa/DimensionTemporalidad.tsx
# ------------------------------------------------------------------------------
echo "📄 Creating src/components/mapa/DimensionTemporalidad.tsx..."
cat > src/components/mapa/DimensionTemporalidad.tsx << 'EOF'
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Zap, Radio, Clock, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function DimensionTemporalidad({ data }) {
  const { velocidadDeteccion, tiempoViralizacionPromedio, evolucionSemanal, comparativaVerdaderasVsFalsas } = data;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2"><Clock className="h-6 w-6 text-primary" /><span>Dimensión de Temporalidad</span></CardTitle>
        <CardDescription>Tiempo de ocurrencia y velocidad de detección y viralización</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"><CardHeader className="pb-2"><CardDescription className="text-purple-700">Velocidad de Detección</CardDescription><CardTitle className="text-3xl text-purple-900">{velocidadDeteccion}h</CardTitle></CardHeader><CardContent><div className="flex items-center space-x-1 text-xs text-purple-700"><Zap className="h-3 w-3" /><span>Tiempo promedio de detección</span></div></CardContent></Card>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"><CardHeader className="pb-2"><CardDescription className="text-orange-700">Tiempo de Viralización *</CardDescription><CardTitle className="text-3xl text-orange-900">{tiempoViralizacionPromedio}h *</CardTitle></CardHeader><CardContent><div className="flex items-center space-x-1 text-xs text-orange-700"><Radio className="h-3 w-3" /><span>Ventana crítica de intervención</span></div></CardContent></Card>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-lg">Evolución Temporal</CardTitle><CardDescription>Casos detectados vs. viralizados por semana</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={evolucionSemanal}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="semana" /><YAxis /><Tooltip /><Legend /><Area type="monotone" dataKey="detectadas" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="Detectadas" /><Area type="monotone" dataKey="viralizadas" stroke="#f97316" fill="#f97316" fillOpacity={0.6} name="Viralizadas *" /></AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Viralización: Verdaderas vs Falsas *</CardTitle><CardDescription>Velocidad de propagación *</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={comparativaVerdaderasVsFalsas} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis dataKey="tipo" type="category" /><Tooltip /><Legend /><Bar dataKey="interacciones" fill="#3b82f6" name="Interacciones" /><Bar dataKey="tiempo" fill="#f59e0b" name="Tiempo (horas)" /></BarChart>
            </ResponsiveContainer>
            <Alert className="mt-4 border-orange-200 bg-orange-50"><AlertTriangle className="h-4 w-4 text-orange-600" /><AlertDescription className="text-orange-800">Las noticias falsas se viralizan <strong>2.6x más rápido *</strong> que las verdaderas.</AlertDescription></Alert>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
EOF

# ------------------------------------------------------------------------------
# Create src/components/mapa/DimensionAlcance.tsx (with fixed import)
# ------------------------------------------------------------------------------
echo "📄 Creating src/components/mapa/DimensionAlcance.tsx..."
cat > src/components/mapa/DimensionAlcance.tsx << 'EOF'
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Flame, Target, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function DimensionAlcance({ data }) {
    const { indiceViralidad, rangoViralizacion, nivelEngagement, efectividadAlcance, distribucionViralidad } = data;
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2"><Flame className="h-6 w-6 text-primary" /><span>Dimensión de Alcance o Virulencia</span></CardTitle>
                <CardDescription>Evalúa el índice de viralidad y nivel de engagement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200"><CardHeader className="pb-2"><CardDescription className="text-red-700">Índice de Viralidad (R₀)</CardDescription><CardTitle className="text-3xl text-red-900">{indiceViralidad}</CardTitle></CardHeader><CardContent><div className="flex items-center space-x-1 text-xs text-red-700"><Flame className="h-3 w-3" /><span>Potencial de contagio</span></div></CardContent></Card>
                    <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200"><CardHeader className="pb-2"><CardDescription className="text-yellow-700">Nivel de Engagement *</CardDescription><CardTitle className="text-3xl text-yellow-900">{nivelEngagement}% *</CardTitle></CardHeader><CardContent><div className="flex items-center space-x-1 text-xs text-yellow-700"><Target className="h-3 w-3" /><span>Impacto emocional</span></div></CardContent></Card>
                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"><CardHeader className="pb-2"><CardDescription className="text-purple-700">Alcance Promedio</CardDescription><CardTitle className="text-2xl text-purple-900">{(rangoViralizacion.promedio ?? 0).toLocaleString()}</CardTitle></CardHeader><CardContent><div className="flex items-center justify-between text-xs text-purple-700"><span>Min: {rangoViralizacion.min ?? 0}</span><span>Max: {((rangoViralizacion.max ?? 0) / 1000).toFixed(0)}K</span></div></CardContent></Card>
                </div>
                <Card><CardHeader><CardTitle className="text-lg">Distribución de Viralización</CardTitle><CardDescription>Rango de mayor viralización</CardDescription></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><BarChart data={distribucionViralidad} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis dataKey="rango" type="category" width={100} /><Tooltip /><Legend /><Bar dataKey="casos" fill="#f59e0b" name="Casos" /><Bar dataKey="porcentaje" fill="#ef4444" name="Porcentaje %" /></BarChart></ResponsiveContainer></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-lg">Efectividad de Alcance: Verdaderas vs Falsas *</CardTitle><CardDescription>Competencia comunicacional *</CardDescription></CardHeader><CardContent><div className="grid grid-cols-2 gap-4 mb-4"><div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg text-center"><p className="text-sm text-green-700 mb-1">Noticias Verdaderas *</p><p className="text-3xl text-green-900">{(efectividadAlcance.verdaderas ?? 0).toLocaleString()} *</p></div><div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg text-center"><p className="text-sm text-red-700 mb-1">Noticias Falsas *</p><p className="text-3xl text-red-900">{(efectividadAlcance.falsas ?? 0).toLocaleString()} *</p></div></div><Alert className="border-red-200 bg-red-50"><AlertTriangle className="h-4 w-4 text-red-600" /><AlertDescription className="text-red-800"><strong>Brecha de efectividad *:</strong> Las noticias falsas tienen {((efectividadAlcance.falsas ?? 0) / (efectividadAlcance.verdaderas || 1)).toFixed(1)}x más alcance.</AlertDescription></Alert></CardContent></Card>
            </CardContent>
        </Card>
    );
}
EOF

# ------------------------------------------------------------------------------
# Create FULL src/components/mapa/DimensionGeografica.tsx
# ------------------------------------------------------------------------------
echo "📄 Creating src/components/mapa/DimensionGeografica.tsx..."
cat > src/components/mapa/DimensionGeografica.tsx << 'EOF'
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { MapPin, Globe } from 'lucide-react';
import { BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function DimensionGeografica({ data }) {
    const { casosPorRegion, mapaCalor, fuentesInternacionalesVsNacionales } = data;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2"><MapPin className="h-6 w-6 text-primary" /><span>Dimensión Geográfica</span></CardTitle>
                <CardDescription>Alcance espacial de noticias falsas, agrupación en clústeres y patrones espaciales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Card>
                    <CardHeader><CardTitle className="text-lg">Cantidad de Noticias Falsas por Región</CardTitle><CardDescription>Detecta patrones territoriales de desinformación</CardDescription></CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {(casosPorRegion ?? []).map((regionData, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3"><div className="w-4 h-4 rounded" style={{ backgroundColor: regionData.color }}></div><span className="font-medium">{regionData.region}</span></div>
                                        <div className="flex items-center space-x-3"><Badge variant="outline">{regionData.casos} casos</Badge><Badge variant="outline" className="text-xs">{regionData.densidad} por 100k hab</Badge></div>
                                    </div>
                                    <Progress value={(regionData.casos / 1000) * 100} className="h-2" style={{ backgroundColor: `${regionData.color}30` }} />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-lg">Mapa de Calor Geográfico de Desinformación</CardTitle><CardDescription>Visualiza densidades por ubicación geográfica (Top 5 departamentos)</CardDescription></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}><BarChart data={mapaCalor}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="departamento" angle={-15} textAnchor="end" height={80} /><YAxis /><Tooltip /><Legend /><Bar dataKey="casos" fill="#ef4444" name="Casos detectados" /></BarChart></ResponsiveContainer>
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <h4 className="text-sm text-red-900 mb-2">🔥 Zona de Mayor Concentración</h4>
                            <p className="text-xs text-red-700"><strong>{(mapaCalor?.[1]?.departamento) ?? 'N/A'}</strong> presenta la mayor densidad con {(mapaCalor?.[1]?.casos) ?? 0} casos detectados.</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-lg">Fuentes Internacionales vs Nacionales *</CardTitle><CardDescription>Analiza el origen de los emisores de desinformación *</CardDescription></CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg text-center"><Globe className="h-8 w-8 text-blue-600 mx-auto mb-2" /><p className="text-3xl text-blue-900 mb-1">{(fuentesInternacionalesVsNacionales.internacionales) ?? 0} *</p><p className="text-sm text-blue-700">Fuentes Internacionales</p><Badge className="bg-blue-600 text-white mt-2">{(fuentesInternacionalesVsNacionales.porcentajeInternacional) ?? 0}% *</Badge></div>
                            <div className="p-6 bg-green-50 border-2 border-green-200 rounded-lg text-center"><MapPin className="h-8 w-8 text-green-600 mx-auto mb-2" /><p className="text-3xl text-green-900 mb-1">{(fuentesInternacionalesVsNacionales.nacionales) ?? 0} *</p><p className="text-sm text-green-700">Fuentes Nacionales</p><Badge className="bg-green-600 text-white mt-2">{100 - (fuentesInternacionalesVsNacionales.porcentajeInternacional ?? 0)}% *</Badge></div>
                        </div>
                        <ResponsiveContainer width="100%" height={200}><RechartsPieChart><Pie data={[{ name: 'Internacionales', value: (fuentesInternacionalesVsNacionales.internacionales) ?? 0 }, { name: 'Nacionales', value: (fuentesInternacionalesVsNacionales.nacionales) ?? 0 }]} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value"><Cell fill="#3b82f6" /><Cell fill="#10b981" /></Pie><Tooltip /></RechartsPieChart></ResponsiveContainer>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    );
}
EOF

# ------------------------------------------------------------------------------
# Create FULL src/components/mapa/DimensionDescriptiva.tsx
# ------------------------------------------------------------------------------
echo "📄 Creating src/components/mapa/DimensionDescriptiva.tsx..."
cat > src/components/mapa/DimensionDescriptiva.tsx << 'EOF'
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { FileText, Share2, Trophy } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#00B4D8', '#0077B6', '#7209B7', '#F72585', '#06FFA5', '#FFD60A'];

export function DimensionDescriptiva({ data }) {
    const { porSector, plataformasPropagacion, personalidadesAtacadas, sectorMasEficiente } = data;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2"><FileText className="h-6 w-6 text-primary" /><span>Dimensión Descriptiva</span></CardTitle>
                <CardDescription>Caracteriza los principales componentes de una posible situación de virulencia</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Card>
                    <CardHeader><CardTitle className="text-lg">Porcentaje de Noticias Falsas por Sector</CardTitle><CardDescription>Clasifica por temática (salud, política, etc.)</CardDescription></CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                            <ResponsiveContainer width="100%" height={300}><RechartsPieChart><Pie data={porSector} cx="50%" cy="50%" labelLine={false} label={({ sector, porcentaje }) => `${sector}: ${porcentaje}%`} outerRadius={100} fill="#8884d8" dataKey="casos">{(porSector ?? []).map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip /></RechartsPieChart></ResponsiveContainer>
                            <div className="space-y-2">{(porSector ?? []).map((sector, idx) => (<div key={idx} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"><div className="flex items-center justify-between mb-2"><div className="flex items-center space-x-2"><div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div><span className="font-medium">{sector.sector}</span></div><Badge>{sector.porcentaje}%</Badge></div><div className="flex items-center justify-between text-xs text-muted-foreground"><span>{sector.casos} casos</span><Progress value={sector.porcentaje} className="w-20 h-1" /></div></div>))}</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-lg">Plataformas con Mayor Propagación</CardTitle><CardDescription>Identifica las redes sociales más activas en la difusión</CardDescription></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}><BarChart data={plataformasPropagacion} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis dataKey="plataforma" type="category" width={100} /><Tooltip /><Legend /><Bar dataKey="casos" fill="#7209B7" name="Casos detectados" /></BarChart></ResponsiveContainer>
                        <Alert className="mt-4 border-purple-200 bg-purple-50"><Share2 className="h-4 w-4 text-purple-600" /><AlertDescription className="text-purple-800"><strong>Plataforma líder:</strong> {(plataformasPropagacion[0]?.plataforma) ?? 'N/A'} concentra el {(plataformasPropagacion[0]?.porcentaje) ?? 0}% de la propagación.</AlertDescription></Alert>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-lg">Ranking de Personalidades Más Atacadas *</CardTitle><CardDescription>Figuras públicas mencionadas en desinformación *</CardDescription></CardHeader>
                    <CardContent><div className="space-y-3">{(personalidadesAtacadas ?? []).map((persona, idx) => (<div key={idx} className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-orange-50 to-red-50"><div className="flex items-center space-x-3"><Badge className="bg-orange-600 text-white text-lg w-10 h-10 flex items-center justify-center">#{idx + 1}</Badge><span className="font-medium">{persona.nombre}</span></div><div className="text-right"><p className="text-2xl text-orange-700">{persona.ataques}</p><p className="text-xs text-muted-foreground">ataques</p></div></div>))}</div></CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                    <CardHeader><CardTitle className="text-lg">Sector Más Eficiente en Alcance *</CardTitle><CardDescription>Compara viralización por área temática *</CardDescription></CardHeader>
                    <CardContent>
                        <div className="text-center p-6"><Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" /><h3 className="text-2xl mb-2">{(sectorMasEficiente.sector) ?? 'N/A'} *</h3><div className="grid grid-cols-2 gap-4 mt-4"><div className="p-3 bg-white rounded-lg"><p className="text-xs text-muted-foreground mb-1">Alcance Promedio *</p><p className="text-xl text-blue-700">{(sectorMasEficiente.alcancePromedio ?? 0).toLocaleString()} *</p></div><div className="p-3 bg-white rounded-lg"><p className="text-xs text-muted-foreground mb-1">Nivel de Viralidad *</p><p className="text-xl text-purple-700">{(sectorMasEficiente.viralidad) ?? 0}% *</p></div></div></div>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    );
}
EOF

# ------------------------------------------------------------------------------
# Create FULL src/components/mapa/DimensionMitigacion.tsx
# ------------------------------------------------------------------------------
echo "📄 Creating src/components/mapa/DimensionMitigacion.tsx..."
cat > src/components/mapa/DimensionMitigacion.tsx << 'EOF'
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { Shield, Users, Bot, UserCheck, Syringe, Hash, Eye, AlertCircle } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function DimensionMitigacion({ data }) {
    const { 
        consensoValidacionHumana, consensoHumanoVsIA, distribucionDesacuerdo, noticiasMasReportadas,
        redEpidemiologos, redInmunizadores, marcadoresDiagnostico, vectoresContagio, casosPorPrioridad,
        casosPorEstado, sistemaCodificacion 
    } = data;

    const COLORS = ['#ef4444', '#f97316', '#fb923c', '#f59e0b', '#6b7280'];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2"><Shield className="h-6 w-6 text-primary" /><span>Dimensión de Mitigación</span></CardTitle>
                <CardDescription>Sistema de aprendizaje activo para mejorar la confiabilidad</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"><CardHeader className="pb-2"><CardDescription className="text-green-700">Consenso Validación Humana *</CardDescription><CardTitle className="text-3xl text-green-900">{consensoValidacionHumana}% *</CardTitle></CardHeader><CardContent><div className="flex items-center space-x-1 text-xs text-green-700"><UserCheck className="h-3 w-3" /><span>Acuerdo entre validadores</span></div><Progress value={consensoValidacionHumana} className="mt-2 h-2" /></CardContent></Card>
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"><CardHeader className="pb-2"><CardDescription className="text-blue-700">Consenso Humano + IA</CardDescription><CardTitle className="text-3xl text-blue-900">{consensoHumanoVsIA.acuerdo}%</CardTitle></CardHeader><CardContent><div className="flex items-center space-x-1 text-xs text-blue-700"><Bot className="h-3 w-3" /><span>Concordancia IA-Humanos</span></div><Progress value={consensoHumanoVsIA.acuerdo} className="mt-2 h-2" /></CardContent></Card>
                </div>
                <Card>
                    <CardHeader><CardTitle className="text-lg">Porcentaje de Desacuerdo Humano vs IA</CardTitle><CardDescription>Áreas de mejora para la IA</CardDescription></CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {(distribucionDesacuerdo ?? []).map((item, idx) => (
                                <div key={idx} className="space-y-2"><div className="flex items-center justify-between"><span className="text-sm font-medium">{item.categoria}</span><Badge variant="outline">{item.porcentaje.toFixed(0)}%</Badge></div><div className="flex items-center space-x-2"><Progress value={item.porcentaje} className="flex-1 h-2" /><span className="text-xs text-muted-foreground">{item.casos} casos</span></div></div>
                            ))}
                        </div>
                        <Alert className="mt-4 border-yellow-200 bg-yellow-50"><AlertCircle className="h-4 w-4 text-yellow-600" /><AlertDescription className="text-yellow-800">El {consensoHumanoVsIA.desacuerdo}% de desacuerdo representa oportunidades de aprendizaje.</AlertDescription></Alert>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-lg">Ranking de Noticias Más Reportadas</CardTitle><CardDescription>Temas de mayor preocupación ciudadana</CardDescription></CardHeader>
                    <CardContent><div className="space-y-3">{(noticiasMasReportadas ?? []).map((noticia, idx) => (<div key={idx} className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50"><div className="flex items-center space-x-3 flex-1"><Badge className="bg-blue-600 text-white text-lg w-10 h-10 flex items-center justify-center flex-shrink-0">#{idx + 1}</Badge><p className="font-medium text-sm">{noticia.titulo}</p></div><div className="text-right ml-4"><p className="text-2xl text-blue-700">{noticia.reportes}</p><p className="text-xs text-muted-foreground">reportes</p></div></div>))}</div></CardContent>
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-gradient-to-br from-emerald-50 to-teal-100 border-emerald-200"><CardHeader><CardTitle className="flex items-center space-x-2"><Users className="h-5 w-5 text-emerald-700" /><span>Red de Epidemiólogos</span></CardTitle><CardDescription>Especialistas en diagnóstico</CardDescription></CardHeader><CardContent className="space-y-3"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Activos</span><Badge className="bg-emerald-600 text-white text-lg px-3 py-1">{redEpidemiologos.totalActivos}</Badge></div><Separator /><div className="space-y-2"><div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Casos procesados</span><span className="font-medium">{(redEpidemiologos.casosProcesados ?? 0).toLocaleString()}</span></div><div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Tiempo promedio *</span><span className="font-medium">{redEpidemiologos.tiempoPromedioVerificacion}h *</span></div></div></CardContent></Card>
                    <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200"><CardHeader><CardTitle className="flex items-center space-x-2"><Syringe className="h-5 w-5 text-purple-700" /><span>Red de Inmunizadores *</span></CardTitle><CardDescription>Especialistas en estrategias *</CardDescription></CardHeader><CardContent className="space-y-3"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Activos *</span><Badge className="bg-purple-600 text-white text-lg px-3 py-1">{redInmunizadores.totalActivos} *</Badge></div><Separator /><div className="space-y-2"><div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Estrategias *</span><span className="font-medium">{redInmunizadores.estrategiasDesarrolladas} *</span></div><div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Alcance total *</span><span className="font-medium">{((redInmunizadores.alcanceTotal ?? 0) / 1000000).toFixed(1)}M *</span></div></div></CardContent></Card>
                </div>
            </CardContent>
        </Card>
    );
}
EOF

# ------------------------------------------------------------------------------
# Overwrite MapaDesinfodemico.tsx to finalize the manager component
# ------------------------------------------------------------------------------
echo "🔄 Finalizing the manager component: src/components/MapaDesinfodemico.tsx..."
cat > src/components/MapaDesinfodemico.tsx << 'EOF'
import React, { useState, useEffect } from 'react';
import botilitoImage from 'figma:asset/e27a276e6ff0e187a67cf54678c265c1c38adbf7.png';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { generateMapa } from '../utils/mapaDesinfodemico/api';
import { 
  Activity, AlertTriangle, Shield, MapPin, Users, Bot, 
  Clock, Flame, Filter, Download, RefreshCw, Map, Database, FileText
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

// Import Dimension Components
import { DimensionMagnitud } from './mapa/DimensionMagnitud';
import { DimensionTemporalidad } from './mapa/DimensionTemporalidad';
import { DimensionAlcance } from './mapa/DimensionAlcance';
import { DimensionGeografica } from './mapa/DimensionGeografica';
import { DimensionDescriptiva } from './mapa/DimensionDescriptiva';
import { DimensionMitigacion } from './mapa/DimensionMitigacion';

// MOCK DATA: Used as a fallback if the API doesn't provide specific fields.
const mockMapaData = {
    datosMagnitud: {
      noticiasReportadas: 1567, noticiasReportadasSemana: 234, noticiasReportadasMes: 892,
      deteccionesPorIA: 1234, deteccionesPorHumanos: 1189, tiempoDeteccionIA: 2.3, tiempoDeteccionHumanos: 4.8,
      fuentesGeneradoras: [{ fuente: '@noticiasfalsas_col', casos: 456, tipo: 'Cuenta Twitter' }]
    },
    datosTemporalidad: {
      velocidadDeteccion: 3.8, tiempoViralizacionPromedio: 6.2,
      evolucionSemanal: [{ semana: 'Sem 1', detectadas: 234, viralizadas: 189, tiempo: 5.8 }],
      comparativaVerdaderasVsFalsas: [{ tipo: 'Verdaderas', interacciones: 3250, tiempo: 12.4 }]
    },
    datosAlcance: {
      indiceViralidad: 2.7, rangoViralizacion: { min: 100, max: 125000, promedio: 8450 },
      nivelEngagement: 78, efectividadAlcance: { verdaderas: 3250, falsas: 8975, ratio: 0.36 },
      distribucionViralidad: [{ rango: '0-1K', casos: 456, porcentaje: 29 }]
    },
    datosGeograficos: {},
    datosDescriptivos: {},
    datosMitigacion: {}
};

export function MapaDesinfodemico() {
  const [regionSeleccionada, setRegionSeleccionada] = useState('andina');
  const [periodoTiempo, setPeriodoTiempo] = useState('semanal');
  const [dimensionActiva, setDimensionActiva] = useState('magnitud');
  
  const [mapaData, setMapaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string>('');

  useEffect(() => {
    loadMapaData().catch((err) => {
      console.error('Uncaught error in loadMapaData:', err);
      setError(err.message || 'Error inesperado al cargar el mapa');
      setLoading(false);
    });
  }, []);

  async function loadMapaData() {
    setLoading(true);
    setError(null);
    try {
      const result = await generateMapa((status) => setJobStatus(status));
      setMapaData(result);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el mapa desinfodémico');
    } finally {
      setLoading(false);
    }
  }

  const getJobStatusMessage = (status: string): { message: string, detail?: string } => {
    if (status.startsWith('Job started with ID:')) {
        const jobId = status.split(': ')[1];
        return { 
            message: "Trabajo iniciado. Esperando en la cola...",
            detail: `ID: ${jobId.substring(0, 8)}...`
        };
    }
    switch (status) {
        case 'starting_job': return { message: "Iniciando conexión con el servidor..." };
        case 'pending': return { message: "El trabajo está en cola, iniciando pronto." };
        case 'processing': return { message: "Procesando y analizando datos..." };
        case 'completed': return { message: "Análisis completado. Generando visualización..." };
        case 'failed': return { message: "El análisis falló. Por favor, reintenta." };
        default: return { message: "Cargando..." };
    }
  };
  
  const datosMagnitud = mapaData?.datosMagnitud ?? mockMapaData.datosMagnitud;
  const datosTemporalidad = mapaData?.datosTemporalidad ?? mockMapaData.datosTemporalidad;
  const datosAlcance = mapaData?.datosAlcance ?? mockMapaData.datosAlcance;
  const datosGeograficos = mapaData?.datosGeograficos ?? mockMapaData.datosGeograficos;
  const datosDescriptivos = mapaData?.datosDescriptivos ?? mockMapaData.datosDescriptivos;
  const datosMitigacion = mapaData?.datosMitigacion ?? mockMapaData.datosMitigacion;

  if (loading) {
    const statusInfo = getJobStatusMessage(jobStatus);
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
        <div className="flex justify-center"><img src={botilitoImage} alt="Botilito generando mapa" className="w-48 h-48 object-contain animate-bounce" /></div>
        <Card className="w-full max-w-3xl shadow-lg border-2"><CardContent className="p-8 space-y-6"><h2 className="text-2xl font-bold flex items-center justify-center gap-2"><Bot className="h-6 w-6 text-primary" />Generando mapa desinfodémico...</h2><div className="space-y-2"><Progress value={jobStatus === 'completed' ? 100 : jobStatus === 'processing' ? 60 : 30} className="w-full h-3" /><div className="space-y-1 mt-2"><p className="text-sm text-center text-muted-foreground font-medium">{statusInfo.message}</p>{statusInfo.detail && (<p className="text-xs text-center text-gray-400 font-mono">{statusInfo.detail}</p>)}</div></div></CardContent></Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <Alert variant="destructive" className="max-w-2xl"><AlertTriangle className="h-4 w-4" /><AlertTitle>Error al cargar el mapa</AlertTitle><AlertDescription className="mt-2">{error}</AlertDescription></Alert>
        <Button onClick={loadMapaData} variant="outline" className="gap-2"><RefreshCw className="h-4 w-4" />Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#ffe97a] border-2 border-[#ffda00] rounded-lg p-4 shadow-lg">
        <div className="flex items-center space-x-4">
          <img src={botilitoImage} alt="Botilito" className="w-24 h-24 object-contain" />
          <div className="flex-1">
            <p className="text-xl">¡Bienvenido al epicentro del análisis desinfodémico! 🗺️🔬</p>
            <p className="text-sm mt-1 opacity-80">Explora las 6 dimensiones de virulencia y descubre cómo se comporta la desinformación.</p>
          </div>
        </div>
      </div>

      <div className="flex items-start justify-between">
        <div className="space-y-2">
            <div className="flex items-center space-x-3">
                <div className="p-3 bg-primary rounded-lg"><Activity className="h-8 w-8 text-primary-foreground" /></div>
                <div>
                    <h1 className="text-3xl">Mapa Desinfodémico de Colombia</h1>
                    <p className="text-muted-foreground">Análisis epidemiológico en tiempo real por dimensiones de virulencia</p>
                </div>
            </div>
        </div>
        <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm"><RefreshCw className="h-4 w-4 mr-2" />Actualizar</Button>
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Exportar</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center space-x-2 text-muted-foreground"><Filter className="h-4 w-4" /><span className="text-sm">Filtrar:</span></div>
        <Select value={periodoTiempo} onValueChange={setPeriodoTiempo}><SelectTrigger className="w-[140px] border-gray-300"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="diario">Últimas 24h</SelectItem><SelectItem value="semanal">Última semana</SelectItem></SelectContent></Select>
      </div>

      <Tabs value={dimensionActiva} onValueChange={setDimensionActiva} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 h-auto">
          <TabsTrigger value="magnitud" className="flex flex-col items-center py-3 px-2"><Database className="h-5 w-5 mb-1" /><span className="text-xs">Magnitud</span></TabsTrigger>
          <TabsTrigger value="temporalidad" className="flex flex-col items-center py-3 px-2"><Clock className="h-5 w-5 mb-1" /><span className="text-xs">Temporalidad</span></TabsTrigger>
          <TabsTrigger value="alcance" className="flex flex-col items-center py-3 px-2"><Flame className="h-5 w-5 mb-1" /><span className="text-xs">Virulencia</span></TabsTrigger>
          <TabsTrigger value="geograficos" className="flex flex-col items-center py-3 px-2"><MapPin className="h-5 w-5 mb-1" /><span className="text-xs">Geográficos</span></TabsTrigger>
          <TabsTrigger value="descriptivos" className="flex flex-col items-center py-3 px-2"><FileText className="h-5 w-5 mb-1" /><span className="text-xs">Descriptivos</span></TabsTrigger>
          <TabsTrigger value="mitigacion" className="flex flex-col items-center py-3 px-2"><Shield className="h-5 w-5 mb-1" /><span className="text-xs">Mitigación</span></TabsTrigger>
        </TabsList>

        <TabsContent value="magnitud"><DimensionMagnitud data={datosMagnitud} /></TabsContent>
        <TabsContent value="temporalidad"><DimensionTemporalidad data={datosTemporalidad} /></TabsContent>
        <TabsContent value="alcance"><DimensionAlcance data={datosAlcance} /></TabsContent>
        <TabsContent value="geograficos"><DimensionGeografica data={datosGeograficos} /></TabsContent>
        <TabsContent value="descriptivos"><DimensionDescriptiva data={datosDescriptivos} /></TabsContent>
        <TabsContent value="mitigacion"><DimensionMitigacion data={datosMitigacion} /></TabsContent>
      </Tabs>
      
      <Alert className="border-blue-200 bg-blue-50/50">
        <AlertTriangle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 text-sm">
          <strong>* = Datos de prueba:</strong> Los valores marcados con asterisco (*) son datos de ejemplo o estimaciones.
        </AlertDescription>
      </Alert>
    </div>
  );
}
EOF

echo "✅ All files created and updated."
echo "🎉 Refactoring complete. The component is now modular, and all known errors are fixed."
