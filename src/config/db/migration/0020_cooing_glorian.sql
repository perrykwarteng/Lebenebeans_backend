RENAME TABLE `auditTrail` TO `logs`;--> statement-breakpoint
ALTER TABLE `logs` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `logs` ADD PRIMARY KEY(`id`);