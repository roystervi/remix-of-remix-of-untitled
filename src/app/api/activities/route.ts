import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { activities, rooms } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const roomId = searchParams.get('room_id');
    const type = searchParams.get('type');
    const recent = searchParams.get('recent');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Single activity retrieval
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const activity = await db.select({
        id: activities.id,
        roomId: activities.roomId,
        description: activities.description,
        timestamp: activities.timestamp,
        type: activities.type,
        createdAt: activities.createdAt,
        updatedAt: activities.updatedAt,
        roomName: rooms.name
      })
      .from(activities)
      .leftJoin(rooms, eq(activities.roomId, rooms.id))
      .where(eq(activities.id, parseInt(id)))
      .limit(1);

      if (activity.length === 0) {
        return NextResponse.json({ 
          error: 'Activity not found',
          code: "ACTIVITY_NOT_FOUND" 
        }, { status: 404 });
      }

      return NextResponse.json(activity[0]);
    }

    // Build query with filters
    let query = db.select({
      id: activities.id,
      roomId: activities.roomId,
      description: activities.description,
      timestamp: activities.timestamp,
      type: activities.type,
      createdAt: activities.createdAt,
      updatedAt: activities.updatedAt,
      roomName: rooms.name
    })
    .from(activities)
    .leftJoin(rooms, eq(activities.roomId, rooms.id));

    // Apply filters
    const conditions = [];
    
    if (roomId) {
      if (isNaN(parseInt(roomId))) {
        return NextResponse.json({ 
          error: "Valid room ID is required",
          code: "INVALID_ROOM_ID" 
        }, { status: 400 });
      }
      conditions.push(eq(activities.roomId, parseInt(roomId)));
    }

    if (type) {
      conditions.push(eq(activities.type, type));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Always sort by timestamp descending (newest first)
    query = query.orderBy(desc(activities.timestamp));

    // Handle recent activities (last 10 across all rooms)
    if (recent === 'true') {
      query = query.limit(10);
    } else {
      query = query.limit(limit).offset(offset);
    }

    const results = await query;

    return NextResponse.json(results);

  } catch (error) {
    console.error('GET activities error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error,
      code: "INTERNAL_ERROR" 
    }, { status: 500 });
  }
}