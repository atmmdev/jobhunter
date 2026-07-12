import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { extractApinfoJobs } from '../../src/modules/infrastructure/scrapers/extract-apinfo-jobs';
import { readResponseText } from '../../src/modules/infrastructure/scrapers/read-response-text';

describe('readResponseText', () => {
  it('decodes windows-1252 bodies when no charset is declared', async () => {
    const body = Buffer.from('Programador S\xEAnior. Po\xE1 - SP', 'binary');
    const response = new Response(body, {
      headers: { 'Content-Type': 'text/html' },
    });

    const text = await readResponseText(response, 'windows-1252');
    assert.match(text, /Programador Sênior/);
    assert.match(text, /Poá - SP/);
  });

  it('honors charset from the Content-Type header', async () => {
    const body = Buffer.from('Programador S\xEAnior', 'binary');
    const response = new Response(body, {
      headers: { 'Content-Type': 'text/html; charset=windows-1252' },
    });

    const text = await readResponseText(response);
    assert.match(text, /Programador Sênior/);
  });
});

describe('extractApinfoJobs encoding', () => {
  it('parses titles with latin accents after windows-1252 decode', () => {
    const html = Buffer.from(
      `
      <div class="bloco-vaga-unica half-bottom">
        <div class="nome-vaga"><a href="https://www.apinfo.com/apinfo/inc/list44.cfm?codvaga=85516&k=abc">Programador S\xEAnior</a></div>
        <div class="data">Po\xE1 - SP</div>
        <div class="empresa">TMKT Servi\xE7os</div>
        <footer class="rodape-vr"></footer>
      </div>
    `,
      'binary',
    ).toString('binary');

    const decoded = new TextDecoder('windows-1252').decode(
      Uint8Array.from(html, (char) => char.charCodeAt(0)),
    );
    const jobs = extractApinfoJobs(decoded);

    assert.equal(jobs[0]?.title, 'Programador Sênior');
    assert.equal(jobs[0]?.location, 'Poá - SP');
    assert.equal(jobs[0]?.companyName, 'TMKT Serviços');
  });
});
