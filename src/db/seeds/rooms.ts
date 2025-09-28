import { db } from '@/db';
import { rooms } from '@/db/schema';

async function main() {
    const currentTimestamp = new Date().toISOString();
    
    const sampleRooms = [
        {
            name: 'Entrance',
            createdAt: currentTimestamp,
        },
        {
            name: 'Backyard',
            createdAt: currentTimestamp,
        },
        {
            name: 'Living Room',
            createdAt: currentTimestamp,
        },
        {
            name: 'Front Room',
            createdAt: currentTimestamp,
        },
        {
            name: 'My Workstation',
            createdAt: currentTimestamp,
        },
    ];

    await db.insert(rooms).values(sampleRooms);
    
    console.log('✅ Rooms seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});