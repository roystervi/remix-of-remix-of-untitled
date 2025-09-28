import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { rooms } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({
        error: "Valid ID is required",
        code: "INVALID_ID"
      }, { status: 400 });
    }

    // Fetch single room by ID
    const room = await db.select()
      .from(rooms)
      .where(eq(rooms.id, parseInt(id)))
      .limit(1);

    if (room.length === 0) {
      return NextResponse.json({
        error: 'Room not found'
      }, { status: 404 });
    }

    return NextResponse.json(room[0]);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({
        error: "Valid ID is required",
        code: "INVALID_ID"
      }, { status: 400 });
    }

    const requestBody = await request.json();
    const { name } = requestBody;

    // Validate required fields when provided
    if (name !== undefined && (!name || typeof name !== 'string' || name.trim().length === 0)) {
      return NextResponse.json({
        error: "Name must be a non-empty string",
        code: "INVALID_NAME"
      }, { status: 400 });
    }

    // Check if room exists
    const existingRoom = await db.select()
      .from(rooms)
      .where(eq(rooms.id, parseInt(id)))
      .limit(1);

    if (existingRoom.length === 0) {
      return NextResponse.json({
        error: 'Room not found'
      }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if (name !== undefined) {
      updateData.name = name.trim();
    }

    // Update room
    const updated = await db.update(rooms)
      .set(updateData)
      .where(eq(rooms.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({
        error: 'Failed to update room'
      }, { status: 404 });
    }

    return NextResponse.json(updated[0]);

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({
        error: "Valid ID is required",
        code: "INVALID_ID"
      }, { status: 400 });
    }

    // Check if room exists before deletion
    const existingRoom = await db.select()
      .from(rooms)
      .where(eq(rooms.id, parseInt(id)))
      .limit(1);

    if (existingRoom.length === 0) {
      return NextResponse.json({
        error: 'Room not found'
      }, { status: 404 });
    }

    // Delete room (will cascade delete related devices)
    const deleted = await db.delete(rooms)
      .where(eq(rooms.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({
        error: 'Failed to delete room'
      }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Room deleted successfully',
      room: deleted[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}