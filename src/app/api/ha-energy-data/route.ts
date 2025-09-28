import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { homeAssistantConnections } from '@/db/schema';
import { eq } from 'drizzle-orm';

const ENERGY_ENTITIES = {
  current: 'sensor.bobby_s_power_minute_average', // kW
  today: 'sensor.bobby_s_energy_today', // kWh
  monthly: 'sensor.bobby_s_energy_this_month', // kWh
  // Device monthly energies for total calculation
  devicesMonthly: [
    'sensor.air_handler_energy_this_month',
    'sensor.den_garage_energy_this_month',
    'sensor.driveway_receptacle_energy_this_month',
    'sensor.fridge_energy_this_month',
    'sensor.hallway_manifold_energy_this_month',
    'sensor.heat_pump_energy_this_month',
    'sensor.hot_water_tank_energy_this_month',
    'sensor.jen_liv_rm_recp_hallw_energy_this_month',
    'sensor.kitchen_receptacles_energy_this_month',
    'sensor.masterbed_floor_heating_energy_this_month',
    'sensor.network_switch_energy_this_month',
    'sensor.pump_energy_this_month',
    'sensor.stove_energy_this_month',
    'sensor.washer_receptacles_energy_this_month'
  ]
};

export async function GET(request: NextRequest) {
  try {
    // Fetch the stored Home Assistant connection
    const connections = await db.select()
      .from(homeAssistantConnections)
      .limit(1);

    if (connections.length === 0) {
      return NextResponse.json({ 
        error: "No connection configured",
        code: "NO_CONNECTION_CONFIGURED" 
      }, { status: 400 });
    }

    const connection = connections[0];

    // Check if connection is in connected state
    if (connection.status !== 'connected') {
      return NextResponse.json({ 
        error: "Home Assistant not connected",
        code: "NOT_CONNECTED",
        status: connection.status
      }, { status: 400 });
    }

    const energyData: any = {
      current: 0,
      today: 0,
      monthly: 0, // Replaces savings
      deviceMonthlyTotal: 0,
      hourlyUsage: Array(24).fill(0) // Mock for now
    };

    // Fetch each energy entity in parallel
    const fetchPromises = Object.entries(ENERGY_ENTITIES).filter(([key]) => key !== 'devicesMonthly').map(async ([key, entityId]) => {
      const haApiUrl = `${connection.url}/api/states/${entityId}`;
      const haResponse = await fetch(haApiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${connection.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (haResponse.ok) {
        const entityState = await haResponse.json();
        const stateValue = parseFloat(entityState.state) || 0;
        energyData[key as keyof typeof energyData] = stateValue;
      } else if (haResponse.status === 404) {
        console.warn(`Energy entity not found: ${entityId}`);
      } else {
        console.error(`Error fetching ${entityId}: ${haResponse.status}`);
      }
    });

    // Fetch device monthly totals in parallel
    const devicePromises = ENERGY_ENTITIES.devicesMonthly.map(async (entityId: string) => {
      const haApiUrl = `${connection.url}/api/states/${entityId}`;
      const haResponse = await fetch(haApiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${connection.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (haResponse.ok) {
        const entityState = await haResponse.json();
        return parseFloat(entityState.state) || 0;
      }
      return 0;
    });

    const deviceValues = await Promise.all(devicePromises);
    energyData.deviceMonthlyTotal = deviceValues.reduce((sum, val) => sum + val, 0);

    // Combine main monthly with devices if needed (adjust logic as per your setup)
    energyData.monthly += energyData.deviceMonthlyTotal; // Assuming additive; tweak if overlapping

    await Promise.all(fetchPromises);

    // For hourly usage, could fetch history but keep mock for simplicity
    // energyData.hourlyUsage = await fetchHistory(...);

    return NextResponse.json(energyData);

  } catch (error) {
    console.error('GET ha-energy-data error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}