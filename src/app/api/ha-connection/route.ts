import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { homeAssistantConnections } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const connection = await db.select({
      id: homeAssistantConnections.id,
      url: homeAssistantConnections.url,
      status: homeAssistantConnections.status,
      lastChecked: homeAssistantConnections.lastChecked,
    })
    .from(homeAssistantConnections)
    .limit(1);

    if (connection.length === 0) {
      return NextResponse.json(null, { status: 200 });
    }

    const data = {
      ...connection[0],
      isConnected: connection[0].status === 'connected'
    };

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url, token } = await request.json();

    // Validate required fields
    if (!url) {
      return NextResponse.json({ 
        error: "URL is required",
        code: "MISSING_URL" 
      }, { status: 400 });
    }

    if (!token) {
      return NextResponse.json({ 
        error: "Token is required",
        code: "MISSING_TOKEN" 
      }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (urlError) {
      return NextResponse.json({ 
        error: "Invalid URL format",
        code: "INVALID_URL" 
      }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedUrl = url.trim();
    const sanitizedToken = token.trim();

    if (!sanitizedToken) {
      return NextResponse.json({ 
        error: "Token cannot be empty",
        code: "EMPTY_TOKEN" 
      }, { status: 400 });
    }

    const now = new Date().toISOString();

    // Check if connection already exists
    const existingConnection = await db.select()
      .from(homeAssistantConnections)
      .limit(1);

    let result;
    let isUpdate = false;

    if (existingConnection.length > 0) {
      // Update existing connection
      result = await db.update(homeAssistantConnections)
        .set({
          url: sanitizedUrl,
          token: sanitizedToken,
          status: 'connecting',
          updatedAt: now
        })
        .where(eq(homeAssistantConnections.id, existingConnection[0].id))
        .returning({
          id: homeAssistantConnections.id,
          url: homeAssistantConnections.url,
          status: homeAssistantConnections.status,
          lastChecked: homeAssistantConnections.lastChecked,
          createdAt: homeAssistantConnections.createdAt,
          updatedAt: homeAssistantConnections.updatedAt,
        });
      isUpdate = true;
    } else {
      // Create new connection
      result = await db.insert(homeAssistantConnections)
        .values({
          url: sanitizedUrl,
          token: sanitizedToken,
          status: 'connecting',
          createdAt: now,
          updatedAt: now
        })
        .returning({
          id: homeAssistantConnections.id,
          url: homeAssistantConnections.url,
          status: homeAssistantConnections.status,
          lastChecked: homeAssistantConnections.lastChecked,
          createdAt: homeAssistantConnections.createdAt,
          updatedAt: homeAssistantConnections.updatedAt,
        });
    }

    const savedConnection = result[0];
    const connectionId = savedConnection.id;

    // Test the connection immediately after saving
    let status = 'disconnected';
    let errorMsg: string | undefined;
    let isConnected = false;

    try {
      // Test the connection by fetching HA /api/config endpoint
      const testUrl = `${sanitizedUrl}/api/config`;
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sanitizedToken}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (response.ok) {
        status = 'connected';
        isConnected = true;
      } else {
        status = 'disconnected';
        errorMsg = `HTTP ${response.status}: ${await response.text()}`;
      }
    } catch (fetchError: any) {
      status = 'disconnected';
      errorMsg = fetchError.message || 'Network/timeout error';
    }

    // Update the database with the test result
    await db.update(homeAssistantConnections)
      .set({
        status,
        lastChecked: now,
        updatedAt: now
      })
      .where(eq(homeAssistantConnections.id, connectionId));

    // Return the final result
    const finalResult = await db.select({
      id: homeAssistantConnections.id,
      url: homeAssistantConnections.url,
      status: homeAssistantConnections.status,
      lastChecked: homeAssistantConnections.lastChecked,
      isConnected // Add this field manually since it's not in schema
    }).from(homeAssistantConnections).where(eq(homeAssistantConnections.id, connectionId));

    return NextResponse.json({
      ...finalResult[0],
      isConnected,
      error: errorMsg // Include if disconnected
    }, { status: isUpdate ? 200 : 201 });

  } catch (error) {
    console.error('POST error:', error);
    
    // Reset to disconnected if possible
    try {
      const connections = await db.select().from(homeAssistantConnections).limit(1);
      if (connections.length > 0) {
        await db.update(homeAssistantConnections)
          .set({
            status: 'disconnected',
            lastChecked: now,
            updatedAt: now
          })
          .where(eq(homeAssistantConnections.id, connections[0].id));
      }
    } catch (updateError) {
      console.error('Failed to reset status:', updateError);
    }

    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}