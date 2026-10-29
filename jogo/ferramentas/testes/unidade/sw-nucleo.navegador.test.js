// Service worker do app instalado (vercel/pwa/sw.js), no Chromium de teste com o jogo montado (vercel/montar.js em
// /tmp/reino-testes/) num servidor estático de teste (servidor-estatico.js): sem banco, sem API, sem rede de fora.
// 1. o app de hoje (sw.js e montar.js de SW_DE_HOJE, que baixa tudo, vozes inclusive, na instalação) recebe o novo:
//    ele ativa, não baixa de novo as vozes que não mudaram, guarda a velha da que mudou até a nova chegar, e sem
//    rede o jogo abre com os lotes e a voz guardada toca;
// 2. instalação do zero com as vozes presas na rede: o núcleo basta para ativar e abrir sem rede; as vozes chegam
//    depois, em segundo plano, quando a aba pede ({ reino: 'continuar' }), até o "guardado".
const { test } = require('node:test');
const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { abrir, lancar } = require('../navegador');
const { servirPasta } = require('../servidor-estatico');
const { PASTA_TESTES, conferirPastaTmp } = require('../guardas');
const { montar } = require('../../../../vercel/montar');

const REPO = path.resolve(__dirname, '..', '..', '..', '..');
const SW_DE_HOJE = 'ffd735a2';   // o sw.js publicado antes dos lotes: o que está nos aparelhos
const CACHE = 'reino-arquivos';

// o build de SW_DE_HOJE (montar.js e pwa/ daquele commit) sobre o jogo/ desta árvore
function montarAntigo(pasta) {
  const raiz = conferirPastaTmp(path.join(pasta, 'antigo'));
  fs.mkdirSync(raiz, { recursive: true });
  const tar = path.join(pasta, 'antigo.tar');
  execFileSync('git', ['archive', '--format=tar', '-o', tar, SW_DE_HOJE, '--', 'vercel/montar.js', 'vercel/pwa'], { cwd: REPO });
  execFileSync('tar', ['-xf', tar, '-C', raiz]);
  fs.symlinkSync(path.join(REPO, 'jogo'), path.join(raiz, 'jogo'));
  execFileSync(process.execPath, [path.join(raiz, 'vercel', 'montar.js')], { stdio: 'ignore' });
  return path.join(raiz, 'vercel', 'public');
}

// sem rede: a API, o sw.js (conferir atualização) e a voz que ainda não chegou falham, e é esperado
const SEM_REDE = /Failed to load resource|ERR_CONNECTION|FetchEvent|ServiceWorker|fetching the script/;
const erros = (page) => page.__erros.filter((e) => !SEM_REDE.test(e));
// vivo (sem congelar): o registro do sw.js e os lembretes da aba usam o relógio de verdade
const abrirAba = (browser, url) => abrir({ browser, url, tamanho: 'notebook', query: '?debug=1', serviceWorkers: true });
const chaves = (page) => page.evaluate(async (n) => (await (await caches.open(n)).keys()).map((r) => new URL(r.url).pathname.slice(1) + new URL(r.url).search), CACHE);
const jogoAberto = (page) => page.waitForFunction(() => window.__reino && window.Reino && Reino.UI && Reino.Voz, null, { timeout: 60000 });
// a fala do Claude no pacote geral toca: o pacote carrega (do cache, sem rede) e tem o áudio
const vozToca = (page) => page.evaluate(async () => {
  await Reino.Voz.carregar('geral');
  const f = Reino.Versao.falas()[0];
  return Reino.Voz.tem(f.voz, f.texto);
});

// a voz geral muda no deploy novo (o mesmo pacote com outro conteúdo, e o hash dele no sw.js)
function mudarVozGeral(raiz, arquivos) {
  const arq = path.join(raiz, 'js', 'voz', 'geral.js');
  fs.appendFileSync(arq, '\n/* versão nova */\n');
  const h = crypto.createHash('sha256').update(fs.readFileSync(arq)).digest('hex').slice(0, 16);
  const sw = path.join(raiz, 'sw.js');
  fs.writeFileSync(sw, fs.readFileSync(sw, 'utf8').replace(`"js/voz/geral.js":"${arquivos['js/voz/geral.js']}"`, `"js/voz/geral.js":"${h}"`));
  return Object.assign({}, arquivos, { 'js/voz/geral.js': h });
}

