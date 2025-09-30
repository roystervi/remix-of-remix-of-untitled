CREATE TABLE `gas_stations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`brand` text,
	`lat` real NOT NULL,
	`lon` real NOT NULL,
	`address` text,
	`fuel_types` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
