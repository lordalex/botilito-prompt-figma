import { useCallback } from 'react';
import { errorTranslations, defaultErrorMessages } from '../utils/errorTranslations';

/**
 * Custom hook para traducir errores del backend al español
 *
 * @example
 * const translateError = useErrorTranslation();
 * const errorMessage = translateError(error);
 */
export const useErrorTranslation = () => {
  const translateError = useCallback((error: any, fallbackType: 'auth' | 'network' | 'unknown' = 'unknown'): string => {
    // Si el error es null o undefined
    if (!error) {
      return defaultErrorMessages.unknown;
    }

    // Si el error es un string simple
    if (typeof error === 'string') {
      return error;
    }

    // Si el error tiene un código específico (estructura del backend)
    if (error.code && errorTranslations[error.code]) {
      return errorTranslations[error.code];
    }

    // Fallback al mensaje por defecto según el tipo
    return defaultErrorMessages[fallbackType];
  }, []);

  return translateError;
};
