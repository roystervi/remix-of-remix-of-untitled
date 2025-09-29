import { Wifi, Server, Smartphone, Router, Cpu, Clock, Activity, Thermometer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

export function SystemStatus() {
  const { systemStatus, loading, uptime, cpuUsage, memoryUsage, storageUsage, networkUsage, temperature, lastCheck } = useDashboardData();

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
    <Card className="border-card-ring">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-4 w-4" />
          System Status
        </CardTitle>
        <CardDescription>Overall system health and performance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="space-y-1">
                <div className="h-4 bg-muted/80 rounded w-32 animate-pulse" />
                <div className="h-3 bg-muted/50 rounded w-24 animate-pulse" />
              </div>
              <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="space-y-1">
                <div className="h-4 bg-muted/80 rounded w-32 animate-pulse" />
                <div className="h-3 bg-muted/50 rounded w-24 animate-pulse" />
              </div>
              <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="space-y-1">
                <div className="h-4 bg-muted/80 rounded w-32 animate-pulse" />
                <div className="h-3 bg-muted/50 rounded w-24 animate-pulse" />
              </div>
              <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="space-y-1">
                <div className="h-4 bg-muted/80 rounded w-32 animate-pulse" />
                <div className="h-3 bg-muted/50 rounded w-24 animate-pulse" />
              </div>
              <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="space-y-1">
                <div className="h-4 bg-muted/80 rounded w-32 animate-pulse" />
                <div className="h-3 bg-muted/50 rounded w-24 animate-pulse" />
              </div>
              <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent">
              <div>
                <div className="font-medium">System Uptime</div>
                <div className={`text-sm text-green-500`}>{uptime || 'Calculating...'}</div>
              </div>
              <Clock className="h-5 w-5 text-green-500" />
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent">
              <div>
                <div className="font-medium">CPU Usage</div>
                <div className={`text-sm text-blue-500`}>
                  {cpuUsage ? `${cpuUsage.toFixed(1)}%` : 'N/A'}
                </div>
              </div>
              <Cpu className="h-5 w-5 text-blue-500" />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent">
              <div>
                <div className="font-medium">Memory Usage</div>
                <div className={`text-sm text-purple-500`}>
                  {memoryUsage ? `${memoryUsage.toFixed(1)}%` : 'N/A'}
                </div>
              </div>
              <Activity className="h-5 w-5 text-purple-500" />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent">
              <div>
                <div className="font-medium">Storage Usage</div>
                <div className={`text-sm text-orange-500`}>
                  {storageUsage ? `${storageUsage.toFixed(1)}%` : 'N/A'}
                </div>
              </div>
              <Activity className="h-5 w-5 text-orange-500" />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent">
              <div>
                <div className="font-medium">Network Usage</div>
                <div className={`text-sm text-indigo-500`}>
                  {networkUsage ? `${networkUsage.toFixed(1)} Mbps` : 'N/A'}
                </div>
              </div>
              <Wifi className="h-5 w-5 text-indigo-500" />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent">
              <div>
                <div className="font-medium">Temperature</div>
                <div className="text-sm text-red-500">{temperature || 'N/A'}°C</div>
              </div>
              <Thermometer className="h-5 w-5 text-red-500" />
            </div>
            
            <Separator />
            
            <Alert>
              <Activity className="h-4 w-4">
                <AlertTitle>System Check Complete</AlertTitle>
                <AlertDescription>
                  All services are running optimally. Last check: {lastCheck || 'Never'}
                </AlertDescription>
              </Activity>
            </Alert>
          </>
        )}
      </CardContent>
    </Card>
  );
}