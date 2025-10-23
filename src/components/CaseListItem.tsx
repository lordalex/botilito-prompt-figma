import React from 'react';
import { Badge } from './ui/badge';
import { formatRelativeTime } from '../utils/formatters';
import { 
  FileText, Image as ImageIcon, Video, Volume2, 
  Calendar, User, Link as LinkIcon, Gauge
} from 'lucide-react';

// Simplified type for props, focusing on what's displayed
type CaseListItemProps = {
  caseData: {
    id: string;
    title: string;
    type: string;
    createdAt: string;
    reportedBy?: string;
    humanVotesCount: number;
    url?: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
  };
  onClick: () => void;
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'text': return <FileText className="h-6 w-6 text-gray-500" />;
    case 'image': return <ImageIcon className="h-6 w-6 text-gray-500" />;
    case 'video': return <Video className="h-6 w-6 text-gray-500" />;
    case 'audio': return <Volume2 className="h-6 w-6 text-gray-500" />;
    default: return <FileText className="h-6 w-6 text-gray-500" />;
  }
};

export function CaseListItem({ caseData, onClick }: CaseListItemProps) {
  
  const priorityStyles: Record<string, string> = {
    medium: 'bg-primary text-primary-foreground',
    high: 'bg-destructive text-destructive-foreground',
    critical: 'bg-destructive text-destructive-foreground animate-pulse',
    low: 'bg-secondary text-secondary-foreground',
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg p-4 border border-gray-200 hover:border-primary hover:shadow-lg transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start space-x-4">
        {/* Left Icon */}
        <div className="p-3 bg-gray-100 rounded-lg mt-1">
          {getTypeIcon(caseData.type)}
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-2">
          <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary font-mono text-xs">
            {caseData.id}
          </Badge>
          
          <h3 className="text-md font-bold text-gray-800 leading-tight">
            {caseData.title}
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              <span>{formatRelativeTime(caseData.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <User className="h-3 w-3" />
              <span>Reportado por: {caseData.reportedBy || 'Anónimo'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Gauge className="h-3 w-3" />
              <span>Consenso Humano + IA: 
                <Badge variant="secondary" className="ml-1 text-xs">
                  {caseData.humanVotesCount > 0 ? `${caseData.humanVotesCount} votos` : 'Sin datos'}
                </Badge>
              </span>
            </div>
          </div>

          {caseData.url && (
            <a href={caseData.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline truncate">
              <LinkIcon className="h-3 w-3" />
              <span className="truncate">{caseData.url}</span>
            </a>
          )}
        </div>

        {/* Right Priority Badge */}
        <div className="flex-shrink-0">
          <Badge className={priorityStyles[caseData.priority] || priorityStyles.medium}>
            Prioridad {caseData.priority.charAt(0).toUpperCase() + caseData.priority.slice(1)}
          </Badge>
        </div>
      </div>
    </div>
  );
}
