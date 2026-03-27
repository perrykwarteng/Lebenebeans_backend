CREATE TABLE `orderItems` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`orderId` int,
	`foodName` varchar(255) NOT NULL,
	`quantity` int NOT NULL,
	`price` decimal NOT NULL,
	CONSTRAINT `orderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`number` varchar(255) NOT NULL,
	`location` varchar(255) NOT NULL,
	`deliveryType` varchar(255) NOT NULL,
	`note` text,
	`orderDelivered` boolean NOT NULL,
	`deliveryFee` decimal NOT NULL,
	`foodCost` decimal NOT NULL,
	`totalPrice` decimal NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`orderId` int,
	`transactionStatus` enum('pending','success','failed') NOT NULL,
	`totalAmount` decimal NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`orderId` int,
	`amount` decimal NOT NULL,
	`transactionStatus` enum('pending','success','failed') NOT NULL,
	`reference` varchar(255),
	`paymentsMethod` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`role` enum('admin','user') NOT NULL,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `orderItems` ADD CONSTRAINT `orderItems_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;