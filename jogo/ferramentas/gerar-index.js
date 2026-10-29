// Gera o jogo/index.html a partir de js/manifesto.js (a lista única de CSS e scripts, em ordem).
// Uso: node ferramentas/gerar-index.js             → reescreve index.html e o js/versao.json (gerar-versao.js)
//      node ferramentas/gerar-index.js --conferir  → só confere; sai com código 1 se o index.html
//        não bate com o manifesto, se algum arquivo do manifesto não existe ou se há .js em js/
//        (fora de js/voz/ e do próprio manifesto) que não está no manifesto.
// O cabeçalho e o corpo fixos do HTML estão no MODELO abaixo.
if (require.main === module) require('./ajuda').ajuda(__filename);
const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..');
const MANIFESTO = require(path.join(raiz, 'js/manifesto.js'));

// o favicon (um só, também no app da Vercel): a cabeça do unicórnio em 16×16, feita por ferramentas/pwa/gerar-icones.js
const FAVICON = 'data:image/svg+xml,' + fs.readFileSync(path.join(__dirname, 'pwa', 'favicon.svg'), 'utf8').trim()
  .replace(/[%#<>"]/g, encodeURIComponent);
// a cor do app (splash, página antes dos scripts, abertura): Reino.config.paleta.noite (ui.md §10.8)
const NOITE = /\bnoite:\s*'(#[0-9a-f]{6})'/i.exec(fs.readFileSync(path.join(raiz, 'js/nucleo/config.js'), 'utf8'))[1];
const MARCA = '<!-- Gerado por ferramentas/gerar-index.js a partir de js/manifesto.js. Não edite à mão: mude o manifesto e rode o gerador. -->';
const MODELO = `<!doctype html>
${MARCA}
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Reino dos Unicórnios</title>
<style>html{background:${NOITE}}</style>
<link rel="icon" href="${FAVICON}">
<link rel="preload" href="css/press-start-2p.woff2" as="font" type="font/woff2" crossorigin>
{{CSS}}
</head>
<body>
<canvas id="reino" aria-label="Mapa do Reino dos Unicórnios"></canvas>
<div id="hud" hidden></div>
<div id="controle" hidden></div>
<div id="telas"></div>

{{SCRIPTS}}
</body>
</html>
`;

function gerar() {
  return MODELO
    .replace('{{CSS}}', MANIFESTO.css.map((c) => `<link rel="stylesheet" href="${c}">`).join('\n'))
    .replace('{{SCRIPTS}}', MANIFESTO.scripts.map((s) => `<script src="${s.js}"></script>`).join('\n'));
}

// .js em js/ que deveriam estar no manifesto (js/voz/ é gerado e carregado sob demanda)
function jsForaDoManifesto() {
  const listados = new Set(MANIFESTO.scripts.map((s) => s.js));
  const achados = [];
  (function andar(rel) {
    fs.readdirSync(path.join(raiz, rel), { withFileTypes: true }).forEach((e) => {
      const r = rel + '/' + e.name;
      if (e.isDirectory()) { if (r !== 'js/voz') andar(r); } else if (e.name.endsWith('.js') && r !== 'js/manifesto.js' && !listados.has(r)) achados.push(r);
    });
  })('js');
  return achados.sort();
}

const html = gerar();
const arqIndex = path.join(raiz, 'index.html');
if (process.argv.includes('--conferir')) {
  const erros = [];
  MANIFESTO.css.concat(MANIFESTO.scripts.map((s) => s.js)).forEach((f) => {
    if (!fs.existsSync(path.join(raiz, f))) erros.push('no manifesto, mas não existe: ' + f);
  });
  const repetidos = MANIFESTO.scripts.map((s) => s.js).filter((f, i, l) => l.indexOf(f) !== i);
  repetidos.forEach((f) => erros.push('repetido no manifesto: ' + f));
  jsForaDoManifesto().forEach((f) => erros.push('fora do manifesto: ' + f + ' (acrescente uma linha em js/manifesto.js)'));
  const atual = fs.existsSync(arqIndex) ? fs.readFileSync(arqIndex, 'utf8') : '';
  if (atual !== html) erros.push('index.html não bate com o manifesto: rode node ferramentas/gerar-index.js');
  if (erros.length) {
    erros.forEach((e) => console.log('✘ ' + e));
    process.exit(1);
  }
  console.log(`✔ index.html confere com o manifesto (${MANIFESTO.css.length} CSS, ${MANIFESTO.scripts.length} scripts)`);
} else {
  fs.writeFileSync(arqIndex, html);
  console.log(`index.html gerado (${MANIFESTO.css.length} CSS, ${MANIFESTO.scripts.length} scripts)`);
  // a impressão digital do jogo (js/versao.json, no .gitignore): as abas abertas se atualizam sozinhas
  const v = require('./gerar-versao').gravar(raiz);
  console.log(`js/versao.json gerado (${v.versao.slice(0, 12)}…)`);
}
