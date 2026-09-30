/* Build da Vercel: copia de ../jogo só o que o servidor de casa deixava público (index.html, css/<arquivo>, js/**)
   para public/, grava public/js/versao.json (o jogo aberto percebe a versão nova e se atualiza) e monta o app
   instalável (PWA): manifesto e ícones de pwa/, as imagens de abertura do iOS (geradas aqui), o sw.js com a lista { caminho: hash } de tudo (o jogo inteiro
   funciona sem rede) e, no index.html, o manifesto e o registro do service worker.
   A API (api/) é a do servidor de casa (jogo/servidor/servidor.js) sobre Postgres: lib/banco.js. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const { execFileSync } = require('node:child_process');

const JOGO = path.join(__dirname, '..', 'jogo');
const PWA = path.join(__dirname, 'pwa');
const SAIDA = path.join(__dirname, 'public');
// cor do app (theme-color): Reino.config.paleta.noite; o jogo troca para a grama com o mapa aberto (ui.md §10.8)
const COR = /\bnoite:\s*'(#[0-9a-f]{6})'/i.exec(fs.readFileSync(path.join(JOGO, 'js', 'nucleo', 'config.js'), 'utf8'))[1];

fs.rmSync(SAIDA, { recursive: true, force: true });
fs.mkdirSync(path.join(SAIDA, 'css'), { recursive: true });
fs.copyFileSync(path.join(JOGO, 'index.html'), path.join(SAIDA, 'index.html'));
fs.readdirSync(path.join(JOGO, 'css'), { withFileTypes: true })
  .filter((e) => e.isFile())
  .forEach((e) => fs.copyFileSync(path.join(JOGO, 'css', e.name), path.join(SAIDA, 'css', e.name)));
fs.cpSync(path.join(JOGO, 'js'), path.join(SAIDA, 'js'), { recursive: true, filter: (o) => !o.endsWith('versao.json') });
execFileSync(process.execPath, [path.join(JOGO, 'ferramentas', 'gerar-versao.js'), '--raiz', SAIDA], { stdio: 'inherit' });

// PWA: manifesto e ícones na raiz (os PNG saem de jogo/ferramentas/pwa/gerar-icones.js); o index.html os anuncia e
// registra o sw.js. O favicon é o do próprio jogo (index.html); o nome curto é o do manifesto (um lugar só).
const NOME_CURTO = JSON.parse(fs.readFileSync(path.join(PWA, 'manifest.webmanifest'), 'utf8')).short_name;
fs.readdirSync(PWA).filter((n) => n !== 'sw.js').forEach((n) => fs.copyFileSync(path.join(PWA, n), path.join(SAIDA, n)));

// abertura do iPhone e do iPad (apple-touch-startup-image, só PNG no tamanho exato da tela, em retrato): a noite com o
// unicórnio do ícone (jogo/ferramentas/pwa/sprite.js) no meio, em escala inteira (~40 % da largura)
const TELAS = [ // [largura, altura em pontos CSS, densidade]
  [320, 568, 2], [375, 667, 2], [414, 736, 3], [375, 812, 3], [414, 896, 2], [414, 896, 3], [390, 844, 3],
  [428, 926, 3], [393, 852, 3], [430, 932, 3], [402, 874, 3], [420, 912, 3], [440, 956, 3],
  [744, 1133, 2], [768, 1024, 2], [810, 1080, 2], [820, 1180, 2], [834, 1112, 2], [834, 1194, 2], [1024, 1366, 2],
  [834, 1210, 2], [1032, 1376, 2],
];
function pngLiso(L, A, fundo, s, escala) {
  const cor = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const f = cor(fundo), ox = Math.floor((L - s.w * escala) / 2), oy = Math.floor((A - s.h * escala) / 2);
  const bruto = Buffer.alloc((L * 3 + 1) * A);
  for (let y = 0; y < A; y++) {
    const ay = Math.floor((y - oy) / escala);
    for (let x = 0; x < L; x++) {
      const ax = Math.floor((x - ox) / escala);
      const c = ay >= 0 && ax >= 0 && ay < s.h && ax < s.w && s.px[ay][ax];
      bruto.set(c ? cor(c) : f, y * (L * 3 + 1) + 1 + x * 3);
    }
  }
  const crcT = [];
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crcT[n] = c >>> 0; }
  const crc = (b) => { let c = 0xffffffff; for (const v of b) c = crcT[(c ^ v) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const bloco = (tipo, dados) => {
    const t = Buffer.concat([Buffer.from(tipo), dados]), n = Buffer.alloc(4), k = Buffer.alloc(4);
    n.writeUInt32BE(dados.length); k.writeUInt32BE(crc(t));
    return Buffer.concat([n, t, k]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(L, 0); ihdr.writeUInt32BE(A, 4); ihdr[8] = 8; ihdr[9] = 2;   // 8 bits, RGB
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), bloco('IHDR', ihdr),
    bloco('IDAT', zlib.deflateSync(bruto, { level: 9 })), bloco('IEND', Buffer.alloc(0))]);
}
const UNICORNIO = require(path.join(JOGO, 'ferramentas', 'pwa', 'sprite.js')).unicornio('rosa', 3, 0, 'lado');
const aberturas = TELAS.map(([w, h, d]) => {
  const L = w * d, A = h * d, nome = `abertura-${L}x${A}.png`;
  fs.writeFileSync(path.join(SAIDA, nome), pngLiso(L, A, COR, UNICORNIO, Math.max(1, Math.floor(L * 0.4 / UNICORNIO.w))));
  return `<link rel="apple-touch-startup-image" href="${nome}" media="(device-width: ${w}px) and (device-height: ${h}px)`
    + ` and (-webkit-device-pixel-ratio: ${d}) and (orientation: portrait)">`;
});
const cabeca = [
  '<link rel="manifest" href="manifest.webmanifest">',
  `<meta name="theme-color" content="${COR}">`,
  '<link rel="apple-touch-icon" href="apple-touch-icon.png">',
  '<meta name="apple-mobile-web-app-capable" content="yes">',
  `<meta name="apple-mobile-web-app-title" content="${NOME_CURTO}">`,
  '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">',
  ...aberturas,
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
