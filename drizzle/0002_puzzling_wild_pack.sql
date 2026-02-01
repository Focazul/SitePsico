CREATE TABLE `availability` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dayOfWeek` int NOT NULL,
	`startTime` time NOT NULL,
	`endTime` time NOT NULL,
	`slotDurationMinutes` int NOT NULL DEFAULT 60,
	`isAvailable` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `availability_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `blocked_dates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` date NOT NULL,
	`reason` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `blocked_dates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_name_unique` UNIQUE(`name`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20),
	`subject` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`status` enum('novo','lido','respondido') NOT NULL DEFAULT 'novo',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `post_tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`tagId` int NOT NULL,
	CONSTRAINT `post_tags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`slug` varchar(500) NOT NULL,
	`excerpt` text,
	`content` text NOT NULL,
	`coverImage` varchar(500),
	`categoryId` int,
	`views` int NOT NULL DEFAULT 0,
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `posts_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`type` enum('string','number','boolean','json') NOT NULL DEFAULT 'string',
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `settings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tags_id` PRIMARY KEY(`id`),
	CONSTRAINT `tags_name_unique` UNIQUE(`name`),
	CONSTRAINT `tags_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `users` DROP INDEX `users_openId_unique`;--> statement-breakpoint
ALTER TABLE `appointments` MODIFY COLUMN `appointmentDate` date NOT NULL;--> statement-breakpoint
ALTER TABLE `appointments` MODIFY COLUMN `appointmentTime` time NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `name` varchar(255);--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `email` varchar(320) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `password` text NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
CREATE INDEX `idx_availability_day` ON `availability` (`dayOfWeek`);--> statement-breakpoint
CREATE INDEX `idx_blocked_date` ON `blocked_dates` (`date`);--> statement-breakpoint
CREATE INDEX `idx_category_slug` ON `categories` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_message_email` ON `messages` (`email`);--> statement-breakpoint
CREATE INDEX `idx_message_status` ON `messages` (`status`);--> statement-breakpoint
CREATE INDEX `idx_post_tag` ON `post_tags` (`postId`,`tagId`);--> statement-breakpoint
CREATE INDEX `idx_post_slug` ON `posts` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_post_published` ON `posts` (`publishedAt`);--> statement-breakpoint
CREATE INDEX `idx_setting_key` ON `settings` (`key`);--> statement-breakpoint
CREATE INDEX `idx_tag_slug` ON `tags` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_appointment_datetime` ON `appointments` (`appointmentDate`,`appointmentTime`);--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `openId`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `loginMethod`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `role`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `lastSignedIn`;