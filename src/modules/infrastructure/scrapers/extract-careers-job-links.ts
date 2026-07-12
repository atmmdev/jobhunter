import { createHash } from 'crypto';

export interface ExtractedCareersJobLink {
  title: string;
  applyUrl: string;
  externalId: string;
}

const JOB_PATH_PATTERN =
  /\/(jobs?|careers?|positions?|openings?|opportunities|vacancies|requisitions?|role|apply)(\/|$)/i;

const SKIP_EXTENSIONS = /\.(pdf|png|jpe?g|gif|svg|css|js|zip|docx?|xlsx?)($|\?)/i;

/**
 * Extracts likely job posting links from a careers HTML page.
 */
export function extractCareersJobLinks(
  html: string,
  baseUrl: string,
): ExtractedCareersJobLink[] {
  const origin = new URL(baseUrl).origin;
  const seen = new Set<string>();
  const results: ExtractedCareersJobLink[] = [];

  const anchorRegex = /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null = anchorRegex.exec(html);

  while (match) {
    const href = match[1]?.trim();
    const rawTitle = stripTags(match[2] ?? '');
    if (!href || !rawTitle) {
      match = anchorRegex.exec(html);
      continue;
    }

    const applyUrl = resolveCareersUrl(href, baseUrl, origin);
    if (!applyUrl || seen.has(applyUrl) || SKIP_EXTENSIONS.test(applyUrl)) {
      match = anchorRegex.exec(html);
      continue;
    }

    const title = normalizeWhitespace(rawTitle);
    if (title.length < 4 || title.length > 180) {
      match = anchorRegex.exec(html);
      continue;
    }

    if (!looksLikeJobLink(applyUrl, title)) {
      match = anchorRegex.exec(html);
      continue;
    }

    seen.add(applyUrl);
    results.push({
      title,
      applyUrl,
      externalId: createHash('sha256').update(applyUrl).digest('hex').slice(0, 32),
    });
    match = anchorRegex.exec(html);
  }

  return results.slice(0, 100);
}

function looksLikeJobLink(url: string, title: string): boolean {
  if (JOB_PATH_PATTERN.test(url)) {
    return true;
  }

  return /engineer|developer|designer|manager|analyst|architect|devops|full.?stack|backend|frontend/i.test(
    `${title} ${url}`,
  );
}

function resolveCareersUrl(href: string, baseUrl: string, origin: string): string | null {
  try {
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('javascript:')) {
      return null;
    }

    const resolved = new URL(href, baseUrl);
    if (resolved.protocol !== 'http:' && resolved.protocol !== 'https:') {
      return null;
    }

    if (resolved.origin !== origin) {
      return null;
    }

    return resolved.toString();
  } catch {
    return null;
  }
}

function stripTags(value: string): string {
  return value.replace(/<[^>]+>/g, ' ');
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}
