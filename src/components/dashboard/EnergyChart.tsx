import { Zap, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useDashboardData } from '@/hooks/useDashboardData';
import { cn } from '@/lib/utils';
import { ChartContainer, BarChart, BarChartContent, BarChartAxis, BarChartBars, BarChartLegend, BarChartTooltip, BarChartTooltipContent } from '@/components/ui/chart';

export function EnergyChart() {
  const { energyData } = useDashboardData();

  const maxUsage = Math.max(...energyData.hourlyUsage);
  
  return (
    <Card className="border-card-ring col-span-2 xl:col-span-3">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Energy Consumption</CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="pl-2">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <BarChart data={chartData}>
            <BarChart.Content>
              <BarChart.Bars dataKey="energy" ... />
              <BarChart.Axis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={2}
                tickFormatter={(value) => value.slice(0, 1)}
                style={{ fontSize: '12px', fill: 'hsl(var(--chart-foreground))' }}
              />
              <BarChart.Axis
                dataKey="energy"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                style={{ fontSize: '12px', fill: 'hsl(var(--chart-foreground))' }}
              />
            </BarChart.Content>
          </BarChart>
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