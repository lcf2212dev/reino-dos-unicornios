// Fogão dos Estados do 2º andar da Química (Reino.UI.telaQuimicaEstados; docs/contratos/quimica.md §9): abre, escolhe o
// material, esquenta até ferver (derreter e ferver, estrela só na 1ª vez), esfria (condensar e congelar), o chocolate
// derrete e endurece (endurecer não é descoberta), teclado, Esc fecha e, sem animação, o quadro fica parado.
// Servidor e banco de TESTE novos por cenário (cenario.js); save sintético.
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('../cenario');
const { PASTA_TESTES } = require('../guardas');

const pasta = () => fs.mkdtempSync(path.join(PASTA_TESTES, 'estados-'));
const PREPARAR = `(function () {
  var e = Reino.Progresso.estado(); e.quimica = {};
  window.__falas = []; Reino.Som.falar = function (p) { window.__falas.push(p.slice()); return Promise.resolve(); };
  return 'ok';
})()`;
const OLHAR = `(function () {
  var t = document.querySelector('.tela-quimica-estados'), c = t && t.querySelector('.estados-cena');
  if (!c) return null;
  return { material: c.dataset.material, graus: +c.dataset.graus, estado: c.dataset.estado, gotas: c.dataset.gotas === 'true',
    estrelas: Reino.Progresso.estrelas(), estados: Object.assign({}, (Reino.Progresso.estado().quimica || {}).estados),
    premio: !t.querySelector('.estados-premio').hidden, contagem: t.querySelector('.estados-contagem').textContent,
    fala: window.__falas[window.__falas.length - 1] || [] };
})()`;
const toque = (qual, n) => `(function () { for (var i = 0; i < ${n}; i++) document.querySelector('.estados-${qual}').click(); return 'ok'; })()`;

test('fogão dos estados: o ciclo da água, estrela só na 1ª vez, chocolate endurece, teclado e Esc', async () => {
  const c = await abrirCenario({ tamanho: 'celular', save: 'completo', pasta: pasta() });
  try {
    await c.js(PREPARAR);
    await c.js("Reino.UI.telaQuimicaEstados(); 'ok'");
    let r = await c.js(OLHAR);
    assert.ok(r, 'a tela abriu');
    assert.strictEqual(r.material, 'agua'); assert.strictEqual(r.graus, -10); assert.strictEqual(r.estado, 'solido');
    assert.ok(r.contagem.indexOf('Descobertas: 0 de 7') >= 0);
    const antes = r.estrelas;

    // esquenta: -10 → 0 derrete (descoberta na hora)
    await c.js(toque('quente', 1));
    r = await c.js(OLHAR);
    assert.strictEqual(r.graus, 0); assert.strictEqual(r.estado, 'liquido');
    assert.deepStrictEqual(r.estados, { 'agua-derreter': 1 });
    assert.strictEqual(r.estrelas, antes + 1); assert.ok(r.premio);
    assert.deepStrictEqual(r.fala.slice(0, 2), ['O gelo derreteu!', 'Virou água líquida.']);
    assert.strictEqual(r.fala[r.fala.length - 1], 'Mais uma estrela para você!');

    // até 100 °C: ferve
    await c.js(toque('quente', 10));
    r = await c.js(OLHAR);
    assert.strictEqual(r.graus, 100); assert.strictEqual(r.estado, 'gas');
    assert.ok(r.estados['agua-ferver']); assert.strictEqual(r.estrelas, antes + 2);

    // o termômetro para em 120 °C
    await c.js(toque('quente', 5));
    r = await c.js(OLHAR);
    assert.strictEqual(r.graus, 120); assert.deepStrictEqual(r.fala, ['O fogo já está no máximo!']);

    // esfria: condensa (gotinhas na tampa) e depois congela
    await c.js(toque('frio', 3));
    r = await c.js(OLHAR);
    assert.strictEqual(r.graus, 90); assert.strictEqual(r.estado, 'liquido'); assert.ok(r.gotas, 'gotinhas na tampa');
    assert.ok(r.estados['agua-condensar']);
    await c.js(toque('frio', 10));
    r = await c.js(OLHAR);
    assert.strictEqual(r.graus, -10); assert.strictEqual(r.estado, 'solido'); assert.ok(r.estados['agua-congelar']);
    assert.strictEqual(r.estrelas, antes + 4); assert.ok(r.contagem.indexOf('4 de 7') >= 0);

    // de novo: derreter não dá estrela nova
    await c.js(toque('quente', 1));
    r = await c.js(OLHAR);
    assert.strictEqual(r.estrelas, antes + 4, 'a 2ª vez não dá estrela'); assert.strictEqual(r.premio, false);
    assert.deepStrictEqual(r.fala, ['O gelo derreteu!', 'Virou água líquida.']);

    // chocolate: derrete a 40 °C e endurece ao esfriar (não é descoberta)
    await c.js("document.querySelector('.estados-material[data-id=\"chocolate\"]').click(); 'ok'");
    r = await c.js(OLHAR);
    assert.strictEqual(r.material, 'chocolate'); assert.strictEqual(r.estado, 'solido');
    await c.js(toque('quente', 2));
    r = await c.js(OLHAR);
    assert.strictEqual(r.estado, 'liquido'); assert.ok(r.estados['chocolate-derreter']);
    const est = r.estrelas;
    await c.js(toque('frio', 1));
    r = await c.js(OLHAR);
    assert.strictEqual(r.estado, 'solido'); assert.strictEqual(r.estrelas, est);
    assert.deepStrictEqual(r.fala, ['Esfriou e endureceu de novo!', 'Voltou a ser sólido.']);

    // teclado: Enter no Esfriar, Tab anda, Esc fecha
    await c.js("document.querySelector('.estados-frio').focus(); 'ok'");
    await c.page.keyboard.press('Enter');
    assert.strictEqual((await c.js(OLHAR)).graus, 20, 'Enter no Esfriar esfria');
    await c.page.keyboard.press('Tab');
    assert.strictEqual(await c.js("document.activeElement.dataset.id || ''"), 'agua', 'Tab segue para os materiais');
    await c.page.keyboard.press('Escape');
    await c.avancar(300);
    assert.strictEqual(await c.js("!!document.querySelector('#telas .tela-quimica-estados')"), false, 'Esc fecha');
    assert.deepStrictEqual(c.erros, []);
  } finally { await c.fechar(); }
});

test('fogão dos estados: abre no material e nos graus pedidos; sem animação, o quadro final parado', async () => {
  const c = await abrirCenario({ tamanho: 'notebook', save: 'completo', pasta: pasta() });
  try {
    await c.js(PREPARAR);
    await c.js("Reino.UI.telaQuimicaEstados({ material: 'vela', graus: 50 }); 'ok'");
    let r = await c.js(OLHAR);
    assert.strictEqual(r.material, 'vela'); assert.strictEqual(r.graus, 50); assert.strictEqual(r.estado, 'solido');
    await c.js(toque('quente', 1));
    r = await c.js(OLHAR);
    assert.strictEqual(r.estado, 'liquido'); assert.ok(r.estados['vela-derreter']);
    const a = await c.js("document.querySelector('.estados-cena').toDataURL()");
    await c.avancar(1000);
    const b = await c.js("document.querySelector('.estados-cena').toDataURL()");
    assert.strictEqual(a, b, 'congelado (sem animação): o quadro fica parado');
    assert.deepStrictEqual(c.erros, []);
  } finally { await c.fechar(); }
});
