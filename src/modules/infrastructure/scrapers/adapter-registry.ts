import type {
  JobSourceAdapter,
  ScrapeSourceInput,
} from '@/modules/domain/scrape/job-source-adapter';
import { ApinfoAdapter } from '@/modules/infrastructure/scrapers/apinfo.adapter';
import { AshbyAdapter } from '@/modules/infrastructure/scrapers/ashby.adapter';
import { BambooHrAdapter } from '@/modules/infrastructure/scrapers/bamboohr.adapter';
import { GenericCareersAdapter } from '@/modules/infrastructure/scrapers/generic-careers.adapter';
import { GreenhouseAdapter } from '@/modules/infrastructure/scrapers/greenhouse.adapter';
import { GupyAdapter } from '@/modules/infrastructure/scrapers/gupy.adapter';
import { JobBoardExportAdapter } from '@/modules/infrastructure/scrapers/job-board-export.adapter';
import { LeverAdapter } from '@/modules/infrastructure/scrapers/lever.adapter';
import { PersonioAdapter } from '@/modules/infrastructure/scrapers/personio.adapter';
import { SlackAdapter } from '@/modules/infrastructure/scrapers/slack.adapter';
import { SmartRecruitersAdapter } from '@/modules/infrastructure/scrapers/smartrecruiters.adapter';
import { TeamTailorAdapter } from '@/modules/infrastructure/scrapers/teamtailor.adapter';
import { TelegramAdapter } from '@/modules/infrastructure/scrapers/telegram.adapter';
import { WorkdayAdapter } from '@/modules/infrastructure/scrapers/workday.adapter';

/**
 * Resolves the correct job-source adapter for a Source record.
 */
export class JobSourceAdapterRegistry {
  private readonly adapters: JobSourceAdapter[];

  constructor(
    adapters: JobSourceAdapter[] = [
      new GreenhouseAdapter(),
      new LeverAdapter(),
      new AshbyAdapter(),
      new ApinfoAdapter(),
      new GupyAdapter(),
      new WorkdayAdapter(),
      new SmartRecruitersAdapter(),
      new BambooHrAdapter(),
      new TeamTailorAdapter(),
      new PersonioAdapter(),
      new JobBoardExportAdapter(),
      new TelegramAdapter(),
      new SlackAdapter(),
      new GenericCareersAdapter(),
    ],
  ) {
    this.adapters = adapters;
  }

  /**
   * Returns the first adapter that supports the given source.
   */
  resolve(source: ScrapeSourceInput): JobSourceAdapter | null {
    return this.adapters.find((adapter) => adapter.supports(source)) ?? null;
  }

  /**
   * Lists adapter keys currently registered.
   */
  listKeys(): string[] {
    return this.adapters.map((adapter) => adapter.key);
  }
}
