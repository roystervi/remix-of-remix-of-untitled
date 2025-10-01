import { CloudSun, Thermometer, Droplets } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const WeatherCard = () => (
  <div className="text-center space-y-4">
    <CloudSun className="h-12 w-12 mx-auto text-primary" />
    <div>
      <h3 className="text-lg font-semibold">Sunny</h3>
      <p className="text-muted-foreground">72°F</p>
    </div>
    <div className="flex items-center justify-center space-x-4">
      <div className="flex items-center space-x-1">
        <Thermometer className="h-4 w-4" />
        <span className="text-sm">Feels like 70°F</span>
      </div>
      <div className="flex items-center space-x-1">
        <Droplets className="h-4 w-4" />
        <span className="text-sm">Humidity: 45%</span>
      </div>
    </div>
    <Badge className="px-3 py-1">Clear Sky</Badge>
  </div>
);