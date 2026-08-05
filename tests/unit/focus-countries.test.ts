import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  FOCUS_COUNTRIES,
  countryCodeToFlagEmoji,
  countryNameAliases,
  groupFocusCountriesByRegion,
  localizeCountryName,
} from '@/modules/domain/analytics/focus-countries';

describe('focus countries', () => {
  it('includes Brazil in South America', () => {
    const brazil = FOCUS_COUNTRIES.find((country) => country.code === 'BR');
    assert.ok(brazil);
    assert.equal(brazil.region, 'southAmerica');
  });

  it('groups regions with at least one country each', () => {
    const groups = groupFocusCountriesByRegion();
    assert.ok(groups.length >= 6);
    assert.ok(groups.every((group) => group.countries.length > 0));
    assert.ok(groups.some((group) => group.region === 'southAmerica'));
  });

  it('builds flag emoji from ISO code', () => {
    assert.equal(countryCodeToFlagEmoji('BR'), '🇧🇷');
    assert.equal(countryCodeToFlagEmoji('jp'), '🇯🇵');
    assert.equal(countryCodeToFlagEmoji('X'), '');
  });

  it('localizes and aliases Brazil', () => {
    assert.match(localizeCountryName('BR', 'pt-BR'), /Brasil/i);
    assert.match(localizeCountryName('BR', 'en'), /Brazil/i);
    assert.ok(countryNameAliases('BR').includes('Brasil'));
  });
});
