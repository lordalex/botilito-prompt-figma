# Plan de Desarrollo - Perfil de Usuario

> **Stack**: React + TypeScript + Tailwind CSS  
> **Proyecto**: Botilito - Plataforma de Verificación de Desinformación  
> **Fecha**: Enero 2026  
> **Estimación Total**: ~10 horas

---

## 📐 Estructura Visual de la Página

```
┌──────────────────────────────────────────────────────────────┐
│  1. BOTILITO BANNER (ya existe - BotilitoValidationBanner)   │
├──────────────────────────────────────────────────────────────┤
│  2. PROFILE HEADER                                           │
│  ┌─────────────────────────────────────────┬────────────────┐│
│  │ Avatar + Datos Básicos + Progreso       │ PI Score Card  ││
│  └─────────────────────────────────────────┴────────────────┘│
├──────────────────────────────────────────────────────────────┤
│  3. BADGES & KPI                                             │
│  ┌─────────────────────────────────────────────────┬────────┐│
│  │ Insignias Ganadas (5/15) [iconos en fila]       │ +725 PI││
│  └─────────────────────────────────────────────────┴────────┘│
│  ┌────────┬────────┬────────┬────────┐                       │
│  │ 127    │ 18     │ 23     │ #156   │ ← Quick Stats        │
│  │ Casos  │ Valid. │ Racha  │ Rank   │                       │
│  └────────┴────────┴────────┴────────┘                       │
├──────────────────────────────────────────────────────────────┤
│  4. TABS                                                     │
│  ┌──────────┬──────────┬──────────┬──────────┐               │
│  │ Resumen  │ Insignias│ Logros   │ Estadíst.│               │
│  └──────────┴──────────┴──────────┴──────────┘               │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ [Contenido del tab activo]                               ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura de Archivos

```
src/components/profile/
├── ProfilePage.tsx              ← Página principal (orquesta todo)
├── ProfileHeader.tsx            ← Sección 2: Datos básicos
├── BadgesAndKPI.tsx             ← Sección 3: Insignias + Stats
├── ProfileTabs.tsx              ← Sección 4: Contenedor tabs
├── tabs/
│   ├── SummaryTab.tsx           ← Tab Resumen
│   ├── BadgesTab.tsx            ← Tab Insignias
│   ├── AchievementsTab.tsx      ← Tab Logros
│   └── StatsTab.tsx             ← Tab Estadísticas
├── types.ts                     ← Interfaces compartidas
└── index.ts                     ← Exports
```

---

## 🎨 Design Tokens

### Colores Principales

```typescript
const colors = {
  primary: '#FFDA00',        // Amarillo Botilito
  primaryLight: '#FFF59D',   // Fondo banner
  primaryMuted: '#FEF3C7',   // Fondo cards amarillos
  
  // Tiers de insignias
  bronze: '#CD7F32',
  silver: '#C0C0C0', 
  gold: '#FFD700',
  platinum: '#E5E4E2',
  diamond: '#B9F2FF',
  
  // Estados
  success: '#22C55E',        // Verde (stats verdes)
  warning: '#F97316',        // Naranja (racha)
  locked: '#9CA3AF',         // Gris (bloqueado)
};
```

### Colores Quick Stats

| Stat | Background | Border |
|------|------------|--------|
| Casos Registrados | `bg-blue-50` | `border-blue-200` |
| Validaciones | `bg-green-50` | `border-green-200` |
| Racha Actual | `bg-orange-50` | `border-orange-200` |
| Ranking | `bg-purple-50` | `border-purple-200` |

---

## 📦 Interfaces TypeScript

```typescript
// types.ts

interface ProfileData {
  user: {
    id: string;
    displayName: string;
    email: string;
    avatarUrl: string;
    level: number;
    rank: string;
    region: string;
    memberSince: Date;
    bio: string;
  };
  gamification: {
    currentPI: number;
    nextRankPI: number;
    nextRankName: string;
    ranking: number;
    totalUsers: number;
    currentStreak: number;
    bestStreak: number;
  };
  stats: {
    casesRegistered: number;
    validations: number;
    consensusAverage: number;
    deepfakesDetected: number;
    caseViews: number;
  };
  badges: Badge[];
  achievements: Achievement[];
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  unlocked: boolean;
  unlockedAt?: Date;
  piReward: number;
  description: string;
  requirement: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  current: number;
  target: number;
  piReward: number;
  completed: boolean;
}

