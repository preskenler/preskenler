-- AlterTable
ALTER TABLE `user` ADD COLUMN `banExpires` DATETIME(3) NULL,
    ADD COLUMN `banReason` TEXT NULL,
    ADD COLUMN `banned` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `role` VARCHAR(64) NOT NULL DEFAULT 'citizen';

-- AlterTable
ALTER TABLE `session` ADD COLUMN `impersonatedBy` VARCHAR(191) NULL;
