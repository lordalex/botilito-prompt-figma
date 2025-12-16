# 🤖 Botilito

**Plataforma Anti-Desinformación con Análisis AI**

Botilito es un ex-agente digital de una granja de bots que escapó para unirse al bando de los que luchan contra la desinformación desde digitalia.gov.co. Esta plataforma combina análisis impulsado por IA con verificación humana comunitaria para combatir la desinformación en Colombia.

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-purple.svg)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20Functions-green.svg)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4.1.3-38B2AC.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Demo y Capturas](#-demo-y-capturas)
- [Stack Tecnológico](#-stack-tecnológico)
- [Arquitectura](#-arquitectura)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Despliegue](#-despliegue)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Providers y Estado Global](#-providers-y-estado-global)
- [Custom Hooks](#-custom-hooks)
- [Sistema de Manejo de Errores](#-sistema-de-manejo-de-errores)
- [Tipos TypeScript](#-tipos-typescript)
- [Flujo de Trabajo Git](#-flujo-de-trabajo-git)
- [API Integration](#-api-integration)
- [Seguridad](#-seguridad)
- [Solución de Problemas](#-solución-de-problemas)
- [Compatibilidad de Navegadores](#-compatibilidad-de-navegadores)
- [Contribuir](#-contribuir)
- [Documentación Adicional](#-documentación-adicional)
- [Licencia](#-licencia)

---

## ✨ Características

### 🔐 Sistema de Autenticación Completo
- Registro de usuarios con metadata (nombre, teléfono, ubicación, fecha de nacimiento)
- Inicio de sesión con email/contraseña
- Persistencia de sesión automática
- Recuperación de contraseña
- Gestión de perfil de usuario

### 🤖 Análisis AI en Tiempo Real
- Análisis automático de URLs y texto
- Polling asíncrono con actualizaciones de progreso (intervalos de 3s, timeout de 60s)
- Sistema de consenso de tres estados:
  - **AI Only**: Análisis puro de IA
  - **Human Consensus**: Resultados verificados por la comunidad
  - **Conflicted**: Opiniones mixtas que requieren revisión
- Etiquetas de clasificación con explicaciones generadas por IA
- Documentos relacionados vía búsqueda de similitud vectorial
- Resultados de búsqueda web integrados
- Extracción de metadata (tema, región, vectores de transmisión)

### 📊 Interfaz de Usuario Mejorada
- Tooltips en badges de clasificación mostrando explicaciones detalladas
- Badges de estado de consenso con visualización codificada por colores
- Display de metadata de tema y región
- Mensajes de progreso en tiempo real durante el análisis
- Diseño responsive con Tailwind CSS v4

### 🌐 Módulos de la Aplicación

La aplicación cuenta con 9 módulos principales accesibles desde la navegación:

| Módulo | Descripción | Estado |
|--------|-------------|--------|
| **Upload** | Carga y envío de contenido para análisis | ✅ Completo |
| **Review** | Cola de revisión de contenido analizado | ✅ Completo |
| **Analysis** | Visualización detallada de análisis AI | ✅ Completo |
| **Verification** | Flujo de verificación humana comunitaria | ✅ Completo |
| **Immunization** | Estudio de inmunización contra desinformación | 🔄 En desarrollo |
| **Mapa** | Mapa Desinfodémico - visualización geográfica | 🔄 En desarrollo |
| **Docs** | Documentación de indicadores epidemiológicos | ✅ Completo |
| **Profile** | Gestión de perfil de usuario | ✅ Completo |
| **Extension** | Integración con extensión de navegador | 🔄 En desarrollo |

### 🧩 Extensión de Navegador

Componentes preparados para integración con extensión:
- `ExtensionPopup.tsx` - Popup principal de la extensión
- `ExtensionSettings.tsx` - Configuración de la extensión
- `QuickAnalysisBadge.tsx` - Badge de análisis rápido
- `InPageOverlay.tsx` - Overlay para análisis en página

---

## 🎬 Demo y Capturas

### Flujo de Análisis de Contenido

```
Usuario → Ingresa URL/Texto → Submit → Backend procesa →
Polling cada 3s → Muestra progreso → Resultado con consenso
```

### Estados de Consenso

| Estado | Color | Significado |
|--------|-------|-------------|
| 🔵 **AI Only** | Azul | Solo análisis de IA, sin verificación humana |
| 🟢 **Human Consensus** | Verde | Verificado y acordado por la comunidad |
| 🟠 **Conflicted** | Naranja | Opiniones mixtas, requiere más revisión |

---

## 🛠️ Stack Tecnológico

### Frontend
- **React** 18.3.1 - Biblioteca de UI
- **TypeScript** 5.6.2 - Tipado estático
- **Vite** 6.3.5 - Build tool y dev server
- **Tailwind CSS** v4.1.3 - Framework CSS utility-first

### UI Components
- **Radix UI** - Componentes primitivos accesibles
- **shadcn/ui** - Librería de componentes reutilizables
- **Lucide React** - Iconos
- **React Hook Form** - Gestión de formularios
- **Sonner** - Notificaciones toast

### Backend & Auth
- **Supabase** - Autenticación y base de datos
- **Supabase Edge Functions** - Funciones serverless para análisis AI
- **Bearer JWT** - Autenticación de API

### Visualización de Datos
- **Recharts** - Librería de gráficos

### Otras Dependencias Clave
- **Hono** - Web framework (para funciones edge)
- **cmdk** - Command menu
- **embla-carousel-react** - Carruseles
- **vaul** - Drawer/Sheet components
- **react-resizable-panels** - Paneles redimensionables
- **input-otp** - Input para códigos OTP

---

## 🏗️ Arquitectura

### Diagrama de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                   │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Providers │  │  Components │  │    Hooks    │             │
│  │  (Context)  │  │    (UI)     │  │  (Custom)   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│         │                │                │                     │
│         └────────────────┼────────────────┘                     │
│                          ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┤
│  │                    Services Layer                            │
│  │  (aiAnalysis.ts, apiService.ts, contentAnalysisService.ts)  │
│  └─────────────────────────────────────────────────────────────┤
│                          │                                      │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE BACKEND                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │    Auth     │  │  Database   │  │   Edge      │             │
│  │  (JWT)      │  │ (PostgreSQL)│  │  Functions  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                           │                     │
└───────────────────────────────────────────┼─────────────────────┘
                                            │
                                            ▼
                            ┌───────────────────────────┐
                            │    AI Services            │
                            │ (OpenRouter, Gemini, etc) │
                            └───────────────────────────┘
```

### Flujo de Autenticación

```
1. App monta → AuthProvider verifica sesión existente
2. Sin sesión → Muestra Login/Register
3. Usuario se registra → Crea cuenta Supabase → Auto-login
4. Usuario inicia sesión → Autentica → Establece sesión
5. Sesión existe → Muestra app principal
6. Cambio de estado → UI se actualiza automáticamente
7. Usuario cierra sesión → Limpia sesión → Vuelve a login
```

### Flujo de Análisis AI

```
1. Usuario envía contenido (URL o texto)
2. Frontend llama a /submit endpoint
3. Backend acepta job → retorna job_id (202) o resultado cacheado (200)
4. Frontend hace polling cada 3s a /status/:jobId
5. Estados: pending → processing → completed/failed
6. Resultado incluye: análisis AI, documentos relacionados, consenso
7. Frontend muestra resultado con badges de clasificación
```

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (v18.0.0 o superior)
- **npm** (v9.0.0 o superior)
- **Git**
- Una cuenta de **Supabase** (para autenticación y funciones)

---

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone git@github.com:lordalex/botilito-prompt-figma.git
cd botilito-prompt-figma
```

### 2. Instalar Dependencias

```bash
npm install
```

Este comando instalará todas las dependencias necesarias, incluyendo:
- React 18.3.1
- TypeScript 5.6.2
- Vite 6.3.5
- Supabase JS Client
- 50+ componentes de shadcn/ui
- Radix UI primitives
- Tailwind CSS v4

---

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Frontend (Público) - Usa prefijo VITE_ para Vite
VITE_SUPABASE_URL=https://mdkswlgcqsmgfmcuorxq.supabase.co
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key

# Backend (Secreto) - No exponer en frontend
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
SUPABASE_DB_PASSWORD=tu_database_password

# APIs Opcionales
GEMINI_API_KEY=tu_gemini_api_key
OPENROUTER_API_KEY=tu_openrouter_api_key
GOOGLE_API_KEY=tu_google_api_key
NEBIUS_API_KEY=tu_nebius_api_key
```

⚠️ **IMPORTANTE**:
- Este es un proyecto **Vite**, no Next.js. Usa el prefijo `VITE_` para variables de entorno públicas.
- Nunca compartas o subas tu archivo `.env` al repositorio (está en `.gitignore`).
- Obtén tus credenciales de Supabase desde [https://app.supabase.com](https://app.supabase.com).

### Configuración de Supabase

1. **Crear Proyecto en Supabase**
   - Visita [https://app.supabase.com](https://app.supabase.com)
   - Crea un nuevo proyecto
   - Copia las credenciales del proyecto

2. **Configurar Autenticación**
   - Habilita Email/Password authentication en el dashboard
   - Configura Email Templates (opcional)
   - Configura Redirect URLs

3. **Desplegar Edge Functions** (para análisis AI)
   - Las funciones `ingest-async-auth` deben estar desplegadas en tu proyecto Supabase
   - Endpoints:
     - `/functions/v1/ingest-async-auth/submit`
     - `/functions/v1/ingest-async-auth/status/:jobId`

---

## 💻 Uso

### Desarrollo

Inicia el servidor de desarrollo:

```bash
npm run dev
```

- El servidor se ejecutará en `http://localhost:3000` (o `3001` si el puerto 3000 está ocupado)
- Hot Module Replacement (HMR) habilitado
- Abre tu navegador y visita la URL

### Build para Producción

Construye el proyecto para producción:

```bash
npm run build
```

- La salida se generará en el directorio `build/`
- Optimizado y minificado para producción
- Target: ESNext

### Preview de Build

Preview la build de producción localmente:

```bash
npm run preview
```

---

## 🚀 Despliegue

### Opciones de Despliegue

#### Vercel (Recomendado)

1. **Conectar repositorio**
   - Ve a [vercel.com](https://vercel.com)
   - Importa el repositorio de GitHub
   - Selecciona "Vite" como framework preset

2. **Configurar variables de entorno**
   ```
   VITE_SUPABASE_URL=tu_url
   VITE_SUPABASE_ANON_KEY=tu_key
   ```

3. **Desplegar**
   - Vercel detectará automáticamente la configuración de Vite
   - El build se ejecutará con `npm run build`
   - La salida será del directorio `build/`

#### Netlify

1. **Configuración de build**
   - Build command: `npm run build`
   - Publish directory: `build`

2. **Variables de entorno**
   - Configura las mismas variables que en desarrollo

#### Docker

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Construir imagen
docker build -t botilito .

# Ejecutar contenedor
docker run -p 80:80 botilito
```

### Requisitos de Producción

- **Supabase Edge Functions**: Deben estar desplegadas en tu proyecto Supabase
- **HTTPS**: Obligatorio para autenticación segura
- **CORS**: Configurar correctamente en Supabase Dashboard

---

## 📁 Estructura del Proyecto

```
botilito/
├── public/                     # Archivos públicos estáticos
│   ├── form.json              # Configuración de formularios
│   ├── messages.json          # Mensajes de la aplicación
│   └── builder.json           # Configuración del builder
│
├── src/
│   ├── components/            # Componentes React
│   │   ├── ui/                # 70+ componentes shadcn/ui
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── ... (65+ más)
│   │   ├── extension/         # Componentes para extensión de navegador
│   │   │   ├── ExtensionPopup.tsx
│   │   │   ├── ExtensionSettings.tsx
│   │   │   ├── QuickAnalysisBadge.tsx
│   │   │   └── InPageOverlay.tsx
│   │   ├── figma/             # Componentes generados desde Figma
│   │   │   └── ImageWithFallback.tsx
│   │   ├── Login.tsx          # ✅ Autenticación Supabase
│   │   ├── Register.tsx       # ✅ Registro con metadata
│   │   ├── UserProfile.tsx    # Gestión de perfil
│   │   ├── Navigation.tsx     # Navegación principal
│   │   ├── ContentUpload.tsx  # ✅ Smart textarea + análisis AI
│   │   ├── ContentReview.tsx  # Cola de revisión
│   │   ├── ContentAnalysisView.tsx
│   │   ├── HumanVerification.tsx
│   │   ├── HumanVerificationDetail.tsx
│   │   ├── ImmunizationStudio.tsx
│   │   ├── MapaDesinfodemico.tsx
│   │   ├── Historial.tsx      # Historial de análisis
│   │   ├── ErrorManager.tsx   # UI de manejo de errores
│   │   ├── AnalysisResultDisplay.tsx
│   │   ├── ContentUploadProgress.tsx
│   │   ├── DashboardSummaryView.tsx
│   │   ├── CompleteDashboard.tsx
│   │   └── DocumentacionIndicadores.tsx
│   │
│   ├── providers/             # Context Providers (Estado Global)
│   │   ├── Providers.tsx      # Wrapper de todos los providers
│   │   ├── AuthProvider.tsx   # ✅ Autenticación y sesión
│   │   ├── JobTrackerProvider.tsx   # Tracking de jobs
│   │   ├── VoteTrackerProvider.tsx  # Tracking de votos
│   │   ├── ConfigProvider.tsx       # Configuración global
│   │   ├── MessageProvider.tsx      # Sistema de mensajes
│   │   └── SchemaProvider.tsx       # Validación de esquemas
│   │
│   ├── hooks/                 # Custom Hooks
│   │   ├── useJobPoller.ts    # Polling de estado de jobs
│   │   ├── useJobTracker.ts   # Tracking de jobs activos
│   │   └── use-toast.ts       # Sistema de notificaciones
│   │
│   ├── services/              # Capa de servicios
│   │   └── contentAnalysisService.ts
│   │
│   ├── lib/                   # Utilidades compartidas
│   │   ├── utils.ts           # cn() y otras utilidades
│   │   ├── JobManager.ts      # Gestión de jobs
│   │   └── apiService.ts      # Cliente API base
│   │
│   ├── utils/                 # Utilidades específicas
│   │   ├── supabase/
│   │   │   ├── client.ts      # ✅ Cliente Supabase singleton
│   │   │   └── auth.ts        # ✅ Utilidades de autenticación
│   │   ├── errorManager/      # 🛡️ Sistema de manejo de errores
│   │   │   ├── index.ts       # Exportaciones principales
│   │   │   ├── ErrorManager.ts
│   │   │   ├── ErrorCodes.ts
│   │   │   ├── ErrorMessages.ts  # Mensajes en español
│   │   │   ├── CircuitBreaker.ts
│   │   │   ├── RetryStrategy.ts
│   │   │   ├── types.ts
│   │   │   └── README.md
│   │   ├── mapaDesinfodemico/ # Utilidades del mapa
│   │   │   ├── api.ts
│   │   │   ├── transformer.ts
│   │   │   └── types.ts
│   │   ├── humanVerification/ # Utilidades de verificación
│   │   │   ├── api.ts
│   │   │   ├── types.ts
│   │   │   └── useVerificationData.ts
│   │   ├── historial/         # Utilidades de historial
│   │   │   ├── api.ts
│   │   │   ├── types.ts
│   │   │   └── useHistorialData.ts
│   │   ├── voting/            # Sistema de votación
│   │   │   └── api.ts
│   │   ├── aiAnalysis.ts      # ✅ Servicio de análisis AI
│   │   ├── apiService.ts      # Cliente API
│   │   ├── api.ts             # Endpoints base
│   │   ├── formatters.ts      # Formateadores
│   │   └── caseCodeGenerator.ts
│   │
│   ├── types/                 # Definiciones TypeScript
│   │   ├── index.ts           # Exportaciones de tipos
│   │   └── botilito.ts        # ✅ Tipos centralizados
│   │
│   ├── guidelines/            # Guías de diseño y documentación
│   │   ├── Guidelines.md      # Sistema de diseño
│   │   ├── IndicadoresEpidemiologicos.md
│   │   └── SistemaCodificacionCasos.md
│   │
│   ├── assets/                # Imágenes y recursos
│   ├── App.tsx                # ✅ Componente principal
│   ├── main.tsx               # Punto de entrada React
│   └── index.css              # Tailwind CSS + estilos globales
│
├── supabase/                  # Supabase Edge Functions
│   └── functions/
│       └── profile/
│           └── index.ts       # ✅ CRUD de perfiles
│
├── lib/                       # Utilidades de nivel raíz
│   ├── utils.ts
│   └── apiService.ts
│
├── .env                       # Variables de entorno (NO COMMITEAR)
├── .env.example               # Ejemplo de variables (SI COMMITEAR)
├── .gitignore
├── .npmrc                     # Configuración npm (JSR registry)
├── vite.config.ts             # Configuración de Vite
├── package.json               # Dependencias y scripts
├── index.html                 # HTML principal
│
├── README.md                  # Este archivo
├── CONTRIBUTING.md            # Guía de contribución
├── SECURITY.md                # Política de seguridad
├── LICENSE                    # Licencia MIT
├── claude.md                  # Contexto técnico para Claude
├── SUPABASE_AUTH_PROGRESS.md  # Documentación de auth
└── MAPA_DATA_COMPARISON.md    # Comparación de datos del mapa
```

---

## 🔄 Providers y Estado Global

El proyecto usa React Context para manejar estado global a través de providers encadenados:

### Jerarquía de Providers

```tsx
// src/providers/Providers.tsx
<ConfigProvider>
  <AuthProvider>
    <MessageProvider>
      <SchemaProvider>
        <JobTrackerProvider>
          <VoteTrackerProvider>
            {children}
          </VoteTrackerProvider>
        </JobTrackerProvider>
      </SchemaProvider>
    </MessageProvider>
  </AuthProvider>
</ConfigProvider>
```

### Providers Disponibles

| Provider | Hook | Propósito |
|----------|------|-----------|
| **AuthProvider** | `useAuth()` | Manejo de autenticación, sesión y usuario |
| **JobTrackerProvider** | `useJobTracker()` | Tracking de jobs de análisis activos |
| **VoteTrackerProvider** | `useVoteTracker()` | Tracking de votos de verificación |
| **ConfigProvider** | `useConfig()` | Configuración global de la app |
| **MessageProvider** | `useMessage()` | Sistema de mensajes y notificaciones |
| **SchemaProvider** | `useSchema()` | Validación de esquemas de datos |

### Uso de AuthProvider

```typescript
import { useAuth } from '@/providers/AuthProvider';

function MyComponent() {
  const { isAuthenticated, isLoading, user, signOut, supabase } = useAuth();

  if (isLoading) return <Loading />;
  if (!isAuthenticated) return <LoginPrompt />;

  return <div>Hola, {user?.email}</div>;
}
```

---

## 🪝 Custom Hooks

### useJobPoller

Maneja el polling de estado de jobs de análisis:

```typescript
import { useJobPoller } from '@/hooks/useJobPoller';

const { status, result, error, progress } = useJobPoller(jobId, {
  interval: 3000,      // Polling cada 3s
  maxRetries: 60,      // Máximo 60 intentos (3 min)
  onProgress: (p) => console.log(`Progreso: ${p}%`),
  onComplete: (result) => console.log('Completado:', result),
  onError: (error) => console.error('Error:', error)
});
```

### useJobTracker

Tracking de múltiples jobs activos:

```typescript
import { useJobTracker } from '@/hooks/useJobTracker';

const {
  activeJobs,
  addJob,
  removeJob,
  updateJobStatus
} = useJobTracker();
```

### use-toast (Sonner)

Sistema de notificaciones toast:

```typescript
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

// Notificación de éxito
toast({
  title: '¡Análisis completado!',
  description: 'El contenido ha sido analizado exitosamente.',
  variant: 'success'
});

// Notificación de error
toast({
  title: 'Error',
  description: 'No se pudo completar el análisis.',
  variant: 'destructive'
});
```

---

## 🛡️ Sistema de Manejo de Errores

Botilito incluye un robusto sistema de manejo de errores con retry logic, circuit breakers, y mensajes en español.

### Características

- **Códigos de Error Categorizados**: API, Database, Validation, Auth, etc.
- **Retry Automático**: Exponential backoff con jitter
- **Circuit Breakers**: Prevención de cascadas de fallos
- **Mensajes en Español**: Para usuarios colombianos
- **Métricas**: Tracking de errores para monitoreo

### Uso Básico

```typescript
import { ErrorManager, ERROR_CODES } from '@/utils/errorManager';

// Crear un error
const error = ErrorManager.createError({
  code: 'ERR_API_OPENROUTER_TIMEOUT',
  context: { jobId: '123' }
});

// Ejecutar con retry
const result = await ErrorManager.withRetry(
  async () => await callApi(),
  { maxRetries: 3, baseDelay: 1000 }
);

// Ejecutar con circuit breaker
const result = await ErrorManager.withCircuitBreaker(
  'OpenRouter',
  async () => await callOpenRouter()
);
```

### Categorías de Error

| Categoría | Descripción |
|-----------|-------------|
| `CONFIGURATION` | Variables de entorno faltantes |
| `API` | Fallos de APIs externas |
| `DATABASE` | Operaciones de Supabase |
| `TIMEOUT` | Operaciones que exceden tiempo límite |
| `VALIDATION` | Datos de entrada inválidos |
| `AUTHENTICATION` | Problemas de autenticación |
| `RATE_LIMIT` | Límites de API excedidos |

### Circuit Breakers Configurados

| Servicio | Umbral de Fallos | Cooldown |
|----------|------------------|----------|
| OpenRouter | 5/min | 30s |
| Gemini | 5/min | 30s |
| Browserless | 3/min | 20s |
| Supabase | 10/min | 10s |

Para más detalles, ver [src/utils/errorManager/README.md](./src/utils/errorManager/README.md).

---

## 📝 Tipos TypeScript

### Tipos Centralizados

Todos los tipos principales están en `src/types/botilito.ts`:

```typescript
import type {
  IngestPayload,
  AnalysisJob,
  JobAcceptedResponse,
  JobStatusResponse,
  FullAnalysisResponse,
  Consensus,
  ConsensusBreakdown,
  RelatedDocument,
  WebSearchResult,
  DocumentMetadata,
  CaseStudy,
  CaseStudyMetadata
} from '@/types/botilito';
```

### Tipos Principales

```typescript
// Payload para análisis
type IngestPayload = {
  url: string;
  content_hash?: string;
  perform_case_inference?: boolean;
} | {
  text: string;
  vector_de_transmision?: string;
  perform_case_inference?: boolean;
};

// Estados de consenso
type ConsensusState = 'ai_only' | 'human_consensus' | 'conflicted';

// Estados de job
type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

// Vector de transmisión
type TransmissionVector =
  | 'WhatsApp'
  | 'Telegram'
  | 'Facebook'
  | 'Twitter'
  | 'Email'
  | 'Otro';
```

### Respuesta de Análisis Completa

```typescript
interface FullAnalysisResponse {
  id: string;
  user_id: string;
  author_profile?: UserProfileData | null;
  url?: string;
  title: string;
  summary: string;
  created_at: string;
  metadata?: DocumentMetadata;
  case_study?: CaseStudy;
  consensus?: Consensus;
  risk_analysis?: {
    final_risk_score: number;
    risk_level: string;
  };
}
```

---

## 🌿 Flujo de Trabajo Git

### Ramas Principales

```
main                    # Rama principal (producción)
├── login               # Sistema de autenticación (COMPLETADO)
├── ai-analisis         # Análisis AI con Edge Functions (COMPLETADO)
└── resultado-de-analisis  # Rama actual de desarrollo
```

### Commits Recientes

```
c59b8c9 - Implement AI content analysis with Supabase Edge Functions
84d31b8 - Initial commit: Botilito anti-misinformation platform
```

### Workflow de Desarrollo

1. **Crear una nueva rama desde main**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b nombre-de-feature
   ```

2. **Desarrollar y hacer commits**
   ```bash
   git add .
   git commit -m "Descripción del cambio"
   ```

3. **Push a GitHub**
   ```bash
   git push -u origin nombre-de-feature
   ```

4. **Crear Pull Request en GitHub**

---

## 🔌 API Integration

### Autenticación

El proyecto usa **Supabase Auth** con Bearer JWT tokens:

```typescript
// Obtener sesión actual
const { data: { session } } = await supabase.auth.getSession()

// Usar token en llamadas API
const response = await fetch(API_URL, {
  headers: {
    'Authorization': `Bearer ${session.access_token}`
  }
})
```

### Análisis AI - Flujo Asíncrono

El análisis de contenido sigue este flujo:

1. **Enviar contenido** (URL o texto)
   ```typescript
   POST /functions/v1/ingest-async-auth/submit
   Body: { url?: string, text?: string, vector_de_transmision?: string }
   Response: { job_id: string } (202) o FullAnalysisResponse (200 cached)
   ```

2. **Polling de estado** (cada 3 segundos)
   ```typescript
   GET /functions/v1/ingest-async-auth/status/:jobId
   Response: { id, status, result?, error? }
   ```

3. **Recibir resultados**
   ```typescript
   {
     id: string
     title: string
     summary: string
     metadata: {
       theme?: string
       region?: string
       classification_labels?: Record<string, string>
       vectores_de_transmision?: string[]
     }
     case_study?: {
       case_number?: number
       metadata?: {
         ai_labels?: Record<string, string>
         related_documents?: RelatedDocument[]
         web_search_results?: WebSearchResult[]
       }
     }
     consensus?: {
       state: 'ai_only' | 'human_consensus' | 'conflicted'
       final_labels: string[]
       breakdown: Record<string, ConsensusBreakdown> | null
     }
   }
   ```

### Tipos TypeScript

Todas las interfaces están definidas en `src/utils/aiAnalysis.ts`:

```typescript
import {
  analyzeContent,
  TransmissionVector,
  FullAnalysisResponse,
  Consensus,
  RelatedDocument,
  WebSearchResult
} from './utils/aiAnalysis'
```

---

## 🔒 Seguridad

### Buenas Prácticas

- **Variables de Entorno**: Nunca expongas claves secretas en el frontend
- **VITE_ Prefix**: Solo variables con prefijo `VITE_` son accesibles en el cliente
- **Autenticación**: Usa siempre HTTPS y tokens JWT con expiración
- **Validación**: Valida datos en frontend Y backend

### Reportar Vulnerabilidades

Si descubres una vulnerabilidad de seguridad:

1. **NO** abras un issue público
2. Reporta de forma privada a través de GitHub Security Advisories
3. Lee nuestra [Política de Seguridad](./SECURITY.md) para más detalles

---

## 🔧 Solución de Problemas

### Problemas Comunes

#### Error: "No hay sesión activa"

```
Error: No hay sesión activa. Por favor, inicia sesión.
```

**Causa**: Token de autenticación expirado o no válido.

**Solución**:
1. Cierra sesión y vuelve a iniciar sesión
2. Verifica que las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén configuradas
3. Limpia el localStorage del navegador

#### Error: "Module not found: @jsr/supabase__supabase-js"

**Causa**: El paquete JSR no está configurado correctamente.

**Solución**:
1. Verifica que `.npmrc` contenga: `@jsr:registry=https://npm.jsr.io`
2. Ejecuta `npm install` de nuevo
3. Limpia la caché: `npm cache clean --force`

#### El servidor de desarrollo no inicia en puerto 3000

**Causa**: Puerto ocupado por otro proceso.

**Solución**:
- Vite automáticamente usará 3001, 3002, etc.
- Para matar el proceso en el puerto: `npx kill-port 3000`

#### Polling de análisis nunca termina

**Causa**: El job puede haber fallado silenciosamente.

**Solución**:
1. Verifica el estado del job en la consola del navegador
2. El timeout máximo es 3 minutos (60 intentos × 3s)
3. Revisa los logs de Supabase Edge Functions

#### Variables de entorno no se cargan

**Causa**: Prefijo incorrecto o archivo `.env` mal ubicado.

**Solución**:
1. Asegúrate de usar prefijo `VITE_` para variables del frontend
2. El archivo `.env` debe estar en la raíz del proyecto
3. Reinicia el servidor de desarrollo después de cambiar variables

### Comandos de Depuración

```bash
# Ver variables de entorno cargadas (solo VITE_)
console.log(import.meta.env)

# Verificar estado de autenticación
const { data } = await supabase.auth.getSession()
console.log('Session:', data.session)

# Ver estado de circuit breakers
ErrorManager.getCircuitBreakerStatus()

# Ver métricas de errores
ErrorManager.getMetrics()
```

### Logs Útiles

| Ubicación | Qué muestra |
|-----------|-------------|
| Consola del navegador | Errores de frontend, polling |
| Red del navegador (F12) | Llamadas API, respuestas |
| Supabase Dashboard > Edge Functions | Logs de funciones serverless |
| Supabase Dashboard > Auth | Usuarios y sesiones |

---

## 🌐 Compatibilidad de Navegadores

### Navegadores Soportados

| Navegador | Versión Mínima | Estado |
|-----------|----------------|--------|
| Chrome | 90+ | ✅ Completamente soportado |
| Firefox | 88+ | ✅ Completamente soportado |
| Safari | 14+ | ✅ Completamente soportado |
| Edge | 90+ | ✅ Completamente soportado |
| Opera | 76+ | ✅ Completamente soportado |

### Características Requeridas

El proyecto requiere soporte para:
- ES2020+ (async/await, optional chaining, nullish coalescing)
- CSS Grid y Flexbox
- CSS Custom Properties (Variables CSS)
- Fetch API
- LocalStorage/SessionStorage
- Web Crypto API (para hashing)

### Notas de Compatibilidad

- **Internet Explorer**: No soportado
- **Safari < 14**: Pueden haber problemas con algunas animaciones CSS
- **Modo privado/incógnito**: La persistencia de sesión puede ser limitada

### Responsive Design

La aplicación es responsive y funciona en:
- **Desktop**: 1280px+ (experiencia completa)
- **Tablet**: 768px - 1279px (layout adaptado)
- **Mobile**: < 768px (layout vertical, navegación colapsada)

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor lee nuestra [Guía de Contribución](./CONTRIBUTING.md) para más detalles.

### Pasos Rápidos

1. Fork el proyecto
2. Crea una rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Estándares de Código

- Usa TypeScript para todo el código
- Sigue las convenciones de React Hooks
- Usa Tailwind CSS para estilos
- Mantén los componentes pequeños y reutilizables
- Escribe comentarios en español para contexto colombiano
- Mensajes de commit descriptivos en español

### Scripts npm Disponibles

```bash
npm run dev      # Inicia servidor de desarrollo (puerto 3000)
npm run build    # Construye para producción (output: build/)
```

> **Nota**: Este proyecto usa Vite, no Create React App. No hay scripts `lint`, `test`, o `eject` configurados por defecto.

---

## 📚 Documentación Adicional

### Documentación Principal

| Documento | Descripción |
|-----------|-------------|
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Guía completa de contribución |
| [SECURITY.md](./SECURITY.md) | Política de seguridad y reporte de vulnerabilidades |
| [claude.md](./claude.md) | Contexto técnico detallado del proyecto para Claude |
| [LICENSE](./LICENSE) | Licencia MIT del proyecto |

### Documentación Técnica

| Documento | Descripción |
|-----------|-------------|
| [src/guidelines/Guidelines.md](./src/guidelines/Guidelines.md) | Sistema de diseño completo |
| [src/guidelines/IndicadoresEpidemiologicos.md](./src/guidelines/IndicadoresEpidemiologicos.md) | Indicadores epidemiológicos de desinformación |
| [src/guidelines/SistemaCodificacionCasos.md](./src/guidelines/SistemaCodificacionCasos.md) | Sistema de codificación de casos |
| [src/utils/errorManager/README.md](./src/utils/errorManager/README.md) | Documentación del sistema de manejo de errores |

### Documentación de Desarrollo

| Documento | Descripción |
|-----------|-------------|
| [SUPABASE_AUTH_PROGRESS.md](./SUPABASE_AUTH_PROGRESS.md) | Progreso de implementación de autenticación |
| [MAPA_DATA_COMPARISON.md](./MAPA_DATA_COMPARISON.md) | Comparación de datos API vs Mock del mapa |
| [src/Attributions.md](./src/Attributions.md) | Atribuciones y licencias de todas las dependencias |

---

## 🇨🇴 Contexto Colombiano

### Idioma y Localización

- **Idioma principal**: Español colombiano
- **Tono**: Amigable, juvenil, coloquial
- **Expresiones**: "Kiubo", "Pa' dentro", "Parce"

### Departamentos de Colombia

El formulario de registro incluye los 32 departamentos de Colombia:

<details>
<summary>Ver lista completa de departamentos</summary>

Amazonas, Antioquia, Arauca, Atlántico, Bolívar, Boyacá, Caldas, Caquetá, Casanare, Cauca, Cesar, Chocó, Córdoba, Cundinamarca, Guainía, Guaviare, Huila, La Guajira, Magdalena, Meta, Nariño, Norte de Santander, Putumayo, Quindío, Risaralda, San Andrés y Providencia, Santander, Sucre, Tolima, Valle del Cauca, Vaupés, Vichada

</details>

### Mensajes de Error Localizados

Todos los mensajes de error están en español colombiano para mejor UX:

```typescript
// Ejemplo de mensajes
"El análisis está tardando más de lo esperado. Por favor intenta de nuevo."
"No hay sesión activa. Por favor, inicia sesión."
"Parce, hubo un error. Revisa tu conexión."
```

---

## ⚡ Supabase Edge Functions

### Función: Profile (`/functions/v1/profile`)

Maneja operaciones CRUD para perfiles de usuario.

#### Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/profile` | Obtiene perfil del usuario autenticado |
| `GET` | `/profile?id=<uuid>` | Obtiene perfil de un usuario específico |
| `PUT` | `/profile` | Actualiza perfil del usuario autenticado |
| `OPTIONS` | `/profile` | Preflight CORS |

#### Campos Actualizables

```typescript
{
  nombre_completo: string;
  numero_telefono: string;
  departamento: string;
  ciudad: string;
  fecha_nacimiento: string; // ISO date
}
```

#### Ejemplo de Uso

```typescript
// GET - Obtener perfil
const response = await fetch('https://[PROJECT].supabase.co/functions/v1/profile', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// PUT - Actualizar perfil
const response = await fetch('https://[PROJECT].supabase.co/functions/v1/profile', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nombre_completo: 'Juan Pérez',
    departamento: 'Cundinamarca',
    ciudad: 'Bogotá'
  })
});
```

### Función: Ingest Async Auth Enriched

Maneja el análisis de contenido de forma asíncrona.

| Endpoint | Descripción |
|----------|-------------|
| `POST /submit` | Envía contenido para análisis |
| `GET /status/:jobId` | Obtiene estado de un job |

Para más detalles, ver la sección [API Integration](#-api-integration).

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver archivo [LICENSE](./LICENSE) para más detalles.

```
MIT License - Copyright (c) 2025 Botilito - digitalia.gov.co
```

---

## 🙏 Agradecimientos

### Diseño e Iniciativa
- **[digitalia.gov.co](https://digitalia.gov.co)**: Iniciativa colombiana contra la desinformación
- **Figma Design**: [Botilito en Figma](https://www.figma.com/design/dGFLK80lLXxhBIMCbLONd1/Botilito)

### Tecnología
- **[Supabase](https://supabase.com)**: Plataforma backend (Auth, Database, Edge Functions)
- **[shadcn/ui](https://ui.shadcn.com)**: Sistema de componentes UI
- **[Radix UI](https://www.radix-ui.com)**: Primitivos accesibles
- **[Tailwind CSS](https://tailwindcss.com)**: Framework CSS
- **[Vite](https://vitejs.dev)**: Build tool
- **[Lucide](https://lucide.dev)**: Iconos

### Comunidad
- **Verificadores de hechos colombianos**: Por su trabajo incansable
- **Comunidad Open Source**: Por todas las herramientas que hacen esto posible

---

## 📞 Soporte

### Canales de Soporte

| Canal | Uso |
|-------|-----|
| [Issues de GitHub](https://github.com/lordalex/botilito-prompt-figma/issues) | Bugs, feature requests |
| [Documentación](./claude.md) | Contexto técnico |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Guía de contribución |

### Antes de Crear un Issue

1. Busca si ya existe un issue similar
2. Incluye versión de Node.js y navegador
3. Proporciona pasos para reproducir el problema
4. Adjunta logs relevantes de la consola

---

## 📊 Quick Reference

### Comandos Frecuentes

```bash
# Desarrollo
npm run dev              # Iniciar servidor (puerto 3000)
npm run build            # Build de producción

# Git
git checkout -b feature/mi-feature  # Nueva rama
git commit -m "feat: descripción"   # Commit convencional

# Debugging
npx kill-port 3000       # Liberar puerto
npm cache clean --force  # Limpiar caché npm
```

### URLs Importantes

| Recurso | URL |
|---------|-----|
| Repositorio | `github.com/lordalex/botilito-prompt-figma` |
| Supabase Project | `mdkswlgcqsmgfmcuorxq.supabase.co` |
| Edge Functions | `/functions/v1/ingest-async-auth-enriched` |
| Profile API | `/functions/v1/profile` |

### Variables de Entorno Requeridas

```env
VITE_SUPABASE_URL=https://[PROJECT].supabase.co
VITE_SUPABASE_ANON_KEY=[tu_anon_key]
```

---

## 📈 Roadmap

### Completado
- [x] Sistema de autenticación completo
- [x] Análisis AI con polling asíncrono
- [x] Sistema de consenso (AI/Human/Conflicted)
- [x] 70+ componentes UI
- [x] Sistema de manejo de errores

### En Desarrollo
- [ ] Mapa Desinfodémico con datos reales
- [ ] Estudio de Inmunización completo
- [ ] Extensión de navegador funcional

### Planificado
- [ ] Testing suite (Vitest + Testing Library)
- [ ] PWA support
- [ ] Notificaciones push
- [ ] API pública documentada

---

**Hecho con ❤️ para combatir la desinformación en Colombia**

¡Botilito al rescate! 🤖✨

---

<sub>**Última actualización**: 2025-12-16 | **Versión**: 0.1.0</sub>
