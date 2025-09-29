"use client"

import { Plus, Cloud, Calendar, Menu, Settings, User, HelpCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { LeftColumn } from './LeftColumn';
import { RightColumn } from './RightColumn';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useDashboardData } from '@/hooks/useDashboardData';

interface MainContentProps {
  setSidebarOpen: (open: boolean) => void;
}

export const MainContent: React.FC<MainContentProps> = ({ setSidebarOpen }) => {
  const router = useRouter();
  const { weather, isLoadingWeather } = useDashboardData();

  const displayTemp = weather.temperature; // Assuming units from settings, display as is
  const displayCondition = weather.condition || 'Loading...';
  const unit = '°'; // Can enhance to show °F/°C based on settings if needed

  return (
    <main className="p-4 sm:p-6 lg:p-8 bg-background min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Quick Actions - Full width on mobile, span 3 on desktop */}
        <div className="lg:col-span-3">
          <QuickActions />
        </div>
        
        {/* System Status - Full width on mobile, right column on desktop */}
        <div className="lg:col-span-1">
          <SystemStatus />
        </div>
        
        {/* Main Dashboard Grid */}
        <div className="lg:col-span-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Activity Feed - Spans 3 columns on large screens */}
            <div className="lg:col-span-3">
              <ActivityFeed />
            </div>
            
            {/* Weather Card - Right column */}
            <div className="lg:col-span-1">
              <WeatherCard />
            </div>
            
            {/* Charts row */}
            <div className="lg:col-span-3">
              <EnergyChart />
            </div>
            
            <div className="lg:col-span-1">
              <ElectricityChart />
            </div>
            
            {/* Camera and Device Controls */}
            <div className="lg:col-span-2">
              <CameraLiveFeeds />
            </div>
            
            <div className="lg:col-span-2">
              <DeviceControls />
            </div>
            
            {/* Accessories and LED Strips */}
            <div className="lg:col-span-2">
              <AccessoriesGrid />
            </div>
            
            <div className="lg:col-span-2">
              <LEDStripsLight />
            </div>
            
            {/* Music Player - Bottom row */}
            <div className="lg:col-span-4">
              <MusicPlayer />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};