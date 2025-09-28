import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { rooms, devices, audioLevels, weatherSettings, appearanceSettings, backups } from '@/db/schema';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get page info for database size calculation
    const pageInfoResult = await db.all(sql`PRAGMA page_size`);
    const pageCountResult = await db.all(sql`PRAGMA page_count`);
    
    const pageSize = pageInfoResult[0]?.page_size || 4096; // Default SQLite page size
    const pageCount = pageCountResult[0]?.page_count || 0;
    
    // Calculate database size in bytes
    const sizeInBytes = pageSize * pageCount;
    
    // Convert to MB and round to 2 decimal places
    const sizeInMB = Math.round((sizeInBytes / (1024 * 1024)) * 100) / 100;
    
    return NextResponse.json({ size: sizeInMB });
    
  } catch (error) {
    console.error('GET database size error:', error);
    return NextResponse.json({ 
      error: 'Failed to calculate database size',
      code: 'DATABASE_SIZE_ERROR'
    }, { status: 500 });
  }
}