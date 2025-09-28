import { NextResponse } from 'next/server';
import { db } from '@/db';
import { weatherSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const settings = await db.select()
      .from(weatherSettings)
      .limit(1);

    if (settings.length === 0 || !settings[0].apiKey || !settings[0].latitude || !settings[0].longitude) {
      return NextResponse.json({ 
        error: 'Weather settings not fully configured. Please set API key and location in settings.' 
      }, { status: 400 });
    }

    const { provider, apiKey, latitude, longitude, units } = settings[0];

    let weatherData;
    if (provider === 'openweathermap') {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${units}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`OpenWeatherMap API error: ${response.statusText}`);
      }
      weatherData = await response.json();
    } else {
      // Add support for other providers in future
      return NextResponse.json({ 
        error: `Unsupported provider: ${provider}. Only OpenWeatherMap is supported currently.` 
      }, { status: 400 });
    }

    // Transform data to consistent format
    // Adjust units for non-temperature fields if needed (OpenWeatherMap handles units param for most)
    const transformedData = {
      temperature: Math.round(weatherData.main.temp),
      condition: weatherData.weather[0].description,
      humidity: weatherData.main.humidity,
      windSpeed: units === 'imperial' ? Math.round(weatherData.wind.speed) : Math.round(weatherData.wind.speed * 3.6), // mph or km/h
      visibility: units === 'imperial' ? Math.round(weatherData.visibility / 1609.34) : Math.round(weatherData.visibility / 1000), // miles or km
      pressure: units === 'imperial' ? (weatherData.main.pressure / 33.8639).toFixed(2) : (weatherData.main.pressure / 100).toFixed(1), // inHg or hPa
      city: weatherData.name,
      country: weatherData.sys.country
    };

    return NextResponse.json(transformedData, { status: 200 });
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch weather data: ' + error.message 
    }, { status: 500 });
  }
}