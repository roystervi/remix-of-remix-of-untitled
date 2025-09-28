import { db } from '@/db';
import { deviceActivity } from '@/db/schema';

async function main() {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));

    const sampleDeviceActivity = [
        // Device 16 (light) - Last 24 hours (7 records)
        {
            deviceId: 16,
            activityType: 'on',
            timestamp: new Date(now.getTime() - (2 * 60 * 60 * 1000)).toISOString(),
            duration: 7200
        },
        {
            deviceId: 16,
            activityType: 'dimmed',
            timestamp: new Date(now.getTime() - (3 * 60 * 60 * 1000)).toISOString(),
            duration: 5
        },
        {
            deviceId: 16,
            activityType: 'brightened',
            timestamp: new Date(now.getTime() - (5 * 60 * 60 * 1000)).toISOString(),
            duration: 3
        },
        {
            deviceId: 16,
            activityType: 'off',
            timestamp: new Date(now.getTime() - (8 * 60 * 60 * 1000)).toISOString(),
            duration: 1800
        },
        {
            deviceId: 16,
            activityType: 'on',
            timestamp: new Date(now.getTime() - (12 * 60 * 60 * 1000)).toISOString(),
            duration: 10800
        },
        {
            deviceId: 16,
            activityType: 'dimmed',
            timestamp: new Date(now.getTime() - (15 * 60 * 60 * 1000)).toISOString(),
            duration: 8
        },
        {
            deviceId: 16,
            activityType: 'off',
            timestamp: new Date(now.getTime() - (18 * 60 * 60 * 1000)).toISOString(),
            duration: 900
        },

        // Device 17 (speaker) - Last 24 hours (8 records)
        {
            deviceId: 17,
            activityType: 'on',
            timestamp: new Date(now.getTime() - (1 * 60 * 60 * 1000)).toISOString(),
            duration: 3600
        },
        {
            deviceId: 17,
            activityType: 'play',
            timestamp: new Date(now.getTime() - (4 * 60 * 60 * 1000)).toISOString(),
            duration: 4800
        },
        {
            deviceId: 17,
            activityType: 'volume_changed',
            timestamp: new Date(now.getTime() - (6 * 60 * 60 * 1000)).toISOString(),
            duration: 2
        },
        {
            deviceId: 17,
            activityType: 'pause',
            timestamp: new Date(now.getTime() - (9 * 60 * 60 * 1000)).toISOString(),
            duration: 1800
        },
        {
            deviceId: 17,
            activityType: 'play',
            timestamp: new Date(now.getTime() - (11 * 60 * 60 * 1000)).toISOString(),
            duration: 6300
        },
        {
            deviceId: 17,
            activityType: 'volume_changed',
            timestamp: new Date(now.getTime() - (14 * 60 * 60 * 1000)).toISOString(),
            duration: 4
        },
        {
            deviceId: 17,
            activityType: 'off',
            timestamp: new Date(now.getTime() - (16 * 60 * 60 * 1000)).toISOString(),
            duration: 600
        },
        {
            deviceId: 17,
            activityType: 'on',
            timestamp: new Date(now.getTime() - (20 * 60 * 60 * 1000)).toISOString(),
            duration: 2700
        },

        // Device 16 (light) - Days 2-7 (18 records)
        {
            deviceId: 16,
            activityType: 'on',
            timestamp: new Date(oneDayAgo.getTime() - (6 * 60 * 60 * 1000)).toISOString(),
            duration: 14400
        },
        {
            deviceId: 16,
            activityType: 'off',
            timestamp: new Date(oneDayAgo.getTime() - (12 * 60 * 60 * 1000)).toISOString(),
            duration: 2100
        },
        {
            deviceId: 16,
            activityType: 'dimmed',
            timestamp: new Date(oneDayAgo.getTime() - (18 * 60 * 60 * 1000)).toISOString(),
            duration: 6
        },
        {
            deviceId: 16,
            activityType: 'on',
            timestamp: new Date(oneDayAgo.getTime() - (30 * 60 * 60 * 1000)).toISOString(),
            duration: 9000
        },
        {
            deviceId: 16,
            activityType: 'brightened',
            timestamp: new Date(oneDayAgo.getTime() - (42 * 60 * 60 * 1000)).toISOString(),
            duration: 4
        },
        {
            deviceId: 16,
            activityType: 'off',
            timestamp: new Date(oneDayAgo.getTime() - (54 * 60 * 60 * 1000)).toISOString(),
            duration: 1500
        },
        {
            deviceId: 16,
            activityType: 'on',
            timestamp: new Date(oneDayAgo.getTime() - (66 * 60 * 60 * 1000)).toISOString(),
            duration: 5400
        },
        {
            deviceId: 16,
            activityType: 'dimmed',
            timestamp: new Date(oneDayAgo.getTime() - (78 * 60 * 60 * 1000)).toISOString(),
            duration: 7
        },
        {
            deviceId: 16,
            activityType: 'off',
            timestamp: new Date(oneDayAgo.getTime() - (90 * 60 * 60 * 1000)).toISOString(),
            duration: 3000
        },
        {
            deviceId: 16,
            activityType: 'on',
            timestamp: new Date(oneDayAgo.getTime() - (102 * 60 * 60 * 1000)).toISOString(),
            duration: 12600
        },
        {
            deviceId: 16,
            activityType: 'brightened',
            timestamp: new Date(oneDayAgo.getTime() - (114 * 60 * 60 * 1000)).toISOString(),
            duration: 2
        },
        {
            deviceId: 16,
            activityType: 'off',
            timestamp: new Date(oneDayAgo.getTime() - (126 * 60 * 60 * 1000)).toISOString(),
            duration: 2700
        },
        {
            deviceId: 16,
            activityType: 'on',
            timestamp: new Date(oneDayAgo.getTime() - (138 * 60 * 60 * 1000)).toISOString(),
            duration: 8100
        },
        {
            deviceId: 16,
            activityType: 'dimmed',
            timestamp: new Date(oneDayAgo.getTime() - (150 * 60 * 60 * 1000)).toISOString(),
            duration: 9
        },
        {
            deviceId: 16,
            activityType: 'off',
            timestamp: new Date(oneDayAgo.getTime() - (156 * 60 * 60 * 1000)).toISOString(),
            duration: 1200
        },
        {
            deviceId: 16,
            activityType: 'on',
            timestamp: new Date(oneDayAgo.getTime() - (162 * 60 * 60 * 1000)).toISOString(),
            duration: 6900
        },
        {
            deviceId: 16,
            activityType: 'brightened',
            timestamp: new Date(oneDayAgo.getTime() - (165 * 60 * 60 * 1000)).toISOString(),
            duration: 5
        },
        {
            deviceId: 16,
            activityType: 'off',
            timestamp: new Date(sevenDaysAgo.getTime() + (2 * 60 * 60 * 1000)).toISOString(),
            duration: 450
        },

        // Device 17 (speaker) - Days 2-7 (17 records)
        {
            deviceId: 17,
            activityType: 'on',
            timestamp: new Date(oneDayAgo.getTime() - (8 * 60 * 60 * 1000)).toISOString(),
            duration: 4500
        },
        {
            deviceId: 17,
            activityType: 'play',
            timestamp: new Date(oneDayAgo.getTime() - (15 * 60 * 60 * 1000)).toISOString(),
            duration: 5700
        },
        {
            deviceId: 17,
            activityType: 'volume_changed',
            timestamp: new Date(oneDayAgo.getTime() - (22 * 60 * 60 * 1000)).toISOString(),
            duration: 3
        },
        {
            deviceId: 17,
            activityType: 'pause',
            timestamp: new Date(oneDayAgo.getTime() - (35 * 60 * 60 * 1000)).toISOString(),
            duration: 2400
        },
        {
            deviceId: 17,
            activityType: 'off',
            timestamp: new Date(oneDayAgo.getTime() - (48 * 60 * 60 * 1000)).toISOString(),
            duration: 1800
        },
        {
            deviceId: 17,
            activityType: 'on',
            timestamp: new Date(oneDayAgo.getTime() - (60 * 60 * 60 * 1000)).toISOString(),
            duration: 3300
        },
        {
            deviceId: 17,
            activityType: 'play',
            timestamp: new Date(oneDayAgo.getTime() - (72 * 60 * 60 * 1000)).toISOString(),
            duration: 7200
        },
        {
            deviceId: 17,
            activityType: 'volume_changed',
            timestamp: new Date(oneDayAgo.getTime() - (84 * 60 * 60 * 1000)).toISOString(),
            duration: 1
        },
        {
            deviceId: 17,
            activityType: 'pause',
            timestamp: new Date(oneDayAgo.getTime() - (96 * 60 * 60 * 1000)).toISOString(),
            duration: 1500
        },
        {
            deviceId: 17,
            activityType: 'play',
            timestamp: new Date(oneDayAgo.getTime() - (108 * 60 * 60 * 1000)).toISOString(),
            duration: 4200
        },
        {
            deviceId: 17,
            activityType: 'off',
            timestamp: new Date(oneDayAgo.getTime() - (120 * 60 * 60 * 1000)).toISOString(),
            duration: 900
        },
        {
            deviceId: 17,
            activityType: 'on',
            timestamp: new Date(oneDayAgo.getTime() - (132 * 60 * 60 * 1000)).toISOString(),
            duration: 2100
        },
        {
            deviceId: 17,
            activityType: 'volume_changed',
            timestamp: new Date(oneDayAgo.getTime() - (144 * 60 * 60 * 1000)).toISOString(),
            duration: 5
        },
        {
            deviceId: 17,
            activityType: 'play',
            timestamp: new Date(oneDayAgo.getTime() - (152 * 60 * 60 * 1000)).toISOString(),
            duration: 3900
        },
        {
            deviceId: 17,
            activityType: 'pause',
            timestamp: new Date(oneDayAgo.getTime() - (158 * 60 * 60 * 1000)).toISOString(),
            duration: 600
        },
        {
            deviceId: 17,
            activityType: 'off',
            timestamp: new Date(oneDayAgo.getTime() - (164 * 60 * 60 * 1000)).toISOString(),
            duration: 1350
        },
        {
            deviceId: 17,
            activityType: 'on',
            timestamp: new Date(sevenDaysAgo.getTime() + (4 * 60 * 60 * 1000)).toISOString(),
            duration: 2700
        }
    ];

    await db.insert(deviceActivity).values(sampleDeviceActivity);
    
    console.log('✅ Device activity seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});