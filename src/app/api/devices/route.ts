import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { devices, rooms } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';

const VALID_DEVICE_TYPES = ['light', 'speaker', 'thermostat'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const roomId = searchParams.get('room_id');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'id';
    const order = searchParams.get('order') || 'desc';

    // Single device by ID
    if (id) {
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
        return NextResponse.json({ error: 'Device not found' }, { status: 404 });
      }

      return NextResponse.json(device[0]);
    }

    // List devices with filtering and pagination
    let query = db.select().from(devices);
    let conditions = [];

    // Filter by room_id
    if (roomId) {
      if (isNaN(parseInt(roomId))) {
        return NextResponse.json({ 
          error: "Valid room_id is required",
          code: "INVALID_ROOM_ID" 
        }, { status: 400 });
      }
      conditions.push(eq(devices.roomId, parseInt(roomId)));
    }

    // Search functionality
    if (search) {
      conditions.push(or(
        like(devices.name, `%${search}%`),
        like(devices.type, `%${search}%`)
      ));
    }

    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions));
    }

    // Apply sorting
    const orderDirection = order === 'asc' ? asc : desc;
    query = query.orderBy(orderDirection(devices[sort as keyof typeof devices] || devices.id));

    // Apply pagination
    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const { roomId, name, type, status } = requestBody;

    // Validate required fields
    if (!roomId) {
      return NextResponse.json({ 
        error: "roomId is required",
        code: "MISSING_ROOM_ID" 
      }, { status: 400 });
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ 
        error: "name is required and must be a non-empty string",
        code: "MISSING_NAME" 
      }, { status: 400 });
    }

    if (!type || typeof type !== 'string') {
      return NextResponse.json({ 
        error: "type is required",
        code: "MISSING_TYPE" 
      }, { status: 400 });
    }

    // Validate device type
    if (!VALID_DEVICE_TYPES.includes(type)) {
      return NextResponse.json({ 
        error: `type must be one of: ${VALID_DEVICE_TYPES.join(', ')}`,
        code: "INVALID_DEVICE_TYPE" 
      }, { status: 400 });
    }

    // Validate roomId is a valid integer
    if (isNaN(parseInt(roomId))) {
      return NextResponse.json({ 
        error: "roomId must be a valid integer",
        code: "INVALID_ROOM_ID" 
      }, { status: 400 });
    }

    // Validate foreign key - check if room exists
    const room = await db.select()
      .from(rooms)
      .where(eq(rooms.id, parseInt(roomId)))
      .limit(1);

    if (room.length === 0) {
      return NextResponse.json({ 
        error: "Room with specified roomId does not exist",
        code: "ROOM_NOT_FOUND" 
      }, { status: 400 });
    }

    // Prepare insert data with defaults and sanitization
    const insertData = {
      roomId: parseInt(roomId),
      name: name.trim(),
      type: type.trim(),
      status: status !== undefined ? Boolean(status) : false,
      lastUpdated: new Date().toISOString()
    };

    const newDevice = await db.insert(devices)
      .values(insertData)
      .returning();

    return NextResponse.json(newDevice[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const requestBody = await request.json();
    const { roomId, name, type, status } = requestBody;

    // Check if device exists
    const existingDevice = await db.select()
      .from(devices)
      .where(eq(devices.id, parseInt(id)))
      .limit(1);

    if (existingDevice.length === 0) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    // Validate updates if provided
    const updates: any = {};

    if (roomId !== undefined) {
      if (isNaN(parseInt(roomId))) {
        return NextResponse.json({ 
          error: "roomId must be a valid integer",
          code: "INVALID_ROOM_ID" 
        }, { status: 400 });
      }

      // Validate foreign key - check if room exists
      const room = await db.select()
        .from(rooms)
        .where(eq(rooms.id, parseInt(roomId)))
        .limit(1);

      if (room.length === 0) {
        return NextResponse.json({ 
          error: "Room with specified roomId does not exist",
          code: "ROOM_NOT_FOUND" 
        }, { status: 400 });
      }

      updates.roomId = parseInt(roomId);
    }

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json({ 
          error: "name must be a non-empty string",
          code: "INVALID_NAME" 
        }, { status: 400 });
      }
      updates.name = name.trim();
    }

    if (type !== undefined) {
      if (!VALID_DEVICE_TYPES.includes(type)) {
        return NextResponse.json({ 
          error: `type must be one of: ${VALID_DEVICE_TYPES.join(', ')}`,
          code: "INVALID_DEVICE_TYPE" 
        }, { status: 400 });
      }
      updates.type = type.trim();
    }

    if (status !== undefined) {
      updates.status = Boolean(status);
    }

    // Always update lastUpdated
    updates.lastUpdated = new Date().toISOString();

    const updatedDevice = await db.update(devices)
      .set(updates)
      .where(eq(devices.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedDevice[0]);
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

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
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    const deletedDevice = await db.delete(devices)
      .where(eq(devices.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Device deleted successfully',
      device: deletedDevice[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}