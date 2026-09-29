/* Build da Vercel: copia de ../jogo só o que o servidor de casa deixava público (index.html, css/<arquivo>, js/**)
   para public/, grava public/js/versao.json (o jogo aberto percebe a versão nova e se atualiza) e monta o app
   instalável (PWA): manifesto e ícones de pwa/, o sw.js com a lista { caminho: hash } de tudo (o jogo inteiro
   funciona sem rede) e, no index.html, o manifesto e o registro do service worker.
   A API (api/) é a do servidor de casa (jogo/servidor/servidor.js) sobre Postgres: lib/banco.js. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');

const JOGO = path.join(__dirname, '..', 'jogo');
const PWA = path.join(__dirname, 'pwa');
const SAIDA = path.join(__dirname, 'public');
const COR = '#3b2170';

fs.rmSync(SAIDA, { recursive: true, force: true });
fs.mkdirSync(path.join(SAIDA, 'css'), { recursive: true });
fs.copyFileSync(path.join(JOGO, 'index.html'), path.join(SAIDA, 'index.html'));
fs.readdirSync(path.join(JOGO, 'css'), { withFileTypes: true })
  .filter((e) => e.isFile())
  .forEach((e) => fs.copyFileSync(path.join(JOGO, 'css', e.name), path.join(SAIDA, 'css', e.name)));
fs.cpSync(path.join(JOGO, 'js'), path.join(SAIDA, 'js'), { recursive: true, filter: (o) => !o.endsWith('versao.json') });
execFileSync(process.execPath, [path.join(JOGO, 'ferramentas', 'gerar-versao.js'), '--raiz', SAIDA], { stdio: 'inherit' });

// PWA: manifesto e ícones na raiz; o index.html os anuncia e registra o sw.js
fs.readdirSync(PWA).filter((n) => n !== 'sw.js').forEach((n) => fs.copyFileSync(path.join(PWA, n), path.join(SAIDA, n)));
const cabeca = [
  '<link rel="manifest" href="manifest.webmanifest">',
  `<meta name="theme-color" content="${COR}">`,
  '<link rel="icon" type="image/png" sizes="192x192" href="icone-192.png">',
  '<link rel="apple-touch-icon" href="apple-touch-icon.png">',
  '<meta name="apple-mobile-web-app-capable" content="yes">',
  '<script>if ("serviceWorker" in navigator) addEventListener("load", function () {'
    + ' navigator.serviceWorker.register("sw.js").then(function (r) {'
    + ' document.addEventListener("visibilitychange", function () { if (!document.hidden) r.update().catch(function () {}); });'
    + ' }).catch(function () {}); });</script>',
].join('\n');
const indice = path.join(SAIDA, 'index.html');
const html = fs.readFileSync(indice, 'utf8');
if (!html.includes('</head>')) throw new Error('index.html sem </head>');
fs.writeFileSync(indice, html.replace('</head>', cabeca + '\n</head>'));

// sw.js: cada arquivo publicado (fora ele mesmo) com o hash do conteúdo
const arquivos = {};
(function andar(rel) {
  fs.readdirSync(path.join(SAIDA, rel), { withFileTypes: true }).forEach((e) => {
    const r = rel ? rel + '/' + e.name : e.name;
    if (e.isDirectory()) andar(r);
    else arquivos[r] = crypto.createHash('sha256').update(fs.readFileSync(path.join(SAIDA, r))).digest('hex').slice(0, 16);
  });
})('');
const ordenados = Object.fromEntries(Object.keys(arquivos).sort().map((k) => [k, arquivos[k]]));
const sw = fs.readFileSync(path.join(PWA, 'sw.js'), 'utf8');
if (!sw.includes('__ARQUIVOS__')) throw new Error('pwa/sw.js sem __ARQUIVOS__');
fs.writeFileSync(path.join(SAIDA, 'sw.js'), sw.replace('__ARQUIVOS__', JSON.stringify(ordenados)));
console.log('jogo copiado para', SAIDA, '(' + Object.keys(ordenados).length + ' arquivos no sw.js)');
