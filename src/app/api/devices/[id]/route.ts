import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { devices, rooms } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

const VALID_DEVICE_TYPES = ['light', 'speaker', 'thermostat'];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({
        error: "Valid ID is required",
        code: "INVALID_ID"
      }, { status: 400 });
    }

    const device = await db.select()
      .from(devices)
      .where(eq(devices.id, parseInt(id)))
      .limit(1);

    if (device.length === 0) {
      return NextResponse.json({
        error: "Device not found",
        code: "DEVICE_NOT_FOUND"
      }, { status: 404 });
    }

    return NextResponse.json(device[0]);
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

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({
        error: "Valid ID is required",
        code: "INVALID_ID"
      }, { status: 400 });
    }

    // Check if device exists
    const existingDevice = await db.select()
      .from(devices)
      .where(eq(devices.id, parseInt(id)))
      .limit(1);

    if (existingDevice.length === 0) {
      return NextResponse.json({
        error: "Device not found",
        code: "DEVICE_NOT_FOUND"
      }, { status: 404 });
    }

    const requestBody = await request.json();
    const { name, type, roomId, status } = requestBody;

    // Validate name if provided
    if (name !== undefined && (!name || typeof name !== 'string' || name.trim().length === 0)) {
      return NextResponse.json({
        error: "Name must be a non-empty string",
        code: "INVALID_NAME"
      }, { status: 400 });
    }

    // Validate type if provided
    if (type !== undefined && (!type || !VALID_DEVICE_TYPES.includes(type))) {
      return NextResponse.json({
        error: `Type must be one of: ${VALID_DEVICE_TYPES.join(', ')}`,
        code: "INVALID_TYPE"
      }, { status: 400 });
    }

    // Validate roomId if provided
    if (roomId !== undefined) {
      if (!roomId || isNaN(parseInt(roomId))) {
        return NextResponse.json({
          error: "Room ID must be a valid integer",
          code: "INVALID_ROOM_ID"
        }, { status: 400 });
      }

      // Check if room exists
      const room = await db.select()
        .from(rooms)
        .where(eq(rooms.id, parseInt(roomId)))
        .limit(1);

      if (room.length === 0) {
        return NextResponse.json({
          error: "Room not found",
          code: "ROOM_NOT_FOUND"
        }, { status: 400 });
      }
    }

    // Validate status if provided
    if (status !== undefined && typeof status !== 'boolean') {
      return NextResponse.json({
        error: "Status must be a boolean value",
        code: "INVALID_STATUS"
      }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {
      lastUpdated: new Date().toISOString()
    };

    if (name !== undefined) updateData.name = name.trim();
    if (type !== undefined) updateData.type = type;
    if (roomId !== undefined) updateData.roomId = parseInt(roomId);
    if (status !== undefined) updateData.status = status;

    const updated = await db.update(devices)
      .set(updateData)
      .where(eq(devices.id, parseInt(id)))
      .returning();

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

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({
        error: "Valid ID is required",
        code: "INVALID_ID"
      }, { status: 400 });
    }

    // Check if device exists
    const existingDevice = await db.select()
      .from(devices)
      .where(eq(devices.id, parseInt(id)))
      .limit(1);

    if (existingDevice.length === 0) {
      return NextResponse.json({
        error: "Device not found",
        code: "DEVICE_NOT_FOUND"
      }, { status: 404 });
    }

    const deleted = await db.delete(devices)
      .where(eq(devices.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: "Device deleted successfully",
      device: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}