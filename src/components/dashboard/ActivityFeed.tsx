import { Clock, Lightbulb, Lock, Thermometer, Shield, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useState } from 'react';

export function ActivityFeed() {
  const [showAll, setShowAll] = useState(false);
  const { recentActivity, loading } = useDashboardData();
  const filteredActivities = showAll ? recentActivity : recentActivity?.slice(0, 5) || [];

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'light': return 'bg-yellow-500';
      case 'lock': return 'bg-blue-500';
      case 'thermostat': return 'bg-red-500';
      case 'security': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (recentActivity === undefined) return <div>Loading...</div>;

  return (
    <Card className="border-card-ring col-span-1 sm:col-span-2 lg:col-span-3">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setShowAll(!showAll)}>
          <span className="sr-only">Toggle view all</span>
          {showAll ? 'Show Recent' : 'Show All'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="h-12 w-12 bg-muted rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted/50 rounded animate-pulse w-3/4" />
                </div>
                <div className="text-xs text-muted-foreground">1 min ago</div>
              </div>
            ))}
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2" />
            <p>No recent activity</p>
          </div>
        ) : (
          <div className={`space-y-3 ${showAll ? '' : 'max-h-96 overflow-y-auto'}`}>
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-accent/50 rounded-lg transition-colors">
                <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${getActivityColor(activity.type)}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight">{activity.message}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span>{activity.device}</span>
                    <span>•</span>
                    <span>{activity.time}</span>
                  </div>
                </div>
                {activity.icon && (
                  <div className="flex-shrink-0 ml-2">
                    {activity.icon}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}