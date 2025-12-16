# Guía de Contribución

Gracias por tu interés en contribuir a **Botilito**. Este documento proporciona las pautas y mejores prácticas para contribuir al proyecto.

---

## Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Cómo Contribuir](#cómo-contribuir)
- [Configuración del Entorno de Desarrollo](#configuración-del-entorno-de-desarrollo)
- [Estándares de Código](#estándares-de-código)
- [Proceso de Pull Request](#proceso-de-pull-request)
- [Reporte de Bugs](#reporte-de-bugs)
- [Solicitud de Características](#solicitud-de-características)

---

## Código de Conducta

Este proyecto se adhiere a un código de conducta que todos los contribuyentes deben seguir:

- **Sé respetuoso**: Trata a todos los miembros de la comunidad con respeto
- **Sé inclusivo**: Acepta críticas constructivas y diferentes puntos de vista
- **Sé colaborativo**: Trabaja junto con otros para lograr los objetivos del proyecto
- **Sé profesional**: Mantén un ambiente profesional y libre de acoso

---

## Cómo Contribuir

### 1. Fork del Repositorio

```bash
# Clona tu fork
git clone git@github.com:TU_USUARIO/botilito-prompt-figma.git
cd botilito-prompt-figma

# Añade el upstream
git remote add upstream git@github.com:lordalex/botilito-prompt-figma.git
```

### 2. Crea una Rama

```bash
# Actualiza main
git checkout main
git pull upstream main

# Crea tu rama de feature
git checkout -b feature/nombre-de-tu-feature
```

### 3. Nomenclatura de Ramas

Usa las siguientes convenciones para nombres de ramas:

| Prefijo | Uso | Ejemplo |
|---------|-----|---------|
| `feature/` | Nueva funcionalidad | `feature/filtro-busqueda` |
| `fix/` | Corrección de bugs | `fix/login-error` |
| `docs/` | Documentación | `docs/actualizar-readme` |
| `refactor/` | Refactorización | `refactor/optimizar-queries` |
| `test/` | Pruebas | `test/auth-unit-tests` |

---

## Configuración del Entorno de Desarrollo

### Requisitos

- Node.js v18.0.0 o superior
- npm v9.0.0 o superior
- Git

### Instalación

```bash
# Instala dependencias
npm install

# Copia el archivo de variables de entorno
cp .env.example .env

# Configura tus variables de entorno
# Edita .env con tus credenciales de Supabase
```

### Ejecutar en Desarrollo

```bash
# Inicia el servidor de desarrollo
npm run dev

# El servidor estará disponible en http://localhost:3000
```

### Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Construye para producción |
| `npm run preview` | Vista previa de la build |
| `npm run lint` | Ejecuta el linter |

---

## Estándares de Código

### TypeScript

- **Usa TypeScript** para todo el código nuevo
- **Define tipos** para props, estados y funciones
- **Evita `any`**: Usa tipos específicos siempre que sea posible

```typescript
// Bien
interface UserProps {
  name: string;
  email: string;
  age?: number;
}

// Evitar
const user: any = { ... };
```

### React

- **Componentes funcionales**: Usa componentes funcionales con hooks
- **Hooks personalizados**: Extrae lógica reutilizable en hooks
- **Props destructuradas**: Destructura props en los parámetros

```typescript
// Bien
export function UserCard({ name, email }: UserProps) {
  const [isLoading, setIsLoading] = useState(false);
  // ...
}

// Evitar
export function UserCard(props: UserProps) {
  // ...
}
```

### Estilos con Tailwind CSS

- **Usa clases de Tailwind** en lugar de CSS personalizado
- **Agrupa clases relacionadas** para legibilidad
- **Usa cn()** de `lib/utils` para clases condicionales

```tsx
// Bien
<div className={cn(
  "flex items-center gap-2 p-4",
  "rounded-lg border",
  isActive && "bg-primary text-white"
)}>

// Evitar
<div style={{ display: 'flex', padding: '16px' }}>
```

### Componentes UI

- **Usa shadcn/ui** para componentes de interfaz
- **Sigue el patrón de composición** de Radix UI
- **Accesibilidad**: Asegura que los componentes sean accesibles

### Idioma

- **Código**: Variables, funciones y comentarios técnicos en inglés
- **UI**: Textos de interfaz en español (colombiano)
- **Commits**: Mensajes en español
- **Documentación**: En español

---

## Proceso de Pull Request

### 1. Antes de Crear el PR

- [ ] Asegura que tu código compile sin errores (`npm run build`)
- [ ] Verifica que no haya warnings del linter
- [ ] Prueba manualmente tu implementación
- [ ] Actualiza la documentación si es necesario

### 2. Crear el Pull Request

1. Push tu rama a tu fork:
   ```bash
   git push origin feature/tu-feature
   ```

2. Ve a GitHub y crea un Pull Request

3. Usa la siguiente plantilla:

```markdown
## Descripción
[Describe brevemente qué hace este PR]

## Tipo de Cambio
- [ ] Nueva funcionalidad
- [ ] Corrección de bug
- [ ] Refactorización
- [ ] Documentación
- [ ] Otro (especifica)

## ¿Cómo se probó?
[Describe cómo probaste los cambios]

## Capturas de Pantalla (si aplica)
[Agrega capturas si hay cambios visuales]

## Checklist
- [ ] Mi código sigue los estándares del proyecto
- [ ] He actualizado la documentación
- [ ] He probado mi implementación
```

### 3. Revisión de Código

- Un mantenedor revisará tu PR
- Responde a los comentarios y realiza los cambios necesarios
- Una vez aprobado, el PR será fusionado

---

## Reporte de Bugs

### Antes de Reportar

1. **Busca issues existentes**: Verifica que el bug no haya sido reportado
2. **Reproduce el bug**: Asegúrate de poder reproducirlo consistentemente

### Plantilla de Bug Report

```markdown
## Descripción del Bug
[Describe el bug de manera clara]

## Pasos para Reproducir
1. Ve a '...'
2. Haz clic en '...'
3. Observa el error

## Comportamiento Esperado
[Qué debería pasar]

## Comportamiento Actual
[Qué está pasando]

## Capturas de Pantalla
[Si aplica]

## Entorno
- Navegador: [ej. Chrome 120]
- Sistema Operativo: [ej. Windows 11]
- Versión de Node: [ej. 20.10.0]
```

---

## Solicitud de Características

### Plantilla de Feature Request

```markdown
## Problema o Necesidad
[Describe el problema que esta característica resolvería]

## Solución Propuesta
[Describe cómo imaginas la solución]

## Alternativas Consideradas
[¿Has considerado otras soluciones?]

## Contexto Adicional
[Cualquier información adicional]
```

---

## Estructura del Proyecto

```
botilito/
├── src/
│   ├── components/      # Componentes React
│   │   ├── ui/          # Componentes shadcn/ui
│   │   └── ...          # Componentes de la aplicación
│   ├── utils/           # Utilidades y helpers
│   ├── hooks/           # Hooks personalizados
│   ├── providers/       # Context providers
│   ├── types/           # Definiciones de tipos
│   └── assets/          # Recursos estáticos
├── public/              # Archivos públicos
├── supabase/           # Edge functions
└── docs/               # Documentación adicional
```

---

## Contacto

Si tienes preguntas sobre cómo contribuir:

- Abre un [Issue](https://github.com/lordalex/botilito-prompt-figma/issues) en GitHub
- Consulta la documentación en `claude.md`

---

**¡Gracias por contribuir a Botilito!**

Juntos podemos combatir la desinformación en Colombia.
