"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { generateMockData } from '@/lib/mockData'
import type { DashboardData, Device } from '@/types/dashboard'
import type { DashboardProviderValue } from './types' // Wait, no need, inline

type DashboardProviderValue = DashboardData & {
  updateDevice: (id: string, updates: Partial<Device>) => void
}

const DashboardContext = createContext<DashboardProviderValue | null>(null)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(() => generateMockData())
  const [weather, setWeather] = useState(data.weather);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setIsLoadingWeather(true);
        const response = await fetch('/api/weather');
        if (response.ok) {
          const realWeather = await response.json();
          setWeather(realWeather);
          // Update full data
          setData(prev => ({ ...prev, weather: realWeather }));
        } else {
          console.warn('Using mock weather data');
          // Keep mock
        }
      } catch (error) {
        console.error('Weather fetch error:', error);
        // Keep mock as fallback
      } finally {
        setIsLoadingWeather(false);
      }
    };

    fetchWeather();

    // Refresh every 3 minutes
    const interval = setInterval(fetchWeather, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const updateDevice = (id: string, updates: Partial<Device>) => {
    setData(prev => ({
      ...prev,
      devices: prev.devices.map(device => 
        device.id === id ? { ...device, ...updates } : device
      )
    }))
  }

  const value = {
    ...data,
    weather: weather, // Use possibly updated weather
    updateDevice,
    isLoadingWeather
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}

export const useDashboardContext = () => {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboardContext must be used within a DashboardProvider')
  }
  return context
}