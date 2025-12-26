# 🤖 Botilito

**Plataforma Anti-Desinformación con Análisis AI**

Botilito es un ex-agente digital de una granja de bots que escapó para unirse al bando de los que luchan contra la desinformación desde digitalia.gov.co. Esta plataforma combina análisis impulsado por IA con verificación humana comunitaria para combatir la desinformación en Colombia.

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-purple.svg)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20Functions-green.svg)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4.1.3-38B2AC.svg)](https://tailwindcss.com/)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Stack Tecnológico](#-stack-tecnológico)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Flujo de Trabajo Git](#-flujo-de-trabajo-git)
- [API Integration](#-api-integration)
- [Contribuir](#-contribuir)
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

### 🌐 Características Adicionales (En Desarrollo)
- Sistema de revisión de contenido
- Flujo de trabajo de verificación humana
- Estudio de inmunización contra desinformación
- Mapa de desinformación (Mapa Desinfodémico)
- Integración con extensión de navegador

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

## 📁 Estructura del Proyecto

```
botilito/
├── src/
│   ├── components/
│   │   ├── ui/              # 50+ componentes shadcn/ui
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── ... (45+ más)
│   │   ├── extension/       # Componentes de extensión de navegador
│   │   ├── figma/           # Componentes generados por Figma
│   │   ├── Login.tsx        # ✅ Auth con Supabase
│   │   ├── Register.tsx     # ✅ Auth con Supabase
│   │   ├── UserProfile.tsx
│   │   ├── Navigation.tsx
│   │   ├── ContentUpload.tsx        # ✅ Análisis AI integrado
│   │   ├── ContentReview.tsx
│   │   ├── ContentAnalysisView.tsx
│   │   ├── HumanVerification.tsx
│   │   ├── ImmunizationStudio.tsx
│   │   └── MapaDesinfodemico.tsx
│   ├── utils/
│   │   ├── supabase/
│   │   │   ├── client.ts    # ✅ Cliente Supabase singleton
│   │   │   ├── auth.ts      # ✅ Utilidades de autenticación
│   │   │   └── info.tsx     # Config autogenerada de Supabase
│   │   ├── aiAnalysis.ts    # ✅ Capa de servicio de análisis AI
│   │   └── caseCodeGenerator.ts
│   ├── assets/              # Imágenes y media
│   ├── styles/              # Definiciones de estilos
│   ├── App.tsx             # ✅ App principal con gestión de sesión
│   ├── main.tsx            # Punto de entrada de React
│   └── index.css           # Tailwind CSS
├── .env                     # ✅ Variables de entorno (VITE_ prefix)
├── .gitignore              # ✅ Excluye .env, node_modules, etc.
├── vite.config.ts          # Configuración de Vite
├── package.json            # Dependencias y scripts
├── CLAUDE.md               # ✅ Documentación detallada del proyecto
└── README.md               # Este archivo
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

### Convenciones de Nombres de Ramas

Usamos prefijos estándar para identificar el tipo de trabajo:

| Prefijo | Significado | Uso |
|---------|-------------|-----|
| `feat/` | **Feature** | Nueva funcionalidad |
| `fix/` | **Fix** | Corrección de bugs |
| `hotfix/` | **Hotfix** | Correcciones urgentes en producción |
| `refactor/` | **Refactor** | Reestructuración de código sin cambiar comportamiento |
| `docs/` | **Docs** | Cambios en documentación |
| `test/` | **Test** | Agregar o actualizar tests |
| `chore/` | **Chore** | Tareas de mantenimiento (dependencias, configs) |

**Formato obligatorio:**
```
<tipo>/<numero-issue>/<descripcion-corta>
```

### Reglas Estrictas

| Regla | ✅ Correcto | ❌ Incorrecto |
|-------|-------------|---------------|
| **Minúsculas siempre** | `fix/123/audio` | `Fix/123/audio` |
| **Usar `feat/` no `feature/`** | `feat/45/login` | `feature/45/login` |
| **Guiones, no underscores** | `fix/12/image-results` | `fix/12/image_results` |
| **Inglés para código** | `feat/8/audio-analysis` | `feat/8/analisis-audio` |
| **Incluir número de issue** | `fix/99/button-color` | `fix/button-color` |
| **Descripciones cortas (2-4 palabras)** | `feat/5/user-avatar` | `feat/5/add-new-user-avatar-upload-feature` |

### Ejemplos Correctos

```bash
feat/123/audio-analysis         # Nueva feature de análisis de audio
feat/57/translate-errors        # Feature para issue #57
fix/89/image-results            # Corrección en resultados de análisis
hotfix/101/auth-crash           # Fix urgente en producción
docs/15/api-endpoints           # Documentación de endpoints
refactor/42/clean-utils         # Refactor de utilidades
chore/33/update-deps            # Actualizar dependencias
```

### Crear una Nueva Rama

```bash
# Siempre desde main actualizado
git checkout main
git pull origin main

# Crear rama con formato correcto
git checkout -b feat/123/my-feature-name
```

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

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor sigue estos pasos:

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

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver archivo `LICENSE` para más detalles.

---

## 🙏 Agradecimientos

- **Figma Design**: [https://www.figma.com/design/dGFLK80lLXxhBIMCbLONd1/Botilito](https://www.figma.com/design/dGFLK80lLXxhBIMCbLONd1/Botilito)
- **digitalia.gov.co**: Iniciativa contra la desinformación
- **Supabase**: Plataforma backend
- **shadcn/ui**: Sistema de componentes
- **Radix UI**: Componentes primitivos accesibles

---

## 📞 Soporte

Para preguntas o problemas:
- Abre un [Issue](https://github.com/lordalex/botilito-prompt-figma/issues) en GitHub
- Consulta la documentación en `CLAUDE.md`

---

**Hecho con ❤️ para combatir la desinformación en Colombia**

¡Botilito al rescate! 🤖✨
