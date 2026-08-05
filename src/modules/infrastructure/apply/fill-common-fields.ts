import { access } from 'fs/promises';
import path from 'path';
import type { Page } from 'playwright';

/**
 * Best-effort fill of common apply form fields using resilient locators.
 */
export async function fillCommonApplyFields(
  page: Page,
  input: {
    fullName: string;
    email: string;
    phone: string | null;
    coverLetter: string | null;
    resumeFilePath: string | null;
  },
): Promise<{ filled: string[] }> {
  const filled: string[] = [];

  if (
    await fillFirst(page, [
      () => page.getByLabel(/full name|^name$/i),
      () => page.getByPlaceholder(/full name|your name|^name$/i),
      () => page.locator('input[name*="name" i]:not([name*="company" i])'),
      () => page.locator('input[autocomplete="name"]'),
    ], input.fullName)
  ) {
    filled.push('fullName');
  }

  if (
    await fillFirst(page, [
      () => page.getByLabel(/email/i),
      () => page.getByPlaceholder(/email/i),
      () => page.locator('input[type="email"]'),
      () => page.locator('input[name*="email" i]'),
    ], input.email)
  ) {
    filled.push('email');
  }

  if (
    input.phone &&
    (await fillFirst(page, [
      () => page.getByLabel(/phone|mobile|tel/i),
      () => page.getByPlaceholder(/phone|mobile|tel/i),
      () => page.locator('input[type="tel"]'),
      () => page.locator('input[name*="phone" i]'),
    ], input.phone))
  ) {
    filled.push('phone');
  }

  if (
    input.coverLetter &&
    (await fillFirst(page, [
      () => page.getByLabel(/cover letter|additional information|message/i),
      () => page.getByPlaceholder(/cover letter|tell us|message/i),
      () => page.locator('textarea[name*="cover" i]'),
      () => page.locator('textarea').first(),
    ], input.coverLetter))
  ) {
    filled.push('coverLetter');
  }

  if (input.resumeFilePath && (await uploadResumeFile(page, input.resumeFilePath))) {
    filled.push('resumeFile');
  }

  return { filled };
}

/**
 * Uploads a resume into the first matching file input on the page.
 */
export async function uploadResumeFile(page: Page, filePath: string): Promise<boolean> {
  try {
    await access(filePath);
  } catch {
    return false;
  }

  const candidates = [
    () => page.locator('input[type="file"][name*="resume" i]'),
    () => page.locator('input[type="file"][id*="resume" i]'),
    () => page.getByLabel(/resume|cv|curriculum/i),
    () => page.locator('input[type="file"]').first(),
  ];

  for (const createLocator of candidates) {
    const locator = createLocator().first();
    const count = await locator.count().catch(() => 0);
    if (count === 0) {
      continue;
    }
    try {
      await locator.setInputFiles(filePath, { timeout: 5_000 });
      return true;
    } catch {
      // try next candidate
    }
  }

  return false;
}

/**
 * Detects login walls / captchas that require a human.
 */
export async function detectManualBlockers(page: Page): Promise<string | null> {
  const url = page.url().toLowerCase();
  if (/\/login|\/sign[_-]?in|\/auth|\/sso|\/captcha|\/challenge/.test(url)) {
    return `Authentication or challenge page detected (${page.url()})`;
  }

  const captcha = page
    .locator('iframe[src*="recaptcha"], iframe[src*="hcaptcha"], text=/\\bcaptcha\\b/i')
    .first();
  if (await captcha.isVisible().catch(() => false)) {
    return 'Captcha detected on apply page';
  }

  const loginHeading = page.getByRole('heading', { name: /sign in|log in|login/i }).first();
  if (await loginHeading.isVisible().catch(() => false)) {
    return 'Login wall detected on apply page';
  }

  return null;
}

/**
 * Looks for thank-you / confirmation copy after submit.
 */
export async function detectApplyConfirmation(page: Page): Promise<boolean> {
  const confirmation = page
    .getByText(/thank you|application (has been )?submitted|successfully applied|we received/i)
    .first();
  return confirmation.isVisible().catch(() => false);
}

/**
 * Clicks a primary Apply / Submit button when present.
 */
export async function clickSubmitIfPresent(page: Page): Promise<boolean> {
  const button = page
    .getByRole('button', { name: /submit application|submit|apply now|apply/i })
    .first();
  if (!(await button.isVisible().catch(() => false))) {
    return false;
  }
  await button.click({ timeout: 5_000 });
  return true;
}

/**
 * Absolute path helper for Windows / POSIX resume paths.
 */
export function resolveResumeAbsolutePath(filePath: string): string {
  return path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
}

async function fillFirst(
  page: Page,
  factories: Array<() => ReturnType<Page['locator']>>,
  value: string,
): Promise<boolean> {
  void page;
  for (const createLocator of factories) {
    const locator = createLocator().first();
    if (!(await locator.isVisible().catch(() => false))) {
      continue;
    }
    try {
      await locator.fill(value, { timeout: 3_000 });
      return true;
    } catch {
      // try next candidate
    }
  }
  return false;
}
