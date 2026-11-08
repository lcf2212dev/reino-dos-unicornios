// Atualização sozinha do jogo publicado na Vercel (o pedido do Leandro: "precisa ficar dando vários reload"; o app
// instalado idem). O app montado (vercel/montar.js) é servido pelo servidor estático de teste e aberto no Chromium
// COM service worker, como o PWA. Um deploy novo (v2) tem que ser percebido e a aba tem que RECARREGAR sozinha:
// 1. na tela de início (o jogo ainda não entrou), o reload é imediato;
// 2. com o jogo aberto, o service worker novo assume, mas a aba só recarrega na parada no mapa, depois do aviso do
//    Claude e do P.salvar, caindo direto no mapa na v2 (sem abertura nem senha).
// Antes da correção este teste falha: o controllerchange não recarrega nada e o versao.js só percebe no poll de
// 10 min (a página continua com o index/scripts velhos; docs/contratos/cena-e-motor.md §15).
// A v2 é a v1 com um <meta name="versao-teste" content="v2"> no index, outro js/versao.json e os dois hashes novos
// no ARQUIVOS do sw.js (o resto igual: o install do service worker novo troca só o index e o versao.json).
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/atualizacao-sozinha.navegador.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { abrir, lancar } = require('../navegador');
const { servirPasta } = require('../servidor-estatico');
const { PASTA_TESTES } = require('../guardas');
const { gerarSaves } = require('../saves');
const { montar } = require('../../../../vercel/montar');

const SENHA = 'unicorlice77';
const RAPIDO = { intervaloMs: 1500, confirmarMs: 800, cacheMs: 0, paradaMs: 800, avisoMs: 800, esperaMs: 400 };
const hash = (dados) => crypto.createHash('sha256').update(dados).digest('hex').slice(0, 16);

/* ---------- o build de hoje (v1) e o "deploy novo" (v2) ---------- */
// os builds pesados (o jogo montado, com as vozes copiadas) são feitos uma vez só, no topo do arquivo
const PASTA = fs.mkdtempSync(path.join(PASTA_TESTES, 'atualizacao-sozinha-'));
const V1 = path.join(PASTA, 'v1');
const V2 = path.join(PASTA, 'v2');
montar(V1);
function montarV2() {
  fs.cpSync(V1, V2, { recursive: true });
  const index = path.join(V2, 'index.html');
  const html = fs.readFileSync(index, 'utf8');
  assert.ok(html.includes('</head>'), 'index.html montado sem </head>');
  fs.writeFileSync(index, html.replace('</head>', '<meta name="versao-teste" content="v2">\n</head>'));
  const versaoJson = path.join(V2, 'js', 'versao.json');
  fs.writeFileSync(versaoJson, JSON.stringify({ versao: 'v2-teste', gerado: new Date().toISOString() }) + '\n');
  const sw = path.join(V2, 'sw.js');
  const texto = fs.readFileSync(sw, 'utf8');
  const linha = /^const ARQUIVOS = (\{.*\});$/m.exec(texto);
  assert.ok(linha, 'sw.js montado sem a linha const ARQUIVOS');
  const arquivos = JSON.parse(linha[1]);
  arquivos['index.html'] = hash(fs.readFileSync(index));
  arquivos['js/versao.json'] = hash(fs.readFileSync(versaoJson));
  fs.writeFileSync(sw, texto.replace(linha[0], 'const ARQUIVOS = ' + JSON.stringify(arquivos) + ';'));
}
montarV2();

const esperar = (page, fn, ms = 60000) => page.waitForFunction(fn, null, { timeout: ms });
// espera algo na página que pode navegar (o reload da correção): a avaliação falha enquanto o documento troca
async function esperarNaPagina(page, fn, ms = 60000) {
  const fim = Date.now() + ms;
  while (Date.now() < fim) {
    try { if (await page.evaluate(fn)) return; } catch (e) { /* navegando: tenta de novo */ }
    await page.waitForTimeout(200);
  }
  assert.fail('a página não recarregou na versão nova (continuou na velha)');
}
const metaV2 = () => { const m = document.querySelector('meta[name="versao-teste"]'); return !!m && m.content === 'v2'; };
const noJogo = (page) => esperar(page, () => window.Reino && Reino.Progresso && Reino.Progresso.estado() &&
  Reino.Jogadores.atual() === 'mariana' && Reino._motor && Reino._motor.jogoAtivo &&
  !!document.querySelector('#hud') && !document.querySelector('#hud').hidden);
// em cada carga: marca se a abertura (.tela-inicio) apareceu em algum momento
function vigiarAbertura() {
  window.__viuAbertura = false;
  new MutationObserver(function () { if (document.querySelector('.tela-inicio')) window.__viuAbertura = true; })
    .observe(document, { childList: true, subtree: true });
}
const SEM_REDE = /Failed to load resource|ERR_CONNECTION|FetchEvent|ServiceWorker|fetching the script/;
const erros = (page) => page.__erros.filter((e) => !SEM_REDE.test(e));

