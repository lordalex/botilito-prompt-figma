import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  Filter,
  Layers,
} from 'lucide-react';
import type {
  ValidationCaseDTO,
  CaseEnrichedCompatible,
  StandardizedCase,
} from '@/types/validation';
import {
  transformCasesToListItems,
  transformEnrichedCasesToListItems,
  transformStandardizedCasesToListItems
} from '@/types/validation';
import { CaseListItem } from './CaseListItem';

// Opciones de filtro
type FilterOption = 'todos' | 'texto' | 'imagen' | 'video' | 'audio' | 'url';

const filterOptions: { value: FilterOption; label: string }[] = [
  { value: 'todos', label: 'Todos los casos' },
  { value: 'texto', label: 'Solo Texto' },
  { value: 'imagen', label: 'Solo Imágenes' },
  { value: 'video', label: 'Solo Videos' },
  { value: 'audio', label: 'Solo Audios' },
  { value: 'url', label: 'Solo URLs' },
];

export interface CaseValidationListProps {
  /** Casos en formato DTO del backend o CaseEnriched del hook */
  cases: ValidationCaseDTO[] | CaseEnrichedCompatible[] | StandardizedCase[];
  /** Callback cuando se selecciona un caso para ver la tarea */
  onViewTask: (caseId: string, type: string, status?: string) => void;
  /** Estado de carga */
  isLoading?: boolean;
  /** Indica si los casos vienen del formato CaseEnriched (useHumanVerification) */
  isEnrichedFormat?: boolean;
  /** Indica si los casos vienen del formato StandardizedCase (DTO.json) */
  isStandardizedFormat?: boolean;
}

export function CaseValidationList({
  cases,
  onViewTask,
  isLoading = false,
  isEnrichedFormat = false,
  isStandardizedFormat = false,
}: CaseValidationListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterOption>('todos');

  // Transformar los casos del backend al DTO de lista
  const listItems = useMemo(() => {
    if (isStandardizedFormat) {
      return transformStandardizedCasesToListItems(cases as StandardizedCase[]);
    }
    if (isEnrichedFormat) {
      return transformEnrichedCasesToListItems(cases as CaseEnrichedCompatible[]);
    }
    return transformCasesToListItems(cases as ValidationCaseDTO[]);
  }, [cases, isEnrichedFormat, isStandardizedFormat]);

  // Filtrar casos según búsqueda y filtro
  const filteredCases = useMemo(() => {
    return listItems.filter((c) => {
      // Filtro de búsqueda
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        c.title.toLowerCase().includes(searchLower) ||
        c.caseCode.toLowerCase().includes(searchLower) ||
        c.reportedBy.toLowerCase().includes(searchLower) ||
        c.summary.toLowerCase().includes(searchLower);

      // Filtro por tipo
      let matchesFilter = true;
      if (filter !== 'todos') {
        matchesFilter = c.contentType === filter;
      }

      return matchesSearch && matchesFilter;
    });
  }, [listItems, searchQuery, filter]);

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex flex-col">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg text-primary">
                <Layers className="h-5 w-5 text-gray-800" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Casos Pendientes de Validación</CardTitle>
              </div>
            </div>
            <Badge
              variant="outline"
              className="text-sm font-medium px-3 py-1 bg-white"
              style={{ borderColor: 'var(--accent)', color: 'var(--color-yellow-700)', backgroundColor: 'var(--color-yellow-50)' }}
            >
              # {cases.length} casos
            </Badge>
          </div>
          <CardDescription>Revisa y valida los análisis realizados por la IA</CardDescription>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              placeholder="Buscar por título, contenido o código de caso..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border border-gray-200 bg-white"
              style={{ outline: 'none' }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select value={filter} onValueChange={(value) => setFilter(value as FilterOption)}>
              <SelectTrigger className="w-full sm:w-[180px] border border-gray-200 focus:border-primary focus:ring-0 bg-white">
                <SelectValue placeholder="Todos los casos" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery || filter !== 'todos'
              ? 'No se encontraron casos con los filtros aplicados'
              : 'No hay casos pendientes de validación'}
          </div>
        ) : (
          filteredCases.map((caseItem) => (
            <CaseListItem
              key={caseItem.id}
              caseItem={caseItem}
              onClick={(id, type) => onViewTask(id, type, 'pending')}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
