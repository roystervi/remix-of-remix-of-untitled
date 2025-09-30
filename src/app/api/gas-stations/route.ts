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
  const radius = searchParams.get('radius') || '50'; // Default to 50 miles

  // First, geocode ZIP to lat/lon (using free Nominatim or integrate Google if key available)
  let lat = 30.3322; // Default Jacksonville coords
  let lon = -81.6557;
  try {
    const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${zip}+FL&limit=1`);
    const geoData = await geoRes.json();
    if (geoData[0]) {
      lat = parseFloat(geoData[0].lat);
      lon = parseFloat(geoData[0].lon);
    }
  } catch (error) {
    console.error('Geocoding failed:', error);
  }

  // Call Apify GasBuddy Scraper via proxy endpoint (assumes RAPIDAPI_KEY in env)
  const apifyInput = {
    search: `${lat},${lon} within ${radius} miles`,
    fuelType: fuel === 'all' ? 'regular' : fuel, // Default to regular for all, filter client-side
    maxCrawledPlacesPerSearch: 20
  };

  try {
    const res = await fetch('https://rapidapi.com/stanvanrooy6/api/gasbuddy-scraper', {
      method: 'POST',
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
        'X-RapidAPI-Host': 'gasbuddy-scraper.p.rapidapi.com',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apifyInput)
    });

    if (!res.ok) throw new Error('API fetch failed');

    let stations = await res.json();

    // Normalize data with prices, addresses, and fuel types
    stations = stations.map((station: any) => ({
      name: station.name || 'Unknown Station',
      address: station.address || `${station.city}, ${station.state}`,
      price: station.price_cents_per_gallon ? (station.price_cents_per_gallon / 100).toFixed(2) : 'N/A',
      fuelType: station.fuel_type || fuel,
      rating: station.rating_out_of_five || 0,
      distance: station.distance_miles || 0 // Approximate based on search
    }));

    // Filter if specific fuel requested
    if (fuel !== 'all') {
      stations = stations.filter((s: any) => s.fuelType.toLowerCase().includes(fuel.toLowerCase()));
    }

    // Sort by price ascending
    stations.sort((a: any, b: any) => parseFloat(a.price) - parseFloat(b.price));

    return NextResponse.json({ stations, location: { zip, lat, lon, radius } });
  } catch (error) {
    console.error('Gas stations fetch error:', error);
    // Fallback to seeded/mock data with prices
    const fallbackStations = [
      { 
        id: 1, 
        name: 'Costco Jacksonville', 
        brand: 'Costco', 
        address: '8000 Parramore Rd, Jacksonville, FL 32256', 
        lat: 30.2425, 
        lon: -81.5867, 
        fuelType: 'regular', 
        price: '2.92', 
        rating: 4.5, 
        distance: 12.5 
      },
      { 
        id: 2, 
        name: "Sam's Club Jacksonville", 
        brand: "Sam's Club", 
        address: '6373 Youngerman Cir, Jacksonville, FL 32244', 
        lat: 30.2649, 
        lon: -81.7635, 
        fuelType: 'regular', 
        price: '2.92', 
        rating: 4.2, 
        distance: 10.2 
      },
      { 
        id: 3, 
        name: 'Shell - Beach Blvd', 
        brand: 'Shell', 
        address: '1234 Beach Blvd, Jacksonville, FL 32250', 
        lat: 30.2895, 
        lon: -81.4758, 
        fuelType: 'premium', 
        price: '3.29', 
        rating: 3.8, 
        distance: 8.1 
      },
      { 
        id: 4, 
        name: 'Sunoco - Arlington Expy', 
        brand: 'Sunoco', 
        address: '7961 Arlington Expy, Jacksonville, FL 32211', 
        lat: 30.3281, 
        lon: -81.5733, 
        fuelType: 'diesel', 
        price: '3.15', 
        rating: 4.0, 
        distance: 15.3 
      },
      { 
        id: 5, 
        name: "BJ's Wholesale - City Center", 
        brand: "BJ's", 
        address: '12884 City Center Blvd, Jacksonville, FL 32224', 
        lat: 30.2249, 
        lon: -81.4803, 
        fuelType: 'premium', 
        price: '3.25', 
        rating: 4.8, 
        distance: 5.7 
      },
      { 
        id: 6, 
        name: 'Exxon - Southside Blvd', 
        brand: 'Exxon', 
        address: '4023 Southside Blvd, Jacksonville, FL 32216', 
        lat: 30.2745, 
        lon: -81.5585, 
        fuelType: 'regular', 
        price: '2.95', 
        rating: 3.9, 
        distance: 18.4 
      },
      { 
        id: 7, 
        name: 'Chevron - San Jose Blvd', 
        brand: 'Chevron', 
        address: '10550 San Jose Blvd, Jacksonville, FL 32257', 
        lat: 30.1860, 
        lon: -81.6287, 
        fuelType: 'premium', 
        price: '3.35', 
        rating: 4.1, 
        distance: 20.1 
      },
      { 
        id: 8, 
        name: 'Mobil - Lane Ave', 
        brand: 'Mobil', 
        address: '1879 S Lane Ave, Jacksonville, FL 32210', 
        lat: 30.2855, 
        lon: -81.7553, 
        fuelType: 'diesel', 
        price: '3.20', 
        rating: 3.7, 
        distance: 11.8 
      },
      { 
        id: 9, 
        name: 'BP - Rayford St', 
        brand: 'BP', 
        address: '2990 Rayford St, Jacksonville, FL 32205', 
        lat: 30.3207, 
        lon: -81.7053, 
        fuelType: 'regular', 
        price: '2.89', 
        rating: 4.0, 
        distance: 14.2 
      },
      { 
        id: 10, 
        name: 'Shell - McDuff Ave', 
        brand: 'Shell', 
        address: '1060 McDuff Ave S, Jacksonville, FL 32205', 
        lat: 30.3110, 
        lon: -81.7057, 
        fuelType: 'premium', 
        price: '3.30', 
        rating: 3.9, 
        distance: 13.5 
      },
      { 
        id: 11, 
        name: 'Phillips 66 - Collins Road', 
        brand: 'Phillips 66', 
        address: '6655 Collins Road, Jacksonville, FL 32244', 
        lat: 30.2370, 
        lon: -81.7700, 
        fuelType: 'diesel', 
        price: '3.18', 
        rating: 4.3, 
        distance: 9.5 
      },
      { 
        id: 12, 
        name: 'Wawa - Atlantic Blvd', 
        brand: 'Wawa', 
        address: '12345 Atlantic Blvd, Jacksonville, FL 32225', 
        lat: 30.3680, 
        lon: -81.4650, 
        fuelType: 'regular', 
        price: '2.94', 
        rating: 4.4, 
        distance: 7.8 
      }
    ];

    let filteredStations = fallbackStations;

    // Filter by radius (convert km to miles approx, but use miles directly)
    const radiusMiles = parseFloat(radius);
    filteredStations = filteredStations.filter(station => station.distance <= radiusMiles);

    // Filter by fuel if not 'all'
    if (fuel !== 'all') {
      filteredStations = filteredStations.filter(station => 
        station.fuelType.toLowerCase() === fuel.toLowerCase()
      );
    }

    // Sort by price ascending (skip N/A or sort numerically)
    filteredStations.sort((a, b) => {
      const priceA = a.price === 'N/A' ? Infinity : parseFloat(a.price);
      const priceB = b.price === 'N/A' ? Infinity : parseFloat(b.price);
      return priceA - priceB;
    });

    return NextResponse.json({ 
      stations: filteredStations, 
      location: { zip, lat, lon, radius: parseFloat(radius) },
      error: 'Using enhanced fallback data for demo (real API integration recommended)'
    });
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