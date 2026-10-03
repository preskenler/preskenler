-- CreateTable
CREATE TABLE `problem_report` (
    `id` VARCHAR(191) NOT NULL,
    `reference` VARCHAR(24) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `name` VARCHAR(120) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `service` VARCHAR(64) NOT NULL,
    `category` VARCHAR(64) NOT NULL,
    `location` VARCHAR(200) NOT NULL,
    `description` TEXT NOT NULL,
    `status` VARCHAR(16) NOT NULL DEFAULT 'new',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `problem_report_reference_key`(`reference`),
    INDEX `problem_report_userId_idx`(`userId`),
    INDEX `problem_report_status_idx`(`status`),
    INDEX `problem_report_service_idx`(`service`),
    INDEX `problem_report_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_status` (
    `id` VARCHAR(191) NOT NULL,
    `service` VARCHAR(64) NOT NULL,
    `status` VARCHAR(16) NOT NULL DEFAULT 'available',
    `message` TEXT NULL,
    `expectedReturn` DATETIME(3) NULL,
    `alternative` TEXT NULL,
    `updatedById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `service_status_service_key`(`service`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `appointment_slot` (
    `id` VARCHAR(191) NOT NULL,
    `service` VARCHAR(64) NOT NULL,
    `startsAt` DATETIME(3) NOT NULL,
    `durationMinutes` INTEGER NOT NULL DEFAULT 30,
    `agentName` VARCHAR(120) NULL,
    `location` VARCHAR(200) NULL,
    `capacity` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `appointment_slot_startsAt_idx`(`startsAt`),
    INDEX `appointment_slot_service_idx`(`service`),
    UNIQUE INDEX `appointment_slot_service_startsAt_key`(`service`, `startsAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `appointment` (
    `id` VARCHAR(191) NOT NULL,
    `reference` VARCHAR(24) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `slotId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(32) NULL,
    `reason` TEXT NOT NULL,
    `status` VARCHAR(16) NOT NULL DEFAULT 'booked',
    `reminderSentAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `appointment_reference_key`(`reference`),
    INDEX `appointment_userId_idx`(`userId`),
    INDEX `appointment_status_idx`(`status`),
    INDEX `appointment_slotId_idx`(`slotId`),
    INDEX `appointment_reminderSentAt_idx`(`reminderSentAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auth_audit_log` (
    `id` VARCHAR(191) NOT NULL,
    `event` VARCHAR(32) NOT NULL,
    `outcome` VARCHAR(16) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `ipAddress` VARCHAR(64) NULL,
    `userAgent` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `auth_audit_log_email_createdAt_idx`(`email`, `createdAt`),
    INDEX `auth_audit_log_ipAddress_createdAt_idx`(`ipAddress`, `createdAt`),
    INDEX `auth_audit_log_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `problem_report` ADD CONSTRAINT `problem_report_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointment` ADD CONSTRAINT `appointment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointment` ADD CONSTRAINT `appointment_slotId_fkey` FOREIGN KEY (`slotId`) REFERENCES `appointment_slot`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
