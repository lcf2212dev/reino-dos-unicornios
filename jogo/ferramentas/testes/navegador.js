// Navegador de teste (Playwright, só Chromium, contexto isolado) preso ao servidor de TESTE.
// Recusa a porta 80, localhost sem porta, reinodosunicornios.local e IPs da rede: o jogo aberto
// lá sincronizaria com o progresso real da Mariana. Toda rede fora da porta de teste é bloqueada.
const { chromium } = require('playwright');
const { conferirUrl } = require('./guardas');

// tamanhos do CLAUDE.md: celular, tablet e notebook
const TAMANHOS = {
  celular: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 },
  tablet: { viewport: { width: 820, height: 1180 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  notebook: { viewport: { width: 1366, height: 768 }, deviceScaleFactor: 1 },
};

// rasterização fixa (sem GPU, uma thread, perfil de cor sRGB): as bordas suaves saem iguais em toda captura
const ARGS_FIXOS = ['--disable-gpu', '--disable-gpu-rasterization', '--disable-partial-raster', '--num-raster-threads=1',
  '--force-color-profile=srgb', '--disable-skia-runtime-opts', '--disable-lcd-text', '--font-render-hinting=none',
  '--disable-checker-imaging', '--run-all-compositor-stages-before-draw'];
// 2ª barreira de rede: todo endereço que não seja loopback vai para um proxy que não existe (porta 9)
// e falha; o loopback (127.0.0.1) vai direto e é filtrado por origem em abrir() (só a porta de teste)
const ARGS_REDE = ['--proxy-server=http://127.0.0.1:9'];
// op.args: argumentos extras do Chromium (ex.: desempenho.js usa --js-flags=--expose-gc)
async function lancar(op = {}) { return chromium.launch({ headless: true, args: ARGS_FIXOS.concat(ARGS_REDE, op.args || []) }); }

// op: { browser, url (do servidor de teste), tamanho, save (objeto sintético), query, contexto,
//       scripts (funções/textos que rodam antes do jogo em cada carga, depois do save) }
async function abrir(op) {
  const base = conferirUrl(op.url);
  const browser = op.browser || await lancar();
  // service worker bloqueado: requisições dele escapariam do filtro de rede abaixo
  const context = await browser.newContext(Object.assign({ reducedMotion: op.reducedMotion || 'reduce' }, TAMANHOS[op.tamanho || 'notebook'], op.contexto || {}, { serviceWorkers: 'block' }));
  const origem = base.origin;
  await context.route('**/*', (r) => {
    const u = r.request().url();
    if (base.protocol === 'file:' ? u.startsWith('file:') || u.startsWith('data:') : u.startsWith(origem + '/')) return r.continue();
    return r.abort();
  });
  if (op.save) {
    // só na primeira carga da aba: o save sintético entra antes do jogo ler o localStorage
    await context.addInitScript(([chave, texto]) => {
      try { if (!sessionStorage.getItem('__semeado')) { localStorage.setItem(chave, texto); sessionStorage.setItem('__semeado', '1'); } } catch (e) { /* sem storage */ }
    }, ['mariana-reino-v1', JSON.stringify(op.save)]);
  }
  for (const sc of op.scripts || []) await context.addInitScript(sc);
  const page = await context.newPage();
  page.__erros = [];
  // todo o console (log/info/warn/error), com a marca do que estava rodando (ver.js marca cada --js e --passos)
  page.__console = [];
  page.__marca = null;
  page.on('console', (m) => page.__console.push({ tipo: m.type(), texto: m.text(), marca: page.__marca }));
  page.on('pageerror', (e) => page.__erros.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) page.__erros.push('console: ' + m.text()); });
  const alvo = new URL(base.href);
  if (op.query) alvo.search = op.query;
  await page.goto(conferirUrl(alvo.href).href);
  return { browser, context, page };
}

module.exports = { abrir, lancar, conferirUrl, TAMANHOS };
