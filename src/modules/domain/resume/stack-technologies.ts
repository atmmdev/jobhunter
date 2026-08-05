import type { ResumeStackValue } from '@/modules/domain/resume/resume.entity';

/**
 * Display labels for the main technologies of each resume stack.
 * Mirrors the scoring keywords but deduplicated and human-readable.
 */
const STACK_TECHNOLOGIES: Record<ResumeStackValue, readonly string[]> = {
  JS_TS: [
    'TypeScript',
    'JavaScript',
    'React',
    'Next.js',
    'Node.js',
    'GraphQL',
    'Prisma',
    'Tailwind',
  ],
  DOTNET: ['C#', '.NET', 'ASP.NET', 'Entity Framework', 'SQL Server', 'Blazor'],
  PHP: ['PHP', 'Laravel', 'WordPress', 'WooCommerce', 'Composer', 'Blade'],
  OTHER: [],
};

/**
 * Returns the main-stack technologies for the given resume stacks,
 * deduplicated and ordered by stack declaration order.
 */
export function listStackTechnologies(stacks: readonly ResumeStackValue[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const stack of stacks) {
    for (const technology of STACK_TECHNOLOGIES[stack]) {
      const key = technology.toLowerCase();
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      result.push(technology);
    }
  }

  return result;
}
