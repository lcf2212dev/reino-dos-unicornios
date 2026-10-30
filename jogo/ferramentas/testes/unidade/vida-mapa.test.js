// Testes de unidade: a vida no mapa (js/sistemas/vida-mapa.js). Sem Animações a camada fica inativa; com elas,
// desenha borboletas, libélulas, folhas e passarinhos sem lançar, sempre igual para o mesmo t e sem canvas por quadro.
// Rodar (em jogo/): node --test ferramentas/testes/unidade/vida-mapa.test.js   (tudo: npm test, na raiz)
const { test } = require('node:test');
const assert = require('assert');
const Jogo = require('../../jogo-no-node');

function montar(animacoes, tipoCena) {
  const ctx = Jogo.contexto({ console, Math, Date });
  Jogo.carregar(ctx, Jogo.scripts({ nomes: ['nucleo/config', 'nucleo/registros', 'nucleo/modulos', 'nucleo/util', 'arte/desenho'] }));
  const R = ctx.Reino;
  let canvases = 0;
  ctx.PA = { novoCanvas: (w, h) => { canvases++; return { width: w, height: h, getContext: () => ({ fillRect() {} }) }; } };
  R.Progresso = { estado: () => ({ ajustes: { animacoes } }) };
  R.Cena = { atual: () => ({ tipo: tipoCena }) };
  // mapa de mentira 20×12: flores, árvores com chão embaixo, um canteiro e o lago
  const W = 20, H = 12, grade = (v) => Array.from({ length: H }, () => Array(W).fill(v));
  const I = { tipo: grade('g'), decor: grade(null), solido: grade(false), objetos: [{ tipo: 'canteiro', x: 4, y: 4, w: 3, h: 3 }] };
  for (let x = 1; x < 19; x++) { I.decor[1][x] = 'arvore'; I.solido[1][x] = true; }
  I.decor[6][10] = 'flor'; I.tipo[8][3] = 'f';
  ctx.Mapa = { T: 16, W, H, _interno: I, CIDADE: { lago: { cx: 12, cy: 9, rx: 3, ry: 1.5 } } };
  Jogo.carregar(ctx, Jogo.scripts({ nomes: ['sistemas/vida-mapa'] }));
  const sprites = [], rets = [];
  const pintor = { escala: 2, cam: { x: 0, y: 0 }, ctx: { canvas: { width: 640, height: 384 } },
    sprite: (img, x, y) => sprites.push([img, x, y]), ret: (...a) => rets.push(a) };
  return { R, ctx, pintor, sprites, rets, canvases: () => canvases, camada: R.modulo('vida-mapa').camada };
}

test('sem Animações (ou fora do mapa) a camada fica inativa', () => {
  assert.strictEqual(montar(false, 'mapa').camada.ativo(), false);
  assert.strictEqual(montar(true, 'interior').camada.ativo(), false);
  const m = montar(true, 'mapa');
  m.R.util.reduzMovimentoSistema = true;
  assert.strictEqual(m.camada.ativo(), false);
  // e com animar = falso (modo determinístico do e2e) não desenha nada
  assert.strictEqual(m.camada.itensDesenho(m.pintor, 1000, false).length, 0);
  m.camada.sobre(null, m.pintor, 1000, false);
  assert.strictEqual(m.rets.length, 0);
});

test('com Animações: desenha sem lançar, posição inteira, igual para o mesmo t e sem canvas por quadro', () => {
  const m = montar(true, 'mapa');
  assert.strictEqual(m.camada.ativo(), true);
  let total = 0;
  for (let t = 0; t < 30000; t += 250) {
    const itens = m.camada.itensDesenho(m.pintor, t, true);
    total += itens.length;
    itens.forEach((it) => { assert.ok(Number.isFinite(it.y)); it.desenhar(); });
    m.camada.sobre(null, m.pintor, t, true);
  }
  assert.ok(total > 0, 'algum bichinho apareceu');
  assert.ok(m.rets.length > 0, 'algum passarinho passou (com a sombrinha)');
  m.sprites.forEach(([img, x, y]) => { assert.ok(img); assert.strictEqual(x, Math.round(x)); assert.strictEqual(y, Math.round(y)); });
  // sprites feitos uma vez: depois do primeiro giro, mais quadros não criam canvas nem itens novos
  const antes = m.canvases(), a = m.camada.itensDesenho(m.pintor, 4321, true).map((it) => [it.x, it.yy]);
  for (let t = 30000; t < 60000; t += 250) { m.camada.itensDesenho(m.pintor, t, true); m.camada.sobre(null, m.pintor, t, true); }
  assert.strictEqual(m.canvases(), antes);
  assert.ok(antes <= 20);
  assert.deepStrictEqual(m.camada.itensDesenho(m.pintor, 4321, true).map((it) => [it.x, it.yy]), a);
});
