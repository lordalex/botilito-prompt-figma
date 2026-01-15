/**
 * @file CaseList.tsx
 * @description Unified list component for displaying cases across the application.
 *
 * ## LLM CONTEXT - ARCHITECTURE OVERVIEW
 *
 * This is the SINGLE SOURCE OF TRUTH for case listing in Botilito.
 * It replaces all previous list implementations (CaseValidationList, Historial, CaseListView).
 *
 * ### Key Design Patterns:
 * 1. **Configurable Props**: Title, description, emptyMessage allow reuse across different views
 * 2. **Data Format Agnostic**: Accepts 3 different DTO formats via isEnrichedFormat/isStandardizedFormat flags
 * 3. **Transformation Layer**: Uses transform functions from @/types/validation to normalize data
 * 4. **Client-side Filtering**: Search and content type filters applied in useMemo
 *
 * ### Usage Contexts:
 * - HumanVerification.tsx: Shows pending cases for validation (isEnrichedFormat=true)
 * - ContentReview.tsx: Shows historical cases (isEnrichedFormat=true)
 * - Future views can pass isStandardizedFormat=true for DTO.json format
 *
 * ### Data Flow:
 * ```
 * API Response → Hook (useCaseHistory/useHumanVerification)
 *     ↓
 * CaseEnriched[] or ValidationCaseDTO[] or StandardizedCase[]
 *     ↓
 * CaseList receives raw cases + format flag
 *     ↓
 * Transform functions normalize to ValidationCaseListItemDTO[]
 *     ↓
 * Client-side filters applied (search, contentType)
 *     ↓
 * CaseListItem renders each normalized item
 * ```
 *
 * @see CaseListItem.tsx - Individual row rendering
 * @see @/types/validation.ts - Type definitions and transform functions
 * @see @/hooks/useCaseHistory.ts - Data fetching hook for Historial
 * @see @/hooks/useHumanVerification.ts - Data fetching hook for Validación Humana
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  Filter,
  Layers,
  ChevronDown,
  Loader2,
  RefreshCw,
  ListFilter,
} from 'lucide-react';
import type {
  ValidationCaseDTO,
  CaseEnrichedCompatible,
  StandardizedCase,
} from '@/types/validation';
import { Skeleton } from '@/components/ui/skeleton';
import {
  transformCasesToListItems,
  transformEnrichedCasesToListItems,
  transformStandardizedCasesToListItems
} from '@/types/validation';
import { CaseListItem } from './CaseListItem';

// Opciones de filtro de contenido (cliente)
type ContentFilterOption = 'todos' | 'texto' | 'imagen' | 'video' | 'audio' | 'url';

const contentFilterOptions: { value: ContentFilterOption; label: string }[] = [
  { value: 'todos', label: 'Todos los tipos' },
  { value: 'texto', label: 'Solo Texto' },
  { value: 'imagen', label: 'Solo Imágenes' },
  { value: 'video', label: 'Solo Videos' },
  { value: 'audio', label: 'Solo Audios' },
  { value: 'url', label: 'Solo URLs' },
];

// Opciones de filtro de modo (servidor)
export type FilterMode = 'all' | 'voted_by_me' | 'not_voted_by_me' | 'has_consensus';

const filterModes: { value: FilterMode; label: string }[] = [
  { value: 'all', label: 'Todos los Casos' },
  { value: 'not_voted_by_me', label: 'Pendientes de Mi Voto' },
  { value: 'voted_by_me', label: 'Mis Votos' },
  { value: 'has_consensus', label: 'Con Consenso Humano' },
];

export interface CaseListProps {
  cases: ValidationCaseDTO[] | CaseEnrichedCompatible[] | StandardizedCase[];
  onViewTask: (caseId: string, type: string, status?: string) => void;
  isLoading?: boolean;
  isEnrichedFormat?: boolean;
  isStandardizedFormat?: boolean;
  title?: string;
  description?: string;
  emptyMessage?: string;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  
  // Props para filtro de modo (servidor)
  filterMode?: FilterMode;
  onFilterModeChange?: (mode: FilterMode) => void;
  availableFilterModes?: FilterMode[];
}

export function CaseList({
  cases,
  onViewTask,
  isLoading = false,
  isEnrichedFormat = false,
  isStandardizedFormat = false,
  title = 'Casos Pendientes de Validación',
  description = 'Revisa y valida los análisis realizados por la IA',
  emptyMessage = 'No hay casos pendientes de validación',
  hasMore = false,
  onLoadMore,
  isLoadingMore = false,
  currentPage = 1,
  totalPages = 0,
  onPageChange,
  onRefresh,
  isRefreshing = false,
  filterMode = 'all',
  onFilterModeChange,
  availableFilterModes = ['all', 'not_voted_by_me', 'voted_by_me', 'has_consensus'],
}: CaseListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [contentFilter, setContentFilter] = useState<ContentFilterOption>('todos');

  const listItems = useMemo(() => {
    if (isStandardizedFormat) {
      return transformStandardizedCasesToListItems(cases as StandardizedCase[]);
    }
    if (isEnrichedFormat) {
      return transformEnrichedCasesToListItems(cases as CaseEnrichedCompatible[]);
    }
    return transformCasesToListItems(cases as ValidationCaseDTO[]);
  }, [cases, isEnrichedFormat, isStandardizedFormat]);

  const filteredCases = useMemo(() => {
    return listItems.filter((c) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        c.title.toLowerCase().includes(searchLower) ||
        c.caseCode.toLowerCase().includes(searchLower) ||
        c.reportedBy.toLowerCase().includes(searchLower) ||
        c.summary.toLowerCase().includes(searchLower);

      let matchesFilter = true;
      if (contentFilter !== 'todos') {
        matchesFilter = c.contentType === contentFilter;
      }

      return matchesSearch && matchesFilter;
    });
  }, [listItems, searchQuery, contentFilter]);
  
  const displayedFilterModes = filterModes.filter(fm => availableFilterModes.includes(fm.value));

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex flex-col">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-0">
                <Layers className="h-5 w-5 text-[#FFDA00]" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">{title}</CardTitle>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="text-xs font-bold px-3 py-1 bg-[#FFF9C4] text-yellow-800 hover:bg-[#FFF59D] border-none"
              >
                {isLoading ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Cargando...
                  </span>
                ) : (
                  `# ${cases.length} casos`
                )}
              </Badge>
              {onRefresh && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onRefresh}
                  disabled={isRefreshing || isLoading}
                  className="h-8 w-8 text-gray-400 hover:text-gray-600"
                  title="Actualizar lista"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </div>
          </div>
          <CardDescription>{description}</CardDescription>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              placeholder="Buscar por título, contenido o código de caso..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border border-gray-200 bg-white"
            />
          </div>
          <div className="flex items-center gap-3">
            {/* Server-side filter */}
            {onFilterModeChange && displayedFilterModes.length > 1 && (
              <div className="flex items-center gap-2">
                <ListFilter className="h-4 w-4 text-gray-400" />
                <Select value={filterMode} onValueChange={(value) => onFilterModeChange(value as FilterMode)}>
                  <SelectTrigger className="w-full sm:w-[200px] border border-gray-200 focus:border-primary focus:ring-0 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {displayedFilterModes.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {/* Client-side filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={contentFilter} onValueChange={(value) => setContentFilter(value as ContentFilterOption)}>
                <SelectTrigger className="w-full sm:w-[180px] border border-gray-200 focus:border-primary focus:ring-0 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contentFilterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-200">
                <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-24 rounded-lg" />
                    <Skeleton className="h-6 flex-1 rounded-lg" />
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-32 rounded" />
                    <Skeleton className="h-4 w-40 rounded" />
                  </div>
                </div>
                <Skeleton className="h-8 w-32 rounded-full shrink-0 hidden sm:block" />
              </div>
            ))}
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery || contentFilter !== 'todos'
              ? 'No se encontraron casos con los filtros aplicados'
              : emptyMessage}
          </div>
        ) : (
          <>
            {filteredCases.map((caseItem) => (
              <CaseListItem
                key={caseItem.id}
                caseItem={caseItem}
                onClick={(id, type) => onViewTask(id, type, 'pending')}
              />
            ))}

            {onPageChange && (
              <div className="flex items-center justify-center gap-4 pt-6 pb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || isLoading}
                  className="gap-1 border-gray-200"
                >
                  <ChevronDown className="h-4 w-4 rotate-90" />
                  Anterior
                </Button>

                <span className="text-sm font-medium text-gray-600">
                  Página {currentPage} {totalPages ? `de ${totalPages}` : ''}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={(!hasMore && (totalPages ? currentPage >= totalPages : true)) || isLoading}
                  className="gap-1 border-gray-200"
                >
                  Siguiente
                  <ChevronDown className="h-4 w-4 -rotate-90" />
                </Button>
              </div>
            )}

            {hasMore && onLoadMore && !onPageChange && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={onLoadMore}
                  disabled={isLoadingMore}
                  className="gap-2 px-6"
                  style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Cargar más casos
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

/** @deprecated Use CaseList instead - kept for backwards compatibility */
export const CaseValidationList = CaseList;

/** @deprecated Use CaseListProps instead */
export type CaseValidationListProps = CaseListProps;
