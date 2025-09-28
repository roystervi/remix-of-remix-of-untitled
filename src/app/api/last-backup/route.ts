import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { backups } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const latestBackup = await db.select()
      .from(backups)
      .orderBy(desc(backups.createdAt))
      .limit(1);

    if (latestBackup.length === 0) {
      return NextResponse.json({ lastBackup: null });
    }

    return NextResponse.json({ 
      lastBackup: latestBackup[0].createdAt 
    });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}