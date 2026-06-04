ALTER TABLE `logs` DROP FOREIGN KEY `logs_userId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `logs` MODIFY COLUMN `userId` bigint unsigned NOT NULL;--> statement-breakpoint
ALTER TABLE `logs` MODIFY COLUMN `user` json;--> statement-breakpoint
ALTER TABLE `logs` MODIFY COLUMN `module` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `logs` MODIFY COLUMN `description` text NOT NULL;--> statement-breakpoint
ALTER TABLE `logs` MODIFY COLUMN `device` json;