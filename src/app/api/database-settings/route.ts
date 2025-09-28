import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { databaseSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';

const DEFAULT_SETTINGS = {
  autoBackup: false,
  queryLogging: false,
  schemaValidation: true,
  performanceMonitoring: false,
  localPath: '/app/data/backups',
  cloudPath: null,
  preset: 'balanced'
};

const VALID_PRESETS = ['performance', 'balanced', 'storage'];

function validateSettings(data: any) {
  const errors: string[] = [];

  if (data.preset !== undefined && !VALID_PRESETS.includes(data.preset)) {
    errors.push(`Preset must be one of: ${VALID_PRESETS.join(', ')}`);
  }

  if (data.localPath !== undefined && (typeof data.localPath !== 'string' || data.localPath.trim() === '')) {
    errors.push('Local path must be a non-empty string');
  }

  if (data.autoBackup !== undefined && typeof data.autoBackup !== 'boolean') {
    errors.push('Auto backup must be a boolean value');
  }

  if (data.queryLogging !== undefined && typeof data.queryLogging !== 'boolean') {
    errors.push('Query logging must be a boolean value');
  }

  if (data.schemaValidation !== undefined && typeof data.schemaValidation !== 'boolean') {
    errors.push('Schema validation must be a boolean value');
  }

  if (data.performanceMonitoring !== undefined && typeof data.performanceMonitoring !== 'boolean') {
    errors.push('Performance monitoring must be a boolean value');
  }

  return errors;
}

export async function GET(request: NextRequest) {
  try {
    const settings = await db.select()
      .from(databaseSettings)
      .limit(1);

    if (settings.length === 0) {
      return NextResponse.json(DEFAULT_SETTINGS);
    }

    return NextResponse.json(settings[0]);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    
    const validationErrors = validateSettings(requestBody);
    if (validationErrors.length > 0) {
      return NextResponse.json({ 
        error: validationErrors.join('; '),
        code: "VALIDATION_ERROR" 
      }, { status: 400 });
    }

    // Check if settings already exist
    const existingSettings = await db.select()
      .from(databaseSettings)
      .limit(1);

    const now = new Date().toISOString();

    if (existingSettings.length > 0) {
      // Update existing settings
      const updateData = {
        ...requestBody,
        updatedAt: now
      };

      const updated = await db.update(databaseSettings)
        .set(updateData)
        .where(eq(databaseSettings.id, existingSettings[0].id))
        .returning();

      return NextResponse.json(updated[0], { status: 200 });
    } else {
      // Create new settings
      const insertData = {
        autoBackup: requestBody.autoBackup ?? DEFAULT_SETTINGS.autoBackup,
        queryLogging: requestBody.queryLogging ?? DEFAULT_SETTINGS.queryLogging,
        schemaValidation: requestBody.schemaValidation ?? DEFAULT_SETTINGS.schemaValidation,
        performanceMonitoring: requestBody.performanceMonitoring ?? DEFAULT_SETTINGS.performanceMonitoring,
        localPath: requestBody.localPath ?? DEFAULT_SETTINGS.localPath,
        cloudPath: requestBody.cloudPath ?? DEFAULT_SETTINGS.cloudPath,
        preset: requestBody.preset ?? DEFAULT_SETTINGS.preset,
        createdAt: now,
        updatedAt: now
      };

      const newSettings = await db.insert(databaseSettings)
        .values(insertData)
        .returning();

      return NextResponse.json(newSettings[0], { status: 201 });
    }
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const requestBody = await request.json();
    
    const validationErrors = validateSettings(requestBody);
    if (validationErrors.length > 0) {
      return NextResponse.json({ 
        error: validationErrors.join('; '),
        code: "VALIDATION_ERROR" 
      }, { status: 400 });
    }

    // Check if record exists
    const existing = await db.select()
      .from(databaseSettings)
      .where(eq(databaseSettings.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Settings record not found' 
      }, { status: 404 });
    }

    const updateData = {
      ...requestBody,
      updatedAt: new Date().toISOString()
    };

    const updated = await db.update(databaseSettings)
      .set(updateData)
      .where(eq(databaseSettings.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0]);
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
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if record exists
    const existing = await db.select()
      .from(databaseSettings)
      .where(eq(databaseSettings.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Settings record not found' 
      }, { status: 404 });
    }

    const deleted = await db.delete(databaseSettings)
      .where(eq(databaseSettings.id, parseInt(id)))
      .returning();

    return NextResponse.json({ 
      message: 'Database settings deleted successfully',
      deletedRecord: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}