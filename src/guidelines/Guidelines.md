# Botilito - Guía del Sistema de Diseño

Esta guía establece las pautas de diseño y desarrollo para mantener la consistencia visual y funcional de Botilito.

---

## Tabla de Contenidos

- [Identidad Visual](#identidad-visual)
- [Paleta de Colores](#paleta-de-colores)
- [Tipografía](#tipografía)
- [Componentes UI](#componentes-ui)
- [Layouts y Espaciado](#layouts-y-espaciado)
- [Iconografía](#iconografía)
- [Tono y Voz](#tono-y-voz)
- [Accesibilidad](#accesibilidad)

---

## Identidad Visual

### Mascota: Botilito

Botilito es un ex-agente digital de una granja de bots que escapó para unirse al bando de los que luchan contra la desinformación. Su personalidad es:

- **Amigable**: Accesible y cercano
- **Juvenil**: Usa lenguaje coloquial colombiano
- **Comprometido**: Serio contra la desinformación, pero sin perder el humor
- **Educativo**: Explica conceptos de manera sencilla

### Logotipo

- El logo principal combina el nombre "Botilito" con elementos visuales de un robot amigable
- Usar siempre el logo con suficiente espacio de respiro
- Color primario del logo: Amarillo/Dorado (#F59E0B)

---

## Paleta de Colores

### Colores Primarios

| Nombre | Hex | Uso |
|--------|-----|-----|
| **Amarillo Botilito** | `#F59E0B` | Color de marca principal, botones primarios, acentos |
| **Amarillo Claro** | `#FEF3C7` | Fondos de tarjetas destacadas, alertas informativas |
| **Amarillo Oscuro** | `#D97706` | Estados hover, bordes activos |

### Colores Secundarios

| Nombre | Hex | Uso |
|--------|-----|-----|
| **Azul** | `#3B82F6` | Enlaces, información, elementos secundarios |
| **Verde** | `#10B981` | Estados de éxito, verificado, consenso positivo |
| **Rojo** | `#EF4444` | Errores, alertas críticas, desinformación detectada |
| **Naranja** | `#F97316` | Advertencias, conflictos, pendiente de revisión |

### Colores Neutrales

| Nombre | Hex | Uso |
|--------|-----|-----|
| **Gris 900** | `#111827` | Texto principal |
| **Gris 700** | `#374151` | Texto secundario |
| **Gris 500** | `#6B7280` | Texto terciario, placeholders |
| **Gris 300** | `#D1D5DB` | Bordes, divisores |
| **Gris 100** | `#F3F4F6` | Fondos de secciones |
| **Blanco** | `#FFFFFF` | Fondos de tarjetas |

### Colores Semánticos para Análisis

| Estado | Color | Uso |
|--------|-------|-----|
| **AI Only** | Azul (`#3B82F6`) | Análisis puro de IA |
| **Human Consensus** | Verde (`#10B981`) | Verificado por humanos |
| **Conflicted** | Naranja (`#F97316`) | Opiniones mixtas |
| **Desinformación** | Rojo (`#EF4444`) | Contenido falso detectado |
| **Engañoso** | Naranja (`#F97316`) | Contenido parcialmente falso |
| **Verdadero** | Verde (`#10B981`) | Contenido verificado como verdadero |
| **Sátira** | Morado (`#8B5CF6`) | Contenido satírico/humorístico |

---

## Tipografía

### Fuente Principal

- **Familia**: System UI / Inter (cuando esté disponible)
- **Fallback**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

### Escala Tipográfica

| Elemento | Tamaño | Peso | Uso |
|----------|--------|------|-----|
| **H1** | `2.25rem` (36px) | Bold (700) | Títulos de página |
| **H2** | `1.5rem` (24px) | Semibold (600) | Secciones principales |
| **H3** | `1.25rem` (20px) | Semibold (600) | Subsecciones |
| **H4** | `1.125rem` (18px) | Medium (500) | Títulos de tarjetas |
| **Body** | `1rem` (16px) | Normal (400) | Texto principal |
| **Small** | `0.875rem` (14px) | Normal (400) | Texto secundario, labels |
| **Caption** | `0.75rem` (12px) | Normal (400) | Texto terciario, timestamps |

### Line Heights

- **Títulos**: 1.2 - 1.3
- **Cuerpo de texto**: 1.5 - 1.6
- **Texto compacto (UI)**: 1.4

---

## Componentes UI

### Botones

#### Variantes

1. **Primary (Default)**
   - Fondo: Amarillo Botilito
   - Texto: Negro/Blanco según contraste
   - Uso: Acciones principales

2. **Secondary**
   - Fondo: Transparente
   - Borde: Gris 300
   - Texto: Gris 700
   - Uso: Acciones secundarias

3. **Destructive**
   - Fondo: Rojo
   - Texto: Blanco
   - Uso: Acciones destructivas/irreversibles

4. **Ghost**
   - Fondo: Transparente
   - Texto: Gris 700
   - Uso: Acciones terciarias

#### Estados

- **Normal**: Color base
- **Hover**: 10% más oscuro
- **Active**: 20% más oscuro
- **Disabled**: 50% opacidad, cursor no permitido
- **Loading**: Spinner + texto de carga

#### Tamaños

| Tamaño | Padding | Font Size | Uso |
|--------|---------|-----------|-----|
| **sm** | `8px 12px` | 14px | Acciones menores |
| **default** | `12px 16px` | 16px | Uso general |
| **lg** | `16px 24px` | 18px | CTAs principales |

### Tarjetas (Cards)

- **Fondo**: Blanco
- **Borde**: 1px solid Gris 200
- **Border-radius**: 8px (rounded-lg)
- **Sombra**: `shadow-sm` para elevación sutil
- **Padding**: 16px - 24px

### Inputs

- **Altura**: 40px (default)
- **Borde**: 1px solid Gris 300
- **Border-radius**: 6px (rounded-md)
- **Focus**: Borde Amarillo Botilito + ring
- **Error**: Borde Rojo + mensaje de error debajo
- **Disabled**: Fondo Gris 100, texto Gris 500

### Badges

#### Variantes por Consenso

```tsx
// AI Only
<Badge className="bg-blue-100 text-blue-800">AI Only</Badge>

// Human Consensus
<Badge className="bg-green-100 text-green-800">Verificado</Badge>

// Conflicted
<Badge className="bg-orange-100 text-orange-800">En conflicto</Badge>
```

#### Variantes por Clasificación

```tsx
// Desinformación
<Badge variant="destructive">Desinformación</Badge>

// Engañoso
<Badge className="bg-orange-500 text-white">Engañoso</Badge>

// Verdadero
<Badge className="bg-green-500 text-white">Verdadero</Badge>

// Sátira
<Badge className="bg-purple-500 text-white">Sátira</Badge>
```

### Tooltips

- **Fondo**: Gris 900
- **Texto**: Blanco
- **Border-radius**: 4px
- **Padding**: 8px 12px
- **Max-width**: 250px
- **Delay**: 200ms antes de mostrar

### Modals / Dialogs

- **Overlay**: Negro con 50% opacidad
- **Contenedor**: Fondo blanco, rounded-lg
- **Max-width**: 500px (default), 800px (large)
- **Padding**: 24px
- **Close button**: Esquina superior derecha

---

## Layouts y Espaciado

### Sistema de Espaciado

Usamos una escala de 4px base:

| Token | Valor | Uso |
|-------|-------|-----|
| `space-1` | 4px | Espaciado mínimo |
| `space-2` | 8px | Elementos relacionados |
| `space-3` | 12px | Padding interno pequeño |
| `space-4` | 16px | Padding estándar |
| `space-6` | 24px | Separación de secciones |
| `space-8` | 32px | Márgenes de página |
| `space-12` | 48px | Separación de secciones grandes |

### Grid System

- **Container max-width**: 1280px
- **Gutters**: 16px (mobile), 24px (desktop)
- **Columns**: 12 columnas base

### Breakpoints

| Nombre | Valor | Uso |
|--------|-------|-----|
| `sm` | 640px | Móvil landscape |
| `md` | 768px | Tablets |
| `lg` | 1024px | Desktop pequeño |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Desktop grande |

### Layout Patterns

#### Página Principal

```
┌─────────────────────────────────────┐
│           Header / Nav              │
├─────────────────────────────────────┤
│                                     │
│           Content Area              │
│         (Tabs Navigation)           │
│                                     │
├─────────────────────────────────────┤
│            Footer (opt)             │
└─────────────────────────────────────┘
```

#### Tarjeta de Análisis

```
┌─────────────────────────────────────┐
│  Badge    │  Título del Contenido   │
├─────────────────────────────────────┤
│                                     │
│         Resumen / Summary           │
│                                     │
├─────────────────────────────────────┤
│  Etiquetas  │  Metadata  │  Score   │
└─────────────────────────────────────┘
```

---

## Iconografía

### Librería de Iconos

Usamos **Lucide React** para todos los iconos.

### Tamaños

| Tamaño | Dimensiones | Uso |
|--------|-------------|-----|
| **sm** | 16x16 | Inline con texto, badges |
| **default** | 20x20 | Botones, inputs |
| **lg** | 24x24 | Navegación, tarjetas |
| **xl** | 32x32 | Destacados, empty states |

### Iconos Comunes

| Acción | Icono | Nombre Lucide |
|--------|-------|---------------|
| Buscar | 🔍 | `Search` |
| Cargar | ⬆️ | `Upload` |
| Analizar | 🔬 | `ScanSearch` |
| Verificado | ✓ | `Check` / `CheckCircle` |
| Error | ✕ | `X` / `XCircle` |
| Advertencia | ⚠️ | `AlertTriangle` |
| Información | ℹ️ | `Info` |
| Usuario | 👤 | `User` |
| Configuración | ⚙️ | `Settings` |
| Cerrar sesión | 🚪 | `LogOut` |

---

## Tono y Voz

### Principios de Comunicación

1. **Claro y Directo**: Evita jerga técnica innecesaria
2. **Amigable**: Usa un tono conversacional
3. **Colombiano**: Usa expresiones locales cuando sea apropiado
4. **Empoderador**: Ayuda al usuario a entender y actuar

### Ejemplos de Voz de Botilito

#### Saludos
- "¡Kiubo! ¿Qué quieres verificar hoy?"
- "¡Pa' dentro! Vamos a analizar ese contenido"

#### Confirmaciones
- "¡Listo, parce! Tu análisis está en camino"
- "¡Hecho! Ya guardamos tu reporte"

#### Errores
- "Uy, algo salió mal. ¿Intentamos de nuevo?"
- "Parce, hubo un error. Revisa tu conexión"

#### Resultados
- "Este contenido parece sospechoso. Te cuento por qué..."
- "¡Bien hecho! Este contenido fue verificado como verdadero"

### Mensajes del Sistema

| Tipo | Ejemplo |
|------|---------|
| **Cargando** | "Analizando contenido..." |
| **Éxito** | "Análisis completado exitosamente" |
| **Error** | "No pudimos completar el análisis" |
| **Vacío** | "Aún no hay contenido para mostrar" |
| **Confirmación** | "¿Estás seguro de que deseas continuar?" |

---

## Accesibilidad

### Requisitos Mínimos

- **WCAG 2.1 Level AA** como estándar
- Contraste mínimo 4.5:1 para texto normal
- Contraste mínimo 3:1 para texto grande y elementos UI

### Navegación por Teclado

- Todos los elementos interactivos deben ser focusables
- Orden de tabulación lógico
- Focus visible (ring de Tailwind)
- Atajos de teclado para acciones comunes

### Screen Readers

- Usar etiquetas ARIA apropiadas
- Alt text para todas las imágenes
- Labels para todos los inputs
- Anuncios de cambios dinámicos con `aria-live`

### Componentes Accesibles

Usamos **Radix UI** que provee:
- Gestión de focus automática
- Roles ARIA correctos
- Soporte completo de teclado
- Anuncios para screen readers

### Testing de Accesibilidad

- Verificar con extensiones como axe
- Probar navegación solo con teclado
- Probar con screen readers (VoiceOver, NVDA)
- Verificar contrastes de color

---

## Implementación con Tailwind CSS

### Configuración Base

El proyecto usa Tailwind CSS v4 con la siguiente configuración base:

```css
/* Importar en index.css */
@import "tailwindcss";

/* Variables CSS personalizadas para el tema */
:root {
  --color-primary: #F59E0B;
  --color-primary-light: #FEF3C7;
  --color-primary-dark: #D97706;
}
```

### Clases de Utilidad Comunes

```tsx
// Contenedor centrado
<div className="container mx-auto px-4">

// Card estándar
<div className="bg-white rounded-lg border shadow-sm p-6">

// Botón primario
<button className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md">

// Flex con gap
<div className="flex items-center gap-4">

// Grid responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

---

## Recursos Adicionales

- **Figma Design**: [Enlace al archivo de Figma](https://www.figma.com/design/dGFLK80lLXxhBIMCbLONd1/Botilito)
- **shadcn/ui Docs**: [ui.shadcn.com](https://ui.shadcn.com)
- **Radix UI Docs**: [radix-ui.com](https://www.radix-ui.com)
- **Tailwind CSS Docs**: [tailwindcss.com](https://tailwindcss.com)
- **Lucide Icons**: [lucide.dev](https://lucide.dev)

---

**Última actualización**: 2025-12-16
