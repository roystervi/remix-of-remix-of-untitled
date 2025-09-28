import { db } from '@/db';
import { modes } from '@/db/schema';

async function main() {
    const currentTimestamp = new Date().toISOString();
    
    const sampleModes = [
        {
            name: 'Music Mode',
            icon: 'music',
            isActive: false,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            name: 'Cool and Relax',
            icon: 'wind',
            isActive: true,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            name: 'Night Vision',
            icon: 'moon',
            isActive: false,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            name: 'Smart Home',
            icon: 'home',
            isActive: false,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        }
    ];

    await db.insert(modes).values(sampleModes);
    
    console.log('✅ Modes seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});