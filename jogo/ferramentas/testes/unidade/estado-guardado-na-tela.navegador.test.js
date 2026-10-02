// Teste de NAVEGADOR (Chromium, servidor de TESTE, save sintético, ?debug=1&congelar=1): telas que guardam o
// objeto do estado ao abrir (save-e-mescla.md §8.2: "nunca guarde o objeto numa variável") perdem o que ela
// escolhe se o progresso é mesclado com a tela aberta (outra aba gravou, a aba voltou do fundo, a nuvem trouxe
// algo): a escolha vai para o objeto velho e o P.salvar grava o novo, sem ela.
//   - Estábulo → detalhe → "Mudar o nome" (ui/estabulo.js, `u` guardado em detalheUni)
//   - Ajustes → "Mudar minha personagem" (ui/aparencia.js, `ap` guardado em telaAparencia)
// A mescla é simulada com o evento `storage` de outra aba (save sintético, cópia do estado desta aba).
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/estado-guardado-na-tela.navegador.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { iniciar } = require('../servidor-teste');
const { abrir, lancar } = require('../navegador');
const { gerarSaves } = require('../saves');

const avancar = (page, ms) => page.evaluate((m) => window.__congelar.avancar(m), ms);
const esperarJogo = (page) => page.waitForFunction(() => window.__congelar && window.Reino && Reino.UI && Reino.Progresso, null, { timeout: 30000 });

// outra aba grava o mesmo progresso: esta aba mescla e troca o objeto do estado (P.estado() !== antes)
function mesclarDeOutraAba() {
  var antes = Reino.Progresso.estado();
  var bruto = JSON.stringify(Object.assign({}, antes, { salvoEm: (antes.salvoEm || 0) + 1 }));
  window.dispatchEvent(new StorageEvent('storage', { key: Reino.config.chaveSave, newValue: bruto }));
  return Reino.Progresso.estado() !== antes;
}

async function comJogo(fn, mudarSave) {
  const servidor = await iniciar();
  const browser = await lancar();
  try {
    const a = await abrir({ browser, url: servidor.url, query: '?debug=1&congelar=1' });
    await esperarJogo(a.page);
    const save = (await a.page.evaluate(`(${gerarSaves.toString()})()`)).completo;
    if (mudarSave) mudarSave(save);
    await a.context.close();
    const { page } = await abrir({ browser, url: servidor.url, save, query: '?debug=1&congelar=1' });
    await esperarJogo(page);
  await require('./ajudantes/terceiro-bimestre').noNavegador(page);
    await avancar(page, 3000);
    await fn(page);
  } finally {
    await browser.close();
    servidor.parar();
  }
}

test('estábulo: o nome novo fica mesmo se o progresso for mesclado com o "Mudar o nome" aberto', () => comJogo(async (page) => {
  const r = await page.evaluate(async (mesclar) => {
    var mesclarDeOutraAba = (0, eval)('(' + mesclar + ')');
    var id = Reino.Progresso.montaria();
    Reino.UI.telaEstabulo();
    document.querySelector('.tela-estabulo .carta-uni.montado').click();
    var ren = [...document.querySelectorAll('.tela-detalhe button')].find(function (b) { return /Mudar o nome/.test(b.textContent); });
    ren.click();
    var trocou = mesclarDeOutraAba();
    document.querySelector('#campo-nome').value = 'Pipoca';
    [...document.querySelectorAll('.tela-confirmar button')].find(function (b) { return /Pronto/.test(b.textContent); }).click();
    for (var k = 0; k < 5; k++) await Promise.resolve();
    return { trocou: trocou, nome: Reino.Progresso.estado().unis[id].nome, gravado: JSON.parse(localStorage.getItem(Reino.config.chaveSave)).unis[id].nome };
  }, mesclarDeOutraAba.toString());
  assert.strictEqual(r.trocou, true, 'a mescla trocou o objeto do estado');
  assert.strictEqual(r.nome, 'Pipoca', 'o nome novo está no estado');
  assert.strictEqual(r.gravado, 'Pipoca', 'o nome novo foi gravado');
}));

test('aparência: a cor escolhida fica mesmo se o progresso for mesclado com a tela aberta', () => comJogo(async (page) => {
  const r = await page.evaluate(async (mesclar) => {
    var mesclarDeOutraAba = (0, eval)('(' + mesclar + ')');
    var p = Reino.UI.telaAparencia(false);
    var trocou = mesclarDeOutraAba();
    var atual = Reino.Progresso.estado().aparencia.pele;
    var outra = [...document.querySelectorAll('.tela-aparencia .linha-cores')][0].querySelectorAll('.bolinha-cor');
    var b = [...outra].find(function (x) { return x.getAttribute('aria-pressed') !== 'true'; });
    var cor = b.getAttribute('aria-label').replace(/^Pele /, '');
    b.click();
    [...document.querySelectorAll('.tela-aparencia button')].find(function (x) { return /Pronto/.test(x.textContent); }).click();
    await p;
    return { trocou: trocou, antes: atual, cor: cor, agora: Reino.Progresso.estado().aparencia.pele,
      gravado: JSON.parse(localStorage.getItem(Reino.config.chaveSave)).aparencia.pele };
  }, mesclarDeOutraAba.toString());
  assert.strictEqual(r.trocou, true, 'a mescla trocou o objeto do estado');
  assert.notStrictEqual(r.cor, r.antes);
  assert.strictEqual(r.agora, r.cor, 'a pele escolhida está no estado');
  assert.strictEqual(r.gravado, r.cor, 'a pele escolhida foi gravada');
}));

// o mesmo padrão no Treino da Medalha (atividades/treino.js guarda `est = P.estado()` ao abrir e, no fim do Ritual
// da Calma, faz `est.ritualVisto = true`): mescla durante a respiração, e o "já viu o ritual" tem que ficar gravado
test('treino: o ritual visto fica gravado mesmo se o progresso for mesclado durante a respiração', () => comJogo(async (page) => {
  const trocou = await page.evaluate(async (mesclar) => {
    var mesclarDeOutraAba = (0, eval)('(' + mesclar + ')');
    Reino.Prova.iniciar(Reino.materias[0], function () {});
    window.__congelar.avancar(600);
    [...document.querySelectorAll('.tela-prova .ritual button')].find(function (b) { return /respirar/.test(b.textContent); }).click();
    await Promise.resolve();
    window.__congelar.avancar(100);
    return mesclarDeOutraAba();
  }, mesclarDeOutraAba.toString());
  for (let i = 0; i < 30; i++) { await avancar(page, 1000); await page.evaluate(() => window.__esperarReal(5)); }
  const r = await page.evaluate(() => ({ plano: !document.querySelector('.tela-prova .ritual'), agora: Reino.Progresso.estado().ritualVisto,
    gravado: JSON.parse(localStorage.getItem(Reino.config.chaveSave)).ritualVisto }));
  assert.strictEqual(trocou, true, 'a mescla trocou o objeto do estado');
  assert.deepStrictEqual(r, { plano: true, agora: true, gravado: true }, 'o ritual terminou e ficou gravado como visto');
}, (save) => { save.ritualVisto = false; }));
