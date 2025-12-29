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
        <Card className="border-2 border-[#ffda00] bg-white rounded-[12px]">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#ffda00] flex items-center justify-center flex-shrink-0">
                        <FileText className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-[16px] leading-[24px] font-normal text-black">
                        Información del Caso
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
                {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start">
                        <span className="text-[12px] leading-[16px] text-[#6b7280]">{item.label}</span>
                        <span className="text-[12px] leading-[16px] text-black font-normal text-right truncate max-w-[150px]" title={String(item.value)}>
                            {item.value}
                        </span>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
