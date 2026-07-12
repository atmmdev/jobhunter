-- AlterTable
ALTER TABLE `resumes` ADD COLUMN `locale` ENUM('en', 'pt_BR') NOT NULL DEFAULT 'en';

-- CreateIndex
CREATE INDEX `resumes_locale_idx` ON `resumes`(`locale`);

-- CreateIndex
CREATE UNIQUE INDEX `resumes_userId_stack_locale_key` ON `resumes`(`userId`, `stack`, `locale`);
