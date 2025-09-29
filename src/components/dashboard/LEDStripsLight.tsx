"use client"

import { Settings, Power, Activity, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export const LEDStripsLight = ({ className }: { className?: string }) => {
  const [ledData, setLedData] = useState({ isOn: false, color: '#ffffff', brightness: 50 });
  const colors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff'];

  const handleLedToggle = (checked: boolean) => {
    setLedData(prev => ({ ...prev, isOn: checked }));
  };

  const setLedColor = (color: string) => {
    setLedData(prev => ({ ...prev, color }));
  };

  const setLedBrightness = (brightness: number) => {
    setLedData(prev => ({ ...prev, brightness }));
  };

  const handlePreset1 = () => {
    setLedColor('#ffd700');
    setLedBrightness(80);
  };

  const handlePreset2 = () => {
    setLedColor('#ff4500');
    setLedBrightness(60);
  };

  return (
    <Card className={cn('border-card-ring', className)}>
      <CardHeader>
        <CardTitle className="text-base">LED Strips</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium">Main Strip</span>
            </div>
            <Switch checked={ledData.isOn} onCheckedChange={handleLedToggle} />
          </div>
          
          <div className="grid grid-cols-5 gap-1 p-1 bg-black/20 rounded">
            {colors.map((color) => (
              <button
                key={color}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  ledData.color === color
                    ? 'border-primary scale-110 shadow-lg'
                    : 'border-transparent opacity-50 hover:opacity-100'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setLedColor(color)}
              />
            ))}
          </div>
          
          <div className="relative">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={ledData.brightness}
              onChange={(e) => setLedBrightness(parseInt(e.target.value))}
              disabled={!ledData.isOn}
              className={cn(
                "w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                ledData.isOn ? "accent-primary" : "accent-muted"
              )}
              style={{
                background: ledData.isOn
                  ? `linear-gradient(to right, #3b82f6 ${ledData.brightness}%, #e5e7eb ${ledData.brightness}%)`
                  : 'linear-gradient(to right, #e5e7eb 100%)'
              }}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handlePreset1}
            disabled={!ledData.isOn}
          >
            Sunrise
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handlePreset2}
            disabled={!ledData.isOn}
          >
            Sunset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};