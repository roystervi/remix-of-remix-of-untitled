import { Clock, Lightbulb, Lock, Thermometer, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDashboardData } from '@/hooks/useDashboardData';

export function ActivityFeed() {
  const { recentActivity } = useDashboardData();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'light': return Lightbulb;
      case 'lock': return Lock;
      case 'thermostat': return Thermometer;
      case 'security': return Shield;
      default: return Clock;
    }
  };

  return (
    <Card className="min-h-[150px]">
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-4">
        <div className="space-y-2 sm:space-y-3">
          {recentActivity.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            return (
              <div key={activity.id} className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-1 sm:p-2 rounded-lg hover:bg-accent/50 transition-colors min-w-0">
                <div className="p-1 sm:p-2 rounded-md bg-accent w-full sm:w-auto">
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm leading-tight truncate">{activity.message}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground leading-tight">{activity.location}</div>
                </div>
                <div className="text-right sm:self-start w-full sm:w-auto">
                  <Badge variant="outline" className="text-xs">
                    {activity.time}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}