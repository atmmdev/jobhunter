import { createHash } from 'crypto';

import { stripHtml } from '@/modules/infrastructure/scrapers/strip-html';

export interface ExtractedApinfoJob {
  externalId: string;
  title: string;
  applyUrl: string;
  location: string | null;
  companyName: string | null;
  descriptionText: string;
  isRemote: boolean | null;
}

/**
 * Parses Apinfo "Vagas Recentes" cards (`bloco-vaga-unica` + `list44.cfm?codvaga=`).
 */
export function extractApinfoJobs(html: string): ExtractedApinfoJob[] {
  const results: ExtractedApinfoJob[] = [];
  const seen = new Set<string>();

  const cardRegex =
    /<div class="bloco-vaga-unica[^"]*">([\s\S]*?)<footer class="rodape-vr">\s*<\/footer>\s*<\/div>/gi;
  let match: RegExpExecArray | null = cardRegex.exec(html);

  while (match) {
    const card = match[1] ?? '';
    const linkMatch = card.match(
      /<div class="nome-vaga"\s*>\s*<a href="([^"]*list44\.cfm\?codvaga=(\d+)[^"]*)"[^>]*>([\s\S]*?)<\/a>\s*<\/div>/i,
    );

    if (!linkMatch) {
      match = cardRegex.exec(html);
      continue;
    }

    const applyUrl = absolutizeApinfoUrl(decodeHtmlEntities(linkMatch[1] ?? ''));
    const codvaga = linkMatch[2] ?? '';
    const title = normalizeWhitespace(stripHtml(linkMatch[3] ?? ''));
    const location = extractField(card, 'data');
    const companyName = extractField(card, 'empresa');

    if (!applyUrl || !codvaga || title.length < 3) {
      match = cardRegex.exec(html);
      continue;
    }

    if (seen.has(codvaga)) {
      match = cardRegex.exec(html);
      continue;
    }
    seen.add(codvaga);

    const descriptionParts = [
      title,
      companyName ? `Empresa: ${companyName}` : null,
      location ? `Local: ${location}` : null,
      'Fonte: Apinfo',
    ].filter(Boolean);

    results.push({
      externalId: codvaga,
      title,
      applyUrl,
      location,
      companyName,
      descriptionText: descriptionParts.join('. '),
      isRemote: location ? /home\s*office|remoto|remote/i.test(location) : null,
    });

    match = cardRegex.exec(html);
  }

  if (results.length === 0) {
    return extractApinfoJobsFallback(html);
  }

  return results;
}

function extractApinfoJobsFallback(html: string): ExtractedApinfoJob[] {
  const results: ExtractedApinfoJob[] = [];
  const seen = new Set<string>();
  const linkRegex =
    /<a href="([^"]*list44\.cfm\?codvaga=(\d+)[^"]*)">([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null = linkRegex.exec(html);

  while (match) {
    const applyUrl = absolutizeApinfoUrl(decodeHtmlEntities(match[1] ?? ''));
    const codvaga = match[2] ?? '';
    const title = normalizeWhitespace(stripHtml(match[3] ?? ''));

    if (!applyUrl || !codvaga || title.length < 3 || seen.has(codvaga)) {
      match = linkRegex.exec(html);
      continue;
    }

    seen.add(codvaga);
    results.push({
      externalId: codvaga,
      title,
      applyUrl,
      location: null,
      companyName: null,
      descriptionText: `${title}. Fonte: Apinfo`,
      isRemote: null,
    });
    match = linkRegex.exec(html);
  }

  return results;
}

function extractField(card: string, className: string): string | null {
  const match = card.match(
    new RegExp(`<div class="${className}"[^>]*>\\s*([\\s\\S]*?)\\s*<\\/div>`, 'i'),
  );
  if (!match?.[1]) {
    return null;
  }
  const value = normalizeWhitespace(stripHtml(match[1]));
  return value.length > 0 ? value : null;
}

function absolutizeApinfoUrl(href: string): string {
  try {
    return new URL(href, 'https://www.apinfo.com').toString();
  } catch {
    return href;
  }
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

/**
 * Stable hash helper kept for tests / future detail enrichment.
 */
export function hashApinfoExternalId(codvaga: string): string {
  return createHash('sha256').update(`apinfo:${codvaga}`).digest('hex').slice(0, 32);
}
