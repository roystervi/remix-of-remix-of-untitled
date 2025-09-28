import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { homeAssistantConnections } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const now = new Date().toISOString();
    
    // Check if record with ID 1 exists
    const existing = await db.select()
      .from(homeAssistantConnections)
      .where(eq(homeAssistantConnections.id, 1))
      .limit(1);

    let result;
    
    if (existing.length > 0) {
      // Update existing record
      result = await db.update(homeAssistantConnections)
        .set({
          url: 'http://192.168.1.54:8123',
          token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhZG1pbiIsImlhdCI6MTcyNzM3NjAwMCwianRpIjoiMTcyNzM3NjAwMC0xNTYwMjU3OTYifQ.fake_token_for_testing',
          status: 'connected',
          lastChecked: now,
          updatedAt: now
        })
        .where(eq(homeAssistantConnections.id, 1))
        .returning();
    } else {
      // Insert new record with specific ID
      result = await db.insert(homeAssistantConnections)
        .values({
          url: 'http://192.168.1.54:8123',
          token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhZG1pbiIsImlhdCI6MTcyNzM3NjAwMCwianRpIjoiMTcyNzM3NjAwMC0xNTYwMjU3OTYifQ.fake_token_for_testing',
          status: 'connected',
          lastChecked: now,
          createdAt: now,
          updatedAt: now
        })
        .returning();
    }

    return NextResponse.json({
      success: true,
      message: 'Home Assistant connection record force inserted/updated successfully',
      record: result[0],
      isConnected: true
    });

  } catch (error) {
    console.error('Force insert error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Query current status
    const connection = await db.select()
      .from(homeAssistantConnections)
      .where(eq(homeAssistantConnections.id, 1))
      .limit(1);

    if (connection.length === 0) {
      return NextResponse.json({
        error: 'No record found with ID 1'
      }, { status: 404 });
    }

    return NextResponse.json({
      record: connection[0],
      isConnected: connection[0].status === 'connected'
    });

  } catch (error) {
    console.error('Query error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}