import { db } from '@/db';
import { databaseSettings } from '@/db/schema';

async function main() {
    const defaultSettings = {
        autoBackup: false,
        queryLogging: false,
        schemaValidation: true,
        performanceMonitoring: false,
        localPath: '/app/data/backups',
        cloudPath: null,
        preset: 'balanced',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    await db.insert(databaseSettings).values(defaultSettings);
    
    console.log('✅ Database settings seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});