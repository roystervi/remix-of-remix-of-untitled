"use client"

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

export const DeviceControls = () => {
  const [lightsOn, setLightsOn] = useState(true);
  const [acOn, setAcOn] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Living Room Lights</span>
        <Switch checked={lightsOn} onCheckedChange={setLightsOn} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Air Conditioner</span>
        <Switch checked={acOn} onCheckedChange={setAcOn} />
      </div>
      <Button className="w-full">Sync All Devices</Button>
    </div>
  );
};