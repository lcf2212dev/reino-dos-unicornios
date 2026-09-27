// e2e --podar (e2e-disco.js planoPoda): a cache de referências do harness da MAIN nunca é podada.
// Bug da auditoria: o harness da main era uma constante (HARNESS_MAIN = '83b7a60d') que ficou velha; a poda feita
// numa worktree com o harness mudado apagava a cache da main (e a de um e2e da main comparando naquela hora).
// O harness da main aqui é calculado à parte (o mesmo hashHarness() do e2e.js sobre `git show main:<arquivo>`).
// Uso: node --test jogo/ferramentas/testes/unidade/e2e-disco-harness-main.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const { PASTA_TESTES } = require('../guardas');
const { planoPoda } = require('../e2e-disco');

const REPO = path.resolve(__dirname, '..', '..', '..', '..');
function harnessDaMain() {
  const h = crypto.createHash('sha256');
  ['referencias.js', 'referencias-pagina.js', 'referencias-cenas.js', 'referencias-dados.js', 'saves.js', 'navegador.js'].forEach((f) => {
    h.update(f + '\0');
    h.update(execFileSync('git', ['-C', REPO, 'show', `main:jogo/ferramentas/testes/${f}`]));
  });
  return h.digest('hex').slice(0, 8);
}

test('poda numa worktree de harness diferente não apaga a cache do harness da main', () => {
  const main = harnessDaMain();
  fs.mkdirSync(PASTA_TESTES, { recursive: true });
  const pasta = fs.mkdtempSync(path.join(PASTA_TESTES, 'e2e-disco-main-'));
  fs.mkdirSync(path.join(pasta, 'ref-9040d16', `dados-vozes-h${main}`), { recursive: true });
  fs.mkdirSync(path.join(pasta, 'ref-9040d16', 'dados-vozes-hffffffff'), { recursive: true });
  fs.mkdirSync(path.join(pasta, 'ref-9040d16', 'dados-vozes-h00000000'), { recursive: true });
  const plano = planoPoda(pasta, { harness: 'ffffffff' }).map((x) => path.basename(x.caminho));
  assert.ok(!plano.includes(`dados-vozes-h${main}`), `apagaria a cache da main (h${main}): ${plano.join(', ')}`);
  assert.deepStrictEqual(plano, ['dados-vozes-h00000000']);
});
