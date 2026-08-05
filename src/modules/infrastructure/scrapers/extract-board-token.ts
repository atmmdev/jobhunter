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

export interface WorkdayBoardParts {
  host: string;
  tenant: string;
  site: string;
}

/**
 * Extracts Workday CXS board parts from myworkdayjobs.com careers URLs.
 * Example: https://nvidia.wd5.myworkdayjobs.com/en-US/NVIDIAExternalCareerSite
 */
export function extractWorkdayBoard(url: string): WorkdayBoardParts | null {
  try {
    const parsed = new URL(url.includes('://') ? url : `https://${url}`);
    const host = parsed.hostname.toLowerCase();
    if (!host.includes('myworkdayjobs.com')) {
      return null;
    }

    const hostMatch = host.match(/^([a-z0-9-]+)\.(wd\d+)\.myworkdayjobs\.com$/i);
    const tenant = hostMatch?.[1];
    if (!tenant) {
      return null;
    }

    const parts = parsed.pathname.split('/').filter(Boolean);
    const localeLike = parts[0] && /^[a-z]{2}(-[A-Z]{2})?$/.test(parts[0]) ? parts[0] : null;
    const site = localeLike ? parts[1] : parts[0];
    if (!site || site.toLowerCase() === 'wday') {
      return null;
    }

    return { host, tenant, site };
  } catch {
    return null;
  }
}

/**
 * Extracts SmartRecruiters company identifier from public board / API URLs.
 * Example: https://jobs.smartrecruiters.com/Canva
 */
export function extractSmartRecruitersCompany(url: string): string | null {
  try {
    const parsed = new URL(url.includes('://') ? url : `https://${url}`);
    const host = parsed.hostname.toLowerCase();
    const parts = parsed.pathname.split('/').filter(Boolean);

    if (host.includes('api.smartrecruiters.com')) {
      const companiesIdx = parts.findIndex((part) => part.toLowerCase() === 'companies');
      const company = companiesIdx >= 0 ? parts[companiesIdx + 1] : undefined;
      return company || null;
    }

    if (host.includes('smartrecruiters.com')) {
      const reserved = new Set([
        'external-referrals',
        'oneclick-ui',
        'widget',
        'api',
        'www',
      ]);
      const company = parts[0];
      if (!company || reserved.has(company.toLowerCase())) {
        return null;
      }
      return company;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Extracts BambooHR careers subdomain from `*.bamboohr.com` URLs.
 * Example: https://g2.bamboohr.com/careers
 */
export function extractBambooHrSubdomain(url: string): string | null {
  try {
    const parsed = new URL(url.includes('://') ? url : `https://${url}`);
    const host = parsed.hostname.toLowerCase();
    const match = host.match(/^([a-z0-9-]+)\.bamboohr\.com$/i);
    if (!match?.[1]) {
      return null;
    }

    const reserved = new Set([
      'www',
      'api',
      'app',
      'login',
      'resources',
      'support',
      'marketplace',
    ]);
    const subdomain = match[1].toLowerCase();
    return reserved.has(subdomain) ? null : subdomain;
  } catch {
    return null;
  }
}
