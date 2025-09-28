import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { modes } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // Single mode retrieval
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }
      
      const mode = await db.select()
        .from(modes)
        .where(eq(modes.id, parseInt(id)))
        .limit(1);
      
      if (mode.length === 0) {
        return NextResponse.json({ 
          error: 'Mode not found',
          code: "MODE_NOT_FOUND" 
        }, { status: 404 });
      }
      
      return NextResponse.json(mode[0]);
    }
    
    // List with pagination, search, and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const active = searchParams.get('active');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    
    let query = db.select().from(modes);
    let conditions = [];
    
    // Search by name
    if (search) {
      conditions.push(like(modes.name, `%${search}%`));
    }
    
    // Filter by active status
    if (active !== null) {
      if (active === 'true') {
        conditions.push(eq(modes.isActive, true));
      } else if (active === 'false') {
        conditions.push(eq(modes.isActive, false));
      }
    }
    
    // Apply conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    // Apply sorting
    if (sort === 'name') {
      query = order === 'asc' ? query.orderBy(asc(modes.name)) : query.orderBy(desc(modes.name));
    } else if (sort === 'createdAt') {
      query = order === 'asc' ? query.orderBy(asc(modes.createdAt)) : query.orderBy(desc(modes.createdAt));
    } else if (sort === 'updatedAt') {
      query = order === 'asc' ? query.orderBy(asc(modes.updatedAt)) : query.orderBy(desc(modes.updatedAt));
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
    const body = await request.json();
    const { name, icon, isActive } = body;
    
    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ 
        error: "Name is required and must be a non-empty string",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }
    
    // Sanitize inputs
    const trimmedName = name.trim();
    const trimmedIcon = icon ? (typeof icon === 'string' ? icon.trim() : null) : null;
    const activeStatus = typeof isActive === 'boolean' ? isActive : false;
    
    // Prepare insert data
    const insertData = {
      name: trimmedName,
      icon: trimmedIcon,
      isActive: activeStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const newMode = await db.insert(modes)
      .values(insertData)
      .returning();
    
    return NextResponse.json(newMode[0], { status: 201 });
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
    
    const body = await request.json();
    const { name, icon, isActive } = body;
    
    // Check if mode exists
    const existingMode = await db.select()
      .from(modes)
      .where(eq(modes.id, parseInt(id)))
      .limit(1);
    
    if (existingMode.length === 0) {
      return NextResponse.json({ 
        error: 'Mode not found',
        code: "MODE_NOT_FOUND" 
      }, { status: 404 });
    }
    
    // Prepare update data
    const updates: any = {
      updatedAt: new Date().toISOString()
    };
    
    // Validate and add name if provided
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json({ 
          error: "Name must be a non-empty string",
          code: "INVALID_NAME" 
        }, { status: 400 });
      }
      updates.name = name.trim();
    }
    
    // Add icon if provided
    if (icon !== undefined) {
      updates.icon = icon ? (typeof icon === 'string' ? icon.trim() : null) : null;
    }
    
    // Add isActive if provided
    if (isActive !== undefined) {
      updates.isActive = typeof isActive === 'boolean' ? isActive : false;
    }
    
    const updated = await db.update(modes)
      .set(updates)
      .where(eq(modes.id, parseInt(id)))
      .returning();
    
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
    
    // Check if mode exists
    const existingMode = await db.select()
      .from(modes)
      .where(eq(modes.id, parseInt(id)))
      .limit(1);
    
    if (existingMode.length === 0) {
      return NextResponse.json({ 
        error: 'Mode not found',
        code: "MODE_NOT_FOUND" 
      }, { status: 404 });
    }
    
    const deleted = await db.delete(modes)
      .where(eq(modes.id, parseInt(id)))
      .returning();
    
    return NextResponse.json({
      message: 'Mode deleted successfully',
      deletedMode: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}