// Teste de NAVEGADOR (Chromium, servidor de TESTE com banco novo em /tmp, save sintético, SEM congelar: no congelado a
// Mariana entra sempre e o teste passaria sem a correção): a versão nova recarrega a aba DIRETO NO MAPA, sem abertura
// nem senha (sistemas/versao.js + Jogadores.lembrarEntrada; docs/contratos/save-e-mescla.md §12). Com &versao=1, o
// js/versao.json servido pelo page.route (v1 e depois v2) e os tempos do config.versao encurtados: antes do reload
// (o _recarregar é trocado por um de mentira) o sessionStorage `reino-entrou` é igual a Jogadores.ultimo(); o reload
// de verdade cai no jogo da Mariana e nenhuma `.tela-inicio` aparece. O atalho vale uma vez: o reload seguinte pede
// a senha.
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/versao-entrou.navegador.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { iniciar } = require('../servidor-teste');
const { abrir, lancar } = require('../navegador');
const { gerarSaves } = require('../saves');

const SENHA = 'unicorlice77';
const RAPIDO = { intervaloMs: 1500, confirmarMs: 800, cacheMs: 0, paradaMs: 800, avisoMs: 800, esperaMs: 400 };
const esperar = (page, fn, arg, ms = 30000) => page.waitForFunction(fn, arg, { timeout: ms });
const noJogo = (page) => esperar(page, () => window.Reino && Reino.Progresso && Reino.Progresso.estado() && Reino.Jogadores.atual() === 'mariana' &&
  Reino._motor && Reino._motor.jogoAtivo && !!document.querySelector('#hud') && !document.querySelector('#hud').hidden);
// em cada carga: marca se a abertura (.tela-inicio) apareceu em algum momento
function vigiarAbertura() {
  window.__viuAbertura = false;
  new MutationObserver(function () { if (document.querySelector('.tela-inicio')) window.__viuAbertura = true; })
    .observe(document, { childList: true, subtree: true });
}

test('versão nova: o reload entra direto no mapa, sem abertura nem senha (uma vez só)', async () => {
  const servidor = await iniciar();
  const browser = await lancar();
  const servida = { v: 'v1' };
  try {
    const g = await abrir({ browser, url: servidor.url, query: '?debug=1&congelar=1' });
    await esperar(g.page, () => window.Reino && Reino.Progresso && Reino.Progresso.estado());
    const save = (await g.page.evaluate(`(${gerarSaves.toString()})()`)).completo;
    await g.context.close();

    const { context, page } = await abrir({ browser, url: servidor.url, save, query: '?debug=1&versao=1', scripts: [vigiarAbertura] });
    await page.route(/\/js\/versao\.json/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ versao: servida.v, gerado: 'teste' }) }));
    // modo vivo: abertura → "Entrar no Reino" → senha da Mariana
    await page.waitForSelector('.tela-inicio .btn-comecar', { timeout: 30000 });
    await page.click('.tela-inicio .btn-comecar');
    await page.waitForSelector('.tela-jogadores #jogador-entrar-senha', { timeout: 30000 });
    await page.fill('#jogador-entrar-senha', SENHA);
    await page.press('#jogador-entrar-senha', 'Enter');
    await noJogo(page);
    await page.evaluate((c) => {
      Reino.config.versao = c;
      window.__antes = null;
      Reino.Versao._recarregar = function () {
        var s = null;
        try { s = sessionStorage.getItem('reino-entrou'); } catch (e) { s = 'erro'; }
        window.__antes = { entrou: s, ultimo: Reino.Jogadores.ultimo() };
      };
      Reino.UI.fecharTodas();
      Reino.Claude.limpar();
    }, RAPIDO);
    const d0 = await page.evaluate(() => __reino.modulo('versao'));
    assert.strictEqual(d0.ligado, true, 'versão ligada com &versao=1: ' + JSON.stringify(d0));
    await esperar(page, () => __reino.modulo('versao').base !== null, null, 15000);
    assert.strictEqual(await page.evaluate(() => sessionStorage.getItem('reino-entrou')), null, 'nada marcado antes da versão nova');

    // saiu a v2: parada no mapa, o Claude avisa, grava e "recarrega"
    servida.v = 'v2';
    await esperar(page, () => { Reino.UI.fecharTodas(); return __reino.modulo('versao').fase === 'recarregando'; }, null, 30000);
    const antes = await page.evaluate(() => window.__antes);
    assert.deepStrictEqual(antes, { entrou: 'mariana', ultimo: 'mariana' }, 'antes do reload: reino-entrou === Jogadores.ultimo()');

    // o reload de verdade: direto no jogo dela, sem abertura nem senha
    await page.reload();
    await noJogo(page);
    assert.deepStrictEqual(await page.evaluate(() => ({ abertura: !!document.querySelector('.tela-inicio'), viu: window.__viuAbertura, entrou: sessionStorage.getItem('reino-entrou') })),
      { abertura: false, viu: false, entrou: null }, 'sem .tela-inicio depois do reload; o atalho foi usado');
    assert.strictEqual(await page.evaluate(() => Reino.Progresso.estado().estrelas.ganhas), save.estrelas.ganhas, 'o progresso dela');

    // vale uma vez só: recarregar de novo pede a senha
    await page.reload();
    await page.waitForSelector('.tela-inicio .btn-comecar', { timeout: 30000 });
    assert.deepStrictEqual(page.__erros, []);
    await context.close();
  } finally {
    await browser.close();
    servidor.parar();
  }
});
