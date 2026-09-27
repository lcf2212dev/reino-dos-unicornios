// Teste de NAVEGADOR (Chromium, servidor de TESTE, save sintético, ?debug=1&congelar=1): no balão de conversa,
// os botões (menos o 🔊) ficam desabilitados enquanto a fala toca; Enter, Esc e clique não avançam; tudo
// libera quando a fala acaba. Sem espera (voz desligada), nada fica desabilitado.
// Reino.Som.falarEsperando vira um stub com o fim controlado pelo teste.
const { test } = require('node:test');
const assert = require('assert');
const { iniciar } = require('../servidor-teste');
const { abrir, lancar } = require('../navegador');
const { gerarSaves } = require('../saves');

const esperarJogo = (page) => page.waitForFunction(() => window.__congelar && window.Reino && Reino.Claude && Reino.UI, null, { timeout: 30000 });

test('balão espera a fala antes de liberar Continuar, Esc e Enter', async () => {
  const servidor = await iniciar();
  const browser = await lancar();
  try {
    const a = await abrir({ browser, url: servidor.url, query: '?debug=1&congelar=1' });
    await esperarJogo(a.page);
    const save = (await a.page.evaluate(`(${gerarSaves.toString()})()`)).inicio;
    await a.context.close();

    const { page } = await abrir({ browser, url: servidor.url, save, query: '?debug=1&congelar=1' });
    await esperarJogo(page);
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      Reino.Claude.limpar();
      window.__resp = [];
      Reino.Som.falarEsperando = function () {
        return { espera: true, fim: new Promise(function (r) { window.__liberar = r; }) };
      };
      Reino.Claude.falar('Oi, Mariana! Vamos ouvir?', { modal: true,
        botoes: [{ texto: 'Continuar →', valor: 'ok', principal: true }, { texto: 'Agora não', valor: 'nao' }] })
        .then(function (v) { window.__resp.push(v); });
    });
    const estado = () => page.evaluate(() => {
      var bal = document.querySelector('#claude-balao');
      return {
        aberto: !bal.hidden,
        travados: Array.from(bal.querySelectorAll('.claude-acoes button:disabled')).map(function (b) { return b.textContent; }),
        ouvirLivre: !bal.querySelector('.btn-ouvir-claude').disabled,
        esperando: Reino.UI.esperandoFala(),
        resp: window.__resp.slice(),
      };
    });
    let e = await estado();
    assert.ok(e.aberto);
    assert.strictEqual(e.travados.length, 2, 'Continuar e "Agora não" desabilitados');
    assert.ok(e.ouvirLivre, 'o 🔊 fica livre');
    assert.ok(e.esperando);
    await page.keyboard.press('Enter');
    await page.keyboard.press('Escape');
    await page.click('#claude-balao .btn-dialogo.principal', { force: true });
    await page.waitForTimeout(100);
    e = await estado();
    assert.ok(e.aberto, 'Enter, Esc e clique não fecham durante a fala');
    assert.deepStrictEqual(e.resp, []);
    await page.evaluate(() => window.__liberar());
    await page.waitForFunction(() => !document.querySelector('#claude-balao .claude-acoes button:disabled'));
    e = await estado();
    assert.ok(!e.esperando, 'liberou');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.__resp.length === 1);
    assert.deepStrictEqual((await estado()).resp, ['ok'], 'Enter avança depois da fala');

    // 🔊 durante a espera: repete e estica a espera até o fim da repetição (A solta, B ainda não)
    await page.evaluate(() => {
      window.__fins = [];
      Reino.Som.falarEsperando = function () {
        var f = {}; f.p = new Promise(function (r) { f.r = r; }); window.__fins.push(f);
        return { espera: true, fim: f.p };
      };
      Reino.Claude.falar('Mais uma vez!', { modal: true, botoes: [{ texto: 'Continuar →', valor: 'ok', principal: true }] })
        .then(function (v) { window.__resp.push(v); });
    });
    await page.waitForFunction(() => window.__fins.length === 1);
    await page.focus('#claude-balao .btn-ouvir-claude');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.__fins.length === 2);
    await page.evaluate(() => window.__fins[0].r());
    await page.waitForTimeout(200);
    e = await estado();
    assert.strictEqual(e.travados.length, 1, 'depois de A, ainda travado (a repetição B toca)');
    assert.ok(e.esperando);
    await page.evaluate(() => window.__fins[1].r());
    await page.waitForFunction(() => !document.querySelector('#claude-balao .claude-acoes button:disabled'));
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => window.__resp.length === 2);

    // sem espera: nada fica desabilitado
    await page.evaluate(() => {
      Reino.Som.falarEsperando = function () { return { espera: false, fim: Promise.resolve() }; };
      Reino.Claude.falar('De novo!', { modal: true, botoes: [{ texto: 'Continuar →', valor: 'ok', principal: true }] })
        .then(function (v) { window.__resp.push(v); });
    });
    await page.waitForTimeout(400);
    e = await estado();
    assert.ok(e.aberto);
    assert.deepStrictEqual(e.travados, [], 'sem espera, nada desabilitado');
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => window.__resp.length === 3);
  } finally {
    await browser.close();
    servidor.parar();
  }
});
