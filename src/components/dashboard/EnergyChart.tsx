import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { useDashboardData } from '@/hooks/useDashboardData';

const mockEnergyData = [
  { time: '00:00', value: 120 },
  { time: '04:00', value: 150 },
  { time: '08:00', value: 200 },
  { time: '12:00', value: 180 },
  { time: '16:00', value: 220 },
  { time: '20:00', value: 160 },
  { time: '24:00', value: 140 },
];

export const EnergyChart = ({ className }: { className?: string }) => {
  const { devices } = useDashboardData();
  const totalEnergy = devices.reduce((sum, d) => sum + (d.power || 0), 0);

  return (
    <div className={cn("border border-border rounded-lg p-4 bg-card", className)}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Energy Usage</h3>
        <span className="text-2xl font-bold text-primary">{totalEnergy} kWh</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={mockEnergyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="var(--primary)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};