import type { ResumeStackValue } from '@/modules/domain/resume/resume.entity';

const STACK_KEYWORDS: Record<ResumeStackValue, string[]> = {
  JS_TS: [
    'react',
    'next.js',
    'nextjs',
    'typescript',
    'javascript',
    'node.js',
    'nodejs',
    'node',
    'tailwind',
    'graphql',
    'prisma',
  ],
  DOTNET: [
    'c#',
    '.net',
    'dotnet',
    'asp.net',
    'aspnet',
    'entity framework',
    'sql server',
    'blazor',
  ],
  PHP: ['php', 'laravel', 'wordpress', 'woocommerce', 'composer', 'blade'],
  OTHER: [],
};

export interface ScoreBreakdown {
  technologyOverlap: number;
  remoteBonus: number;
  keywordHits: string[];
  recommendedStack: ResumeStackValue | null;
}

export interface DeterministicScoreResult {
  score: number;
  breakdown: ScoreBreakdown;
  recommendedStack: ResumeStackValue | null;
  explanation: string;
}

/**
 * Pure domain scoring policy based on keyword overlap with resume stacks.
 */
export function scoreJobAgainstStacks(input: {
  title: string;
  descriptionText: string;
  isRemote: boolean | null;
  availableStacks: ResumeStackValue[];
}): DeterministicScoreResult {
  const haystack = `${input.title}\n${input.descriptionText}`.toLowerCase();
  const stackScores: Array<{
    stack: ResumeStackValue;
    overlap: number;
    hits: string[];
  }> = [];

  for (const stack of input.availableStacks) {
    const keywords = STACK_KEYWORDS[stack];
    const hits = keywords.filter((keyword) => haystack.includes(keyword));
    const overlap =
      keywords.length === 0 ? 0 : Math.round((hits.length / keywords.length) * 100);
    stackScores.push({ stack, overlap, hits });
  }

  stackScores.sort((a, b) => b.overlap - a.overlap);
  const best = stackScores[0];
  const technologyOverlap = best?.overlap ?? 0;
  const remoteBonus = input.isRemote ? 8 : 0;
  const score = Math.min(100, technologyOverlap + remoteBonus);
  const recommendedStack = best && best.overlap > 0 ? best.stack : null;

  return {
    score,
    breakdown: {
      technologyOverlap,
      remoteBonus,
      keywordHits: best?.hits ?? [],
      recommendedStack,
    },
    recommendedStack,
    explanation: recommendedStack
      ? `Best stack fit: ${recommendedStack} (${technologyOverlap}% keyword overlap${remoteBonus ? ', remote bonus' : ''}).`
      : 'No strong stack keyword overlap found.',
  };
}
