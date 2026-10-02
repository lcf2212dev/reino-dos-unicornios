// Regiões conhecidas da tela (px CSS) para o resumo do e2e: uma imagem cuja diferença cai toda
// dentro de uma região vira "só HUD", "só dock" ou "só balão" (referencias-comparar.js).
// A tabela é medida uma vez no jogo e escrita aqui mesmo (não entra no hash do harness):
//   node jogo/ferramentas/testes/referencias-regioes.js --medir
const fs = require('fs');

// seletor de cada região (o balão do Claude é aberto com uma fala comprida só para medir)
const SELETORES = { hudTopo: '.hud-topo', dock: '.dock', balao: '#claude-balao' };
const ROTULOS = { hudTopo: 'só HUD', dock: 'só dock', balao: 'só balão' };
// folga (px CSS) em volta de cada região: antialiasing e sombras
const FOLGA = 4;

// <regioes> (gerado por --medir; não edite à mão)
const REGIOES = {
  celular: { densidade: 3, hudTopo: { x: 10, y: 10, w: 370, h: 194 }, balao: { x: 8, y: 646, w: 374, h: 186 } },
  tablet: { densidade: 2, hudTopo: { x: 10, y: 10, w: 800, h: 210 }, balao: { x: 110, y: 860, w: 600, h: 308 } },
  notebook: { densidade: 1, hudTopo: { x: 10, y: 10, w: 1346, h: 210 }, balao: { x: 383, y: 448, w: 600, h: 308 } },
};
// </regioes>

// caixa c (px CSS) inteira dentro de r, com folga
function dentro(c, r) {
  return c.x >= r.x - FOLGA && c.y >= r.y - FOLGA && c.x + c.w <= r.x + r.w + FOLGA && c.y + c.h <= r.y + r.h + FOLGA;
}
// região única que contém todas as caixas (chave de REGIOES), ou 'outras'
function classificar(caixas, tamanho, tabela = REGIOES) {
  const t = tabela[tamanho];
  if (!t || !caixas || !caixas.length) return 'outras';
  const r = Object.keys(SELETORES).find((k) => t[k] && caixas.every((c) => dentro(c, t[k])));
  return r || 'outras';
}

async function medir() {
  const { abrirCenario } = require('./cenario');
  const { TAMANHOS } = require('./navegador');
  const tab = {};
  for (const tamanho of Object.keys(TAMANHOS)) {
    const c = await abrirCenario({ save: 'completo', tamanho });
    try {
      // balão aberto com a fala mais comprida que cabe (3 linhas de texto)
      await c.page.evaluate(() => { Reino.Claude.falar('Texto comprido só para medir o balão. '.repeat(6)); });
      await c.avancar(800);
      tab[tamanho] = Object.assign({ densidade: TAMANHOS[tamanho].deviceScaleFactor }, await c.page.evaluate((sel) => {
        var r = {};
        Object.keys(sel).forEach(function (k) {
          var el = document.querySelector(sel[k]);
          if (!el) return;
          var q = el.getBoundingClientRect();
          r[k] = { x: Math.floor(q.left), y: Math.floor(q.top), w: Math.ceil(q.width), h: Math.ceil(q.height) };
        });
        return r;
      }, SELETORES));
    } finally { await c.fechar(); }
  }
  const txt = Object.keys(tab).map((k) => `  ${k}: ${JSON.stringify(tab[k]).replace(/"(\w+)":/g, '$1: ').replace(/,(?=\w)/g, ', ').replace(/{/g, '{ ').replace(/}/g, ' }')},`).join('\n');
  const arq = __filename, velho = fs.readFileSync(arq, 'utf8');
  const novo = velho.replace(/(\/\/ <regioes>[^\n]*\nconst REGIOES = \{\n)[\s\S]*?(\n\};\n\/\/ <\/regioes>)/, (m, a, b) => a + txt + b);
  fs.writeFileSync(arq + '.tmp', novo);
  fs.renameSync(arq + '.tmp', arq);
  console.log(txt);
}

module.exports = { REGIOES, ROTULOS, SELETORES, FOLGA, classificar, dentro };

if (require.main === module) {
  if (process.argv.includes('--medir')) medir().then(() => process.exit(0), (e) => { console.error('✘ ' + (e && e.stack || e)); process.exit(1); });
  else console.log('Uso: node jogo/ferramentas/testes/referencias-regioes.js --medir');
}
