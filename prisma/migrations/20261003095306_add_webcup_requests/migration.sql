-- CreateTable
CREATE TABLE `webcup_request` (
    `id` VARCHAR(191) NOT NULL,
    `requestCode` VARCHAR(32) NOT NULL,
    `remoteId` INTEGER NOT NULL,
    `requesterName` TEXT NOT NULL,
    `requesterType` VARCHAR(64) NOT NULL,
    `messagePublic` TEXT NOT NULL,
    `difficulty` VARCHAR(32) NOT NULL,
    `difficultyLevel` INTEGER NOT NULL,
    `xpBase` INTEGER NOT NULL,
    `xpTimeBonus` INTEGER NOT NULL,
    `xpTotal` INTEGER NOT NULL,
    `xpAvailable` INTEGER NOT NULL,
    `isInitial` BOOLEAN NOT NULL DEFAULT false,
    `visibleSinceWave` INTEGER NOT NULL DEFAULT 0,
    `arrivalType` VARCHAR(32) NOT NULL,
    `waveNumber` INTEGER NULL,
    `arrivalTime` VARCHAR(16) NOT NULL DEFAULT '',
    `groupName` VARCHAR(64) NULL,
    `sortOrder` INTEGER NULL,
    `isAiRelated` BOOLEAN NOT NULL DEFAULT false,
    `isAiRequest` BOOLEAN NOT NULL DEFAULT false,
    `firstSeenAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastSyncedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `webcup_request_requestCode_key`(`requestCode`),
    INDEX `webcup_request_difficultyLevel_idx`(`difficultyLevel`),
    INDEX `webcup_request_waveNumber_idx`(`waveNumber`),
    INDEX `webcup_request_isInitial_idx`(`isInitial`),
    INDEX `webcup_request_firstSeenAt_idx`(`firstSeenAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `webcup_session` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'current',
    `status` VARCHAR(32) NOT NULL,
    `isRunning` BOOLEAN NOT NULL DEFAULT false,
    `currentWave` INTEGER NOT NULL DEFAULT 0,
    `elapsedMinutes` INTEGER NOT NULL DEFAULT 0,
    `visibleRequestsCount` INTEGER NOT NULL DEFAULT 0,
    `initialRequestsCount` INTEGER NOT NULL DEFAULT 0,
    `waveRequestsCount` INTEGER NOT NULL DEFAULT 0,
    `nextWaveNumber` INTEGER NOT NULL DEFAULT 0,
    `minutesUntilNextWave` INTEGER NOT NULL DEFAULT 0,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
