// Sonda de memória (npm run memoria): abre UMA aba do jogo no servidor de TESTE (save sintético, relógio congelado),
// vai a um lugar ou tela e anda o relógio em passos, medindo depois de cada passo (com GC forçado) o heap de JS, os
// nós do DOM, os ouvintes de evento e a memória (RSS) do Chromium. Com --comparar, mede também outra cópia do jogo
// (ex.: a da main) nas mesmas condições. Serve para achar vazamento: o que sobe a cada passo e não volta com o GC.
// Uso: node jogo/ferramentas/testes/sonda-memoria.js [--raiz <pasta jogo>] [--comparar <pasta jogo>]
//        [--ir <lugar>] [--tela <nome>] [--passos 6] [--ms 3000] [--tamanho celular] [--save completo]
//   --ir / --tela / --save: os mesmos do npm run ver (cenario.js); padrão: o mapa, save completo, celular
// Saída: uma linha por passo e, por cópia, "estável" ou "CRESCE" (e quanto). Passo que trava: o avancar dá erro em
// 20 s (pacote de voz) e o vigia (vigia-memoria.js) derruba a aba que passar de 4 GB. Skill investigar-vazamento.
if (require.main === module) require('../ajuda').ajuda(__filename);
const path = require('path');
const { conferirOpcoes } = require('../ajuda');
const { abrirCenario } = require('./cenario');
const { processos, descendentes } = require('./vigia-memoria');

const MB = 1024 * 1024;

// o maior Chromium deste processo: com uma aba só, é o renderizador dela
function rssAba() {
  const chrome = descendentes(processos(), process.pid).filter((p) => /chrome/.test(p.nome));
  return chrome.reduce((m, p) => Math.max(m, p.rss), 0);
}

async function medir(raiz, op) {
  const c = await abrirCenario({ raiz, tamanho: op.tamanho, save: op.save });
  const linhas = [];
  try {
    const cdp = await c.page.context().newCDPSession(c.page);
    await cdp.send('Performance.enable');
    const amostra = async (rotulo) => {
      await cdp.send('HeapProfiler.collectGarbage');
      const { metrics } = await cdp.send('Performance.getMetrics');
      const v = (n) => (metrics.find((x) => x.name === n) || {}).value || 0;
      const a = { rotulo, heap: v('JSHeapUsedSize'), nos: v('Nodes'), ouvintes: v('JSEventListeners'), rss: rssAba() };
      linhas.push(a);
      console.log(`  ${rotulo.padEnd(8)} heap ${(a.heap / MB).toFixed(1).padStart(7)} MB · nós ${String(a.nos).padStart(6)} · ouvintes ${String(a.ouvintes).padStart(5)} · Chromium ${(a.rss / MB).toFixed(0).padStart(6)} MB`);
    };
    if (op.ir) await c.ir(op.ir);
    if (op.tela) await c.tela(op.tela);
    await amostra('início');
    for (let i = 1; i <= op.passos; i++) { await c.avancar(op.ms); await amostra(`+${(i * op.ms) / 1000} s`); }
  } finally { await c.fechar(); }
  return veredito(linhas);
}

// CRESCE: o heap sobe em quase todo passo e somou mais de 5 MB e 20%, ou o Chromium subiu mais de 300 MB
function veredito(linhas) {
  const p = linhas[0], u = linhas[linhas.length - 1];
  let subidas = 0;
  for (let i = 1; i < linhas.length; i++) if (linhas[i].heap > linhas[i - 1].heap) subidas++;
  const heap = u.heap - p.heap, rss = u.rss - p.rss;
  const cresce = (subidas >= linhas.length - 2 && heap > 5 * MB && heap > p.heap * 0.2) || rss > 300 * MB;
  return { cresce, texto: `${cresce ? 'CRESCE' : 'estável'}: heap ${heap >= 0 ? '+' : ''}${(heap / MB).toFixed(1)} MB, Chromium ${rss >= 0 ? '+' : ''}${(rss / MB).toFixed(0)} MB, nós ${u.nos - p.nos >= 0 ? '+' : ''}${u.nos - p.nos}` };
}

if (require.main === module) {
  const argv = process.argv.slice(2);
  conferirOpcoes(argv, { valores: ['--raiz', '--comparar', '--ir', '--tela', '--passos', '--ms', '--tamanho', '--save'] });
  const arg = (n, padrao) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : padrao; };
  const op = { ir: arg('--ir'), tela: arg('--tela'), passos: Number(arg('--passos', 6)), ms: Number(arg('--ms', 3000)),
    tamanho: arg('--tamanho', 'celular'), save: arg('--save', 'completo') };
  const raizes = [path.resolve(arg('--raiz', path.join(__dirname, '..', '..')))];
  if (arg('--comparar')) raizes.push(path.resolve(arg('--comparar')));
  (async () => {
    const vereditos = [];
    for (const r of raizes) {
      console.log(`• ${r}  (${op.ir || 'mapa'}${op.tela ? ' + tela ' + op.tela : ''}, ${op.passos} × ${op.ms} ms, ${op.tamanho})`);
      vereditos.push(`${r}: ${(await medir(r, op)).texto}`);
    }
    console.log('\n' + vereditos.join('\n'));
    process.exit(vereditos.some((v) => v.includes('CRESCE')) ? 1 : 0);
  })().catch((e) => { console.error('✘ ' + (e && e.stack || e)); process.exit(1); });
}

module.exports = { medir, veredito };