test('atualização sozinha: na tela de início, o deploy novo recarrega a aba sozinho', async () => {
  const s = await servirPasta({ raiz: V1 });
  const browser = await lancar();
  try {
    const { page } = await abrir({ browser, url: s.url, tamanho: 'notebook', query: '?debug=1', serviceWorkers: true });
    await esperar(page, () => navigator.serviceWorker.controller, 120000);
    await page.waitForSelector('.tela-inicio .btn-comecar', { timeout: 60000 });
    assert.strictEqual(await page.evaluate(() => !!(window.Reino && Reino.Versao)), true, 'o módulo da versão carregou');
    assert.deepStrictEqual(await page.evaluate(() => ({ v2: !!document.querySelector('meta[name="versao-teste"]'), entrou: sessionStorage.getItem('reino-entrou'), fase: __reino.modulo('versao').fase })),
      { v2: false, entrou: null, fase: 'desligado' }, 'a página é a v1, parada na tela de início');
    // o deploy novo: só o index.html e o js/versao.json mudaram; quem confere o sw.js é a aba ao voltar a ficar visível
    s.raiz = V2;
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
    await esperarNaPagina(page, metaV2, 45000);
    // recarregou sozinha na v2 (e não é uma abertura manual): o service worker novo controla a aba nova
    await page.waitForSelector('.tela-inicio .btn-comecar', { timeout: 60000 });
    assert.strictEqual(await page.evaluate(() => !!navigator.serviceWorker.controller), true, 'a v2 está no controle');
    assert.strictEqual(await page.evaluate(() => document.title), 'Reino dos Unicórnios');
    assert.deepStrictEqual(erros(page), []);
  } finally {
    await browser.close().catch(() => {});
    await s.parar();
  }
});

test('atualização sozinha: com o jogo aberto, a v2 assume e o reload cai direto no mapa, depois de avisar e gravar', async () => {
  const s = await servirPasta({ raiz: V1 });
  const browser = await lancar();
  try {
    // o save sintético (gerarSaves roda na página): uma carga congelada rápida, sem service worker, só para gerá-lo
    const g = await abrir({ browser, url: s.url, query: '?debug=1&congelar=1' });
    await esperar(g.page, () => window.__congelar && window.Reino && Reino.Desafios);
    const save = (await g.page.evaluate(`(${gerarSaves.toString()})()`)).completo;
    await g.context.close();

    const { page } = await abrir({ browser, url: s.url, save, tamanho: 'notebook', query: '?debug=1&versao=1', serviceWorkers: true, scripts: [vigiarAbertura] });
    await esperar(page, () => navigator.serviceWorker.controller, 120000);
    // modo vivo: abertura → "Entrar no Reino" → senha da Mariana
    await page.waitForSelector('.tela-inicio .btn-comecar', { timeout: 60000 });
    await page.click('.tela-inicio .btn-comecar');
    await page.waitForSelector('.tela-jogadores #jogador-entrar-senha', { timeout: 60000 });
    await page.fill('#jogador-entrar-senha', SENHA);
    await page.press('#jogador-entrar-senha', 'Enter');
    await noJogo(page);
    // tempos curtos do config.versao, jogo parado no mapa, e as provas de que o caminho certo rodou (aviso e gravação)
    await page.evaluate((c) => {
      Reino.config.versao = c;
      Reino.UI.fecharTodas();
      Reino.Claude.limpar();
      window.__trocou = false;
      navigator.serviceWorker.addEventListener('controllerchange', function () { window.__trocou = true; });
      var salvar = Reino.Progresso.salvar;
      Reino.Progresso.salvar = function () {
        if (__reino.modulo('versao').fase === 'gravado') { try { sessionStorage.setItem('reino-salvou-versao', '1'); } catch (e) { /* sem storage */ } }
        return salvar.apply(this, arguments);
      };
      new MutationObserver(function () {
        if (document.querySelector('#claude-balao')) { try { sessionStorage.setItem('reino-viu-aviso', '1'); } catch (e) { /* sem storage */ } }
      }).observe(document.body, { childList: true, subtree: true });
    }, RAPIDO);
    await esperar(page, () => __reino.modulo('versao').base !== null);
    const antes = await page.evaluate(() => __reino.modulo('versao'));
    assert.strictEqual(antes.fase, 'vigiando', 'vigiando a v1: ' + JSON.stringify(antes));

    // deploy novo (v2): a conferência (visibilitychange → update) instala o service worker novo, que assume a aba
    s.raiz = V2;
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
    await esperar(page, () => window.__trocou);
    const d = await page.evaluate(() => __reino.modulo('versao'));
    // a troca do service worker já é a versão nova (não esperou o poll de 10 min)
    assert.strictEqual(d.nova, 'serviceworker', 'a troca do SW virou a versão nova: ' + JSON.stringify(d));
    assert.strictEqual(d.trocou, true, 'o versao.js viu a troca: ' + JSON.stringify(d));
    assert.ok(['nova', 'aviso', 'gravado', 'recarregando'].indexOf(d.fase) >= 0, 'saiu do poll: ' + JSON.stringify(d));

    // parada no mapa, aviso, gravação e reload sozinho, direto no mapa na v2 (sem abertura nem senha)
    await esperarNaPagina(page, metaV2);
    await noJogo(page);
    assert.deepStrictEqual(await page.evaluate(() => ({ abertura: !!document.querySelector('.tela-inicio'), viuAbertura: window.__viuAbertura,
      entrou: sessionStorage.getItem('reino-entrou'), salvou: sessionStorage.getItem('reino-salvou-versao'),
      balao: sessionStorage.getItem('reino-viu-aviso'), jogador: Reino.Jogadores.atual(), estrelas: Reino.Progresso.estado().estrelas.ganhas })),
      { abertura: false, viuAbertura: false, entrou: null, salvou: '1', balao: '1', jogador: 'mariana', estrelas: save.estrelas.ganhas },
      'o reload caiu direto no mapa, depois do aviso e do P.salvar');
    assert.deepStrictEqual(erros(page), []);
  } finally {
    await browser.close().catch(() => {});
    await s.parar();
  }
});
