// Teste de NAVEGADOR (Chromium, servidor de TESTE, save sintético, modo determinístico ?debug=1&congelar=1):
// os controles de andar (motor/entrada.js). Mouse segurado segue o ponteiro e soltar para; clique rápido
// ainda anda até o ponto; dedo arrastado na metade esquerda mostra o thumbstick e anda; toque rápido na
// metade esquerda ainda anda até o ponto; as setas do teclado ainda andam; config.controles.zonaMorta vale.
// Os ponteiros são PointerEvents sintéticos no canvas (mouse no notebook, toque no celular).
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/controles.navegador.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { iniciar } = require('../servidor-teste');
const { abrir, lancar } = require('../navegador');
const { gerarSaves } = require('../saves');

const avancar = (page, ms) => page.evaluate((m) => window.__congelar.avancar(m), ms);

// no mapa, com os ajudantes: __pt (evento de ponteiro), __ela (posição/tile/olhar), __tela (px do jogo → tela)
async function abrirMapa(browser, url, save, tamanho) {
  const { context, page } = await abrir({ browser, url, save, tamanho, query: '?debug=1&congelar=1' });
  await page.waitForFunction(() => window.__congelar && window.Jogador && Reino._motor && Reino._motor.jogoAtivo, null, { timeout: 30000 });
  // parte da boca do eixo sul (27,28), campo aberto; o início do jogo (lugares.js) fica perto dos postes da praça
  await page.evaluate(() => Jogador.posicionar(27, 28));
  await avancar(page, 1500);   // a câmera assenta nela
  await page.evaluate(() => {
    window.__pt = function (tipo, pt, x, y, id) {
      Reino._motor.canvas.dispatchEvent(new PointerEvent(tipo, { bubbles: true, cancelable: true, pointerType: pt,
        pointerId: id || 1, isPrimary: true, button: tipo === 'pointermove' ? -1 : 0, buttons: tipo === 'pointerup' ? 0 : 1, clientX: x, clientY: y }));
    };
    window.__ela = function () {
      var t = Jogador.tile();
      return { x: Jogador.x, y: Jogador.y, tx: t.x, ty: t.y, ox: Jogador.olharX, oy: Jogador.olharY, andando: Jogador.andando, caminho: Jogador.caminho.length };
    };
    window.__tela = function (wx, wy) { return Reino.Cena.paraTela(wx, wy); };
    // um tile livre na mesma linha, a `lado` tiles, com a linha reta até ele livre (a seta do teclado volta por ela)
    window.__livre = function (lado) {
      var t = Jogador.tile(), c = Reino.Cena.atual(), s = lado > 0 ? 1 : -1;
      for (var d = 1; d < Math.abs(lado) + 6; d++) {
        var x = t.x + s * d;
        if (c.solido(x, t.y)) return null;
        if (d >= Math.abs(lado) && c.caminho(t, { x: x, y: t.y })) return { x: x, y: t.y };
      }
      return null;
    };
  });
  return { context, page };
}
const ela = (page) => page.evaluate(() => window.__ela());

