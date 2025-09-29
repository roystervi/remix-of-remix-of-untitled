import type { DashboardData } from '@/types/dashboard';

export function generateMockData(): DashboardData {
  return {
    weather: {
      temperature: 72,
      condition: 'partly cloudy',
      humidity: 65,
      windSpeed: 8,
      visibility: 10,
      pressure: 30.12,
    },
    devices: [
      {
        id: '1',
        name: 'Living Room',
        type: 'light',
        room: 'Main Floor',
        isOn: true,
        brightness: 75,
      },
      {
        id: '2',
        name: 'Thermostat',
        type: 'thermostat',
        room: 'Main Floor',
        isOn: true,
        temperature: 72,
      },
      {
        id: '3',
        name: 'Front Door',
        type: 'lock',
        room: 'Entrance',
        isOn: true,
      },
      {
        id: '4',
        name: 'Kitchen Speaker',
        type: 'speaker',
        room: 'Kitchen',
        isOn: false,
      },
    ],
    energyData: {
      current: 2.4,
      today: 28.5,
      savings: 12,
      hourlyUsage: [1.2, 0.8, 0.6, 0.5, 0.7, 1.1, 1.8, 2.3, 2.1, 1.9, 2.2, 2.8, 3.1, 2.9, 2.6, 2.4, 2.7, 3.2, 3.5, 3.1, 2.8, 2.3, 1.8, 1.4],
    },
    recentActivity: [
      {
        id: '1',
        type: 'light',
        message: 'Bedroom lights turned off',
        location: 'Master Bedroom',
        time: '2 min ago',
      },
      {
        id: '2',
        type: 'lock',
        message: 'Front door locked',
        location: 'Main Entrance',
        time: '5 min ago',
      },
      {
        id: '3',
        type: 'thermostat',
        message: 'Temperature set to 70°F',
        location: 'Living Room',
        time: '12 min ago',
      },
      {
        id: '4',
        type: 'security',
        message: 'Security system armed',
        location: 'Home',
        time: '25 min ago',
      },
    ],
    systemStatus: [
      {
        id: '1',
        name: 'WiFi Network',
        type: 'wifi',
        status: 'online',
        details: '54 Mbps',
      },
      {
        id: '2',
        name: 'Smart Hub',
        type: 'hub',
        status: 'online',
        details: 'v2.1.4',
      },
      {
        id: '3',
        name: 'Connected Devices',
        type: 'devices',
        status: 'warning',
        details: '23 of 25 online',
      },
      {
        id: '4',
        name: 'Network Security',
        type: 'network',
        status: 'online',
        details: 'Protected',
      },
    ],
  };
}