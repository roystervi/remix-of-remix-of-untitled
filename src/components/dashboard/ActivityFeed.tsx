import { Clock, User, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDashboardData } from '@/hooks/useDashboardData';

export const ActivityFeed = ({ className }: { className?: string }) => {
  const { devices } = useDashboardData();

  const activities = [
    { time: '2 min ago', icon: User, text: 'John logged in', type: 'success' },
    { time: '5 min ago', icon: Clock, text: `Device ${devices[0]?.name || 'Light'} turned on`, type: 'info' },
    { time: '10 min ago', icon: AlertTriangle, text: 'Low battery on sensor', type: 'warning' },
  ];

  return (
    <div className={cn("border border-border rounded-lg p-4 bg-card", className)}>
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Recent Activity
      </h3>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {activities.map((activity, i) => (
          <div key={i} className="flex items-center gap-3 text-sm">
            <activity.icon className={`w-4 h-4 ${activity.type === 'warning' ? 'text-destructive' : 'text-muted-foreground'}`} />
            <span className="flex-1">{activity.text}</span>
            <span className="text-xs text-muted-foreground">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};