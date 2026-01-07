import React from 'react';
import { UnifiedDashboardLayout, TabDefinition } from '@/components/layout/UnifiedDashboardLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Region, TimeFrame } from '../types';

interface MapaLayoutProps {
  region: Region;
  setRegion: (r: Region) => void;
  timeframe: TimeFrame;
  setTimeframe: (t: TimeFrame) => void;
  activeTab: string;
  setActiveTab: (t: any) => void;
  tabs: TabDefinition[];
  children: React.ReactNode;
}

export function MapaLayout({
  region,
  setRegion,
  timeframe,
  setTimeframe,
  activeTab,
  setActiveTab,
  tabs,
  children
}: MapaLayoutProps) {
  
  // Custom Filters Injected into the Generic Header
  const MapaFilters = (
    <>
      <Select value={region} onValueChange={(v: Region) => setRegion(v)}>
        <SelectTrigger className="w-[180px] bg-white border-0 shadow-md rounded-lg h-10 font-bold text-gray-800 hover:bg-gray-50 transition-colors focus:ring-0">
          <SelectValue placeholder="Región" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="andina">Región Andina</SelectItem>
          <SelectItem value="caribe">Región Caribe</SelectItem>
          <SelectItem value="pacifica">Región Pacífica</SelectItem>
          <SelectItem value="global">Consolidado Nacional</SelectItem>
        </SelectContent>
      </Select>
      
      <Select value={timeframe} onValueChange={(v: TimeFrame) => setTimeframe(v)}>
        <SelectTrigger className="w-[150px] bg-white border-0 shadow-md rounded-lg h-10 font-bold text-gray-800 hover:bg-gray-50 transition-colors focus:ring-0">
          <SelectValue placeholder="Periodo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="daily">Diario</SelectItem>
          <SelectItem value="weekly">Semanal</SelectItem>
          <SelectItem value="monthly">Mensual</SelectItem>
        </SelectContent>
      </Select>
    </>
  );

  return (
    <UnifiedDashboardLayout
      pageKey="mapa"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      headerContent={MapaFilters}
    >
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        {children}
      </div>
    </UnifiedDashboardLayout>
  );
}
