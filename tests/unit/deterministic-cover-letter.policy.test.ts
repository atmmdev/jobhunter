import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildDeterministicCoverLetter } from '../../src/modules/domain/cover-letter/deterministic-cover-letter.policy';

describe('buildDeterministicCoverLetter', () => {
  it('writes an English letter with company and role', () => {
    const content = buildDeterministicCoverLetter({
      locale: 'en',
      candidateName: 'Alex',
      jobTitle: 'Senior React Engineer',
      companyName: 'Acme',
      resumeSummary: '10 years building React apps.',
      resumeExcerpt: 'React, TypeScript, Node.js',
    });

    assert.match(content, /Senior React Engineer/);
    assert.match(content, /Acme/);
    assert.match(content, /Alex/);
  });

  it('writes a Portuguese letter when locale is pt-BR', () => {
    const content = buildDeterministicCoverLetter({
      locale: 'pt-BR',
      candidateName: 'Alex',
      jobTitle: 'Desenvolvedor React',
      companyName: null,
      resumeSummary: 'Experiência com React e Node.',
      resumeExcerpt: 'React, Node.js',
    });

    assert.match(content, /Prezados/);
    assert.match(content, /Desenvolvedor React/);
    assert.match(content, /sua empresa/);
  });
});
