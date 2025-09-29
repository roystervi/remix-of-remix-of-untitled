import { Wifi, Server, Smartphone, Router } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDashboardData } from '@/hooks/useDashboardData';

export function SystemStatus() {
  const { systemStatus } = useDashboardData();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'wifi': return Wifi;
      case 'hub': return Server;
      case 'devices': return Smartphone;
      case 'network': return Router;
      default: return Server;
    }
  };

  return (
    <Card className="min-h-[150px]">
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <Server className="h-4 w-4 sm:h-5 sm:w-5" />
          System Status
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-4 space-y-2 sm:space-y-4">
        {systemStatus.map((item) => {
          const Icon = getStatusIcon(item.type);
          return (
            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 min-w-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 flex-1">
                <div className="p-1 sm:p-2 rounded-md bg-accent w-full sm:w-auto">
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-sm leading-tight truncate">{item.name}</div>
                  <div className="text-xs text-muted-foreground leading-tight">{item.details}</div>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto">
                <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${getStatusColor(item.status)}`} />
                <Badge variant="outline" className="text-xs capitalize">
                  {item.status}
                </Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}