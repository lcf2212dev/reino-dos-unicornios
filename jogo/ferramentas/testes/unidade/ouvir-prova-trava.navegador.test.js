// Teste de NAVEGADOR (Chromium, servidor de TESTE, save sintético, ?debug=1&congelar=1): ouvir antes de seguir
// na prova da Escola (js/atividades/provas.js). Com Reino.Som.falarEsperando trocado por um stub que devolve
// { espera: true, fim: <promise controlada> }, a capa, cada questão (lida sozinha) e o resultado travam os
// botões (e o ✕) até a fala acabar; o 🔊 da questão fica livre. Com { espera: false } nada trava.
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/ouvir-prova-trava.navegador.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { iniciar } = require('../servidor-teste');
const { abrir, lancar } = require('../navegador');
const { gerarSaves } = require('../saves');

const avancar = (page, ms) => page.evaluate((m) => window.__congelar.avancar(m), ms);
const esperarJogo = (page) => page.waitForFunction(() => window.__congelar && window.Reino && Reino.Provas, null, { timeout: 30000 });
async function tocar(page, re) {
  const ok = await page.evaluate((r) => {
    var b = [...document.querySelectorAll('.tela-prova button')].find((x) => new RegExp(r).test(x.textContent) && !x.hidden && x.offsetParent);
    if (b) b.click();
    return !!b;
  }, re);
  if (!ok) throw new Error('sem botão ' + re);
  await avancar(page, 50);
}
// estado dos botões: travado = disabled com a classe esperando-fala
const estado = (page) => page.evaluate(() => {
  var t = document.querySelector('.tela-prova');
  var achar = (re) => [...t.querySelectorAll('button')].find((x) => re.test(x.textContent) && !x.hidden);
  var trav = (b) => (b ? b.disabled && b.classList.contains('esperando-fala') : null);
  var ouvir = t.querySelector('.btn-ouvir');
  return {
    comecar: trav(achar(/Começar a prova/)),
    opcao: trav(t.querySelector('.opcao')),
    proxima: trav(achar(/Próxima|Terminei/)),
    voltar: trav(achar(/Voltar à Escola/)),
    sair: trav(t.querySelector('.btn-sair')),
    ouvirLivre: ouvir ? !ouvir.disabled : null,
    esperando: Reino.UI.esperandoFala(),
  };
});
const soltar = (page) => page.evaluate(() => { var p = window.__fala.pendentes.splice(0); p.forEach((r) => r()); return p.length; });
const modo = (page, espera) => page.evaluate((e) => { window.__fala.espera = e; }, espera);

