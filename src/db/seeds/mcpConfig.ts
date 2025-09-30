import { db } from '@/db';
import { mcpConfig } from '@/db/schema';

async function main() {
    const currentTimestamp = new Date().toISOString();
    
    const sampleMcpConfig = [
        {
            url: null,
            token: null,
            connected: false,
            entities: '[]',
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        }
    ];

    await db.insert(mcpConfig).values(sampleMcpConfig);
    
    console.log('✅ MCP config seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});