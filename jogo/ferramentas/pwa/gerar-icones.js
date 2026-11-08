// Gera os ícones do app instalado (vercel/pwa/*.png), os do app da Play Store (android/app/src/main/res) e o favicon do jogo (jogo/ferramentas/pwa/favicon.svg, que o
// gerar-index.js põe no index.html) a partir da pixel art do jogo: o primeiro unicórnio (rosa, adulto, de lado),
// desenhado pelo próprio js/arte/pixelart-unicornio.js (sprite.js), em escala inteira, sobre faixas lisas de roxo
// alinhadas à grade de pixel do desenho (nada de degradê), com a sombra reta embaixo.
// Uso: node jogo/ferramentas/pwa/gerar-icones.js               grava os PNG e o favicon (mesma entrada = mesmos bytes)
//      node jogo/ferramentas/pwa/gerar-icones.js --conferir    só confere; código 1 se algum arquivo não bate
//      node jogo/ferramentas/pwa/gerar-icones.js --ampliar <pasta>
//        grava também, na pasta (fora do repositório, ex.: /tmp/reino-testes/icones), cada ícone ampliado (vizinho
//        mais próximo), o maskable com o recorte redondo por cima e o favicon a 16 e 32 px ampliados
// Mudou o unicórnio no jogo: rode de novo e faça o commit dos arquivos.
if (require.main === module) require('../ajuda').ajuda(__filename);
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const { unicornio } = require('./sprite');

const RAIZ = path.join(__dirname, '..', '..', '..');
const PWA = path.join(RAIZ, 'vercel', 'pwa');
const RES = path.join(RAIZ, 'android', 'app', 'src', 'main', 'res');   // o app da Play Store (android/README.md)
const FAVICON = path.join(__dirname, 'favicon.svg');

// fundo: céu em duas faixas e o chão onde ele pisa (o roxo da abertura do app em cima, #3b2170 = background_color)
const CEU = '#3b2170', CEU_2 = '#4a2880', CHAO = '#5c3290';
const SOMBRA_ALFA = 0.25;              // sombra de chão (arte.md §13: alfa 0,15 a 0,25, um nível)
const ZONA_SEGURA = 0.4;               // maskable: raio do círculo seguro = 40 % do lado (204,8 px em 512)
const ZONA_ADAPTATIVO = 33 / 108;      // ícone adaptativo do Android: círculo seguro de 66 dp numa camada de 108 dp
const LARGURA_ANDROID = 0.8;           // ícone antigo do Android (mipmap): o desenho até 80 % da largura

/* ---------- a arte, em pixels de arte ---------- */
function mistura(a, b, t) {
  const x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16);
  return '#' + [16, 8, 0].map((s) => {
    const v = Math.round(((x >> s) & 255) + (((y >> s) & 255) - ((x >> s) & 255)) * t);
    return v.toString(16).padStart(2, '0');
  }).join('');
}

// o unicórnio com a sombra embaixo: { w, h, px, chao } (chao = linha de arte onde o chão começa)
function desenho() {
  const s = unicornio('rosa', 3, 0, 'lado');
  const w = s.w, h = s.h + 1, base = s.h - 1;   // base: a última linha do contorno dos cascos
  const px = s.px.map((l) => l.slice()).concat([new Array(w).fill(null)]);
  // sombra de chão (arte.md §13): elipse de pixel de um nível, 2 pixels além dos cascos, atrás deles e embaixo
  const cols = px[base].map((c, x) => (c ? x : -1)).filter((x) => x >= 0);
  const x0 = cols[0], x1 = cols[cols.length - 1];
  const cor = mistura(CHAO, s.contorno, SOMBRA_ALFA);
  for (let x = Math.max(0, x0 - 2); x <= Math.min(w - 1, x1 + 2); x++) if (!px[base][x]) px[base][x] = cor;
  for (let x = x0; x <= x1; x++) px[base + 1][x] = cor;
  return { w, h, px, chao: base - 1, sombra: cor };
}

/* ---------- ícone: fundo em faixas + desenho em escala inteira, centrado ---------- */
// ícone de lado L com o desenho na escala e a origem dadas; faixas nas linhas de arte (bordas em múltiplos da escala)
// transparente: só o desenho (a abertura do app Android, sobre a cor de fundo dele)
function icone(L, d, escala, ox, oy, transparente) {
  const img = new PNG({ width: L, height: L });
  const faixa = (yPx) => {
    const linha = Math.floor((yPx - oy) / escala);   // linha de arte (negativa acima do desenho)
    return linha >= d.chao ? CHAO : linha >= Math.floor(d.chao / 2) ? CEU_2 : CEU;
  };
  for (let y = 0; y < L; y++) {
    const fundo = faixa(y);
    for (let x = 0; x < L; x++) {
      const ay = Math.floor((y - oy) / escala), ax = Math.floor((x - ox) / escala);
      const cor = (ay >= 0 && ax >= 0 && ay < d.h && ax < d.w && d.px[ay][ax]) || (transparente ? null : fundo);
      if (!cor) continue;
      const n = parseInt(cor.slice(1), 16), k = (y * L + x) * 4;
      img.data[k] = n >> 16; img.data[k + 1] = (n >> 8) & 255; img.data[k + 2] = n & 255; img.data[k + 3] = 255;
    }
  }
  return img;
}

