"use client"

import React from 'react';
import { 
  Home, 
  Plus, 
  Music,
  Snowflake,
  Moon,
  Smartphone as SmartHome,
  Mic,
  X,
  Settings 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSidebarClass } from '@/lib/dashboard-utils';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BarChart3 } from 'lucide-react';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  audioLevels: number[];
  screenSize: 'mobile' | 'tablet' | 'desktop';
}

export const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen, audioLevels, screenSize }) => {
  const router = useRouter();

  const sidebarClasses = cn(
    "fixed inset-y-0 left-0 z-50 w-72 bg-sidebar flex flex-col",
    screenSize === 'desktop' ? 'translate-x-0 shadow-lg' : sidebarOpen ? 'translate-x-0' : '-translate-x-full',
    "transition-transform duration-300 ease-in-out"
  );

  return (
    <div className={sidebarClasses}>
      {screenSize !== 'desktop' ? (
        <div className="p-4 border-b border-border bg-sidebar flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Menu</h2>
          <button 
            className="p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="p-4 border-b border-border bg-sidebar">
          <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
        </div>
      )}

      <div className="p-6 flex-1 overflow-y-auto">
        {/* Voice Assistance - Moved to Top */}
        <div className="bg-muted rounded-2xl p-4 mb-6">
          <h4 className="text-sm font-semibold mb-3 text-foreground">Voice assistance</h4>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center flex-shrink-0">
              <Mic className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Hey Javis,</p>
              <p className="text-sm text-muted-foreground truncate">turn off all lights</p>
            </div>
            <button 
              onClick={() => router.push('/settings?tab=ai-connections')}
              className="p-1 text-muted-foreground hover:text-foreground ml-auto"
              title="Manage voice entities"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
          
          {/* Audio Visualization */}
          <div className="flex items-end justify-center gap-1 h-16" suppressHydrationWarning={true}>
            {audioLevels.map((level, i) => (
              <div
                key={i}
                className="bg-gradient-to-t from-primary to-primary/80 rounded-full w-1 audio-bar"
                style={{
                  height: `${level}%`,
                  animationDelay: `${(i * 0.1).toFixed(1)}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* My Rooms Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">My Rooms</h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Entrance */}
            <button 
              onClick={() => router.push('/rooms/entrance')}
              className="bg-card rounded-xl p-3 flex flex-col items-center cursor-pointer hover:bg-accent transition-colors"
            >
              <Home className="w-6 h-6 mb-2 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Entrance</p>
            </button>

            {/* Backyard */}
            <button 
              onClick={() => router.push('/rooms/backyard')}
              className="bg-card rounded-xl p-3 flex flex-col items-center cursor-pointer hover:bg-accent transition-colors"
            >
              <Home className="w-6 h-6 mb-2 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Backyard</p>
            </button>

            {/* Living Room */}
            <button 
              onClick={() => router.push('/rooms/living')}
              className="bg-card rounded-xl p-3 flex flex-col items-center cursor-pointer hover:bg-accent transition-colors"
            >
              <Home className="w-6 h-6 mb-2 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Living Room</p>
            </button>

            {/* Front Room */}
            <button 
              onClick={() => router.push('/rooms/front')}
              className="bg-card rounded-xl p-3 flex flex-col items-center cursor-pointer hover:bg-accent transition-colors"
            >
              <Home className="w-6 h-6 mb-2 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Front Room</p>
            </button>

            {/* My Workstation - Highlighted */}
            <div className="bg-primary rounded-xl p-3 flex flex-col items-center cursor-pointer relative">
              <Home className="w-6 h-6 mb-2 text-primary-foreground" />
              <p className="text-sm font-medium text-primary-foreground">My Workstation</p>
              <button 
                onClick={() => router.push('/dashboard')}
                className="absolute inset-0"
                aria-label="Go to My Workstation"
              />
            </div>

            {/* Add New Room */}
            <button className="border-2 border-dashed border-border rounded-xl p-3 flex flex-col items-center hover:border-primary transition-colors" onClick={() => router.push('/rooms/new')}>
              <Plus className="w-6 h-6 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground mt-1">Add new</p>
            </button>
          </div>
        </div>

        {/* Set Room Environment Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Set room environment</h3>
          <div className="flex gap-3 pb-2 overflow-x-auto">
            {/* Music Mode */}
            <button className="flex flex-col items-center p-3 rounded-lg hover:bg-accent transition-colors min-w-[60px]" onClick={() => router.push('/modes/music')}>
              <Music className="w-5 h-5 mb-1 text-foreground" />
              <span className="text-xs text-foreground">Music</span>
              <span className="text-xs text-foreground">Mode</span>
            </button>

            {/* Cool */}
            <button className="flex flex-col items-center p-3 rounded-lg hover:bg-accent transition-colors min-w-[60px]" onClick={() => router.push('/modes/cool')}>
              <Snowflake className="w-5 h-5 mb-1 text-foreground" />
              <span className="text-xs text-foreground">Cool</span>
            </button>

            {/* Night */}
            <button className="flex flex-col items-center p-3 rounded-lg hover:bg-accent transition-colors min-w-[60px]" onClick={() => router.push('/modes/night')}>
              <Moon className="w-5 h-5 mb-1 text-foreground" />
              <span className="text-xs text-foreground">Night</span>
            </button>

            {/* Smart Home */}
            <button className="flex flex-col items-center p-3 rounded-lg hover:bg-accent transition-colors min-w-[60px]" onClick={() => router.push('/modes/smart')}>
              <SmartHome className="w-5 h-5 mb-1 text-foreground" />
              <span className="text-xs text-foreground">Smart</span>
              <span className="text-xs text-foreground">Home</span>
            </button>
          </div>

          {/* Analytics Link - Added */}
          <Link href="/analytics" className={cn("mt-4 flex items-center gap-3 w-full p-3 rounded-xl bg-card hover:bg-accent transition-colors", getSidebarClass(true, screenSize))}>
            <BarChart3 className="w-5 h-5 text-foreground" />
            <span className="text-sm font-medium text-foreground">Analytics</span>
          </Link>

          {/* Settings Link */}
          <Link href="/settings" className={cn("mt-2 flex items-center gap-3 w-full p-3 rounded-xl bg-card hover:bg-accent transition-colors", getSidebarClass(false, screenSize))}>
            <Settings className="w-5 h-5 text-foreground" />
            <span className="text-sm font-medium text-foreground">Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
}