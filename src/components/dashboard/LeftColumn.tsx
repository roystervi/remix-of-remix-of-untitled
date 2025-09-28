"use client"

import { MoreHorizontal } from 'lucide-react';
import { ActivityFeed } from './ActivityFeed';
import { DeviceControls } from './DeviceControls';
import { QuickActions } from './QuickActions';

export const LeftColumn = () => (
  <div className="col-span-1 lg:col-span-4 h-full flex flex-col gap-4">
    <ActivityFeed />
    <div className="flex flex-col flex-1 gap-4">
      <QuickActions className="flex-1 min-h-[100px] sm:min-h-[125px]" />
      <DeviceControls className="flex-1 min-h-[100px] sm:min-h-[125px]" />
    </div>
  </div>
);