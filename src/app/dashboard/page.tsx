import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EnergyChart } from '@/components/dashboard/EnergyChart';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { SystemStatus } from '@/components/dashboard/SystemStatus';
import { WeatherCard } from '@/components/dashboard/WeatherCard';
import { DeviceControls } from '@/components/dashboard/DeviceControls';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
// Import other components as they are created

export default function Dashboard() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Smart Home Dashboard</h1>
        <div className="text-muted-foreground">Welcome back! Everything's running smoothly.</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <WeatherCard />
        <SystemStatus />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Energy Usage</CardTitle>
            <CardDescription>Today's energy consumption overview</CardDescription>
          </CardHeader>
          <CardContent>
            <EnergyChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Control your devices</CardDescription>
          </CardHeader>
          <CardContent>
            <QuickActions />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Device Controls</CardTitle>
            <CardDescription>Manage your smart devices</CardDescription>
          </CardHeader>
          <CardContent>
            <DeviceControls />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>What's happening in your home</CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityFeed />
        </CardContent>
      </Card>
    </div>
  );
}