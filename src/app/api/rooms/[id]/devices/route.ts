import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { devices, rooms } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    
    // Validate room ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({
        error: "Valid room ID is required",
        code: "INVALID_ROOM_ID"
      }, { status: 400 });
    }

    const roomId = parseInt(id);

    // Check if room exists
    const room = await db.select()
      .from(rooms)
      .where(eq(rooms.id, roomId))
      .limit(1);

    if (room.length === 0) {
      return NextResponse.json({
        error: "Room not found",
        code: "ROOM_NOT_FOUND"
      }, { status: 404 });
    }

    // Parse pagination parameters
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get devices for the specified room
    const roomDevices = await db.select()
      .from(devices)
      .where(eq(devices.roomId, roomId))
      .orderBy(asc(devices.id))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(roomDevices);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}