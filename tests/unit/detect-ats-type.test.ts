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
    assert.equal(
      detectAtsType('https://nvidia.wd5.myworkdayjobs.com/en-US/NVIDIAExternalCareerSite'),
      'WORKDAY',
    );
  });

  it('detects Ashby boards', () => {
    assert.equal(detectAtsType('https://jobs.ashbyhq.com/notion'), 'ASHBY');
  });

  it('detects SmartRecruiters', () => {
    assert.equal(detectAtsType('https://jobs.smartrecruiters.com/Canva'), 'SMARTRECRUITERS');
  });

  it('detects BambooHR', () => {
    assert.equal(detectAtsType('https://g2.bamboohr.com/careers'), 'BAMBOOHR');
  });

  it('detects TeamTailor', () => {
    assert.equal(detectAtsType('https://bambuser.teamtailor.com/jobs'), 'TEAMTAILOR');
  });

  it('detects Personio', () => {
    assert.equal(detectAtsType('https://acme.jobs.personio.de/'), 'PERSONIO');
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
