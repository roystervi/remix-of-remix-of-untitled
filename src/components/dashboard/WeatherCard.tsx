import { CloudRain, Thermometer, Wind } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeatherCardProps {
  weather: { temperature: number; condition: string };
  isLoading: boolean;
  className?: string;
}

export const WeatherCard = ({ weather, isLoading, className }: WeatherCardProps) => {
  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2 px-2 py-1 rounded-md bg-muted", className)}>
        <div className="w-3 h-3 bg-muted-foreground animate-pulse rounded-full" />
        <span className="text-xs">Loading...</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2 px-3 py-2 rounded-md bg-card border", className)}>
      <CloudRain className="w-4 h-4 text-muted-foreground" />
      <div className="text-right">
        <p className="text-sm font-medium">{weather.condition}</p>
        <p className="text-xs text-muted-foreground">{weather.temperature}°</p>
      </div>
      <Thermometer className="w-3 h-3 ml-auto text-muted-foreground" />
    </div>
  );
};