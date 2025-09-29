import { Zap, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ChartConfig, ChartContainer } from '@/components/ui/chart';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { useDashboardData } from '@/hooks/useDashboardData';

const chartConfig: ChartConfig = {
  energy: {
    label: "Energy",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const chartData = [
  { month: "Jan", energy: 186 },
  { month: "Feb", energy: 93 },
  { month: "Mar", energy: 400 },
  { month: "Apr", energy: 230 },
  { month: "May", energy: 100 },
  { month: "Jun", energy: 150 },
  { month: "Jul", energy: 250 },
  { month: "Aug", energy: 300 },
  { month: "Sep", energy: 180 },
  { month: "Oct", energy: 320 },
  { month: "Nov", energy: 280 },
  { month: "Dec", energy: 350 },
] as const;

export function EnergyChart() {
  const { energyData, loading } = useDashboardData();

  if (loading) {
    return (
      <Card className="border-card-ring col-span-3 lg:col-span-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Energy Consumption</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pl-2 space-y-4">
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="h-12 w-12 bg-muted rounded animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-32 animate-pulse" />
                  <div className="h-3 bg-muted/50 rounded w-24 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-card-ring col-span-3 lg:col-span-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Energy Consumption</CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="pl-2">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={chartData}>
              <XAxis 
                dataKey="month" 
                tickLine={false} 
                axisLine={false} 
                tickMargin={2}
                tickFormatter={(value) => value.slice(0, 1)}
                style={{ fontSize: '12px', fill: 'hsl(var(--chart-foreground))' }}
              />
              <YAxis 
                tickLine={false} 
                axisLine={false} 
                tickMargin={8}
                style={{ fontSize: '12px', fill: 'hsl(var(--chart-foreground))' }}
              />
              <Bar dataKey="energy" fill="hsl(var(--chart-1))" radius={4} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start space-y-2">
        <div className="text-xs text-muted-foreground">
          Showing monthly energy consumption data
        </div>
      </CardFooter>
    </Card>
  );
}