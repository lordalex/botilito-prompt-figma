
import { useSearchManager } from './useSearchManager';

/**
 * Hook for the "Human Verification" (Casos para Verificar) view.
 * It uses the unified useSearchManager for pending cases.
 */
export function useNewVerificationFlow() {
  const searchManager = useSearchManager({
    initialArgs: [1, 10, { status: 'pending' }], // initial page, pageSize, and filters
  });

  return {
    ...searchManager,
  };
}
