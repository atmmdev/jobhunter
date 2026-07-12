import { createHash } from 'crypto';

/**
 * Builds a stable content hash for job deduplication.
 */
export function buildJobContentHash(input: {
  title: string;
  applyUrl: string;
  descriptionText: string;
  companyName?: string | null;
}): string {
  const normalized = [
    input.title.trim().toLowerCase(),
    input.applyUrl.trim().toLowerCase(),
    input.descriptionText.trim().toLowerCase(),
    (input.companyName ?? '').trim().toLowerCase(),
  ].join('|');

  return createHash('sha256').update(normalized).digest('hex');
}
