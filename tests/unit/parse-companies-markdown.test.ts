import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseCompaniesMarkdown } from '../../src/modules/infrastructure/companies/parse-companies-markdown';

describe('parseCompaniesMarkdown', () => {
  it('parses name/link rows and country from filename', () => {
    const markdown = `
| Name | Link |
| ---- | ---- |
| Acme | https://jobs.lever.co/acme |
| Beta | https://boards.greenhouse.io/beta |
| Skip | not-a-url |
`;

    const rows = parseCompaniesMarkdown(markdown, 'brazil.md');
    assert.equal(rows.length, 2);
    assert.deepEqual(
      {
        name: rows[0]?.name,
        link: rows[0]?.link,
        countryCode: rows[0]?.countryCode,
        fileName: rows[0]?.fileName,
      },
      {
        name: 'Acme',
        link: 'https://jobs.lever.co/acme',
        countryCode: 'BR',
        fileName: 'brazil.md',
      },
    );
    assert.equal(rows[1]?.name, 'Beta');
  });

  it('sets null country for worldwide.md', () => {
    const markdown = `
| Name | Link |
| --- | --- |
| Remote Co | https://example.com/careers |
`;
    const rows = parseCompaniesMarkdown(markdown, 'worldwide.md');
    assert.equal(rows[0]?.countryCode, null);
  });
});
