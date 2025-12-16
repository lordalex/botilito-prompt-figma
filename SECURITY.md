# Política de Seguridad

## Versiones Soportadas

| Versión | Soportada |
|---------|-----------|
| 1.x.x   | :white_check_mark: |

## Reportar una Vulnerabilidad

La seguridad de Botilito es una prioridad. Si descubres una vulnerabilidad de seguridad, te agradecemos que nos la reportes de manera responsable.

### Cómo Reportar

1. **NO** abras un issue público para vulnerabilidades de seguridad
2. Envía un reporte privado a través de GitHub Security Advisories:
   - Ve a la pestaña "Security" del repositorio
   - Haz clic en "Report a vulnerability"
   - Proporciona los detalles de la vulnerabilidad

### Qué Incluir en el Reporte

- Descripción detallada de la vulnerabilidad
- Pasos para reproducir el problema
- Impacto potencial de la vulnerabilidad
- Posible solución (si tienes una)

### Proceso de Respuesta

1. **Confirmación**: Responderemos dentro de 48 horas confirmando la recepción
2. **Evaluación**: Evaluaremos la vulnerabilidad dentro de 7 días
3. **Resolución**: Trabajaremos en una solución y te mantendremos informado
4. **Divulgación**: Coordinaremos contigo antes de cualquier divulgación pública

## Mejores Prácticas de Seguridad

### Para Desarrolladores

#### Variables de Entorno
- **NUNCA** subas archivos `.env` al repositorio
- Usa `VITE_` solo para variables que pueden ser públicas
- Mantén las claves secretas (`SUPABASE_SERVICE_ROLE_KEY`, etc.) solo en el servidor

```env
# Público (frontend) - Usa prefijo VITE_
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# Secreto (backend) - Sin prefijo, solo servidor
SUPABASE_SERVICE_ROLE_KEY=...
```

#### Autenticación
- Usa tokens JWT con expiración corta
- Implementa refresh tokens de manera segura
- Valida todas las sesiones en el servidor

#### Validación de Datos
- Valida toda entrada del usuario en el frontend Y backend
- Sanitiza datos antes de mostrarlos (prevenir XSS)
- Usa consultas parametrizadas (Supabase lo hace automáticamente)

#### Dependencias
- Mantén las dependencias actualizadas
- Revisa alertas de seguridad de npm
- Ejecuta `npm audit` regularmente

### Para Usuarios

- Usa contraseñas fuertes (mínimo 8 caracteres, combinación de letras, números y símbolos)
- Habilita autenticación de dos factores cuando esté disponible
- No compartas tus credenciales de acceso
- Reporta actividad sospechosa inmediatamente

## Auditorías de Seguridad

Realizamos auditorías de seguridad periódicas que incluyen:

- Revisión de dependencias con vulnerabilidades conocidas
- Análisis de código estático
- Pruebas de penetración (cuando aplica)
- Revisión de configuraciones de Supabase

## Contacto

Para asuntos relacionados con seguridad que no sean vulnerabilidades:
- Abre un [Issue](https://github.com/lordalex/botilito-prompt-figma/issues) etiquetado como "security"

---

Gracias por ayudarnos a mantener Botilito seguro.
