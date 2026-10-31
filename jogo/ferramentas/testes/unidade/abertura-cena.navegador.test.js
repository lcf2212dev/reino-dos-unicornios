// Cena da abertura (js/ui/abertura.js e abertura-desenho.js): em vários instantes t, nenhum unicórnio voando cobre a
// Mariana montada, o bloco do título (com a novidade) nem o botão, e dois voadores nunca se cruzam. Os de longe podem
// passar atrás dela (ela é desenhada na frente); os de perto, nunca na altura dela. Celular em pé e
// notebook (e o celular deitado). Lê as caixas por Reino._abertura.depurar (interno). Servidor e banco de TESTE novos (cenario.js); save
// sintético; modo congelado (a cena parada, as posições calculadas no instante pedido).
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('../cenario');
const { PASTA_TESTES } = require('../guardas');

const pasta = () => fs.mkdtempSync(path.join(PASTA_TESTES, 'abertura-cena-'));

const LER = `(() => {
  // a caixa que junta o elemento e os filhos e netos dele (o bloco da novidade pode vazar da caixa do título)
  const r = (s) => { const e = document.querySelector('.tela-inicio ' + s); if (!e) return null;
    const bs = [e, ...e.querySelectorAll(':scope > *, :scope > * > *')].map((x) => x.getBoundingClientRect()).filter((b) => b.width && b.height);
    const x = Math.min(...bs.map((b) => b.left)), y = Math.min(...bs.map((b) => b.top));
    return { x, y, w: Math.max(...bs.map((b) => b.right)) - x, h: Math.max(...bs.map((b) => b.bottom)) - y }; };
  const D = Reino._abertura.depurar, ts = [0, 1.5, 3, 4.5, 5.4, 7, 9, 11, 13.5, 16, 19, 23, 28, 34];
  return { marca: r('.abertura-marca'), baixo: r('.inicio-baixo'), instantes: ts.map((t) => ({ t, ...D.caixas(t) })) };
})()`;

function cruza(a, b) { return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h; }

for (const tamanho of ['celular', 'notebook', 'deitado']) {
  test(`abertura (${tamanho}): voadores longe da Mariana, do título e do botão, sem se cruzar`, async () => {
    const c = await abrirCenario({ tamanho, save: 'completo', pasta: pasta() });
    try {
      await c.js("Reino.UI.fecharTodas(); localStorage.setItem('reino-novidade-vista', 'casa-2026-10-31'); __reino.telaInicio(); 1");
      await c.avancar(600);
      const r = await c.js(LER);
      assert.ok(r.marca && r.baixo, 'a tela de início tem o bloco do título e o botão');
      const voadores = r.instantes[0].voadores.length;
      assert.ok(voadores >= 1, 'pelo menos um unicórnio voando');
      for (const { t, menina, voadores: vs } of r.instantes) {
        assert.ok(!cruza(menina, r.marca) && !cruza(menina, r.baixo), `t=${t}: a Mariana fora do título e do botão`);
        vs.forEach((v, i) => {
          for (const [nome, caixa] of [['a Mariana', v.longe ? null : menina], ['o título', r.marca], ['o botão', r.baixo]]) {
            if (!caixa) continue;
            assert.ok(!cruza(v, caixa), `t=${t}: o voador ${i} ${JSON.stringify(v)} cobre ${nome} ${JSON.stringify(caixa)}`);
          }
          vs.slice(i + 1).forEach((w, j) => assert.ok(!cruza(v, w), `t=${t}: os voadores ${i} e ${i + j + 1} se cruzam`));
        });
      }
      assert.deepStrictEqual(c.erros || [], []);
    } finally { await c.fechar(); }
  });
}