test('controles: mouse segurado, clique rápido, thumbstick, toque rápido e teclado', async () => {
  const servidor = await iniciar();
  const browser = await lancar();
  try {
    const a = await abrir({ browser, url: servidor.url, query: '?debug=1&congelar=1' });
    await a.page.waitForFunction(() => window.__congelar && window.Reino && Reino.Desafios, null, { timeout: 30000 });
    const save = (await a.page.evaluate(`(${gerarSaves.toString()})()`)).completo;
    await a.context.close();

    /* ---------- notebook: mouse e teclado ---------- */
    const nb = await abrirMapa(browser, servidor.url, save, 'notebook');
    let page = nb.page;
    assert.strictEqual(await page.evaluate(() => !!document.querySelector('#setas')), false, 'sem setas na tela');

    // mouse segurado à direita dela: segue; o ponteiro vai para baixo: ela vira e desce; soltou: para
    let e0 = await ela(page);
    let p = await page.evaluate((e) => window.__tela(e.x, e.y - 8), e0);
    await page.evaluate((q) => { window.__pt('pointerdown', 'mouse', q.x + 120, q.y); }, p);
    await avancar(page, 150);
    assert.strictEqual((await ela(page)).x, e0.x, 'antes de 300 ms parado segurando ainda não anda');
    await avancar(page, 500);
    let e1 = await ela(page);
    assert.ok(e1.x > e0.x + 5, `segurando o mouse ela anda para o ponteiro (${e0.x} → ${e1.x})`);
    assert.deepStrictEqual([Math.round(e1.ox), Math.round(e1.oy)], [1, 0], 'olhando para a direita');
    p = await page.evaluate((e) => window.__tela(e.x, e.y - 8), e1);
    await page.evaluate((q) => { window.__pt('pointermove', 'mouse', q.x, q.y + 150); }, p);
    await avancar(page, 400);
    let e2 = await ela(page);
    assert.ok(e2.y > e1.y + 5, 'segue o ponteiro que desceu');
    assert.deepStrictEqual([Math.round(e2.ox), Math.round(e2.oy)], [0, 1], 'olhando para baixo (8 direções)');
    await page.evaluate((q) => { window.__pt('pointerup', 'mouse', q.x, q.y + 150); }, p);
    await avancar(page, 100);
    let e3 = await ela(page);
    await avancar(page, 500);
    let e4 = await ela(page);
    assert.ok(e4.x === e3.x && e4.y === e3.y && !e4.andando, 'soltou o botão: ela para');

    // clique rápido num tile do chão: vai até lá sozinha
    let alvo = await page.evaluate(() => window.__livre(3));
    p = await page.evaluate((t) => window.__tela(t.x * 16 + 8, t.y * 16 + 8), alvo);
    await page.evaluate((q) => { window.__pt('pointerdown', 'mouse', q.x, q.y); window.__pt('pointerup', 'mouse', q.x, q.y); }, p);
    await avancar(page, 3000);
    let e5 = await ela(page);
    assert.deepStrictEqual([e5.tx, e5.ty], [alvo.x, alvo.y], 'o clique rápido leva até o tile clicado');

    // setas do teclado
    await page.keyboard.down('ArrowLeft');
    await avancar(page, 400);
    await page.keyboard.up('ArrowLeft');
    const e6 = await ela(page);
    assert.ok(e6.x < e5.x - 5, 'a seta do teclado anda');
    assert.deepStrictEqual(page.__erros, []);
    await nb.context.close();

    /* ---------- celular: thumbstick e toque rápido ---------- */
    const cel = await abrirMapa(browser, servidor.url, save, 'celular');
    page = cel.page;
    e0 = await ela(page);
    const ini = { x: 80, y: 600 };
    await page.evaluate((q) => { window.__pt('pointerdown', 'touch', q.x, q.y, 7); }, ini);
    await avancar(page, 100);
    assert.strictEqual(await page.evaluate(() => document.querySelector('#controle').hidden), true, 'sem arrastar, nada de thumbstick');
    await page.evaluate((q) => { window.__pt('pointermove', 'touch', q.x + 40, q.y, 7); }, ini);
    const pos = await page.evaluate(() => { var c = document.querySelector('#controle'), b = c.querySelector('.controle-base').getBoundingClientRect(); return { hidden: c.hidden, x: b.x + b.width / 2, y: b.y + b.height / 2 }; });
    assert.strictEqual(pos.hidden, false, 'arrastou: o thumbstick aparece');
    assert.ok(Math.abs(pos.x - ini.x) < 2 && Math.abs(pos.y - ini.y) < 2, 'no lugar onde o dedo encostou');
    // um 2º dedo na metade direita não trava o thumbstick
    await page.evaluate(() => { window.__pt('pointerdown', 'touch', 300, 700, 8); window.__pt('pointerup', 'touch', 300, 700, 8); });
    await avancar(page, 500);
    e1 = await ela(page);
    assert.ok(e1.x > e0.x + 5, `o thumbstick anda para a direita (${e0.x} → ${e1.x})`);
    await page.evaluate((q) => { window.__pt('pointerup', 'touch', q.x + 40, q.y, 7); }, ini);
    await avancar(page, 100);
    assert.strictEqual(await page.evaluate(() => document.querySelector('#controle').hidden), true, 'soltou: o thumbstick some');
    e2 = await ela(page);
    await avancar(page, 400);
    e3 = await ela(page);
    assert.ok(e3.x === e2.x && e3.y === e2.y, 'soltou: ela para');

    // toque rápido na metade esquerda: anda até o ponto
    alvo = await page.evaluate(() => window.__livre(-3));
    p = await page.evaluate((t) => window.__tela(t.x * 16 + 8, t.y * 16 + 8), alvo);
    assert.ok(p.x < 195, 'o ponto tocado está na metade esquerda');
    await page.evaluate((q) => { window.__pt('pointerdown', 'touch', q.x, q.y, 9); window.__pt('pointermove', 'touch', q.x + 3, q.y, 9); window.__pt('pointerup', 'touch', q.x + 3, q.y, 9); }, p);
    await avancar(page, 3000);
    e4 = await ela(page);
    assert.deepStrictEqual([e4.tx, e4.ty], [alvo.x, alvo.y], 'o toque rápido leva até o tile tocado');

    // config.controles.zonaMorta maior: o mesmo arrasto de 40 px não anda mais; 60 px anda
    await page.evaluate(() => { Reino.config.controles.zonaMorta = 50; });
    const arrastar = async (dx, id) => {
      const a0 = await ela(page);
      await page.evaluate((q) => { window.__pt('pointerdown', 'touch', q.x, q.y, q.id); window.__pt('pointermove', 'touch', q.x + q.dx, q.y, q.id); }, { ...ini, dx, id });
      await avancar(page, 500);
      const a1 = await ela(page);
      await page.evaluate((q) => { window.__pt('pointerup', 'touch', q.x + q.dx, q.y, q.id); }, { ...ini, dx, id });
      await avancar(page, 100);
      return a1.x - a0.x;
    };
    assert.strictEqual(await arrastar(40, 10), 0, 'zona morta de 50 px: arrasto de 40 px não anda');
    assert.ok((await arrastar(60, 11)) > 5, 'zona morta de 50 px: arrasto de 60 px anda');
    await page.evaluate(() => { Reino.config.controles.zonaMorta = 10; });
    assert.deepStrictEqual(page.__erros, []);
    await cel.context.close();
  } finally {
    await browser.close();
    servidor.parar();
  }
});
