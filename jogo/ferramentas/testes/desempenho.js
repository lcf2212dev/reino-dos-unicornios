// Desempenho A/B: tempo médio de desenho de um quadro (window.__reino.tempoQuadro) com a CPU 4× mais
// lenta, no mapa e nos interiores mais pesados. Duas versões do jogo (pastas jogo/) são medidas
// intercaladas, várias rodadas, e compara-se a mediana: o ruído da máquina afeta as duas igual.
// Uso: node ferramentas/testes/desempenho.js <jogo-referencia> <jogo-novo> [--rodadas 7] [--cenas mapa,escola,museu,observatorio]
// Passa se a nova ficar no máximo 5% acima da referência em cada cena.
const path = require('path');
const { iniciar } = require('./servidor-teste');
const { abrir, lancar } = require('./navegador');
const { gerarSaves } = require('./saves');

const TOLERANCIA = 1.05;
const mediana = (v) => { const s = [...v].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
// mapa + os 3 interiores mais pesados da base (medidos em 2026-09-26: escola, museu, observatorio)
const CENAS = ['mapa', 'escola', 'museu', 'observatorio'];

async function medir(browser, raiz, cenas) {
  const servidor = await iniciar({ raiz });
  try {
    // save sintético completo, com animações (o jogo de verdade)
    let { context, page } = await abrir({ browser, url: servidor.url, query: '?debug=1&congelar=1' });
    await page.waitForFunction(() => window.Reino && Reino.Progresso && Reino.Progresso.estado(), null, { timeout: 30000 });
    const save = (await page.evaluate(`(${gerarSaves.toString()})()`)).completo;
    await context.close();
    save.ajustes.animacoes = true;
    ({ context, page } = await abrir({ browser, url: servidor.url, tamanho: 'notebook', save, query: '?debug=1', reducedMotion: 'no-preference' }));
    await page.waitForFunction(() => window.__reino && document.querySelector('.btn-comecar'), null, { timeout: 30000 });
    await page.click('.btn-comecar');
    await page.waitForFunction(() => window.__reino.estado() === 'mapa', null, { timeout: 30000 });
    const cdp = await context.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    const r = {};
    for (const cena of cenas) {
      if (cena !== 'mapa') {
        await page.evaluate((id) => { Reino.Cena.irPara(id); }, cena);
        await page.waitForFunction(() => window.__reino.estado() === 'interior', null, { timeout: 20000 });
      }
      await page.waitForTimeout(1500);
      const v = [];
      for (let i = 0; i < 11; i++) { await page.waitForTimeout(500); v.push(await page.evaluate(() => window.__reino.tempoQuadro())); }
      r[cena] = mediana(v);
    }
    await context.close();
    return r;
  } finally { servidor.parar(); }
}

async function comparar(raizA, raizB, op = {}) {
  const cenas = op.cenas || CENAS, rodadas = op.rodadas || 7;
  const browser = await lancar();
  const a = {}, b = {};
  try {
    for (let i = 0; i < rodadas; i++) {
      const [x, y] = i % 2 ? [raizB, raizA] : [raizA, raizB];
      const mx = await medir(browser, x, cenas), my = await medir(browser, y, cenas);
      const [ma, mb] = i % 2 ? [my, mx] : [mx, my];
      cenas.forEach((c) => { (a[c] = a[c] || []).push(ma[c]); (b[c] = b[c] || []).push(mb[c]); });
    }
  } finally { await browser.close(); }
  let ok = true;
  cenas.forEach((c) => {
    const ra = mediana(a[c]), rb = mediana(b[c]), passa = rb <= ra * TOLERANCIA;
    if (!passa) ok = false;
    console.log(`  ${passa ? '✔' : '✘'} ${c}: ${ra.toFixed(3)} → ${rb.toFixed(3)} ms (${((rb / ra - 1) * 100).toFixed(1)}%)`);
  });
  console.log(ok ? '✔ desempenho igual ou melhor (tolerância de 5%)' : '✘ desempenho pior que a referência + 5%');
  return ok;
}

module.exports = { comparar, medir, CENAS };

if (require.main === module) {
  const [a, b] = process.argv.slice(2);
  const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : undefined; };
  if (!a || !b) { console.log('Uso: desempenho.js <jogo-referencia> <jogo-novo> [--rodadas 7] [--cenas mapa,escola]'); process.exit(2); }
  comparar(path.resolve(a), path.resolve(b), { rodadas: Number(arg('--rodadas')) || 7, cenas: arg('--cenas') && arg('--cenas').split(',') })
    .then((ok) => process.exit(ok ? 0 : 1), (e) => { console.error(e); process.exit(1); });
}
