CREATE TABLE `appearance_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`mode` text DEFAULT 'auto' NOT NULL,
	`screen_size` text DEFAULT 'desktop' NOT NULL,
	`width` integer DEFAULT 1200 NOT NULL,
	`height` integer DEFAULT 800 NOT NULL,
	`background_color` text DEFAULT '#ffffff' NOT NULL,
	`updated_at` text NOT NULL
);
