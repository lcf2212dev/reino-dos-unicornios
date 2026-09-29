// Testes de unidade: o validador de pixel art na moldura (ferramentas/validar/validar-pixel.js; docs/contratos/ui.md §10).
// Rodar (em jogo/): node --test ferramentas/testes/unidade/validar-pixel.test.js
const { test } = require('node:test');
const assert = require('assert');
const { checarCss, checarJs, degradeDuro, sombraBorrada } = require('../../validar/validar-pixel');

const errosCss = (css) => { const e = []; checarCss('x.css', css, e); return e; };
const errosJs = (js) => { const e = []; checarJs('x.js', js, e); return e; };

test('pixel: cantos só com as medidas do contrato', () => {
  assert.deepStrictEqual(errosCss('.a { border-radius: var(--canto); } .b { border-radius: 0; } .c { border-radius: var(--redondo) !important; }'), []);
  assert.strictEqual(errosCss('.a { border-radius: 14px; }').length, 1);
  assert.strictEqual(errosCss('.a { border-radius: 50%; } .b { border-top-left-radius: 999px; }').length, 2);
  assert.deepStrictEqual(errosCss('/* border-radius: 12px */ .a { color: red; }'), [], 'comentário não conta');
});

test('pixel: degradê só em faixas com paradas duras', () => {
  assert.ok(degradeDuro('180deg, #a 0 40%, #b 40% 100%'));
  assert.ok(degradeDuro('135deg, #fff 0 4px, var(--x) 4px 8px'));
  assert.ok(degradeDuro('#a 0 50%, #a 50% 100%'));
  assert.ok(!degradeDuro('180deg, #fff6d4 0%, var(--ouro-claro) 48%, #ffd56a 100%'));
  assert.ok(!degradeDuro('90deg, var(--rosa), var(--lavanda)'));
  assert.ok(!degradeDuro('circle at 12% 18%, #fff 0 1.5px, transparent 2px'));
  assert.strictEqual(errosCss('.a { background: linear-gradient(90deg, red, blue); }').length, 1);
  assert.strictEqual(errosCss('.a { background: radial-gradient(circle, #fff 0 45%, #eee 45%); }').length, 1, 'radial é círculo liso');
});

test('pixel: sombra sem desfoque, sem blur, rotação só de 90 em 90', () => {
  assert.ok(!sombraBorrada('0 5px 0 var(--borda)'));
  assert.ok(!sombraBorrada('0 5px 0 #000, 0 -3px 0 rgba(0, 0, 0, 0.2)'));
  assert.ok(sombraBorrada('0 0 6px 2px rgba(255, 255, 255, 0.9)'));
  assert.strictEqual(errosCss('.a { filter: drop-shadow(0 0 14px gold); }').length, 1);
  assert.deepStrictEqual(errosCss('.a { filter: drop-shadow(0 5px 0 rgba(0,0,0,.3)); }'), []);
  assert.strictEqual(errosCss('.a { backdrop-filter: blur(4px); }').length, 1);
  assert.strictEqual(errosCss('@keyframes b { 25% { transform: rotate(-9deg); } }').length, 1);
  assert.deepStrictEqual(errosCss('.a { transform: rotate(90deg); } .b { transform: rotate(0); }'), []);
});

test('pixel: canvas sem degradê, desfoque, arco nem elipse (com exceção marcada)', () => {
  assert.strictEqual(errosJs('ctx.createRadialGradient(0, 0, 0, 1, 1, 1);').length, 1);
  assert.strictEqual(errosJs('ctx.shadowBlur = 6;').length, 1);
  assert.deepStrictEqual(errosJs('ctx.shadowBlur = 0;'), []);
  assert.strictEqual(errosJs('ctx.arc(1, 1, 3, 0, 7);\nctx.ellipse(1, 1, 2, 2, 0, 0, 7);').length, 2);
  assert.deepStrictEqual(errosJs('ctx.arc(1, 1, 3, 0, 7); // pixel-ok: canvas pequeno na grade'), []);
  assert.deepStrictEqual(errosJs('// ctx.arc( só no comentário'), []);
});

test('pixel: scale só inteiro e conic-gradient só nas exceções (D10-11)', () => {
  assert.strictEqual(errosCss('@keyframes a { 50% { transform: scale(1.04) } }').length, 1);
  assert.strictEqual(errosCss('@keyframes a { 50% { transform: scale(2) } }').length, 0);
  assert.ok(errosCss('.x { background: conic-gradient(red, blue) }').length >= 1);
});
