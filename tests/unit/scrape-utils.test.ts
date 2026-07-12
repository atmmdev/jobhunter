import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  extractAshbyBoard,
  extractGreenhouseBoardToken,
  extractGupySubdomain,
  extractLeverSite,
} from '../../src/modules/infrastructure/scrapers/extract-board-token';
import { stripHtml } from '../../src/modules/infrastructure/scrapers/strip-html';

describe('extract board tokens', () => {
  it('extracts Greenhouse board token', () => {
    assert.equal(
      extractGreenhouseBoardToken('https://boards.greenhouse.io/acme'),
      'acme',
    );
    assert.equal(
      extractGreenhouseBoardToken('https://job-boards.greenhouse.io/stripe'),
      'stripe',
    );
  });

  it('extracts Lever site', () => {
    assert.equal(extractLeverSite('https://jobs.lever.co/netflix'), 'netflix');
  });

  it('extracts Ashby board', () => {
    assert.equal(extractAshbyBoard('https://jobs.ashbyhq.com/notion'), 'notion');
  });

  it('extracts Gupy subdomain', () => {
    assert.equal(extractGupySubdomain('https://ambev.gupy.io/'), 'ambev');
    assert.equal(
      extractGupySubdomain('https://career.gupy.io/companies/ambev/jobs'),
      'ambev',
    );
    assert.equal(extractGupySubdomain('https://portal.gupy.io/'), null);
  });
});

describe('stripHtml', () => {
  it('removes tags and decodes entities', () => {
    assert.equal(stripHtml('<p>Hello&nbsp;<b>world</b>&amp;co</p>'), 'Hello world &co');
  });
});
