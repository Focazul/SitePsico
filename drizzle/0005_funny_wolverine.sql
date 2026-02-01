CREATE TABLE `pages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`metaTitle` varchar(255),
	`metaDescription` text,
	`status` enum('draft','published') NOT NULL DEFAULT 'draft',
	`order` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pages_id` PRIMARY KEY(`id`),
	CONSTRAINT `pages_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE INDEX `idx_page_slug` ON `pages` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_page_status` ON `pages` (`status`);