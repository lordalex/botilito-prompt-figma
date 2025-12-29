import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface CaseInfoItem {
    label: string;
    value: string | number | React.ReactNode;
}

interface AnalysisSidebarCaseInfoProps {
    caseNumber?: string;
    contentType?: string;
    transmissionVector?: string;
    reportedBy?: string;
    date?: string;
}

export function AnalysisSidebarCaseInfo({
    caseNumber,
    contentType,
    transmissionVector,
    reportedBy,
    date
}: AnalysisSidebarCaseInfoProps) {
    const items: CaseInfoItem[] = [
        { label: 'Caso', value: caseNumber || 'N/A' },
        { label: 'Tipo', value: contentType?.toUpperCase() || 'TEXT' },
        { label: 'Vector de transmisión', value: transmissionVector || 'Web' },
        { label: 'Reportado por', value: reportedBy || 'Anónimo' },
        { label: 'Fecha', value: date || 'N/A' }
    ];

    return (
        <Card className="border border-slate-200 shadow-sm bg-white rounded-lg">
            <CardHeader className="py-3 px-4 border-b border-slate-100">
                <CardTitle className="text-xs font-semibold flex items-center gap-2 text-slate-700">
                    <FileText className="h-4 w-4 text-amber-500" />
                    Información del Caso
                </CardTitle>
            </CardHeader>
            <CardContent className="px-4 py-3 space-y-2">
                {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">{item.label}</span>
                        <span className="font-medium text-slate-800 text-right truncate max-w-[150px]" title={String(item.value)}>
                            {item.value}
                        </span>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
