CREATE TABLE `translations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`mode` enum('nl_to_cpc','cpc_to_nl') NOT NULL,
	`input` text NOT NULL,
	`output` text NOT NULL,
	`propositions` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `translations_id` PRIMARY KEY(`id`)
);
