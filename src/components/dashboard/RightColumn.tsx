"use client"

import { SystemStatus } from './SystemStatus';
import { WeatherCard } from './WeatherCard';
import { EnergyChart } from './EnergyChart';

export const RightColumn = () => (
  <div className="col-span-1 lg:col-span-8 h-full flex flex-col gap-4">
    <SystemStatus />
    
    {/* Energy & Weather Row */}
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
      <EnergyChart className="h-full" />
      <WeatherCard className="h-full" />
    </div>
  </div>
);