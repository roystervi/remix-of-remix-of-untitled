import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { mcpConfig, mcpExposedEntities } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Fetch the most recent MCP config with raw SQL to avoid JSON parsing issues
    const rawConfigs = await db.all(sql`SELECT * FROM mcp_config ORDER BY updated_at DESC LIMIT 1`);

    // If no config exists, return default status
    if (rawConfigs.length === 0) {
      return NextResponse.json({
        connected: false,
        exposed_count: 0,
        last_sync_time: null,
        server_port: 8124,
        rules_list: [],
        config_id: null,
        entities_total: 0
      });
    }

    const config = rawConfigs[0] as any;

    // Count exposed entities for this config with raw SQL
    let exposed_count = 0;
    try {
      const countResult = await db.all(sql`
        SELECT COUNT(*) as count 
        FROM mcp_exposed_entities 
        WHERE config_id = ${config.id} AND is_exposed = 1
      `);
      exposed_count = countResult[0]?.count || 0;
    } catch (countError) {
      console.warn('Could not count exposed entities (table may not exist):', countError);
      exposed_count = 0;
    }

    // Get the most recent sync time from exposed entities with raw SQL
    let last_sync_time = null;
    try {
      const syncResult = await db.all(sql`
        SELECT last_sync 
        FROM mcp_exposed_entities 
        WHERE config_id = ${config.id} 
        ORDER BY last_sync DESC 
        LIMIT 1
      `);
      last_sync_time = syncResult[0]?.last_sync || null;
    } catch (syncError) {
      console.warn('Could not get last sync time (table may not exist):', syncError);
      last_sync_time = null;
    }

    // Handle entities field safely
    let entities_total = 0;
    try {
      const entitiesField = config.entities;
      if (entitiesField && entitiesField !== 'null' && entitiesField.trim() !== '') {
        if (entitiesField.startsWith('[') || entitiesField.startsWith('{')) {
          const parsed = JSON.parse(entitiesField);
          entities_total = Array.isArray(parsed) ? parsed.length : 0;
        }
      }
    } catch (parseError) {
      entities_total = 0;
    }

    // Handle exposure rules field safely - skip parsing if problematic
    let rules_list = [];
    try {
      const rulesField = config.exposure_rules || config.exposureRules;
      if (rulesField && rulesField !== 'null' && rulesField.trim() !== '') {
        if (rulesField.startsWith('[') || rulesField.startsWith('{')) {
          const parsed = JSON.parse(rulesField);
          rules_list = Array.isArray(parsed) ? parsed : [];
        }
      }
    } catch (parseError) {
      // If parsing fails, just use empty array
      rules_list = [];
    }

    return NextResponse.json({
      connected: Boolean(config.connected),
      exposed_count,
      last_sync_time,
      server_port: config.server_port || config.serverPort || 8124,
      rules_list,
      config_id: config.id,
      entities_total
    });

  } catch (error) {
    console.error('GET /api/mcp/status error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}