test('prova: cada fala trava os botões até acabar (e sem espera nada trava)', async () => {
  const servidor = await iniciar();
  const browser = await lancar();
  try {
    const a = await abrir({ browser, url: servidor.url, query: '?debug=1&congelar=1' });
    await esperarJogo(a.page);
    const save = (await a.page.evaluate(`(${gerarSaves.toString()})()`)).completo;
    await a.context.close();
    const { page } = await abrir({ browser, url: servidor.url, save, query: '?debug=1&congelar=1' });
    await esperarJogo(page);
    await avancar(page, 3000);
    await page.evaluate(() => {
      window.__fala = { espera: true, pendentes: [], segs: [] };
      // a trava da leitura da questão é opcional (desligada no jogo): aqui ela vale, para conferir a opção
      Reino.config.esperaFala.travarQuestoes = true;
      Reino.Som.falarEsperando = function (segs) {
        window.__fala.segs.push(segs);
        if (!window.__fala.espera) return { espera: false, fim: Promise.resolve() };
        return { espera: true, fim: new Promise((r) => window.__fala.pendentes.push(r)) };
      };
      Reino.Progresso.estado().ritualVisto = true;
      var q = function (n) { return { id: 'op-' + n, tipo: 'escolha', pergunta: 'Pergunta ' + n + '?', opcoes: [{ t: 'Sim' }, { t: 'Não' }], certa: 0, explica: 'x' }; };
      var pv = Object.assign({}, Reino.provas[0], { id: 'teste-ouvir-prova', questoes: [q(1), q(2)] });
      Reino.Provas.iniciar(pv, function () {});
    });
    await avancar(page, 600);
    // capa
    let e = await estado(page);
    assert.strictEqual(e.comecar, true, 'capa: "Começar" travado');
    assert.strictEqual(e.sair, true, 'capa: ✕ travado');
    assert.strictEqual(e.esperando, true);
    assert.strictEqual(await soltar(page), 1);
    e = await estado(page);
    assert.strictEqual(e.comecar, false, 'capa: "Começar" livre no fim da fala');
    assert.strictEqual(e.sair, false);
    await tocar(page, 'Começar a prova');
    await tocar(page, 'Já respirei');
    await avancar(page, 600);
    // questão 1: lida sozinha, com a mesma fala do 🔊
    e = await estado(page);
    assert.deepStrictEqual([e.opcao, e.sair, e.esperando], [true, true, true], 'questão: respostas e ✕ travados');
    const lida = await page.evaluate(() => JSON.stringify(window.__fala.segs[window.__fala.segs.length - 1]));
    assert.ok(/Pergunta 1\?/.test(lida), 'a questão foi lida: ' + lida);
    if (e.ouvirLivre !== null) assert.strictEqual(e.ouvirLivre, true, 'o 🔊 fica livre');
    await soltar(page);
    e = await estado(page);
    assert.deepStrictEqual([e.opcao, e.sair, e.esperando], [false, false, false], 'questão: livre no fim da fala');
    await page.evaluate(() => document.querySelector('.tela-prova .opcao').click());
    await avancar(page, 10000);
    // sem espera (voz desligada): nada trava
    await modo(page, false);
    await tocar(page, 'Próxima');
    await avancar(page, 500);
    e = await estado(page);
    assert.deepStrictEqual([e.opcao, e.sair, e.esperando], [false, false, false], 'sem espera: nada trava');
    assert.strictEqual(await page.evaluate(() => document.querySelectorAll('.esperando-fala').length), 0);
    await page.evaluate(() => document.querySelector('.tela-prova .opcao').click());
    await avancar(page, 10000);
    await tocar(page, 'Terminei');
    await avancar(page, 500);
    // revisão: o balão do Claude fala primeiro (trava a questão) e depois a 1ª questão é lida (trava de novo)
    await modo(page, true);
    await tocar(page, 'Sim, quero revisar');
    await avancar(page, 300);
    const ultima = () => page.evaluate(() => JSON.stringify(window.__fala.segs[window.__fala.segs.length - 1]));
    e = await estado(page);
    assert.deepStrictEqual([e.opcao, e.sair], [true, true], 'revisão: travada durante o balão');
    const balao = await page.evaluate(() => Reino.Falas.provas.comecaRevisao);
    assert.strictEqual(await ultima(), JSON.stringify([balao]), 'revisão: o balão fala primeiro');
    assert.strictEqual(await soltar(page), 1);
    await avancar(page, 50);
    e = await estado(page);
    assert.ok(/Pergunta 1\?/.test(await ultima()), 'revisão: a 1ª questão é lida depois do balão');
    assert.deepStrictEqual([e.opcao, e.proxima, e.sair], [true, true, true], 'revisão: travada durante a leitura');
    await soltar(page);
    e = await estado(page);
    assert.deepStrictEqual([e.opcao, e.proxima, e.sair, e.esperando], [false, false, false, false], 'revisão: livre no fim');
    await tocar(page, 'Próxima');
    await soltar(page);
    // resultado
    await tocar(page, 'Entregar a prova');
    await avancar(page, 500);
    e = await estado(page);
    assert.deepStrictEqual([e.voltar, e.sair], [true, true], 'resultado: botões travados');
    await soltar(page);
    e = await estado(page);
    assert.deepStrictEqual([e.voltar, e.sair], [false, false], 'resultado: livre no fim da fala');
    assert.deepStrictEqual(page.__erros, []);
  } finally {
    await browser.close();
    servidor.parar();
  }
});