// caixa dos pixels pintados do desenho (em pixels de arte)
function caixa(d) {
  let x0 = d.w, y0 = d.h, x1 = -1, y1 = -1;
  d.px.forEach((l, y) => l.forEach((c, x) => { if (c) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } }));
  return { x0, y0, x1, y1, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}
// origem que centra a caixa do desenho no ícone (px inteiros)
function centrar(L, d, escala) {
  const c = caixa(d);
  return [Math.floor((L - c.w * escala) / 2) - c.x0 * escala, Math.floor((L - c.h * escala) / 2) - c.y0 * escala];
}
// o canto de pixel pintado mais longe do centro do ícone (para o recorte redondo do maskable)
function raioMaximo(L, d, escala, ox, oy) {
  let r = 0;
  d.px.forEach((l, y) => l.forEach((c, x) => {
    if (!c) return;
    [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([a, b]) => {
      r = Math.max(r, Math.hypot(ox + (x + a) * escala - L / 2, oy + (y + b) * escala - L / 2));
    });
  }));
  return r;
}
// maior escala inteira em que o desenho inteiro cabe no círculo seguro
function escalaMaskable(L, d, zona = ZONA_SEGURA) {
  for (let e = 32; e > 1; e--) {
    const [ox, oy] = centrar(L, d, e);
    if (raioMaximo(L, d, e, ox, oy) <= L * zona) return e;
  }
  throw new Error('gerar-icones: o desenho não cabe no círculo seguro');
}

/* ---------- favicon 16×16: a cabeça com chifre e crina ---------- */
// recorte do sprite (cabeça, chifre, crina e o começo do pescoço) sobre o céu, cantos em degrau de 1 pixel
function favicon(d) {
  const L = 16, X0 = d.w - L, px = [];   // a cabeça olha para a direita: as 16 colunas da direita
  for (let y = 0; y < L; y++) {
    const l = [];
    for (let x = 0; x < L; x++) {
      const canto = (x === 0 || x === L - 1) && (y === 0 || y === L - 1);
      l.push(canto ? null : (d.px[y] && d.px[y][X0 + x]) || (y >= 12 ? CEU_2 : CEU));
    }
    px.push(l);
  }
  return px;
}
function faviconSvg(px) {
  const rects = [];
  px.forEach((l, y) => {
    for (let x = 0; x < l.length;) {
      const c = l[x];
      let n = 1;
      while (x + n < l.length && l[x + n] === c) n++;
      if (c) rects.push(`<rect x='${x}' y='${y}' width='${n}' height='1' fill='${c}'/>`);
      x += n;
    }
  });
  return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' shape-rendering='crispEdges'>${rects.join('')}</svg>\n`;
}
function pngDePixels(px, escala) {
  const L = px.length * escala, img = new PNG({ width: L, height: L });
  for (let y = 0; y < L; y++) for (let x = 0; x < L; x++) {
    const c = px[Math.floor(y / escala)][Math.floor(x / escala)], k = (y * L + x) * 4;
    if (!c) continue;
    const n = parseInt(c.slice(1), 16);
    img.data[k] = n >> 16; img.data[k + 1] = (n >> 8) & 255; img.data[k + 2] = n & 255; img.data[k + 3] = 255;
  }
  return img;
}

/* ---------- os arquivos ---------- */
// lado, escala do pixel de arte (maskable: a maior que cabe no círculo seguro)
const ICONES = [
  { arq: 'icone-192.png', L: 192, escala: 5 },
  { arq: 'icone-512.png', L: 512, escala: 14 },
  { arq: 'icone-maskable-512.png', L: 512, escala: 'maskable' },
  { arq: 'apple-touch-icon.png', L: 180, escala: 5 },
  // Android (android/app/src/main/res): o mipmap antigo em cada densidade, a camada da frente do ícone adaptativo
  // (108 dp, o desenho no círculo seguro; o fundo em faixas vai junto) e a imagem da abertura do app
  ...[['mdpi', 1], ['hdpi', 1.5], ['xhdpi', 2], ['xxhdpi', 3], ['xxxhdpi', 4]].flatMap(([dpi, x]) => [
    { arq: `mipmap-${dpi}/ic_launcher.png`, pasta: RES, L: 48 * x, escala: 'android' },
    { arq: `mipmap-${dpi}/ic_launcher_frente.png`, pasta: RES, L: 108 * x, escala: 'adaptativo' },
  ]),
  { arq: 'drawable-nodpi/abertura.png', pasta: RES, L: 384, escala: 10, transparente: true },
];
const opcoesPng = { deflateLevel: 9, filterType: 4 };

