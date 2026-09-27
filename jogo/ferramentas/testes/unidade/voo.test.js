// Voo de foguete (atividades/voo.js): a física pura. Duração fixa, estrela soma, asteroide só conta batida,
// sorteio com semente dá sempre o mesmo voo. Rodar (em jogo/): node --test ferramentas/testes/unidade/voo.test.js
const { test } = require('node:test');
const assert = require('assert');
const Jogo = require('../../jogo-no-node');

function carregar() {
  const ctx = Jogo.contexto({ console: { warn() {}, log() {}, error: console.error }, setTimeout, clearTimeout, Math, Date });
  return Jogo.carregar(ctx, Jogo.scripts()).Reino;
}
const R = carregar();
const V = R.Voo;
function semente(n) { return function () { n = (n * 1103515245 + 12345) % 2147483648; return n / 2147483648; }; }
// voa até o fim com dt fixo; `guiar(s)` devolve a entrada de cada passo
function voar(op, guiar, dt) {
  const s = V.novoEstado(op);
  let ms = 0;
  while (s.fase !== 'fim' && ms < 200000) { V.passo(s, dt || 16, guiar ? guiar(s) : {}); ms += dt || 16; }
  return { s, ms };
}

test('dura o mesmo tempo aconteça o que acontecer', () => {
  const a = voar({ segundos: 30, rng: semente(1) }, () => ({ dir: 0 }));
  const b = voar({ segundos: 30, rng: semente(2) }, (s) => ({ alvoX: s.objs.length ? s.objs[0].x : null }));
  const total = V.CONTAGEM_MS + 30000 + V.CHEGADA_MS;
  assert.ok(Math.abs(a.ms - total) <= 16 && Math.abs(b.ms - total) <= 16, a.ms + ' ' + b.ms);
});

test('dt limitado a 50 ms (aba parada não pula o voo)', () => {
  const s = V.novoEstado({ segundos: 30, rng: semente(3) });
  V.passo(s, 60000, {});
  assert.strictEqual(s.fase, 'contagem');
  assert.strictEqual(s.t, 50);
});

test('contagem 3, 2, 1 e a barra de distância enchendo', () => {
  const s = V.novoEstado({ segundos: 10, rng: semente(4) });
  assert.strictEqual(V.contagem(s), 3);
  for (let i = 0; i < 25; i++) V.passo(s, 50, {});
  assert.strictEqual(V.contagem(s), 2);
  while (s.fase === 'contagem') V.passo(s, 50, {});
  assert.strictEqual(V.distancia(s), 0);
  for (let i = 0; i < 100; i++) V.passo(s, 50, {});
  assert.ok(Math.abs(V.distancia(s) - 0.5) < 0.01);
});

test('estrela soma, asteroide só conta batida (não tira estrela nem para o voo)', () => {
  const s = V.novoEstado({ segundos: 30, rng: () => 0.99 });
  while (s.fase === 'contagem') V.passo(s, 50, {});
  s.objs = [{ tipo: 'estrela', x: s.x, y: V.FOGUETE_Y }];
  V.passo(s, 16, {});
  assert.strictEqual(s.estrelas, 1);
  s.objs = [{ tipo: 'asteroide', x: s.x, y: V.FOGUETE_Y }];
  const ev = V.passo(s, 16, {});
  assert.deepStrictEqual([s.estrelas, s.batidas, s.fase], [1, 1, 'voo']);
  assert.ok(ev.some((e) => e.tipo === 'batida') && s.tremer > 0);
  assert.ok(!V.bateu(s, { x: s.x + 30, y: V.FOGUETE_Y }), 'longe não bate');
});

test('mesma semente, mesmo voo; objetos param antes da chegada', () => {
  const guia = (s) => ({ alvoX: (s.total / 40) % V.L });
  const a = voar({ segundos: 30, rng: semente(7) }, guia).s, b = voar({ segundos: 30, rng: semente(7) }, guia).s;
  assert.deepStrictEqual([a.estrelas, a.batidas], [b.estrelas, b.batidas]);
  assert.ok(a.estrelas + a.batidas > 0);
  assert.strictEqual(a.objs.length, 0);
});

test('o foguete anda para os lados e fica na tela', () => {
  const s = V.novoEstado({ segundos: 30, rng: semente(8) });
  while (s.fase === 'contagem') V.passo(s, 50, {});
  for (let i = 0; i < 100; i++) V.passo(s, 50, { dir: -1 });
  assert.strictEqual(s.x, 8);
  for (let i = 0; i < 100; i++) V.passo(s, 50, { alvoX: 60 });
  assert.strictEqual(s.x, 60);
});

test('falas: contagem e chegada no planeta', () => {
  const t = V.falas().map((f) => f.texto);
  assert.ok(t.includes('Três, dois, um... já!'));
  assert.strictEqual(V.falaChegada({ nome: 'Lua' }), 'Chegamos na Lua!');
  assert.strictEqual(V.falaChegada({ nome: 'Marte', artigo: 'em' }), 'Chegamos em Marte!');
});
