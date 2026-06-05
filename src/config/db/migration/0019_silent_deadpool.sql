RENAME TABLE `logs` TO `auditTrail`;--> statement-breakpoint
ALTER TABLE `auditTrail` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `auditTrail` ADD PRIMARY KEY(`id`);