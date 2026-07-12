import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { extractTechnologies } from '../../src/modules/domain/enrichment/extract-technologies.policy';
import { extractSalary } from '../../src/modules/domain/enrichment/extract-salary.policy';

describe('extractTechnologies', () => {
  it('finds React and TypeScript keywords', () => {
    const techs = extractTechnologies({
      title: 'Senior React Engineer',
      descriptionText: 'Strong TypeScript and Node.js experience required.',
    });

    const names = techs.map((tech) => tech.name);
    assert.ok(names.includes('React'));
    assert.ok(names.includes('TypeScript'));
    assert.ok(names.includes('Node.js'));
  });
});

describe('extractSalary', () => {
  it('parses USD salary ranges', () => {
    const salary = extractSalary({
      title: 'Backend Engineer',
      descriptionText: 'Compensation: $120,000 - $150,000 USD per year.',
    });

    assert.equal(salary.currency, 'USD');
    assert.equal(salary.min, 120000);
    assert.equal(salary.max, 150000);
  });

  it('parses BRL ranges', () => {
    const salary = extractSalary({
      title: 'Dev',
      descriptionText: 'Salário R$ 12.000 - R$ 18.000',
      salaryRaw: null,
    });

    assert.equal(salary.currency, 'BRL');
    assert.ok((salary.min ?? 0) >= 12000);
  });
});
