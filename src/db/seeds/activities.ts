import { db } from '@/db';
import { activities } from '@/db/schema';

async function main() {
    const now = new Date();
    const currentTimestamp = now.toISOString();
    
    const sampleActivities = [
        {
            roomId: 3,
            description: 'Turned on living room light',
            timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
            type: 'action',
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            roomId: 4,
            description: 'Voice command: turn off bedroom lamp',
            timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
            type: 'voice_command',
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            roomId: 1,
            description: 'Motion detected in entrance',
            timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
            type: 'status_change',
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            roomId: 5,
            description: 'Workstation monitor powered on',
            timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
            type: 'action',
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            roomId: 3,
            description: 'Temperature adjusted in living room',
            timestamp: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
            type: 'action',
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        }
    ];

    await db.insert(activities).values(sampleActivities);
    
    console.log('✅ Activities seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});