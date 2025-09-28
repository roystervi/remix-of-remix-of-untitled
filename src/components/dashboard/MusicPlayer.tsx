"use client"

import { Volume2, MoreHorizontal, SkipBack, SkipForward, Pause, Music } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MusicPlayerProps {
  className?: string;
}

export const MusicPlayer = ({ className }: MusicPlayerProps) => (
  <div className={cn("border-2 border-primary/30 bg-card rounded-xl p-2 sm:p-4 flex flex-col min-h-[250px]", className)}>
    <div className="flex items-center gap-2 sm:gap-3 mb-4">
      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-lg flex items-center justify-center">
        <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </div>
      <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground ml-auto" />
    </div>
    
    <div className="mb-4">
      <p className="text-xs sm:text-sm font-medium mb-1 text-foreground leading-tight">Rainy day relaxing sound</p>
      <p className="text-xs text-muted-foreground leading-tight">Currently playing</p>
    </div>

    <div className="flex-1 flex flex-col">
      <div className="flex-1 w-full min-h-20 sm:min-h-32 bg-gradient-to-br from-green-600 to-green-800 rounded-lg mb-3 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-muted-foreground">2:32</span>
        <div className="flex-1 h-1 sm:h-1 bg-muted rounded-full">
          <div className="w-1/3 h-full bg-primary rounded-full" />
        </div>
        <span className="text-xs text-muted-foreground">7:32</span>
      </div>

      <div className="flex items-center justify-center gap-4 mt-auto">
        <SkipBack className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
        <button className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors">
          <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
        </button>
        <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
        <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
      </div>
    </div>
  </div>
);