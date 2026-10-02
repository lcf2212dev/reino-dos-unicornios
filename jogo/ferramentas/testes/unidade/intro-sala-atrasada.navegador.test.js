// Teste de NAVEGADOR (Chromium, servidor de TESTE, save sintético, ?debug=1&congelar=1): a fala da introdução
// da sala (js/atividades/missao.js, intro()) espera o pacote de voz da sala carregar e fala SEM olhar se a
// introdução ainda está na tela. Com a rede lenta (pacote de ~700 KB, 1ª vez na sessão), ela toca "Começar" (ou
// sai da sala) antes do pacote chegar; quando ele chega, o Claude lê o nome e a introdução da sala por cima do
// desafio 1 (V.falar cala o que estava tocando) — ou no mapa, depois de sair.
// O pacote é atrasado 1,5 s com page.route (só neste teste). Correto: nenhuma fala da introdução depois de sair dela.
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/intro-sala-atrasada.navegador.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { iniciar } = require('../servidor-teste');
const { abrir, lancar } = require('../navegador');
const { gerarSaves } = require('../saves');

const avancar = (page, ms) => page.evaluate((m) => window.__congelar.avancar(m), ms);
const esperarJogo = (page) => page.waitForFunction(() => window.__congelar && window.Reino && Reino.Missao, null, { timeout: 30000 });

async function comSala(fn) {
  const servidor = await iniciar();
  const browser = await lancar();
  try {
    const a = await abrir({ browser, url: servidor.url, query: '?debug=1&congelar=1' });
    await esperarJogo(a.page);
    const save = (await a.page.evaluate(`(${gerarSaves.toString()})()`)).completo;
    await a.context.close();
    const { page } = await abrir({ browser, url: servidor.url, save, query: '?debug=1&congelar=1' });
    await esperarJogo(page);
  await require('./ajudantes/terceiro-bimestre').noNavegador(page);
    await avancar(page, 3000);
    const m = await page.evaluate(() => ({ m: Reino.materias[0].id, s: Reino.materias[0].salas[0].id }));
    // rede lenta só para o pacote de voz desta sala
    await page.route('**/js/voz/' + m.m + '-' + m.s + '.js*', async (r) => { await new Promise((ok) => setTimeout(ok, 1500)); r.continue(); });
    await page.evaluate(() => {
      var m = Reino.materias[0], s = m.salas[0];
      window.__falas = [];
      var falar = Reino.Som.falar;
      Reino.Som.falar = function (seg) { window.__falas.push({ texto: JSON.stringify(seg).slice(0, 80), intro: JSON.stringify(seg).indexOf(JSON.stringify(s.intro).slice(1, 30)) >= 0,
        naIntro: !!document.querySelector('.tela-missao .intro-sala'), comMissao: !!document.querySelector('.tela-missao') }); return falar.apply(this, arguments); };
      Reino.Missao.iniciar(m, s, function () {});
    });
    await avancar(page, 300);
    await fn(page);
  } finally {
    await browser.close();
    servidor.parar();
  }
}

test('sala: "Começar" antes do pacote de voz chegar: a introdução não é lida por cima do desafio 1', () => comSala(async (page) => {
  await page.evaluate(() => [...document.querySelectorAll('.tela-missao .intro-botoes button')].find((b) => /Começar/.test(b.textContent)).click());
  await avancar(page, 300);
  await page.waitForTimeout(3000);   // o pacote chega (tempo real)
  await avancar(page, 300);
  const falas = await page.evaluate(() => window.__falas);
  const fora = falas.filter((f) => f.intro && !f.naIntro);
  assert.deepStrictEqual(fora, [], 'a introdução não é falada fora da tela de introdução');
}));

test('sala: sair antes do pacote de voz chegar: a introdução não é lida no mapa', () => comSala(async (page) => {
  await page.evaluate(async () => {
    document.querySelector('.tela-missao .btn-sair').click();
    window.__congelar.avancar(100);
    [...document.querySelectorAll('.tela-confirmar button')].find((b) => b.textContent.trim() === 'Sair').click();
    for (var k = 0; k < 5; k++) await Promise.resolve();
  });
  assert.strictEqual(await page.evaluate(() => !!document.querySelector('.tela-missao')), false, 'saiu da sala');
  await page.waitForTimeout(3000);
  await avancar(page, 300);
  const falas = await page.evaluate(() => window.__falas);
  const fora = falas.filter((f) => f.intro && !f.comMissao);
  assert.deepStrictEqual(fora, [], 'a introdução não é falada depois de sair da sala');
}));
