"use client"

import { Camera, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CameraLiveFeedsProps {
  className?: string;
}

const mockCamera = {
  id: 1,
  name: 'Front Door',
  status: 'online' as const,
};

export const CameraLiveFeeds = ({ className }: CameraLiveFeedsProps) => (
  <div className={cn("border-2 border-primary/30 bg-card rounded-xl p-4 flex flex-col min-h-[125px] sm:min-h-[150px]", className)}>
    <div className="flex items-center gap-2 mb-4">
      <Camera className="w-5 h-5 text-blue-500" />
      <h3 className="text-sm font-medium text-foreground">Live Camera Feed</h3>
    </div>
    
    <div className="flex-1 relative">
      <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg overflow-hidden">
        {mockCamera.status === 'offline' ? (
          <div className="absolute inset-0 flex items-center justify-center bg-destructive/20">
            <WifiOff className="w-6 h-6 text-destructive" />
          </div>
        ) : (
          <div className="absolute bottom-2 right-2 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-background" />
        )}
      </div>
      <div className="absolute bottom-2 left-2 text-xs text-background font-medium">
        {mockCamera.name}
      </div>
      <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${
        mockCamera.status === 'online' ? 'bg-green-500 text-background' : 'bg-destructive text-background'
      }`}>
        {mockCamera.status.toUpperCase()}
      </span>
    </div>
  </div>
);