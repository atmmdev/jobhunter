-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `passwordHash` VARCHAR(191) NULL,
    `locale` ENUM('en', 'pt_BR') NOT NULL DEFAULT 'en',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resumes` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `stack` ENUM('JS_TS', 'DOTNET', 'PHP', 'OTHER') NOT NULL,
    `summary` TEXT NULL,
    `contentText` LONGTEXT NOT NULL,
    `filePath` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `resumes_userId_idx`(`userId`),
    INDEX `resumes_stack_idx`(`stack`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `companies` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `website` VARCHAR(191) NULL,
    `careersUrl` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `atsType` ENUM('GREENHOUSE', 'LEVER', 'ASHBY', 'WORKDAY', 'BAMBOOHR', 'SMARTRECRUITERS', 'TEAMTAILOR', 'GUPY', 'KENOBY', 'SOLIDES', 'LINKEDIN', 'INDEED', 'CATHO', 'APINFO', 'CUSTOM', 'UNKNOWN') NULL,
    `isRemoteFriendly` BOOLEAN NULL,
    `sourceMeta` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `companies_name_idx`(`name`),
    INDEX `companies_atsType_idx`(`atsType`),
    INDEX `companies_country_idx`(`country`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sources` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('ATS', 'CAREERS', 'JOB_BOARD', 'TELEGRAM', 'SLACK', 'OTHER') NOT NULL,
    `atsType` ENUM('GREENHOUSE', 'LEVER', 'ASHBY', 'WORKDAY', 'BAMBOOHR', 'SMARTRECRUITERS', 'TEAMTAILOR', 'GUPY', 'KENOBY', 'SOLIDES', 'LINKEDIN', 'INDEED', 'CATHO', 'APINFO', 'CUSTOM', 'UNKNOWN') NULL,
    `baseUrl` TEXT NOT NULL,
    `companyId` VARCHAR(191) NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `scheduleCron` VARCHAR(191) NULL,
    `lastRunAt` DATETIME(3) NULL,
    `lastStatus` ENUM('SUCCESS', 'PARTIAL', 'FAILED') NULL,
    `config` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `sources_enabled_idx`(`enabled`),
    INDEX `sources_type_idx`(`type`),
    INDEX `sources_atsType_idx`(`atsType`),
    INDEX `sources_companyId_idx`(`companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jobs` (
    `id` VARCHAR(191) NOT NULL,
    `companyId` VARCHAR(191) NULL,
    `sourceId` VARCHAR(191) NOT NULL,
    `externalId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `descriptionHtml` LONGTEXT NULL,
    `descriptionText` LONGTEXT NOT NULL,
    `location` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `isRemote` BOOLEAN NULL,
    `employmentType` VARCHAR(191) NULL,
    `seniority` VARCHAR(191) NULL,
    `salaryMin` DECIMAL(12, 2) NULL,
    `salaryMax` DECIMAL(12, 2) NULL,
    `salaryCurrency` VARCHAR(191) NULL,
    `salaryRaw` VARCHAR(191) NULL,
    `applyUrl` TEXT NOT NULL,
    `postedAt` DATETIME(3) NULL,
    `scrapedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `contentHash` VARCHAR(191) NOT NULL,
    `status` ENUM('NEW', 'SCORED', 'FAVORITED', 'REJECTED', 'APPROVED', 'APPLIED', 'INTERVIEW', 'OFFER', 'CLOSED') NOT NULL DEFAULT 'NEW',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `jobs_contentHash_idx`(`contentHash`),
    INDEX `jobs_status_idx`(`status`),
    INDEX `jobs_postedAt_idx`(`postedAt`),
    INDEX `jobs_scrapedAt_idx`(`scrapedAt`),
    INDEX `jobs_companyId_idx`(`companyId`),
    INDEX `jobs_isRemote_idx`(`isRemote`),
    INDEX `jobs_country_idx`(`country`),
    UNIQUE INDEX `jobs_sourceId_externalId_key`(`sourceId`, `externalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `technologies` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NULL,

    UNIQUE INDEX `technologies_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job_technologies` (
    `jobId` VARCHAR(191) NOT NULL,
    `technologyId` VARCHAR(191) NOT NULL,
    `confidence` DOUBLE NULL,

    PRIMARY KEY (`jobId`, `technologyId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job_scores` (
    `id` VARCHAR(191) NOT NULL,
    `jobId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `score` INTEGER NOT NULL,
    `breakdown` JSON NOT NULL,
    `explanation` TEXT NULL,
    `model` VARCHAR(191) NULL,
    `promptVersion` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `job_scores_score_idx`(`score`),
    INDEX `job_scores_jobId_idx`(`jobId`),
    INDEX `job_scores_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job_resume_matches` (
    `id` VARCHAR(191) NOT NULL,
    `jobId` VARCHAR(191) NOT NULL,
    `resumeId` VARCHAR(191) NOT NULL,
    `matchScore` INTEGER NOT NULL,
    `reasons` JSON NOT NULL,
    `isRecommended` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `job_resume_matches_jobId_resumeId_key`(`jobId`, `resumeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `applications` (
    `id` VARCHAR(191) NOT NULL,
    `jobId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `resumeId` VARCHAR(191) NOT NULL,
    `coverLetterId` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PENDING_APPLY', 'APPLIED', 'FAILED', 'MANUAL_REQUIRED', 'INTERVIEW', 'REJECTED', 'OFFER', 'WITHDRAWN') NOT NULL DEFAULT 'DRAFT',
    `approvedAt` DATETIME(3) NULL,
    `appliedAt` DATETIME(3) NULL,
    `failureCode` VARCHAR(191) NULL,
    `failureMessage` TEXT NULL,
    `provider` VARCHAR(191) NULL,
    `externalReference` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `applications_status_idx`(`status`),
    INDEX `applications_appliedAt_idx`(`appliedAt`),
    INDEX `applications_userId_idx`(`userId`),
    INDEX `applications_jobId_idx`(`jobId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cover_letters` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `jobId` VARCHAR(191) NOT NULL,
    `resumeId` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `locale` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NULL,
    `promptVersion` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `cover_letters_userId_idx`(`userId`),
    INDEX `cover_letters_jobId_idx`(`jobId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `scrape_runs` (
    `id` VARCHAR(191) NOT NULL,
    `sourceId` VARCHAR(191) NOT NULL,
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `finishedAt` DATETIME(3) NULL,
    `status` ENUM('SUCCESS', 'PARTIAL', 'FAILED') NOT NULL,
    `jobsFound` INTEGER NOT NULL DEFAULT 0,
    `jobsUpserted` INTEGER NOT NULL DEFAULT 0,
    `errorSummary` TEXT NULL,

    INDEX `scrape_runs_sourceId_idx`(`sourceId`),
    INDEX `scrape_runs_startedAt_idx`(`startedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `scrape_artifacts` (
    `id` VARCHAR(191) NOT NULL,
    `scrapeRunId` VARCHAR(191) NULL,
    `jobId` VARCHAR(191) NULL,
    `contentType` VARCHAR(191) NOT NULL,
    `storagePath` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `scrape_artifacts_scrapeRunId_idx`(`scrapeRunId`),
    INDEX `scrape_artifacts_jobId_idx`(`jobId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `payload` JSON NULL,
    `readAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notifications_userId_readAt_idx`(`userId`, `readAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `credential_vault` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `ciphertext` TEXT NOT NULL,
    `iv` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `credential_vault_userId_provider_key`(`userId`, `provider`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `actorType` ENUM('USER', 'SYSTEM') NOT NULL,
    `actorId` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `entityType` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_entityType_entityId_idx`(`entityType`, `entityId`),
    INDEX `audit_logs_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `resumes` ADD CONSTRAINT `resumes_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sources` ADD CONSTRAINT `sources_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jobs` ADD CONSTRAINT `jobs_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jobs` ADD CONSTRAINT `jobs_sourceId_fkey` FOREIGN KEY (`sourceId`) REFERENCES `sources`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_technologies` ADD CONSTRAINT `job_technologies_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `jobs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_technologies` ADD CONSTRAINT `job_technologies_technologyId_fkey` FOREIGN KEY (`technologyId`) REFERENCES `technologies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_scores` ADD CONSTRAINT `job_scores_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `jobs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_scores` ADD CONSTRAINT `job_scores_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_resume_matches` ADD CONSTRAINT `job_resume_matches_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `jobs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_resume_matches` ADD CONSTRAINT `job_resume_matches_resumeId_fkey` FOREIGN KEY (`resumeId`) REFERENCES `resumes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `jobs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_resumeId_fkey` FOREIGN KEY (`resumeId`) REFERENCES `resumes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_coverLetterId_fkey` FOREIGN KEY (`coverLetterId`) REFERENCES `cover_letters`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cover_letters` ADD CONSTRAINT `cover_letters_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cover_letters` ADD CONSTRAINT `cover_letters_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `jobs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cover_letters` ADD CONSTRAINT `cover_letters_resumeId_fkey` FOREIGN KEY (`resumeId`) REFERENCES `resumes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `scrape_runs` ADD CONSTRAINT `scrape_runs_sourceId_fkey` FOREIGN KEY (`sourceId`) REFERENCES `sources`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `scrape_artifacts` ADD CONSTRAINT `scrape_artifacts_scrapeRunId_fkey` FOREIGN KEY (`scrapeRunId`) REFERENCES `scrape_runs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `scrape_artifacts` ADD CONSTRAINT `scrape_artifacts_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `jobs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `credential_vault` ADD CONSTRAINT `credential_vault_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

