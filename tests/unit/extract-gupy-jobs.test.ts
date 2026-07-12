import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { extractGupyJobsFromHtml } from '../../src/modules/infrastructure/scrapers/extract-gupy-jobs';

describe('extractGupyJobsFromHtml', () => {
  it('parses jobs from __NEXT_DATA__ listing payload', () => {
    const html = `
      <html><body>
      <script id="__NEXT_DATA__" type="application/json">${JSON.stringify({
        props: {
          pageProps: {
            subdomain: 'ambev',
            careerPage: { name: 'Ambev', subdomain: 'ambev' },
            jobs: [
              {
                id: 11548478,
                title: 'Desenvolvedor Full Stack',
                type: 'vacancy_type_effective',
                department: 'TECH',
                workplace: {
                  address: {
                    country: 'Brasil',
                    stateShortName: 'SP',
                    city: 'São Paulo',
                  },
                  workplaceType: 'remote',
                },
              },
            ],
          },
        },
      })}</script>
      </body></html>
    `;

    const jobs = extractGupyJobsFromHtml(html, 'ambev');
    assert.equal(jobs.length, 1);
    assert.equal(jobs[0]?.externalId, '11548478');
    assert.equal(jobs[0]?.title, 'Desenvolvedor Full Stack');
    assert.equal(jobs[0]?.companyName, 'Ambev');
    assert.equal(jobs[0]?.isRemote, true);
    assert.match(jobs[0]?.applyUrl ?? '', /ambev\.gupy\.io\/jobs\/11548478/);
    assert.match(jobs[0]?.location ?? '', /São Paulo/);
  });

  it('returns empty when __NEXT_DATA__ has no jobs', () => {
    const html = `
      <script id="__NEXT_DATA__" type="application/json">${JSON.stringify({
        props: { pageProps: { subdomain: 'stone', jobs: [] } },
      })}</script>
    `;
    assert.equal(extractGupyJobsFromHtml(html, 'stone').length, 0);
  });
});
