import { db } from '@/db';
import { mcpSettings } from '@/db/schema';

async function main() {
    const sampleMcpSettings = [
        {
            url: null,
            token: null,
            connected: false,
            entities: '[]',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
    ];

    await db.insert(mcpSettings).values(sampleMcpSettings);
    
    console.log('✅ MCP Settings seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});