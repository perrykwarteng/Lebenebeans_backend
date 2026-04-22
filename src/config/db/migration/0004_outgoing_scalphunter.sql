CREATE TABLE `guest` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`orderId` bigint,
	`phoneNumber` bigint,
	`name` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `guest_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `guest` ADD CONSTRAINT `guest_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `guest` ADD CONSTRAINT `guest_phoneNumber_promotion_id_fk` FOREIGN KEY (`phoneNumber`) REFERENCES `promotion`(`id`) ON DELETE no action ON UPDATE no action;