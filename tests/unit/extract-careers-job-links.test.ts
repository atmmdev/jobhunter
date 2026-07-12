import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { extractCareersJobLinks } from '../../src/modules/infrastructure/scrapers/extract-careers-job-links';

describe('extractCareersJobLinks', () => {
  it('extracts same-origin job links from careers HTML', () => {
    const html = `
      <html>
        <body>
          <a href="/careers/senior-react-engineer">Senior React Engineer</a>
          <a href="https://example.com/jobs/backend-developer">Backend Developer</a>
          <a href="https://other.com/jobs/ignore">Ignore external</a>
        </body>
      </html>
    `;

    const links = extractCareersJobLinks(html, 'https://example.com/careers');
    assert.equal(links.length, 2);
    assert.equal(links[0]?.title, 'Senior React Engineer');
    assert.match(links[0]?.applyUrl ?? '', /\/careers\/senior-react-engineer$/);
    assert.equal(links[1]?.title, 'Backend Developer');
  });

  it('ignores asset links and very short titles', () => {
    const html = `
      <a href="/jobs/lead-engineer">Lead Engineer</a>
      <a href="/assets/logo.png">Logo</a>
      <a href="/jobs/x">Go</a>
    `;

    const links = extractCareersJobLinks(html, 'https://acme.com/jobs');
    assert.equal(links.length, 1);
    assert.equal(links[0]?.title, 'Lead Engineer');
  });
});
