// Teste de NAVEGADOR (Chromium, servidor de TESTE, save sintético, ?debug=1&congelar=1): na revisão da prova da
// Escola (js/atividades/provas.js), o "Próxima →" da penúltima questão e o "Entregar a prova 📝" da última nascem
// no MESMO lugar do rodapé, e o novo botão vale na hora. Um toque duplo no "Próxima →" (o 2º toque 120 ms depois,
// no mesmo ponto) pula a revisão da última questão e ENTREGA a prova (conta a tentativa e decide o acessório).
// Pelo teclado isso não acontece (CALMA_TROCA descarta o Enter que chega logo depois); pelo toque não há espera.
// Prova sintética: a 1ª prova do jogo com 3 questões de escolha (o save é sintético; o registro vai para
// provas['teste-toque-duplo']).
// Correto: o 2º toque do toque duplo não entrega a prova (ela continua revisando a última questão).
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/prova-toque-duplo-entrega.navegador.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { iniciar } = require('../servidor-teste');
const { abrir, lancar } = require('../navegador');
const { gerarSaves } = require('../saves');

const avancar = (page, ms) => page.evaluate((m) => window.__congelar.avancar(m), ms);
const esperarJogo = (page) => page.waitForFunction(() => window.__congelar && window.Reino && Reino.Provas, null, { timeout: 30000 });
const botao = (page, re) => page.evaluate((r) => {
  var b = [...document.querySelectorAll('.tela-prova button')].find((x) => new RegExp(r).test(x.textContent) && !x.hidden && x.offsetParent);
  if (!b) return null;
  var q = b.getBoundingClientRect();
  return { x: q.left + q.width / 2, y: q.top + q.height / 2, esq: q.left, dir: q.right, topo: q.top, base: q.bottom };
}, re);
// passos de preparo: clique de código (o botão pode estar fora da vista); só o toque duplo é de mouse de verdade
async function tocar(page, re) {
  const ok = await page.evaluate((r) => {
    var b = [...document.querySelectorAll('.tela-prova button')].find((x) => new RegExp(r).test(x.textContent) && !x.hidden && x.offsetParent);
    if (b) b.click();
    return !!b;
  }, re);
  if (!ok) throw new Error('sem botão ' + re);
  await avancar(page, 50);
}

test('prova: toque duplo no "Próxima" da revisão não entrega a prova sem querer', async () => {
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
      Reino.Progresso.estado().ritualVisto = true;
      var q = function (n) { return { id: 'tt-' + n, tipo: 'escolha', pergunta: 'Pergunta ' + n + '?', opcoes: [{ t: 'Sim' }, { t: 'Não' }], certa: 0, explica: 'x' }; };
      var pv = Object.assign({}, Reino.provas[0], { id: 'teste-toque-duplo', questoes: [q(1), q(2), q(3)] });
      Reino.Provas.iniciar(pv, function () {});
    });
    await avancar(page, 600);
    await tocar(page, 'Começar a prova');
    await tocar(page, 'Já respirei');
    await avancar(page, 600);
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => document.querySelector('.tela-prova .opcao').click());
      await avancar(page, 10000);   // sem o aviso de pressa
      await tocar(page, i < 2 ? 'Próxima' : 'Terminei');
      await avancar(page, 500);
    }
    await tocar(page, 'Sim, quero revisar');
    await avancar(page, 500);
    await tocar(page, 'Próxima');   // revisou a 1ª
    await avancar(page, 1000);
    // penúltima: toque duplo no "Próxima"
    const p = await botao(page, 'Próxima');
    await page.mouse.click(p.x, p.y);
    await avancar(page, 120);
    const entregar = await botao(page, 'Entregar');
    await page.mouse.click(p.x, p.y);
    await avancar(page, 300);
    const r = await page.evaluate(() => ({
      tentativas: (Reino.Progresso.estado().provas['teste-toque-duplo'] || {}).tentativas || 0,
      resultado: !!document.querySelector('.tela-prova .resultado-prova'),
      // o 👀 vira ícone pixel art (fora do textContent)
      num: ((document.querySelector('.tela-prova .desafio-num') || {}).textContent || '').trim() || null,
    }));
    // o dedo do "Próxima" cai dentro do "Entregar" (com a fonte pixel ele é mais largo: o centro muda, o dedo não sai)
    assert.ok(entregar && p.x > entregar.esq && p.x < entregar.dir && p.y > entregar.topo && p.y < entregar.base, 'o "Entregar" nasce sob o dedo do "Próxima"');
    assert.deepStrictEqual(r, { tentativas: 0, resultado: false, num: 'Revisando a questão 3 de 3' }, 'o 2º toque não entregou a prova');
    assert.deepStrictEqual(page.__erros, []);
  } finally {
    await browser.close();
    servidor.parar();
  }
});
