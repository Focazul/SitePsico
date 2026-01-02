CREATE TABLE `email_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recipientEmail` varchar(320) NOT NULL,
	`subject` varchar(500) NOT NULL,
	`emailType` enum('appointmentConfirmation','appointmentReminder','newContactNotification','contactAutoReply','passwordReset','custom') NOT NULL,
	`status` enum('sent','failed') NOT NULL,
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_email_log_recipient` ON `email_logs` (`recipientEmail`);--> statement-breakpoint
CREATE INDEX `idx_email_log_type` ON `email_logs` (`emailType`);--> statement-breakpoint
CREATE INDEX `idx_email_log_status` ON `email_logs` (`status`);