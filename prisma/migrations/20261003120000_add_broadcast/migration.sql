-- CreateTable
CREATE TABLE `broadcast` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(64) NULL,
    `title` VARCHAR(160) NOT NULL,
    `body` TEXT NOT NULL,
    `level` VARCHAR(16) NOT NULL DEFAULT 'info',
    `topic` VARCHAR(32) NOT NULL DEFAULT 'general',
    `audience` VARCHAR(32) NOT NULL DEFAULT 'all',
    `area` VARCHAR(120) NULL,
    `recommendations` TEXT NULL,
    `isAi` BOOLEAN NOT NULL DEFAULT false,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `publishedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NULL,
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `broadcast_code_key`(`code`),
    INDEX `broadcast_active_publishedAt_idx`(`active`, `publishedAt`),
    INDEX `broadcast_level_idx`(`level`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