// Interfaz para stats rápidos (Quick Stats)
interface UserStats {
  casesRegistered: number;
  validations: number;  // Unificado: siempre 'validations'
  currentStreak: number;
  ranking: number;
}
```

---

## 🧪 Mock Data para Desarrollo

```typescript
const mockUser = {
  displayName: "María Rodríguez",
  email: "maria.rodriguez@botilito.co",
  avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=MariaRodriguez",
  level: 1,
  rank: "Cibernauta Centinela",
  region: "Región Andina",
  memberSince: new Date("2024-09-01"),
  bio: "Observador responsable en la primera línea contra la desinformación",
  currentPI: 2350,
  nextRankPI: 2500,
  nextRankName: "Cibernauta AMI",
  ranking: 156,
  totalUsers: 5432
};
```

---

## 🎯 Plan de Acción por Fases

### FASE 1: Setup y Tipos Base
**Duración estimada: 30 min**

#### Estructura de Carpetas a Crear

```
src/components/profile/
├── ProfilePage.tsx              ← Página principal (orquesta todo)
├── ProfileHeader.tsx            ← Sección 2: Datos básicos
├── BadgesAndKPI.tsx             ← Sección 3: Insignias + Stats
├── ProfileTabs.tsx              ← Sección 4: Contenedor tabs
├── tabs/
│   ├── SummaryTab.tsx           ← Tab Resumen
│   ├── BadgesTab.tsx            ← Tab Insignias
│   ├── AchievementsTab.tsx      ← Tab Logros
│   └── StatsTab.tsx             ← Tab Estadísticas
├── types.ts                     ← Interfaces compartidas
└── index.ts                     ← Exports
```

#### Tareas

| # | Tarea | Archivo | Entregable |
|---|-------|---------|------------|
| 1.1 | Crear directorio `src/components/profile/` | - | Carpeta creada |
| 1.2 | Crear directorio `src/components/profile/tabs/` | - | Carpeta creada |
| 1.3 | Definir interfaces TypeScript | `types.ts` | `ProfileData`, `Badge`, `Achievement`, `UserStats` |
| 1.4 | Crear archivo de exports | `index.ts` | Barrel exports |

---

### FASE 2: ProfileHeader
**Duración estimada: 1.5h**

📂 **Archivo a crear**: `src/components/profile/ProfileHeader.tsx`

| # | Tarea | Detalles | Criterio de Aceptación |
|---|-------|----------|------------------------|
| 2.1 | Layout base | Container con flex row (avatar izq, datos centro, PI card derecha) | Responsive: stack en móvil |
| 2.2 | Avatar con nivel | Círculo con borde amarillo + badge "Nv.X" en esquina inferior | Imagen desde DiceBear API |
| 2.3 | Info usuario | Nombre, email, badges (rango, región, fecha) | Badges con iconos |
| 2.4 | Bio | Texto entre comillas con estilo itálico | Max 150 chars |
| 2.5 | Barra progreso rango | Progress bar + "X / Y PI" + próximo rango | Color amarillo #FFDA00 |
| 2.6 | PI Score Card | Card destacado con total PI, icono trofeo, ranking | Fondo amarillo degradado |

**Props:**
```typescript
interface ProfileHeaderProps {
  avatarUrl: string;
  displayName: string;
  email: string;
  level: number;
  rank: string;
  region: string;
  memberSince: Date;
  bio: string;
  currentPI: number;
  nextRankPI: number;
  nextRankName: string;
  ranking: number;
  totalUsers: number;
}
```

---

### FASE 3: BadgesAndKPI
**Duración estimada: 1h**

📂 **Archivo a crear**: `src/components/profile/BadgesAndKPI.tsx`

| # | Tarea | Detalles | Criterio de Aceptación |
|---|-------|----------|------------------------|
| 3.1 | Header insignias | "Insignias Ganadas (X/Y)" + badge "+Z PI" | Contador dinámico |
| 3.2 | Badge icons strip | Fila de 15 iconos circulares | Coloreados/grises según unlock |
| 3.3 | Quick Stats grid | 4 cards: Casos, Validaciones, Racha, Ranking | Grid responsive 2x2 → 4x1 |

**Props:**
```typescript
interface BadgesAndKPIProps {
  badges: Badge[];
  stats: {
    casesRegistered: number;
    validations: number;
    currentStreak: number;
    ranking: number;
  };
}
```

---

### FASE 4: ProfileTabs (Contenedor)
**Duración estimada: 30 min**

📂 **Archivo a crear**: `src/components/profile/ProfileTabs.tsx`

| # | Tarea | Detalles |
|---|-------|----------|
| 4.1 | Implementar TabsList | 4 tabs: Resumen, Insignias, Logros, Estadísticas |
| 4.2 | Estilos active state | Tab activo con fondo amarillo |
| 4.3 | Lazy loading | Cargar contenido solo cuando se activa |

---

### FASE 5: SummaryTab
**Duración estimada: 1h**

📂 **Archivo a crear**: `src/components/profile/tabs/SummaryTab.tsx`

| # | Tarea | Detalles |
|---|-------|----------|
| 5.1 | Header sección | "Resumen de Actividad" + subtítulo |
| 5.2 | Streak Card | Card naranja con días 🔥, mejor racha |
| 5.3 | Recent Badges | Grid 2x2 últimas 4 insignias con fecha + PI |
| 5.4 | Achievements In Progress | 3 cards con barra progreso + % |

**Props:**
```typescript
interface SummaryTabProps {
  streak: { current: number; best: number };
  recentBadges: Badge[];
  achievementsInProgress: Achievement[];
}
```

---

### FASE 6: BadgesTab
**Duración estimada: 1.5h**

📂 **Archivo a crear**: `src/components/profile/tabs/BadgesTab.tsx`

| # | Tarea | Detalles |
|---|-------|----------|
| 6.1 | Header | "X de Y insignias desbloqueadas (Z PI ganados)" |
| 6.2 | Section headers | Por tier: Bronce, Plata, Oro, Platino, Diamante |
| 6.3 | Badge Detail Card | Icono, nombre, descripción, requisito, estado |
| 6.4 | Estados visuales | ✓ Desbloqueada (verde) / 🔒 Bloqueada (gris + PI) |

**Props:**
```typescript
interface BadgesTabProps {
  badges: Badge[];
  totalPI: number;
}
```

---

### FASE 7: AchievementsTab
**Duración estimada: 1h**

📂 **Archivo a crear**: `src/components/profile/tabs/AchievementsTab.tsx`

| # | Tarea | Detalles |
|---|-------|----------|
| 7.1 | Header | "X de Y logros completados" |
| 7.2 | Achievement Card | Icono + nombre + PI reward badge |
| 7.3 | Descripción | Texto explicativo del logro |
| 7.4 | Progress | Barra + "X / Y" + "Z% completado" |

**Props:**
```typescript
interface AchievementsTabProps {
  achievements: Achievement[];
}
```

---

### FASE 8: StatsTab
**Duración estimada: 1h**

📂 **Archivo a crear**: `src/components/profile/tabs/StatsTab.tsx`

| # | Tarea | Detalles |
|---|-------|----------|
| 8.1 | Panel izquierdo | "Estadísticas Generales" - 5 filas con valores |
| 8.2 | Panel derecho | "Ranking y Logros" - Cards con métricas |
| 8.3 | Ranking Card | #156 de 5,432 + "Top 3%" badge |
| 8.4 | PI Total Card | Gran número + icono trofeo |

**Props:**
```typescript
interface StatsTabProps {
  generalStats: {
    casesRegistered: number;
    validations: number;
    consensusAverage: number;
    deepfakesDetected: number;
    caseViews: number;
  };
  rankingStats: {
    ranking: number;
    totalUsers: number;
    topPercent: number;
    currentStreak: number;
    bestStreak: number;
    badgesCount: number;
    achievementsCount: number;
    totalPI: number;
  };
}
```

---

### FASE 9: ProfilePage (Integración)
**Duración estimada: 30 min**

📂 **Archivo a crear**: `src/components/profile/ProfilePage.tsx`

| # | Tarea | Detalles |
|---|-------|----------|
| 9.1 | Layout página | Container max-w-7xl + padding |
| 9.2 | Banner | Reutilizar BotilitoValidationBanner |
| 9.3 | Composición | ProfileHeader → BadgesAndKPI → ProfileTabs |
| 9.4 | Loading state | Skeleton mientras carga datos |
| 9.5 | Error state | Mensaje de error si falla API |

---

### FASE 10: Integración API
**Duración estimada: 1h**

📂 **Archivo a crear**: `src/hooks/useProfile.ts`

| # | Tarea | Detalles |
|---|-------|----------|
| 10.1 | Hook `useProfile` | Fetch datos del perfil |
| 10.2 | Conexión con AuthProvider | Obtener userId actual |
| 10.3 | Manejo de estados | loading, error, data |
| 10.4 | Refresh | Función para recargar datos |

---

## 📊 Cronograma de Ejecución

```
┌─────────────────────────────────────────────────────────────────┐
│ DÍA 1 (4h)                                                      │
├─────────────────────────────────────────────────────────────────┤
│ [■■■] Fase 1: Setup (30 min)                                    │
│ [■■■■■■■■■■■■] Fase 2: ProfileHeader (1.5h)                     │
│ [■■■■■■■■] Fase 3: BadgesAndKPI (1h)                            │
│ [■■■■] Fase 4: ProfileTabs container (30 min)                   │
│ [■■■] Fase 5: SummaryTab (30 min inicio)                        │
├─────────────────────────────────────────────────────────────────┤
│ DÍA 2 (4h)                                                      │
├─────────────────────────────────────────────────────────────────┤
│ [■■■■■] Fase 5: SummaryTab (30 min restante)                    │
│ [■■■■■■■■■■■■] Fase 6: BadgesTab (1.5h)                         │
│ [■■■■■■■■] Fase 7: AchievementsTab (1h)                         │
│ [■■■■■■■■] Fase 8: StatsTab (1h)                                │
├─────────────────────────────────────────────────────────────────┤
│ DÍA 3 (2h)                                                      │
├─────────────────────────────────────────────────────────────────┤
│ [■■■■] Fase 9: ProfilePage integración (30 min)                 │
│ [■■■■■■■■] Fase 10: API integration (1h)                        │
│ [■■■■] Testing & Polish (30 min)                                │
└─────────────────────────────────────────────────────────────────┘

