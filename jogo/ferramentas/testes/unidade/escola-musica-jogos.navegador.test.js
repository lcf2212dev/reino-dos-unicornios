// Partidas completas com novas tentativas, controles reais e saída durante sequências agendadas.
const test = require('node:test');
const assert = require('node:assert/strict');
const { abrirCenario } = require('../cenario');

test('Escola de Música: eco permite erro, repetição, quatro rodadas e nova partida', async () => {
  const c = await abrirCenario({ tamanho: 'celular', save: 'completo' });
  try {
    await c.ir('escola-musica');
    await c.js('Reino.EscolaMusica.menu()');
    await c.avancar(600);
    await c.page.getByRole('button', { name: /^Jogos musicais/ }).click();
    await c.avancar(600);
    await c.page.getByRole('button', { name: /^Eco Musical/ }).click();
    await c.avancar(600);
    await c.tocar('Ouvir sequência');
    assert.equal(await c.page.locator('.mj-nota:disabled').count(), 4);
    await c.avancar(5000);
    assert.equal(await c.page.locator('.mj-nota:disabled').count(), 0);
    await c.page.getByRole('button', { name: 'Sol', exact: true }).click();
    assert.match(await c.page.locator('.mj-recado').textContent(), /nota 1 de novo/);
    assert.equal(await c.page.getByRole('button', { name: 'Próximo eco' }).isVisible(), false);
    await c.tocar('Mostrar pista');
    assert.match(await c.page.locator('.mj-pista').textContent(), /Dó - Mi/);
    const melodias = [['Dó', 'Mi'], ['Dó', 'Mi', 'Ré'], ['Dó', 'Ré', 'Sol', 'Mi'], ['Sol', 'Mi', 'Ré', 'Dó', 'Mi']];
    for (const notas of melodias) {
      for (const nota of notas) await c.page.getByRole('button', { name: nota, exact: true }).click();
      assert.match(await c.page.locator('.mj-recado').textContent(), /Eco perfeito/);
      await c.tocar('Próximo eco');
    }
    assert.match(await c.page.locator('.musica-jogo h3').textContent(), /Desafio completo/);
    await c.tocar('Jogar de novo');
    assert.match(await c.page.locator('.mj-etapa').textContent(), /Eco 1 de 4/);
    await c.page.getByRole('button', { name: 'Dó', exact: true }).focus();
    await c.tecla('Enter');
    assert.match(await c.page.locator('.mj-recado').textContent(), /nota 2/);
    await c.tecla('Escape');
    assert.equal(await c.page.locator('.tela-musica-eco').count(), 0);
    assert.deepEqual(c.erros, []);
  } finally { await c.fechar(); }
});

test('Escola de Música: ritmo preserva a montagem no erro e conclui quatro desafios', async () => {
  const c = await abrirCenario({ tamanho: 'tablet', save: 'completo', ajustes: { som: false } });
  try {
    await c.js('Reino.EscolaMusica.jogoRitmo()');
    await c.avancar(600);
    assert.equal(await c.page.locator('.mj-pista').isVisible(), true, 'pista acessível com o som desligado');
    await c.tocar('Conferir ritmo');
    assert.match(await c.page.locator('.mj-recado').textContent(), /ajustar o tempo 3/);
    assert.equal(await c.page.getByRole('button', { name: 'Próximo ritmo' }).isVisible(), false);
    // Cada clique troca Tá por Tá-tá e depois por Pausa.
    for (const cliques of [[0, 0, 2, 0], [0, 1, 0, 2], [1, 2, 0, 1], [2, 1, 1, 0]]) {
      for (let i = 0; i < cliques.length; i++) {
        for (let j = 0; j < cliques[i]; j++) await c.page.locator('.mj-bloco').nth(i).click();
      }
      await c.tocar('Ouvir meu ritmo');
      await c.avancar(3200);
      await c.tocar('Conferir ritmo');
      assert.match(await c.page.locator('.mj-recado').textContent(), /igual ao desafio/);
      await c.tocar('Próximo ritmo');
    }
    assert.match(await c.page.locator('.musica-jogo h3').textContent(), /Desafio completo/);
    await c.tocar('Jogar de novo');
    assert.match(await c.page.locator('.mj-etapa').textContent(), /Ritmo 1 de 4/);
    await c.page.locator('.mj-bloco').first().focus();
    await c.tecla('Enter');
    assert.match(await c.page.locator('.mj-bloco').first().textContent(), /Tá-tá/);
    assert.deepEqual(c.erros, []);
  } finally { await c.fechar(); }
});

test('Escola de Música: detetive compara seis pares, permite retry e reinicia', async () => {
  const c = await abrirCenario({ tamanho: 'celular', save: 'completo', ajustes: { som: false } });
  try {
    await c.js('Reino.EscolaMusica.jogoOuvido()');
    await c.avancar(600);
    assert.match(await c.page.locator('.mj-pista').textContent(), /Grave.*Agudo/);
    assert.equal(await c.page.locator('.mj-pista').isVisible(), true);
    await c.tocar('É o som 1');
    assert.match(await c.page.locator('.mj-recado').textContent(), /Compare os dois sons/);
    for (const resposta of [2, 1, 2, 2, 1, 1]) {
      await c.tocar('Ouvir os dois');
      await c.avancar(3500);
      await c.tocar('É o som ' + resposta);
      assert.match(await c.page.locator('.mj-recado').textContent(), /^Isso!/);
      await c.tocar('Próxima descoberta');
    }
    assert.match(await c.page.locator('.musica-jogo h3').textContent(), /Desafio completo/);
    await c.tocar('Jogar de novo');
    assert.match(await c.page.locator('.mj-etapa').textContent(), /Descoberta 1 de 6/);
    await c.tocar('Escolher outro jogo');
    assert.equal(await c.page.locator('.tela-musica-jogos').count(), 1);
    await c.tecla('Escape');
    assert.equal(await c.page.locator('#telas .musica-jogo').count(), 0);
    assert.deepEqual(c.erros, []);
  } finally { await c.fechar(); }
});

test('Escola de Música: sair dos jogos cancela notas e devolve o mapa', async () => {
  const c = await abrirCenario({ tamanho: 'notebook', save: 'completo', ajustes: { som: true, animacoes: true } });
  try {
    await c.ir('escola-musica');
    await c.js('window.__notasJogo = 0; Reino.Som.notaMusical = function () { window.__notasJogo++; return function () {}; };');
    for (const jogo of ['jogoEco', 'jogoRitmo', 'jogoOuvido']) {
      await c.js('Reino.EscolaMusica.' + jogo + '()');
      await c.avancar(600);
      await c.page.getByRole('button', { name: /^Ouvir (sequência|desafio|os dois)/ }).click();
      await c.avancar(100);
      await c.js('Reino.UI.fecharTodas()');
      const notas = await c.js('window.__notasJogo');
      await c.avancar(8000);
      assert.equal(await c.js('window.__notasJogo'), notas, jogo + ': nenhum som depois de sair');
      assert.equal(await c.page.locator('#telas .musica-jogo').count(), 0);
    }
    assert.deepEqual(c.erros, []);
  } finally { await c.fechar(); }
});
