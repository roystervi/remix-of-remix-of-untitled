"use client"

import { WiFiRouterStats } from './WiFiRouterStats';
import { LEDStripsLight } from './LEDStripsLight';
import { ThermostatControl } from './ThermostatControl';
import { ElectricityChart } from './ElectricityChart';
import { MCPEntityStatus } from './MCPEntityStatus';
import { DeviceControls } from './DeviceControls';
import { EnergyChart } from './EnergyChart';
import { WeatherCard } from './WeatherCard';

export const RightColumn = () => (
  <div className="col-span-1 lg:col-span-8 h-full flex flex-col gap-4">
    <WiFiRouterStats />
    
    {/* LED & Thermostat Row */}
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
      <LEDStripsLight className="h-full" />
      <ThermostatControl className="h-full" />
    </div>
    
    <ElectricityChart className="min-h-[200px] sm:min-h-[250px]" />
    
    <div className="col-span-1 lg:col-span-4 space-y-4">
      <MCPEntityStatus />
      <DeviceControls />
      <EnergyChart />
      <WeatherCard />
    </div>
  </div>
);