import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Layers, Search, Eye, AlertTriangle, Hash, Calendar, Bot, CheckCircle, FileText, Image as ImageIcon, Video, Volume2 } from 'lucide-react';

type Case = any; // Simplificado

interface CaseListViewProps {
    onViewDetails: (caseId: string) => void;
    cases: Case[];
    isLoading: boolean;
    error: string | null;
}

const getTypeVisuals = (type: string) => {
    switch (type) {
        case 'text': return { icon: FileText };
        case 'image': return { icon: ImageIcon };
        case 'video': return { icon: Video };
        case 'audio': return { icon: Volume2 };
        default: return { icon: FileText };
    }
};

const getStatusBadge = (status: string) => {
    if (status === 'verified') {
      return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200"><CheckCircle className="h-3 w-3 mr-1" />Verificado</Badge>;
    }
    return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><Bot className="h-3 w-3 mr-1" />Solo IA</Badge>;
};


export function CaseListView({ onViewDetails, cases: allCases, isLoading, error }: CaseListViewProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCases = useMemo(() => {
    return allCases.filter(c => 
        searchTerm === '' || 
        (c.title && c.title.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (c.id && c.id.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [allCases, searchTerm]);

  
  return (
      <div className="space-y-6">
          <Card>
              <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-2xl"><Layers className="h-6 w-6" /><span>Historial de Casos</span></CardTitle>
                  <CardDescription>Explora todos los análisis de contenido realizados por el sistema.</CardDescription>
                  <div className="relative pt-4">
                    <Search className="absolute left-3 top-6.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar por título o ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                  </div>
              </CardHeader>
              <CardContent>
                  <div className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
                    {isLoading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />) :
                    error ? <div className="text-center py-12 text-destructive"><AlertTriangle className="mx-auto h-12 w-12" /><p className="mt-4">{error}</p></div> :
                    filteredCases.length === 0 ? <div className="text-center py-12 text-muted-foreground"><Search className="mx-auto h-12 w-12" /><p className="mt-4">No se encontraron casos.</p></div> :
                    filteredCases.map((caso) => {
                        const { icon: TypeIcon } = getTypeVisuals(caso.type);
                        return (
                            <div key={caso.id} onClick={() => onViewDetails(caso.id)} className="p-4 border rounded-lg bg-background hover:bg-muted/50 transition-colors cursor-pointer">
                                <div className="flex items-start justify-between space-x-4">
                                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                                        <div className="p-2 bg-muted rounded-lg mt-1"><TypeIcon className="h-5 w-5 text-muted-foreground" /></div>
                                        <div className="flex-1 space-y-1 min-w-0">
                                            <h4 className="font-semibold truncate">{caso.title || `Caso ${caso.id}`}</h4>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                                <div className="flex items-center space-x-1 font-mono"><Hash className="h-3 w-3" /><span>{caso.id}</span></div>
                                                <div className="flex items-center space-x-1"><Calendar className="h-3 w-3" /><span>{new Date(caso.submittedAt || caso.created_at).toLocaleDateString()}</span></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end space-y-2 flex-shrink-0">
                                        {getStatusBadge(caso.status)}
                                        <Button size="sm" variant="outline"><Eye className="h-4 w-4 mr-2" />Detalles</Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                  </div>
              </CardContent>
          </Card>
      </div>
  );
}
