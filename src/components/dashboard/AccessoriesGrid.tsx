"use client"

import { Wifi, Monitor, MoreHorizontal, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardTitle } from '@/components/ui/card';

export const AccessoriesGrid = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* Nest Wi-Fi */}
    <div className="border-2 border-primary/30 rounded-xl p-2 sm:p-4 relative hover:bg-accent transition-colors h-24 sm:h-32 flex flex-col bg-card">
      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center mb-2 sm:mb-3">
        <Wifi className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
      </div>
      <div className="mt-auto">
        <p className="text-xs sm:text-sm font-medium mb-1 text-foreground">Nest Wi-Fi</p>
        <p className="text-xs text-muted-foreground">Running</p>
      </div>
      <MoreHorizontal className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground absolute top-2 sm:top-4 right-2 sm:right-4" />
    </div>

    {/* Sony TV */}
    <div className="border-2 border-primary/30 rounded-xl p-2 sm:p-4 relative hover:bg-accent transition-colors h-24 sm:h-32 flex flex-col bg-card">
      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-lg flex items-center justify-center mb-2 sm:mb-3">
        <Monitor className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </div>
      <div className="mt-auto">
        <p className="text-xs sm:text-sm font-medium mb-1 text-foreground">Sony TV</p>
        <p className="text-xs text-muted-foreground">Running</p>
      </div>
      <MoreHorizontal className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground absolute top-2 sm:top-4 right-2 sm:right-4" />
    </div>

    {/* Router */}
    <div className="border-2 border-primary/30 rounded-xl p-2 sm:p-4 relative hover:bg-accent transition-colors h-24 sm:h-32 flex flex-col bg-card">
      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-lg flex items-center justify-center mb-2 sm:mb-3">
        <div className="w-4 h-3 sm:w-5 sm:h-3 bg-background rounded-sm flex flex-col justify-center">
          <div className="h-px bg-muted mx-0.5 sm:mx-1" />
          <div className="h-px bg-muted mx-0.5 sm:mx-1 mt-0.5 sm:mt-1" />
          <div className="h-px bg-muted mx-0.5 sm:mx-1 mt-0.5 sm:mt-1" />
        </div>
      </div>
      <div className="mt-auto">
        <p className="text-xs sm:text-sm font-medium mb-1 text-foreground">Router</p>
        <p className="text-xs text-muted-foreground">Turned off</p>
      </div>
      <MoreHorizontal className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground absolute top-2 sm:top-4 right-2 sm:right-4" />
    </div>
  </div>
);