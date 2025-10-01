import { db } from '@/db';
import { mcpExposedEntities, mcpConfig } from '@/db/schema';

async function main() {
    // Delete existing exposed entities
    await db.delete(mcpExposedEntities);

    // Get the first mcp_config record to use its ID
    const configs = await db.select().from(mcpConfig).limit(1);
    if (configs.length === 0) {
        console.error('❌ No MCP config found. Please run the MCP config seeder first.');
        return;
    }

    const configId = configs[0].id;
    const recentTimestamp = new Date('2024-12-13T10:30:00Z').toISOString();
    const currentTime = new Date().toISOString();

    const sampleExposedEntities = [
        {
            configId: configId,
            entityId: 'light.den',
            isExposed: true,
            lastSync: recentTimestamp,
            createdAt: new Date('2024-12-10').toISOString(),
            updatedAt: currentTime,
        },
        {
            configId: configId,
            entityId: 'switch.kitchen',
            isExposed: true,
            lastSync: recentTimestamp,
            createdAt: new Date('2024-12-10').toISOString(),
            updatedAt: currentTime,
        },
        {
            configId: configId,
            entityId: 'sensor.temperature',
            isExposed: false,
            lastSync: null,
            createdAt: new Date('2024-12-10').toISOString(),
            updatedAt: currentTime,
        },
        {
            configId: configId,
            entityId: 'light.bedroom',
            isExposed: false,
            lastSync: null,
            createdAt: new Date('2024-12-10').toISOString(),
            updatedAt: currentTime,
        },
        {
            configId: configId,
            entityId: 'switch.garage',
            isExposed: true,
            lastSync: recentTimestamp,
            createdAt: new Date('2024-12-10').toISOString(),
            updatedAt: currentTime,
        },
    ];

    await db.insert(mcpExposedEntities).values(sampleExposedEntities);

    console.log('✅ MCP exposed entities seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});