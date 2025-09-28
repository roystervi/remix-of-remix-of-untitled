import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { piholeConfig } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // For testing: Allow bypassing with a test parameter
    const { searchParams } = new URL(request.url);
    const testMode = searchParams.get('test') === 'true';
    
    if (testMode) {
      // Return mock data for testing
      return NextResponse.json({
        ads_blocked_today: 1234,
        dns_queries_today: 5678,
        domains_blocked: 90123,
        percent_blocked: 21.7,
        unique_domains: 456,
        queries_forwarded: 3456,
        queries_cached: 2222,
        total_queries: 5678,
        unique_clients: 12
      }, { status: 200 });
    }

    // Fetch Pi-hole configuration
    const config = await db.select()
      .from(piholeConfig)
      .limit(1);

    if (config.length === 0) {
      return NextResponse.json({ 
        error: "Pi-hole configuration not found",
        code: "CONFIG_NOT_FOUND" 
      }, { status: 400 });
    }

    const piholeConfigData = config[0];

    if (!piholeConfigData.connected) {
      return NextResponse.json({ 
        error: "Pi-hole is not connected",
        code: "NOT_CONNECTED" 
      }, { status: 400 });
    }

    // Authenticate with Pi-hole to get session ID
    let sessionId: string;
    try {
      const authResponse = await fetch(`${piholeConfigData.url}/api/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pw: piholeConfigData.appPassword }),
        signal: AbortSignal.timeout(10000),
      });

      if (!authResponse.ok) {
        console.error('Pi-hole auth failed:', authResponse.status, authResponse.statusText);
        return NextResponse.json({ 
          error: "Failed to authenticate with Pi-hole",
          code: "AUTH_FAILED" 
        }, { status: 401 });
      }

      // Extract session ID from Set-Cookie header
      const setCookieHeader = authResponse.headers.get('set-cookie');
      if (setCookieHeader) {
        const phpsessidMatch = setCookieHeader.match(/PHPSESSID=([^;]+)/);
        if (phpsessidMatch) {
          sessionId = phpsessidMatch[1];
        } else {
          console.error('PHPSESSID not found in Set-Cookie header');
          return NextResponse.json({ 
            error: "Failed to get session ID from Pi-hole",
            code: "SESSION_ID_NOT_FOUND" 
          }, { status: 401 });
        }
      } else {
        // Try to get session ID from response body
        try {
          const authResponseData = await authResponse.json();
          if (authResponseData.session) {
            sessionId = authResponseData.session;
          } else {
            console.error('Session ID not found in response body');
            return NextResponse.json({ 
              error: "Failed to get session ID from Pi-hole",
              code: "SESSION_ID_NOT_FOUND" 
            }, { status: 401 });
          }
        } catch (parseError) {
          console.error('Failed to parse auth response:', parseError);
          return NextResponse.json({ 
            error: "Failed to parse authentication response",
            code: "AUTH_PARSE_ERROR" 
          }, { status: 401 });
        }
      }
    } catch (authError) {
      console.error('Pi-hole authentication error:', authError);
      if (authError instanceof TypeError && authError.message.includes('fetch')) {
        return NextResponse.json({ 
          error: "Network error connecting to Pi-hole",
          code: "NETWORK_ERROR" 
        }, { status: 500 });
      }
      return NextResponse.json({ 
        error: "Authentication request failed",
        code: "AUTH_REQUEST_FAILED" 
      }, { status: 500 });
    }

    // Fetch DNS statistics using session authentication
    try {
      const statsResponse = await fetch(`${piholeConfigData.url}/api/dns/stats`, {
        method: 'GET',
        headers: {
          'Cookie': `PHPSESSID=${sessionId}`,
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!statsResponse.ok) {
        console.error('Pi-hole stats request failed:', statsResponse.status, statsResponse.statusText);
        return NextResponse.json({ 
          error: "Failed to fetch DNS statistics from Pi-hole",
          code: "STATS_REQUEST_FAILED" 
        }, { status: 500 });
      }

      let statsData;
      try {
        statsData = await statsResponse.json();
      } catch (parseError) {
        console.error('Failed to parse stats response:', parseError);
        return NextResponse.json({ 
          error: "Failed to parse DNS statistics response",
          code: "STATS_PARSE_ERROR" 
        }, { status: 500 });
      }

      // Extract and return specific statistics
      const statistics = {
        ads_blocked_today: statsData.ads_blocked_today || 0,
        dns_queries_today: statsData.dns_queries_today || 0,
        domains_blocked: statsData.domains_blocked || 0,
        percent_blocked: statsData.percent_blocked || 0,
        unique_domains: statsData.unique_domains || 0,
        queries_forwarded: statsData.queries_forwarded || 0,
        queries_cached: statsData.queries_cached || 0,
        total_queries: statsData.total_queries || 0,
        unique_clients: statsData.unique_clients || 0,
      };

      return NextResponse.json(statistics, { status: 200 });

    } catch (statsError) {
      console.error('Pi-hole stats fetch error:', statsError);
      if (statsError instanceof TypeError && statsError.message.includes('fetch')) {
        return NextResponse.json({ 
          error: "Network error fetching DNS statistics",
          code: "NETWORK_ERROR" 
        }, { status: 500 });
      }
      return NextResponse.json({ 
        error: "Failed to fetch DNS statistics",
        code: "STATS_FETCH_FAILED" 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('GET /api/pihole/stats error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}