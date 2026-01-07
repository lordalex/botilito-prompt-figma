import { supabase } from '@/utils/supabase/client';
import { DashboardResponse, Region, TimeFrame } from './types';

export const fetchDashboardData = async (
  region: Region = 'andina',
  timeframe: TimeFrame = 'weekly'
): Promise<DashboardResponse> => {
  const { data, error } = await supabase.functions.invoke('mapa-desinfodemico-verbose', {
    body: { region, timeframe },
    method: 'POST',
  });

  if (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }

  return data as DashboardResponse;
};
