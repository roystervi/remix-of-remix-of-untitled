import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const results: any = {};

    // Check if settings table exists and get its structure
    try {
      const settingsTableInfo = await db.all(sql`PRAGMA table_info(settings)`);
      results.settingsTable = {
        exists: true,
        columns: settingsTableInfo,
        columnNames: settingsTableInfo.map((col: any) => col.name)
      };

      // Get sample data from settings table
      const settingsData = await db.all(sql`SELECT * FROM settings LIMIT 1`);
      results.settingsTable.sampleData = settingsData;
      results.settingsTable.recordCount = settingsData.length;
    } catch (error) {
      results.settingsTable = {
        exists: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Check mcp_settings table
    try {
      const mcpSettingsTableInfo = await db.all(sql`PRAGMA table_info(mcp_settings)`);
      results.mcpSettingsTable = {
        exists: true,
        columns: mcpSettingsTableInfo,
        columnNames: mcpSettingsTableInfo.map((col: any) => col.name)
      };

      const mcpSettingsData = await db.all(sql`SELECT * FROM mcp_settings LIMIT 1`);
      results.mcpSettingsTable.sampleData = mcpSettingsData;
      results.mcpSettingsTable.recordCount = mcpSettingsData.length;
    } catch (error) {
      results.mcpSettingsTable = {
        exists: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Check mcp_config table
    try {
      const mcpConfigTableInfo = await db.all(sql`PRAGMA table_info(mcp_config)`);
      results.mcpConfigTable = {
        exists: true,
        columns: mcpConfigTableInfo,
        columnNames: mcpConfigTableInfo.map((col: any) => col.name)
      };

      const mcpConfigData = await db.all(sql`SELECT * FROM mcp_config LIMIT 1`);
      results.mcpConfigTable.sampleData = mcpConfigData;
      results.mcpConfigTable.recordCount = mcpConfigData.length;
    } catch (error) {
      results.mcpConfigTable = {
        exists: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Get list of all tables in the database
    try {
      const allTables = await db.all(sql`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`);
      results.allTables = allTables.map((table: any) => table.name);
    } catch (error) {
      results.allTables = {
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Summary and recommendations
    results.summary = {
      message: "Database structure analysis complete",
      tablesFound: results.allTables ? results.allTables.length : 0,
      mcpRelatedTables: [
        results.settingsTable?.exists ? 'settings' : null,
        results.mcpSettingsTable?.exists ? 'mcp_settings' : null,
        results.mcpConfigTable?.exists ? 'mcp_config' : null
      ].filter(Boolean),
      recommendation: "Use the table with the most appropriate structure for your MCP configuration needs"
    };

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({
      error: 'Failed to analyze database structure',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}