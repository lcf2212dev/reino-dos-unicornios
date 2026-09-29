// Teste de NAVEGADOR (Chromium, servidor de TESTE, save sintético, ?debug=1&congelar=1): ouvir antes de seguir
// no Treino da Medalha (js/atividades/treino.js). Com Reino.Som.falarEsperando trocado por um stub que devolve
// { espera: true, fim: <promise controlada> }, o plano, cada questão (lida sozinha) e o resultado travam os
// botões (e o ✕) até a fala acabar. Matéria sintética: a 1ª do jogo com 2 questões de escolha.
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/ouvir-prova-treino.navegador.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { iniciar } = require('../servidor-teste');
const { abrir, lancar } = require('../navegador');
const { gerarSaves } = require('../saves');

const avancar = (page, ms) => page.evaluate((m) => window.__congelar.avancar(m), ms);
const esperarJogo = (page) => page.waitForFunction(() => window.__congelar && window.Reino && Reino.Prova, null, { timeout: 30000 });
async function tocar(page, seletorOuTexto) {
  const ok = await page.evaluate((r) => {
    var t = document.querySelector('.tela-prova');
    var b = [...t.querySelectorAll('button')].find((x) => (x.matches(r.replace(/^css:/, '')) && r.startsWith('css:')) || (!r.startsWith('css:') && new RegExp(r).test(x.textContent)));
    if (b) b.click();
    return !!b;
  }, seletorOuTexto);
  if (!ok) throw new Error('sem botão ' + seletorOuTexto);
  await avancar(page, 100);
}
const trav = (page, sel, re) => page.evaluate(([s, r]) => {
  var t = document.querySelector('.tela-prova');
  var b = r ? [...t.querySelectorAll(s)].find((x) => new RegExp(r).test(x.textContent)) : t.querySelector(s);
  return b ? b.disabled && b.classList.contains('esperando-fala') : null;
}, [sel, re]);
const soltar = (page) => page.evaluate(() => { var p = window.__fala.pendentes.splice(0); p.forEach((r) => r()); return p.length; });
const modo = (page, espera) => page.evaluate((e) => { window.__fala.espera = e; }, espera);

test('treino: plano, questão e resultado travam até a fala acabar', async () => {
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
      var q = function (n) { return { id: 'ot-' + n, tipo: 'escolha', pergunta: 'Treino ' + n + '?', opcoes: [{ t: 'Sim' }, { t: 'Não' }], certa: 0, explica: 'x' }; };
      var m = Object.assign({}, Reino.materias[0], { salas: [{ id: 'ot-sala', desafios: [q(1), q(2)] }] });
      Reino.Prova.iniciar(m, function () {});
    });
    await avancar(page, 600);
    await tocar(page, 'Já respirei');
    await avancar(page, 600);
    // plano
    assert.strictEqual(await trav(page, 'button', 'Começar o treino'), true, 'plano: "Começar" travado');
    assert.strictEqual(await trav(page, '.btn-sair'), true, 'plano: ✕ travado');
    assert.strictEqual(await soltar(page), 1);
    assert.strictEqual(await trav(page, 'button', 'Começar o treino'), false, 'plano: livre no fim');
    await tocar(page, 'Começar o treino');
    // questão
    assert.ok(/Treino \d\?/.test(await page.evaluate(() => JSON.stringify(window.__fala.segs[window.__fala.segs.length - 1]))), 'a questão foi lida');
    assert.deepStrictEqual([await trav(page, '.opcao'), await trav(page, 'button', 'Próxima'), await trav(page, '.btn-sair')], [true, true, true], 'questão travada');
    await soltar(page);
    assert.deepStrictEqual([await trav(page, '.opcao'), await trav(page, 'button', 'Próxima'), await trav(page, '.btn-sair')], [false, false, false], 'questão livre no fim');
    // o resto sem espera, até entregar
    await modo(page, false);
    await tocar(page, 'css:.opcao');
    await tocar(page, 'Próxima');
    await tocar(page, 'css:.opcao');
    await tocar(page, 'Ir para a revisão');
    for (let i = 0; i < 2; i++) {
      await page.evaluate((k) => document.querySelectorAll('.tela-prova .item-revisao')[k].click(), i);
      await avancar(page, 100);
      await tocar(page, 'Revisei');
    }
    await modo(page, true);
    await tocar(page, 'Entregar a prova');
    await avancar(page, 500);
    assert.strictEqual(await trav(page, '.resultado-prova button'), true, 'resultado: botão do fim travado');
    assert.strictEqual(await trav(page, '.btn-sair'), true, 'resultado: ✕ travado');
    await soltar(page);
    assert.strictEqual(await trav(page, '.resultado-prova button'), false, 'resultado: livre no fim');
    assert.strictEqual(await trav(page, '.btn-sair'), false);
    assert.deepStrictEqual(page.__erros, []);
  } finally {
    await browser.close();
    servidor.parar();
  }
});
