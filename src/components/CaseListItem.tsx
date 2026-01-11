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

// Configuración de badges por tema - CLEANER LOOK (No borders)
const themeBadges: Record<string, { label: string; className: string; icon: 'sparkles' | 'wand' }> = {
  Desinformódico: {
    label: 'Desinformódico',
    className: 'bg-red-50 text-red-700 border-none', // Removed border
    icon: 'sparkles',
  },
  Forense: {
    label: 'Forense',
    className: 'bg-purple-50 text-purple-700 border-none', // Removed border
    icon: 'wand',
  },
};

// Configuración de badges por nivel AMI con iconos
const amiBadges: Record<
  AMIComplianceLevel | 'Generado por IA',
  { label: string; labelShort: string; className: string; icon: 'check' | 'alert' | 'bot' | 'wand' }
> = {
  'Desarrolla las estrategias AMI': {
    label: 'Desarrolla las premisas AMI', // Match Figma
    labelShort: 'Desarrolla AMI',
    className: 'bg-green-50 text-green-700 border border-green-200',
    icon: 'check',
  },
  'Cumple las premisas AMI': {
    label: 'Sin alteraciones',
    labelShort: 'Sin alteración',
    className: 'bg-green-50 text-green-700 border border-green-200',
    icon: 'check',
  },
  'Requiere un enfoque AMI': {
    label: 'Requiere un enfoque AMI', // Match Figma
    labelShort: 'Requiere AMI',
    className: 'bg-orange-50 text-orange-700 border border-orange-200',
    icon: 'alert',
  },
  'No cumple las premisas AMI': {
    label: 'Manipulado Digitalmente', // Match Figma
    labelShort: 'Manipulado',
    className: 'bg-red-50 text-red-700 border border-red-200',
    icon: 'wand',
  },
  'Generado por IA': {
    label: 'Generado por IA',
    labelShort: 'IA',
    className: 'bg-purple-50 text-purple-700 border border-purple-200',
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

  // Determine if this is a "Manipulated" or "Warning" case that needs the yellow highlight
  const isManipulated = amiConfig?.labelShort === 'Manipulado';

  return (
    <div
      onClick={() => onClick(caseItem.id, caseItem.contentType)}
      className={`group relative flex flex-row items-center gap-3 p-4 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer ${isManipulated
        ? 'bg-[#FFF9C4] border border-transparent' // Yellow background, no border
        : 'bg-white border border-gray-100'        // Standard white background
        } ${className}`}
    >
      {/* 1. ICONO (Always Yellow Square) - Fixed Width */}
      <div className="shrink-0 flex justify-center">
        <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-[#FFF59D] border border-[#FFDA00]">
          {/* Darker icon color for contrast */}
          <ContentIcon className="h-6 w-6 text-gray-900" />
        </div>
      </div>

      {/* 2. MAIN CONTENT - Flexible grow */}
      <div className="grow min-w-0 flex flex-col justify-center gap-1">

        {/* Row 1: ID | Badges | Title */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-mono text-[11px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded whitespace-nowrap">
            Caso: {caseItem.caseCode}
          </span>

          {/* Theme Badge (Borderless) */}
          {themeConfig && (
            <Badge variant="secondary" className={`${themeConfig.className} px-1.5 py-0.5 text-[10px] uppercase tracking-wide flex items-center gap-1 whitespace-nowrap`}>
              {themeConfig.icon === 'sparkles' ? <Sparkles className="h-3 w-3" /> : <Wand2 className="h-3 w-3" />}
              {themeConfig.label}
            </Badge>
          )}

          {/* Title - Truncate safely */}
          <h3 className="font-bold text-gray-900 text-sm truncate flex-1 min-w-[150px]">
            {caseItem.title}
          </h3>
        </div>

        {/* Row 2: Metadata - Tightest gap possible */}
        <div className="flex items-center gap-2 text-xs text-gray-500 overflow-hidden">
          <div className="flex items-center gap-1 whitespace-nowrap shrink-0">
            <Calendar className="h-3 w-3 text-gray-400" />
            {formatDate(caseItem.createdAt)}
          </div>

          <div className="flex items-center gap-1 whitespace-nowrap overflow-hidden max-w-[120px]">
            <User className="h-3 w-3 text-gray-400 shrink-0" />
            <span className="truncate">Reportado por: {caseItem.reportedBy}</span>
          </div>

          <div className="flex items-center gap-1 whitespace-nowrap shrink-0">
            <Shield className={`h-3 w-3 ${caseItem.humanValidatorsCount > 0 ? 'text-green-600' : 'text-gray-400'}`} />
            <span className={caseItem.humanValidatorsCount > 0 ? 'text-green-700 font-bold' : ''}>
              {caseItem.humanValidatorsCount} validadores humanos
            </span>
          </div>
        </div>
      </div>

      {/* 3. ACTION / STATUS BADGE (Right Side) - Fixed Width, Pushed Right */}
      <div className="shrink-0 ml-auto flex justify-end">
        {amiConfig && AmiIcon ? (
          // If manually checking style props inside the map, or use custom override
          <div className={`px-4 py-2 rounded-lg flex items-center justify-center gap-2 w-auto whitespace-nowrap ${
            // Override for Yellow Background rows: Use White Pill
            isManipulated
              ? 'bg-white border border-white text-red-700 shadow-sm'
              : amiConfig.className // Standard style for white rows
            }`}>
            <AmiIcon className="h-4 w-4" />
            <span className="font-bold text-xs">{amiConfig.label}</span>
          </div>
        ) : (
          <div className="px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 flex items-center justify-center gap-2 whitespace-nowrap">
            <span className="font-bold text-xs">Pendiente de Análisis</span>
          </div>
        )}
      </div>

    </div>
  );
}
