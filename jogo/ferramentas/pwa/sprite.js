// Desenha, em Node, um sprite do jogo pelo MESMO código do navegador (js/arte/pixelart*.js, pela lista do manifesto)
// num canvas falso de pixels inteiros (só o que a pixel art usa: fillRect, getImageData e drawImage sem escala).
// Uso (módulo): const { unicornio } = require('./sprite');  unicornio('rosa', 3, 0, 'lado') → { w, h, px }
//   px[y][x] = '#rrggbb' ou null (transparente). Usado por gerar-icones.js.
const Jogo = require('../jogo-no-node');

function hex(cor) {
  const h = String(cor).trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(h)) return h;
  if (/^#[0-9a-f]{3}$/.test(h)) return '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
  throw new Error('sprite: cor que o canvas falso não entende: ' + cor);
}

// canvas de w×h pixels; cada pixel é '#rrggbb' ou null
function canvasFalso() {
  const c = { width: 0, height: 0, _px: null };
  const garantir = () => {
    if (!c._px || c._px.length !== c.width * c.height) c._px = new Array(c.width * c.height).fill(null);
    return c._px;
  };
  const ctx = {
    imageSmoothingEnabled: false,
    fillStyle: '#000000',
    fillRect(x, y, w, h) {
      const px = garantir(), cor = hex(ctx.fillStyle);
      for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) {
        if (i >= 0 && j >= 0 && i < c.width && j < c.height) px[j * c.width + i] = cor;
      }
    },
    getImageData(x, y, w, h) {
      const px = garantir(), data = new Uint8ClampedArray(w * h * 4);
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
        const cor = px[(y + j) * c.width + (x + i)];
        if (!cor) continue;
        const n = parseInt(cor.slice(1), 16), k = (j * w + i) * 4;
        data[k] = n >> 16; data[k + 1] = (n >> 8) & 255; data[k + 2] = n & 255; data[k + 3] = 255;
      }
      return { data, width: w, height: h };
    },
    drawImage(src, x, y) {
      if (arguments.length !== 3) throw new Error('sprite: drawImage com escala não é pixel inteiro');
      const px = garantir(), sp = src._px || [];
      for (let j = 0; j < src.height; j++) for (let i = 0; i < src.width; i++) {
        const cor = sp[j * src.width + i], X = x + i, Y = y + j;
        if (cor && X >= 0 && Y >= 0 && X < c.width && Y < c.height) px[Y * c.width + X] = cor;
      }
    },
    translate() { throw new Error('sprite: translate não previsto'); },
    scale() { throw new Error('sprite: scale não previsto'); },
  };
  c.getContext = () => ctx;
  return c;
}

let ctx = null;
function jogo() {
  if (ctx) return ctx;
  ctx = Jogo.contexto({ console, Math, Object, Array, String, Number, Map, Set, JSON });
  ctx.document = { createElement: (t) => { if (t !== 'canvas') throw new Error('sprite: só canvas'); return canvasFalso(); } };
  // a arte do unicórnio e as cores do primeiro unicórnio, pela ordem do manifesto
  const nomes = ['nucleo/config', 'arte/desenho', 'arte/pixelart', 'arte/pixelart-unicornio-moldes', 'arte/pixelart-unicornio-acabamento',
    'arte/pixelart-unicornio', 'personagens/unicornios'];
  const lista = Jogo.manifesto.scripts.filter((s) => nomes.includes(Jogo.nome(s)));
  if (lista.length !== nomes.length) throw new Error('sprite: faltou no manifesto: ' + nomes.filter((n) => !lista.some((s) => Jogo.nome(s) === n)).join(', '));
  ctx.Reino = ctx.Reino || {};
  Jogo.carregar(ctx, lista);
  return ctx;
}

// o primeiro unicórnio (Reino.Unicornios.def('inicial', cor)) em PA.unicornio, já com o contorno do jogo
function unicornio(cor, estagio, quadro, vista) {
  const c = jogo();
  const def = c.Reino.Unicornios.def('inicial', cor);
  const s = c.PA.unicornio(def, estagio, quadro, { vista });
  const px = [];
  for (let y = 0; y < s.h; y++) px.push(s.canvas._px.slice(y * s.w, (y + 1) * s.w));
  return { w: s.w, h: s.h, px, contorno: c.PA._interno.CONTORNO };
}

module.exports = { unicornio, canvasFalso };
