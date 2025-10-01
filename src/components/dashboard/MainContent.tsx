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
import { JavisAssistant } from './JavisAssistant';

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
    <div className="p-2 sm:p-4 md:p-6 h-full overflow-auto">
      {/* Unified Header - Visible on all sizes */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        {/* Left: Menu + Title */}
        <div className="flex items-center gap-2 min-w-0">
          <button 
            onClick={() => setSidebarOpen(prev => !prev)}
            className="p-1 sm:p-2 flex-shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold truncate">My Workstation</h1>
            <p className="hidden md:block text-xs md:text-sm text-muted-foreground">12 Devices running</p>
          </div>
        </div>
        
        {/* Right: Weather + Time + Menu */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Weather */}
          <div className="flex items-center gap-2 hidden sm:flex">
            <Cloud className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            <div>
              <p className="text-xs sm:text-sm font-medium">{isLoadingWeather ? 'Loading...' : displayCondition}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {isLoadingWeather ? '...' : `${displayTemp}${unit}`}
              </p>
            </div>
          </div>
          
          {/* Time */}
          <div className="text-right hidden sm:block">
            <p className="text-base sm:text-lg font-bold">12:45pm</p>
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center justify-end gap-1">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              Sep 24th
            </p>
          </div>

          {/* Menu Popup */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-8 sm:w-8">
                <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('Help clicked')} className="cursor-pointer">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Help</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('Logout clicked')} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Grid - Responsive */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4">
        <LeftColumn />
        <RightColumn />
      </div>

      <JavisAssistant />
    </div>
  );
};