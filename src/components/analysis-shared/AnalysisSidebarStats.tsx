import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

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
        <Card className="border-2 border-[#ffda00] bg-white rounded-[12px]">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    <span className="text-[16px] leading-[24px] font-normal text-black">
                        {title}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
                {stats.map((stat, idx) => (
                    <div key={idx} className="flex justify-between items-start">
                        <span className="text-[12px] leading-[16px] text-muted-foreground">{stat.label}</span>
                        <span className={`text-[12px] leading-[16px] font-normal ${stat.color || 'text-black'}`}>
                            {stat.value}
                        </span>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
