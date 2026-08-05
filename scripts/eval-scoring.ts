import { scoreJobAgainstStacks } from '@/modules/domain/scoring/score-job.policy';

const FIXTURES = [
  {
    name: 'react role prefers JS_TS',
    title: 'Senior React Engineer',
    descriptionText: 'Build Next.js apps with TypeScript and Node.js',
    isRemote: true,
    stacks: ['JS_TS', 'DOTNET', 'PHP'] as const,
    expectStack: 'JS_TS',
    minScore: 40,
  },
  {
    name: 'dotnet role prefers DOTNET',
    title: 'Backend C# Developer',
    descriptionText: 'ASP.NET Core and Entity Framework with SQL Server',
    isRemote: false,
    stacks: ['JS_TS', 'DOTNET', 'PHP'] as const,
    expectStack: 'DOTNET',
    minScore: 30,
  },
];

/**
 * Offline scoring evaluation harness for deterministic policy quality.
 */
function main() {
  let failed = 0;
  for (const fixture of FIXTURES) {
    const result = scoreJobAgainstStacks({
      title: fixture.title,
      descriptionText: fixture.descriptionText,
      isRemote: fixture.isRemote,
      availableStacks: [...fixture.stacks],
    });
    const ok =
      result.recommendedStack === fixture.expectStack && result.score >= fixture.minScore;
    console.log(
      `${ok ? 'PASS' : 'FAIL'} ${fixture.name}: stack=${result.recommendedStack} score=${result.score}`,
    );
    if (!ok) {
      failed += 1;
    }
  }
  if (failed > 0) {
    process.exitCode = 1;
  }
}

main();
