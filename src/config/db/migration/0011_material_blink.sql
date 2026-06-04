ALTER TABLE `payments` DROP FOREIGN KEY `payments_orderId_orders_id_fk`;
--> statement-breakpoint
ALTER TABLE `transactions` DROP FOREIGN KEY `transactions_orderId_orders_id_fk`;
--> statement-breakpoint
ALTER TABLE `promotion` MODIFY COLUMN `limits` bigint unsigned;--> statement-breakpoint
ALTER TABLE `promotion` MODIFY COLUMN `minOrderAmount` decimal(10,2);--> statement-breakpoint
ALTER TABLE `promotion` MODIFY COLUMN `orderDiscount` decimal(10,2);--> statement-breakpoint
ALTER TABLE `promotion` MODIFY COLUMN `minOrder` bigint unsigned;--> statement-breakpoint
ALTER TABLE `promotion` MODIFY COLUMN `usedCount` bigint unsigned NOT NULL;--> statement-breakpoint
ALTER TABLE `promotionList` MODIFY COLUMN `orderId` bigint unsigned;--> statement-breakpoint
ALTER TABLE `promotionList` MODIFY COLUMN `promotionId` bigint unsigned;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;