test('sw: o app de hoje recebe o novo, guarda as vozes que já tinha e abre sem rede', async () => {
  const pasta = fs.mkdtempSync(path.join(PASTA_TESTES, 'sw-nucleo-'));
  const antigo = montarAntigo(pasta);
  const velhas = montar(path.join(pasta, 'novo')).arquivos;
  const novo = mudarVozGeral(path.join(pasta, 'novo'), velhas);
  let soltar;
  const presa = new Promise((ok) => { soltar = ok; });
  const s = await servirPasta({ raiz: antigo });
  const browser = await lancar();
  try {
    const { page } = await abrirAba(browser, s.url);
    await page.waitForFunction(() => navigator.serviceWorker.controller, null, { timeout: 120000 });
    const antes = await chaves(page);
    assert.ok(antes.some((k) => k.startsWith('js/voz/geral.js?v=')), 'o SW de hoje guardou as vozes');
    assert.ok(antes.some((k) => k.startsWith('js/motor/main.js?v=')), 'o SW de hoje guardou os scripts soltos');

    // deploy novo: o mesmo endereço passa a servir o build com lotes
    const n0 = s.pedidos.length;
    const geralVelha = antes.find((k) => k.startsWith('js/voz/geral.js?v='));
    s.raiz = path.join(pasta, 'novo');
    s.atraso = (c) => (c === 'js/voz/geral.js' ? presa : 0);   // a geral nova fica presa na rede
    await page.evaluate(async () => {
      window.__trocou = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => { window.__trocou = true; });
      await (await navigator.serviceWorker.getRegistration()).update();
    });
    // a troca (skipWaiting) vem no começo da ativação; a limpeza termina com o novo "activated"
    await page.waitForFunction(() => window.__trocou && navigator.serviceWorker.controller.state === 'activated', null, { timeout: 120000 });
    for (let i = 0; i < 100 && !s.pedidos.slice(n0).some((p) => p.caminho === 'js/voz/geral.js'); i++) await page.waitForTimeout(100);
    const depois = await chaves(page);
    const esperado = Object.keys(novo).map((c) => (c === 'js/voz/geral.js' ? geralVelha : c + '?v=' + novo[c])).sort();
    assert.deepStrictEqual(depois.slice().sort(), esperado, 'o cache tem a versão nova (e a geral velha) e nada mais da velha');
    const pedidos = s.pedidos.slice(n0).map((p) => p.caminho);
    assert.deepStrictEqual(pedidos.filter((c) => c.startsWith('js/voz/')), ['js/voz/geral.js'], 'só a voz que mudou é pedida');
    assert.ok(pedidos.some((c) => /^js\/lote-01-/.test(c)), 'os lotes vieram na instalação');

    // uma voz velha que sobrou (o SW parou entre guardar a nova e apagar a velha): sai na próxima volta
    const sobra = 'js/voz/interior-bau.js?v=0000000000000000';
    await page.evaluate(async ([n, k]) => (await caches.open(n)).put(k, new Response('/* velha */')), [CACHE, sobra]);

    // sem rede: o jogo novo abre do cache e a voz guardada toca
    await s.parar();
    await page.reload();
    await jogoAberto(page);
    assert.strictEqual(await page.evaluate(() => document.querySelectorAll('script[src^="js/lote-"]').length),
      Object.keys(novo).filter((c) => c.startsWith('js/lote-')).length);
    assert.strictEqual(await vozToca(page), true, 'a voz guardada (a geral velha) toca sem rede');
    for (let i = 0; i < 100 && (await chaves(page)).includes(sobra); i++) await page.waitForTimeout(100);
    assert.ok(!(await chaves(page)).includes(sobra), 'a sobra saiu');
    assert.ok((await chaves(page)).includes(geralVelha), 'a geral velha fica (a nova não chegou)');
    assert.deepStrictEqual(erros(page), []);
  } finally {
    soltar();
    await browser.close().catch(() => {});
    await s.parar();
  }
});

test('sw: instalação nova ativa com o núcleo; as vozes vêm depois, em segundo plano', async () => {
  const pasta = fs.mkdtempSync(path.join(PASTA_TESTES, 'sw-nucleo-'));
  const raiz = path.join(pasta, 'novo');
  const arquivos = montar(raiz).arquivos;
  const vozes = Object.keys(arquivos).filter((c) => c.startsWith('js/voz/'));
  let soltar;
  const presas = new Promise((ok) => { soltar = ok; });
  const prender = (c) => (c.startsWith('js/voz/') ? presas : 0);
  let s = await servirPasta({ raiz, atraso: prender });
  const browser = await lancar();
  try {
    const { page } = await abrirAba(browser, s.url);
    // ativo e no controle com as vozes ainda presas na rede
    await page.waitForFunction(() => navigator.serviceWorker.controller, null, { timeout: 120000 });
    const k1 = await chaves(page);
    assert.ok(k1.some((k) => /^js\/lote-01-/.test(k)) && k1.includes('index.html?v=' + arquivos['index.html']), 'núcleo no cache');
    assert.strictEqual(k1.filter((k) => k.startsWith('js/voz/')).length, 0, 'nenhuma voz ainda');

    // sem rede (a rede cai no meio das vozes): o jogo abre só com o núcleo
    const porta = new URL(s.url).port;
    await s.parar();
    await page.reload();
    await jogoAberto(page);
    assert.deepStrictEqual(erros(page), []);

    // a rede volta: a aba pede para continuar e as vozes chegam todas, até o "guardado"
    s = await servirPasta({ raiz, porta });
    await page.evaluate(() => {
      window.__msgs = [];
      navigator.serviceWorker.addEventListener('message', (e) => window.__msgs.push(e.data));
    });
    // o lembrete da aba vem a cada minuto; aqui, a cada 2 s (a volta anterior, sem rede, pode estar terminando)
    const limite = Date.now() + 120000;
    while (!(await page.evaluate(() => window.__msgs.some((m) => m.reino === 'guardado')))) {
      assert.ok(Date.now() < limite, 'as vozes não chegaram em 2 min');
      await page.evaluate(() => navigator.serviceWorker.controller.postMessage({ reino: 'continuar' }));
      await page.waitForTimeout(2000);
    }
    const k2 = await chaves(page);
    assert.strictEqual(k2.filter((k) => k.startsWith('js/voz/')).length, vozes.length, 'todas as vozes no cache');
    await s.parar();
    assert.strictEqual(await vozToca(page), true, 'a voz toca sem rede');
  } finally {
    soltar();
    await browser.close().catch(() => {});
    await s.parar();
  }
});
