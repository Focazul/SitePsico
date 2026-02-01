CREATE TABLE `appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientName` varchar(255) NOT NULL,
	`clientEmail` varchar(320) NOT NULL,
	`clientPhone` varchar(20) NOT NULL,
	`appointmentDate` timestamp NOT NULL,
	`appointmentTime` varchar(5) NOT NULL,
	`duration` int NOT NULL DEFAULT 60,
	`modality` enum('presencial','online') NOT NULL,
	`subject` text,
	`notes` text,
	`status` enum('pendente','confirmado','cancelado','concluido') NOT NULL DEFAULT 'pendente',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
