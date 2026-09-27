// Testes de unidade: validar-conteudo acusa unicórnio que o jogo nunca dá. P.concluirSala só acha o comum/raro com
// `sala` = uma sala feita, o treino só dá o épico com treino 'ouro' ou 'perfeito', e a persistência só olha raro/épico:
// o resto ficaria no álbum para sempre como "falta ganhar" (o álbum nunca fecha).
// A matéria plantada vai numa pasta em /tmp/reino-testes/ (--materia); o jogo de verdade não muda.
// Rodar (em jogo/): node --test ferramentas/testes/unidade/validar-conteudo-unicornios.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const Jogo = require('../../jogo-no-node');
const { PASTA_TESTES } = require('../guardas');

const jogo = Jogo.raiz;
fs.mkdirSync(PASTA_TESTES, { recursive: true });
const tmp = fs.mkdtempSync(path.join(PASTA_TESTES, 'validar-uni-'));
const validar = (args) => { const r = spawnSync(process.execPath, ['ferramentas/validar/validar-conteudo.js'].concat(args), { cwd: jogo, encoding: 'utf8' }); return { status: r.status, saida: r.stdout + r.stderr }; };
// historia.js com um unicórnio a mais, numa pasta própria por caso
function plantada(n, uni) {
  const pasta = path.join(tmp, String(n), 'historia');
  fs.mkdirSync(pasta, { recursive: true });
  const arq = path.join(pasta, 'historia.js');
  const t = fs.readFileSync(path.join(jogo, 'js/conteudo/materias/historia/historia.js'), 'utf8');
  assert.ok(t.includes('  unicornios: [\n'), 'âncora sumiu de historia.js (atualize o teste)');
  fs.writeFileSync(arq, t.replace('  unicornios: [\n', '  unicornios: [\n    ' + uni + '\n'));
  return arq;
}
const CORES = "cores: { corpo: '#fffaf0', crina: ['#6fa8ff', '#ff6b8a', '#ffffff'], chifre: '#ffcf5c' }, frase: 'Oi, eu sou do teste plantado!'";

test('validar-conteudo: o jogo de hoje passa', () => {
  const r = validar([]);
  assert.strictEqual(r.status, 0, r.saida);
});
const CASOS = {
  'comum de sala que não existe': `{ id: 'h-zz1', nome: 'Zezinho', raridade: 'comum', sala: 'h9', ${CORES} },`,
  'raro de sala que não existe': `{ id: 'h-zz2', nome: 'Zezinho', raridade: 'raro', sala: 'h9', ${CORES} },`,
  'raridade desconhecida': `{ id: 'h-zz3', nome: 'Zezinho', raridade: 'rara', sala: 'h1', ${CORES} },`,
  'épico de treino desconhecido': `{ id: 'h-zz4', nome: 'Zezinho', raridade: 'epico', treino: 'prata', ${CORES} },`,
};
Object.entries(CASOS).forEach(([caso, uni], n) => {
  test(`validar-conteudo: unicórnio que nunca nasce (${caso}) é acusado`, () => {
    const r = validar(['--materia', plantada(n, uni)]);
    assert.strictEqual(r.status, 1, r.saida);
    assert.match(r.saida, /h-zz/);
  });
});
