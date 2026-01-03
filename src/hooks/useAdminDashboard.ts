import { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { DashboardOverview, DashboardMacros } from '../types';

export function useAdminDashboard() {
    const [overview, setOverview] = useState<DashboardOverview | null>(null);
    const [macros, setMacros] = useState<DashboardMacros | null>(null);
    const [isLoadingOverview, setIsLoadingOverview] = useState(false);
    const [isLoadingMacros, setIsLoadingMacros] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'macros' | 'challenges' | 'gestion-roles'>('overview');
    const [error, setError] = useState<string | null>(null);

    const loadOverview = async () => {
        setIsLoadingOverview(true);
        setError(null);
        try {
            const result = await adminService.executeAction('GET_DASHBOARD_SUMMARY');
            setOverview(result);
        } catch (e: any) {
            console.error("Failed to load overview", e);
            setError(e.message || "Error al cargar el resumen");
        } finally {
            setIsLoadingOverview(false);
        }
    };

    const loadMacros = async () => {
        setIsLoadingMacros(true);
        setError(null);
        try {
            const result = await adminService.executeAction('GET_DASHBOARD_MACROS', { range: '30d' });
            setMacros(result);
        } catch (e: any) {
            console.error("Failed to load macros", e);
            setError(e.message || "Error al cargar las métricas");
        } finally {
            setIsLoadingMacros(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'overview' && !overview) {
            loadOverview();
        } else if (activeTab === 'macros' && !macros) {
            loadMacros();
        }
    }, [activeTab]);

    return {
        overview,
        macros,
        activeTab,
        setActiveTab,
        isLoading: activeTab === 'overview' ? isLoadingOverview : isLoadingMacros,
        error,
        refresh: activeTab === 'overview' ? loadOverview : loadMacros
    };
}
