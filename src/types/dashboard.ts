export interface Device {
  id: string;
  name: string;
  type: 'light' | 'thermostat' | 'lock' | 'speaker';
  room: string;
  isOn: boolean;
  brightness?: number;
  temperature?: number;
}

export interface RecentActivity {
  id: string;
  type: 'light' | 'lock' | 'thermostat' | 'security';
  message: string;
  location: string;
  time: string;
}

export interface EnergyData {
  current: number;
  today: number;
  savings: number;
  hourlyUsage: number[];
}

export interface SystemStatusItem {
  id: string;
  name: string;
  type: 'wifi' | 'hub' | 'devices' | 'network';
  status: 'online' | 'warning' | 'offline';
  details: string;
}

export interface Weather {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  pressure: number;
}

export interface DashboardData {
  weather: Weather;
  devices: Device[];
  energyData: EnergyData;
  recentActivity: RecentActivity[];
  systemStatus: SystemStatusItem[];
}