// Testes de unidade: validar-interiores acusa NPC em cima do spawn, do tapete de saída ou de escada. O NPC "fica
// sólido" (npcs-e-dialogo.md §2), mas a grade (interiores-grade.js) torna esses tiles andáveis DEPOIS dos NPCs: a
// Mariana nasceria/pisaria em cima dele. Objeto nesses tiles já era acusado; NPC passava.
// O NPC é plantado numa cópia do jogo em /tmp/reino-testes/ (o jogo de verdade não muda).
// Rodar (em jogo/): node --test ferramentas/testes/unidade/validar-interiores-npc.test.js   (tudo: npm test, na raiz)
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const Jogo = require('../../jogo-no-node');
const { PASTA_TESTES } = require('../guardas');

const jogo = Jogo.raiz;
fs.mkdirSync(PASTA_TESTES, { recursive: true });
const tmp = fs.mkdtempSync(path.join(PASTA_TESTES, 'validar-npc-'));
function copia(nome) {
  const destino = path.join(tmp, nome, 'jogo');
  const fora = [path.join(jogo, 'js', 'voz'), path.join(jogo, 'ferramentas', 'gerado')];
  ['js', 'ferramentas'].forEach((p) => fs.cpSync(path.join(jogo, p), path.join(destino, p), {
    recursive: true, force: true, filter: (src) => !fora.some((f) => src === f || src.startsWith(f + path.sep)),
  }));
  return destino;
}
const validar = (cwd) => { const r = spawnSync(process.execPath, ['ferramentas/validar/validar-interiores.js'], { cwd, encoding: 'utf8' }); return { status: r.status, saida: r.stdout + r.stderr }; };
// um NPC a mais num interior, no tile `onde` do próprio interior (spawn, saida) ou na 1ª escada do 2º andar do Observatório
function npcEm(onde, predio = 'petshop', arq = 'petshop/petshop.js', nome = onde) {
  const c = copia(nome);
  fs.appendFileSync(path.join(c, 'js/interiores', arq), `
(function () {
  var d = Reino.interiores.find(function (x) { return x.id === '${predio}'; });
  var t = d.${onde};
  d.npcs.push({ id: 'zz-plantado', nome: 'Zeca Plantado', voz: d.npcs[0].voz, sprite: { base: 'pessoa' },
    x: t.x, y: t.y, acao: { tipo: 'guia', lugar: d.lugar }, falas: {} });
  var g = Reino.Interiores.grade(d);
  console.log('grade: tile do NPC sólido? ' + g.solido[t.y][t.x]);
})();
`);
  return validar(c);
}

test('validar-interiores: a cópia sem mudança passa', () => {
  const r = validar(copia('limpa'));
  assert.strictEqual(r.status, 0, r.saida);
});
for (const onde of ['spawn', 'saida']) {
  test(`validar-interiores: NPC em cima do ${onde} é acusado`, () => {
    const r = npcEm(onde);
    assert.match(r.saida, /grade: tile do NPC sólido\? false/);   // o jogo deixa o tile do NPC andável
    assert.strictEqual(r.status, 1, r.saida);
    assert.match(r.saida, /zz-plantado/);
  });
}
test('validar-interiores: NPC em cima de escada é acusado', () => {
  const r = npcEm('escadas[0]', 'observatorio-2', 'observatorio/lab-andar3.js', 'escada');
  assert.match(r.saida, /grade: tile do NPC sólido\? false/);
  assert.strictEqual(r.status, 1, r.saida);
  assert.match(r.saida, /zz-plantado/);
});
