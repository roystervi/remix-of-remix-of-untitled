CREATE TABLE `pihole_config` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`url` text NOT NULL,
	`app_password` text NOT NULL,
	`connected` integer DEFAULT false,
	`last_checked` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
