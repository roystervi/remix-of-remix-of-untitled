"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockWeather } from '@/data/mockDashboardData';
import { Thermometer, Sun, CloudRain } from 'lucide-react';

const getIcon = (condition: string) => {
  if (condition.toLowerCase().includes('sunny')) return <Sun className="h-8 w-8 text-yellow-500" />;
  if (condition.toLowerCase().includes('rain')) return <CloudRain className="h-8 w-8 text-blue-500" />;
  return <Thermometer className="h-8 w-8" />;
};

export const WeatherCard = () => (
  <Card>
    <CardHeader>
      <CardTitle>Weather</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-3xl font-bold">{mockWeather.current.temp}°F</div>
        {getIcon(mockWeather.current.condition)}
        <div className="text-sm text-muted-foreground">{mockWeather.current.condition}</div>
      </div>
      <div className="space-y-2">
        <span className="text-sm font-medium">Hourly:</span>
        <div className="flex gap-4">
          {mockWeather.forecast.map((hour, i) => (
            <div key={i} className="text-center">
              <div className="text-xs">{hour.time}</div>
              <div className="font-medium">{hour.temp}°</div>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);