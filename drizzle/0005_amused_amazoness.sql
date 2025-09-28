CREATE TABLE `database_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`auto_backup` integer DEFAULT false,
	`query_logging` integer DEFAULT false,
	`schema_validation` integer DEFAULT true,
	`performance_monitoring` integer DEFAULT false,
	`local_path` text DEFAULT '/app/data/backups',
	`cloud_path` text,
	`preset` text DEFAULT 'balanced',
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
