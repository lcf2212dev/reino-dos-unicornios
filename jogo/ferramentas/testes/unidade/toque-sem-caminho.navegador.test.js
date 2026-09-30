// Toque sem caminho (motor/entrada.js, D9-09): o ✗ fica ~400 ms no tile tocado, com e sem animação.
// Servidor e banco de TESTE novos (cenario.js); save sintético.
const { test } = require('node:test');
const assert = require('assert');
const { abrirCenario } = require('../cenario');

[true, false].forEach((animacoes) => {
  test(`toque sem caminho mostra o sinal ~400 ms (animações ${animacoes ? 'ligadas' : 'desligadas'})`, async () => {
    const c = await abrirCenario({ tamanho: 'celular', save: 'completo', pasta: '/tmp/reino-testes/ver/teste-toque-sem-caminho' });
    try {
      await c.js(`Reino.Progresso.estado().ajustes.animacoes = ${animacoes};
        Jogador.irPara = function () { return false; };
        document.querySelector('canvas').dispatchEvent(new PointerEvent('pointerdown',
          { clientX: 300, clientY: 520, pointerType: 'touch', bubbles: true }));`);
      await c.avancar(100);
      const aos100 = await c.js("__reino.modulo('toque-sem-caminho').sinal");
      assert.ok(aos100 && typeof aos100.x === 'number', 'sinal desenhado aos 100 ms');
      await c.avancar(400);
      assert.strictEqual(await c.js("__reino.modulo('toque-sem-caminho').sinal"), null, 'sumiu aos 500 ms');
    } finally { await c.fechar(); }
  });
});
