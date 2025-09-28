import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { weatherSettings } from '@/db/schema';

export async function GET(request: NextRequest) {
  try {
    const settings = await db.select()
      .from(weatherSettings)
      .limit(1);

    if (settings.length === 0) {
      return NextResponse.json(null, { status: 200 });
    }

    return NextResponse.json(settings[0], { status: 200 });
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
    const { provider, apiKey, latitude, longitude, units, city, country, zip } = requestBody;

    // Validation: Required fields
    if (!provider || typeof provider !== 'string' || provider.trim() === '') {
      return NextResponse.json({ 
        error: "Provider is required and must be a non-empty string",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!units || typeof units !== 'string' || units.trim() === '') {
      return NextResponse.json({ 
        error: "Units is required and must be a non-empty string",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Validation: Latitude range
    if (latitude !== undefined && latitude !== null) {
      const lat = parseFloat(latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        return NextResponse.json({ 
          error: "Latitude must be a valid number between -90 and 90",
          code: "INVALID_LATITUDE" 
        }, { status: 400 });
      }
    }

    // Validation: Longitude range
    if (longitude !== undefined && longitude !== null) {
      const lng = parseFloat(longitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        return NextResponse.json({ 
          error: "Longitude must be a valid number between -180 and 180",
          code: "INVALID_LONGITUDE" 
        }, { status: 400 });
      }
    }

    // Prepare validated data
    const validatedData = {
      provider: provider.trim(),
      apiKey: apiKey || null,
      latitude: latitude !== undefined && latitude !== null ? parseFloat(latitude) : null,
      longitude: longitude !== undefined && longitude !== null ? parseFloat(longitude) : null,
      units: units.trim(),
      city: city?.trim() || null,
      country: country?.trim() || null,
      zip: zip?.trim() || null,
      updatedAt: new Date().toISOString()
    };

    // Check if settings already exist
    const existingSettings = await db.select()
      .from(weatherSettings)
      .limit(1);

    if (existingSettings.length > 0) {
      // Update existing record
      const updated = await db.update(weatherSettings)
        .set(validatedData)
        .returning();

      return NextResponse.json(updated[0], { status: 200 });
    } else {
      // Insert new record
      const inserted = await db.insert(weatherSettings)
        .values(validatedData)
        .returning();

      return NextResponse.json(inserted[0], { status: 200 });
    }
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}