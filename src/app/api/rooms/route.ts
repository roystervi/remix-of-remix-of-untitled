import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { rooms } from '@/db/schema';
import { eq, like, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    // Single record fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const room = await db.select()
        .from(rooms)
        .where(eq(rooms.id, parseInt(id)))
        .limit(1);

      if (room.length === 0) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      }

      return NextResponse.json(room[0]);
    }

    // List with filters
    let query = db.select().from(rooms);

    if (search) {
      query = query.where(like(rooms.name, `%${search}%`));
    }

    // Apply sorting
    if (sort === 'name') {
      query = order === 'asc' ? query.orderBy(asc(rooms.name)) : query.orderBy(desc(rooms.name));
    } else {
      query = order === 'asc' ? query.orderBy(asc(rooms.createdAt)) : query.orderBy(desc(rooms.createdAt));
    }

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
    const { name } = requestBody;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ 
        error: "Name is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ 
        error: "Name must be a non-empty string",
        code: "INVALID_NAME" 
      }, { status: 400 });
    }

    // Sanitize input
    const sanitizedName = name.trim();

    const newRoom = await db.insert(rooms)
      .values({
        name: sanitizedName,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newRoom[0], { status: 201 });

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
    const { name } = requestBody;

    // Validate name if provided
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return NextResponse.json({ 
          error: "Name must be a non-empty string",
          code: "INVALID_NAME" 
        }, { status: 400 });
      }
    }

    // Check if room exists
    const existingRoom = await db.select()
      .from(rooms)
      .where(eq(rooms.id, parseInt(id)))
      .limit(1);

    if (existingRoom.length === 0) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};
    if (name !== undefined) {
      updateData.name = name.trim();
    }

    const updated = await db.update(rooms)
      .set(updateData)
      .where(eq(rooms.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json(updated[0]);

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

    // Check if room exists
    const existingRoom = await db.select()
      .from(rooms)
      .where(eq(rooms.id, parseInt(id)))
      .limit(1);

    if (existingRoom.length === 0) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const deleted = await db.delete(rooms)
      .where(eq(rooms.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Room deleted successfully',
      deleted: deleted[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}