import { db } from '@/db';
import { piholeConfig } from '@/db/schema';

async function main() {
    const samplePiholeConfig = [
        {
            url: 'http://192.168.1.100',
            appPassword: 'test_password_123',
            connected: true,
            lastChecked: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
    ];

    await db.insert(piholeConfig).values(samplePiholeConfig);
    
    console.log('✅ Pi-hole config seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});