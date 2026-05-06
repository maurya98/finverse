-- CreateTable
CREATE TABLE `whatsapp_chat_support_raw_data` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `raw_data` JSON NULL,
    `created_datetime` DATETIME(3) NULL,
    `created` DATE NULL,

    INDEX `idx_created`(`created`),
    INDEX `idx_created_datetime`(`created_datetime`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `whatsapp_chat_support_dashboard` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bot_number` BIGINT NULL,
    `bot_name` VARCHAR(255) NULL,
    `user_name` VARCHAR(255) NULL,
    `user_number` BIGINT NULL,
    `user_message` TEXT NULL,
    `customer_reply` TEXT NULL,
    `intent_category` VARCHAR(255) NULL,
    `source` VARCHAR(255) NULL,
    `created_datetime` DATETIME(3) NULL,
    `created` DATE NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `account_type` VARCHAR(100) NULL,
    `user_email` VARCHAR(255) NULL,
    `campaign_id` VARCHAR(100) NULL,
    `call_center_assign` BOOLEAN NOT NULL DEFAULT false,
    `dont_send_not_campign` BOOLEAN NOT NULL DEFAULT false,
    `rating` INTEGER NULL,
    `feedback` TEXT NULL,
    `dlr_status` VARCHAR(100) NULL,

    INDEX `idx_bot_number`(`bot_number`),
    INDEX `idx_bot_name`(`bot_name`),
    INDEX `idx_status`(`status`),
    INDEX `idx_created`(`created`),
    INDEX `idx_created_datetime`(`created_datetime`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