function gerar() {
  const d = desenho(), saidas = [], info = [];
  ICONES.forEach((ic) => {
    const e = ic.escala === 'maskable' ? escalaMaskable(ic.L, d)
      : ic.escala === 'adaptativo' ? escalaMaskable(ic.L, d, ZONA_ADAPTATIVO)
        : ic.escala === 'android' ? Math.max(1, Math.floor(ic.L * LARGURA_ANDROID / caixa(d).w)) : ic.escala;
    const [ox, oy] = centrar(ic.L, d, e);
    const img = icone(ic.L, d, e, ox, oy, ic.transparente);
    const c = caixa(d);
    info.push({ arq: ic.arq, L: ic.L, escala: e, largura: c.w * e, raio: raioMaximo(ic.L, d, e, ox, oy), img });
    saidas.push({ caminho: path.join(ic.pasta || PWA, ic.arq), dados: PNG.sync.write(img, opcoesPng) });
  });
  const fav = favicon(d);
  saidas.push({ caminho: FAVICON, dados: Buffer.from(faviconSvg(fav)) });
  return { saidas, info, fav };
}

function ampliar(pasta, info, fav) {
  fs.mkdirSync(pasta, { recursive: true });
  const escrever = (nome, img) => fs.writeFileSync(path.join(pasta, nome), PNG.sync.write(img));
  const vezes = (img, n) => {
    const o = new PNG({ width: img.width * n, height: img.height * n });
    for (let y = 0; y < o.height; y++) for (let x = 0; x < o.width; x++) {
      const k = (y * o.width + x) * 4, s = (Math.floor(y / n) * img.width + Math.floor(x / n)) * 4;
      img.data.copy(o.data, k, s, s + 4);
    }
    return o;
  };
  info.forEach((i) => {
    escrever(i.arq.replace('/', '-').replace('.png', '-x2.png'), vezes(i.img, i.L < 256 ? 4 : 2));
    if (!i.arq.includes('maskable')) return;
    // o recorte redondo do Android: fora do círculo de raio 50 % fica cinza; a linha do círculo seguro (40 %) em branco
    const m = PNG.sync.read(PNG.sync.write(i.img));
    for (let y = 0; y < i.L; y++) for (let x = 0; x < i.L; x++) {
      const r = Math.hypot(x + 0.5 - i.L / 2, y + 0.5 - i.L / 2), k = (y * i.L + x) * 4;
      if (r > i.L / 2) { m.data[k] = m.data[k + 1] = m.data[k + 2] = 200; }
      else if (Math.abs(r - i.L * ZONA_SEGURA) < 1) { m.data[k] = m.data[k + 1] = m.data[k + 2] = 255; }
    }
    escrever('icone-maskable-512-recorte.png', m);
  });
  escrever('favicon-16-x16.png', pngDePixels(fav, 16));
  escrever('favicon-32-x8.png', vezes(pngDePixels(fav, 2), 8));
}

if (require.main === module) {
  const argv = process.argv.slice(2);
  require('../ajuda').conferirOpcoes(argv, { valores: ['--ampliar'], booleanas: ['--conferir'] });
  const { saidas, info, fav } = gerar();
  if (argv.includes('--conferir')) {
    const errados = saidas.filter((s) => !fs.existsSync(s.caminho) || !fs.readFileSync(s.caminho).equals(s.dados));
    errados.forEach((s) => console.error('✘ não bate com o gerador:', path.relative(RAIZ, s.caminho)));
    if (errados.length) { console.error('  rode: node jogo/ferramentas/pwa/gerar-icones.js'); process.exit(1); }
    console.log('✔ ícones do app e favicon batem com o gerador (' + saidas.length + ' arquivos)');
  } else {
    saidas.forEach((s) => { fs.mkdirSync(path.dirname(s.caminho), { recursive: true }); fs.writeFileSync(s.caminho, s.dados); });
    info.forEach((i) => console.log(`${i.arq}: ${i.L}×${i.L}, ${i.escala} px por pixel, desenho ${i.largura} px (${Math.round(100 * i.largura / i.L)} % da largura), canto mais longe a ${i.raio.toFixed(1)} px do centro`));
    console.log('favicon.svg: 16×16 (a cabeça), no index.html pelo gerar-index.js');
  }
  const i = argv.indexOf('--ampliar');
  if (i >= 0) { ampliar(path.resolve(argv[i + 1]), info, fav); console.log('ampliados em', path.resolve(argv[i + 1])); }
}

module.exports = { gerar, FAVICON };
