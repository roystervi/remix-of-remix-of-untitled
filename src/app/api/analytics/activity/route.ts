import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { deviceActivity, devices } from '@/db/schema';
import { eq, gte, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Validate required period parameter
    const period = searchParams.get('period');
    if (!period) {
      return NextResponse.json({ 
        error: "Period parameter is required",
        code: "MISSING_PERIOD" 
      }, { status: 400 });
    }

    if (!['day', 'week'].includes(period)) {
      return NextResponse.json({ 
        error: "Period must be one of: day, week",
        code: "INVALID_PERIOD" 
      }, { status: 400 });
    }

    // Handle pagination parameters
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Calculate date range based on period
    const now = new Date();
    let fromDate: Date;

    if (period === 'day') {
      fromDate = new Date(now.getTime() - (24 * 60 * 60 * 1000)); // 24 hours ago
    } else { // week
      fromDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)); // 7 days ago
    }

    // Query device activities with device name join
    const activities = await db
      .select({
        id: deviceActivity.id,
        activityType: deviceActivity.activityType,
        timestamp: deviceActivity.timestamp,
        duration: deviceActivity.duration,
        deviceId: deviceActivity.deviceId,
        deviceName: devices.name
      })
      .from(deviceActivity)
      .innerJoin(devices, eq(deviceActivity.deviceId, devices.id))
      .where(gte(deviceActivity.timestamp, fromDate.toISOString()))
      .orderBy(desc(deviceActivity.timestamp))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(activities);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}