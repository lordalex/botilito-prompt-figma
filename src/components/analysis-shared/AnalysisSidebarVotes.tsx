import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, User, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface VoteEntry {
    user: {
        full_name: string;
    };
    vote: string;
    date: string;
    reason?: string;
}

interface AnalysisSidebarVotesProps {
    votes: VoteEntry[];
}

export function AnalysisSidebarVotes({ votes }: AnalysisSidebarVotesProps) {
    return (
        <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/80 border-b border-slate-100 py-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-600 uppercase tracking-widest">
                    <Users className="h-4 w-4" />
                    Opiniones Comunidad
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 max-h-[400px] overflow-y-auto scroller-hidden">
                {votes.length > 0 ? (
                    votes.map((entry, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100 transition-all hover:border-primary/20">
                            <div className="bg-white p-2 rounded-full border border-slate-200 shadow-sm shrink-0">
                                <User className="h-3 w-3 text-slate-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1 gap-2">
                                    <p className="text-[11px] font-bold text-slate-900 truncate">{entry.user.full_name}</p>
                                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 uppercase font-black bg-white border-slate-200 whitespace-nowrap">
                                        {entry.vote}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-[9px] text-slate-400 mb-2 font-bold uppercase">
                                    <Clock className="h-2.5 w-2.5" />
                                    {new Date(entry.date).toLocaleDateString()}
                                </div>
                                {entry.reason && (
                                    <p className="text-[10px] text-slate-500 leading-relaxed italic line-clamp-3">
                                        "{entry.reason}"
                                    </p>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8">
                        <Users className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Sin votos aún</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
