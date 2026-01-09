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

/**
 * Props for the CaseList component.
 *
 * ## LLM GUIDE - How to Use This Component
 *
 * ### Basic Usage (Enriched Format - Most Common):
 * ```tsx
 * <CaseList
 *   cases={cases}                    // From useCaseHistory or useHumanVerification
 *   onViewTask={handleSelectCase}    // (caseId, contentType, status?) => void
 *   isLoading={loading}
 *   isEnrichedFormat={true}          // IMPORTANT: Set this for CaseEnriched data
 *   title="Mi Título"
 *   description="Mi descripción"
 *   emptyMessage="No hay casos"
 * />
 * ```
 *
 * ### Format Flags (mutually exclusive):
 * - `isEnrichedFormat=true`: Data comes from useHumanVerification/useCaseHistory hooks
 * - `isStandardizedFormat=true`: Data comes from new DTO.json format
 * - Neither flag: Assumes raw ValidationCaseDTO[] from backend
 *
 * ### Customization Points:
 * - `title`: Header text (default: "Casos Pendientes de Validación")
 * - `description`: Subheader text
 * - `emptyMessage`: Shown when no cases match filters
 *
 * ### Pagination (Optional):
 * - `hasMore`: Whether more cases are available (from API pagination.hasMore)
 * - `onLoadMore`: Callback to load next page
 * - `isLoadingMore`: Loading state for "Load More" button
 */
export interface CaseListProps {
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
  /** Título configurable del listado */
  title?: string;
  /** Descripción configurable del listado */
  description?: string;
  /** Mensaje cuando no hay casos */
  emptyMessage?: string;
  /** Whether more cases are available to load (pagination) */
  hasMore?: boolean;
  /** Callback to load more cases */
  onLoadMore?: () => void;
  /** Loading state for Load More button */
  isLoadingMore?: boolean;
  /** Current page number for traditional pagination */
  currentPage?: number;
  /** Total pages for traditional pagination */
  totalPages?: number;
  /** Handler for page changes */
  onPageChange?: (page: number) => void;
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
}: CaseListProps) {
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
                <CardTitle className="text-xl font-bold">{title}</CardTitle>
              </div>
            </div>
            <Badge
              variant="outline"
              className="text-sm font-medium px-3 py-1 bg-white"
              style={{ borderColor: 'var(--accent)', color: 'var(--color-yellow-700)', backgroundColor: 'var(--color-yellow-50)' }}
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
          </div>
          <CardDescription>{description}</CardDescription>
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
            {searchQuery || filter !== 'todos'
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

            {/* Pagination Controls (Traditional: Prev/Next) */}
            {onPageChange && (
              <div className="flex items-center justify-center gap-4 pt-6 pb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || isLoading}
                  className="gap-1 border-gray-200"
                >
                  <ChevronDown className="h-4 w-4 rotate-90" /> {/* Left Arrow */}
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
                  <ChevronDown className="h-4 w-4 -rotate-90" /> {/* Right Arrow */}
                </Button>
              </div>
            )}

            {/* Legacy Load More Button (only if pagination not used) */}
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
