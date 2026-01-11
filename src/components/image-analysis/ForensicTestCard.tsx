import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Badge types for forensic test results
export type TestBadge = 'MANIPULATED' | 'SYNTHETIC' | 'AUTHENTIC' | 'CLEAN' | 'UNCERTAIN';

// Interface for forensic test data
export interface ForensicTest {
  id: string;
  name: string;
  description: string;
  badge: TestBadge;
  confidence: number; // 0-100
  executionTime: string;
}

interface ForensicTestCardProps {
  test: ForensicTest;
}

// Badge translation to Spanish
const translateBadge = (badge: TestBadge): string => {
  const translations: Record<TestBadge, string> = {
    'MANIPULATED': 'MANIPULADO',
    'SYNTHETIC': 'SINTÉTICO',
    'AUTHENTIC': 'AUTÉNTICO',
    'CLEAN': 'LIMPIO',
    'UNCERTAIN': 'INCIERTO'
  };
  return translations[badge] || badge;
};

// Get badge color classes based on badge type
const getBadgeColor = (badge: TestBadge): string => {
  switch (badge) {
    case 'MANIPULATED':
      return 'bg-orange-500 hover:bg-orange-600 text-white';
    case 'SYNTHETIC':
      return 'bg-red-600 hover:bg-red-700 text-white';
    case 'AUTHENTIC':
    case 'CLEAN':
      return 'bg-green-500 hover:bg-green-600 text-white';
    case 'UNCERTAIN':
      return 'bg-yellow-500 hover:bg-yellow-600 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

// Get progress bar color based on badge type
const getProgressBarColor = (badge: TestBadge): string => {
  if (badge === 'MANIPULATED' || badge === 'SYNTHETIC') {
    return 'bg-red-500';
  }
  if (badge === 'AUTHENTIC' || badge === 'CLEAN') {
    return 'bg-green-500';
  }
  return 'bg-yellow-500'; // UNCERTAIN
};

export function ForensicTestCard({ test }: ForensicTestCardProps) {
  const badgeColor = getBadgeColor(test.badge);
  const progressBarColor = getProgressBarColor(test.badge);

  return (
    <Card className="border border-gray-200 rounded-lg shadow-sm">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header: Test Name + Badge */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-medium text-gray-900">{test.name}</h3>
                <Badge className={`${badgeColor} text-[10px] px-2 py-0.5 font-semibold`}>
                  {translateBadge(test.badge)}
                </Badge>
              </div>
              <p className="text-xs text-gray-600">{test.description}</p>
            </div>
          </div>

          {/* Metric 1: Precisión diagnóstica */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-600">Precisión diagnóstica</span>
              <span className="text-sm font-medium text-gray-900">{test.confidence}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${progressBarColor} transition-all duration-500`}
                style={{ width: `${test.confidence}%` }}
              />
            </div>
          </div>

          {/* Metric 2: Tiempo de ejecución */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Tiempo de ejecución</span>
            <span className="text-xs text-gray-900">{test.executionTime}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Export helper functions for use in parent components
export { translateBadge, getBadgeColor, getProgressBarColor };
