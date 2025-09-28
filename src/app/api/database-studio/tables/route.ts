import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get all tables using PRAGMA table_list
    const tableListResult = await db.all(sql`PRAGMA table_list`);
    
    // Filter out system tables (sqlite_ prefixed tables)
    const userTables = tableListResult.filter((table: any) => 
      !table.name.startsWith('sqlite_') && 
      !table.name.startsWith('__drizzle')
    );

    const tables = [];

    for (const table of userTables) {
      try {
        // Get row count for each table
        const countResult = await db.get(sql.raw(`SELECT COUNT(*) as count FROM ${table.name}`));
        const rowCount = countResult?.count || 0;

        // Get column information using PRAGMA table_info
        const columnInfo = await db.all(sql.raw(`PRAGMA table_info(${table.name})`));
        const columnCount = columnInfo.length;

        tables.push({
          name: table.name,
          rowCount: rowCount,
          columnCount: columnCount,
          type: table.type || 'table'
        });
      } catch (tableError) {
        console.warn(`Error processing table ${table.name}:`, tableError);
        // Include table even if we can't get detailed info
        tables.push({
          name: table.name,
          rowCount: 0,
          columnCount: 0,
          type: table.type || 'table'
        });
      }
    }

    // Sort tables by name
    tables.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ tables }, { status: 200 });

  } catch (error) {
    console.error('Database tables API error:', error);
    return NextResponse.json({ 
      error: 'Failed to retrieve database tables information',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}