"use client"

import { MoreHorizontal } from 'lucide-react';
import { AccessoriesGrid } from './AccessoriesGrid';
import { MusicPlayer } from './MusicPlayer';
import { CameraLiveFeeds } from './CameraLiveFeeds';
import { DeviceControls } from './DeviceControls';
import { ActivityFeed } from './ActivityFeed';

export const LeftColumn = () => (
  <div className="col-span-1 lg:col-span-4 h-full flex flex-col gap-4">
    <AccessoriesGrid />
    <DeviceControls className="mb-4" />
    <div className="flex flex-col flex-1 gap-4">
      <ActivityFeed className="flex-1 min-h-[100px] sm:min-h-[125px]" />
      <CameraLiveFeeds className="flex-1 min-h-[100px] sm:min-h-[125px]" />
      <MusicPlayer className="flex-1 min-h-[100px] sm:min-h-[125px]" />
    </div>
  </div>
);