import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  extractGreenhouseBoardToken,
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
});

describe('stripHtml', () => {
  it('removes tags and decodes entities', () => {
    assert.equal(stripHtml('<p>Hello&nbsp;<b>world</b>&amp;co</p>'), 'Hello world &co');
  });
});
