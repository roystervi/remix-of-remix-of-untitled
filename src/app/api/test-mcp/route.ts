import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { mcpConfig } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface HAConfig {
  location_name: string;
  version: string;
  config_dir: string;
}

interface HAEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed: string;
  last_updated: string;
}

interface HAResponse {
  success: boolean;
  entities?: HAEntity[];
  error?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get saved MCP settings from database
    const savedSettings = await db.select()
      .from(mcpConfig)
      .limit(1);

    if (savedSettings.length === 0 || !savedSettings[0].url || !savedSettings[0].token) {
      return NextResponse.json({
        success: false,
        error: "No MCP settings configured. Please set URL and token first.",
        code: "NO_SETTINGS_CONFIGURED"
      }, { status: 400 });
    }

    const { url, token } = savedSettings[0];
    
    // Remove trailing slash for consistency
    const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;

    // Configure request headers
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    try {
      // Test connection to Home Assistant config endpoint
      const configResponse = await fetch(`${baseUrl}/api/config`, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!configResponse.ok) {
        if (configResponse.status === 401) {
          return NextResponse.json({
            success: false,
            error: "Authentication failed - invalid token",
            code: "AUTH_FAILED"
          }, { status: 400 });
        }

        if (configResponse.status === 403) {
          return NextResponse.json({
            success: false,
            error: "Access forbidden - insufficient permissions",
            code: "ACCESS_FORBIDDEN"
          }, { status: 400 });
        }

        if (configResponse.status === 404) {
          return NextResponse.json({
            success: false,
            error: "Home Assistant API not found - check URL",
            code: "API_NOT_FOUND"
          }, { status: 400 });
        }

        return NextResponse.json({
          success: false,
          error: `Home Assistant API error: ${configResponse.status}`,
          code: "API_ERROR"
        }, { status: 400 });
      }

      // Validate config response
      let config: HAConfig;
      try {
        config = await configResponse.json();
        if (!config || typeof config !== 'object' || !config.version) {
          throw new Error('Invalid config response format');
        }
      } catch (parseError) {
        return NextResponse.json({
          success: false,
          error: "Invalid response format from Home Assistant config endpoint",
          code: "INVALID_CONFIG_RESPONSE"
        }, { status: 400 });
      }

      // Fetch entities from states endpoint
      const statesController = new AbortController();
      const statesTimeoutId = setTimeout(() => statesController.abort(), 5000);

      try {
        const statesResponse = await fetch(`${baseUrl}/api/states`, {
          method: 'GET',
          headers,
          signal: statesController.signal,
        });

        clearTimeout(statesTimeoutId);

        if (!statesResponse.ok) {
          return NextResponse.json({
            success: false,
            error: `Failed to fetch entities: ${statesResponse.status}`,
            code: "STATES_FETCH_ERROR"
          }, { status: 400 });
        }

        // Validate states response
        let entities: HAEntity[];
        try {
          entities = await statesResponse.json();
          if (!Array.isArray(entities)) {
            throw new Error('States response is not an array');
          }

          // Validate entity structure
          for (const entity of entities) {
            if (!entity || typeof entity !== 'object' || !entity.entity_id || typeof entity.state === 'undefined') {
              throw new Error('Invalid entity format');
            }
          }
        } catch (parseError) {
          return NextResponse.json({
            success: false,
            error: "Invalid response format from Home Assistant states endpoint",
            code: "INVALID_STATES_RESPONSE"
          }, { status: 400 });
        }

        // Update the saved settings with connected status and entities
        await db.update(mcpConfig)
          .set({
            connected: true,
            entities: JSON.stringify(entities),
            updatedAt: new Date().toISOString()
          })
          .where(eq(mcpConfig.id, savedSettings[0].id));

        // Success response with entities
        return NextResponse.json({
          success: true,
          entities: entities.map(entity => ({
            entity_id: entity.entity_id,
            state: entity.state,
            attributes: entity.attributes || {},
            last_changed: entity.last_changed,
            last_updated: entity.last_updated
          }))
        }, { status: 200 });

      } catch (statesError) {
        clearTimeout(statesTimeoutId);
        
        if (statesError instanceof Error && statesError.name === 'AbortError') {
          return NextResponse.json({
            success: false,
            error: "Request timeout while fetching entities",
            code: "STATES_TIMEOUT"
          }, { status: 400 });
        }

        return NextResponse.json({
          success: false,
          error: "Network error while fetching entities",
          code: "STATES_NETWORK_ERROR"
        }, { status: 400 });
      }

    } catch (configError) {
      clearTimeout(timeoutId);
      
      if (configError instanceof Error && configError.name === 'AbortError') {
        return NextResponse.json({
          success: false,
          error: "Request timeout while connecting to Home Assistant",
          code: "CONNECTION_TIMEOUT"
        }, { status: 400 });
      }

      if (configError instanceof TypeError && configError.message.includes('fetch')) {
        return NextResponse.json({
          success: false,
          error: "Network error - unable to connect to Home Assistant",
          code: "NETWORK_ERROR"
        }, { status: 400 });
      }

      return NextResponse.json({
        success: false,
        error: "Connection failed - check URL and network connectivity",
        code: "CONNECTION_FAILED"
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Home Assistant test connection error:', error);
    
    return NextResponse.json({
      success: false,
      error: "Internal server error occurred while testing connection"
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { url, token } = body;

    // Validate required fields
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return NextResponse.json({
        success: false,
        error: "URL is required and must be a non-empty string",
        code: "MISSING_URL"
      }, { status: 400 });
    }

    if (!token || typeof token !== 'string' || token.trim() === '') {
      return NextResponse.json({
        success: false,
        error: "Token is required and must be a non-empty string",
        code: "MISSING_TOKEN"
      }, { status: 400 });
    }

    // Validate URL format
    const trimmedUrl = url.trim();
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      return NextResponse.json({
        success: false,
        error: "URL must start with http:// or https://",
        code: "INVALID_URL_FORMAT"
      }, { status: 400 });
    }

    // Remove trailing slash for consistency
    const baseUrl = trimmedUrl.endsWith('/') ? trimmedUrl.slice(0, -1) : trimmedUrl;
    const trimmedToken = token.trim();

    // Configure request headers (never log the token)
    const headers = {
      'Authorization': `Bearer ${trimmedToken}`,
      'Content-Type': 'application/json',
    };

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    try {
      // Test connection to Home Assistant config endpoint
      const configResponse = await fetch(`${baseUrl}/api/config`, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!configResponse.ok) {
        if (configResponse.status === 401) {
          return NextResponse.json({
            success: false,
            error: "Authentication failed - invalid token",
            code: "AUTH_FAILED"
          }, { status: 400 });
        }

        if (configResponse.status === 403) {
          return NextResponse.json({
            success: false,
            error: "Access forbidden - insufficient permissions",
            code: "ACCESS_FORBIDDEN"
          }, { status: 400 });
        }

        if (configResponse.status === 404) {
          return NextResponse.json({
            success: false,
            error: "Home Assistant API not found - check URL",
            code: "API_NOT_FOUND"
          }, { status: 400 });
        }

        return NextResponse.json({
          success: false,
          error: `Home Assistant API error: ${configResponse.status}`,
          code: "API_ERROR"
        }, { status: 400 });
      }

      // Validate config response
      let config: HAConfig;
      try {
        config = await configResponse.json();
        if (!config || typeof config !== 'object' || !config.version) {
          throw new Error('Invalid config response format');
        }
      } catch (parseError) {
        return NextResponse.json({
          success: false,
          error: "Invalid response format from Home Assistant config endpoint",
          code: "INVALID_CONFIG_RESPONSE"
        }, { status: 400 });
      }

      // Fetch entities from states endpoint
      const statesController = new AbortController();
      const statesTimeoutId = setTimeout(() => statesController.abort(), 5000);

      try {
        const statesResponse = await fetch(`${baseUrl}/api/states`, {
          method: 'GET',
          headers,
          signal: statesController.signal,
        });

        clearTimeout(statesTimeoutId);

        if (!statesResponse.ok) {
          return NextResponse.json({
            success: false,
            error: `Failed to fetch entities: ${statesResponse.status}`,
            code: "STATES_FETCH_ERROR"
          }, { status: 400 });
        }

        // Validate states response
        let entities: HAEntity[];
        try {
          entities = await statesResponse.json();
          if (!Array.isArray(entities)) {
            throw new Error('States response is not an array');
          }

          // Validate entity structure
          for (const entity of entities) {
            if (!entity || typeof entity !== 'object' || !entity.entity_id || typeof entity.state === 'undefined') {
              throw new Error('Invalid entity format');
            }
          }
        } catch (parseError) {
          return NextResponse.json({
            success: false,
            error: "Invalid response format from Home Assistant states endpoint",
            code: "INVALID_STATES_RESPONSE"
          }, { status: 400 });
        }

        // Success response with entities
        return NextResponse.json({
          success: true,
          entities: entities.map(entity => ({
            entity_id: entity.entity_id,
            state: entity.state,
            attributes: entity.attributes || {},
            last_changed: entity.last_changed,
            last_updated: entity.last_updated
          }))
        }, { status: 200 });

      } catch (statesError) {
        clearTimeout(statesTimeoutId);
        
        if (statesError instanceof Error && statesError.name === 'AbortError') {
          return NextResponse.json({
            success: false,
            error: "Request timeout while fetching entities",
            code: "STATES_TIMEOUT"
          }, { status: 400 });
        }

        return NextResponse.json({
          success: false,
          error: "Network error while fetching entities",
          code: "STATES_NETWORK_ERROR"
        }, { status: 400 });
      }

    } catch (configError) {
      clearTimeout(timeoutId);
      
      if (configError instanceof Error && configError.name === 'AbortError') {
        return NextResponse.json({
          success: false,
          error: "Request timeout while connecting to Home Assistant",
          code: "CONNECTION_TIMEOUT"
        }, { status: 400 });
      }

      if (configError instanceof TypeError && configError.message.includes('fetch')) {
        return NextResponse.json({
          success: false,
          error: "Network error - unable to connect to Home Assistant",
          code: "NETWORK_ERROR"
        }, { status: 400 });
      }

      return NextResponse.json({
        success: false,
        error: "Connection failed - check URL and network connectivity",
        code: "CONNECTION_FAILED"
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Home Assistant test connection error:', error);
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json({
        success: false,
        error: "Invalid JSON in request body",
        code: "INVALID_JSON"
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: "Internal server error occurred while testing connection"
    }, { status: 500 });
  }
}