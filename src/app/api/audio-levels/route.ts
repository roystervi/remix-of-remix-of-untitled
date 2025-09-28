import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { audioLevels, devices } from '@/db/schema';
import { eq, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const sort = searchParams.get('sort') || 'timestamp';
    const order = searchParams.get('order') || 'desc';
    const deviceId = searchParams.get('deviceId');

    let query = db.select().from(audioLevels);

    if (deviceId) {
      const deviceIdNum = parseInt(deviceId);
      if (isNaN(deviceIdNum)) {
        return NextResponse.json({ 
          error: "Invalid device ID", 
          code: "INVALID_DEVICE_ID" 
        }, { status: 400 });
      }
      query = query.where(eq(audioLevels.deviceId, deviceIdNum));
    }

    // Apply sorting
    if (sort === 'timestamp' && order === 'desc') {
      query = query.orderBy(desc(audioLevels.timestamp));
    } else if (sort === 'timestamp' && order === 'asc') {
      query = query.orderBy(asc(audioLevels.timestamp));
    } else if (sort === 'level' && order === 'desc') {
      query = query.orderBy(desc(audioLevels.level));
    } else if (sort === 'level' && order === 'asc') {
      query = query.orderBy(asc(audioLevels.level));
    } else {
      query = query.orderBy(desc(audioLevels.timestamp));
    }

    const results = await query.limit(limit).offset(offset);
    
    return NextResponse.json(results, { status: 200 });

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
    const { deviceId, level } = requestBody;

    // Validate required fields
    if (!deviceId && deviceId !== 0) {
      return NextResponse.json({ 
        error: "Device ID is required", 
        code: "MISSING_DEVICE_ID" 
      }, { status: 400 });
    }

    if (!level && level !== 0) {
      return NextResponse.json({ 
        error: "Level is required", 
        code: "MISSING_LEVEL" 
      }, { status: 400 });
    }

    // Validate deviceId is a valid integer
    if (isNaN(parseInt(deviceId))) {
      return NextResponse.json({ 
        error: "Device ID must be a valid integer", 
        code: "INVALID_DEVICE_ID" 
      }, { status: 400 });
    }

    // Validate level is a valid integer
    if (isNaN(parseInt(level))) {
      return NextResponse.json({ 
        error: "Level must be a valid integer", 
        code: "INVALID_LEVEL" 
      }, { status: 400 });
    }

    const deviceIdNum = parseInt(deviceId);
    const levelNum = parseInt(level);

    // Validate level is between 0-100
    if (levelNum < 0 || levelNum > 100) {
      return NextResponse.json({ 
        error: "Level must be between 0 and 100", 
        code: "INVALID_LEVEL_RANGE" 
      }, { status: 400 });
    }

    // Validate deviceId exists in devices table
    const existingDevice = await db.select()
      .from(devices)
      .where(eq(devices.id, deviceIdNum))
      .limit(1);

    if (existingDevice.length === 0) {
      return NextResponse.json({ 
        error: "Device not found", 
        code: "DEVICE_NOT_FOUND" 
      }, { status: 404 });
    }

    // Create new audio level entry
    const insertData = {
      deviceId: deviceIdNum,
      level: levelNum,
      timestamp: new Date().toISOString()
    };

    const newAudioLevel = await db.insert(audioLevels)
      .values(insertData)
      .returning();

    return NextResponse.json(newAudioLevel[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}