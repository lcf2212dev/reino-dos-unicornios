// Área útil (arte.md §18, ui/hud.js): as variáveis do :root batem com os retângulos do HUD e do dock, nos 3 tamanhos
// e com Letras grandes; a câmera (motor/camera.js) só as lê. Servidor e banco de TESTE (cenario.js); save sintético.
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('../cenario');

const MEDIR = `(function () {
  Reino.UI.medirAreaUtil();
  var s = document.documentElement.style, vw = innerWidth, vh = innerHeight;
  function v(n) { return parseFloat(s.getPropertyValue(n)); }
  function cx(sel) { return [].map.call(document.querySelectorAll(sel), function (e) { return e.getBoundingClientRect(); })
    .filter(function (b) { return b.bottom > b.top; }); }
  var esq = cx('#hud .hud-esq > *'), dir = cx('#hud .chip-montaria, #hud .hud-botoes > *'), dock = cx('#hud .dock')[0];
  function max(l, f) { return Math.ceil(Math.max.apply(null, l.map(f))); }
  return {
    vars: { topo: v('--hud-topo'), dock: v('--dock-altura'), esqF: v('--hud-esq-fundo'), esqL: v('--hud-esq-largura'), dirF: v('--hud-dir-fundo'), dirL: v('--hud-dir-largura') },
    reais: { topo: Math.max(max(esq, function (b) { return b.bottom; }), max(dir, function (b) { return b.bottom; })),
      dock: dock ? Math.ceil(vh - dock.top) : 0, esqF: max(esq, function (b) { return b.bottom; }), esqL: max(esq, function (b) { return b.right; }),
      dirF: max(dir, function (b) { return b.bottom; }), dirL: max(dir, function (b) { return vw - b.left; }) },
  };
})()`;

for (const tamanho of ['celular', 'tablet', 'notebook']) {
  for (const grande of [false, true]) {
    test(`área útil: variáveis = retângulos do HUD e do dock (${tamanho}${grande ? ', letras grandes' : ''})`, async () => {
      const c = await abrirCenario({ tamanho, save: 'completo', ajustes: grande ? { texto: 1.15 } : undefined,
        pasta: `/tmp/reino-testes/ver/teste-area-util-${tamanho}${grande ? '-g' : ''}` });
      try {
        await c.avancar(600);
        const m = await c.js(MEDIR);
        assert.deepStrictEqual(m.vars, m.reais);
        assert.ok(m.vars.topo > 0, 'HUD medido');
        assert.strictEqual(m.vars.dock, 0, 'sem menu inferior, toda a base fica livre');
        // no celular a fileira ⛶ 📷 🖼 fica embaixo do cartão: o fundo da direita a conta
        if (tamanho === 'celular') assert.ok(await c.js("document.querySelector('#hud .btn-foto').getBoundingClientRect().bottom <= parseFloat(document.documentElement.style.getPropertyValue('--hud-dir-fundo'))"));
      } finally { await c.fechar(); }
    });
  }
}

test('a câmera não mede o HUD nem o dock (só lê as variáveis)', () => {
  const src = fs.readFileSync(path.join(__dirname, '../../../js/motor/camera.js'), 'utf8');
  assert.ok(!/getBoundingClientRect/.test(src));
  assert.ok(/--hud-topo/.test(src) && /--dock-altura/.test(src));
});
