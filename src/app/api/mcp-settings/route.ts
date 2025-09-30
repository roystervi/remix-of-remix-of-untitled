import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { mcpConfig } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const settingsRecord = await db.select()
      .from(mcpConfig)
      .limit(1);

    if (settingsRecord.length === 0) {
      return NextResponse.json(null);
    }

    // Transform the response to include entities as parsed JSON
    const result = {
      ...settingsRecord[0],
      entities: settingsRecord[0].entities ? JSON.parse(settingsRecord[0].entities) : []
    };

    return NextResponse.json(result);
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
    const { url, token, connected, entities } = body;

    // Input validation
    if (url !== undefined && url !== null && url !== '') {
      if (typeof url !== 'string') {
        return NextResponse.json({ 
          error: "url must be a string",
          code: "INVALID_URL_TYPE" 
        }, { status: 400 });
      }

      const trimmedUrl = url.trim();
      if (trimmedUrl && !trimmedUrl.match(/^https?:\/\/.+/)) {
        return NextResponse.json({ 
          error: "url must be a valid URL starting with http or https",
          code: "INVALID_URL_FORMAT" 
        }, { status: 400 });
      }
    }

    if (token !== undefined && token !== null && typeof token !== 'string') {
      return NextResponse.json({ 
        error: "token must be a string",
        code: "INVALID_TOKEN_TYPE" 
      }, { status: 400 });
    }

    if (connected !== undefined && typeof connected !== 'boolean') {
      return NextResponse.json({ 
        error: "connected must be a boolean",
        code: "INVALID_CONNECTED_TYPE" 
      }, { status: 400 });
    }

    if (entities !== undefined && entities !== null) {
      if (!Array.isArray(entities)) {
        return NextResponse.json({ 
          error: "entities must be an array",
          code: "INVALID_ENTITIES_TYPE" 
        }, { status: 400 });
      }
    }

    // Check if settings record exists
    const existingSettings = await db.select()
      .from(mcpConfig)
      .limit(1);

    const currentTimestamp = new Date().toISOString();

    if (existingSettings.length === 0) {
      // Create new settings record
      const newSettings = await db.insert(mcpConfig)
        .values({
          url: url ? url.trim() : null,
          token: token || null,
          connected: connected !== undefined ? connected : false,
          entities: entities ? JSON.stringify(entities) : '[]',
          createdAt: currentTimestamp,
          updatedAt: currentTimestamp
        })
        .returning();

      // Transform response
      const result = {
        ...newSettings[0],
        entities: newSettings[0].entities ? JSON.parse(newSettings[0].entities) : []
      };

      return NextResponse.json(result, { status: 201 });
    } else {
      // Update existing settings record with partial updates
      const updateData: any = {
        updatedAt: currentTimestamp
      };

      if (url !== undefined) {
        updateData.url = url ? url.trim() : null;
      }
      if (token !== undefined) {
        updateData.token = token || null;
      }
      if (connected !== undefined) {
        updateData.connected = connected;
      }
      if (entities !== undefined) {
        updateData.entities = entities ? JSON.stringify(entities) : '[]';
      }

      const updatedSettings = await db.update(mcpConfig)
        .set(updateData)
        .where(eq(mcpConfig.id, existingSettings[0].id))
        .returning();

      // Transform response
      const result = {
        ...updatedSettings[0],
        entities: updatedSettings[0].entities ? JSON.parse(updatedSettings[0].entities) : []
      };

      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error,
      code: 'POST_SETTINGS_FAILED' 
    }, { status: 500 });
  }
}