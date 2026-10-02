// Fluxos das duas aulas no servidor isolado, com notas erradas, repetição e saída durante áudio.
const test = require('node:test');
const assert = require('node:assert/strict');
const { abrirCenario } = require('../cenario');

test('Escola de Música: teclado guiado permite tentar de novo, concluir e fechar sem notas pendentes', async () => {
  const c = await abrirCenario({ tamanho: 'celular', save: 'completo' });
  try {
    await c.ir('escola-musica');
    await c.js("void Reino.NPCs.executar({tipo:'tela',tela:'musica-teclado'})");
    await c.avancar(600);
    await c.tocar('Aprender melodia');
    await c.page.locator('.musica-tecla[aria-label="Ré"]').click();
    assert.match(await c.page.locator('.musica-recado').textContent(), /Tente Dó/);
    assert.equal(await c.page.locator('.musica-feita').count(), 0);
    for (const nota of ['Dó', 'Ré', 'Mi', 'Fá', 'Sol', 'Fá', 'Mi', 'Ré', 'Dó']) {
      await c.page.locator('.musica-tecla[aria-label="' + nota + '"]').click();
    }
    assert.match(await c.page.locator('.musica-recado').textContent(), /melodia toda/);
    await c.tocar('Tocar livremente');
    await c.page.locator('.musica-tecla[aria-label="Dó sustenido"]').focus();
    await c.tecla('Enter');
    assert.match(await c.page.locator('.musica-tocada').textContent(), /Dó sustenido/);
    await c.js('window.__notasDaAula = 0; var notaOriginal = Reino.Som.notaMusical; Reino.Som.notaMusical = function () { window.__notasDaAula++; return notaOriginal.apply(this, arguments); };');
    await c.tocar('Ouvir a melodia');
    await c.tecla('Escape');
    const antes = await c.js('window.__notasDaAula');
    await c.avancar(7000);
    assert.equal(await c.js('window.__notasDaAula'), antes, 'fechar cancela a sequência pendente');
    assert.equal(await c.page.locator('.tela-musica-teclado').count(), 0);
    assert.deepEqual(c.erros, []);
  } finally { await c.fechar(); }
});

test('Escola de Música: fundamentos têm nova tentativa, exemplos, conclusão e repetição', async () => {
  const c = await abrirCenario({ tamanho: 'notebook', save: 'completo' });
  try {
    await c.ir('escola-musica');
    await c.js("void Reino.NPCs.executar({tipo:'tela',tela:'musica-fundamentos'})");
    await c.avancar(600);
    await c.page.locator('.musica-pergunta button').nth(1).click();
    assert.match(await c.page.locator('.musica-recado').textContent(), /tentar de novo/);
    for (const certa of [0, 0, 1, 0, 0]) {
      await c.page.locator('.musica-licao .musica-controles button').first().click();
      await c.avancar(2500);
      await c.page.locator('.musica-pergunta button').nth(certa).click();
      await c.page.locator('.musica-licao > button').click();
      await c.avancar(100);
    }
    assert.match(await c.page.locator('.musica-licao h3').textContent(), /mundo dos sons/);
    await c.tocar('Fazer a aula de novo');
    assert.match(await c.page.locator('.musica-licao h3').textContent(), /Altura/);
    await c.tecla('Escape');
    assert.equal(await c.page.locator('.tela-musica-fundamentos').count(), 0);
    assert.deepEqual(c.erros, []);
  } finally { await c.fechar(); }
});

test('Escola de Música: fecharTodas cancela notas durante a animação de saída', async () => {
  const c = await abrirCenario({ tamanho: 'notebook', save: 'completo', ajustes: { som: true, animacoes: true } });
  try {
    await c.js('Reino.util.reduzMovimentoSistema = false; document.body.classList.remove("sem-animacao"); Reino.EscolaMusica.teclado(); window.__notasCancelamento = 0; Reino.Som.notaMusical = function () { window.__notasCancelamento++; return function () {}; };');
    await c.avancar(500);
    await c.tocar('Ouvir a melodia');
    await c.js('Reino.UI.fecharTodas()');
    const antes = await c.js('window.__notasCancelamento');
    await c.avancar(7000);
    assert.equal(await c.js('window.__notasCancelamento'), antes);
    assert.deepEqual(c.erros, []);
  } finally { await c.fechar(); }
});
