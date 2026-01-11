import { useState, useEffect, useCallback } from 'react';
import { searchService } from '@/services/searchService';
import { StandardizedCase } from '@/types/standardizedCase';

interface UseCaseLookupResult {
    data: StandardizedCase | Partial<StandardizedCase> | null;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

/**
 * Hook to retrieve specific case data via the Synchronous Lookup Endpoint.
 * @param identifier - The Case ID, Job ID, or Source URL.
 * @param selectFields - Optional array of fields to fetch (e.g. ['overview.title']).
 */
export function useCaseLookup(identifier: string | null, selectFields?: string[]): UseCaseLookupResult {
    const [data, setData] = useState<StandardizedCase | Partial<StandardizedCase> | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        if (!identifier) {
            setData(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await searchService.lookupCase(identifier, selectFields);
            setData(result);
        } catch (err: any) {
            setError(err instanceof Error ? err : new Error(err.message || 'Unknown error'));
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [identifier, JSON.stringify(selectFields)]); // stringify to compare array content

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
}
