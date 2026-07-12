import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { extractApinfoJobs } from '../../src/modules/infrastructure/scrapers/extract-apinfo-jobs';

describe('extractApinfoJobs', () => {
  it('parses recent job cards with codvaga links', () => {
    const html = `
      <section id="vagas-recentes">
        <div class="bloco-vaga-unica half-bottom">
          <div class="nome-vaga">
            <a href="https://www.apinfo.com/apinfo/inc/list44.cfm?codvaga=85516&k=abc">Programador Sênior</a>
          </div>
          <div class="data">Poá - SP</div>
          <div class="empresa">TMKT Serviços</div>
          <footer class="rodape-vr"></footer>
        </div>
        <div class="bloco-vaga-unica half-bottom">
          <div class="nome-vaga">
            <a href="/apinfo/inc/list44.cfm?codvaga=85494&k=xyz">Engenheiro de dados Senior</a>
          </div>
          <div class="data">Home Office - HO</div>
          <div class="empresa">Ewave do Brasil</div>
          <footer class="rodape-vr"></footer>
        </div>
      </section>
    `;

    const jobs = extractApinfoJobs(html);
    assert.equal(jobs.length, 2);
    assert.equal(jobs[0]?.externalId, '85516');
    assert.equal(jobs[0]?.title, 'Programador Sênior');
    assert.equal(jobs[0]?.companyName, 'TMKT Serviços');
    assert.equal(jobs[0]?.location, 'Poá - SP');
    assert.equal(jobs[1]?.isRemote, true);
    assert.match(jobs[1]?.applyUrl ?? '', /codvaga=85494/);
  });

  it('ignores CV highlight cards without list44 links', () => {
    const html = `
      <div class="bloco-vaga-unica half-bottom">
        <div class="nome-vaga">
          <a href="https://www.apinfo2.com/apinfo/inc/pesq9adesta.cfm?pkey=abc">Consultor ERP</a>
        </div>
        <div class="data">Praia Grande - SP</div>
        <div class="empresa">BRUNO</div>
        <footer class="rodape-vr"></footer>
      </div>
    `;

    assert.equal(extractApinfoJobs(html).length, 0);
  });
});
