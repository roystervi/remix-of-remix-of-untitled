"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { hour: '00:00', usage: 400 },
  { hour: '04:00', usage: 300 },
  { hour: '08:00', usage: 500 },
  { hour: '12:00', usage: 450 },
  { hour: '16:00', usage: 600 },
  { hour: '20:00', usage: 550 },
  { hour: '24:00', usage: 400 },
];

export const EnergyChart = () => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="hour" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="usage" stroke="#8884d8" />
    </LineChart>
  </ResponsiveContainer>
);