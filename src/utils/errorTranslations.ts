/**
 * Traducciones de códigos de error del backend al español
 * Centraliza todos los mensajes de error para mantener consistencia
 */

interface ErrorTranslations {
  [key: string]: string;
}

export const errorTranslations: ErrorTranslations = {
  // Auth errors
  'invalid_credentials': 'Credenciales inválidas. Verifica tu correo y contraseña.',
};

/**
 * Mensajes de error por defecto cuando no hay traducción específica
 */
export const defaultErrorMessages = {
  auth: 'Error al iniciar sesión. Por favor, verifica tus credenciales.',
  network: 'Error de conexión. Verifica tu conexión a internet.',
  unknown: 'Ocurrió un error inesperado. Por favor, intenta de nuevo.',
};
