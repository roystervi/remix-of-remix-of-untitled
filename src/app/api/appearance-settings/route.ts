import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { appearanceSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';

const defaults = {
  primaryColor: '#3b82f6',
  backgroundColor: 'rgb(92, 113, 132)',
  cardPlaceholderColor: '#9ca3af',
  navbarBackgroundColor: 'rgb(22, 143, 203)',
  themePreset: 'default',
  screenSize: 'desktop',
  width: 1200,
  height: 800,
  mode: 'auto',
  updatedAt: new Date().toISOString(),
};

export async function GET() {
  try {
    let result = await db.select().from(appearanceSettings).limit(1);
    if (result.length === 0) {
      await db.insert(appearanceSettings).values(defaults);
      result = await db.select().from(appearanceSettings).limit(1);
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Failed to fetch appearance settings:', error);
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const updated = await db
      .update(appearanceSettings)
      .set({ ...body, updatedAt: new Date().toISOString() })
      .where(eq(appearanceSettings.id, 1))
      .returning();
    if (updated.length === 0) {
      await db.insert(appearanceSettings).values({ id: 1, ...defaults, ...body, updatedAt: new Date().toISOString() });
      const fresh = await db.select().from(appearanceSettings).where(eq(appearanceSettings.id, 1));
      return NextResponse.json(fresh[0]);
    }
    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Failed to update appearance settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}