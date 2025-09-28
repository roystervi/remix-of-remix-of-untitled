import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

// Define available tables and their text columns
const AVAILABLE_TABLES = {
  rooms: ['name'],
  devices: ['name', 'type'],
  audio_levels: [],
  weather_settings: ['provider', 'units', 'city', 'country', 'zip'],
  appearance_settings: ['mode', 'screen_size', 'background_color'],
  backups: [],
  home_assistant_connections: ['url', 'status'],
  database_settings: ['local_path', 'cloud_path', 'preset']
} as const;

type TableName = keyof typeof AVAILABLE_TABLES;

function isValidTableName(table: string): table is TableName {
  return table in AVAILABLE_TABLES;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const term = searchParams.get('term');
    const table = searchParams.get('table');
    const columnsParam = searchParams.get('columns');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Validate required parameters
    if (!term || term.trim() === '') {
      return NextResponse.json({
        error: 'Search term is required',
        code: 'MISSING_TERM'
      }, { status: 400 });
    }

    if (!table || table.trim() === '') {
      return NextResponse.json({
        error: 'Table name is required',
        code: 'MISSING_TABLE'
      }, { status: 400 });
    }

    // Validate table exists
    if (!isValidTableName(table)) {
      return NextResponse.json({
        error: 'Table not found or not accessible',
        code: 'TABLE_NOT_FOUND'
      }, { status: 404 });
    }

    // Get available text columns for the table
    const availableTextColumns = AVAILABLE_TABLES[table];
    
    // If no text columns available, return empty results
    if (availableTextColumns.length === 0) {
      return NextResponse.json({
        results: [],
        searchInfo: {
          term,
          table,
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

    // Determine which columns to search
    let columnsToSearch: string[] = availableTextColumns;
    
    if (columnsParam && columnsParam.trim() !== '') {
      const requestedColumns = columnsParam.split(',').map(col => col.trim());
      
      // Validate requested columns exist in the table's text columns
      const invalidColumns = requestedColumns.filter(col => !availableTextColumns.includes(col));
      if (invalidColumns.length > 0) {
        return NextResponse.json({
          error: `Invalid column names: ${invalidColumns.join(', ')}. Available columns: ${availableTextColumns.join(', ')}`,
          code: 'INVALID_COLUMNS'
        }, { status: 400 });
      }
      
      columnsToSearch = requestedColumns;
    }

    // Sanitize search term for LIKE query
    const sanitizedTerm = term.trim().replace(/[%_]/g, '\\$&');
    const searchPattern = `%${sanitizedTerm}%`;

    // Build the search query using raw SQL
    const whereConditions = columnsToSearch.map(column => `${column} LIKE ?`);
    const whereClause = whereConditions.join(' OR ');
    
    // Create parameter array for the LIKE conditions
    const queryParameters = new Array(columnsToSearch.length).fill(searchPattern);

    // Execute search query
    const searchQuery = `SELECT * FROM ${table} WHERE ${whereClause} LIMIT ? OFFSET ?`;
    const finalQueryParams = [...queryParameters, limit, offset];
    
    const results = await db.all(sql.raw(searchQuery, finalQueryParams));

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM ${table} WHERE ${whereClause}`;
    const countResult = await db.get(sql.raw(countQuery, queryParameters));
    const totalMatches = (countResult as any)?.total || 0;
    const hasMore = offset + limit < totalMatches;

    return NextResponse.json({
      results: results || [],
      searchInfo: {
        term,
        table,
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
    console.error('Database studio search error:', error);
    return NextResponse.json({
      error: 'Internal server error during search operation: ' + error,
      code: 'SEARCH_ERROR'
    }, { status: 500 });
  }
}