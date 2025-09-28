import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { energyUsage, devices } from '@/db/schema';
import { eq, gte, sum, avg, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Validate required period parameter
    if (!period) {
      return NextResponse.json({
        error: "Period parameter is required",
        code: "MISSING_PERIOD"
      }, { status: 400 });
    }

    // Validate period values
    const validPeriods = ['day', 'week', 'month'];
    if (!validPeriods.includes(period)) {
      return NextResponse.json({
        error: "Period must be one of: day, week, month",
        code: "INVALID_PERIOD"
      }, { status: 400 });
    }

    // Calculate date ranges based on period
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const startDateString = startDate.toISOString();

    // Get summary statistics
    const summaryQuery = await db
      .select({
        totalKwh: sum(energyUsage.consumptionKwh),
        avgKwh: avg(energyUsage.consumptionKwh),
        totalCost: sum(energyUsage.cost)
      })
      .from(energyUsage)
      .where(gte(energyUsage.timestamp, startDateString));

    const summaryResult = summaryQuery[0];

    // Get device breakdowns with pagination
    const deviceBreakdownsQuery = await db
      .select({
        deviceId: energyUsage.deviceId,
        deviceName: devices.name,
        totalKwh: sum(energyUsage.consumptionKwh),
        totalCost: sum(energyUsage.cost)
      })
      .from(energyUsage)
      .innerJoin(devices, eq(energyUsage.deviceId, devices.id))
      .where(gte(energyUsage.timestamp, startDateString))
      .groupBy(energyUsage.deviceId, devices.name)
      .limit(limit)
      .offset(offset);

    // Format the response
    const response = {
      totalKwh: Number(summaryResult.totalKwh) || 0,
      avgKwh: Number(summaryResult.avgKwh) || 0,
      totalCost: Number(summaryResult.totalCost) || 0,
      deviceBreakdowns: deviceBreakdownsQuery.map(breakdown => ({
        deviceId: breakdown.deviceId,
        deviceName: breakdown.deviceName,
        totalKwh: Number(breakdown.totalKwh) || 0,
        totalCost: Number(breakdown.totalCost) || 0
      }))
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('GET energy analytics error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}