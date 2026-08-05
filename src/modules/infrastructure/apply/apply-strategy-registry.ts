import type {
  ApplyJobContext,
  ApplyStrategy,
} from '@/modules/domain/apply/apply-strategy';
import {
  CareersApplyStrategy,
  GreenhouseApplyStrategy,
  LeverApplyStrategy,
} from '@/modules/infrastructure/apply/apply-strategies';

/**
 * Resolves the first apply strategy that supports a job URL / ATS hint.
 */
export class ApplyStrategyRegistry {
  private readonly strategies: ApplyStrategy[];

  constructor(
    strategies: ApplyStrategy[] = [
      new GreenhouseApplyStrategy(),
      new LeverApplyStrategy(),
      new CareersApplyStrategy(),
    ],
  ) {
    this.strategies = strategies;
  }

  /**
   * Returns the first matching strategy (Careers is last / fallback).
   */
  resolve(job: ApplyJobContext): ApplyStrategy | null {
    return this.strategies.find((strategy) => strategy.supports(job)) ?? null;
  }

  /**
   * Lists registered strategy keys.
   */
  listKeys(): string[] {
    return this.strategies.map((strategy) => strategy.key);
  }
}
