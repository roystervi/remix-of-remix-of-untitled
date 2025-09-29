"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Zap, Activity, Gauge, BarChart3, Calendar, Wifi, Clock, AlertCircle, CheckCircle, Thermometer } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');

interface EnergyData {
  totalKwh: number;
  avgKwh: number;
  totalCost: number;
  deviceBreakdowns: Array<{
    deviceId: number;
    deviceName: string;
    totalKwh: number;
    totalCost: number;
  }>;
}

interface ActivityData {
  id: number;
  activityType: string;
  timestamp: string;
  duration: number;
  deviceId: number;
  deviceName: string;
}

interface PerformanceData {
  latest: Record<string, { value: number; timestamp: string }>;
  history: Array<{
    id: number;
    metricType: string;
    value: number;
    timestamp: string;
  }>;
  pagination: {
    limit: number;
    offset: number;
    count: number;
    hasMore: boolean;
  };
}

const AnalyticsPage: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('energy');
  const [energyData, setEnergyData] = useState<EnergyData | null>(null);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [energyRes, activityRes, perfRes] = await Promise.all([
          fetch(`/api/analytics/energy?period=${period}`),
          fetch(`/api/analytics/activity?period=${period === 'month' ? 'week' : period}`),
          fetch('/api/analytics/performance')
        ]);

        if (!energyRes.ok || !activityRes.ok || !perfRes.ok) {
          throw new Error('Failed to fetch analytics data');
        }

        const energy = await energyRes.json();
        const activity = await activityRes.json();
        const perf = await perfRes.json();

        setEnergyData(energy);
        setActivityData(activity);
        setPerformanceData(perf);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        toast.error('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Tabs value="energy" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </TabsList>
          <TabsContent value="energy" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Analytics</h1>
          <Button variant="outline" onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">Error Loading Data</h3>
                <p className="text-sm">{error}</p>
                <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 bg-background text-foreground min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.push('/')} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Analytics</h1>
        </div>
        <Button variant="outline" onClick={() => setPeriod(period === 'day' ? 'week' : 'day')} className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {period === 'day' ? 'Weekly View' : 'Daily View'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="energy">
            <Zap className="h-4 w-4 mr-2" />
            Energy
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="h-4 w-4 mr-2" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Gauge className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="energy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Energy Usage Overview - {period.charAt(0).toUpperCase() + period.slice(1)}
              </CardTitle>
              <CardDescription>
                Total consumption: {energyData?.totalKwh?.toFixed(2)} kWh | Estimated cost: ${energyData?.totalCost?.toFixed(2)} | Avg: {energyData?.avgKwh?.toFixed(2)} kWh {period}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {energyData?.deviceBreakdowns?.length > 0 ? (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-3xl font-bold text-primary">{energyData.totalKwh.toFixed(2)} kWh</div>
                        <p className="text-sm text-muted-foreground mt-1">Total {period.charAt(0).toUpperCase() + period.slice(1)}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-3xl font-bold text-destructive">${energyData.totalCost.toFixed(2)}</div>
                        <p className="text-sm text-muted-foreground mt-1">Total Cost</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-3xl font-bold text-secondary">{energyData.avgKwh.toFixed(2)} kWh</div>
                        <p className="text-sm text-muted-foreground mt-1">Average per Entry</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Device Breakdown</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Device</TableHead>
                          <TableHead>Usage (kWh)</TableHead>
                          <TableHead>Cost ($)</TableHead>
                          <TableHead>Share (%)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {energyData.deviceBreakdowns.map((breakdown) => {
                          const share = ((breakdown.totalKwh / energyData.totalKwh) * 100).toFixed(1);
                          return (
                            <TableRow key={breakdown.deviceId}>
                              <TableCell className="font-medium">{breakdown.deviceName}</TableCell>
                              <TableCell>{breakdown.totalKwh.toFixed(2)}</TableCell>
                              <TableCell>${breakdown.totalCost.toFixed(2)}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">{share}%</Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Zap className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No energy data available for this period.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Device Activity - {period.charAt(0).toUpperCase() + period.slice(1)}
              </CardTitle>
              <CardDescription>
                Recent device interactions ({activityData.length} events)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activityData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Device</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activityData.slice(0, 20).map((item) => {
                      const time = new Date(item.timestamp).toLocaleString();
                      const durationMin = (item.duration / 60).toFixed(1);
                      const badgeVariant = item.activityType.includes('on') || item.activityType.includes('play') ? 'default' : 'secondary';
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.deviceName}</TableCell>
                          <TableCell>
                            <Badge variant={badgeVariant}>{item.activityType}</Badge>
                          </TableCell>
                          <TableCell>{time}</TableCell>
                          <TableCell>{durationMin} min</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No activity data for this period.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                System Performance
              </CardTitle>
              <CardDescription>
                Latest metrics and historical trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              {performanceData ? (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(performanceData.latest).map(([key, value]) => {
                      const metricIcon = key.includes('uptime') ? CheckCircle : 
                        key.includes('error') ? AlertCircle : 
                        key === 'machine_temperature' ? Thermometer : 
                        Gauge;
                      const formattedValue = key === 'machine_temperature' ? `${value.value}°C` :
                        key.includes('uptime') ? `${value.value}%` : 
                        key.includes('time') ? `${value.value}ms` : 
                        value.value;
                      return (
                        <Card key={key}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 rounded-full bg-primary/10">
                                <metricIcon className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium capitalize">{key.replace('_', ' ')}</h4>
                                <p className="text-sm text-muted-foreground">Updated: {new Date(value.timestamp).toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="text-2xl font-bold">{formattedValue}</div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Recent History (Last 20)</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Metric</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {performanceData.history.slice(0, 20).map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium capitalize">{item.metricType.replace('_', ' ')}</TableCell>
                            <TableCell>
                              {item.metricType.includes('uptime') ? `${item.value}%` : 
                               item.metricType.includes('time') ? `${item.value}ms` : item.value}
                            </TableCell>
                            <TableCell>{new Date(item.timestamp).toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Gauge className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No performance data available.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;