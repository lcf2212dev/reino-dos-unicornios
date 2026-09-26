// Desempenho A/B: quanto tempo REAL o navegador leva para andar N quadros fixos do jogo, com a CPU
// 4× mais lenta, no mapa e nos 3 interiores mais pesados (escola, museu, observatorio).
// Uso:
//   node jogo/ferramentas/testes/desempenho.js <jogo-referencia> <jogo-novo> [--pares 16] [--quadros 60] [--cenas mapa,escola]
//   node jogo/ferramentas/testes/desempenho.js --aa <jogo> [--vezes 3]      (teste A/A: o mesmo jogo dos dois lados)
// Passa se, em cada cena, o novo ficar no máximo 5% acima da referência (ver CRITÉRIO).
//
// Como mede (menos ruído que o tempoQuadro em tempo real, que variava até 17% num A/A):
// - modo determinístico (?debug=1&congelar=1): relógio virtual, Math.random com semente; com as
//   animações do cenário religadas (Reino.util.reduzMovimentoSistema = false) os quadros desenhados
//   são sempre os mesmos, nos dois lados;
// - uma amostra = __congelar.avancar(quadros × 16 ms) (timers, laço e desenho de cada quadro), cronometrada
//   DENTRO da página pelo relógio real (performance.now guardado antes do congelar.js trocá-lo);
//   coleta de lixo forçada antes de cada amostra (--expose-gc);
// - as duas versões ficam abertas ao mesmo tempo (um servidor de teste e uma aba isolada cada) e as
//   amostras se alternam A B B A …: a carga da máquina e a posição afetam as duas igual;
// - resultado por cena = mediana das razões B/A dos pares.
// CRITÉRIO: uma cena acima de 5% é medida de novo (até 2 vezes); reprova só se a mediana das
// medições continuar acima de 5% (falha consistente, não um pico da máquina).
// Ruído medido (2026-09-26, 32 núcleos com outros agentes rodando, carga ~8): A/A 3× (16 pares, 60 quadros)
// deu no máximo 1,4% por cena (mapa 0,7 · escola 1,4 · museu 1,2 · observatorio 0,3); base×atual e
// atual×base (ordem invertida) ficaram entre -1,6% e +1,0%. Sensibilidade: sem desenho cai 99,8% (o tempo
// medido é o desenho); um laço extra de ~2 ms/quadro deu +7% a +12% e reprovou nas 3 medições.
const path = require('path');
const { iniciar } = require('./servidor-teste');
const { abrir, lancar } = require('./navegador');
const { gerarSaves } = require('./saves');

