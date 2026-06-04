ALTER TABLE `guest` DROP FOREIGN KEY `guest_orderId_orders_id_fk`;
--> statement-breakpoint
ALTER TABLE `promotionList` DROP FOREIGN KEY `promotionList_orderId_orders_id_fk`;
--> statement-breakpoint
ALTER TABLE `promotionList` DROP FOREIGN KEY `promotionList_promotionId_promotion_id_fk`;
--> statement-breakpoint
ALTER TABLE `transactions` DROP FOREIGN KEY `transactions_orderId_orders_id_fk`;
--> statement-breakpoint
ALTER TABLE `guest` ADD CONSTRAINT `guest_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `promotionList` ADD CONSTRAINT `promotionList_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `promotionList` ADD CONSTRAINT `promotionList_promotionId_promotion_id_fk` FOREIGN KEY (`promotionId`) REFERENCES `promotion`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE cascade;