ALTER TABLE `appearance_settings` ALTER COLUMN "background_color" TO "background_color" text NOT NULL DEFAULT 'rgb(92, 113, 132)';--> statement-breakpoint
ALTER TABLE `appearance_settings` ADD `primary_color` text DEFAULT '#3b82f6' NOT NULL;--> statement-breakpoint
ALTER TABLE `appearance_settings` ADD `card_placeholder_color` text DEFAULT '#9ca3af' NOT NULL;--> statement-breakpoint
ALTER TABLE `appearance_settings` ADD `navbar_background_color` text DEFAULT 'rgb(22, 143, 203)' NOT NULL;--> statement-breakpoint
ALTER TABLE `appearance_settings` ADD `theme_preset` text DEFAULT 'default' NOT NULL;