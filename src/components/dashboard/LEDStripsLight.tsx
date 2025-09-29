"use client"

import { Settings, Power, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export const LEDStripsLight = ({ className }: { className?: string }) => (
  <div className={cn("border-card-ring bg-card rounded-xl p-2 sm:p-4 flex flex-col h-full", className)}>
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-base sm:text-lg font-semibold text-foreground">LED STRIPS LIGHT</h3>
      <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
    </div>
    
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="w-20 sm:w-32 h-20 sm:h-32 mx-auto relative mb-4">
        <div className="w-full h-full rounded-full border-4 sm:border-8 border-border relative">
          <div className="absolute inset-0 rounded-full border-4 sm:border-8 border-transparent border-t-primary border-r-primary animate-spin" />
          <div className="absolute inset-1 sm:inset-2 rounded-full border-2 sm:border-4 border-muted" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold text-foreground">35%</p>
            <p className="text-xs text-muted-foreground">Brightness</p>
          </div>
        </div>
        <button className="absolute -bottom-1 sm:-bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors">
          <Power className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
        </button>
      </div>

      <div className="space-y-2 mt-auto">
        <h4 className="text-xs sm:text-sm font-medium text-muted-foreground">EFFECTS</h4>
        <div className="flex gap-2 justify-center">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-red-500 to-yellow-500 rounded cursor-pointer hover:scale-110 transition-transform" />
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded cursor-pointer hover:scale-110 transition-transform" />
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded border-2 border-primary cursor-pointer hover:scale-110 transition-transform" />
        </div>
      </div>
    </div>
  </div>
);