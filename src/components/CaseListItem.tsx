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
    className: 'bg-red-50 text-red-700 border-red-200',
    icon: 'sparkles',
  },
  Forense: {
    label: 'Forense',
    className: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: 'wand',
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
      className={`case-card-hover flex items-center gap-4 p-4 rounded-2xl cursor-pointer bg-white border border-gray-200 ${className}`}
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
}
