// Testes de unidade: o confete (ui/pecas.js) anda pelo tempo, não pelo quadro (D9-02). Carrega só ui/pecas.js
// num vm, com o Reino de mentira. Rodar: node --test jogo/ferramentas/testes/unidade/confete.test.js
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function montar() {
  const ctx = { Math, console, Reino: { util: { el: () => ({}) }, Progresso: {}, UI: {}, _ui: { est: () => ({ ajustes: {} }) } } };
  ctx.window = ctx;
  vm.createContext(ctx);
  const arq = path.join(__dirname, '../../../js/ui/pecas.js');
  vm.runInContext(fs.readFileSync(arq, 'utf8'), ctx, { filename: arq });
  return ctx.Reino.UI.confete;
}
// sorteio repetível (o mesmo confete nas duas rodadas)
function sorte(semente) { let s = semente; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; }
// roda o laço do confete com quadros de `ms` e devolve quando a última peça passou da borda (e a contagem visível)
function rodar(C, ms, h) {
  const ps = C.criar(90, 390, h, sorte(7));
  const vis = [];
  for (let t = 0; t < 10; t += ms / 1000) {
    const n = C.mover(ps, t, h);
    vis.push([t, n.visiveis]);
    if (!n.vivas) return { fim: t, vis };
  }
  return { fim: Infinity, vis };
}

test('confete: o mesmo tempo total com quadros de 8 ms e de 16 ms', () => {
  const C = montar();
  const a = rodar(C, 8, 844), b = rodar(C, 16, 844);
  assert.ok(Number.isFinite(a.fim) && Number.isFinite(b.fim), 'termina');
  assert.ok(Math.abs(a.fim - b.fim) <= 0.016 + 1e-9, `8 ms: ${a.fim.toFixed(3)} s, 16 ms: ${b.fim.toFixed(3)} s`);
  assert.ok(a.fim > 2.5 && a.fim < 3.6, `dura uns 3 s (${a.fim.toFixed(2)} s)`);
});

test('confete: já tem peça no 1º quadro, enche até ~1,3 s e esvazia até 2,5 s', () => {
  const C = montar();
  const { vis } = rodar(C, 16, 844);
  const em = (s) => vis.find(([t]) => t >= s)[1];
  assert.ok(vis[0][1] > 0, 'confete no 1º quadro');
  assert.ok(em(0.1) < em(0.7) && em(0.7) < em(1.3), 'cresce até 1,3 s');
  assert.ok(em(1.3) > em(2.0) && em(2.0) > em(2.5), 'cai de 1,3 a 2,5 s');
});
