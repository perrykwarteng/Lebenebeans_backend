ALTER TABLE `guest` DROP FOREIGN KEY `guest_orderId_orders_id_fk`;
--> statement-breakpoint
ALTER TABLE `payments` DROP FOREIGN KEY `payments_orderId_orders_id_fk`;
--> statement-breakpoint
ALTER TABLE `promotionList` DROP FOREIGN KEY `promotionList_orderId_orders_id_fk`;
--> statement-breakpoint
ALTER TABLE `promotionList` DROP FOREIGN KEY `promotionList_promotionId_promotion_id_fk`;
--> statement-breakpoint
ALTER TABLE `transactions` DROP FOREIGN KEY `transactions_orderId_orders_id_fk`;
--> statement-breakpoint
ALTER TABLE `guest` MODIFY COLUMN `orderId` bigint unsigned;--> statement-breakpoint
ALTER TABLE `guest` MODIFY COLUMN `phoneNumber` varchar(32);--> statement-breakpoint
ALTER TABLE `logs` MODIFY COLUMN `status` enum('success','pending','failed') NOT NULL;--> statement-breakpoint
ALTER TABLE `menu` MODIFY COLUMN `quantity` bigint unsigned;--> statement-breakpoint
ALTER TABLE `guest` ADD CONSTRAINT `guest_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `promotionList` ADD CONSTRAINT `promotionList_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `promotionList` ADD CONSTRAINT `promotionList_promotionId_promotion_id_fk` FOREIGN KEY (`promotionId`) REFERENCES `promotion`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE set null ON UPDATE cascade;