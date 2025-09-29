import type { DashboardData } from '@/types/dashboard'

export const generateMockData = (): DashboardData => ({
  devices: [
    {
      id: '1',
      name: 'Living Room Light',
      type: 'light',
      status: true,
      power: 10
    },
    {
      id: '2',
      name: 'Thermostat',
      type: 'thermostat',
      status: true,
      temperature: 72
    },
    {
      id: '3',
      name: 'Security Camera',
      type: 'camera',
      status: true
    },
    {
      id: '4',
      name: 'Music Player',
      type: 'audio',
      status: true,
      power: 50
    },
    {
      id: '5',
      name: 'Energy Monitor',
      type: 'sensor',
      status: true,
      power: 150
    }
  ],
  weather: {
    temperature: 72,
    condition: 'Sunny'
  }
});