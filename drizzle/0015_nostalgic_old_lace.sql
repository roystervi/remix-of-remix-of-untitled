CREATE TABLE `mcp_exposed_entities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`config_id` integer NOT NULL,
	`entity_id` text NOT NULL,
	`is_exposed` integer DEFAULT true,
	`last_sync` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`config_id`) REFERENCES `mcp_config`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `mcp_config` ADD `server_port` integer DEFAULT 8124;--> statement-breakpoint
ALTER TABLE `mcp_config` ADD `exposure_rules` text DEFAULT '[]';