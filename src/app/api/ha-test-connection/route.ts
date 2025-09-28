import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { homeAssistantConnections } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Fetch the stored connection
    const connections = await db.select()
      .from(homeAssistantConnections)
      .limit(1);

    if (connections.length === 0) {
      return NextResponse.json({ 
        error: "No connection configured",
        code: "NO_CONNECTION_CONFIGURED" 
      }, { status: 400 });
    }

    const connection = connections[0];

    // Set status to 'connecting' and update database
    const now = new Date().toISOString();
    await db.update(homeAssistantConnections)
      .set({
        status: 'connecting',
        updatedAt: now
      })
      .where(eq(homeAssistantConnections.id, connection.id));

    let status = 'disconnected';
    let error: string | undefined;
    let isConnected = false;

    try {
      // Test the connection by fetching HA /api/config endpoint
      const testUrl = `${connection.url}/api/config`;
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${connection.token}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (response.ok) {
        status = 'connected';
        isConnected = true;
      } else {
        status = 'disconnected';
        error = `HTTP ${response.status}: ${await response.text()}`;
      }
    } catch (fetchError: any) {
      status = 'disconnected';
      error = fetchError.message || 'Network/timeout error';
    }

    // Update the database with the new status and last_checked timestamp
    await db.update(homeAssistantConnections)
      .set({
        status,
        lastChecked: now,
        updatedAt: now
      })
      .where(eq(homeAssistantConnections.id, connection.id));

    // Return response based on success/failure
    if (status === 'connected') {
      return NextResponse.json({
        connected: true,
        status: "connected",
        error: null
      }, { status: 200 });
    } else {
      return NextResponse.json({
        connected: false,
        status: "disconnected",
        error: error || "Connection test failed"
      }, { status: 200 });
    }

  } catch (error) {
    console.error('POST /api/ha-test-connection error:', error);
    
    // Try to set status to 'disconnected' if we have a connection record
    try {
      const now = new Date().toISOString();
      const connections = await db.select()
        .from(homeAssistantConnections)
        .limit(1);
      
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
      console.error('Failed to update connection status after error:', updateError);
    }

    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message,
      code: "INTERNAL_SERVER_ERROR"
    }, { status: 500 });
  }
}