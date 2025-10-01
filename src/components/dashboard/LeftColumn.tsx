"use client"

import { MoreHorizontal } from 'lucide-react';
import { AccessoriesGrid } from './AccessoriesGrid';
import { MusicPlayer } from './MusicPlayer';
import { CameraLiveFeeds } from './CameraLiveFeeds';
import { QuickActions } from './QuickActions';
import { SystemStatus } from './SystemStatus';
import { MCPEntityStatus } from './MCPEntityStatus';
import { ActivityFeed } from './ActivityFeed';

export const LeftColumn = () => (
  <div className="col-span-1 lg:col-span-4 h-full flex flex-col gap-4">
    <AccessoriesGrid />
    <div className="flex flex-col flex-1 gap-4">
      <div className="space-y-4">
        <QuickActions />
        <SystemStatus />
        
        <MCPEntityStatus />
        
        <ActivityFeed />
      </div>
      <CameraLiveFeeds className="flex-1 min-h-[100px] sm:min-h-[125px]" />
      <MusicPlayer className="flex-1 min-h-[100px] sm:min-h-[125px]" />
    </div>
  </div>
);