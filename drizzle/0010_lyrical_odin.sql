CREATE TABLE `settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`mcp_url` text,
	`mcp_token` text,
	`mcp_connected` integer DEFAULT false,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
