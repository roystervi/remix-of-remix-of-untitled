import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { settings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const settingsRecord = await db.select()
      .from(settings)
      .limit(1);

    if (settingsRecord.length === 0) {
      return NextResponse.json(null);
    }

    return NextResponse.json(settingsRecord[0]);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error,
      code: 'GET_SETTINGS_FAILED' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mcpUrl, mcpToken, mcpConnected } = body;

    // Input validation
    if (mcpUrl !== undefined && mcpUrl !== null && mcpUrl !== '') {
      if (typeof mcpUrl !== 'string') {
        return NextResponse.json({ 
          error: "mcpUrl must be a string",
          code: "INVALID_MCP_URL_TYPE" 
        }, { status: 400 });
      }

      const trimmedUrl = mcpUrl.trim();
      if (trimmedUrl && !trimmedUrl.match(/^https?:\/\/.+/)) {
        return NextResponse.json({ 
          error: "mcpUrl must be a valid URL starting with http or https",
          code: "INVALID_MCP_URL_FORMAT" 
        }, { status: 400 });
      }
    }

    if (mcpToken !== undefined && mcpToken !== null && typeof mcpToken !== 'string') {
      return NextResponse.json({ 
        error: "mcpToken must be a string",
        code: "INVALID_MCP_TOKEN_TYPE" 
      }, { status: 400 });
    }

    if (mcpConnected !== undefined && typeof mcpConnected !== 'boolean') {
      return NextResponse.json({ 
        error: "mcpConnected must be a boolean",
        code: "INVALID_MCP_CONNECTED_TYPE" 
      }, { status: 400 });
    }

    // Check if settings record exists
    const existingSettings = await db.select()
      .from(settings)
      .limit(1);

    const currentTimestamp = new Date().toISOString();

    if (existingSettings.length === 0) {
      // Create new settings record
      const newSettings = await db.insert(settings)
        .values({
          mcpUrl: mcpUrl ? mcpUrl.trim() : null,
          mcpToken: mcpToken || null,
          mcpConnected: mcpConnected !== undefined ? mcpConnected : false,
          createdAt: currentTimestamp,
          updatedAt: currentTimestamp
        })
        .returning();

      return NextResponse.json(newSettings[0], { status: 201 });
    } else {
      // Update existing settings record with partial updates
      const updateData: any = {
        updatedAt: currentTimestamp
      };

      if (mcpUrl !== undefined) {
        updateData.mcpUrl = mcpUrl ? mcpUrl.trim() : null;
      }
      if (mcpToken !== undefined) {
        updateData.mcpToken = mcpToken || null;
      }
      if (mcpConnected !== undefined) {
        updateData.mcpConnected = mcpConnected;
      }

      const updatedSettings = await db.update(settings)
        .set(updateData)
        .where(eq(settings.id, existingSettings[0].id))
        .returning();

      return NextResponse.json(updatedSettings[0]);
    }
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error,
      code: 'POST_SETTINGS_FAILED' 
    }, { status: 500 });
  }
}