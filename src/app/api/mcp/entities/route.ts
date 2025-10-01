import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { mcpConfig, mcpExposedEntities } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

interface HAEntity {
  entity_id: string;
  state: string;
  attributes: {
    friendly_name?: string;
    [key: string]: any;
  };
}

interface EntityResponse {
  entity_id: string;
  state: string;
  friendly_name: string;
  domain: string;
  is_exposed: boolean;
}

const SUPPORTED_DOMAINS = ['light', 'switch', 'sensor', 'climate', 'fan', 'lock', 'cover'];
const REQUEST_TIMEOUT = 5000; // 5 seconds

export async function GET(request: NextRequest) {
  try {
    // Fetch MCP configuration
    const config = await db.select()
      .from(mcpConfig)
      .where(eq(mcpConfig.connected, true))
      .limit(1);

    if (config.length === 0) {
      return NextResponse.json({
        error: 'No active MCP connection found',
        code: 'MCP_NOT_CONNECTED'
      }, { status: 400 });
    }

    const mcpConf = config[0];

    if (!mcpConf.url || !mcpConf.token) {
      return NextResponse.json({
        error: 'MCP configuration missing URL or token',
        code: 'INVALID_MCP_CONFIG'
      }, { status: 400 });
    }

    // Fetch exposed entities for this config
    const exposedEntities = await db.select()
      .from(mcpExposedEntities)
      .where(eq(mcpExposedEntities.configId, mcpConf.id));

    const exposedEntityMap = new Map(
      exposedEntities.map(entity => [entity.entityId, entity.isExposed])
    );

    // Create abort controller for timeout
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), REQUEST_TIMEOUT);

    let haResponse: Response;
    let haEntities: HAEntity[];

    try {
      // Make authenticated request to Home Assistant
      haResponse = await fetch(`${mcpConf.url}/api/states`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${mcpConf.token}`,
          'Content-Type': 'application/json',
        },
        signal: abortController.signal,
      });

      clearTimeout(timeoutId);

      if (!haResponse.ok) {
        return NextResponse.json({
          error: `Home Assistant API error: ${haResponse.status} ${haResponse.statusText}`,
          code: 'HA_API_ERROR'
        }, { status: 502 });
      }

      haEntities = await haResponse.json();

      if (!Array.isArray(haEntities)) {
        return NextResponse.json({
          error: 'Invalid response format from Home Assistant',
          code: 'INVALID_HA_RESPONSE'
        }, { status: 502 });
      }

    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        return NextResponse.json({
          error: 'Request to Home Assistant timed out',
          code: 'HA_TIMEOUT'
        }, { status: 504 });
      }

      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        return NextResponse.json({
          error: 'Unable to connect to Home Assistant',
          code: 'HA_CONNECTION_ERROR'
        }, { status: 502 });
      }

      return NextResponse.json({
        error: `Network error: ${error.message}`,
        code: 'NETWORK_ERROR'
      }, { status: 502 });
    }

    // Filter and transform entities
    const filteredEntities: EntityResponse[] = haEntities
      .filter(entity => {
        const domain = entity.entity_id.split('.')[0];
        return SUPPORTED_DOMAINS.includes(domain);
      })
      .map(entity => {
        const domain = entity.entity_id.split('.')[0];
        const isExposed = exposedEntityMap.get(entity.entity_id) ?? false;
        
        return {
          entity_id: entity.entity_id,
          state: entity.state,
          friendly_name: entity.attributes?.friendly_name || entity.entity_id,
          domain: domain,
          is_exposed: isExposed
        };
      });

    return NextResponse.json({
      entities: filteredEntities,
      total_count: filteredEntities.length
    });

  } catch (error) {
    console.error('GET /api/mcp/entities error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}