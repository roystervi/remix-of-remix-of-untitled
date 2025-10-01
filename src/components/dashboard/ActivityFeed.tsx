"use client";

import { ScrollArea } from '@/components/ui/scroll-area';
import { formatTime } from '@/lib/dashboard-utils';
import { mockActivities } from '@/data/mockDashboardData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, User } from 'lucide-react';

export const ActivityFeed = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {mockActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-2 rounded-md border">
                <div className="text-sm text-muted-foreground">
                  {formatTime(activity.time)}
                </div>
                <div className="flex-1">
                  <span className="font-medium">{activity.action}</span> {activity.entity} by <User className="h-3 w-3 inline" /> {activity.user}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};