const TOLERANCIA = 1.05;
const CENAS = ['mapa', 'escola', 'museu', 'observatorio'];
const mediana = (v) => { const s = [...v].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const pct = (r) => `${r >= 1 ? '+' : ''}${((r - 1) * 100).toFixed(1)}%`;

// roda antes do jogo: guarda o relógio real (o congelar.js troca performance.now pelo virtual)
function guardarRelogio() { window.__relogioReal = performance.now.bind(performance); }

async function avancar(page, ms) { return page.evaluate((m) => window.__congelar.avancar(m), ms); }

// um lado: servidor de teste próprio, aba isolada no mapa com o save sintético completo
async function abrirLado(browser, raiz, saves) {
  const servidor = await iniciar({ raiz });
  const save = JSON.parse(JSON.stringify(saves.completo));
  save.ajustes.animacoes = true;   // o jogo de verdade, com animações
  const { context, page } = await abrir({ browser, url: servidor.url, tamanho: 'notebook', save, query: '?debug=1&congelar=1', scripts: [guardarRelogio] });
  context.on('close', () => servidor.parar());
  await page.waitForFunction(() => window.__congelar && window.__reino && window.__relogioReal, null, { timeout: 30000 });
  for (let i = 0; i < 400; i++) {
    if (await page.evaluate(() => window.__reino.estado() === 'mapa')) break;
    await avancar(page, 50);
  }
  // animações do cenário ligadas também no modo determinístico (o congelar.js pede movimento reduzido)
  await page.evaluate(() => { Reino.util.reduzMovimentoSistema = false; });
  await avancar(page, 1000);
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  return { raiz, page, context };
}

async function irCena(lado, cena) {
  const { page } = lado;
  await page.evaluate((id) => {
    if (id === 'mapa') { if (window.__reino.estado() !== 'mapa') Reino.Cena.sair(); } else Reino.Cena.irPara(id);
  }, cena);
  const alvo = cena === 'mapa' ? 'mapa' : 'interior';
  for (let i = 0; i < 200; i++) {
    if (await page.evaluate((a) => window.__reino.estado() === a, alvo)) break;
    await avancar(page, 50);
  }
  await avancar(page, 2500);
}

// ms reais por quadro numa amostra de `quadros` quadros
async function amostra(lado, quadros) {
  return lado.page.evaluate(async (n) => {
    if (window.gc) window.gc();
    var t0 = window.__relogioReal();
    await window.__congelar.avancar(n * 16);
    return (window.__relogioReal() - t0) / n;
  }, quadros);
}

async function saves(browser, raiz) {
  const servidor = await iniciar({ raiz });
  try {
    const { context, page } = await abrir({ browser, url: servidor.url, query: '?debug=1&congelar=1' });
    await page.waitForFunction(() => window.Reino && Reino.Progresso && Reino.Progresso.estado(), null, { timeout: 30000 });
    const s = await page.evaluate(`(${gerarSaves.toString()})()`);
    await context.close();
    return s;
  } finally { servidor.parar(); }
}

// uma medição de uma cena: aquecimento e depois `pares` pares alternados A B / B A
async function medirCena(a, b, cena, op) {
  await irCena(a, cena); await irCena(b, cena);
  for (let i = 0; i < 2; i++) { await amostra(a, op.quadros); await amostra(b, op.quadros); }
  const va = [], vb = [], razoes = [];
  for (let i = 0; i < op.pares; i++) {
    let x, y;
    if (i % 2) { y = await amostra(b, op.quadros); x = await amostra(a, op.quadros); } else { x = await amostra(a, op.quadros); y = await amostra(b, op.quadros); }
    va.push(x); vb.push(y); razoes.push(y / x);
  }
  return { a: mediana(va), b: mediana(vb), razao: mediana(razoes) };
}

// compara duas pastas jogo/ (raizA = referência). Devolve { ok, cenas: { cena: { a, b, razao, medidas } } }
async function comparar(raizA, raizB, op = {}) {
  op = Object.assign({ cenas: CENAS, pares: 16, quadros: 60, repetir: 2, log: console.log }, op);
  const browser = await lancar({ args: ['--js-flags=--expose-gc'] });
  const r = { ok: true, cenas: {} };
  try {
    const s = await saves(browser, raizA);
    const a = await abrirLado(browser, raizA, s), b = await abrirLado(browser, raizB, s);
    for (const cena of op.cenas) {
      const medidas = [await medirCena(a, b, cena, op)];
      // acima da tolerância: mede de novo; vale a mediana (falha só se for consistente)
      while (medidas[medidas.length - 1].razao > TOLERANCIA && medidas.length <= op.repetir) medidas.push(await medirCena(a, b, cena, op));
      const razao = mediana(medidas.map((m) => m.razao));
      const passa = razao <= TOLERANCIA;
      if (!passa) r.ok = false;
      r.cenas[cena] = { a: medidas[0].a, b: medidas[0].b, razao, medidas: medidas.map((m) => m.razao) };
      op.log(`  ${passa ? '✔' : '✘'} ${cena}: ${medidas[0].a.toFixed(3)} → ${medidas[0].b.toFixed(3)} ms/quadro (${pct(razao)}` +
        (medidas.length > 1 ? `; medido ${medidas.length}×: ${medidas.map((m) => pct(m.razao)).join(', ')}` : '') + ')');
    }
    await a.context.close(); await b.context.close();
  } finally { await browser.close(); }
  op.log(r.ok ? '✔ desempenho igual ou melhor (tolerância de 5%)' : '✘ desempenho pior que a referência + 5% (de forma consistente)');
  return r;
}

module.exports = { comparar, CENAS, TOLERANCIA };

if (require.main === module) {
  const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : undefined; };
  const op = { pares: Number(arg('--pares')) || 16, quadros: Number(arg('--quadros')) || 60, cenas: arg('--cenas') ? arg('--cenas').split(',') : CENAS };
  const aa = arg('--aa');
  const [x, y] = process.argv.slice(2).filter((v, i, t) => !v.startsWith('--') && !(t[i - 1] || '').startsWith('--'));
  (async () => {
    if (aa) {
      // A/A: o mesmo jogo dos dois lados; a razão mostra o ruído da medição (o ideal é 0%)
      const vezes = Number(arg('--vezes')) || 3, todas = {};
      for (let i = 0; i < vezes; i++) {
        console.log(`A/A rodada ${i + 1}/${vezes}:`);
        const r = await comparar(path.resolve(aa), path.resolve(aa), Object.assign({}, op, { repetir: 0 }));
        Object.entries(r.cenas).forEach(([c, v]) => (todas[c] = todas[c] || []).push(v.razao));
      }
      console.log('Ruído A/A (maior desvio por cena): ' + Object.entries(todas).map(([c, v]) => `${c} ${Math.max(...v.map((z) => Math.abs(z - 1) * 100)).toFixed(1)}%`).join(' · '));
      return true;
    }
    if (!x || !y) { console.log('Uso: desempenho.js <jogo-referencia> <jogo-novo> [--pares 16] [--quadros 60] [--cenas mapa,escola]\n     desempenho.js --aa <jogo> [--vezes 3]'); process.exit(2); }
    return (await comparar(path.resolve(x), path.resolve(y), op)).ok;
  })().then((ok) => process.exit(ok ? 0 : 1), (e) => { console.error(e); process.exit(1); });
}
