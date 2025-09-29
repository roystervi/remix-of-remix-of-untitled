"use client"

import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, LineChart, LineChartContent, LineChartArea, LineChartLine, LineChartDots, LineChartTooltip, LineChartXAxis, LineChartYAxis, LineChartLegend } from '@/components/ui/line-chart';
import { ChartConfig, ChartTooltipContent, ChartTooltipLabel, ChartTooltipSeparator } from '@/components/ui/chart';
import { Loader2, AlertTriangle, ZapOff } from 'lucide-react';

export const ElectricityChart = ({ className }: { className?: string }) => (
  <Card className="border-card-ring col-span-1 lg:col-span-2">
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
          <ChartContainer config={chartConfig}>
            <LineChart data={data}>
              <LineChart.Content>
                <LineChart.Area />
                <LineChart.Line type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={2} />
                <LineChart.Dots dataKey="value" />
                <LineChart.Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    color: 'hsl(var(--foreground))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                />
                <LineChart.XAxis
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
                <LineChart.YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value} kWh`}
                  style={{ fontSize: '0.75rem', fontWeight: '500' }}
                  tickMargin={12}
                />
              </LineChart.Content>
              <LineChart.Legend content={false} />
            </LineChart>
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
          <span className="font-medium">{peakTime || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span>Cost Estimate:</span>
          <span className="font-medium">${(totalUsage * 0.15).toFixed(2)}</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Chart config
const chartConfig = {
  value: {
    label: 'Usage (kWh)',
    color: 'var(--color-primary)',
  },
  time: {
    label: 'Time',
    color: 'var(--color-muted)',
  },
} satisfies ChartConfig;

// Mock data
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