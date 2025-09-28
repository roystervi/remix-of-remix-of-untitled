import { db } from '@/db';
import { audioLevels } from '@/db/schema';

async function main() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const sampleAudioLevels = [
        {
            deviceId: 1,
            level: 65,
            timestamp: new Date(oneHourAgo.getTime() + 5 * 60 * 1000).toISOString(),
        },
        {
            deviceId: 2,
            level: 72,
            timestamp: new Date(oneHourAgo.getTime() + 10 * 60 * 1000).toISOString(),
        },
        {
            deviceId: 1,
            level: 58,
            timestamp: new Date(oneHourAgo.getTime() + 15 * 60 * 1000).toISOString(),
        },
        {
            deviceId: 3,
            level: 83,
            timestamp: new Date(oneHourAgo.getTime() + 20 * 60 * 1000).toISOString(),
        },
        {
            deviceId: 2,
            level: 76,
            timestamp: new Date(oneHourAgo.getTime() + 25 * 60 * 1000).toISOString(),
        },
        {
            deviceId: 1,
            level: 54,
            timestamp: new Date(oneHourAgo.getTime() + 35 * 60 * 1000).toISOString(),
        },
        {
            deviceId: 3,
            level: 89,
            timestamp: new Date(oneHourAgo.getTime() + 40 * 60 * 1000).toISOString(),
        },
        {
            deviceId: 2,
            level: 67,
            timestamp: new Date(oneHourAgo.getTime() + 45 * 60 * 1000).toISOString(),
        },
        {
            deviceId: 1,
            level: 61,
            timestamp: new Date(oneHourAgo.getTime() + 50 * 60 * 1000).toISOString(),
        },
        {
            deviceId: 3,
            level: 78,
            timestamp: new Date(oneHourAgo.getTime() + 55 * 60 * 1000).toISOString(),
        }
    ];

    await db.insert(audioLevels).values(sampleAudioLevels);
    
    console.log('✅ Audio levels seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});