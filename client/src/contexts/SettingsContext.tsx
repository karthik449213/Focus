import { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Settings, InsertSettings } from '@shared/schema';

interface SettingsContextType {
  settings: Settings | null;
  updateSettings: (settings: Partial<InsertSettings>) => Promise<void>;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  
  const { data: settings, isLoading } = useQuery<Settings>({
    queryKey: ['/api/settings'],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<InsertSettings>) => {
      const response = await apiRequest('PUT', '/api/settings', newSettings);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    },
  });

  const updateSettings = async (newSettings: Partial<InsertSettings>) => {
    await updateSettingsMutation.mutateAsync(newSettings);
  };

  return (
    <SettingsContext.Provider value={{ 
      settings: settings || null, 
      updateSettings, 
      isLoading 
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
