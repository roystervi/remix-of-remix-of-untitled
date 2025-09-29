import { Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardData } from '@/hooks/useDashboardData';

export function EnergyChart() {
  const { energyData } = useDashboardData();

  const maxUsage = Math.max(...energyData.hourlyUsage);
  
  return (
    <Card className="min-h-[150px] sm:min-h-[200px]">
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
          Energy Usage
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="text-center p-2 sm:p-3 rounded-lg bg-green-500/10">
            <div className="text-lg sm:text-2xl font-bold text-green-400">{energyData.current}kW</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Current Usage</div>
          </div>
          <div className="text-center p-2 sm:p-3 rounded-lg bg-blue-500/10">
            <div className="text-lg sm:text-2xl font-bold text-blue-400">{energyData.today}kWh</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Today</div>
          </div>
          <div className="text-center p-2 sm:p-3 rounded-lg bg-purple-500/10">
            <div className="flex items-center justify-center gap-1 text-base sm:text-lg font-bold text-purple-400">
              <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />
              {energyData.savings}%
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">vs Last Month</div>
          </div>
        </div>
        
        <div className="space-y-1 sm:space-y-2">
          <div className="flex flex-col sm:flex-row justify-between text-xs sm:text-sm text-muted-foreground gap-1 sm:gap-0">
            <span>24 Hour Usage</span>
            <span>Peak: {maxUsage}kW</span>
          </div>
          <div className="flex items-end gap-0.5 sm:gap-1 h-16 sm:h-20">
            {energyData.hourlyUsage.map((usage, index) => (
              <div
                key={index}
                className="flex-1 bg-gradient-to-t from-yellow-500 to-yellow-300 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity min-w-0"
                style={{ height: `${(usage / maxUsage) * 100}%` }}
                title={`${index}:00 - ${usage}kW`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}