import { prisma } from '@/modules/infrastructure/prisma/client';

export interface PreferenceSignals {
  favoredKeywords: string[];
  rejectedKeywords: string[];
}

const STOP = new Set([
  'and',
  'the',
  'for',
  'with',
  'from',
  'that',
  'this',
  'your',
  'you',
  'are',
  'our',
  'job',
  'role',
  'team',
  'work',
  'will',
  'have',
  'experience',
  'years',
  'para',
  'com',
  'uma',
  'vaga',
  'anos',
]);

/**
 * Learns lightweight keyword preferences from favorited vs rejected jobs.
 */
export class PreferenceLearningService {
  async getSignals(userId: string): Promise<PreferenceSignals> {
    const [favored, rejected] = await Promise.all([
      prisma.job.findMany({
        where: {
          status: 'FAVORITED',
          OR: [
            { scores: { some: { userId } } },
            { applications: { some: { userId } } },
          ],
        },
        select: { title: true, descriptionText: true },
        take: 40,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.job.findMany({
        where: { status: 'REJECTED' },
        select: { title: true, descriptionText: true },
        take: 40,
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    // Favorites without scores/applications still count globally for single-user MVP.
    const favoredFallback =
      favored.length > 0
        ? favored
        : await prisma.job.findMany({
            where: { status: 'FAVORITED' },
            select: { title: true, descriptionText: true },
            take: 40,
            orderBy: { updatedAt: 'desc' },
          });

    return {
      favoredKeywords: topKeywords(favoredFallback, 12),
      rejectedKeywords: topKeywords(rejected, 12),
    };
  }

  /**
   * Applies preference boosts/penalties to a base score (0-100).
   */
  adjustScore(
    baseScore: number,
    haystack: string,
    signals: PreferenceSignals,
  ): { score: number; delta: number; hits: string[] } {
    const text = haystack.toLowerCase();
    const favorHits = signals.favoredKeywords.filter((keyword) => text.includes(keyword));
    const rejectHits = signals.rejectedKeywords.filter((keyword) => text.includes(keyword));
    const delta = Math.min(12, favorHits.length * 2) - Math.min(12, rejectHits.length * 2);
    return {
      score: Math.max(0, Math.min(100, baseScore + delta)),
      delta,
      hits: [...favorHits.map((hit) => `+${hit}`), ...rejectHits.map((hit) => `-${hit}`)],
    };
  }
}

function topKeywords(
  jobs: Array<{ title: string; descriptionText: string }>,
  limit: number,
): string[] {
  const counts = new Map<string, number>();
  for (const job of jobs) {
    const tokens = `${job.title} ${job.descriptionText}`
      .toLowerCase()
      .split(/[^a-z0-9+#.]+/i)
      .filter((token) => token.length >= 3 && token.length <= 24 && !STOP.has(token));
    for (const token of new Set(tokens.slice(0, 80))) {
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([token]) => token);
}
