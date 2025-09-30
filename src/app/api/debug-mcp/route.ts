import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';

export async function GET(request: NextRequest) {
  try {
    const results: any = {};
    const errors: any = {};

    // Test 1: Get table schema
    try {
      console.log('Testing PRAGMA table_info(mcp_config)...');
      const schemaResult = await db.run(`PRAGMA table_info(mcp_config)`);
      results.schema = schemaResult;
      console.log('Schema result:', schemaResult);
    } catch (error) {
      console.error('Schema query error:', error);
      errors.schema = {
        message: error instanceof Error ? error.message : 'Unknown schema error',
        error: error
      };
    }

    // Test 2: Select all columns
    try {
      console.log('Testing SELECT * FROM mcp_config LIMIT 1...');
      const selectResult = await db.run(`SELECT * FROM mcp_config LIMIT 1`);
      results.selectAll = selectResult;
      console.log('Select all result:', selectResult);
    } catch (error) {
      console.error('Select all error:', error);
      errors.selectAll = {
        message: error instanceof Error ? error.message : 'Unknown select error',
        error: error
      };
    }

    // Test 3: Check if table exists
    try {
      console.log('Testing table existence...');
      const tableExistsResult = await db.run(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='mcp_config'
      `);
      results.tableExists = tableExistsResult;
      console.log('Table exists result:', tableExistsResult);
    } catch (error) {
      console.error('Table exists error:', error);
      errors.tableExists = {
        message: error instanceof Error ? error.message : 'Unknown table exists error',
        error: error
      };
    }

    // Test 4: List all tables
    try {
      console.log('Testing list all tables...');
      const allTablesResult = await db.run(`
        SELECT name FROM sqlite_master 
        WHERE type='table'
        ORDER BY name
      `);
      results.allTables = allTablesResult;
      console.log('All tables result:', allTablesResult);
    } catch (error) {
      console.error('All tables error:', error);
      errors.allTables = {
        message: error instanceof Error ? error.message : 'Unknown all tables error',
        error: error
      };
    }

    // Test 5: Count records in mcp_config
    try {
      console.log('Testing COUNT(*) FROM mcp_config...');
      const countResult = await db.run(`SELECT COUNT(*) as count FROM mcp_config`);
      results.recordCount = countResult;
      console.log('Count result:', countResult);
    } catch (error) {
      console.error('Count error:', error);
      errors.recordCount = {
        message: error instanceof Error ? error.message : 'Unknown count error',
        error: error
      };
    }

    // Test 6: Try to select specific columns we expect
    try {
      console.log('Testing SELECT id, url, token, connected FROM mcp_config LIMIT 1...');
      const specificColumnsResult = await db.run(`
        SELECT id, url, token, connected, entities, createdAt, updatedAt 
        FROM mcp_config 
        LIMIT 1
      `);
      results.specificColumns = specificColumnsResult;
      console.log('Specific columns result:', specificColumnsResult);
    } catch (error) {
      console.error('Specific columns error:', error);
      errors.specificColumns = {
        message: error instanceof Error ? error.message : 'Unknown specific columns error',
        error: error
      };
    }

    return NextResponse.json({
      success: true,
      message: 'Debug queries completed',
      results,
      errors,
      hasErrors: Object.keys(errors).length > 0,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to execute debug queries',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}