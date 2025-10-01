import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { mcpConfig, mcpExposedEntities } from '@/db/schema';

export async function POST(request: NextRequest) {
  try {
    // Delete all existing records from both tables
    await db.delete(mcpExposedEntities);
    await db.delete(mcpConfig);

    // Insert fresh mcp_config record with proper JSON formatting
    const currentTime = new Date().toISOString();
    
    const newConfig = await db.insert(mcpConfig)
      .values({
        url: "http://homeassistant.local:8123",
        token: "test_token_123",
        connected: true,
        entities: "[]",
        serverPort: 8124,
        exposureRules: "[]",
        createdAt: currentTime,
        updatedAt: currentTime
      })
      .returning();

    if (newConfig.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to create new config record',
        code: 'CONFIG_CREATION_FAILED'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Database configuration fixed successfully',
      configId: newConfig[0].id,
      config: newConfig[0]
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/mcp/fix-config error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error,
      code: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}