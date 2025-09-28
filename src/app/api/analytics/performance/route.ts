import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { systemPerformance } from '@/db/schema';
import { eq, desc, like, and, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate parameters
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const metricTypeFilter = searchParams.get('metricType');
    
    const limit = limitParam ? Math.min(parseInt(limitParam), 500) : 100;
    const offset = offsetParam ? parseInt(offsetParam) : 0;
    
    // Validate limit parameter
    if (limitParam && (isNaN(limit) || limit <= 0)) {
      return NextResponse.json({ 
        error: "Invalid limit parameter. Must be a positive integer (max 500)",
        code: "INVALID_LIMIT" 
      }, { status: 400 });
    }
    
    // Validate offset parameter
    if (offsetParam && (isNaN(offset) || offset < 0)) {
      return NextResponse.json({ 
        error: "Invalid offset parameter. Must be a non-negative integer",
        code: "INVALID_OFFSET" 
      }, { status: 400 });
    }
    
    // Build base query for history data
    let historyQuery = db.select().from(systemPerformance);
    
    // Apply metricType filter if provided
    if (metricTypeFilter) {
      historyQuery = historyQuery.where(eq(systemPerformance.metricType, metricTypeFilter));
    }
    
    // Get history data with pagination and ordering
    const historyData = await historyQuery
      .orderBy(desc(systemPerformance.timestamp))
      .limit(limit)
      .offset(offset);
    
    // Get latest values for each metric type for dashboard display
    const allMetrics = await db.select()
      .from(systemPerformance)
      .orderBy(desc(systemPerformance.timestamp));
    
    // Group by metricType and get the latest value for each
    const latestMetrics: Record<string, { value: number; timestamp: string }> = {};
    
    for (const metric of allMetrics) {
      if (!latestMetrics[metric.metricType]) {
        latestMetrics[metric.metricType] = {
          value: metric.value,
          timestamp: metric.timestamp
        };
      }
    }
    
    // Filter latest metrics if metricType filter is applied
    const filteredLatestMetrics = metricTypeFilter 
      ? { [metricTypeFilter]: latestMetrics[metricTypeFilter] }
      : latestMetrics;
    
    // Remove undefined values from filtered metrics
    Object.keys(filteredLatestMetrics).forEach(key => {
      if (filteredLatestMetrics[key] === undefined) {
        delete filteredLatestMetrics[key];
      }
    });

    return NextResponse.json({
      latest: filteredLatestMetrics,
      history: historyData,
      pagination: {
        limit,
        offset,
        count: historyData.length,
        hasMore: historyData.length === limit
      },
      filters: {
        metricType: metricTypeFilter || null
      }
    });
    
  } catch (error) {
    console.error('GET systemPerformance error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}