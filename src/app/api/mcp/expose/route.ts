import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { mcpConfig, mcpExposedEntities } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { entity_ids } = await request.json();

    // Validate entity_ids array is provided and not empty
    if (!entity_ids || !Array.isArray(entity_ids) || entity_ids.length === 0) {
      return NextResponse.json({
        error: 'entity_ids array is required and cannot be empty',
        code: 'MISSING_ENTITY_IDS'
      }, { status: 400 });
    }

    // Validate all entity_ids are strings
    if (!entity_ids.every(id => typeof id === 'string')) {
      return NextResponse.json({
        error: 'All entity_ids must be strings',
        code: 'INVALID_ENTITY_IDS'
      }, { status: 400 });
    }

    // Get active MCP config
    const activeConfig = await db.select()
      .from(mcpConfig)
      .where(eq(mcpConfig.connected, true))
      .limit(1);

    if (activeConfig.length === 0) {
      return NextResponse.json({
        error: 'No active MCP config found',
        code: 'NO_ACTIVE_CONFIG'
      }, { status: 400 });
    }

    const configId = activeConfig[0].id;

    // Delete existing exposed entities for this config
    await db.delete(mcpExposedEntities)
      .where(eq(mcpExposedEntities.configId, configId));

    // Insert new exposed entities
    const currentTime = new Date().toISOString();
    const newEntities = [];

    for (const entityId of entity_ids) {
      const newEntity = await db.insert(mcpExposedEntities)
        .values({
          configId,
          entityId: entityId.trim(),
          isExposed: true,
          createdAt: currentTime,
          updatedAt: currentTime
        })
        .returning();
      
      newEntities.push(newEntity[0]);
    }

    return NextResponse.json({
      entities: newEntities,
      count: newEntities.length
    }, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { entity_id, is_exposed } = await request.json();

    // Validate entity_id is provided
    if (!entity_id || typeof entity_id !== 'string') {
      return NextResponse.json({
        error: 'entity_id is required and must be a string',
        code: 'MISSING_ENTITY_ID'
      }, { status: 400 });
    }

    // Validate is_exposed is provided
    if (typeof is_exposed !== 'boolean') {
      return NextResponse.json({
        error: 'is_exposed is required and must be a boolean',
        code: 'MISSING_IS_EXPOSED'
      }, { status: 400 });
    }

    // Get active MCP config
    const activeConfig = await db.select()
      .from(mcpConfig)
      .where(eq(mcpConfig.connected, true))
      .limit(1);

    if (activeConfig.length === 0) {
      return NextResponse.json({
        error: 'No active MCP config found',
        code: 'NO_ACTIVE_CONFIG'
      }, { status: 400 });
    }

    const configId = activeConfig[0].id;
    const currentTime = new Date().toISOString();

    // Check if entity already exists in mcp_exposed_entities
    const existingEntity = await db.select()
      .from(mcpExposedEntities)
      .where(and(
        eq(mcpExposedEntities.configId, configId),
        eq(mcpExposedEntities.entityId, entity_id.trim())
      ))
      .limit(1);

    let result;

    if (existingEntity.length > 0) {
      // Update existing entity
      const updated = await db.update(mcpExposedEntities)
        .set({
          isExposed: is_exposed,
          updatedAt: currentTime
        })
        .where(and(
          eq(mcpExposedEntities.configId, configId),
          eq(mcpExposedEntities.entityId, entity_id.trim())
        ))
        .returning();

      result = updated[0];
    } else {
      // Insert new entity
      const inserted = await db.insert(mcpExposedEntities)
        .values({
          configId,
          entityId: entity_id.trim(),
          isExposed: is_exposed,
          createdAt: currentTime,
          updatedAt: currentTime
        })
        .returning();

      result = inserted[0];
    }

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}