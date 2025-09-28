import { db } from '@/db';
import { energyReadings } from '@/db/schema';

async function main() {
    const now = new Date();
    const currentTimestamp = now.toISOString();
    
    // Energy values for 24 hours - higher during work hours (9am-6pm), lower at night
    const energyValues = [
        45,   // 24 hours ago (night)
        42,   // 23 hours ago
        38,   // 22 hours ago
        35,   // 21 hours ago
        40,   // 20 hours ago
        48,   // 19 hours ago
        65,   // 18 hours ago (early morning)
        85,   // 17 hours ago
        120,  // 16 hours ago (work starts)
        165,  // 15 hours ago
        180,  // 14 hours ago (peak work)
        190,  // 13 hours ago
        185,  // 12 hours ago
        175,  // 11 hours ago
        195,  // 10 hours ago (peak)
        188,  // 9 hours ago
        170,  // 8 hours ago
        155,  // 7 hours ago (work ending)
        95,   // 6 hours ago (evening)
        75,   // 5 hours ago
        60,   // 4 hours ago
        52,   // 3 hours ago
        48,   // 2 hours ago
        45    // 1 hour ago
    ];
    
    const sampleEnergyReadings = energyValues.map((value, index) => {
        const hoursBack = 24 - index - 1;
        const timestamp = new Date(now.getTime() - (hoursBack * 60 * 60 * 1000));
        
        return {
            timestamp: timestamp.toISOString(),
            value: value.toString(),
            roomId: 5,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        };
    });

    await db.insert(energyReadings).values(sampleEnergyReadings);
    
    console.log('✅ Energy readings seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});