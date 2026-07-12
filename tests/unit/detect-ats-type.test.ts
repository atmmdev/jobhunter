import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { detectAtsType } from '../../src/modules/infrastructure/ats/detect-ats-type';

describe('detectAtsType', () => {
  it('detects Greenhouse boards', () => {
    assert.equal(detectAtsType('https://boards.greenhouse.io/acme'), 'GREENHOUSE');
  });

  it('detects Lever boards', () => {
    assert.equal(detectAtsType('https://jobs.lever.co/acme'), 'LEVER');
  });

  it('detects Gupy', () => {
    assert.equal(detectAtsType('https://acme.gupy.io'), 'GUPY');
  });

  it('detects Workday', () => {
    assert.equal(detectAtsType('https://acme.wd1.myworkdayjobs.com/Careers'), 'WORKDAY');
  });

  it('detects Ashby boards', () => {
    assert.equal(detectAtsType('https://jobs.ashbyhq.com/notion'), 'ASHBY');
  });

  it('detects Apinfo', () => {
    assert.equal(detectAtsType('http://www.apinfo.com/apinfo'), 'APINFO');
  });

  it('returns CUSTOM for unknown careers sites', () => {
    assert.equal(detectAtsType('https://careers.example.com/jobs'), 'CUSTOM');
  });

  it('returns UNKNOWN for invalid URLs', () => {
    assert.equal(detectAtsType(':::'), 'UNKNOWN');
  });
});
