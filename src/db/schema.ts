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
  primaryColor: text('primary_color').notNull().default('#3b82f6'),
  backgroundColor: text('background_color').notNull().default('rgb(92, 113, 132)'),
  cardPlaceholderColor: text('card_placeholder_color').notNull().default('#9ca3af'),
  navbarBackgroundColor: text('navbar_background_color').notNull().default('rgb(22, 143, 203)'),
  themePreset: text('theme_preset').notNull().default('default'),
  screenSize: text('screen_size').notNull().default('desktop'),
  width: integer('width').notNull().default(1200),
  height: integer('height').notNull().default(800),
  mode: text('mode').notNull().default('auto'),
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