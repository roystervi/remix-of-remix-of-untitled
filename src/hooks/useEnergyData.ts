import { useState, useEffect } from 'react';

interface EnergyData {
  current: number; // kW
  today: number; // kWh
  monthly: number; // kWh (replaces savings)
  deviceMonthlyTotal: number;
  hourlyUsage: number[]; // 24 hours
}

export function useEnergyData() {
  const [energyData, setEnergyData] = useState<EnergyData>({
    current: 0,
    today: 0,
    monthly: 0,
    deviceMonthlyTotal: 0,
    hourlyUsage: Array(24).fill(0)
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnergyData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/ha-energy-data');
        if (response.ok) {
          const data = await response.json();
          // Merge with defaults if some fields missing
          setEnergyData(prev => ({ ...prev, ...data }));
        } else {
          const err = await response.json();
          setError(err.error || 'Failed to fetch energy data');
          console.warn('Using mock energy data:', err);
        }
      } catch (err) {
        setError('Network error fetching energy data');
        console.error('Energy data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnergyData();

    // Refresh every 30 seconds for real-time
    const interval = setInterval(fetchEnergyData, 30000);
    return () => clearInterval(interval);
  }, []);

  return { energyData, isLoading, error };
}