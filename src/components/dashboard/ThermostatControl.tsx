"use client"

import { cn } from "@/lib/utils"

export const ThermostatControl = ({ className }: { className?: string }) => (
  <div className={cn("border-card-ring bg-card rounded-xl p-2 sm:p-4 flex flex-col h-full", className)}>
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-base sm:text-lg font-semibold text-foreground">THERMOSTAT</h3>
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-xs sm:text-xs text-muted-foreground">Active</span>
      </div>
    </div>

    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="w-20 sm:w-32 h-20 sm:h-32 mx-auto relative mb-4">
        <div className="w-full h-full rounded-full border-2 sm:border-4 border-border relative">
          <div 
            className="w-full h-full rounded-full border-2 sm:border-4 border-primary absolute"
            style={{
              background: `conic-gradient(var(--primary) 0deg, var(--primary) 108deg, transparent 108deg)`
            }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg sm:text-xl font-bold text-foreground">15°C</p>
            <p className="text-xs text-muted-foreground">TARGET</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-xs sm:text-sm w-full mt-auto">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Mode</span>
          <span className="text-foreground">Cooling</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Fan Speed</span>
          <span className="text-foreground">Auto</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Current</span>
          <span className="text-foreground">18°C</span>
        </div>
      </div>
    </div>
  </div>
);