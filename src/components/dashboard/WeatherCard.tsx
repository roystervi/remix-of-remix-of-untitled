import { Cloud, Sun, Droplets, Wind, Eye, Gauge, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardData } from '@/hooks/useDashboardData';

export function WeatherCard() {
  const { weather, isLoadingWeather } = useDashboardData();

  if (isLoadingWeather) {
    return (
      <Card className="min-h-[150px]">
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Cloud className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            Loading Weather...
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-4 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const WeatherIcon = weather.condition?.includes('sunny') || weather.condition?.includes('clear') ? Sun : Cloud;

  return (
    <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-primary/30 min-h-[150px]">
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <WeatherIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
          Current Weather
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-4 gap-2">
          <div>
            <div className="text-2xl sm:text-3xl font-bold">{weather.temperature}°</div>
            <div className="text-xs sm:text-base text-muted-foreground capitalize">{weather.condition}</div>
          </div>
          <WeatherIcon className="h-8 w-8 sm:h-12 sm:w-12 text-blue-400" />
        </div>
        
        <div className="grid grid-cols-2 gap-1 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-1 sm:gap-2">
            <Droplets className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
            <span>Humidity {weather.humidity}%</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Wind className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
            <span>Wind {weather.windSpeed} {weather.windSpeed < 10 ? 'mph' : 'km/h'}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
            <span>Visibility {weather.visibility} mi</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Gauge className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
            <span>Pressure {weather.pressure} inHg</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}