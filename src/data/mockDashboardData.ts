export const mockActivities = [
  { id: 1, entity: 'light.den', action: 'turned on', time: '2025-09-30T10:30:00Z', user: 'Voice Command' },
  { id: 2, entity: 'switch.kitchen_fan', action: 'turned off', time: '2025-09-30T09:45:00Z', user: 'Manual' },
  // More samples
];

export const mockDevices = [
  { id: 'light.den', name: 'Den Light', state: 'off', domain: 'light' },
  { id: 'switch.kitchen_fan', name: 'Kitchen Fan', state: 'on', domain: 'switch' },
  // From MCP
];

export const mockEnergyData = [120, 150, 180, 140, 200, 160]; // kWh hourly

export const mockWeather = {
  current: { temp: 72, condition: 'Sunny', icon: '☀️' },
  forecast: [{ time: '11:00', temp: 75 }, { time: '12:00', temp: 78 }],
};

export const mockSystemStatus = {
  connected: true,
  load: 0.5,
  exposedCount: 5,
  lastSync: '2025-09-30T10:00:00Z',
};