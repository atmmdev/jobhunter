/**
 * Extracts Greenhouse board token from common careers URLs.
 */
export function extractGreenhouseBoardToken(url: string): string | null {
  try {
    const parsed = new URL(url.includes('://') ? url : `https://${url}`);
    const host = parsed.hostname.toLowerCase();

    if (
      host.includes('greenhouse.io') ||
      host.includes('boards.greenhouse.io') ||
      host.includes('job-boards.greenhouse.io')
    ) {
      const parts = parsed.pathname.split('/').filter(Boolean);
      const token = parts[0];
      return token && token !== 'embed' ? token : null;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Extracts Lever company site name from jobs.lever.co URLs.
 */
export function extractLeverSite(url: string): string | null {
  try {
    const parsed = new URL(url.includes('://') ? url : `https://${url}`);
    if (!parsed.hostname.toLowerCase().includes('lever.co')) {
      return null;
    }
    const parts = parsed.pathname.split('/').filter(Boolean);
    return parts[0] ?? null;
  } catch {
    return null;
  }
}
