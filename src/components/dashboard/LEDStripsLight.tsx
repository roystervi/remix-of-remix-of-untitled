"use client"

import { Settings, Power, Activity, Lightbulb, Switch, Slider, SliderTrack, SliderRange, SliderThumb, Button, Card, CardHeader, CardTitle, CardContent, CardFooter } from 'lucide-react';
import { cn } from '@/lib/utils';

export const LEDStripsLight = ({ className }: { className?: string }) => (
  <Card className="border-card-ring">
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
          {colors.map((color, index) => (
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
        
        <Slider
          value={[ledData.brightness]}
          onValueChange={(value) => setLedBrightness(value[0])}
          max={100}
          step={1}
          className="w-full"
          disabled={!ledData.isOn}
        >
          <SliderTrack className="bg-muted">
            <SliderRange className={`bg-primary ${!ledData.isOn ? 'bg-muted' : ''}`} />
          </SliderTrack>
          <SliderThumb className={`h-5 w-5 rounded-full ${!ledData.isOn ? 'bg-muted' : 'bg-primary'}`} />
        </Slider>
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