import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

export const rooms = sqliteTable('rooms', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  createdAt: text('created_at').notNull(),
});

export const devices = sqliteTable('devices', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  roomId: integer('room_id').references(() => rooms.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  status: integer('status', { mode: 'boolean' }).default(false),
  lastUpdated: text('last_updated').notNull(),
});

export const audioLevels = sqliteTable('audio_levels', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  deviceId: integer('device_id').references(() => devices.id, { onDelete: 'cascade' }).notNull(),
  level: integer('level').notNull(),
  timestamp: text('timestamp').notNull(),
});

export const weatherSettings = sqliteTable('weather_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  provider: text('provider').notNull(),
  apiKey: text('api_key'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  units: text('units').notNull(),
  city: text('city'),
  country: text('country'),
  zip: text('zip'),
  updatedAt: text('updated_at').notNull(),
});

export const appearanceSettings = sqliteTable('appearance_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  mode: text('mode').notNull().default('auto'),
  screenSize: text('screen_size').notNull().default('desktop'),
  width: integer('width').notNull().default(1200),
  height: integer('height').notNull().default(800),
  backgroundColor: text('background_color').notNull().default('#ffffff'),
  updatedAt: text('updated_at').notNull(),
});

export const backups = sqliteTable('backups', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  createdAt: text('created_at').notNull(),
});

export const databaseSettings = sqliteTable('database_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  autoBackup: integer('auto_backup', { mode: 'boolean' }).default(false),
  queryLogging: integer('query_logging', { mode: 'boolean' }).default(false),
  schemaValidation: integer('schema_validation', { mode: 'boolean' }).default(true),
  performanceMonitoring: integer('performance_monitoring', { mode: 'boolean' }).default(false),
  localPath: text('local_path').default('/app/data/backups'),
  cloudPath: text('cloud_path'),
  preset: text('preset').default('balanced'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const energyUsage = sqliteTable('energy_usage', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  deviceId: integer('device_id').references(() => devices.id, { onDelete: 'cascade' }).notNull(),
  timestamp: text('timestamp').notNull(),
  consumptionKwh: real('consumption_kwh').notNull(),
  cost: real('cost').notNull(),
});

export const deviceActivity = sqliteTable('device_activity', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  deviceId: integer('device_id').references(() => devices.id, { onDelete: 'cascade' }).notNull(),
  activityType: text('activity_type').notNull(),
  timestamp: text('timestamp').notNull(),
  duration: integer('duration').notNull(),
});

export const systemPerformance = sqliteTable('system_performance', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  metricType: text('metric_type').notNull(),
  value: real('value').notNull(),
  timestamp: text('timestamp').notNull(),
});

export const gasStations = sqliteTable('gas_stations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  brand: text('brand'),
  lat: real('lat').notNull(),
  lon: real('lon').notNull(),
  address: text('address').notNull(),
  fuelTypes: text('fuel_types', { mode: 'json' }).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  mcpUrl: text('mcp_url'),
  mcpToken: text('mcp_token'),
  mcpConnected: integer('mcp_connected', { mode: 'boolean' }).default(false),
  entities: text('entities', { mode: 'json' }).default('[]'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const mcpSettings = sqliteTable('mcp_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  url: text('url'),
  token: text('token'),
  connected: integer('connected', { mode: 'boolean' }).default(false),
  entities: text('entities', { mode: 'json' }).default('[]'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const mcpConfig = sqliteTable('mcp_config', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  url: text('url'),
  token: text('token'),
  connected: integer('connected', { mode: 'boolean' }).default(false),
  entities: text('entities', { mode: 'json' }).default('[]'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});