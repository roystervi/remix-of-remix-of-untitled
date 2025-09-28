import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { audioLevels, devices } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = params.id;
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Validate deviceId is provided and is a valid integer
    if (!deviceId || isNaN(parseInt(deviceId))) {
      return NextResponse.json({ 
        error: "Valid device ID is required",
        code: "INVALID_DEVICE_ID" 
      }, { status: 400 });
    }

    const deviceIdInt = parseInt(deviceId);

    // Check if device exists
    const device = await db.select()
      .from(devices)
      .where(eq(devices.id, deviceIdInt))
      .limit(1);

    if (device.length === 0) {
      return NextResponse.json({ 
        error: 'Device not found',
        code: "DEVICE_NOT_FOUND" 
      }, { status: 404 });
    }

    // Get audio levels for the device, sorted by timestamp descending
    const levels = await db.select()
      .from(audioLevels)
      .where(eq(audioLevels.deviceId, deviceIdInt))
      .orderBy(desc(audioLevels.timestamp))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(levels);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}