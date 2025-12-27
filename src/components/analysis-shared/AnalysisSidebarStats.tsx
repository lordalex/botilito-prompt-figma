import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

interface StatItem {
    label: string;
    value: string | number;
    color?: string;
}

interface AnalysisSidebarStatsProps {
    stats: StatItem[];
    title?: string;
}

export function AnalysisSidebarStats({
    stats,
    title = 'Estadísticas del Análisis'
}: AnalysisSidebarStatsProps) {
    return (
        <Card className="border border-slate-100 shadow-sm bg-white">
            <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-slate-800">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
                <div className="space-y-3 pt-2">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="flex justify-between text-xs">
                            <span className="text-slate-400 font-bold uppercase tracking-tighter">{stat.label}</span>
                            <span className={`font-black ${stat.color || 'text-slate-900'}`}>
                                {stat.value}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
