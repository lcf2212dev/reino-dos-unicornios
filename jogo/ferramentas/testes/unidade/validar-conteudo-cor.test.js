// Testes de unidade: validar-conteudo confere a cor de cada matéria (`cor`) contra a tabela do docs/contratos/ui.md
// §10.22: sem cor, cor fora da tabela e cor de outra matéria (repetida) são erro.
// A matéria plantada vai numa pasta em /tmp/reino-testes/ (--materia); o jogo de verdade não muda.
// Rodar (em jogo/): node --test ferramentas/testes/unidade/validar-conteudo-cor.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const Jogo = require('../../jogo-no-node');
const { PASTA_TESTES } = require('../guardas');

const jogo = Jogo.raiz;
fs.mkdirSync(PASTA_TESTES, { recursive: true });
const tmp = fs.mkdtempSync(path.join(PASTA_TESTES, 'validar-cor-'));
const validar = (args) => { const r = spawnSync(process.execPath, ['ferramentas/validar/validar-conteudo.js'].concat(args), { cwd: jogo, encoding: 'utf8' }); return { status: r.status, saida: r.stdout + r.stderr }; };
const ANCORA = "  cor: '#e0a020',";
// ingles.js com a linha da cor trocada, numa pasta própria por caso
function plantada(n, linha) {
  const pasta = path.join(tmp, String(n), 'ingles');
  fs.mkdirSync(pasta, { recursive: true });
  const arq = path.join(pasta, 'ingles.js');
  const t = fs.readFileSync(path.join(jogo, 'js/conteudo/materias/ingles/ingles.js'), 'utf8');
  assert.ok(t.includes(ANCORA), 'âncora sumiu de ingles.js (atualize o teste)');
  fs.writeFileSync(arq, t.replace(ANCORA, linha));
  return arq;
}

test('validar-conteudo: as 6 cores de hoje são as do ui.md §10.22', () => {
  const r = validar([]);
  assert.strictEqual(r.status, 0, r.saida);
});
const CASOS = {
  'sem cor': ['', /ingles: sem cor da matéria/],
  'cor fora da tabela': ["  cor: '#e0a021',", /ingles: cor #e0a021, mas o ui.md §10\.22 diz #e0a020/],
  'cor de outra matéria': ["  cor: '#3f7fe0',", /cor #3f7fe0 repetida/],
  'maiúscula': ["  cor: '#E0A020',", /ingles: sem cor da matéria/],
};
Object.entries(CASOS).forEach(([caso, [linha, erro]], n) => {
  test('validar-conteudo acusa: ' + caso, () => {
    const r = validar(['--materia', plantada(n, linha)]);
    assert.strictEqual(r.status, 1, r.saida);
    assert.match(r.saida, erro);
  });
});
