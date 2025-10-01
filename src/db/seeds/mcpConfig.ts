import { db } from '@/db';
import { mcpConfig } from '@/db/schema';

async function main() {
    // Delete existing records first
    await db.delete(mcpConfig);

    const sampleMcpConfigs = [
        {
            url: 'http://homeassistant.local:8123',
            token: 'test_long_lived_access_token_abc123',
            connected: true,
            entities: JSON.stringify([
                {
                    entity_id: 'light.den',
                    friendly_name: 'Den Light',
                    state: 'on',
                    attributes: {
                        brightness: 255,
                        color_mode: 'rgb',
                        rgb_color: [255, 255, 255]
                    }
                },
                {
                    entity_id: 'switch.kitchen',
                    friendly_name: 'Kitchen Switch',
                    state: 'off',
                    attributes: {
                        device_class: 'outlet'
                    }
                },
                {
                    entity_id: 'sensor.temperature',
                    friendly_name: 'Living Room Temperature',
                    state: '22.5',
                    attributes: {
                        unit_of_measurement: '°C',
                        device_class: 'temperature'
                    }
                },
                {
                    entity_id: 'light.bedroom',
                    friendly_name: 'Bedroom Light',
                    state: 'off',
                    attributes: {
                        brightness: 0,
                        color_mode: 'brightness'
                    }
                },
                {
                    entity_id: 'switch.garage',
                    friendly_name: 'Garage Door Switch',
                    state: 'on',
                    attributes: {
                        device_class: 'garage_door'
                    }
                }
            ]),
            serverPort: 8124,
            exposureRules: JSON.stringify([
                {
                    id: 'lights_only',
                    name: 'Lights Only',
                    pattern: 'light.*',
                    allowed: true,
                    description: 'Expose all light entities'
                },
                {
                    id: 'no_bedroom',
                    name: 'No Bedroom Devices',
                    pattern: '.*bedroom.*',
                    allowed: false,
                    description: 'Block all bedroom devices for privacy'
                },
                {
                    id: 'sensors_readonly',
                    name: 'Sensors Read Only',
                    pattern: 'sensor.*',
                    allowed: true,
                    readonly: true,
                    description: 'Allow reading sensor data but no control'
                },
                {
                    id: 'critical_switches',
                    name: 'Critical Switches',
                    pattern: 'switch.(garage|security).*',
                    allowed: true,
                    requireAuth: true,
                    description: 'Critical switches require authentication'
                }
            ]),
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString(),
        }
    ];

    await db.insert(mcpConfig).values(sampleMcpConfigs);
    
    console.log('✅ MCP Config seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});