// Navegador de teste (Playwright, só Chromium, contexto isolado) preso ao servidor de TESTE.
// Recusa a porta 80, localhost sem porta, reinodosunicornios.local e IPs da rede: o jogo aberto
// lá sincronizaria com o progresso real da Mariana. Toda rede fora da porta de teste é bloqueada.
const { chromium } = require('playwright');

// tamanhos do CLAUDE.md: celular, tablet e notebook
const TAMANHOS = {
  celular: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 },
  tablet: { viewport: { width: 820, height: 1180 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  notebook: { viewport: { width: 1366, height: 768 }, deviceScaleFactor: 1 },
};

function conferirUrl(url) {
  const u = new URL(url);
  if (u.protocol === 'file:') return u;
  const porta = Number(u.port);
  if (/reinodosunicornios/i.test(u.hostname)) throw new Error('proibido: reinodosunicornios.local é o servidor de casa');
  if (u.hostname !== '127.0.0.1') throw new Error(`proibido: só 127.0.0.1 com porta de teste (recebido ${u.hostname})`);
  if (!porta || porta === 80 || porta < 1024) throw new Error(`proibido: porta ${u.port || '(nenhuma)'}; use a porta do servidor de teste`);
  return u;
}

// rasterização fixa (sem GPU, uma thread, perfil de cor sRGB): as bordas suaves saem iguais em toda captura
const ARGS_FIXOS = ['--disable-gpu', '--disable-gpu-rasterization', '--disable-partial-raster', '--num-raster-threads=1',
  '--force-color-profile=srgb', '--disable-skia-runtime-opts', '--disable-lcd-text', '--font-render-hinting=none',
  '--disable-checker-imaging', '--run-all-compositor-stages-before-draw'];
async function lancar() { return chromium.launch({ headless: true, args: ARGS_FIXOS }); }

// op: { browser, url (do servidor de teste), tamanho, save (objeto sintético), query, contexto }
async function abrir(op) {
  const base = conferirUrl(op.url);
  const browser = op.browser || await lancar();
  const context = await browser.newContext(Object.assign({ reducedMotion: op.reducedMotion || 'reduce' }, TAMANHOS[op.tamanho || 'notebook'], op.contexto || {}));
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
  const page = await context.newPage();
  page.__erros = [];
  page.on('pageerror', (e) => page.__erros.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) page.__erros.push('console: ' + m.text()); });
  const alvo = new URL(base.href);
  if (op.query) alvo.search = op.query;
  await page.goto(conferirUrl(alvo.href).href);
  return { browser, context, page };
}

module.exports = { abrir, lancar, conferirUrl, TAMANHOS };
