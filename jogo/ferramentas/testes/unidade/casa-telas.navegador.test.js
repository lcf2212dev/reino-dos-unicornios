// Telas da casa do jogador (docs/contratos/casa.md §9): o baú da casa (ui/bau-casa.js) abre uma vez, grava casaBau
// e não volta; a escolha do kit (ui/casa-kits.js) aparece com uma matéria do 4º bimestre completa (forjada no save
// sintético) e dá o kit; sem kit pendente, resolve na hora; teclado (Tab, Enter, Esc); a legenda nova da tela de
// início. Servidor e banco de TESTE novos (cenario.js); modo congelado (sem animação: os passos andam na hora).
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { abrirCenario } = require('../cenario');
const { PASTA_TESTES } = require('../guardas');

const pasta = () => fs.mkdtempSync(path.join(PASTA_TESTES, 'casa-telas-'));

// completa (no save) todas as salas da 1ª matéria do 4º bimestre em diante
const COMPLETAR = `(() => {
  const m = Reino.materias.find((x) => (x.bimestre || 0) >= Reino.config.casa.desdeBimestre);
  m.salas.forEach((s) => Reino.Progresso.concluirSala(m, s, { acertosPrimeira: 1, total: 1, pressas: 0 }));
  return Reino.Progresso.materiaCompleta(m);
})()`;

test('casa: baú uma vez, escolha do kit, teclado e legenda', { timeout: 240000 }, async () => {
  const c = await abrirCenario({ tamanho: 'celular', pasta: pasta() });
  try {
    await c.js('Reino.UI.fecharTodas(); Reino.Progresso.estado().casaBau = {}; 1');   // o save sintético já vem com o baú aberto
    // 1) o baú: abre, a casinha sobe, grava casaBau
    assert.strictEqual(await c.js('Reino.Casa.ganhou()'), false);
    await c.js("window.__fimBau = false; Reino.UI.abrirBauCasa().then(() => { __fimBau = true; }); 1");
    assert.ok(await c.js("!!document.querySelector('.tela-bau-casa .presente-bau')"), 'o baú aparece');
    await c.js("document.querySelector('.tela-bau-casa .presente-bau').click(); 1");
    await c.avancar(3000);
    assert.deepStrictEqual(await c.js(`({ casa: !document.querySelector('.tela-bau-casa .bcasa-casa').hidden,
      titulo: document.querySelector('.tela-bau-casa .presente-titulo').textContent,
      em: typeof Reino.Progresso.estado().casaBau.em })`), { casa: true, titulo: 'Uma casa só sua!', em: 'number' });
    await c.js("document.querySelector('.tela-bau-casa .presente-continuar').click(); 1");
    await c.avancar(300);
    assert.deepStrictEqual(await c.js("({ fim: __fimBau, tela: !!document.querySelector('.tela-bau-casa') })"), { fim: true, tela: false });
    // não volta
    await c.js('window.__de2 = false; Reino.UI.abrirBauCasa().then(() => { __de2 = true; }); 1');
    await c.avancar(50);
    assert.deepStrictEqual(await c.js("({ fim: __de2, tela: !!document.querySelector('.tela-bau-casa') })"), { fim: true, tela: false });

    // 2) sem kit pendente: resolve na hora, sem tela
    assert.strictEqual(await c.js('Reino.Casa.kitsPendentes()'), 0);
    await c.js('window.__sem = false; Reino.UI.casaKitsPendentes().then(() => { __sem = true; }); 1');
    await c.avancar(50);
    assert.deepStrictEqual(await c.js("({ fim: __sem, tela: !!document.querySelector('.tela-kit-casa') })"), { fim: true, tela: false });

    // 3) com uma matéria do 4º bimestre completa: a escolha aparece; Esc = "Depois" (o kit fica pendente)
    assert.strictEqual(await c.js(COMPLETAR), true);
    await c.js('Reino.UI.fecharTodas(); 1');
    assert.strictEqual(await c.js('Reino.Casa.kitsPendentes()'), 1);
    await c.js('window.__k1 = null; Reino.UI.escolherKitCasa().then((v) => { __k1 = v; }); 1');
    await c.avancar(100);
    assert.strictEqual(await c.js("document.querySelectorAll('.tela-kit-casa .ckit-cartao').length"), 6);
    await c.page.keyboard.press('Escape');
    await c.avancar(300);
    assert.deepStrictEqual(await c.js("({ v: __k1, tela: !!document.querySelector('.tela-kit-casa'), p: Reino.Casa.kitsPendentes() })"),
      { v: false, tela: false, p: 1 });

    // 4) pelo teclado: Tab até o 2º cartão e Enter dá o kit; a fila acaba
    await c.js('window.__fila = false; Reino.UI.casaKitsPendentes().then(() => { __fila = true; }); 1');
    await c.avancar(200);
    for (let i = 0; i < 6; i++) {
      await c.page.keyboard.press('Tab');
      if (await c.js("document.activeElement && document.activeElement.dataset.kit === 'jantar'")) break;
    }
    assert.strictEqual(await c.js('document.activeElement.dataset.kit'), 'jantar', 'o Tab chega no cartão');
    await c.page.keyboard.press('Enter');
    await c.avancar(3000);
    assert.deepStrictEqual(await c.js("({ fim: __fila, tela: !!document.querySelector('.tela-kit-casa'), kits: Reino.Casa.kitsGanhos(), p: Reino.Casa.kitsPendentes() })"),
      { fim: true, tela: false, kits: ['jantar'], p: 0 });

    // 5) a legenda nova na tela de início
    await c.js("Reino.UI.fecharTodas(); __reino.telaInicio(); 1");
    assert.deepStrictEqual(await c.js(`({ longa: document.querySelector('.tela-inicio .inicio-materias-longa').textContent,
      curta: document.querySelector('.tela-inicio .inicio-materias-curta').textContent })`),
    { longa: 'Nova atualização: Decore sua casa!', curta: 'Decore sua casa!' });
    await c.js('Reino.UI.fecharTodas(); 1');
    assert.deepStrictEqual(c.erros, []);
  } finally { await c.fechar(); }
});
