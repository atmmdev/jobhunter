import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { mkdtemp, readFile, rm } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';

import { materializeResumeFile } from '../../src/modules/infrastructure/apply/materialize-resume-file';
import { CredentialCrypto } from '../../src/modules/infrastructure/security/credential-crypto';
import { extractWorkdayBoard } from '../../src/modules/infrastructure/scrapers/extract-board-token';

describe('extractWorkdayBoard', () => {
  it('parses host, tenant, and site from myworkdayjobs URLs', () => {
    const board = extractWorkdayBoard(
      'https://nvidia.wd5.myworkdayjobs.com/en-US/NVIDIAExternalCareerSite',
    );
    assert.deepEqual(board, {
      host: 'nvidia.wd5.myworkdayjobs.com',
      tenant: 'nvidia',
      site: 'NVIDIAExternalCareerSite',
    });
  });

  it('returns null for non-workday URLs', () => {
    assert.equal(extractWorkdayBoard('https://boards.greenhouse.io/acme'), null);
  });
});

describe('materializeResumeFile', () => {
  it('writes contentText to a temp txt when no filePath exists', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'jh-resume-'));
    try {
      const filePath = await materializeResumeFile({
        resumeFilePath: null,
        resumeText: 'John Doe\nSenior Engineer with React and TypeScript experience.',
        artifactsDir: dir,
        preferredName: 'JS Resume',
      });
      assert.ok(filePath);
      const contents = await readFile(filePath!, 'utf8');
      assert.match(contents, /Senior Engineer/);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});

describe('CredentialCrypto', () => {
  it('round-trips plaintext with AES-256-GCM', () => {
    const key = 'a'.repeat(64);
    const crypto = new CredentialCrypto(key);
    const encrypted = crypto.encrypt('{"cookies":[]}');
    assert.ok(encrypted.ciphertext.length > 0);
    assert.equal(crypto.decrypt(encrypted), '{"cookies":[]}');
  });

  it('rejects invalid ENCRYPTION_KEY', () => {
    const crypto = new CredentialCrypto('short');
    assert.equal(crypto.isConfigured(), false);
    assert.throws(() => crypto.encrypt('x'));
  });
});
