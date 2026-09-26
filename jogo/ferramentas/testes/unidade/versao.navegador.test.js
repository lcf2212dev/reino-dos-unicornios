// Teste de NAVEGADOR (Chromium, servidor de TESTE, save sintético, modo determinístico): a versão nova
// (js/sistemas/versao.js). O js/versao.json é servido pelo page.route (v1 e depois v2), com os tempos do
// config.versao encurtados. Sem &versao=1 (o e2e) não há fetch nenhum. Com &versao=1: confirma a v2, mas com
// uma tela aberta ou com ela andando não avisa nem recarrega; parada no mapa, o Claude avisa, o jogo grava
// (P.salvar) e SÓ DEPOIS recarrega (o _recarregar é trocado por um de mentira). Tocar no aviso cancela.
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/versao.navegador.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { iniciar } = require('../servidor-teste');
const { abrir, lancar } = require('../navegador');
const { gerarSaves } = require('../saves');

const avancar = (page, ms) => page.evaluate((m) => window.__congelar.avancar(m), ms);
const dep = (page) => page.evaluate(() => __reino.modulo('versao'));
// anda o relógio virtual até a condição valer (o fetch do page.route responde em tempo real)
async function ate(page, cond, maxMs, passo = 250) {
  for (let t = 0; t <= maxMs; t += passo) {
    const d = await dep(page);
    if (cond(d)) return d;
    await avancar(page, passo);
  }
  const d = await dep(page);
  assert.fail('não chegou lá: ' + JSON.stringify(d));
}
const RAPIDO = { intervaloMs: 3000, confirmarMs: 1000, cacheMs: 0, paradaMs: 1500, avisoMs: 1200, esperaMs: 600 };

async function abrirJogo(browser, url, save, query, servida) {
  const { context, page } = await abrir({ browser, url, save, tamanho: 'notebook', query });
  page.__pedidos = 0;
  await page.route(/\/js\/versao\.json/, (r) => {
    page.__pedidos++;
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ versao: servida.v, gerado: 'teste' }) });
  });
  // de novo, já com a rota (o save sintético continua: só entra na primeira carga da aba)
  await page.reload();
  await page.waitForFunction(() => window.__congelar && window.Jogador && Reino._motor && Reino._motor.jogoAtivo, null, { timeout: 30000 });
  await page.evaluate((c) => {
    Reino.config.versao = c;
    window.__ordem = [];
    var salvar = Reino.Progresso.salvar;
    Reino.Progresso.salvar = function () { window.__ordem.push('salvar'); return salvar.apply(this, arguments); };
    Reino.Versao._recarregar = function () { window.__ordem.push('recarregar'); };
  }, RAPIDO);
  await avancar(page, 500);
  return { context, page };
}

test('versão nova: sem fetch no e2e; tela aberta e andando esperam; parada no mapa avisa, grava e recarrega', async () => {
  const servidor = await iniciar();
  const browser = await lancar();
  const servida = { v: 'v1' };
  try {
    const a = await abrir({ browser, url: servidor.url, query: '?debug=1&congelar=1' });
    await a.page.waitForFunction(() => window.__congelar && window.Reino && Reino.Desafios, null, { timeout: 30000 });
    const save = (await a.page.evaluate(`(${gerarSaves.toString()})()`)).completo;
    await a.context.close();

    /* ---------- modo determinístico (o e2e): desligado, nenhum pedido ---------- */
    const e2e = await abrirJogo(browser, servidor.url, save, '?debug=1&congelar=1', servida);
    await avancar(e2e.page, 5000);
    let d = await dep(e2e.page);
    assert.strictEqual(d.motivo, 'congelado');
    assert.strictEqual(d.fase, 'desligado');
    assert.strictEqual(e2e.page.__pedidos, 0, 'nenhum fetch do versao.json');
    assert.deepStrictEqual(e2e.page.__erros, []);
    await e2e.context.close();

    /* ---------- com &versao=1 ---------- */
    const { context, page } = await abrirJogo(browser, servidor.url, save, '?debug=1&congelar=1&versao=1', servida);
    d = await ate(page, (x) => x.base !== null, 5000);
    assert.strictEqual(d.base, 'v:v1', 'linha de base');
    assert.strictEqual(d.fase, 'vigiando');
    // mesma versão: continua vigiando
    await avancar(page, 3500);
    d = await ate(page, (x) => x.buscas >= 2, 5000);
    assert.strictEqual(d.fase, 'vigiando');

    // saiu a v2, com uma tela aberta: confirma, mas não avisa
    servida.v = 'v2';
    await page.evaluate(() => { Reino.Claude.limpar(); Reino.UI.telaAjustes(); });
    d = await ate(page, (x) => x.fase === 'nova', 12000);
    assert.strictEqual(d.nova, 'v:v2');
    await avancar(page, 4000);
    d = await dep(page);
    assert.strictEqual(d.fase, 'nova', 'tela aberta: espera');
    assert.strictEqual(d.avisos, 0);
    assert.deepStrictEqual(await page.evaluate(() => window.__ordem), []);

    // fechou a tela, mas ela está andando (setas seguradas, para lá e para cá): não avisa
    await page.evaluate(() => Reino.UI.fecharTodas());
    for (const tecla of ['ArrowRight', 'ArrowLeft', 'ArrowRight', 'ArrowLeft']) {
      await page.keyboard.down(tecla);
      await avancar(page, 1000);
      assert.strictEqual(await page.evaluate(() => Jogador.andando), true, 'andando com ' + tecla);
      await page.keyboard.up(tecla);
    }
    d = await dep(page);
    assert.strictEqual(d.avisos, 0, 'andando: sem aviso');
    assert.strictEqual(await page.evaluate(() => Reino.Cena.estado()), 'mapa');

    // parada no mapa: o aviso aparece; um toque no canvas no meio do aviso cancela
    d = await ate(page, (x) => x.fase === 'aviso', 5000, 100);
    let texto = await page.evaluate(() => document.querySelector('#claude-balao .claude-texto').textContent);
    assert.match(texto, /Chegou novidade no Reino!/);
    assert.match(texto, /O que você fez fica guardado\./);
    await page.evaluate(() => Reino._motor.canvas.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', clientX: 5, clientY: 400 })));
    await page.evaluate(() => Reino._motor.canvas.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch', clientX: 5, clientY: 400 })));
    d = await dep(page);
    assert.strictEqual(d.fase, 'nova', 'mexeu no aviso: desiste por agora');
    assert.strictEqual(d.cancelados, 1);
    assert.strictEqual(await page.evaluate(() => Reino.Claude.aberto()), false, 'o balão do aviso fechou');
    assert.deepStrictEqual(await page.evaluate(() => window.__ordem), []);

    // parada de novo (depois de ela chegar aonde o toque mandou): avisa, grava e só depois recarrega
    d = await ate(page, (x) => x.fase === 'aviso', 15000, 100);
    assert.strictEqual(d.avisos, 2);
    d = await ate(page, (x) => x.fase === 'recarregando', 5000, 100);
    assert.deepStrictEqual(await page.evaluate(() => window.__ordem), ['salvar', 'recarregar'], 'grava ANTES de recarregar');
    assert.deepStrictEqual(page.__erros, []);
    await context.close();
  } finally {
    await browser.close();
    servidor.parar();
  }
});
