import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { mcpSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { entity, action } = await request.json();

    if (!entity || !action) {
      return NextResponse.json({ error: 'Missing entity or action' }, { status: 400 });
    }

    // Fetch MCP settings
    const mcpData = await db.select().from(mcpSettings).limit(1);
    if (mcpData.length === 0 || !mcpData[0].connected) {
      return NextResponse.json({ error: 'MCP not connected' }, { status: 400 });
    }

    const { url, token } = mcpData[0];

    // Parse entity domain and id (e.g., light.den_light -> domain: 'light', id: 'den_light')
    const [domain, ...entityIdParts] = entity.split('.');
    const entityId = entityIdParts.join('.');
    const service = `turn_${action.replace(' ', '_')}`;

    if (!domain || !entityId) {
      return NextResponse.json({ error: 'Invalid entity format' }, { status: 400 });
    }

    // Call HA API
    const haResponse = await fetch(`${url}/api/services/${domain}/${service}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ entity_id: entityId }),
    });

    if (!haResponse.ok) {
      const errorText = await haResponse.text();
      return NextResponse.json({ error: `HA API failed: ${errorText}` }, { status: haResponse.status });
    }

    return NextResponse.json({ success: true, message: `Executed ${service} for ${entityId}` });
  } catch (error) {
    console.error('HA control error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}