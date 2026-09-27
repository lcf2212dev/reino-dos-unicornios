// Reino.registrarLugar (nucleo/registros.js) e ferramentas/validar/lugares-do-mapa.js: um prédio de mentira
// registrado no vm aparece nos lugares do validador; sem caminho é recusado e acusado; por cima de outro também.
// Rodar (em jogo/): node --test ferramentas/testes/unidade/lugares.test.js   (tudo: npm test, na raiz)
const { test } = require('node:test');
const assert = require('assert');
const Jogo = require('../../jogo-no-node');
const Lugares = require('../../validar/lugares-do-mapa');

function reino() {
  const ctx = Jogo.contexto({ console: { warn() {}, log() {} } });
  return Jogo.carregar(ctx, Jogo.scripts({ nomes: ['nucleo/config', 'nucleo/registros'], grupos: ['materias'] }));
}
const CLAREIRA = { id: 'ninho', nome: 'Ninho de Mentira', sprite: 'torre', rect: { x: 22, y: 15, w: 5, h: 5 } };

test('o jogo de hoje não tem erro nos lugares do mapa', () => {
  assert.deepStrictEqual(Lugares.checar(reino()), []);
});

test('lugar registrado com caminho aparece no validador', () => {
  const ctx = reino();
  // o primeiro rect livre de 5×4 que o --livres sugere, com o caminho dele
  const [livre] = Lugares.livres(ctx, 5, 4);
  const def = Object.assign({}, CLAREIRA, livre);
  assert.strictEqual(ctx.Reino.registrarLugar(def), true);
  assert.ok(Lugares.ids(ctx).includes('ninho'));
  assert.deepStrictEqual(Lugares.checar(ctx), []);
});

test('lugar sem caminho é recusado e acusado', () => {
  const ctx = reino();
  assert.strictEqual(ctx.Reino.registrarLugar(Object.assign({}, CLAREIRA, { rect: { x: 12, y: 22, w: 4, h: 3 } })), false);
  assert.ok(!Lugares.ids(ctx).includes('ninho'));
  assert.ok(Lugares.checar(ctx).some((e) => /ninho.*recusou/.test(e)));
});

test('rect por cima de outro lugar, fora do mapa e id repetido são acusados', () => {
  const ctx = reino();
  ctx.Reino.registrarLugar({ id: 'petshop', nome: 'x', sprite: 'x', rect: { x: 53, y: 40, w: 5, h: 5 }, caminho: [[1, 1]] });
  ctx.Reino.registrarLugar({ id: 'encosto', nome: 'x', sprite: 'x', rect: { x: 3, y: 35, w: 2, h: 2 }, caminho: [[1, 1]] });
  const e = Lugares.checar(ctx).join('\n');
  assert.match(e, /petshop: id repetido/);
  assert.match(e, /petshop: rect fora do mapa/);
  assert.match(e, /encosto: rect por cima de petshop/);
});

test('--livres: a lista não é vazia e cada rect, com o caminho sugerido, passa no validador', () => {
  [[5, 4], [4, 3]].forEach(([w, h]) => {
    const lista = Lugares.livres(reino(), w, h);
    assert.ok(lista.length > 0, `${w}×${h}`);
    lista.forEach((l) => {
      const ctx = reino();
      assert.strictEqual(ctx.Reino.registrarLugar(Object.assign({}, CLAREIRA, l)), true);
      assert.deepStrictEqual(Lugares.checar(ctx), [], JSON.stringify(l));
    });
  });
});

test('rect em cima da rua ou do lago, e caminho pela água, são acusados', () => {
  const ctx = reino();
  ctx.Reino.registrarLugar({ id: 'narua', nome: 'x', sprite: 'x', rect: { x: 2, y: 10, w: 2, h: 2 }, caminho: [[2, 12]] });
  ctx.Reino.registrarLugar({ id: 'nolago', nome: 'x', sprite: 'x', rect: { x: 24, y: 35, w: 4, h: 3 }, caminho: [[26, 38]] });
  ctx.Reino.registrarLugar({ id: 'nado', nome: 'x', sprite: 'x', rect: { x: 1, y: 26, w: 1, h: 1 }, caminho: [[27, 36]] });
  const e = Lugares.checar(ctx).join('\n');
  assert.match(e, /narua: rect por cima de rua em 3,11/);
  assert.match(e, /nolago: rect por cima de água do lago/);
  assert.match(e, /nado: caminho passa por água do lago em 27,36/);
});
