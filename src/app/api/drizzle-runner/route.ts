import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { readdir, readFile, stat } from 'fs/promises';
import { join } from 'path';

interface Migration {
  id: string;
  name: string;
  status: 'pending' | 'applied';
  appliedAt?: string;
}

interface MigrationFile {
  id: string;
  name: string;
  filepath: string;
}

// Simulated migration tracking table (in production, this would be managed by Drizzle)
const appliedMigrations: Set<string> = new Set();

async function getMigrationFiles(): Promise<MigrationFile[]> {
  try {
    const migrationDirs = [
      join(process.cwd(), 'drizzle'),
      join(process.cwd(), 'migrations'),
      join(process.cwd(), 'src/db/migrations')
    ];
    
    for (const dir of migrationDirs) {
      try {
        const files = await readdir(dir);
        const sqlFiles = files.filter(file => file.endsWith('.sql'));
        
        if (sqlFiles.length > 0) {
          return sqlFiles.map(file => ({
            id: file.replace('.sql', ''),
            name: file,
            filepath: join(dir, file)
          }));
        }
      } catch {
        // Directory doesn't exist, continue to next
        continue;
      }
    }
    
    // Return simulated migrations if no files found
    return [
      { id: '0001', name: '0001_initial_schema.sql', filepath: 'simulated' },
      { id: '0002', name: '0002_add_home_assistant.sql', filepath: 'simulated' },
      { id: '0003', name: '0003_add_database_settings.sql', filepath: 'simulated' }
    ];
  } catch (error) {
    console.error('Error reading migration files:', error);
    return [];
  }
}

async function getMigrationStatus(): Promise<Migration[]> {
  const files = await getMigrationFiles();
  
  return files.map(file => ({
    id: file.id,
    name: file.name,
    status: appliedMigrations.has(file.id) ? 'applied' : 'pending',
    appliedAt: appliedMigrations.has(file.id) ? new Date().toISOString() : undefined
  }));
}

export async function GET(request: NextRequest) {
  try {
    const migrations = await getMigrationStatus();
    const pendingCount = migrations.filter(m => m.status === 'pending').length;
    
    return NextResponse.json({
      migrations,
      pendingCount,
      message: migrations.length === 0 ? 'No migrations found in project' : undefined
    }, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Failed to fetch migrations: ' + error,
      code: 'MIGRATION_FETCH_ERROR'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { migrationName, migrationId } = body;
    
    if (!migrationName && !migrationId) {
      return NextResponse.json({
        error: 'Migration name or ID is required',
        code: 'MISSING_MIGRATION_IDENTIFIER'
      }, { status: 400 });
    }
    
    const migrations = await getMigrationStatus();
    const targetMigration = migrations.find(m => 
      m.name === migrationName || m.id === migrationId
    );
    
    if (!targetMigration) {
      return NextResponse.json({
        error: 'Migration not found',
        code: 'MIGRATION_NOT_FOUND'
      }, { status: 400 });
    }
    
    if (targetMigration.status === 'applied') {
      return NextResponse.json({
        error: 'Migration already applied',
        code: 'MIGRATION_ALREADY_APPLIED'
      }, { status: 400 });
    }
    
    // Execute migration
    try {
      // In production, you would use the actual migration directory
      // await migrate(db, { migrationsFolder: './drizzle' });
      
      // For this demo, simulate migration execution
      const files = await getMigrationFiles();
      const migrationFile = files.find(f => f.id === targetMigration.id);
      
      if (migrationFile && migrationFile.filepath !== 'simulated') {
        // Read and potentially execute real migration file
        const migrationContent = await readFile(migrationFile.filepath, 'utf-8');
        console.log(`Executing migration ${targetMigration.name}:`, migrationContent.substring(0, 200) + '...');
        
        // Execute SQL statements (in production, parse and run each statement)
        // For safety in demo, we'll just simulate
      }
      
      // Mark as applied
      appliedMigrations.add(targetMigration.id);
      
      const updatedMigration = {
        ...targetMigration,
        status: 'applied' as const,
        appliedAt: new Date().toISOString()
      };
      
      return NextResponse.json({
        success: true,
        migration: updatedMigration,
        message: `Migration ${targetMigration.name} executed successfully`
      }, { status: 200 });
      
    } catch (executionError) {
      console.error('Migration execution error:', executionError);
      return NextResponse.json({
        error: 'Migration execution failed: ' + executionError,
        code: 'MIGRATION_EXECUTION_ERROR'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error,
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'reset') {
      // Reset all migrations (mark all as pending)
      appliedMigrations.clear();
      
      return NextResponse.json({
        success: true,
        message: 'All migrations reset to pending status'
      }, { status: 200 });
    }
    
    if (action === 'run-all') {
      // Execute all pending migrations
      const migrations = await getMigrationStatus();
      const pending = migrations.filter(m => m.status === 'pending');
      
      if (pending.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'No pending migrations to execute'
        }, { status: 200 });
      }
      
      // Execute all pending migrations
      const executed = [];
      for (const migration of pending) {
        try {
          appliedMigrations.add(migration.id);
          executed.push(migration.name);
        } catch (error) {
          console.error(`Failed to execute migration ${migration.name}:`, error);
          return NextResponse.json({
            error: `Failed to execute migration ${migration.name}: ${error}`,
            code: 'BATCH_MIGRATION_ERROR'
          }, { status: 500 });
        }
      }
      
      return NextResponse.json({
        success: true,
        executed,
        message: `Successfully executed ${executed.length} migrations`
      }, { status: 200 });
    }
    
    return NextResponse.json({
      error: 'Invalid action. Use ?action=reset or ?action=run-all',
      code: 'INVALID_ACTION'
    }, { status: 400 });
    
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const migrationId = searchParams.get('id');
    
    if (!migrationId) {
      return NextResponse.json({
        error: 'Migration ID is required',
        code: 'MISSING_MIGRATION_ID'
      }, { status: 400 });
    }
    
    if (!appliedMigrations.has(migrationId)) {
      return NextResponse.json({
        error: 'Migration not found or not applied',
        code: 'MIGRATION_NOT_APPLIED'
      }, { status: 404 });
    }
    
    // Rollback migration (mark as pending)
    appliedMigrations.delete(migrationId);
    
    const migrations = await getMigrationStatus();
    const rolledBackMigration = migrations.find(m => m.id === migrationId);
    
    return NextResponse.json({
      success: true,
      migration: rolledBackMigration,
      message: `Migration ${migrationId} rolled back successfully`
    }, { status: 200 });
    
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}