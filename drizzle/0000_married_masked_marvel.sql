CREATE TABLE `audio_levels` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`device_id` integer NOT NULL,
	`level` integer NOT NULL,
	`timestamp` text NOT NULL,
	FOREIGN KEY (`device_id`) REFERENCES `devices`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `devices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`room_id` integer NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`status` integer DEFAULT false,
	`last_updated` text NOT NULL,
	FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `rooms` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`created_at` text NOT NULL
);
