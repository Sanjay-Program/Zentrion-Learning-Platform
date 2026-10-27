CREATE TABLE `enquiries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`topic` text DEFAULT 'general' NOT NULL,
	`message` text NOT NULL,
	`source` text DEFAULT 'contact' NOT NULL,
	`course_slug` text,
	`status` text DEFAULT 'new' NOT NULL,
	`notes` text,
	`ip_address` text,
	`user_agent` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `enquiries_created_idx` ON `enquiries` (`created_at`);--> statement-breakpoint
CREATE INDEX `enquiries_email_idx` ON `enquiries` (`email`);
