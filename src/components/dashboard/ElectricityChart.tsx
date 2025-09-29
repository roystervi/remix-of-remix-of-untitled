"use client"

import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ElectricityChart = ({ className }: { className?: string }) => (
  <div className={cn("border-2 border-primary/30 bg-card rounded-xl p-2 sm:p-4 flex-1 flex flex-col min-h-[200px]", className)}>
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
      <h3 className="text-base sm:text-lg font-semibold text-foreground text-center sm:text-left">ELECTRICITY CONSUMED</h3>
      <div className="flex items-center gap-2">
        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
        <span className="text-xs sm:text-sm text-muted-foreground">Past 6 months</span>
      </div>
    </div>

    <div className="flex-1 flex flex-col">
      {/* Chart */}
      <div className="h-24 sm:h-32 relative mb-4 flex">
        {/* Y-axis labels - Now visible on mobile with adjusted width */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] sm:text-xs text-muted-foreground w-4 sm:w-8 flex-shrink-0 pl-1 sm:pl-2">
          <span className="text-left leading-none">100%</span>
          <span className="text-left leading-none">75%</span>
          <span className="text-left leading-none">50%</span>
          <span className="text-left leading-none">25%</span>
          <span className="text-left leading-none">0%</span>
        </div>
        <svg className="flex-1 h-full ml-4 sm:ml-8" viewBox="0 0 300 120">
          <defs>
            <linearGradient id="energyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path
            d="M 0 80 Q 50 60 100 70 T 200 60 T 300 50"
            stroke="#3b82f6"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M 0 80 Q 50 60 100 70 T 200 60 T 300 50 L 300 120 L 0 120 Z"
            fill="url(#energyGradient)"
          />
        </svg>
      </div>

      {/* X-axis labels - Responsive spacing */}
      <div className="flex justify-between text-xs text-muted-foreground px-2">
        <span className="min-w-0 truncate">APR</span>
        <span className="min-w-0 truncate">MAY</span>
        <span className="min-w-0 truncate">JUN</span>
        <span className="min-w-0 truncate">JUL</span>
        <span className="min-w-0 truncate">AUG</span>
        <span className="min-w-0 truncate">SEP</span>
      </div>
    </div>
  </div>
);