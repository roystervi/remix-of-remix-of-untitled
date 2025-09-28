import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

const FORBIDDEN_KEYWORDS = [
  'INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'CREATE', 'TRUNCATE', 
  'REPLACE', 'MERGE', 'GRANT', 'REVOKE', 'EXEC', 'EXECUTE', 'CALL',
  'PRAGMA', 'ATTACH', 'DETACH', 'BEGIN', 'COMMIT', 'ROLLBACK'
];

const MAX_RESULTS = 1000;

function validateQuery(query: string): { isValid: boolean; error?: string } {
  // Trim and normalize the query
  const trimmedQuery = query.trim();
  
  if (!trimmedQuery) {
    return { isValid: false, error: 'Query cannot be empty' };
  }

  // Check if query starts with SELECT (case insensitive)
  if (!trimmedQuery.match(/^\s*SELECT\s+/i)) {
    return { isValid: false, error: 'Only SELECT queries are allowed' };
  }

  // Check for forbidden keywords (case insensitive)
  const upperQuery = trimmedQuery.toUpperCase();
  for (const keyword of FORBIDDEN_KEYWORDS) {
    if (upperQuery.includes(keyword)) {
      return { 
        isValid: false, 
        error: `Forbidden operation detected: ${keyword}. Only SELECT queries are allowed` 
      };
    }
  }

  return { isValid: true };
}

function addLimitIfNeeded(query: string): string {
  const upperQuery = query.toUpperCase();
  if (upperQuery.includes('LIMIT')) {
    return query;
  }
  return `${query.replace(/;$/, '')} LIMIT ${MAX_RESULTS}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    // Validate request body
    if (!query || typeof query !== 'string') {
      return NextResponse.json({
        error: 'Query field is required and must be a string',
        code: 'MISSING_QUERY'
      }, { status: 400 });
    }

    // Validate query security
    const validation = validateQuery(query);
    if (!validation.isValid) {
      return NextResponse.json({
        error: validation.error,
        code: 'FORBIDDEN_QUERY'
      }, { status: 400 });
    }

    // Execute the query
    try {
      const finalQuery = addLimitIfNeeded(query);
      const results = await db.all(sql.raw(finalQuery));
      
      return NextResponse.json({
        results: results || [],
        rowCount: Array.isArray(results) ? results.length : 0
      }, { status: 200 });

    } catch (executionError: any) {
      console.error('SQL execution error:', executionError);
      
      // Handle specific SQLite errors
      let errorMessage = 'Query execution failed';
      if (executionError.message) {
        if (executionError.message.includes('no such table')) {
          errorMessage = 'Table does not exist';
        } else if (executionError.message.includes('syntax error')) {
          errorMessage = 'SQL syntax error';
        } else if (executionError.message.includes('no such column')) {
          errorMessage = 'Column does not exist';
        } else {
          errorMessage = executionError.message;
        }
      }

      return NextResponse.json({
        error: errorMessage,
        code: 'EXECUTION_ERROR'
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('SQL Console POST error:', error);
    
    // Handle JSON parsing errors
    if (error.message && error.message.includes('JSON')) {
      return NextResponse.json({
        error: 'Invalid JSON in request body',
        code: 'INVALID_JSON'
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Internal server error: ' + (error.message || error),
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}