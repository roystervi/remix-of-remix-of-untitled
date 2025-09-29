"use client"

import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts';
import { Loader2, AlertTriangle, ZapOff } from 'lucide-react';

const chartConfig: ChartConfig = {
  value: {
    label: 'Usage (kWh)',
    color: 'hsl(var(--primary))',
  },
  time: {
    label: 'Time',
    color: 'hsl(var(--muted))',
  },
} satisfies ChartConfig;

const data = [
  { time: '2024-04-01T08:00:00Z', value: 12.5 },
  { time: '2024-04-01T09:00:00Z', value: 18.2 },
  { time: '2024-04-01T10:00:00Z', value: 22.0 },
  { time: '2024-04-01T11:00:00Z', value: 19.5 },
  { time: '2024-04-01T12:00:00Z', value: 15.0 },
  { time: '2024-04-01T13:00:00Z', value: 10.8 },
  { time: '2024-04-01T14:00:00Z', value: 8.5 },
  { time: '2024-04-01T15:00:00Z', value: 12.0 },
  { time: '2024-04-01T16:00:00Z', value: 18.7 },
  { time: '2024-04-01T17:00:00Z', value: 25.3 },
  { time: '2024-04-01T18:00:00Z', value: 22.1 },
  { time: '2024-04-01T19:00:00Z', value: 18.9 },
  { time: '2024-04-01T20:00:00Z', value: 15.4 },
  { time: '2024-04-01T21:00:00Z', value: 12.2 },
  { time: '2024-04-01T22:00:00Z', value: 9.8 },
  { time: '2024-04-01T23:00:00Z', value: 7.5 },
];

const totalUsage = data.reduce((sum, item) => sum + item.value, 0);
const peakTime = '17:00';
const isLoading = false;
const error = null;

export const ElectricityChart = ({ className }: { className?: string }) => (
  <Card className={cn("border-card-ring col-span-1 lg:col-span-2", className)}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Electricity Usage</CardTitle>
      <Calendar className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="h-64">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading electricity data...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-destructive">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Failed to load electricity data
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <ZapOff className="h-8 w-8 mb-2" />
            <span>No electricity data available</span>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={data}>
                <CartesianGrid vertical={false} strokeOpacity={0.1} />
                <Tooltip content={<ChartTooltipContent />} />
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-primary)"
                  fill="url(#colorValue)"
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={false}
                />
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  }}
                  tickMargin={8}
                  style={{ fontSize: '0.75rem', fontWeight: '500' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value} kWh`}
                  style={{ fontSize: '0.75rem', fontWeight: '500' }}
                  tickMargin={12}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </div>
      <div className="pt-4 space-y-2 text-sm text-muted-foreground">
        <div className="flex justify-between">
          <span>Today's Usage:</span>
          <span className="font-medium">{totalUsage.toFixed(1)} kWh</span>
        </div>
        <div className="flex justify-between">
          <span>Peak Time:</span>
          <span className="font-medium">{peakTime}</span>
        </div>
        <div className="flex justify-between">
          <span>Cost Estimate:</span>
          <span className="font-medium">${(totalUsage * 0.15).toFixed(2)}</span>
        </div>
      </div>
    </CardContent>
  </Card>
);