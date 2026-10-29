// Build da Vercel: monta em public/ o jogo de ../jogo com menos requisições e grava public/js/versao.json (o jogo
// aberto percebe a versão nova e se atualiza). O jogo/ continua igual (file://, servidor de teste, e2e); só aqui:
// - os 470 scripts do manifesto viram ~10 lotes (js/lote-NN-<grupo>.<hash>.js), na ordem de carga, cortados entre
//   grupos do manifesto; cada arquivo entra depois de um ";" e de um comentário com o caminho de origem (achar erro);
// - os CSS viram um só (css/jogo.<hash>.css, na mesma pasta: o url() da fonte continua valendo);
// - os pacotes de voz (js/voz/*.js) ficam soltos (carregam sob demanda); o resto de js/ (CLAUDE.md) não vai.
// Monta também o app instalável (PWA): manifesto e ícones de pwa/, as imagens de abertura do iOS (geradas aqui), o
// sw.js com a lista { caminho: hash } de tudo (o jogo inteiro funciona sem rede) e, no index.html, o manifesto e o
// registro do service worker. A API (api/) é a do servidor de casa (jogo/servidor/servidor.js) sobre Postgres:
// lib/banco.js.
// Uso: node montar.js [--saida <pasta>]   (npm run build em vercel/; --ajuda mostra isto)
//   a saída (apagada e refeita) é vercel/public/ ou uma pasta dentro de /tmp/reino-testes/ (REINO_TESTES; os testes)
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');

const JOGO = path.join(__dirname, '..', 'jogo');
if (require.main === module) require(path.join(JOGO, 'ferramentas', 'ajuda.js')).ajuda(__filename);
const { conferirPastaTmp } = require(path.join(JOGO, 'ferramentas', 'testes', 'guardas.js'));
const PUBLICO = path.join(__dirname, 'public');
const PWA = path.join(__dirname, 'pwa');
// cor do app (theme-color): Reino.config.paleta.noite; o jogo troca para a grama com o mapa aberto (arte.md §8)
const COR = /\bnoite:\s*'(#[0-9a-f]{6})'/i.exec(fs.readFileSync(path.join(JOGO, 'js', 'nucleo', 'config.js'), 'utf8'))[1];
// o que o build lê do repositório (o plano B, jogo/ferramentas/fluxo/vercel.js, exporta só isto)
const DEPENDENCIAS = ['jogo/index.html', 'jogo/css', 'jogo/js', 'jogo/ferramentas/gerar-versao.js',
  'jogo/ferramentas/ajuda.js', 'jogo/ferramentas/jogo-no-node.js', 'jogo/ferramentas/pwa/sprite.js',
  'jogo/ferramentas/testes/guardas.js', 'vercel'];
const LOTES = 12;   // alvo de cada lote: 1/12 dos bytes (com o corte entre grupos, saem ~10 lotes)

const hash = (dados) => crypto.createHash('sha256').update(dados).digest('hex').slice(0, 16);

/* ---------- lotes ---------- */
// os scripts do manifesto em lotes, na ordem: um lote fecha quando passa do alvo e o próximo arquivo começa outro
// grupo (ou quando passa de 1,5× o alvo, num grupo grande como o dos interiores)
function separarLotes(scripts, tamanho) {
  const alvo = scripts.reduce((s, x) => s + tamanho(x.js), 0) / LOTES;
  const lotes = [];
  let atual = null;
  scripts.forEach((s) => {
    const ultimo = atual && atual.arquivos[atual.arquivos.length - 1];
    if (!atual || (atual.bytes >= alvo && (s.grupo !== ultimo.grupo || atual.bytes >= alvo * 1.5))) {
      atual = { grupo: s.grupo, arquivos: [], bytes: 0 };
      lotes.push(atual);
    }
    atual.arquivos.push(s);
    atual.bytes += tamanho(s.js);
  });
  return lotes;
}
// o texto de um lote: cada arquivo depois de ";" e do caminho (o "\n" antes fecha um // sem quebra no fim)
function juntarScripts(arquivos, ler) {
  return arquivos.map((s) => `;/* ===== ${s.js} ===== */\n` + ler(s.js)).join('\n') + '\n';
}
function juntarCss(arquivos, ler) {
  return arquivos.map((c) => `/* ===== ${c} ===== */\n` + ler(c)).join('\n') + '\n';
}

