import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { provider, apiKey, lat, lon, units } = await request.json();

    if (!apiKey || !lat || !lon) {
      return NextResponse.json({ error: 'Missing required parameters: apiKey, lat, lon' }, { status: 400 });
    }

    if (provider !== 'openweathermap') {
      return NextResponse.json({ error: 'Only OpenWeatherMap is supported for testing at this time' }, { status: 400 });
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`;

    const res = await fetch(url);

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json({ error: `Weather API error: ${res.status} - ${errorText}` }, { status: res.status });
    }

    const data = await res.json();

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Test weather error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}