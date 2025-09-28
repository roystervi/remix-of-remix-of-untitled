import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { homeAssistantConnections } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get('entity');

    // Validate entity parameter
    if (!entityId || entityId.trim() === '') {
      return NextResponse.json({ 
        error: "Entity ID is required",
        code: "MISSING_ENTITY_ID" 
      }, { status: 400 });
    }

    // Fetch the stored Home Assistant connection
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

    // Check if connection is in connected state
    if (connection.status !== 'connected') {
      return NextResponse.json({ 
        error: "Home Assistant not connected",
        code: "NOT_CONNECTED",
        status: connection.status
      }, { status: 400 });
    }

    // Construct Home Assistant API URL
    const haApiUrl = `${connection.url}/api/states/${entityId}`;

    // Fetch entity state from Home Assistant API
    const haResponse = await fetch(haApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${connection.token}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle Home Assistant API errors
    if (!haResponse.ok) {
      if (haResponse.status === 404) {
        return NextResponse.json({ 
          error: `Entity '${entityId}' not found`,
          code: "ENTITY_NOT_FOUND" 
        }, { status: 404 });
      }
      
      if (haResponse.status === 401) {
        return NextResponse.json({ 
          error: "Unauthorized access to Home Assistant",
          code: "UNAUTHORIZED" 
        }, { status: 401 });
      }

      const errorText = await haResponse.text();
      return NextResponse.json({ 
        error: `Home Assistant API error: ${errorText}`,
        code: "HA_API_ERROR",
        status: haResponse.status
      }, { status: 500 });
    }

    // Parse and return the entity state
    const entityState = await haResponse.json();

    // Return the state object with required fields
    return NextResponse.json({
      entity_id: entityState.entity_id,
      state: entityState.state,
      attributes: entityState.attributes,
      last_changed: entityState.last_changed
    });

  } catch (error) {
    console.error('GET ha-entity-state error:', error);
    
    // Handle network errors specifically
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json({ 
        error: 'Network error: Unable to connect to Home Assistant',
        code: "NETWORK_ERROR"
      }, { status: 500 });
    }

    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}