// o index.html do jogo com os <link>/<script> do manifesto trocados pelos dos lotes (no lugar do primeiro de cada)
function trocarNoIndex(html, manifesto, css, lotes) {
  const linhasCss = new Set(manifesto.css.map((c) => `<link rel="stylesheet" href="${c}">`));
  const linhasJs = new Set(manifesto.scripts.map((s) => `<script src="${s.js}"></script>`));
  let nCss = 0, nJs = 0;
  const saida = [];
  html.split('\n').forEach((l) => {
    if (linhasCss.has(l)) { if (!nCss++) saida.push(`<link rel="stylesheet" href="${css}">`); return; }
    if (linhasJs.has(l)) { if (!nJs++) lotes.forEach((n) => saida.push(`<script src="${n}"></script>`)); return; }
    saida.push(l);
  });
  if (nCss !== manifesto.css.length || nJs !== manifesto.scripts.length) {
    throw new Error('index.html não bate com o manifesto: rode npm run index');
  }
  return saida.join('\n');
}

/* ---------- abertura do iPhone e do iPad ---------- */
// apple-touch-startup-image, só PNG no tamanho exato da tela, em retrato: a noite com o unicórnio do ícone
// (jogo/ferramentas/pwa/sprite.js) no meio, em escala inteira (~40 % da largura)
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

// registra o sw.js; o novo baixa as vozes em segundo plano depois de ativo, e a aba lembra a ele de continuar
// (o navegador para um service worker parado; cada mensagem o acorda por alguns minutos): a cada minuto, até o
// "guardado" de quem controla a aba (o de um novo ainda instalando não conta; versão nova no controle = recomeça)
const REGISTRO = '<script>if ("serviceWorker" in navigator) addEventListener("load", function () {'
  + ' var sw = navigator.serviceWorker, pronto = false;'
  + ' function seguir() { if (!pronto && sw.controller) sw.controller.postMessage({ reino: "continuar" }); }'
  + ' sw.addEventListener("message", function (e) {'
  + ' if (e.data && e.data.reino === "guardado" && sw.controller && e.source === sw.controller) pronto = true; });'
  + ' sw.addEventListener("controllerchange", function () { pronto = false; seguir(); });'
  + ' setInterval(seguir, 60000); seguir();'
  + ' sw.register("sw.js").then(function (r) {'
  + ' document.addEventListener("visibilitychange", function () { if (!document.hidden) { seguir(); r.update().catch(function () {}); } });'
  + ' }).catch(function () {}); });</script>';

// a pasta que o build apaga e refaz: só vercel/public/ ou dentro da pasta de testes (nunca o jogo, nunca a raiz)
function conferirSaida(saida) {
  const abs = path.resolve(saida);
  return abs === PUBLICO ? abs : conferirPastaTmp(abs);
}

