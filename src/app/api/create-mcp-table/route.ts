import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';

export async function POST(request: NextRequest) {
  try {
    // Create the mcp_config table with exact column specifications
    await db.run(`
      CREATE TABLE IF NOT EXISTS mcp_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT,
        token TEXT,
        connected INTEGER DEFAULT 0,
        entities TEXT DEFAULT '[]',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // Check if table already has records
    const existingRecords = await db.all(`SELECT COUNT(*) as count FROM mcp_config`);
    const recordCount = existingRecords[0]?.count || 0;

    // Only insert default record if table is empty
    if (recordCount === 0) {
      const now = new Date().toISOString();
      
      await db.run(`
        INSERT INTO mcp_config (url, token, connected, entities, created_at, updated_at)
        VALUES (NULL, NULL, 0, '[]', ?, ?)
      `, [now, now]);
    }

    return NextResponse.json({
      message: 'mcp_config table created and seeded successfully',
      tableCreated: true,
      defaultRecordInserted: recordCount === 0
    }, { status: 201 });

  } catch (error) {
    console.error('CREATE_MCP_CONFIG_TABLE error:', error);
    return NextResponse.json({
      error: 'Failed to create mcp_config table: ' + error,
      code: 'TABLE_CREATION_FAILED'
    }, { status: 500 });
  }
}