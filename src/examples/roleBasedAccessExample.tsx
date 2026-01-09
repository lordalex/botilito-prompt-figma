/**
 * @file src/examples/roleBasedAccessExample.tsx
 * @description Ejemplos de uso del sistema de control de acceso por roles
 */

import { hasFeatureAccess, hasMinimumRole, getRoleDisplayName, UserRole, RestrictedFeature } from '@/constants';

/**
 * Ejemplo 1: Verificar acceso a una funcionalidad específica
 */
export function ExampleFeatureAccess({ userRole }: { userRole: string | undefined }) {
  const canVerify = hasFeatureAccess(userRole, RestrictedFeature.HUMAN_VERIFICATION);
  
  return (
    <div>
      {canVerify ? (
        <button>Ir a Validación Humana</button>
      ) : (
        <p>No tienes acceso a esta funcionalidad</p>
      )}
    </div>
  );
}

/**
 * Ejemplo 2: Verificar nivel mínimo de rol
 */
export function ExampleMinimumRole({ userRole }: { userRole: string | undefined }) {
  const isEpidemiologoOrHigher = hasMinimumRole(userRole, UserRole.EPIDEMIOLOGO);
  
  return (
    <div>
      {isEpidemiologoOrHigher ? (
        <div className="advanced-features">
          <p>Acceso a funcionalidades avanzadas</p>
        </div>
      ) : (
        <div className="basic-features">
          <p>Funcionalidades básicas</p>
        </div>
      )}
    </div>
  );
}

/**
 * Ejemplo 3: Mostrar nombre legible del rol
 */
export function ExampleDisplayName({ userRole }: { userRole: string | undefined }) {
  const displayName = getRoleDisplayName(userRole);
  
  return (
    <div className="user-badge">
      <span>Rol: {displayName}</span>
    </div>
  );
}

/**
 * Ejemplo 4: Filtrar lista de acciones según rol
 */
export function ExampleActionFiltering({ userRole }: { userRole: string | undefined }) {
  const actions = [
    { id: 'view', label: 'Ver casos' },
    { 
      id: 'verify', 
      label: 'Validar casos',
      requiredFeature: RestrictedFeature.HUMAN_VERIFICATION 
    },
    { 
      id: 'admin', 
      label: 'Administrar',
      requiredFeature: RestrictedFeature.ADMIN_DASHBOARD 
    },
  ];

  const availableActions = actions.filter(action => {
    if (!action.requiredFeature) return true;
    return hasFeatureAccess(userRole, action.requiredFeature);
  });

  return (
    <div className="actions-menu">
      {availableActions.map(action => (
        <button key={action.id}>{action.label}</button>
      ))}
    </div>
  );
}

/**
 * Ejemplo 5: Componente condicional por rol
 */
export function ExampleConditionalComponent({ userRole }: { userRole: string | undefined }) {
  // Solo renderizar si es director
  if (!hasMinimumRole(userRole, UserRole.DIRECTOR)) {
    return null;
  }

  return (
    <div className="admin-panel">
      <h2>Panel de Administración</h2>
      <p>Solo visible para directores</p>
    </div>
  );
}
