import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { mcpSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { entity, action, value, media } = body;

    // Fetch MCP settings from DB
    const mcpRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/mcp-settings`);
    if (!mcpRes.ok) {
      return Response.json({ error: 'MCP not configured' }, { status: 500 });
    }
    const settings = await mcpRes.json() as { url: string; token: string; connected: boolean; exposedEntities: string[] };

    if (!settings.connected || !entity || !settings.exposedEntities.includes(entity)) {
      return Response.json({ error: 'Invalid entity or MCP not connected' }, { status: 400 });
    }

    // Proxy to HA based on action
    let haUrl = `${settings.url}/api/services`;
    let haPayload: any = {};

    if (action === 'turn_on' || action === 'turn_off') {
      // Light/switch/scene
      const domain = entity.split('.')[0]; // e.g., 'light', 'switch', 'scene'
      haUrl += `/${domain}/${action}`;
      haPayload = { entity_id: entity };
    } else if (action === 'set_temperature') {
      // Climate
      haUrl += '/climate/set_temperature';
      haPayload = { entity_id: entity, temperature: value };
    } else if (action === 'media_play' || action === 'media_pause' || action === 'media_stop') {
      // Media player
      const service = action.replace('media_', '');
      haUrl += '/media_player/' + service;
      haPayload = { entity_id: entity };
      if (media && action === 'media_play') {
        haPayload.media_content_id = media;
        haPayload.media_content_type = 'music'; // Default; extend if needed
      }
    } else if (action === 'get_state') {
      // Fetch sensor state
      haUrl = `${settings.url}/api/states/${entity}`;
      const stateRes = await fetch(haUrl, {
        headers: { Authorization: `Bearer ${settings.token}` }
      });
      if (stateRes.ok) {
        const stateData = await stateRes.json();
        return Response.json({ state: stateData.state, attributes: stateData.attributes });
      } else {
        return Response.json({ error: 'Failed to fetch state' }, { status: 500 });
      }
    } else {
      return Response.json({ error: 'Unknown action' }, { status: 400 });
    }

    const haRes = await fetch(haUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(haPayload),
    });

    if (haRes.ok) {
      return Response.json({ success: true });
    } else {
      const errText = await haRes.text();
      return Response.json({ error: `HA API failed: ${errText}` }, { status: 500 });
    }
  } catch (error) {
    console.error('HA control error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}