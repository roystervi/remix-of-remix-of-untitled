import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const zip = searchParams.get('zip');

  if (!zip || zip.length !== 5 || !/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: 'Invalid ZIP code (must be 5 digits)' }, { status: 400 });
  }

  try {
    // Step 1: Get lat/long from ZIP
    const zipResponse = await fetch(`http://localhost:3000/api/zip-lookup?zip=${zip}`);
    if (!zipResponse.ok) {
      throw new Error('ZIP lookup failed');
    }
    const zipData = await zipResponse.json();
    if (zipData.error) {
      throw new Error(zipData.error);
    }
    const { latitude: lat, longitude: lon } = zipData;

    // Step 2: Query Overpass API for gas stations within 10km
    const overpassQuery = `[out:json][timeout:25];
    (
      node["amenity"="fuel"](around:10000,${lat},${lon});
    );
    out body;`;

    const overpassResponse = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ data: overpassQuery }),
    });

    if (!overpassResponse.ok) {
      throw new Error('Overpass API request failed');
    }

    const overpassData = await overpassResponse.json();
    const stations = overpassData.elements
      ?.filter((el: any) => el.type === 'node')
      .map((el: any) => ({
        id: el.id,
        name: el.tags?.name || 'Unknown Station',
        brand: el.tags?.brand || null,
        lat: el.lat,
        lon: el.lon,
        address: el.tags?.addr?.street || el.tags?.addr?.city || 'No address',
      })) || [];

    if (stations.length === 0) {
      return NextResponse.json({ stations: [], message: 'No gas stations found nearby' });
    }

    return NextResponse.json({ stations, location: { lat, lon, zip } });
  } catch (error) {
    console.error('Gas stations API error:', error);
    return NextResponse.json({ error: 'Failed to fetch gas stations', stations: [] }, { status: 500 });
  }
}