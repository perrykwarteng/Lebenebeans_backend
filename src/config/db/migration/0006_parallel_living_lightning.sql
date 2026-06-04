CREATE TABLE `logs` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`userId` bigint unsigned,
	`user` varchar(255) NOT NULL,
	`action` varchar(255) NOT NULL,
	`module` varchar(255),
	`description` text,
	`ipAddress` varchar(64),
	`device` varchar(255),
	`status` enum('success','failed') DEFAULT 'success',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `guest` DROP FOREIGN KEY `guest_phoneNumber_promotion_id_fk`;
--> statement-breakpoint
ALTER TABLE `menu` MODIFY COLUMN `quantity` bigint;--> statement-breakpoint
ALTER TABLE `menu` MODIFY COLUMN `quantity` bigint DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('super-admin','sub-admin','admin','user') NOT NULL;--> statement-breakpoint
ALTER TABLE `logs` ADD CONSTRAINT `logs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE cascade;