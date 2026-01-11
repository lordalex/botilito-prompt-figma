import React from 'react';
import { cn } from "@/lib/utils";

interface ProfileNavBarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export const ProfileNavBar: React.FC<ProfileNavBarProps> = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: 'resumen', label: 'Resumen', icon: '⚡' },
        { id: 'insignias', label: 'Insignias', icon: '🏅' },
        { id: 'logros', label: 'Logros', icon: '⭐' },
        { id: 'estadisticas', label: 'Estadísticas', icon: '📊' },
        { id: 'configuracion', label: 'Configuración', icon: '⚙️' },
    ];

    return (
        <div className="flex items-center gap-6 border-b border-gray-200 mb-6 overflow-x-auto">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                        "flex items-center gap-2 pb-3 px-1 text-sm font-medium transition-colors whitespace-nowrap",
                        activeTab === tab.id
                            ? "text-gray-900 border-b-2 border-yellow-400"
                            : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    )}
                >
                    <span>{tab.icon}</span>
                    {tab.label}
                </button>
            ))}
        </div>
    );
};
