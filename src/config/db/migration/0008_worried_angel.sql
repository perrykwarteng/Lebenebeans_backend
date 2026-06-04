ALTER TABLE `logs` MODIFY COLUMN `status` enum('success','pending','failed') NOT NULL;--> statement-breakpoint
ALTER TABLE `menu` MODIFY COLUMN `quantity` bigint unsigned;