CREATE TABLE `mcp_config` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`url` text,
	`token` text,
	`connected` integer DEFAULT false,
	`entities` text DEFAULT '[]',
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
