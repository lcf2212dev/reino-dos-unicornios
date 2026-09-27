// Teste de NAVEGADOR (Chromium, servidor de TESTE, save sintético, ?debug=1&congelar=1): o Ritual da Calma
// (Reino.Prova.ritual, js/atividades/treino.js) continua rodando depois que ela sai do treino ou da prova pelo ✕.
// Os setTimeout do ritual não olham se a tela ainda existe: ~20 s depois do "Sair", a voz fala "puxa o ar…" por
// cima do que ela estiver fazendo (V.falar cala a fala de agora) e, no fim, o treino fala o plano da prova
// (plano()) e a prova chama mostrarQuestao numa tela que já fechou (Claude.limpar + Som.calar no jogo de agora).
// Correto: depois do "Sair", nenhuma fala nem limpeza vem do ritual.
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/ritual-depois-de-sair.navegador.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { iniciar } = require('../servidor-teste');
const { abrir, lancar } = require('../navegador');
const { gerarSaves } = require('../saves');

const avancar = (page, ms) => page.evaluate((m) => window.__congelar.avancar(m), ms);
const esperarJogo = (page) => page.waitForFunction(() => window.__congelar && window.Reino && Reino.UI && Reino.Prova, null, { timeout: 30000 });

async function abrirJogo(browser, servidor) {
  const a = await abrir({ browser, url: servidor.url, query: '?debug=1&congelar=1' });
  await esperarJogo(a.page);
  const save = (await a.page.evaluate(`(${gerarSaves.toString()})()`)).completo;
  await a.context.close();
  const { page } = await abrir({ browser, url: servidor.url, save, query: '?debug=1&congelar=1' });
  await esperarJogo(page);
  await avancar(page, 3000);
  return page;
}

// começa a respirar, sai pelo ✕ + "Sair" e conta o que o jogo fala/limpa nos 30 s seguintes
async function sairNoRitual(page, abrirTela) {
  await page.evaluate(abrirTela);
  await avancar(page, 600);
  return page.evaluate(async () => {
    var tela = document.querySelector('.tela-prova');
    var comecar = [...tela.querySelectorAll('.ritual button')].find(function (b) { return /respirar/.test(b.textContent); });
    comecar.click();
    await Promise.resolve();
    window.__congelar.avancar(100);
    tela.querySelector('.btn-sair').click();
    window.__congelar.avancar(100);
    var sim = [...document.querySelectorAll('.tela-confirmar button')].find(function (b) { return b.textContent.trim() === 'Sair'; });
    sim.click();
    for (var k = 0; k < 5; k++) await Promise.resolve();
    var depois = window.__depois = { falas: [], limpar: 0, calar: 0 };
    var falar = Reino.Som.falar, limpar = Reino.Claude.limpar, calar = Reino.Som.calar;
    Reino.Som.falar = function (s) { depois.falas.push(JSON.stringify(s).slice(0, 60)); return falar.apply(this, arguments); };
    Reino.Claude.limpar = function () { depois.limpar++; return limpar.apply(this, arguments); };
    Reino.Som.calar = function () { depois.calar++; return calar.apply(this, arguments); };
    return !!document.querySelector('.tela-prova');
  });
}

test('ritual: sair do TREINO durante a respiração não deixa o ritual falando nem abre o plano', async () => {
  const servidor = await iniciar();
  const browser = await lancar();
  try {
    const page = await abrirJogo(browser, servidor);
    const aberta = await sairNoRitual(page, () => { Reino.Prova.iniciar(Reino.materias[0], function () {}); });
    assert.strictEqual(aberta, false, 'a tela do treino fechou');
    for (let i = 0; i < 30; i++) { await avancar(page, 1000); await page.evaluate(() => window.__esperarReal(5)); }
    const d = await page.evaluate(() => window.__depois);
    assert.deepStrictEqual(d.falas, [], 'nenhuma fala depois de sair do treino (veio: ' + d.falas.join(' | ') + ')');
  } finally {
    await browser.close();
    servidor.parar();
  }
});

test('ritual: sair da PROVA durante a respiração não chama mostrarQuestao (Claude.limpar/Som.calar) depois', async () => {
  const servidor = await iniciar();
  const browser = await lancar();
  try {
    const page = await abrirJogo(browser, servidor);
    const aberta = await sairNoRitual(page, () => {
      Reino.Provas.iniciar(Reino.provas[0], function () {});
      window.__congelar.avancar(100);
      [...document.querySelectorAll('.tela-prova button')].find(function (b) { return /Começar a prova/.test(b.textContent); }).click();
    });
    assert.strictEqual(aberta, false, 'a tela da prova fechou');
    for (let i = 0; i < 30; i++) { await avancar(page, 1000); await page.evaluate(() => window.__esperarReal(5)); }
    const d = await page.evaluate(() => window.__depois);
    assert.deepStrictEqual({ falas: d.falas, limpar: d.limpar, calar: d.calar }, { falas: [], limpar: 0, calar: 0 },
      'nada do ritual depois de sair da prova');
  } finally {
    await browser.close();
    servidor.parar();
  }
});
