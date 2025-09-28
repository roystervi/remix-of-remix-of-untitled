import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { piholeConfig } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const config = await db.select({
      id: piholeConfig.id,
      url: piholeConfig.url,
      connected: piholeConfig.connected,
      lastChecked: piholeConfig.lastChecked,
      createdAt: piholeConfig.createdAt,
      updatedAt: piholeConfig.updatedAt
    })
    .from(piholeConfig)
    .limit(1);

    if (config.length === 0) {
      return NextResponse.json(null);
    }

    return NextResponse.json(config[0]);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url, appPassword } = await request.json();

    // Validate required fields
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return NextResponse.json({ 
        error: 'URL is required and must be a non-empty string',
        code: 'MISSING_URL' 
      }, { status: 400 });
    }

    if (!appPassword || typeof appPassword !== 'string' || appPassword.trim() === '') {
      return NextResponse.json({ 
        error: 'App password is required and must be a non-empty string',
        code: 'MISSING_APP_PASSWORD' 
      }, { status: 400 });
    }

    // Sanitize URL
    const sanitizedUrl = url.trim();

    // Validate URL format
    try {
      new URL(sanitizedUrl);
    } catch {
      return NextResponse.json({ 
        error: 'Invalid URL format',
        code: 'INVALID_URL_FORMAT' 
      }, { status: 400 });
    }

    // Test connection
    const { connected, error: connectionError } = await testPiHoleConnection(sanitizedUrl, appPassword);

    const now = new Date().toISOString();
    
    // Check if config exists
    const existingConfig = await db.select()
      .from(piholeConfig)
      .limit(1);

    let result;
    
    if (existingConfig.length > 0) {
      // Update existing config
      result = await db.update(piholeConfig)
        .set({
          url: sanitizedUrl,
          appPassword: appPassword.trim(),
          connected,
          lastChecked: now,
          updatedAt: now
        })
        .returning({
          id: piholeConfig.id,
          url: piholeConfig.url,
          connected: piholeConfig.connected,
          lastChecked: piholeConfig.lastChecked,
          createdAt: piholeConfig.createdAt,
          updatedAt: piholeConfig.updatedAt
        });
    } else {
      // Create new config
      result = await db.insert(piholeConfig)
        .values({
          url: sanitizedUrl,
          appPassword: appPassword.trim(),
          connected,
          lastChecked: now,
          createdAt: now,
          updatedAt: now
        })
        .returning({
          id: piholeConfig.id,
          url: piholeConfig.url,
          connected: piholeConfig.connected,
          lastChecked: piholeConfig.lastChecked,
          createdAt: piholeConfig.createdAt,
          updatedAt: piholeConfig.updatedAt
        });
    }

    const response = {
      ...result[0],
      connectionError: connectionError || undefined
    };

    return NextResponse.json(response, { status: existingConfig.length > 0 ? 200 : 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const existingConfig = await db.select()
      .from(piholeConfig)
      .limit(1);

    if (existingConfig.length === 0) {
      return NextResponse.json({ 
        error: 'No PiHole configuration found to delete',
        code: 'CONFIG_NOT_FOUND' 
      }, { status: 404 });
    }

    const deleted = await db.delete(piholeConfig)
      .returning({
        id: piholeConfig.id,
        url: piholeConfig.url,
        connected: piholeConfig.connected,
        lastChecked: piholeConfig.lastChecked,
        createdAt: piholeConfig.createdAt,
        updatedAt: piholeConfig.updatedAt
      });

    return NextResponse.json({
      message: 'PiHole configuration deleted successfully',
      deleted: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

async function testPiHoleConnection(url: string, appPassword: string): Promise<{ connected: boolean; error?: string }> {
  try {
    // Step 1: Authenticate to get SID
    const authResponse = await fetch(`${url}/api/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pw: appPassword }),
      signal: AbortSignal.timeout(10000)
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text().catch(() => 'Unknown error');
      return { connected: false, error: `Authentication failed: ${authResponse.status} ${errorText}` };
    }

    let authData;
    try {
      authData = await authResponse.json();
    } catch {
      return { connected: false, error: 'Invalid authentication response format' };
    }

    // Extract SID from Set-Cookie header
    const setCookieHeader = authResponse.headers.get('set-cookie');
    let sid = null;
    
    if (setCookieHeader) {
      const sidMatch = setCookieHeader.match(/PHPSESSID=([^;]+)/);
      if (sidMatch) {
        sid = sidMatch[1];
      }
    }

    if (!sid && authData.session) {
      sid = authData.session;
    }

    if (!sid) {
      return { connected: false, error: 'No session ID received from authentication' };
    }

    // Step 2: Test access to dns/stats endpoint
    const statsResponse = await fetch(`${url}/api/dns/stats`, {
      method: 'GET',
      headers: {
        'Cookie': `PHPSESSID=${sid}`,
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!statsResponse.ok) {
      const errorText = await statsResponse.text().catch(() => 'Unknown error');
      return { connected: false, error: `Stats endpoint failed: ${statsResponse.status} ${errorText}` };
    }

    let statsData;
    try {
      statsData = await statsResponse.json();
    } catch {
      return { connected: false, error: 'Invalid stats response format' };
    }

    // Validate that we got expected data structure
    if (!statsData || typeof statsData !== 'object') {
      return { connected: false, error: 'Unexpected stats data structure' };
    }

    return { connected: true };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return { connected: false, error: 'Connection timeout (10 seconds)' };
      }
      if (error.message.includes('fetch')) {
        return { connected: false, error: 'Network error: Unable to connect to PiHole' };
      }
      return { connected: false, error: error.message };
    }
    return { connected: false, error: 'Unknown connection error' };
  }
}