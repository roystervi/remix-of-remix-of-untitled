import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { rooms, devices, weatherSettings, appearanceSettings, databaseSettings, audioLevels, backups } from '@/db/schema';
import { eq, like, and, or, sql } from 'drizzle-orm';

// Define available tables and their searchable text columns
const SEARCHABLE_TABLES = {
  rooms: { table: rooms, textColumns: ['name'] },
  devices: { table: devices, textColumns: ['name', 'type'] },
  weather_settings: { table: weatherSettings, textColumns: ['provider', 'units', 'city', 'country', 'zip'] },
  appearance_settings: { table: appearanceSettings, textColumns: ['mode', 'screen_size', 'background_color'] },
  database_settings: { table: databaseSettings, textColumns: ['local_path', 'cloud_path', 'preset'] },
  audio_levels: { table: audioLevels, textColumns: [] },
  backups: { table: backups, textColumns: [] }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const term = searchParams.get('term');
    const tableName = searchParams.get('table');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const columnsParam = searchParams.get('columns');

    // Validate required parameters
    if (!term) {
      return NextResponse.json({ 
        error: "Search term is required",
        code: "MISSING_SEARCH_TERM" 
      }, { status: 400 });
    }

    if (!tableName) {
      return NextResponse.json({ 
        error: "Table name is required",
        code: "MISSING_TABLE_NAME" 
      }, { status: 400 });
    }

    // Validate table exists and is accessible
    if (!SEARCHABLE_TABLES[tableName as keyof typeof SEARCHABLE_TABLES]) {
      return NextResponse.json({ 
        error: "Table not found or not accessible",
        code: "TABLE_NOT_FOUND" 
      }, { status: 404 });
    }

    const tableConfig = SEARCHABLE_TABLES[tableName as keyof typeof SEARCHABLE_TABLES];
    const { table, textColumns } = tableConfig;

    // Determine columns to search
    let columnsToSearch: string[] = [];
    
    if (columnsParam) {
      // Validate specified columns exist in the table
      const requestedColumns = columnsParam.split(',').map(col => col.trim());
      const invalidColumns = requestedColumns.filter(col => !textColumns.includes(col));
      
      if (invalidColumns.length > 0) {
        return NextResponse.json({ 
          error: `Invalid columns: ${invalidColumns.join(', ')}. Available columns: ${textColumns.join(', ')}`,
          code: "INVALID_COLUMNS" 
        }, { status: 400 });
      }
      
      columnsToSearch = requestedColumns;
    } else {
      // Use all available text columns
      columnsToSearch = textColumns;
    }

    // Check if table has searchable columns
    if (columnsToSearch.length === 0) {
      return NextResponse.json({
        results: [],
        searchInfo: {
          term,
          table: tableName,
          columnsSearched: [],
          totalMatches: 0
        },
        pagination: {
          limit,
          offset,
          hasMore: false
        }
      });
    }

    // Sanitize search term for LIKE query
    const sanitizedTerm = term.replace(/[%_]/g, '\\$&');
    const searchPattern = `%${sanitizedTerm}%`;

    // Build search conditions using OR for multiple columns
    const searchConditions = columnsToSearch.map(column => {
      return like(table[column as keyof typeof table] as any, searchPattern);
    });

    const searchCondition = searchConditions.length === 1 
      ? searchConditions[0] 
      : or(...searchConditions);

    // Execute search query with pagination
    const results = await db.select()
      .from(table)
      .where(searchCondition)
      .limit(limit + 1) // Get one extra to check if there are more results
      .offset(offset);

    // Check if there are more results
    const hasMore = results.length > limit;
    const actualResults = hasMore ? results.slice(0, -1) : results;

    // Get total count for search info (optional, can be expensive for large tables)
    const countResult = await db.select({ count: sql`count(*)` })
      .from(table)
      .where(searchCondition);
    
    const totalMatches = countResult[0]?.count as number || 0;

    return NextResponse.json({
      results: actualResults,
      searchInfo: {
        term,
        table: tableName,
        columnsSearched: columnsToSearch,
        totalMatches
      },
      pagination: {
        limit,
        offset,
        hasMore
      }
    });

  } catch (error) {
    console.error('Database console search error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}