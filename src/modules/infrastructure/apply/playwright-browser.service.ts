import { chromium, type Browser, type BrowserContextOptions, type Page } from 'playwright';

import type {
  BrowserService,
  BrowserSession,
  LaunchBrowserSessionOptions,
} from '@/modules/domain/apply/browser-service';

/**
 * Playwright-backed browser service with isolated contexts per apply run.
 */
export class PlaywrightBrowserService implements BrowserService {
  async launchSession(options: LaunchBrowserSessionOptions = {}): Promise<BrowserSession> {
    const headless = options.headless ?? process.env.PLAYWRIGHT_HEADLESS !== 'false';
    const timeoutMs = options.timeoutMs ?? 45_000;

    const browser = await chromium.launch({ headless });
    const storageState = parseStorageState(options.storageStateJson);
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      locale: 'en-US',
      ...(storageState ? { storageState } : {}),
    });
    context.setDefaultTimeout(timeoutMs);
    const page = await context.newPage();
    const id = `pw-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    return {
      id,
      page,
      async close() {
        await context.close().catch(() => undefined);
        await browser.close().catch(() => undefined);
      },
    };
  }
}

function parseStorageState(
  raw: string | undefined,
): BrowserContextOptions['storageState'] | undefined {
  if (!raw?.trim()) {
    return undefined;
  }
  try {
    return JSON.parse(raw) as BrowserContextOptions['storageState'];
  } catch {
    return undefined;
  }
}

/**
 * Narrows an opaque page handle to a Playwright Page.
 */
export function asPlaywrightPage(page: unknown): Page {
  return page as Page;
}

/**
 * Type helper retained for future multi-browser support.
 */
export type PlaywrightBrowser = Browser;
