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
const path = require('path');
const { iniciar } = require('./servidor-teste');
const { abrir, lancar, TAMANHOS } = require('./navegador');
const { gerarSaves } = require('./saves');
const { estavel, abrirJogo, foto } = require('./referencias-pagina');
const { cenasMapaEInteriores, cenasTelas, cenasSalas, cenasProvasEDesafios } = require('./referencias-cenas');
const { capturarDados, capturarDesempenho, capturarVozes } = require('./referencias-dados');
const { comparar } = require('./referencias-comparar');

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
      await Promise.all(tamanhos.map(async (tamanho) => {
        const pasta = path.join(saida, 'imagens', tamanho);
        const grupos = [
          ['inicio', async (page) => foto(page, pasta, 'mapa-inicio')],
          ['avancado', async (page) => foto(page, pasta, 'mapa-avancado')],
          ['completo', (page) => cenasMapaEInteriores(page, pasta)],
          ['completo', (page) => cenasTelas(page, pasta)],
          ['completo', (page) => cenasSalas(page, pasta)],
          ['completo', (page) => cenasProvasEDesafios(page, pasta)],
        ];
        for (const [save, fn] of grupos) {
          const { context, page } = await abrirJogo(browser, raiz, tamanho, saves[save]);
          await fn(page);
          if (page.__erros.length) erros.push(`${tamanho}/${save}: ${page.__erros.join(' | ')}`);
          await context.close();
        }
      }));
    }
    if (so.has('desempenho')) await capturarDesempenho(browser, raiz, saves, path.join(saida, 'desempenho.json'));
  } finally {
    await browser.close();
    servidor.parar();
  }
  fs.writeFileSync(path.join(saida, 'erros.txt'), erros.join('\n') + (erros.length ? '\n' : ''));
  console.log(`✔ referências em ${saida}` + (erros.length ? ` (${erros.length} grupos com erro no console: veja erros.txt)` : ''));
}

module.exports = { capturar, comparar, estavel };

if (require.main === module) {
  const [cmd, a, b] = process.argv.slice(2);
  const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : undefined; };
  if (cmd === 'capturar' && a) {
    capturar(path.resolve(a), { raiz: arg('--raiz'), so: arg('--so'), tamanhos: arg('--tamanhos') }).catch((e) => { console.error(e); process.exit(1); });
  } else if (cmd === 'comparar' && a && b) {
    process.exit(comparar(path.resolve(a), path.resolve(b), { desempenho: process.argv.includes('--desempenho') }) ? 0 : 1);
  } else {
    console.log('Uso: referencias.js capturar <saida> [--raiz <jogo>] [--so dados,imagens,vozes,desempenho] [--tamanhos celular,tablet,notebook]\n     referencias.js comparar <referencia> <nova> [--desempenho]');
    process.exit(2);
  }
}

