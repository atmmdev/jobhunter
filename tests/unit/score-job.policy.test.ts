import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { scoreJobAgainstStacks } from '../../src/modules/domain/scoring/score-job.policy';

describe('scoreJobAgainstStacks', () => {
  it('recommends JS_TS for React/TypeScript roles', () => {
    const result = scoreJobAgainstStacks({
      title: 'Senior React Engineer',
      descriptionText: 'Build apps with React, Next.js, TypeScript and Node.js.',
      isRemote: true,
      availableStacks: ['JS_TS', 'DOTNET', 'PHP'],
    });

    assert.equal(result.recommendedStack, 'JS_TS');
    assert.ok(result.score >= 30);
    assert.equal(result.breakdown.remoteBonus, 8);
    assert.ok(result.breakdown.keywordHits.includes('react'));
  });

  it('recommends DOTNET for C# ASP.NET roles', () => {
    const result = scoreJobAgainstStacks({
      title: 'Backend Developer',
      descriptionText: 'Experience with C#, ASP.NET Core and Entity Framework.',
      isRemote: false,
      availableStacks: ['JS_TS', 'DOTNET', 'PHP'],
    });

    assert.equal(result.recommendedStack, 'DOTNET');
    assert.equal(result.breakdown.remoteBonus, 0);
  });

  it('returns no recommendation when keywords do not match', () => {
    const result = scoreJobAgainstStacks({
      title: 'Marketing Manager',
      descriptionText: 'Lead brand campaigns and social media.',
      isRemote: false,
      availableStacks: ['JS_TS', 'DOTNET', 'PHP'],
    });

    assert.equal(result.recommendedStack, null);
    assert.equal(result.score, 0);
  });
});
