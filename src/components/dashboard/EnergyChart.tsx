"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockEnergyData } from '@/data/mockDashboardData';
import { calculateEnergyUsage } from '@/lib/dashboard-utils';
import { TrendingUp } from 'lucide-react';

const data = calculateEnergyUsage(mockEnergyData);

export const EnergyChart = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4" />
        Energy Usage
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="labels" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="data" stroke="var(--primary)" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);