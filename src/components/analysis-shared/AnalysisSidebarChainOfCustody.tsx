import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, CheckCircle, Clock, AlertTriangle, Bot, User } from 'lucide-react';

interface ChainEvent {
    id: string;
    title: string;
    description: string;
    timestamp?: string;
    status: 'completed' | 'pending' | 'in_progress';
    actor?: 'system' | 'ai' | 'human';
}

interface AnalysisSidebarChainOfCustodyProps {
    events: ChainEvent[];
}

export function AnalysisSidebarChainOfCustody({ events }: AnalysisSidebarChainOfCustodyProps) {
    const getStatusIcon = (status: string, actor?: string) => {
        if (actor === 'ai') return <Bot className="h-3 w-3" />;
        if (actor === 'human') return <User className="h-3 w-3" />;

        switch (status) {
            case 'completed':
                return <CheckCircle className="h-3 w-3" />;
            case 'in_progress':
                return <Clock className="h-3 w-3" />;
            default:
                return <AlertTriangle className="h-3 w-3" />;
        }
    };

    return (
        <Card className="border-2 border-[#ffda00] bg-white rounded-[12px]">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-[16px] leading-[24px] font-normal text-black">
                        Cadena de Custodia
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 pt-0">
                <div className="space-y-0">
                    {events.map((event, idx) => (
                        <React.Fragment key={event.id || idx}>
                            {idx > 0 && <div className="border-t border-muted-foreground" />}
                            <div className={`flex items-start gap-3 ${idx === 0 ? 'pb-4' : idx === events.length - 1 ? 'pt-4' : 'py-4'}`}>
                                <div className="w-2 h-2 rounded-full bg-[#ffda00] mt-1.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-[14px] leading-[20px] text-black font-medium mb-0.5">
                                        {event.title}
                                    </p>
                                    <p className="text-[12px] leading-[18px] text-muted-foreground">
                                        {event.description}
                                    </p>
                                </div>
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
