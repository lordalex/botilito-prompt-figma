import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  FileText,
  Image as ImageIcon,
  Video,
  Volume2,
  Link2,
  Calendar,
  User,
  Shield,
  Sparkles,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Bot,
  Wand2,
  Layers,
} from 'lucide-react';
import type {
  ValidationCaseListItemDTO,
  ValidationCaseDTO,
  ConsensusState,
  AMIComplianceLevel,
  CaseEnrichedCompatible,
} from '@/types/validation';
import { transformCasesToListItems, transformEnrichedCasesToListItems } from '@/types/validation';

// Configuración de iconos por tipo de contenido
const contentTypeIcons = {
  texto: FileText,
  imagen: ImageIcon,
  video: Video,
  audio: Volume2,
  url: Link2,
} as const;

// Configuración de colores de fondo por tipo de contenido
// Nota: Usando clase base común, el hover se aplica directamente en el componente
const contentTypeIconBg = {
  texto: 'bg-amber-300',
  imagen: 'bg-amber-300',
  video: 'bg-amber-300',
  audio: 'bg-amber-300',
  url: 'bg-amber-300',
} as const;

// Configuración de badges por tema
const themeBadges: Record<string, { label: string; className: string; icon: 'sparkles' | 'wand' }> = {
  Desinformódico: {
    label: 'Desinformódico',
    className: 'bg-red-50 text-red-700 border-red-200',
    icon: 'sparkles',
  },
  Forense: {
    label: 'Forense',
    className: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: 'wand',
  },
};

// Configuración de badges por estado de consenso (no usado en UI actualmente)
const consensusBadges: Record<ConsensusState, { label: string; className: string }> = {
  ai_only: {
    label: 'Solo IA',
    className: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100',
  },
  human_consensus: {
    label: 'Consenso Humano',
    className: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100',
  },
  conflicted: {
    label: 'En Conflicto',
    className: 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100',
  },
};

// Configuración de badges por nivel AMI con iconos
const amiBadges: Record<
  AMIComplianceLevel | 'Generado por IA',
  { label: string; className: string; icon: 'check' | 'alert' | 'bot' | 'wand' }
> = {
  'Desarrolla las estrategias AMI': {
    label: 'Desarrolla las premisas AMI',
    className: 'bg-green-50 text-green-700 border-green-200',
    icon: 'check',
  },
  'Cumple las premisas AMI': {
    label: '✓ Sin alteraciones',
    className: 'bg-green-50 text-green-700 border-green-200',
    icon: 'check',
  },
  'Requiere un enfoque AMI': {
    label: 'Requiere un enfoque AMI',
    className: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: 'alert',
  },
  'No cumple las premisas AMI': {
    label: 'Manipulado Digitalmente',
    className: 'bg-red-50 text-red-700 border-red-200',
    icon: 'wand',
  },
  'Generado por IA': {
    label: '🤖 Generado por IA',
    className: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: 'bot',
  },
};

// Función para obtener el icono AMI
function getAmiIcon(icon: 'check' | 'alert' | 'bot' | 'wand') {
  switch (icon) {
    case 'check':
      return CheckCircle2;
    case 'alert':
      return AlertTriangle;
    case 'bot':
      return Bot;
    case 'wand':
      return Wand2;
  }
}

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

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export interface CaseValidationListProps {
  /** Casos en formato DTO del backend o CaseEnriched del hook */
  cases: ValidationCaseDTO[] | CaseEnrichedCompatible[];
  /** Callback cuando se selecciona un caso */
  onSelectCase: (caseId: string) => void;
  /** Estado de carga */
  isLoading?: boolean;
  /** Indica si los casos vienen del formato CaseEnriched (useHumanVerification) */
  isEnrichedFormat?: boolean;
}

export function CaseValidationList({
  cases,
  onSelectCase,
  isLoading = false,
  isEnrichedFormat = false,
}: CaseValidationListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterOption>('todos');

  // Transformar los casos del backend al DTO de lista
  const listItems = useMemo(() => {
    if (isEnrichedFormat) {
      return transformEnrichedCasesToListItems(cases as CaseEnrichedCompatible[]);
    }
    return transformCasesToListItems(cases as ValidationCaseDTO[]);
  }, [cases, isEnrichedFormat]);

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
          filteredCases.map((caseItem) => {
            const ContentIcon = contentTypeIcons[caseItem.contentType];
            const themeConfig = caseItem.theme ? themeBadges[caseItem.theme] : null;
            const amiConfig = caseItem.amiLevel ? amiBadges[caseItem.amiLevel] : null;
            const iconBg = contentTypeIconBg[caseItem.contentType];
            const AmiIcon = amiConfig ? getAmiIcon(amiConfig.icon) : null;

            return (
              <div
                key={caseItem.id}
                onClick={() => onSelectCase(caseItem.id)}
                className="case-card-hover flex items-center gap-4 p-4 rounded-2xl cursor-pointer bg-white border border-gray-200"
              >
                {/* Icono de tipo de contenido - fondo amarillo */}
                <div className="shrink-0 p-3 rounded-xl" style={{ backgroundColor: 'var(--accent)' }}>
                  <ContentIcon className="h-6 w-6 text-gray-800" />
                </div>

                {/* Información principal */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-sm font-mono px-2 py-0.5 border-2 rounded-lg bg-white text-gray-700 shrink-0"
                      style={{ borderColor: 'var(--accent)' }}
                    >
                      Caso: {caseItem.caseCode}
                    </span>
                    {themeConfig && (
                      <Badge
                        variant="outline"
                        className={`text-xs font-medium shrink-0 ${themeConfig.className}`}
                      >
                        {themeConfig.icon === 'sparkles' ? (
                          <Sparkles className="h-3 w-3 mr-1" />
                        ) : (
                          <Wand2 className="h-3 w-3 mr-1" />
                        )}
                        {themeConfig.label}
                      </Badge>
                    )}
                    <span className="font-semibold text-gray-900 truncate flex-1 min-w-0">
                      {caseItem.title}
                    </span>
                  </div>

                  {/* Segunda línea: metadatos */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(caseItem.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Reportado por: {caseItem.reportedBy}
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield
                        className={`h-3 w-3 ${caseItem.humanValidatorsCount > 0 ? 'text-green-600' : ''}`}
                      />
                      <span className={caseItem.humanValidatorsCount > 0 ? 'text-green-600 font-medium' : ''}>
                        {caseItem.humanValidatorsCount}
                      </span>{' '}
                      validadores humanos
                    </span>
                  </div>
                </div>

                {/* Badge de nivel AMI con icono */}
                {amiConfig && AmiIcon && (
                  <Badge
                    variant="outline"
                    className={`shrink-0 text-sm font-medium px-3 py-1.5 ${amiConfig.className}`}
                  >
                    <AmiIcon className="h-4 w-4 mr-1" />
                    {amiConfig.label}
                  </Badge>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
