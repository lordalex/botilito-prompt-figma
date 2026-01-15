// badges.config.ts
// Configuración local de metadatos de insignias para enriquecer los datos de la API

import { Badge } from './types';

// Puedes extender este objeto con todas las insignias oficiales
export const BADGES_METADATA: Record<string, Partial<Badge>> = {
  'Primer Diagnóstico': {
    icon: '/icons/diagnostico.svg',
    tier: 'bronze',
    piReward: 50,
    description: 'Realizaste tu primer diagnóstico en la plataforma.',
    requirement: 'Completa 1 caso.',
  },
  'Explorador AMI': {
    icon: '/icons/explorador.svg',
    tier: 'silver',
    piReward: 100,
    description: 'Exploraste todos los módulos AMI.',
    requirement: 'Accede a cada módulo al menos una vez.',
  },
  'Validador Experto': {
    icon: '/icons/validador.svg',
    tier: 'gold',
    piReward: 200,
    description: 'Validaste 100 casos correctamente.',
    requirement: 'Valida 100 casos.',
  },
  // ...agrega más insignias aquí
};
