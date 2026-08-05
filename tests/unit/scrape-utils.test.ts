import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  extractAshbyBoard,
  extractBambooHrSubdomain,
  extractGreenhouseBoardToken,
  extractGupySubdomain,
  extractLeverSite,
  extractSmartRecruitersCompany,
  extractWorkdayBoard,
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

  it('extracts Workday board parts', () => {
    assert.deepEqual(
      extractWorkdayBoard(
        'https://nvidia.wd5.myworkdayjobs.com/en-US/NVIDIAExternalCareerSite',
      ),
      {
        host: 'nvidia.wd5.myworkdayjobs.com',
        tenant: 'nvidia',
        site: 'NVIDIAExternalCareerSite',
      },
    );
  });

  it('extracts SmartRecruiters company', () => {
    assert.equal(
      extractSmartRecruitersCompany('https://jobs.smartrecruiters.com/Canva'),
      'Canva',
    );
    assert.equal(
      extractSmartRecruitersCompany(
        'https://api.smartrecruiters.com/v1/companies/Visa/postings',
      ),
      'Visa',
    );
    assert.equal(
      extractSmartRecruitersCompany('https://jobs.smartrecruiters.com/external-referrals/x'),
      null,
    );
  });

  it('extracts BambooHR subdomain', () => {
    assert.equal(extractBambooHrSubdomain('https://g2.bamboohr.com/careers'), 'g2');
    assert.equal(extractBambooHrSubdomain('https://www.bamboohr.com/'), null);
  });
});

describe('stripHtml', () => {
  it('removes tags and decodes entities', () => {
    assert.equal(stripHtml('<p>Hello&nbsp;<b>world</b>&amp;co</p>'), 'Hello world &co');
  });
});