TOTAL: ~10 horas de desarrollo
```

---

## ✅ Checklist de Entrega

### Fase 1: Setup
- [ ] Estructura de carpetas creada
- [ ] `types.ts` con todas las interfaces
- [ ] `index.ts` con barrel exports

### Fase 2: ProfileHeader
- [ ] Layout responsive funciona
- [ ] Avatar muestra imagen y nivel
- [ ] Datos de usuario renderizados
- [ ] Barra de progreso funciona
- [ ] PI Score Card visible

### Fase 3: BadgesAndKPI
- [ ] Header muestra contadores
- [ ] Badge icons strip funciona
- [ ] Quick Stats grid responsive

### Fase 4: ProfileTabs
- [ ] 4 tabs visibles
- [ ] Cambio de tab funciona
- [ ] Active state estilizado

### Fase 5: SummaryTab
- [ ] Streak Card renderiza
- [ ] Recent Badges muestra 4 items
- [ ] Achievements in Progress con barras

### Fase 6: BadgesTab
- [ ] Header con contadores
- [ ] Secciones por tier
- [ ] Badge Detail Cards
- [ ] Estados unlock/locked

### Fase 7: AchievementsTab
- [ ] Header con contador
- [ ] Achievement Cards
- [ ] Progress bars funcionan

### Fase 8: StatsTab
- [ ] Panel estadísticas generales
- [ ] Panel ranking y logros
- [ ] Cards con métricas

### Fase 9: ProfilePage
- [ ] Composición correcta
- [ ] Loading state
- [ ] Error state

### Fase 10: API Integration
- [ ] Hook `useProfile` funciona
- [ ] Datos reales cargando
- [ ] Estados manejados

### QA Final
- [ ] Responsive en móvil
- [ ] Responsive en tablet
- [ ] Responsive en desktop
- [ ] Sin errores de TypeScript
- [ ] Sin errores de consola

---

## 🔗 Referencias

- **Diseño de referencia**: https://botilito.digitalia.su/profile
- **Componentes UI base**: `@/components/ui/` (shadcn/ui)
- **Banner existente**: `BotilitoValidationBanner`
- **Tabs UI**: `@/components/ui/tabs`

---

*Documento generado para uso como contexto de desarrollo con GitHub Copilot.*
