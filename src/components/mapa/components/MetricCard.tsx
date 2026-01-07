import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface MetricRowProps {
  label: string;
  value: string | number;
}

export const MetricRow = ({ label, value }: MetricRowProps) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 px-2 rounded transition-colors">
    <span className="text-sm font-medium text-gray-500">{label}</span>
    <span className="text-sm font-bold text-gray-900">{value}</span>
  </div>
);

interface MetricCardProps {
  title: string;
  icon: LucideIcon;
  color: 'blue' | 'orange' | 'purple' | 'red' | 'green';
  children: React.ReactNode;
}

export function MetricCard({ title, icon: Icon, color, children }: MetricCardProps) {
  const colorMap = {
    blue: { border: 'border-t-blue-500', bg: 'bg-blue-100', text: 'text-blue-600' },
    orange: { border: 'border-t-orange-500', bg: 'bg-orange-100', text: 'text-orange-600' },
    purple: { border: 'border-t-purple-500', bg: 'bg-purple-100', text: 'text-purple-600' },
    red: { border: 'border-t-red-500', bg: 'bg-red-100', text: 'text-red-600' },
    green: { border: 'border-t-green-500', bg: 'bg-green-100', text: 'text-green-600' },
  };

  const theme = colorMap[color];

  return (
    <Card className={`border-t-4 ${theme.border} shadow-sm hover:shadow-md transition-shadow bg-white`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold flex items-center gap-3 text-gray-800">
          <div className={`p-2 rounded-lg ${theme.bg} ${theme.text}`}>
            <Icon className="h-5 w-5" />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        {children}
      </CardContent>
    </Card>
  );
}
