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
      className={`group relative flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer ${className}`}
    >
      {/* 1. ICONO (Always Yellow Square) */}
      <div className="shrink-0">
        <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-[#FFF59D] border border-[#FFDA00]">
          <ContentIcon className="h-6 w-6 text-gray-800" />
        </div>
      </div>

      {/* 2. MAIN CONTENT */}
      <div className="flex-1 min-w-0 space-y-2">

        {/* Row 1: ID | Badges | Title */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
            Caso: {caseItem.caseCode}
          </span>

          {/* Theme Badge (Desinfodémico/Forense) */}
          {themeConfig && (
            <Badge variant="secondary" className={`${themeConfig.className} px-2 py-0.5 text-[10px] uppercase tracking-wide flex items-center gap-1`}>
              {themeConfig.icon === 'sparkles' ? <Sparkles className="h-3 w-3" /> : <Wand2 className="h-3 w-3" />}
              {themeConfig.label}
            </Badge>
          )}

          {/* Title (Truncated) */}
          <h3 className="font-bold text-gray-900 text-sm truncate max-w-[300px] sm:max-w-md hidden sm:block">
            {caseItem.title}
          </h3>
        </div>

        {/* Title for Mobile (Full width) */}
        <h3 className="font-bold text-gray-900 text-sm sm:hidden line-clamp-2">
          {caseItem.title}
        </h3>

        {/* Row 2: Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(caseItem.createdAt)}
          </div>
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            Reportado por: {caseItem.reportedBy}
          </div>

          {/* Validators Count */}
          <div className="flex items-center gap-1.5">
            <Shield className={`h-3.5 w-3.5 ${caseItem.humanValidatorsCount > 0 ? 'text-green-600' : 'text-gray-400'}`} />
            <span className={caseItem.humanValidatorsCount > 0 ? 'text-green-700 font-bold' : ''}>
              {caseItem.humanValidatorsCount} validadores humanos
            </span>
          </div>
        </div>
      </div>

      {/* 3. ACTION / STATUS BADGE (Right Side) */}
      <div className="sm:ml-auto shrink-0 pt-2 sm:pt-0 w-full sm:w-auto border-t sm:border-t-0 border-gray-100 mt-2 sm:mt-0 sm:pl-4">
        {amiConfig && AmiIcon ? (
          <div className={`px-4 py-2 rounded-lg border flex items-center justify-center gap-2 w-full sm:w-auto ${amiConfig.labelShort === 'Requiere AMI' ? 'bg-orange-50 border-orange-200 text-orange-700' :
              amiConfig.labelShort === 'Manipulado' ? 'bg-red-50 border-red-200 text-red-700' :
                amiConfig.labelShort === 'Sin alteración' ? 'bg-green-50 border-green-200 text-green-700' :
                  'bg-gray-50 border-gray-200 text-gray-700'
            }`}>
            <AmiIcon className="h-4 w-4" />
            <span className="font-bold text-xs">{amiConfig.label}</span>
          </div>
        ) : (
          <div className="px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 flex items-center justify-center gap-2">
            <span className="font-bold text-xs">Pendiente de Análisis</span>
          </div>
        )}
      </div>

    </div>
  );
}
