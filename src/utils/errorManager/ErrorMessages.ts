/**
 * Error Messages
 * User-friendly error messages in Spanish for Colombian users
 */

/**
 * Error message definition
 */
export interface ErrorMessageDefinition {
  // User-facing message in Spanish (Colombian variant)
  userMessage: string;
  // Technical message for logs/debugging
  technicalMessage: string;
  // Suggested action for the user
  userAction?: string;
}

/**
 * Error messages dictionary
 * Mapped to error codes from ErrorCodes.ts
 */
export const ERROR_MESSAGES: Record<string, ErrorMessageDefinition> = {
  // ============================================================
  // CONFIGURATION ERRORS
  // ============================================================
  ERR_CONFIG_MISSING_SUPABASE_URL: {
    userMessage: 'Estamos presentando problemas técnicos. Por favor intenta más tarde.',
    technicalMessage: 'SUPABASE_URL environment variable is not set',
    userAction: 'Contacta al equipo de soporte si el problema persiste.',
  },
  ERR_CONFIG_MISSING_SERVICE_KEY: {
    userMessage: 'Estamos presentando problemas técnicos. Por favor intenta más tarde.',
    technicalMessage: 'SUPABASE_SERVICE_ROLE_KEY environment variable is not set',
    userAction: 'Contacta al equipo de soporte si el problema persiste.',
  },
  ERR_CONFIG_MISSING_OPENROUTER_KEY: {
    userMessage: 'El servicio de análisis no está disponible temporalmente.',
    technicalMessage: 'OPENROUTER_API_KEY environment variable is not set',
    userAction: 'Por favor intenta de nuevo en unos minutos.',
  },
  ERR_CONFIG_MISSING_GEMINI_KEY: {
    userMessage: 'El servicio de búsqueda no está disponible temporalmente.',
    technicalMessage: 'API_GEMINI_API_KEY environment variable is not set',
    userAction: 'Por favor intenta de nuevo en unos minutos.',
  },
  ERR_CONFIG_MISSING_BROWSERLESS_KEY: {
    userMessage: 'No podemos procesar URLs en este momento. Intenta con texto directo.',
    technicalMessage: 'BROWSERLESS_API_KEY environment variable is not set',
    userAction: 'Puedes copiar y pegar el texto del contenido en lugar de la URL.',
  },
  ERR_CONFIG_INVALID_AI_CONFIG: {
    userMessage: 'La configuración del sistema está incompleta. Contacta a soporte.',
    technicalMessage: 'AI configuration file is invalid or cannot be loaded',
    userAction: 'Contacta al equipo de Botilito para resolver este problema.',
  },

  // ============================================================
  // API ERRORS - OpenRouter
  // ============================================================
  ERR_API_OPENROUTER_TIMEOUT: {
    userMessage: 'El análisis está tardando más de lo esperado. Por favor intenta de nuevo.',
    technicalMessage: 'OpenRouter API request timed out',
    userAction: 'Intenta nuevamente. Si el problema persiste, verifica tu conexión.',
  },
  ERR_API_OPENROUTER_RATE_LIMIT: {
    userMessage: 'Hemos recibido muchas solicitudes. Por favor espera un momento e intenta de nuevo.',
    technicalMessage: 'OpenRouter API rate limit exceeded',
    userAction: 'Espera unos segundos antes de intentar de nuevo.',
  },
  ERR_API_OPENROUTER_AUTH: {
    userMessage: 'Error de autenticación con el servicio de análisis. Contacta a soporte.',
    technicalMessage: 'OpenRouter API authentication failed',
    userAction: 'Este es un problema del sistema. Contacta al equipo de Botilito.',
  },
  ERR_API_OPENROUTER_INVALID_RESPONSE: {
    userMessage: 'Recibimos una respuesta inválida del servicio de análisis. Reintentando...',
    technicalMessage: 'OpenRouter API returned invalid response format',
    userAction: 'El sistema reintentará automáticamente. Por favor espera.',
  },
  ERR_API_OPENROUTER_NO_CONTENT: {
    userMessage: 'El análisis no generó resultados. Reintentando...',
    technicalMessage: 'OpenRouter API response contained no content',
    userAction: 'El sistema reintentará automáticamente.',
  },

  // ============================================================
  // API ERRORS - Google Gemini
  // ============================================================
  ERR_API_GEMINI_TIMEOUT: {
    userMessage: 'La búsqueda de contenido relacionado está tardando. Reintentando...',
    technicalMessage: 'Google Gemini API request timed out',
    userAction: 'El análisis continuará, pero puede tardar un poco más.',
  },
  ERR_API_GEMINI_RATE_LIMIT: {
    userMessage: 'Límite de búsquedas alcanzado. Esperando para continuar...',
    technicalMessage: 'Google Gemini API rate limit exceeded',
    userAction: 'El sistema reintentará automáticamente.',
  },
  ERR_API_GEMINI_INVALID_EMBEDDING: {
    userMessage: 'No pudimos generar el perfil del contenido. Reintentando...',
    technicalMessage: 'Google Gemini API returned invalid embedding',
    userAction: 'El sistema reintentará automáticamente.',
  },

  // ============================================================
  // API ERRORS - Browserless
  // ============================================================
  ERR_API_BROWSERLESS_TIMEOUT: {
    userMessage: 'La página web está tardando mucho en cargar. Reintentando...',
    technicalMessage: 'Browserless API request timed out',
    userAction: 'Verificaremos si la URL está disponible.',
  },
  ERR_API_BROWSERLESS_FETCH_FAILED: {
    userMessage: 'No pudimos acceder a la URL proporcionada. Verifica que esté correcta.',
    technicalMessage: 'Browserless failed to fetch URL content',
    userAction: 'Verifica que la URL sea válida y esté accesible públicamente.',
  },
  ERR_API_BROWSERLESS_INVALID_URL: {
    userMessage: 'La URL proporcionada no es válida. Por favor verifica e intenta de nuevo.',
    technicalMessage: 'Invalid URL format provided to Browserless',
    userAction: 'Asegúrate de incluir http:// o https:// en la URL.',
  },

  // ============================================================
  // DATABASE ERRORS
  // ============================================================
  ERR_DB_CONNECTION: {
    userMessage: 'Problema conectando con la base de datos. Reintentando...',
    technicalMessage: 'Failed to establish database connection',
    userAction: 'El sistema reintentará automáticamente.',
  },
  ERR_DB_QUERY_FAILED: {
    userMessage: 'Error consultando los datos. Reintentando...',
    technicalMessage: 'Database query execution failed',
    userAction: 'El sistema reintentará automáticamente.',
  },
  ERR_DB_INSERT_FAILED: {
    userMessage: 'Error guardando los resultados. Reintentando...',
    technicalMessage: 'Database insert operation failed',
    userAction: 'El sistema reintentará automáticamente.',
  },
  ERR_DB_UPDATE_FAILED: {
    userMessage: 'Error actualizando el progreso. Continuando de todas formas...',
    technicalMessage: 'Database update operation failed',
    userAction: 'El análisis continuará normalmente.',
  },
  ERR_DB_JOB_NOT_FOUND: {
    userMessage: 'No encontramos el trabajo solicitado. Puede que haya expirado.',
    technicalMessage: 'Job ID not found in database',
    userAction: 'Verifica el ID del trabajo o inicia un nuevo análisis.',
  },
  ERR_DB_RPC_FAILED: {
    userMessage: 'Error ejecutando búsqueda en la base de datos. Reintentando...',
    technicalMessage: 'Database RPC function call failed',
    userAction: 'El sistema reintentará automáticamente.',
  },

  // ============================================================
  // TIMEOUT ERRORS
  // ============================================================
  ERR_TIMEOUT_JOB: {
    userMessage: 'El análisis excedió el tiempo máximo permitido. Por favor intenta con un contenido más corto.',
    technicalMessage: 'Job processing exceeded maximum timeout',
    userAction: 'Intenta dividir el contenido en partes más pequeñas.',
  },
  ERR_TIMEOUT_STALE_JOB: {
    userMessage: 'Este análisis estuvo en espera demasiado tiempo y fue cancelado.',
    technicalMessage: 'Job was in processing state for too long and was marked as stale',
    userAction: 'Inicia un nuevo análisis si aún lo necesitas.',
  },
  ERR_TIMEOUT_OPERATION: {
    userMessage: 'Una operación tardó demasiado. Reintentando...',
    technicalMessage: 'Operation exceeded timeout threshold',
    userAction: 'El sistema reintentará automáticamente.',
  },

  // ============================================================
  // VALIDATION ERRORS
  // ============================================================
  ERR_VALIDATION_MISSING_URL_OR_TEXT: {
    userMessage: 'Debes proporcionar una URL o texto para analizar.',
    technicalMessage: 'Request body missing both url and text fields',
    userAction: 'Ingresa una URL o pega el texto del contenido a analizar.',
  },
  ERR_VALIDATION_TEXT_TOO_LONG: {
    userMessage: 'El texto es demasiado largo. El máximo permitido es 50,000 caracteres.',
    technicalMessage: 'Text submission exceeds maximum length limit',
    userAction: 'Reduce el tamaño del texto o divídelo en partes más pequeñas.',
  },
  ERR_VALIDATION_INVALID_VECTOR: {
    userMessage: 'El vector de transmisión no es válido. Usa: WhatsApp, Telegram, Facebook, Twitter, Email u Otro.',
    technicalMessage: 'Invalid transmission vector provided',
    userAction: 'Selecciona un vector de transmisión válido del menú.',
  },

  // ============================================================
  // PARSING ERRORS
  // ============================================================
  ERR_PARSING_JSON: {
    userMessage: 'Error procesando la respuesta del sistema. Reintentando...',
    technicalMessage: 'Failed to parse JSON data',
    userAction: 'El sistema reintentará automáticamente.',
  },
  ERR_PARSING_LLM_RESPONSE: {
    userMessage: 'La respuesta de la IA no tiene el formato esperado. Reintentando...',
    technicalMessage: 'Failed to parse LLM response into expected format',
    userAction: 'El sistema reintentará con instrucciones más claras.',
  },
  ERR_PARSING_AI_CONFIG: {
    userMessage: 'Error cargando la configuración del sistema de análisis.',
    technicalMessage: 'Failed to parse AI configuration file',
    userAction: 'Contacta al equipo de Botilito para resolver este problema.',
  },

  // ============================================================
  // AUTHENTICATION ERRORS
  // ============================================================
  ERR_AUTH_MISSING_TOKEN: {
    userMessage: 'Debes iniciar sesión para realizar análisis.',
    technicalMessage: 'No authentication token provided',
    userAction: 'Inicia sesión o regístrate en Botilito.',
  },
  ERR_AUTH_INVALID_TOKEN: {
    userMessage: 'Tu sesión ha expirado. Por favor inicia sesión de nuevo.',
    technicalMessage: 'Authentication token is invalid or expired',
    userAction: 'Cierra sesión e inicia sesión nuevamente.',
  },
  ERR_AUTH_UNAUTHORIZED: {
    userMessage: 'No tienes permisos para realizar esta acción.',
    technicalMessage: 'User not authorized for this operation',
    userAction: 'Verifica tus permisos o contacta a un administrador.',
  },

  // ============================================================
  // NETWORK ERRORS
  // ============================================================
  ERR_NETWORK_CONNECTION: {
    userMessage: 'Problema de conexión a internet. Reintentando...',
    technicalMessage: 'Network connection failed',
    userAction: 'Verifica tu conexión a internet.',
  },
  ERR_NETWORK_TIMEOUT: {
    userMessage: 'La conexión está tardando demasiado. Reintentando...',
    technicalMessage: 'Network request timed out',
    userAction: 'Verifica tu conexión a internet.',
  },

  // ============================================================
  // UNKNOWN ERRORS
  // ============================================================
  ERR_UNKNOWN: {
    userMessage: 'Ocurrió un error inesperado. Estamos investigando.',
    technicalMessage: 'Unknown error occurred',
    userAction: 'Por favor intenta de nuevo. Si el problema persiste, contacta a soporte.',
  },
};

/**
 * Helper function to get error message
 */
export function getErrorMessage(code: string): ErrorMessageDefinition {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES.ERR_UNKNOWN;
}

/**
 * Format error message with context variables
 */
export function formatErrorMessage(
  message: string,
  variables: Record<string, string | number>
): string {
  let formatted = message;
  for (const [key, value] of Object.entries(variables)) {
    formatted = formatted.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }
  return formatted;
}
