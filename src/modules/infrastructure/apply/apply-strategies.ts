import type { Page } from 'playwright';

import type {
  ApplyJobContext,
  ApplyStrategy,
  ApplyStrategyInput,
} from '@/modules/domain/apply/apply-strategy';
import {
  clickSubmitIfPresent,
  detectApplyConfirmation,
  detectManualBlockers,
  fillCommonApplyFields,
} from '@/modules/infrastructure/apply/fill-common-fields';
import { asPlaywrightPage } from '@/modules/infrastructure/apply/playwright-browser.service';
import type { AutoApplyResult } from '@/shared/schemas/auto-apply.schema';

/**
 * Greenhouse board / job-board apply strategy (P0).
 */
export class GreenhouseApplyStrategy implements ApplyStrategy {
  readonly key = 'greenhouse';

  supports(job: ApplyJobContext): boolean {
    if (job.atsHint === 'GREENHOUSE') {
      return true;
    }
    return /greenhouse\.io/i.test(job.applyUrl);
  }

  async apply(input: ApplyStrategyInput, pageHandle: unknown): Promise<AutoApplyResult> {
    const page = asPlaywrightPage(pageHandle);
    return runStructuredApply(page, input, this.key);
  }
}

/**
 * Lever postings apply strategy (P0).
 */
export class LeverApplyStrategy implements ApplyStrategy {
  readonly key = 'lever';

  supports(job: ApplyJobContext): boolean {
    if (job.atsHint === 'LEVER') {
      return true;
    }
    return /lever\.co/i.test(job.applyUrl);
  }

  async apply(input: ApplyStrategyInput, pageHandle: unknown): Promise<AutoApplyResult> {
    const page = asPlaywrightPage(pageHandle);
    return runStructuredApply(page, input, this.key);
  }
}

/**
 * Best-effort careers / CUSTOM apply strategy (P0 fallback).
 */
export class CareersApplyStrategy implements ApplyStrategy {
  readonly key = 'careers';

  supports(job: ApplyJobContext): boolean {
    return Boolean(job.applyUrl);
  }

  async apply(input: ApplyStrategyInput, pageHandle: unknown): Promise<AutoApplyResult> {
    const page = asPlaywrightPage(pageHandle);
    return runStructuredApply(page, input, this.key);
  }
}

async function runStructuredApply(
  page: Page,
  input: ApplyStrategyInput,
  provider: string,
): Promise<AutoApplyResult> {
  const artifactPaths: string[] = [];

  try {
    await page.goto(input.job.applyUrl, { waitUntil: 'domcontentloaded' });

    const blocker = await detectManualBlockers(page);
    if (blocker) {
      artifactPaths.push(...(await captureArtifacts(page, input.artifactsDir, 'blocked')));
      return {
        status: 'MANUAL_REQUIRED',
        reason: blocker,
        provider,
        artifactPaths,
      };
    }

    // Prefer dedicated apply entry points when the listing page is not the form.
    const applyLink = page.getByRole('link', { name: /apply/i }).first();
    if (await applyLink.isVisible().catch(() => false)) {
      await applyLink.click({ timeout: 5_000 }).catch(() => undefined);
      await page.waitForLoadState('domcontentloaded').catch(() => undefined);
    }

    const { filled } = await fillCommonApplyFields(page, {
      fullName: input.candidate.fullName,
      email: input.candidate.email,
      phone: input.candidate.phone,
      coverLetter: input.candidate.coverLetter,
      resumeFilePath: input.candidate.resumeFilePath,
    });

    artifactPaths.push(...(await captureArtifacts(page, input.artifactsDir, 'filled')));

    if (filled.length === 0) {
      return {
        status: 'MANUAL_REQUIRED',
        reason: 'No recognizable apply form fields were found',
        provider,
        artifactPaths,
      };
    }

    if (!input.allowSubmit) {
      return {
        status: 'MANUAL_REQUIRED',
        reason: `Filled ${filled.join(', ')}; submit disabled (set PLAYWRIGHT_AUTO_SUBMIT=true to enable)`,
        provider,
        artifactPaths,
      };
    }

    const clicked = await clickSubmitIfPresent(page);
    if (!clicked) {
      return {
        status: 'MANUAL_REQUIRED',
        reason: 'Could not find a submit/apply button after filling the form',
        provider,
        artifactPaths,
      };
    }

    await new Promise((resolve) => setTimeout(resolve, 1_500));
    artifactPaths.push(...(await captureArtifacts(page, input.artifactsDir, 'submitted')));

    if (await detectApplyConfirmation(page)) {
      return {
        status: 'APPLIED',
        provider,
        artifactPaths,
      };
    }

    return {
      status: 'MANUAL_REQUIRED',
      reason: 'Submit clicked but confirmation was not detected',
      provider,
      artifactPaths,
    };
  } catch (error) {
    artifactPaths.push(...(await captureArtifacts(page, input.artifactsDir, 'error').catch(() => [])));
    return {
      status: 'FAILED',
      code: 'APPLY_STRATEGY_ERROR',
      message: error instanceof Error ? error.message : 'Unknown apply strategy error',
      provider,
      artifactPaths,
    };
  }
}

async function captureArtifacts(
  page: Page,
  dir: string,
  label: string,
): Promise<string[]> {
  const paths: string[] = [];
  try {
    const screenshotPath = `${dir}/${label}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    paths.push(screenshotPath);
  } catch {
    // ignore screenshot failures
  }
  try {
    const htmlPath = `${dir}/${label}.html`;
    const { writeFile } = await import('fs/promises');
    await writeFile(htmlPath, await page.content(), 'utf8');
    paths.push(htmlPath);
  } catch {
    // ignore html failures
  }
  return paths;
}
