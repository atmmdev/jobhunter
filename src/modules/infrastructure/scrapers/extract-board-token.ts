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

/**
 * Extracts Ashby board name from jobs.ashbyhq.com URLs.
 */
export function extractAshbyBoard(url: string): string | null {
  try {
    const parsed = new URL(url.includes('://') ? url : `https://${url}`);
    if (!parsed.hostname.toLowerCase().includes('ashbyhq.com')) {
      return null;
    }
    const parts = parsed.pathname.split('/').filter(Boolean);
    return parts[0] ?? null;
  } catch {
    return null;
  }
}

/**
 * Extracts Gupy career subdomain from `*.gupy.io` or career.gupy.io company URLs.
 */
export function extractGupySubdomain(url: string): string | null {
  try {
    const parsed = new URL(url.includes('://') ? url : `https://${url}`);
    const host = parsed.hostname.toLowerCase();

    if (host === 'career.gupy.io' || host === 'www.career.gupy.io') {
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (parts[0] === 'companies' && parts[1]) {
        return parts[1];
      }
      return null;
    }

    const match = host.match(/^([a-z0-9-]+)\.gupy\.io$/i);
    if (!match?.[1]) {
      return null;
    }

    const reserved = new Set(['www', 'api', 'portal', 'career', 'careers', 'private-api']);
    const subdomain = match[1].toLowerCase();
    return reserved.has(subdomain) ? null : subdomain;
  } catch {
    return null;
  }
}
