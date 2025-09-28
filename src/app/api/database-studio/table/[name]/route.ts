import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

const ALLOWED_TABLES = [
  'rooms',
  'devices', 
  'audio_levels',
  'weather_settings',
  'appearance_settings',
  'backups',
  'database_settings'
];

interface TableInfoRow {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: any;
  pk: number;
}

interface SchemaColumn {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
  defaultValue: any;
}

interface ApiResponse {
  schema: SchemaColumn[];
  data: Record<string, any>[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const { name: tableName } = params;
    const { searchParams } = new URL(request.url);
    
    // Validate table name
    if (!tableName || typeof tableName !== 'string') {
      return NextResponse.json({
        error: 'Table name is required',
        code: 'MISSING_TABLE_NAME'
      }, { status: 400 });
    }

    // Sanitize and validate table name against whitelist
    const sanitizedTableName = tableName.toLowerCase().trim();
    if (!ALLOWED_TABLES.includes(sanitizedTableName)) {
      return NextResponse.json({
        error: 'Table not found or not accessible',
        code: 'TABLE_NOT_FOUND'
      }, { status: 404 });
    }

    // Validate and parse pagination parameters
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    
    let limit = 50;
    let offset = 0;

    if (limitParam) {
      const parsedLimit = parseInt(limitParam);
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        return NextResponse.json({
          error: 'Invalid limit parameter',
          code: 'INVALID_LIMIT'
        }, { status: 400 });
      }
      limit = Math.min(parsedLimit, 100);
    }

    if (offsetParam) {
      const parsedOffset = parseInt(offsetParam);
      if (isNaN(parsedOffset) || parsedOffset < 0) {
        return NextResponse.json({
          error: 'Invalid offset parameter',
          code: 'INVALID_OFFSET'
        }, { status: 400 });
      }
      offset = parsedOffset;
    }

    // Get table schema information using PRAGMA table_info
    const schemaResult = await db.all(sql.raw(`PRAGMA table_info(${sanitizedTableName})`));
    
    if (!schemaResult || schemaResult.length === 0) {
      return NextResponse.json({
        error: 'Table not found',
        code: 'TABLE_NOT_FOUND'
      }, { status: 404 });
    }

    // Transform schema information
    const schema: SchemaColumn[] = (schemaResult as TableInfoRow[]).map((row) => ({
      name: row.name,
      type: row.type,
      nullable: row.notnull === 0,
      primaryKey: row.pk === 1,
      defaultValue: row.dflt_value
    }));

    // Get total row count
    const countResult = await db.get(sql.raw(`SELECT COUNT(*) as count FROM ${sanitizedTableName}`));
    const total = (countResult as { count: number }).count;

    // Get data with pagination
    const dataResult = await db.all(
      sql.raw(`SELECT * FROM ${sanitizedTableName} LIMIT ${limit} OFFSET ${offset}`)
    );

    const data = dataResult as Record<string, any>[];
    const hasMore = offset + limit < total;

    const response: ApiResponse = {
      schema,
      data,
      pagination: {
        limit,
        offset,
        total,
        hasMore
      }
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('GET table details error:', error);
    
    // Handle specific SQLite errors
    if (error instanceof Error) {
      if (error.message.includes('no such table')) {
        return NextResponse.json({
          error: 'Table not found',
          code: 'TABLE_NOT_FOUND'
        }, { status: 404 });
      }
      
      if (error.message.includes('syntax error')) {
        return NextResponse.json({
          error: 'Invalid table name',
          code: 'INVALID_TABLE_NAME'
        }, { status: 400 });
      }
    }

    return NextResponse.json({
      error: 'Internal server error: ' + error,
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}