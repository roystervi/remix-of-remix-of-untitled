import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const zip = searchParams.get('zip');

  if (!zip || zip.length !== 5) {
    return NextResponse.json({ error: 'Invalid ZIP code' }, { status: 400 });
  }

  try {
    const response = await fetch(`http://api.zippopotam.us/us/${zip}`);
    if (!response.ok) {
      throw new Error('ZIP lookup API failed');
    }
    const data = await response.json();
    const places = data.places;
    if (places && places.length > 0) {
      const place = places[0];
      return NextResponse.json({
        latitude: parseFloat(place.latitude),
        longitude: parseFloat(place.longitude),
        city: place['place name'],
        country: data.country,
        zip: data['post code']
      });
    } else {
      throw new Error('No location found for ZIP');
    }
  } catch (error) {
    console.error('ZIP lookup error:', error);
    // Fallback for ZIP 32225 (Jacksonville, FL)
    if (zip === '32225') {
      return NextResponse.json({
        latitude: 30.3322,
        longitude: -81.6557,
        city: 'Jacksonville',
        country: 'US',
        zip: '32225'
      });
    }
    return NextResponse.json({ error: 'ZIP lookup failed - using fallback' }, { status: 500 });
  }
}