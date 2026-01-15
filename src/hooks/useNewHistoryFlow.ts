
import { useSearchManager } from './useSearchManager';

/**
 * Hook for the "Case History" (Historial) view.
 * It uses the unified useSearchManager for completed/voted cases.
 */
export function useNewHistoryFlow() {
  const searchManager = useSearchManager({
    initialArgs: [1, 10, { filter_mode: 'has_consensus' }],
  });

  return {
    ...searchManager,
  };
}
