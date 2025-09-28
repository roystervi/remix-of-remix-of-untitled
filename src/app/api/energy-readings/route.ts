import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { energyReadings, rooms } from '@/db/schema';
import { eq, and, gte, lte, asc, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const roomId = searchParams.get('room_id');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const recent = searchParams.get('recent');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Single record retrieval
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const reading = await db.select({
        id: energyReadings.id,
        timestamp: energyReadings.timestamp,
        value: energyReadings.value,
        roomId: energyReadings.roomId,
        createdAt: energyReadings.createdAt,
        updatedAt: energyReadings.updatedAt,
        room: {
          id: rooms.id,
          name: rooms.name
        }
      })
      .from(energyReadings)
      .leftJoin(rooms, eq(energyReadings.roomId, rooms.id))
      .where(eq(energyReadings.id, parseInt(id)))
      .limit(1);

      if (reading.length === 0) {
        return NextResponse.json({ 
          error: 'Energy reading not found',
          code: 'READING_NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(reading[0]);
    }

    // Build query conditions
    let conditions = [];

    // Filter by room
    if (roomId) {
      if (isNaN(parseInt(roomId))) {
        return NextResponse.json({ 
          error: "Valid room ID is required",
          code: "INVALID_ROOM_ID" 
        }, { status: 400 });
      }
      conditions.push(eq(energyReadings.roomId, parseInt(roomId)));
    }

    // Date range filtering
    if (from && to) {
      conditions.push(gte(energyReadings.timestamp, from));
      conditions.push(lte(energyReadings.timestamp, to));
    } else if (from) {
      conditions.push(gte(energyReadings.timestamp, from));
    } else if (to) {
      conditions.push(lte(energyReadings.timestamp, to));
    }

    // Recent readings (last X hours)
    if (recent) {
      const hoursAgo = parseInt(recent);
      if (isNaN(hoursAgo) || hoursAgo <= 0) {
        return NextResponse.json({ 
          error: "Valid number of hours is required for recent filter",
          code: "INVALID_RECENT_HOURS" 
        }, { status: 400 });
      }
      
      const recentTimestamp = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();
      conditions.push(gte(energyReadings.timestamp, recentTimestamp));
    }

    // Build query
    let query = db.select({
      id: energyReadings.id,
      timestamp: energyReadings.timestamp,
      value: energyReadings.value,
      roomId: energyReadings.roomId,
      createdAt: energyReadings.createdAt,
      updatedAt: energyReadings.updatedAt,
      room: {
        id: rooms.id,
        name: rooms.name
      }
    })
    .from(energyReadings)
    .leftJoin(rooms, eq(energyReadings.roomId, rooms.id));

    // Apply conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Sort by timestamp (chronologically for charts - oldest first)
    query = query.orderBy(asc(energyReadings.timestamp));

    // Apply pagination
    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results);

  } catch (error) {
    console.error('GET energy readings error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error,
      code: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}