ALTER TABLE `delivery_locations` DROP INDEX `delivery_locations_name_unique`;--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `completed` tinyint;