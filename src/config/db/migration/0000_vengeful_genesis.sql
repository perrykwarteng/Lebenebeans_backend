CREATE TABLE `closeOrders` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`closeOrders` enum('close','open') NOT NULL,
	CONSTRAINT `closeOrders_id` PRIMARY KEY(`id`),
	CONSTRAINT `closeOrders_closeOrders_unique` UNIQUE(`closeOrders`)
);
--> statement-breakpoint
CREATE TABLE `delivery_locations` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`price` decimal(10,2) NOT NULL DEFAULT '0.00',
	`createdAt` datetime NOT NULL,
	`updatedAt` datetime NOT NULL,
	CONSTRAINT `delivery_locations_id` PRIMARY KEY(`id`),
	CONSTRAINT `delivery_locations_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`orderIdFk` bigint unsigned NOT NULL,
	`foodName` varchar(255) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`unitPrice` decimal(10,2),
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`orderId` varchar(64) NOT NULL,
	`date` bigint NOT NULL,
	`name` varchar(255) NOT NULL,
	`phoneNumber` varchar(32) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`note` text,
	`completed` tinyint NOT NULL DEFAULT 0,
	`location` varchar(255) NOT NULL,
	`deliveryType` varchar(64),
	`deliveryFee` decimal(10,2) NOT NULL DEFAULT '0.00',
	`priceOfFood` decimal(10,2) NOT NULL DEFAULT '0.00',
	`orderPaid` tinyint NOT NULL DEFAULT 0,
	`createdAt` datetime NOT NULL,
	`updatedAt` datetime NOT NULL,
	`legacyId` varchar(128),
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `legacyId` UNIQUE(`legacyId`),
	CONSTRAINT `legacyId_10` UNIQUE(`legacyId`),
	CONSTRAINT `legacyId_11` UNIQUE(`legacyId`),
	CONSTRAINT `legacyId_12` UNIQUE(`legacyId`),
	CONSTRAINT `legacyId_13` UNIQUE(`legacyId`),
	CONSTRAINT `legacyId_14` UNIQUE(`legacyId`),
	CONSTRAINT `legacyId_2` UNIQUE(`legacyId`),
	CONSTRAINT `legacyId_3` UNIQUE(`legacyId`),
	CONSTRAINT `legacyId_4` UNIQUE(`legacyId`),
	CONSTRAINT `legacyId_5` UNIQUE(`legacyId`),
	CONSTRAINT `legacyId_6` UNIQUE(`legacyId`),
	CONSTRAINT `legacyId_7` UNIQUE(`legacyId`),
	CONSTRAINT `legacyId_8` UNIQUE(`legacyId`),
	CONSTRAINT `legacyId_9` UNIQUE(`legacyId`),
	CONSTRAINT `orderId` UNIQUE(`orderId`),
	CONSTRAINT `orderId_10` UNIQUE(`orderId`),
	CONSTRAINT `orderId_11` UNIQUE(`orderId`),
	CONSTRAINT `orderId_12` UNIQUE(`orderId`),
	CONSTRAINT `orderId_13` UNIQUE(`orderId`),
	CONSTRAINT `orderId_14` UNIQUE(`orderId`),
	CONSTRAINT `orderId_15` UNIQUE(`orderId`),
	CONSTRAINT `orderId_2` UNIQUE(`orderId`),
	CONSTRAINT `orderId_3` UNIQUE(`orderId`),
	CONSTRAINT `orderId_4` UNIQUE(`orderId`),
	CONSTRAINT `orderId_5` UNIQUE(`orderId`),
	CONSTRAINT `orderId_6` UNIQUE(`orderId`),
	CONSTRAINT `orderId_7` UNIQUE(`orderId`),
	CONSTRAINT `orderId_8` UNIQUE(`orderId`),
	CONSTRAINT `orderId_9` UNIQUE(`orderId`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`orderId` bigint unsigned,
	`paymentStatus` enum('pending','success','failed') NOT NULL,
	`totalAmount` decimal(10,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`orderId` bigint unsigned,
	`amount` decimal(10,2) NOT NULL,
	`status` enum('pending','success','failed') NOT NULL,
	`reference` varchar(255),
	`paymentsMethod` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`role` enum('admin','user') NOT NULL,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_orderIdFk_orders_id_fk` FOREIGN KEY (`orderIdFk`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;