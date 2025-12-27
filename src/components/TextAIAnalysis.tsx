import React from 'react';
import { Badge } from './ui/badge';
import { AlertCircle, AlertTriangle, BookOpen, CheckCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';


import { useTextAnalysisData } from '@/hooks/useTextAnalysisData';


interface TextAIAnalysisProps {
    data: any;
    title?: string;
    screenshot?: string;
    markersDetected?: any[];
}

export function TextAIAnalysis({ data, title, screenshot, markersDetected }: TextAIAnalysisProps) {
    const {
        icoScore,
        criterios,
        factCheckTable,
        diagnosticoAMI
    } = useTextAnalysisData(data);

    const AMICriteriaAccordion = () => {
        return (
            <Accordion type="single" collapsible className="w-full space-y-2">
                {criterios.map((crit: any) => {
                    const StatusIcon = crit.verdictType === 'success' ? CheckCircle :
                        crit.verdictType === 'warning' ? AlertTriangle :
                            AlertCircle;

                    return (
                        <AccordionItem key={crit.id} value={crit.id} className="border-2 border-slate-100 rounded-xl px-4 hover:border-primary/20 transition-all bg-white overflow-hidden shadow-sm">
                            <AccordionTrigger className="hover:no-underline py-4">
                                <div className="flex items-center gap-4 w-full text-left">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm ${crit.statusColor}`}>
                                        <StatusIcon className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col items-start gap-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black text-slate-400">{crit.id}</span>
                                            <span className="font-bold text-slate-900 text-sm">{crit.nombre}</span>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] font-bold py-0 h-4 border-slate-200 text-slate-500">
                                            PUNTAJE: {Math.round(crit.normalizedScore * 100)}%
                                        </Badge>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-4 pt-2">
                                <div className="pl-14 space-y-3">
                                    <p className="text-sm text-slate-600 leading-relaxed italic border-l-2 border-primary/20 pl-4 py-1">
                                        "{crit.justificacion}"
                                    </p>
                                    {crit.referencia && (
                                        <div className="text-[11px] text-slate-400 flex items-start gap-2 pt-2">
                                            <BookOpen className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                                            <span><strong>Referencia:</strong> {crit.referencia}</span>
                                        </div>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>
        );
    };


    return (
        <div className="space-y-8">
            {/* AMI Dashboard Removed - Moved to Unified View */}

            <Tabs defaultValue="criteria" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-8 mb-8 overflow-x-auto scroller-hidden">
                    <TabsTrigger
                        value="criteria"
                        className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-2 py-4 h-auto text-sm font-bold uppercase tracking-widest outline-none transition-all text-slate-400 data-[state=active]:text-primary"
                    >
                        Criterios UNESCO ({Object.keys(criterios).length})
                    </TabsTrigger>
                    <TabsTrigger
                        value="facts"
                        className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-2 py-4 h-auto text-sm font-bold uppercase tracking-widest outline-none transition-all text-slate-400 data-[state=active]:text-primary"
                    >
                        Hechos Verificados ({factCheckTable.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="criteria" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 outline-none">
                    <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-bold text-slate-800">Desglose por Criterio (AMI)</h3>
                    </div>
                    <div className="border-2 border-slate-100 rounded-2xl bg-slate-50 overflow-hidden shadow-inner">
                        <div className="max-h-[600px] overflow-y-auto p-4 custom-scrollbar">
                            <AMICriteriaAccordion />
                        </div>
                    </div>
                </TabsContent>


                <TabsContent value="facts" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 outline-none">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-6 w-6 text-emerald-600" />
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Hallazgos de Veracidad</h3>
                    </div>

                    <div className="border-2 border-slate-100 rounded-2xl bg-slate-50 overflow-hidden shadow-inner">
                        <div className="max-h-[600px] overflow-y-auto p-4 custom-scrollbar">
                            <Accordion type="single" collapsible className="w-full space-y-4">
                                {factCheckTable.map((item: any, idx: number) => (
                                    <AccordionItem
                                        key={idx}
                                        value={`fact-${idx}`}
                                        className="relative bg-white border-2 border-slate-100 rounded-2xl px-5 hover:border-primary/20 transition-all duration-300 overflow-hidden shadow-sm"
                                    >
                                        <div className={`absolute top-0 left-0 w-1.5 h-full ${item.verdict === 'Verificado' ? 'bg-emerald-500' :
                                            item.verdict === 'Refutado' ? 'bg-red-500' :
                                                'bg-amber-500'
                                            }`} />

                                        <AccordionTrigger className="hover:no-underline py-5 focus-visible:ring-0">
                                            <div className="flex items-start gap-4 text-left">
                                                <div className={`mt-0.5 p-2 rounded-full shrink-0 ${item.verdict === 'Verificado' ? 'bg-emerald-50 text-emerald-600' :
                                                    item.verdict === 'Refutado' ? 'bg-red-50 text-red-600' :
                                                        'bg-amber-50 text-amber-600'
                                                    }`}>
                                                    {item.verdict === 'Verificado' ? <CheckCircle className="h-5 w-5" /> :
                                                        item.verdict === 'Refutado' ? <AlertCircle className="h-5 w-5" /> :
                                                            <AlertTriangle className="h-5 w-5" />}
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <Badge
                                                            variant="outline"
                                                            className={`
                                                                px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                                                                ${item.verdict === 'Verificado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                                    item.verdict === 'Refutado' ? 'bg-red-50 text-red-700 border-red-200' :
                                                                        'bg-amber-50 text-amber-700 border-amber-200'}
                                                            `}
                                                        >
                                                            {item.verdict}
                                                        </Badge>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Hallazgo #{idx + 1}</span>
                                                    </div>
                                                    <h4 className="text-sm md:text-base font-bold text-slate-900 leading-snug">
                                                        {item.claim}
                                                    </h4>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pb-5">
                                            <div className="pl-14">
                                                <p className="text-sm text-slate-600 leading-relaxed border-l-2 border-slate-100 pl-4 py-1 italic">
                                                    {item.explanation}
                                                </p>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

