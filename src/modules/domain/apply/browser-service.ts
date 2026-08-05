/**
 * Isolated browser session used by auto-apply strategies.
 */
export interface BrowserSession {
  readonly id: string;
  /** Playwright Page — typed loosely at the domain boundary. */
  readonly page: unknown;
  close(): Promise<void>;
}

export interface LaunchBrowserSessionOptions {
  headless?: boolean;
  timeoutMs?: number;
  /** Playwright storageState JSON string (cookies/origins). */
  storageStateJson?: string;
}

/**
 * Port for launching isolated browser contexts for automation.
 */
export interface BrowserService {
  launchSession(options?: LaunchBrowserSessionOptions): Promise<BrowserSession>;
}
