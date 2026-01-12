## 1. Mapeo de Conceptos: UI vs. API


| Concepto en UI (Figma) | Propiedad API (JSON) | Descripción |
| :--- | :--- | :--- |
| **Puntos de Inmunización (PI)** | `data.xp` | La moneda principal de gamificación. XP en la DB se renderiza como "PI" en el frontend. |
| **Ranking** | `data.stats.global_ranking` | Posición numérica del usuario frente a todos los demás. |
| **Nivel / Rango** | `data.stats.next_rank_progress.label` | Título actual del usuario (ej. "Cibernauta Centinela"). |
| **Progreso al Siguiente Rango** | `data.stats.next_rank_progress` | Objeto que contiene `current` (PI actuales) y `target` (PI necesarios para subir). |
| **Casos Registrados** | `data.stats.cases_registered` | Contador total de documentos/casos reportados. |
| **Validaciones** | `data.stats.validations_performed` | Contador total de votos realizados. |
| **Racha Actual** | `data.current_streak` | Días consecutivos activos. Se muestra con el ícono de fuego 🔥. |
| **Mejor Racha** | `data.best_streak` | Récord histórico de racha. |
| **Insignias Ganadas** | `data.badges` | Array de strings con los nombres de los logros. Se mapea a iconos en el frontend. |
| **Logros en Progreso** | `challenges_progress` | Lista de retos que el usuario está completando pero aún no finaliza. |

---

## 2. Consumo del Endpoint Principal (`GET /`)

Al cargar la página de perfil, se debe realizar una única petición GET. El backend se encarga de calcular la racha en tiempo real basándose en la fecha actual y la zona horaria de la ciudad del usuario.

### Flujo de Datos
1.  **Llamada**: `GET https://.../functions/v1/profileCRUD` (Header `Authorization: Bearer <TOKEN>`).
2.  **Recepción**: El backend retorna un objeto `{ data: UserProfile, challenges_progress: [...] }`.
3.  **Renderizado**:
    *   **Tarjeta de Perfil (Izquierda)**:
        *   Foto/Avatar: `data.photo` o `data.avatar` (Base64/URL).
        *   Nombre: `data.nombre_completo`.
        *   Rango: `data.stats.next_rank_progress.label`.
        *   Barra de Progreso: Calcular porcentaje visual = `(xp / target) * 100`.
    *   **Tarjeta de PI (Derecha)**:
        *   Número Grande: `data.xp`.
        *   Ranking Subtexto: `#` + `data.stats.global_ranking` + ` / ` + `data.stats.total_users`.
    *   **Estadísticas Centrales**:
        *   Casos: `data.stats.cases_registered`.
        *   Validaciones: `data.stats.validations_performed`.
        *   Racha: `data.current_streak`.
    *   **Sección de Racha (Naranja)**:
        *   "Llevas X días": `data.current_streak`.
        *   "Mejor racha": `data.best_streak`.
    *   **Sección de Logros**:
        *   Iterar sobre `challenges_progress`.
        *   Si `completed === true`: Mover a la lista "Últimas Insignias Ganadas".
        *   Si `completed === false`: Renderizar en "Logros en Progreso" usando `percent` para la barra amarilla.

---

## 3. Tipos de Datos (TypeScript Interfaces)

Para asegurar la integridad de los datos en el frontend, utilice estas definiciones basadas en la respuesta de la API.

### Modelo del Perfil (`UserProfile`)
Este es el objeto principal dentro de la propiedad `data` de la respuesta.

```typescript
interface UserProfile {
  id: string;               // UUID
  email: string;
  nombre_completo: string;  // "María Rodríguez"
  ciudad: string;           // Usado para cálculo de hora local de racha
  photo?: string;           // Base64 o URL
  
  // Gamificación
  xp: number;               // PI (Puntos de Inmunización)
  current_streak: number;   // Racha Actual
  best_streak: number;      // Mejor Racha Histórica
  badges: string[];         // ["Primer Diagnóstico", "Explorador AMI", ...]
  
  // Estadísticas Calculadas
  stats: {
    cases_registered: number;      // "127"
    validations_performed: number; // "18"
    global_ranking: number;        // "156"
    total_users: number;           // "5,432"
    next_rank_progress: {
      current: number;      // 2350
      target: number;       // 2500
      label: string;        // "Cibernauta Centinela"
    };
  };
}
```

### Modelo de Progreso de Retos (`ChallengeProgress`)
Este objeto se encuentra en el array `challenges_progress` de la respuesta raíz.

```typescript
interface ChallengeProgress {
  id: string;
  title: string;          // "Maestro Multimedia"
  description: string;    // "Analiza al menos un caso de cada tipo..."
  badge_name: string;     // Nombre interno de la insignia asociada
  completed: boolean;     // true = Ganada, false = En progreso
  percent: number;        // 0-100 (Para la barra de progreso visual)
  reward_display: string; // "+150 PI"
}
```

