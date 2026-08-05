-- CreateIndex
CREATE INDEX `jobs_status_scrapedAt_idx` ON `jobs`(`status`, `scrapedAt`);

-- CreateIndex
CREATE INDEX `jobs_sourceId_status_idx` ON `jobs`(`sourceId`, `status`);

-- CreateIndex
CREATE INDEX `applications_userId_status_idx` ON `applications`(`userId`, `status`);
