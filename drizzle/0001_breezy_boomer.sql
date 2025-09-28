CREATE TABLE `weather_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`provider` text NOT NULL,
	`api_key` text,
	`latitude` real,
	`longitude` real,
	`units` text NOT NULL,
	`city` text,
	`country` text,
	`zip` text,
	`updated_at` text NOT NULL
);
