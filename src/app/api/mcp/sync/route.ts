import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { mcpConfig, mcpExposedEntities } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Fetch active MCP config
    const configs = await db.select()
      .from(mcpConfig)
      .where(eq(mcpConfig.connected, true))
      .limit(1);

    if (configs.length === 0) {
      return NextResponse.json({
        success: false,
        synced_count: 0,
        last_sync: null,
        error: 'No active MCP configuration found'
      }, { status: 404 });
    }

    const config = configs[0];

    // Validate connection exists with url/token
    if (!config.url || !config.token) {
      return NextResponse.json({
        success: false,
        synced_count: 0,
        last_sync: null,
        error: 'MCP configuration incomplete: missing URL or token'
      }, { status: 400 });
    }

    const homeAssistantUrl = config.url.replace(/\/$/, ''); // Remove trailing slash
    const supportedDomains = ['light', 'switch', 'sensor', 'climate', 'fan', 'lock', 'cover'];

    let entities: any[] = [];
    let syncTime = new Date().toISOString();

    try {
      // Make authenticated request to Home Assistant with 5 second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${homeAssistantUrl}/api/states`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Home Assistant API responded with status: ${response.status}`);
      }

      const allEntities = await response.json();

      // Filter entities by supported domains
      entities = allEntities.filter((entity: any) => {
        if (!entity.entity_id || typeof entity.entity_id !== 'string') return false;
        const domain = entity.entity_id.split('.')[0];
        return supportedDomains.includes(domain);
      });

    } catch (error: any) {
      const isTimeout = error.name === 'AbortError';
      const errorMessage = isTimeout 
        ? 'Home Assistant connection timeout (5 seconds exceeded)'
        : `Failed to connect to Home Assistant: ${error.message}`;

      return NextResponse.json({
        success: false,
        synced_count: 0,
        last_sync: null,
        error: errorMessage
      }, { status: isTimeout ? 408 : 503 });
    }

    // Start transaction for atomic updates
    let entitiesUpdated = 0;

    try {
      // Update mcp_config.entities with latest entity data
      await db.update(mcpConfig)
        .set({
          entities: JSON.stringify(entities),
          updatedAt: syncTime
        })
        .where(eq(mcpConfig.id, config.id));

      // Get current exposed entities for this config
      const exposedEntities = await db.select()
        .from(mcpExposedEntities)
        .where(and(
          eq(mcpExposedEntities.configId, config.id),
          eq(mcpExposedEntities.isExposed, true)
        ));

      // Update last_sync timestamp for all exposed entities
      if (exposedEntities.length > 0) {
        for (const exposedEntity of exposedEntities) {
          await db.update(mcpExposedEntities)
            .set({
              lastSync: syncTime,
              updatedAt: syncTime
            })
            .where(eq(mcpExposedEntities.id, exposedEntity.id));
          entitiesUpdated++;
        }
      }

      return NextResponse.json({
        success: true,
        synced_count: entities.length,
        last_sync: syncTime,
        entities_updated: entitiesUpdated
      }, { status: 200 });

    } catch (dbError: any) {
      console.error('Database transaction error:', dbError);
      return NextResponse.json({
        success: false,
        synced_count: 0,
        last_sync: null,
        error: 'Failed to update database: ' + dbError.message
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('MCP sync error:', error);
    return NextResponse.json({
      success: false,
      synced_count: 0,
      last_sync: null,
      error: 'Internal server error: ' + error.message
    }, { status: 500 });
  }
}