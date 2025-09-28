CREATE TABLE `device_activity` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`device_id` integer NOT NULL,
	`activity_type` text NOT NULL,
	`timestamp` text NOT NULL,
	`duration` integer NOT NULL,
	FOREIGN KEY (`device_id`) REFERENCES `devices`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `energy_usage` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`device_id` integer NOT NULL,
	`timestamp` text NOT NULL,
	`consumption_kwh` real NOT NULL,
	`cost` real NOT NULL,
	FOREIGN KEY (`device_id`) REFERENCES `devices`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `system_performance` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`metric_type` text NOT NULL,
	`value` real NOT NULL,
	`timestamp` text NOT NULL
);
