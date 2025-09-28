CREATE TABLE `home_assistant_connections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`url` text NOT NULL,
	`token` text NOT NULL,
	`status` text DEFAULT 'unknown' NOT NULL,
	`last_checked` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `home_assistant_connections_url_unique` ON `home_assistant_connections` (`url`);