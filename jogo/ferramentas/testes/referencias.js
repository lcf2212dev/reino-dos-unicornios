// Testes de referência da refatoração: captura o comportamento do jogo e compara duas capturas.
// Tudo roda no servidor de TESTE (porta livre, banco em /tmp) e no modo determinístico
// (?debug=1&congelar=1, js/nucleo/congelar.js). Saves sintéticos (saves.js).
//
// Uso:
//   node jogo/ferramentas/testes/referencias.js capturar <saida> [--raiz <pasta jogo>] [--so dados,imagens,desempenho,vozes] [--tamanhos celular,tablet]
//   node jogo/ferramentas/testes/referencias.js comparar <referencia> <nova> [--desempenho]
// Saída: <saida>/dados/*.json, <saida>/imagens/<tamanho>/*.png, <saida>/desempenho.json, <saida>/vozes.json
// Arquivos: referencias-pagina.js (página determinística), referencias-cenas.js (fotos),
// referencias-dados.js (dados, desempenho, vozes), referencias-comparar.js (comparação).
// Base automática (commit de base-referencia.txt) e comparação de um comando só: e2e.js.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { iniciar } = require('./servidor-teste');
const { abrir, lancar, TAMANHOS } = require('./navegador');
const { gerarSaves } = require('./saves');
const { estavel, abrirJogo, foto } = require('./referencias-pagina');
const { cenasMapaEInteriores, cenasTelas, cenasSalas, cenasProvasEDesafios } = require('./referencias-cenas');
const { capturarDados, capturarDesempenho, capturarVozes } = require('./referencias-dados');
const { comparar } = require('./referencias-comparar');

// abas simultâneas: metade das CPUs, até 12
const PARALELO_PADRAO = Math.max(1, Math.min(Math.floor(os.cpus().length / 2), 12));

// op: { raiz, so, tamanhos, paralelo (abas ao mesmo tempo), filtro (RegExp: só fotografa esses nomes),
//       faltam ({ tamanho: Set de nomes }: com filtro, as abas param quando todos já saíram) }
async function capturar(saida, op) {
  const so = new Set((op.so || 'dados,imagens,vozes').split(','));
  const tamanhos = (op.tamanhos || Object.keys(TAMANHOS).join(',')).split(',');
  const raiz = path.resolve(op.raiz || path.join(__dirname, '..', '..'));
  const servidor = await iniciar({ raiz });
  const browser = await lancar();
  const erros = [];
  try {
    if (so.has('vozes')) capturarVozes(raiz, path.join(saida, 'vozes.json'));
    let saves = null;
    if (so.has('dados')) saves = await capturarDados(browser, raiz, path.join(saida, 'dados'));
    if (!saves) {
      const { context, page } = await abrir({ browser, url: servidor.url, query: '?debug=1&congelar=1' });
      await page.waitForFunction(() => window.Reino && Reino.Progresso && Reino.Progresso.estado(), null, { timeout: 30000 });
      saves = await page.evaluate(`(${gerarSaves.toString()})()`);
      await context.close();
    }
    if (so.has('imagens')) {
      // cada grupo numa aba própria (servidor e banco próprios): roda em paralelo, até op.paralelo por vez
      // as filas de mapa + interiores (as mais longas) entram primeiro, uma por tamanho
      const tarefas = [];
      const t = (tamanho, save, fn) => tarefas.push({ tamanho, save, fn: Object.assign((page) => fn(page, path.join(saida, 'imagens', tamanho)), { nome: fn.name }) });
      // mapa + interiores fica numa aba só, em fila: as barras de fome/sede/banho do HUD andam com o
      // relógio, então um lote de interiores que começasse numa página nova sairia com outras barras (testado)
      tamanhos.forEach((tm) => t(tm, 'completo', cenasMapaEInteriores));
      tamanhos.forEach((tm) => [cenasSalas, cenasProvasEDesafios, cenasTelas].forEach((fn) => t(tm, 'completo', fn)));
      tamanhos.forEach((tm) => {
        t(tm, 'inicio', (page, p) => foto(page, p, 'mapa-inicio'));
        t(tm, 'avancado', (page, p) => foto(page, p, 'mapa-avancado'));
      });
      const limite = op.paralelo || PARALELO_PADRAO;
      let prox = 0;
      // um Chromium por vaga: com --disable-gpu a composição de um navegador é uma fila só para todas as abas
      await Promise.all(Array.from({ length: Math.min(limite, tarefas.length) }, async () => {
        const nav = await lancar();
        try {
          while (prox < tarefas.length) {
            const { tamanho, save, fn } = tarefas[prox++];
            const { context, page } = await abrirJogo(nav, raiz, tamanho, saves[save]);
            if (op.filtro) page.__filtro = op.filtro;
            if (op.faltam) page.__faltam = op.faltam[tamanho];
            const t0 = Date.now();
            try { await fn(page); } catch (e) { if (!e.chega) throw e; }
            if (process.env.REINO_TEMPOS) console.log(`  ${tamanho}/${save} ${fn.nome || ''}: ${((Date.now() - t0) / 1000).toFixed(0)} s`);
            if (page.__erros.length) erros.push(`${tamanho}/${save}: ${page.__erros.join(' | ')}`);
            await context.close();
          }
        } finally { await nav.close(); }
      }));
    }
    if (so.has('desempenho')) await capturarDesempenho(browser, raiz, saves, path.join(saida, 'desempenho.json'));
  } finally {
    await browser.close();
    servidor.parar();
  }
  erros.sort(); // a ordem de término varia com o paralelismo
  fs.writeFileSync(path.join(saida, 'erros.txt'), erros.join('\n') + (erros.length ? '\n' : ''));
  console.log(`✔ referências em ${saida}` + (erros.length ? ` (${erros.length} grupos com erro no console: veja erros.txt)` : ''));
}

module.exports = { capturar, comparar, estavel, PARALELO_PADRAO };

if (require.main === module) {
  const [cmd, a, b] = process.argv.slice(2);
  const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : undefined; };
  if (cmd === 'capturar' && a) {
    capturar(path.resolve(a), { raiz: arg('--raiz'), so: arg('--so'), tamanhos: arg('--tamanhos') }).catch((e) => { console.error(e); process.exit(1); });
  } else if (cmd === 'comparar' && a && b) {
    process.exit(comparar(path.resolve(a), path.resolve(b), { desempenho: process.argv.includes('--desempenho') }).ok ? 0 : 1);
  } else {
    console.log('Uso: referencias.js capturar <saida> [--raiz <jogo>] [--so dados,imagens,vozes,desempenho] [--tamanhos celular,tablet,notebook]\n     referencias.js comparar <referencia> <nova> [--desempenho]');
    process.exit(2);
  }
}

