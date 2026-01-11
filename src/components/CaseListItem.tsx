/**
 * @file CaseListItem.tsx
 * @description Individual row component for rendering a case in the CaseList.
 *
 * ## LLM CONTEXT - COMPONENT OVERVIEW
 *
 * This component renders a single case row with:
 * - Content type icon (text, image, video, audio, url)
 * - Case code badge (e.g., "I-20240115-ABC")
 * - Theme badge (Desinformódico/Forense) - if applicable
 * - Title and metadata (date, reporter, validators count)
 * - AMI compliance level badge with icon
 *
 * ### Design System Integration:
 * - Uses brand colors from CLAUDE.md (--accent for yellow backgrounds)
 * - AMI badge colors follow the compliance level styling guide
 * - Theme badges use semantic colors (red for Desinformódico, purple for Forense)
 *
 * ### Data Flow:
 * - Receives normalized `ValidationCaseListItemDTO` (already transformed from any source format)
 * - onClick callback returns (id, contentType) for navigation
 *
 * ### AMI Compliance Levels (from CLAUDE.md):
 * - "Desarrolla las estrategias AMI" → Green (best)
 * - "Cumple las premisas AMI" → Green (good)
 * - "Requiere un enfoque AMI" → Orange (warning)
 * - "No cumple las premisas AMI" → Red (manipulated)
 * - "Generado por IA" → Purple (synthetic content)
 *
 * @see CaseList.tsx - Parent component that renders multiple CaseListItems
 * @see @/types/validation.ts - Type definitions (ValidationCaseListItemDTO)
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Image as ImageIcon,
  Video,
  Volume2,
  Link2,
  Calendar,
  User,
  Shield,
  Sparkles,
  Wand2,
  CheckCircle2,
  AlertTriangle,
  Bot
} from 'lucide-react';
import type { ValidationCaseListItemDTO, AMIComplianceLevel } from '@/types/validation';

// Configuración de iconos por tipo de contenido
const contentTypeIcons = {
  texto: FileText,
  imagen: ImageIcon,
  video: Video,
  audio: Volume2,
  url: Link2,
} as const;

// Configuración de colores de fondo por tipo de contenido
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
    className: 'bg-red-50 text-red-700 border-2 border-red-600',
    icon: 'sparkles',
  },
  Forense: {
    label: 'Forense',
    className: 'bg-purple-50 text-purple-700 border-2 border-purple-600',
    icon: 'wand',
  },
};

// Configuración de badges por nivel AMI con iconos
const amiBadges: Record<
  AMIComplianceLevel | 'Generado por IA',
  { label: string; labelShort: string; className: string; icon: 'check' | 'alert' | 'bot' | 'wand' }
> = {
  'Desarrolla las estrategias AMI': {
    label: 'Desarrolla AMI',
    labelShort: 'Desarrolla AMI',
    className: 'bg-green-50 text-green-700 border-2 border-green-600',
    icon: 'check',
  },
  'Cumple las premisas AMI': {
    label: 'Sin alteraciones',
    labelShort: 'Sin alteración',
    className: 'bg-green-50 text-green-700 border-2 border-green-600',
    icon: 'check',
  },
  'Requiere un enfoque AMI': {
    label: 'Requiere AMI',
    labelShort: 'Requiere AMI',
    className: 'bg-orange-50 text-orange-700 border-2 border-orange-600',
    icon: 'alert',
  },
  'No cumple las premisas AMI': {
    label: 'Manipulado',
    labelShort: 'Manipulado',
    className: 'bg-red-50 text-red-700 border-2 border-red-600',
    icon: 'wand',
  },
  'Generado por IA': {
    label: 'Generado por IA',
    labelShort: 'IA',
    className: 'bg-purple-50 text-purple-700 border-2 border-purple-600',
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

interface CaseListItemProps {
  caseItem: ValidationCaseListItemDTO;
  onClick: (id: string, contentType: ValidationCaseListItemDTO['contentType']) => void;
  className?: string; // Allow custom styles validation
}

export function CaseListItem({ caseItem, onClick, className = '' }: CaseListItemProps) {
  const ContentIcon = contentTypeIcons[caseItem.contentType];
  const themeConfig = caseItem.theme ? themeBadges[caseItem.theme] : null;
  const amiConfig = caseItem.amiLevel ? amiBadges[caseItem.amiLevel] : null;
  const AmiIcon = amiConfig ? getAmiIcon(amiConfig.icon) : null;

  return (
    <div
      onClick={() => onClick(caseItem.id, caseItem.contentType)}
      className={`group relative flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white border border-gray-200 hover:shadow-md transition-all cursor-pointer ${className}`}
    >
      {/* Column 1: Icon (shrink-0) */}
      <div className="shrink-0 p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-[var(--accent)]">
        <ContentIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-800" />
      </div>

      {/* Column 2: Case Code (shrink-0) - Per documentation: separate column */}
      <div className="shrink-0">
        <span className="text-xs sm:text-sm font-mono px-2 py-0.5 border-2 rounded-md sm:rounded-lg bg-white text-gray-700 whitespace-nowrap" style={{ borderColor: 'var(--accent)' }}>
          Caso: {caseItem.caseCode}
        </span>
      </div>

      {/* Column 3: Main Info (flex-1, min-w-0) */}
      <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-1">
        {/* Line 1: Theme Badge (optional) */}
        {themeConfig && (
          <Badge variant="secondary" className={`${themeConfig.className} px-2 py-0.5 text-[10px] uppercase tracking-wide inline-flex items-center gap-1`}>
            {themeConfig.icon === 'sparkles' ? <Sparkles className="h-3 w-3" /> : <Wand2 className="h-3 w-3" />}
            {themeConfig.label}
          </Badge>
        )}

        {/* Line 2: Title */}
        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2">
          {caseItem.title}
        </h3>

        {/* Line 3: Metadata (horizontal on desktop, can wrap on mobile) */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] sm:text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>{formatDate(caseItem.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>Reportado por: {caseItem.reportedBy}</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${caseItem.humanValidatorsCount > 0 ? 'text-green-600' : 'text-gray-400'}`} />
            <span className={caseItem.humanValidatorsCount > 0 ? 'text-green-700 font-medium' : ''}>
              {caseItem.humanValidatorsCount} validadores humanos
            </span>
          </div>
        </div>
      </div>

      {/* Column 4: AMI Badge (shrink-0, ml-auto, pl-4) */}
      <div className="shrink-0 sm:ml-auto sm:pl-4">
        {amiConfig && AmiIcon ? (
          <div className={`text-[10px] sm:text-xs font-medium px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-lg border-2 flex items-center gap-1.5 ${amiConfig.className}`}>
            <AmiIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>{amiConfig.label}</span>
          </div>
        ) : (
          <div className="text-[10px] sm:text-xs font-medium px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-lg border-2 border-gray-200 bg-gray-50 text-gray-500 flex items-center gap-1.5">
            <span>Pendiente de Análisis</span>
          </div>
        )}
      </div>
    </div>
  );
}
