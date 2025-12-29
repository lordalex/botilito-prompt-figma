import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link2, CheckCircle, Clock, AlertTriangle, Bot, User } from 'lucide-react';

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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-emerald-500 text-white';
            case 'in_progress':
                return 'bg-amber-500 text-white';
            default:
                return 'bg-slate-300 text-slate-600';
        }
    };

    return (
        <Card className="border border-slate-200 shadow-sm bg-white rounded-lg">
            <CardHeader className="py-3 px-4 border-b border-slate-100">
                <CardTitle className="text-xs font-semibold flex items-center gap-2 text-slate-700">
                    <Link2 className="h-4 w-4 text-amber-500" />
                    Cadena de Custodia
                </CardTitle>
            </CardHeader>
            <CardContent className="px-4 py-3">
                <div className="relative pl-4">
                    {/* Timeline line */}
                    <div className="absolute left-[5px] top-1 bottom-1 w-px bg-slate-200" />

                    {/* Events */}
                    <div className="space-y-3">
                        {events.map((event, idx) => (
                            <div key={event.id || idx} className="relative flex gap-2 items-start">
                                {/* Dot */}
                                <div className={`absolute -left-4 top-1 w-2 h-2 rounded-full ${getStatusColor(event.status).split(' ')[0]}`} />

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-slate-800">{event.title}</p>
                                    <p className="text-[11px] text-slate-500">{event.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
