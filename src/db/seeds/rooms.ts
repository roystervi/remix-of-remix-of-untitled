import { db } from '@/db';
import { rooms } from '@/db/schema';

async function main() {
    const sampleRooms = [
        {
            name: 'Living Room',
            createdAt: new Date('2024-01-15T10:30:00Z').toISOString(),
        },
        {
            name: 'Kitchen',
            createdAt: new Date('2024-01-16T14:45:00Z').toISOString(),
        },
        {
            name: 'Bedroom',
            createdAt: new Date('2024-01-17T09:15:00Z').toISOString(),
        }
    ];

    await db.insert(rooms).values(sampleRooms);
    
    console.log('✅ Rooms seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});