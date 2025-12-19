import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';

const ADMIN_CACHE_KEY = 'botilito_admin_access';

export function useAdminAccess() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAccess = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setLoading(false);
                sessionStorage.removeItem(ADMIN_CACHE_KEY);
                return;
            }

            // Check if we have a cached admin status for this session
            const cachedData = sessionStorage.getItem(ADMIN_CACHE_KEY);
            if (cachedData) {
                try {
                    const { userId, isAdmin: cachedAdmin, timestamp } = JSON.parse(cachedData);
                    // Verify the cache is for the current user and is recent (within session)
                    if (userId === session.user.id) {
                        setIsAdmin(cachedAdmin);
                        setLoading(false);
                        return;
                    }
                } catch (e) {
                    // Invalid cache, proceed to fetch
                    sessionStorage.removeItem(ADMIN_CACHE_KEY);
                }
            }

            // Fetch admin status from database
            try {
                const { data } = await supabase
                    .from('perfiles_usuario')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();

                const adminStatus = !!(data && data.role === 'admin');
                setIsAdmin(adminStatus);

                // Cache the result in sessionStorage
                sessionStorage.setItem(ADMIN_CACHE_KEY, JSON.stringify({
                    userId: session.user.id,
                    isAdmin: adminStatus,
                    timestamp: Date.now()
                }));
            } catch (e) {
                console.error("Error checking admin role", e);
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        };

        checkAccess();
    }, []);

    return { isAdmin, loading };
}
