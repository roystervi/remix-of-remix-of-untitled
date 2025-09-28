import { db } from '@/db';
import { devices } from '@/db/schema';

async function main() {
    const sampleDevices = [
        // Living Room devices (roomId: 1)
        {
            roomId: 1,
            name: 'Main Ceiling Light',
            type: 'light',
            status: true,
            lastUpdated: new Date('2024-01-15T08:30:00Z').toISOString(),
        },
        {
            roomId: 1,
            name: 'Table Lamp',
            type: 'light',
            status: false,
            lastUpdated: new Date('2024-01-15T20:45:00Z').toISOString(),
        },
        {
            roomId: 1,
            name: 'Living Room Speaker',
            type: 'speaker',
            status: true,
            lastUpdated: new Date('2024-01-15T19:15:00Z').toISOString(),
        },
        {
            roomId: 1,
            name: 'Smart Thermostat',
            type: 'thermostat',
            status: true,
            lastUpdated: new Date('2024-01-15T07:00:00Z').toISOString(),
        },
        {
            roomId: 1,
            name: 'Floor Lamp',
            type: 'light',
            status: false,
            lastUpdated: new Date('2024-01-15T22:30:00Z').toISOString(),
        },
        // Kitchen devices (roomId: 2)
        {
            roomId: 2,
            name: 'Kitchen Ceiling Light',
            type: 'light',
            status: true,
            lastUpdated: new Date('2024-01-15T06:45:00Z').toISOString(),
        },
        {
            roomId: 2,
            name: 'Under Cabinet Lights',
            type: 'light',
            status: true,
            lastUpdated: new Date('2024-01-15T18:20:00Z').toISOString(),
        },
        {
            roomId: 2,
            name: 'Kitchen Smart Speaker',
            type: 'speaker',
            status: false,
            lastUpdated: new Date('2024-01-15T12:10:00Z').toISOString(),
        },
        {
            roomId: 2,
            name: 'Pendant Light',
            type: 'light',
            status: false,
            lastUpdated: new Date('2024-01-15T21:15:00Z').toISOString(),
        },
        // Bedroom devices (roomId: 3)
        {
            roomId: 3,
            name: 'Bedroom Ceiling Light',
            type: 'light',
            status: false,
            lastUpdated: new Date('2024-01-15T23:00:00Z').toISOString(),
        },
        {
            roomId: 3,
            name: 'Bedside Lamp Left',
            type: 'light',
            status: true,
            lastUpdated: new Date('2024-01-15T22:45:00Z').toISOString(),
        },
        {
            roomId: 3,
            name: 'Bedside Lamp Right',
            type: 'light',
            status: false,
            lastUpdated: new Date('2024-01-15T23:15:00Z').toISOString(),
        },
        {
            roomId: 3,
            name: 'Bedroom Speaker',
            type: 'speaker',
            status: true,
            lastUpdated: new Date('2024-01-15T20:30:00Z').toISOString(),
        },
        {
            roomId: 3,
            name: 'Reading Light',
            type: 'light',
            status: false,
            lastUpdated: new Date('2024-01-15T22:00:00Z').toISOString(),
        }
    ];

    await db.insert(devices).values(sampleDevices);
    
    console.log('✅ Smart home devices seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});