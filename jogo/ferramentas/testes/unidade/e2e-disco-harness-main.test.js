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
const { planoPoda, arquivosHarness } = require('../e2e-disco');

const REPO = path.resolve(__dirname, '..', '..', '..', '..');
// a lista de arquivos sai da main (require a partir de referencias.js); a conta é feita aqui, à parte
function harnessDaMain() {
  // stderr calado, como o harnessMain() do e2e-disco.js (arquivo que a main ainda não tem: o git reclama à toa)
  const ler = (f) => execFileSync('git', ['-C', REPO, 'show', `main:jogo/ferramentas/testes/${f}`], { stdio: ['ignore', 'pipe', 'ignore'] });
  const h = crypto.createHash('sha256');
  arquivosHarness(ler).forEach((f) => { h.update(f + '\0'); h.update(ler(f)); });
  return h.digest('hex').slice(0, 8);
}

test('harness: tudo o que a captura carrega (servidor, guardas, vigias, saves), não a comparação', () => {
  const fs2 = require('fs');
  const l = arquivosHarness((f) => fs2.readFileSync(path.join(__dirname, '..', f)));
  ['referencias.js', 'referencias-pagina.js', 'referencias-cenas.js', 'referencias-dados.js', 'saves.js', 'navegador.js',
    'servidor-teste.js', 'guardas.js', 'vigia-memoria.js', 'vigia-pai.js'].forEach((f) => assert.ok(l.includes(f), f));
  assert.ok(!l.includes('referencias-comparar.js') && !l.includes('referencias-regioes.js'));
});

test('poda numa worktree de harness diferente não apaga a cache do harness da main', () => {
  const main = harnessDaMain();
  fs.mkdirSync(PASTA_TESTES, { recursive: true });
  const pasta = fs.mkdtempSync(path.join(PASTA_TESTES, 'e2e-disco-main-'));
  fs.mkdirSync(path.join(pasta, 'ref-9040d16', `dados-vozes-h${main}`), { recursive: true });
  fs.mkdirSync(path.join(pasta, 'ref-9040d16', 'dados-vozes-hffffffff'), { recursive: true });
  fs.mkdirSync(path.join(pasta, 'ref-9040d16', 'dados-vozes-h00000000'), { recursive: true });
  // idadeMs -1: pastas recém-criadas contam como paradas (a regra do uso recente tem teste próprio em e2e-disco.test.js)
  const plano = planoPoda(pasta, { harness: 'ffffffff', idadeMs: -1 }).map((x) => path.basename(x.caminho));
  assert.ok(!plano.includes(`dados-vozes-h${main}`), `apagaria a cache da main (h${main}): ${plano.join(', ')}`);
  assert.deepStrictEqual(plano, ['dados-vozes-h00000000']);
});

test('cache por conteúdo (cap-*): a captura do harness da main também nunca sai', () => {
  const main = harnessDaMain();
  const pasta = fs.mkdtempSync(path.join(PASTA_TESTES, 'e2e-disco-main-'));
  ['h' + main, 'hffffffff', 'h00000000'].forEach((h) => fs.mkdirSync(path.join(pasta, `cap-${h.slice(1)}00000000`, `dados-vozes-${h}-n12345678`), { recursive: true }));
  const plano = planoPoda(pasta, { harness: 'ffffffff', nav: '12345678', idadeMs: -1 }).map((x) => path.basename(x.caminho));
  assert.deepStrictEqual(plano, ['dados-vozes-h00000000-n12345678']);
});
