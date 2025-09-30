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
  const { searchParams } = new URL(request.url);
  const zip = searchParams.get('zip') || '32277';
  const fuel = searchParams.get('fuel') || 'all';
  // radius = searchParams.get('radius') || '20';  // Remove radius dependency

  // Geocode ZIP to lat/lon
  let lat = 30.2895; // Center for 32277 Jacksonville Beach
  let lon = -81.4001;
  try {
    const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${zip}&limit=1`);
    const geoData = await geoRes.json();
    if (geoData[0]) {
      lat = parseFloat(geoData[0].lat);
      lon = parseFloat(geoData[0].lon);
    }
  } catch (error) {
    console.error('Geocoding failed:', error);
  }

  // Enhanced fallback with real stations specific to Jacksonville/32277 area
  const fallbackStations: GasStation[] = [
    { 
      id: 1, 
      zip: '32250',
      name: 'Circle K #2721210', 
      brand: 'Circle K', 
      address: '1031 Beach Blvd, Jacksonville Beach, FL 32250', 
      lat: 30.2887, 
      lon: -81.4001, 
      fuelType: 'all', 
      price: '3.09', 
      rating: 3.5, 
      distance: 0.5 
    },
    { 
      id: 2, 
      zip: '32277',
      name: 'RaceTrac Merrill Rd', 
      brand: 'RaceTrac', 
      address: '8240 Merrill Rd, Jacksonville, FL 32277', 
      lat: 30.3680, 
      lon: -81.4650, 
      fuelType: 'regular', 
      price: '3.199', 
      rating: 4.2, 
      distance: 2.1 
    },
    { 
      id: 3, 
      zip: '32211',
      name: 'Sunoco Arlington Expy', 
      brand: 'Sunoco', 
      address: '7961 Arlington Expy, Jacksonville, FL 32211', 
      lat: 30.3281, 
      lon: -81.5733, 
      fuelType: 'premium', 
      price: '3.45', 
      rating: 4.0, 
      distance: 8.3 
    },
    { 
      id: 4, 
      zip: '32216',
      name: 'Sunoco Southside Blvd', 
      brand: 'Sunoco', 
      address: '4023 Southside Blvd, Jacksonville, FL 32216', 
      lat: 30.2745, 
      lon: -81.5585, 
      fuelType: 'diesel', 
      price: '3.25', 
      rating: 3.9, 
      distance: 10.2 
    },
    { 
      id: 5, 
      zip: '32257',
      name: 'Sunoco San Jose Blvd', 
      brand: 'Sunoco', 
      address: '10550 San Jose Blvd, Jacksonville, FL 32257', 
      lat: 30.1860, 
      lon: -81.6287, 
      fuelType: 'regular', 
      price: '3.15', 
      rating: 4.1, 
      distance: 12.4 
    },
    { 
      id: 6, 
      zip: '32209',
      name: 'Sunoco Lane Ave', 
      brand: 'Sunoco', 
      address: '1879 S Lane Ave, Jacksonville, FL 32209', 
      lat: 30.2855, 
      lon: -81.7553, 
      fuelType: 'premium', 
      price: '3.39', 
      rating: 3.7, 
      distance: 15.6 
    },
    { 
      id: 7, 
      zip: '32205',
      name: 'Sunoco Rayford St', 
      brand: 'Sunoco', 
      address: '2990 Rayford St, Jacksonville, FL 32205', 
      lat: 30.3207, 
      lon: -81.7053, 
      fuelType: 'diesel', 
      price: '3.20', 
      rating: 4.0, 
      distance: 9.8 
    },
    { 
      id: 8, 
      zip: '32205',
      name: 'Sunoco McDuff Ave', 
      brand: 'Sunoco', 
      address: '1060 McDuff Ave S, Jacksonville, FL 32205', 
      lat: 30.3110, 
      lon: -81.7057, 
      fuelType: 'regular', 
      price: '3.10', 
      rating: 3.8, 
      distance: 11.2 
    },
    { 
      id: 9, 
      zip: '32244',
      name: 'RaceTrac Blanding North', 
      brand: 'RaceTrac', 
      address: '8108 Blanding Blvd, Jacksonville, FL 32244', 
      lat: 30.2370, 
      lon: -81.7700, 
      fuelType: 'all', 
      price: '3.199', 
      rating: 4.3, 
      distance: 18.7 
    },
    { 
      id: 10, 
      zip: '32210',
      name: 'RaceTrac Harlow', 
      brand: 'RaceTrac', 
      address: '6913 103rd St, Jacksonville, FL 32210', 
      lat: 30.2649, 
      lon: -81.7635, 
      fuelType: 'premium', 
      price: '3.45', 
      rating: 4.1, 
      distance: 16.5 
    },
    { 
      id: 11, 
      zip: '32207',
      name: 'RaceTrac Atlantic', 
      brand: 'RaceTrac', 
      address: '4544 Atlantic Blvd, Jacksonville, FL 32207', 
      lat: 30.3207, 
      lon: -81.6400, 
      fuelType: 'diesel', 
      price: '3.399', 
      rating: 4.0, 
      distance: 7.9 
    },
    { 
      id: 12, 
      zip: '32219',
      name: 'RaceTrac New Kings', 
      brand: 'RaceTrac', 
      address: '9980 New Kings Hwy, Jacksonville, FL 32219', 
      lat: 30.3700, 
      lon: -81.7800, 
      fuelType: 'regular', 
      price: '3.199', 
      rating: 3.9, 
      distance: 14.3 
    },
    // Add more from web search
    { 
      id: 13, 
      zip: '32246',
      name: 'RaceTrac Deerwood', 
      brand: 'RaceTrac', 
      address: '5004 Gate Pkwy, Jacksonville, FL 32246', 
      lat: 30.2500, 
      lon: -81.5100, 
      fuelType: 'all', 
      price: '3.199', 
      rating: 4.2, 
      distance: 15.0 
    },
    { 
      id: 14, 
      zip: '32256',
      name: 'RaceTrac Baymeadows', 
      brand: 'RaceTrac', 
      address: '8715 Baymeadows Rd, Jacksonville, FL 32256', 
      lat: 30.2100, 
      lon: -81.5700, 
      fuelType: 'regular', 
      price: '3.199', 
      rating: 4.1, 
      distance: 13.5 
    }
  ];

  let stations = fallbackStations
    .filter(station => station.zip === zip)  // Strict ZIP filter
    .map(station => ({
      ...station,
      // Calculate distance for each station from ZIP center
      distance: Math.round(calculateDistance(lat, lon, station.lat, station.lon) * 0.621371 * 10) / 10 // miles, 1 decimal
    }));

  // Filter by fuel type if specified (all stations have types, so show all if 'all')
  if (fuel !== 'all') {
    stations = stations.filter(station => 
      station.fuelType.toLowerCase() === fuel.toLowerCase() || station.fuelType === 'all'
    );
  }

  // Sort by distance ascending (closest first)
  stations.sort((a, b) => a.distance - b.distance);

  if (stations.length === 0) {
    return NextResponse.json({ 
      stations: [], 
      location: { zip, lat, lon },
      message: `No gas stations found exactly in ZIP ${zip}. Try a nearby ZIP or check the database.`
    });
  }

  return NextResponse.json({ 
    stations, 
    location: { zip, lat, lon },
    message: `Showing all ${stations.length} stations in/near ZIP ${zip} sorted by distance`
  });
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