// Gestos de verdade para o cenário (cenario.js / npm run ver): arrastar e segurar pelo navegador, não por el.click().
//   arrastar:x1,y1,x2,y2[,ms][,toque|mouse][,preso]   segurar:<seletor|x,y>,ms
// Padrão: toque se o tamanho tem hasTouch (celular, tablet), senão mouse. O toque vai pelo CDP
// (Input.dispatchTouchEvent), que o Chromium transforma em PointerEvent pointerType 'touch'.
// Com o relógio congelado, anda ~16 ms (um quadro) entre um movimento e outro.
const { TAMANHOS } = require('./navegador');

const QUADRO = 16;

function modoPadrao(c, modo) {
  if (modo && modo !== 'toque' && modo !== 'mouse') throw new Error(`modo "${modo}" não existe (toque ou mouse)`);
  return modo || (TAMANHOS[c.tamanho].hasTouch ? 'toque' : 'mouse');
}

// um "dedo" com down/move/up iguais para toque e mouse
async function dedo(c, modo) {
  if (modo === 'mouse') {
    const m = c.page.mouse;
    return { down: async (x, y) => { await m.move(x, y); await m.down(); }, move: (x, y) => m.move(x, y), up: () => m.up() };
  }
  const cdp = c.__cdp || (c.__cdp = await c.context.newCDPSession(c.page));
  const toque = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts });
  return {
    down: (x, y) => toque('touchStart', [{ x, y, id: 1 }]),
    move: (x, y) => toque('touchMove', [{ x, y, id: 1 }]),
    up: () => toque('touchEnd', []),
  };
}

// anda o tempo em quadros (congelado: relógio do jogo; vivo: espera de verdade)
async function andarTempo(c, ms) {
  for (let t = 0; t < ms; t += QUADRO) await c.avancar(Math.min(QUADRO, ms - t));
}

// arrastar:x1,y1,x2,y2[,ms][,toque|mouse][,preso] (ms padrão 300; preso = não solta no fim)
async function arrastar(c, texto) {
  const p = texto.split(',').map((s) => s.trim());
  const [x1, y1, x2, y2] = p.slice(0, 4).map(Number);
  if ([x1, y1, x2, y2].some(isNaN)) throw new Error(`arrastar:x1,y1,x2,y2[,ms][,toque|mouse] (veio "${texto}")`);
  const ms = p[4] && !isNaN(Number(p[4])) ? Number(p[4]) : 300;
  const extras = p.slice(4).filter((s) => isNaN(Number(s)));
  const ruim = extras.find((s) => !['toque', 'mouse', 'preso'].includes(s));
  if (ruim) throw new Error(`arrastar: "${ruim}" não existe (toque, mouse ou preso)`);
  const d = await dedo(c, modoPadrao(c, extras.find((s) => s !== 'preso')));
  const passos = Math.max(1, Math.round(ms / QUADRO));
  await d.down(x1, y1);
  await c.avancar(QUADRO);
  for (let i = 1; i <= passos; i++) {
    await d.move(x1 + (x2 - x1) * i / passos, y1 + (y2 - y1) * i / passos);
    await c.avancar(QUADRO);
  }
  // 'preso': não solta (a foto sai com o thumbstick na tela)
  if (extras.includes('preso')) return;
  await d.up();
  await c.avancar(200);
}

// segurar:<seletor|x,y>,ms (o seletor vira o centro do getBoundingClientRect)
async function segurar(c, texto) {
  const i = texto.lastIndexOf(',');
  const alvo = texto.slice(0, i).trim(), ms = Number(texto.slice(i + 1));
  if (i < 0 || isNaN(ms)) throw new Error(`segurar:<seletor|x,y>,ms (veio "${texto}")`);
  let x, y;
  const nums = alvo.split(',').map(Number);
  if (nums.length === 2 && !nums.some(isNaN)) [x, y] = nums;
  else {
    const r = await c.page.evaluate((s) => {
      var el = document.querySelector(s);
      if (!el) return null;
      var b = el.getBoundingClientRect();
      return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
    }, alvo);
    if (!r) throw new Error(`nada para segurar: "${alvo}"`);
    ({ x, y } = r);
  }
  const d = await dedo(c, modoPadrao(c));
  await d.down(x, y);
  await andarTempo(c, ms);
  await d.up();
  await c.avancar(200);
}

module.exports = { arrastar, segurar, dedo };
