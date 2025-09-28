import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { rooms, devices, audioLevels, weatherSettings, appearanceSettings, backups } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Query all tables
    const [roomsData, devicesData, audioLevelsData, weatherSettingsData, appearanceSettingsData] = await Promise.all([
      db.select().from(rooms),
      db.select().from(devices),
      db.select().from(audioLevels),
      db.select().from(weatherSettings),
      db.select().from(appearanceSettings)
    ]);

    // Structure response
    const backupData = {
      tables: {
        rooms: roomsData,
        devices: devicesData,
        audioLevels: audioLevelsData,
        weatherSettings: weatherSettingsData,
        appearanceSettings: appearanceSettingsData
      }
    };

    // Insert backup record
    await db.insert(backups).values({
      createdAt: new Date().toISOString()
    });

    // Return backup with proper headers
    const response = NextResponse.json(backupData);
    response.headers.set('Content-Type', 'application/json');
    response.headers.set('Content-Disposition', 'attachment; filename="backup.json"');
    
    return response;

  } catch (error) {
    console.error('GET backup error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate backup: ' + error,
      code: 'BACKUP_EXPORT_FAILED'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();

    // Validate JSON structure
    if (!requestBody || typeof requestBody !== 'object') {
      return NextResponse.json({ 
        error: 'Invalid JSON format',
        code: 'INVALID_JSON_FORMAT'
      }, { status: 400 });
    }

    if (!requestBody.tables || typeof requestBody.tables !== 'object') {
      return NextResponse.json({ 
        error: 'Missing or invalid tables property',
        code: 'MISSING_TABLES_PROPERTY'
      }, { status: 400 });
    }

    const { tables } = requestBody;

    // Validate required table names
    const requiredTables = ['rooms', 'devices', 'audioLevels', 'weatherSettings', 'appearanceSettings'];
    for (const tableName of requiredTables) {
      if (!tables[tableName] || !Array.isArray(tables[tableName])) {
        return NextResponse.json({ 
          error: `Missing or invalid ${tableName} data`,
          code: 'INVALID_TABLE_DATA'
        }, { status: 400 });
      }
    }

    // Validate data structure for each table
    for (const room of tables.rooms) {
      if (!room.name || typeof room.name !== 'string') {
        return NextResponse.json({ 
          error: 'Invalid room data: name is required',
          code: 'INVALID_ROOM_DATA'
        }, { status: 400 });
      }
    }

    for (const device of tables.devices) {
      if (!device.name || typeof device.name !== 'string' || 
          !device.type || typeof device.type !== 'string' ||
          typeof device.roomId !== 'number') {
        return NextResponse.json({ 
          error: 'Invalid device data: name, type, and roomId are required',
          code: 'INVALID_DEVICE_DATA'
        }, { status: 400 });
      }
    }

    for (const audioLevel of tables.audioLevels) {
      if (typeof audioLevel.deviceId !== 'number' || 
          typeof audioLevel.level !== 'number' ||
          !audioLevel.timestamp || typeof audioLevel.timestamp !== 'string') {
        return NextResponse.json({ 
          error: 'Invalid audio level data: deviceId, level, and timestamp are required',
          code: 'INVALID_AUDIO_LEVEL_DATA'
        }, { status: 400 });
      }
    }

    for (const weatherSetting of tables.weatherSettings) {
      if (!weatherSetting.provider || typeof weatherSetting.provider !== 'string' ||
          !weatherSetting.units || typeof weatherSetting.units !== 'string') {
        return NextResponse.json({ 
          error: 'Invalid weather settings data: provider and units are required',
          code: 'INVALID_WEATHER_SETTINGS_DATA'
        }, { status: 400 });
      }
    }

    for (const appearanceSetting of tables.appearanceSettings) {
      if (!appearanceSetting.mode || typeof appearanceSetting.mode !== 'string' ||
          !appearanceSetting.screenSize || typeof appearanceSetting.screenSize !== 'string' ||
          typeof appearanceSetting.width !== 'number' ||
          typeof appearanceSetting.height !== 'number' ||
          !appearanceSetting.backgroundColor || typeof appearanceSetting.backgroundColor !== 'string') {
        return NextResponse.json({ 
          error: 'Invalid appearance settings data: required fields are missing or invalid',
          code: 'INVALID_APPEARANCE_SETTINGS_DATA'
        }, { status: 400 });
      }
    }

    // Use transaction for atomicity
    const result = await db.transaction(async (tx) => {
      // Delete existing data in reverse order (respecting foreign keys)
      await tx.delete(audioLevels);
      await tx.delete(devices);
      await tx.delete(rooms);
      await tx.delete(weatherSettings);
      await tx.delete(appearanceSettings);

      const counts = {
        rooms: 0,
        devices: 0,
        audioLevels: 0,
        weatherSettings: 0,
        appearanceSettings: 0
      };

      // Map old IDs to new IDs
      const roomIdMap = new Map<number, number>();
      const deviceIdMap = new Map<number, number>();

      // Import rooms first (no foreign key dependencies)
      if (tables.rooms.length > 0) {
        for (let i = 0; i < tables.rooms.length; i++) {
          const room = tables.rooms[i];
          const insertedRoom = await tx.insert(rooms).values({
            name: room.name,
            createdAt: room.createdAt || new Date().toISOString()
          }).returning();
          
          // Map old ID to new ID
          if (room.id) {
            roomIdMap.set(room.id, insertedRoom[0].id);
          }
          counts.rooms++;
        }
      }

      // Import devices (depends on rooms)
      if (tables.devices.length > 0) {
        for (let i = 0; i < tables.devices.length; i++) {
          const device = tables.devices[i];
          
          // Map roomId from old to new
          let newRoomId = device.roomId;
          if (roomIdMap.has(device.roomId)) {
            newRoomId = roomIdMap.get(device.roomId)!;
          }
          
          const insertedDevice = await tx.insert(devices).values({
            roomId: newRoomId,
            name: device.name,
            type: device.type,
            status: device.status !== undefined ? device.status : false,
            lastUpdated: device.lastUpdated || new Date().toISOString()
          }).returning();
          
          // Map old ID to new ID
          if (device.id) {
            deviceIdMap.set(device.id, insertedDevice[0].id);
          }
          counts.devices++;
        }
      }

      // Import audio levels (depends on devices)
      if (tables.audioLevels.length > 0) {
        for (let i = 0; i < tables.audioLevels.length; i++) {
          const audioLevel = tables.audioLevels[i];
          
          // Map deviceId from old to new
          let newDeviceId = audioLevel.deviceId;
          if (deviceIdMap.has(audioLevel.deviceId)) {
            newDeviceId = deviceIdMap.get(audioLevel.deviceId)!;
          }
          
          await tx.insert(audioLevels).values({
            deviceId: newDeviceId,
            level: audioLevel.level,
            timestamp: audioLevel.timestamp
          });
          
          counts.audioLevels++;
        }
      }

      // Import weather settings (no dependencies)
      if (tables.weatherSettings.length > 0) {
        const weatherSettingsToInsert = tables.weatherSettings.map(setting => ({
          provider: setting.provider,
          apiKey: setting.apiKey || null,
          latitude: setting.latitude || null,
          longitude: setting.longitude || null,
          units: setting.units,
          city: setting.city || null,
          country: setting.country || null,
          zip: setting.zip || null,
          updatedAt: setting.updatedAt || new Date().toISOString()
        }));
        await tx.insert(weatherSettings).values(weatherSettingsToInsert);
        counts.weatherSettings = weatherSettingsToInsert.length;
      }

      // Import appearance settings (no dependencies)
      if (tables.appearanceSettings.length > 0) {
        const appearanceSettingsToInsert = tables.appearanceSettings.map(setting => ({
          mode: setting.mode || 'auto',
          screenSize: setting.screenSize || 'desktop',
          width: setting.width || 1200,
          height: setting.height || 800,
          backgroundColor: setting.backgroundColor || '#ffffff',
          updatedAt: setting.updatedAt || new Date().toISOString()
        }));
        await tx.insert(appearanceSettings).values(appearanceSettingsToInsert);
        counts.appearanceSettings = appearanceSettingsToInsert.length;
      }

      return counts;
    });

    // Insert backup record
    await db.insert(backups).values({
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      message: 'Backup imported successfully',
      importedCounts: result
    }, { status: 200 });

  } catch (error) {
    console.error('POST backup error:', error);
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json({ 
        error: 'Invalid JSON format',
        code: 'MALFORMED_JSON'
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Failed to import backup: ' + error,
      code: 'BACKUP_IMPORT_FAILED'
    }, { status: 500 });
  }
}