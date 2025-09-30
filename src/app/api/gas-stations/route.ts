import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export async function GET(request: NextRequest) {
  try {
    // First, ensure the table exists
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS gas_stations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        brand TEXT,
        lat REAL NOT NULL,
        lon REAL NOT NULL,
        address TEXT,
        fuel_types TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    const { searchParams } = new URL(request.url);
    const zip = searchParams.get('zip');
    const fuel = searchParams.get('fuel');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    let stations = [];

    // Get all stations initially
    const allStations = await db.all(sql`SELECT * FROM gas_stations`);
    stations = [...allStations]; // Create a copy

    // Apply ZIP filtering if specified
    if (zip) {
      // Validate ZIP code format
      if (!/^\d{5}$/.test(zip)) {
        return NextResponse.json({
          error: 'Invalid ZIP code format. Must be 5 digits.',
          code: 'INVALID_ZIP_FORMAT'
        }, { status: 400 });
      }

      // For ZIP 32225, use hardcoded coordinates
      if (zip === '32225') {
        const zipLat = 30.3322;
        const zipLon = -81.6557;

        stations = stations.filter((station: any) => {
          const distance = calculateDistance(zipLat, zipLon, station.lat, station.lon);
          return distance <= 10;
        });
      } else {
        return NextResponse.json({
          error: 'ZIP code not supported. Only 32225 is supported in this demo.',
          code: 'ZIP_NOT_SUPPORTED'
        }, { status: 400 });
      }
    }

    // Apply fuel filtering if specified
    if (fuel) {
      const validFuelTypes = ['regular', 'premium', 'diesel', 'plus'];
      if (!validFuelTypes.includes(fuel.toLowerCase())) {
        return NextResponse.json({
          error: 'Invalid fuel type. Must be one of: regular, premium, diesel, plus',
          code: 'INVALID_FUEL_TYPE'
        }, { status: 400 });
      }

      const targetFuel = fuel.toLowerCase();
      
      stations = stations.filter((station: any) => {
        try {
          const fuelTypesJson = station.fuel_types;
          if (!fuelTypesJson) return false;
          
          const fuelTypes = JSON.parse(fuelTypesJson);
          if (!Array.isArray(fuelTypes)) return false;
          
          const hasTargetFuel = fuelTypes.some((type: string) => {
            return typeof type === 'string' && type.toLowerCase() === targetFuel;
          });
          
          return hasTargetFuel;
        } catch (error) {
          console.error('Error parsing fuel types for station:', station.id, station.fuel_types, error);
          return false;
        }
      });
    }

    // Apply pagination if no specific filters or after filtering
    if (!zip && !fuel) {
      stations = stations.slice(offset, offset + limit);
    } else if (stations.length > limit) {
      stations = stations.slice(offset, offset + limit);
    }

    // Format response with fuelTypes parsed
    const formattedStations = stations.map((station: any) => {
      let parsedFuelTypes = [];
      try {
        parsedFuelTypes = JSON.parse(station.fuel_types || '[]');
      } catch {
        parsedFuelTypes = [];
      }
      
      return {
        id: station.id,
        name: station.name,
        brand: station.brand,
        lat: station.lat,
        lon: station.lon,
        address: station.address,
        fuelTypes: parsedFuelTypes,
        createdAt: station.created_at,
        updatedAt: station.updated_at
      };
    });

    return NextResponse.json(formattedStations);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error,
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // First, ensure the table exists
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS gas_stations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        brand TEXT,
        lat REAL NOT NULL,
        lon REAL NOT NULL,
        address TEXT,
        fuel_types TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    const requestBody = await request.json();
    const { name, brand, lat, lon, address, fuelTypes } = requestBody;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({
        error: 'Name is required and must be a non-empty string',
        code: 'MISSING_NAME'
      }, { status: 400 });
    }

    if (lat === undefined || lat === null || typeof lat !== 'number') {
      return NextResponse.json({
        error: 'Latitude is required and must be a number',
        code: 'MISSING_LATITUDE'
      }, { status: 400 });
    }

    if (lon === undefined || lon === null || typeof lon !== 'number') {
      return NextResponse.json({
        error: 'Longitude is required and must be a number',
        code: 'MISSING_LONGITUDE'
      }, { status: 400 });
    }

    if (!fuelTypes) {
      return NextResponse.json({
        error: 'fuelTypes is required',
        code: 'MISSING_FUEL_TYPES'
      }, { status: 400 });
    }

    // Validate coordinates range
    if (lat < -90 || lat > 90) {
      return NextResponse.json({
        error: 'Latitude must be between -90 and 90',
        code: 'INVALID_LATITUDE_RANGE'
      }, { status: 400 });
    }

    if (lon < -180 || lon > 180) {
      return NextResponse.json({
        error: 'Longitude must be between -180 and 180',
        code: 'INVALID_LONGITUDE_RANGE'
      }, { status: 400 });
    }

    // Validate fuelTypes
    let parsedFuelTypes: string[];
    try {
      parsedFuelTypes = Array.isArray(fuelTypes) ? fuelTypes : JSON.parse(fuelTypes);
      if (!Array.isArray(parsedFuelTypes)) {
        throw new Error('Not an array');
      }
    } catch {
      return NextResponse.json({
        error: 'fuelTypes must be a valid JSON array',
        code: 'INVALID_FUEL_TYPES_FORMAT'
      }, { status: 400 });
    }

    // Validate fuel types content
    const validFuelTypes = ['regular', 'premium', 'diesel', 'plus'];
    const invalidFuels = parsedFuelTypes.filter(fuel => 
      typeof fuel !== 'string' || !validFuelTypes.includes(fuel.toLowerCase())
    );

    if (invalidFuels.length > 0) {
      return NextResponse.json({
        error: `Invalid fuel types: ${invalidFuels.join(', ')}. Valid types: ${validFuelTypes.join(', ')}`,
        code: 'INVALID_FUEL_TYPES'
      }, { status: 400 });
    }

    const now = new Date().toISOString();
    const fuelTypesJson = JSON.stringify(parsedFuelTypes.map(f => f.toLowerCase()));

    // Insert the new station
    const result = await db.run(sql`
      INSERT INTO gas_stations (name, brand, lat, lon, address, fuel_types, created_at, updated_at)
      VALUES (${name.trim()}, ${brand?.trim() || null}, ${lat}, ${lon}, ${address?.trim() || null}, ${fuelTypesJson}, ${now}, ${now})
    `);

    // Get the inserted record
    const newStation = await db.get(sql`
      SELECT * FROM gas_stations WHERE id = ${result.lastInsertRowid}
    `);

    if (!newStation) {
      throw new Error('Failed to retrieve inserted station');
    }

    // Format response
    const response = {
      id: newStation.id,
      name: newStation.name,
      brand: newStation.brand,
      lat: newStation.lat,
      lon: newStation.lon,
      address: newStation.address,
      fuelTypes: JSON.parse(newStation.fuel_types),
      createdAt: newStation.created_at,
      updatedAt: newStation.updated_at
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error,
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}