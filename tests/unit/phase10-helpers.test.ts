import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  isNearDuplicate,
  jaccardSimilarity,
} from '../../src/modules/domain/scoring/semantic-dedupe.policy';
import { PreferenceLearningService } from '../../src/modules/application/scoring/preference-learning.service';

describe('semantic dedupe', () => {
  it('scores identical texts highly', () => {
    const text = 'Senior React Engineer remote TypeScript Next.js';
    assert.ok(jaccardSimilarity(text, text) > 0.9);
    assert.equal(isNearDuplicate(text, text), true);
  });

  it('scores unrelated texts low', () => {
    assert.ok(
      jaccardSimilarity('React frontend engineer', 'Nurse night shift hospital') < 0.2,
    );
  });
});

describe('PreferenceLearningService.adjustScore', () => {
  it('boosts favored keywords and penalizes rejected ones', () => {
    const service = new PreferenceLearningService();
    const adjusted = service.adjustScore(70, 'Looking for React and TypeScript', {
      favoredKeywords: ['react', 'typescript'],
      rejectedKeywords: ['php'],
    });
    assert.equal(adjusted.score, 74);
    assert.equal(adjusted.delta, 4);
  });
});
