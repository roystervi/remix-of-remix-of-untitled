"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface HomeAssistantContextType {
  entities: Record<string, any>;
  isConnected: boolean;
  error: string | null;
  connect: (url: string, token: string) => Promise<void>;
  disconnect: () => void;
}

const HomeAssistantContext = createContext<HomeAssistantContextType | null>(null);

export function HomeAssistantProvider({ children }: { children: ReactNode }) {
  const [entities, setEntities] = useState<Record<string, any>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = async (url: string, token: string) => {
    try {
      setError(null);
      setIsConnected(false);
      // Simulate connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsConnected(true);
      // Mock entities data for demo
      setEntities({
        'sensor.bobby_s_energy_this_month': {
          state: '450',
          attributes: { friendly_name: 'Monthly Energy', unit_of_measurement: 'kWh' },
          last_changed: new Date().toISOString(),
        },
        'sensor.bobby_s_energy_today': {
          state: '15.2',
          attributes: { friendly_name: 'Daily Energy', unit_of_measurement: 'kWh' },
          last_changed: new Date().toISOString(),
        },
        'sensor.bobby_s_power_minute_average': {
          state: '2.3',
          attributes: { friendly_name: 'Power Average', unit_of_measurement: 'kW' },
          last_changed: new Date().toISOString(),
        },
        // Add more mock entities as needed
        'sensor.air_handler_energy_this_month': {
          state: '120',
          attributes: { friendly_name: 'Air Handler', unit_of_measurement: 'kWh' },
          last_changed: new Date().toISOString(),
        },
        'sensor.fridge_energy_this_month': {
          state: '45',
          attributes: { friendly_name: 'Fridge', unit_of_measurement: 'kWh' },
          last_changed: new Date().toISOString(),
        },
        // ... other devices from DEVICE_ICONS in EnergyMonitor
      });
    } catch (err) {
      setError('Connection failed');
      setIsConnected(false);
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setEntities({});
    setError(null);
  };

  return (
    <HomeAssistantContext.Provider value={{ entities, isConnected, error, connect, disconnect }}>
      {children}
    </HomeAssistantContext.Provider>
  );
}

export const useHomeAssistant = () => {
  const context = useContext(HomeAssistantContext);
  if (!context) {
    throw new Error('useHomeAssistant must be used within HomeAssistantProvider');
  }
  return context;
};