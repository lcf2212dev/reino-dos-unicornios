// Gera o jogo/index.html a partir de js/manifesto.js (a lista única de CSS e scripts, em ordem).
// Uso: node ferramentas/gerar-index.js             → reescreve index.html
//      node ferramentas/gerar-index.js --conferir  → só confere; sai com código 1 se o index.html
//        não bate com o manifesto, se algum arquivo do manifesto não existe ou se há .js em js/
//        (fora de js/voz/ e do próprio manifesto) que não está no manifesto.
// O cabeçalho e o corpo fixos do HTML estão no MODELO abaixo. O ferramentas/gerar-artifact.js
// tira doctype, <html>, <head>, <body> e as metas charset/viewport desta mesma página.
const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..');
const MANIFESTO = require(path.join(raiz, 'js/manifesto.js'));

const MARCA = '<!-- Gerado por ferramentas/gerar-index.js a partir de js/manifesto.js. Não edite à mão: mude o manifesto e rode o gerador. -->';
const MODELO = `<!doctype html>
${MARCA}
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Reino dos Unicórnios</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Crect fill='%23c6e15a' width='16' height='16'/%3E%3Ccircle cx='8' cy='9' r='4' fill='%23fff8ee' stroke='%233a2446'/%3E%3Cpath d='M8 2l1 3h-2z' fill='%23f0a04a'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap">
{{CSS}}
</head>
<body>
<canvas id="reino" aria-label="Mapa do Reino dos Unicórnios"></canvas>
<div id="hud" hidden></div>
<div id="setas" hidden></div>
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
}
