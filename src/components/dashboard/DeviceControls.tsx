"use client";

import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { mockDevices } from '@/data/mockDashboardData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic } from 'lucide-react';
import { getDeviceState } from '@/lib/dashboard-utils';

export const DeviceControls = () => {
  const handleToggle = (id: string) => {
    // Mock toggle - update state
    console.log(`Toggle ${id}`);
  };

  const handleVoice = (name: string) => {
    // Trigger Javis: e.g., toast or event
    const utterance = new SpeechSynthesisUtterance(`Hey Javis, turn on ${name.toLowerCase()}`);
    speechSynthesis.speak(utterance);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Devices</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockDevices.map((device) => {
          const { icon, color } = getDeviceState(device.domain, device.state);
          return (
            <div key={device.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`${color} text-lg`}>{icon}</span>
                <span>{device.name}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${device.state === 'on' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {device.state}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={device.state === 'on'} onCheckedChange={() => handleToggle(device.id)} />
                <Button variant="ghost" size="sm" onClick={() => handleVoice(device.name)}>
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};