function montar(saida) {
  saida = conferirSaida(saida);
  const MANIFESTO = require(path.join(JOGO, 'js', 'manifesto.js'));
  fs.rmSync(saida, { recursive: true, force: true });
  fs.mkdirSync(path.join(saida, 'css'), { recursive: true });
  fs.mkdirSync(path.join(saida, 'js', 'voz'), { recursive: true });
  const ler = (rel) => fs.readFileSync(path.join(JOGO, rel), 'utf8');
  // pasta é também a extensão (css/jogo.<hash>.css, js/lote-01-nucleo.<hash>.js)
  const gravarComHash = (pasta, base, texto) => {
    const rel = `${pasta}/${base}.${hash(texto)}.${pasta}`;
    fs.writeFileSync(path.join(saida, rel), texto);
    return rel;
  };

  // CSS num só; a fonte (e o que mais não for .css nem .md) ao lado
  const css = gravarComHash('css', 'jogo', juntarCss(MANIFESTO.css, ler));
  fs.readdirSync(path.join(JOGO, 'css'), { withFileTypes: true })
    .filter((e) => e.isFile() && !/\.(css|md)$/.test(e.name))
    .forEach((e) => fs.copyFileSync(path.join(JOGO, 'css', e.name), path.join(saida, 'css', e.name)));
  // scripts em lotes; as vozes soltas
  const lotes = separarLotes(MANIFESTO.scripts, (rel) => fs.statSync(path.join(JOGO, rel)).size).map((l, i) =>
    gravarComHash('js', `lote-${String(i + 1).padStart(2, '0')}-${l.grupo}`, juntarScripts(l.arquivos, ler)));
  fs.readdirSync(path.join(JOGO, 'js', 'voz')).filter((n) => n.endsWith('.js'))
    .forEach((n) => fs.copyFileSync(path.join(JOGO, 'js', 'voz', n), path.join(saida, 'js', 'voz', n)));

  // PWA: manifesto e ícones na raiz (os PNG saem de jogo/ferramentas/pwa/gerar-icones.js); o index.html os anuncia e
  // registra o sw.js. O favicon é o do próprio jogo (index.html); o nome curto é o do manifesto (um lugar só).
  const NOME_CURTO = JSON.parse(fs.readFileSync(path.join(PWA, 'manifest.webmanifest'), 'utf8')).short_name;
  fs.readdirSync(PWA).filter((n) => n !== 'sw.js').forEach((n) => fs.copyFileSync(path.join(PWA, n), path.join(saida, n)));
  const UNICORNIO = require(path.join(JOGO, 'ferramentas', 'pwa', 'sprite.js')).unicornio('rosa', 3, 0, 'lado');
  const aberturas = TELAS.map(([w, h, d]) => {
    const L = w * d, A = h * d, nome = `abertura-${L}x${A}.png`;
    fs.writeFileSync(path.join(saida, nome), pngLiso(L, A, COR, UNICORNIO, Math.max(1, Math.floor(L * 0.4 / UNICORNIO.w))));
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
    REGISTRO,
  ].join('\n');
  const html = trocarNoIndex(ler('index.html'), MANIFESTO, css, lotes);
  if (!html.includes('</head>')) throw new Error('index.html sem </head>');
  fs.writeFileSync(path.join(saida, 'index.html'), html.replace('</head>', cabeca + '\n</head>'));
  // a impressão digital da árvore publicada (index, css e js daqui: lotes e vozes)
  require(path.join(JOGO, 'ferramentas', 'gerar-versao.js')).gravar(saida);

  // sw.js: cada arquivo publicado (fora ele mesmo) com o hash do conteúdo
  const arquivos = {};
  (function andar(rel) {
    fs.readdirSync(path.join(saida, rel), { withFileTypes: true }).forEach((e) => {
      const r = rel ? rel + '/' + e.name : e.name;
      if (e.isDirectory()) andar(r);
      else arquivos[r] = hash(fs.readFileSync(path.join(saida, r)));
    });
  })('');
  const ordenados = Object.fromEntries(Object.keys(arquivos).sort().map((k) => [k, arquivos[k]]));
  const sw = fs.readFileSync(path.join(PWA, 'sw.js'), 'utf8');
  if (!sw.includes('__ARQUIVOS__')) throw new Error('pwa/sw.js sem __ARQUIVOS__');
  fs.writeFileSync(path.join(saida, 'sw.js'), sw.replace('__ARQUIVOS__', JSON.stringify(ordenados)));
  return { arquivos: ordenados, lotes, css };
}

module.exports = { montar, conferirSaida, separarLotes, juntarScripts, trocarNoIndex, DEPENDENCIAS };

if (require.main === module) {
  const i = process.argv.indexOf('--saida');
  const saida = i > 0 ? path.resolve(process.argv[i + 1]) : PUBLICO;
  const r = montar(saida);
  console.log('jogo montado em', saida, `(${r.lotes.length} lotes de script, 1 CSS, ${Object.keys(r.arquivos).length} arquivos no sw.js)`);
}
