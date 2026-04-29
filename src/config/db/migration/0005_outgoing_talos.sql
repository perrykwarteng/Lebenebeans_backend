CREATE TABLE `menu` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`price` decimal(10,2) NOT NULL DEFAULT '0.00',
	`quantity` decimal NOT NULL,
	CONSTRAINT `menu_id` PRIMARY KEY(`id`)
);
