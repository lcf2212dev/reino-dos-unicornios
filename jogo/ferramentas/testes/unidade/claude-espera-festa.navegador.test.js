// O-02: a saudação do Claude não abre por cima do cartão "Nasceu!"; espera a tela do ovo fechar e então aparece.
const { test } = require('node:test');
const assert = require('assert');
const { abrirCenario } = require('../cenario');

test('balão do Claude espera a tela do ovo fechar', async () => {
  const c = await abrirCenario({ save: 'ovos', tamanho: 'celular' });
  try {
    await c.js("var s=Reino.Progresso.estado(); window.__ovo=Object.keys(s.unis).find(function(id){return !s.unis[id].chocado && Reino.Progresso.defUni(id)}); void Reino.UI.chocarUm(window.__ovo)");
    await c.avancar(300);
    await c.js("void Reino.Claude.falar('Oi! Que bom te ver!')");
    await c.avancar(500);
    assert.strictEqual(await c.js('Reino.Claude.aberto()'), false, 'o balão abriu por cima da tela do ovo');
    await c.js("for (var i=0;i<3;i++) document.querySelector('.ovo-grande').click()");
    await c.avancar(1500);
    assert.ok(await c.js("!!document.querySelector('.tela-ovo .intro-botoes')"), 'o cartão "Nasceu!" não apareceu');
    assert.strictEqual(await c.js('Reino.Claude.aberto()'), false, 'o balão abriu por cima do "Nasceu!"');
    await c.js("document.querySelector('.tela-ovo .btn-secundario').click()");
    await c.avancar(800);
    assert.strictEqual(await c.js("!!document.querySelector('.tela-ovo')"), false);
    assert.strictEqual(await c.js('Reino.Claude.aberto()'), true, 'a saudação não veio depois de fechar');
  } finally { await c.fechar(); }
});
