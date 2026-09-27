// Escola: o mural dos prêmios (escola/objetos.js, 'escola-mural') tem de caber todas as provas dentro do quadro
// de cortiça. Com 5 provas (hoje), a grade de 2 colunas × 3 linhas (54 px) não cabe na cortiça (35 px):
// a 1ª linha sobe por cima da faixa dourada e a 3ª fica pendurada embaixo do quadro, sobre o chão.
const test = require('node:test');
const assert = require('node:assert');
const { montar, ctxAnotador } = require('./ajudantes/predios');

test('mural da Escola: toda casinha de prêmio fica dentro da cortiça', () => {
  const { R } = montar();
  assert.ok(R.provas.length >= 5, 'o jogo de hoje tem 5 provas');
  const lib = R.Interiores.OBJETOS['escola-mural'];
  const o = R.Interiores.def('escola').objetos.find((x) => x.tipo === 'escola-mural');
  const P = { regProva: () => ({ tentativas: 0, notas: [] }) };
  const ctx = ctxAnotador();
  const px = o.x * 16, py = o.y * 16;
  lib.desenhar(ctx, px, py, o, P);
  const cortica = ctx.rets.find((r) => r.cor === '#e3b981');
  const casas = ctx.rets.filter((r) => r.w === 16 && r.h === 16);
  assert.strictEqual(casas.length, R.provas.length * 3, 'uma casinha por prêmio');
  const fora = casas.filter((r) => r.y < cortica.y || r.y + r.h > cortica.y + cortica.h || r.x < cortica.x || r.x + r.w > cortica.x + cortica.w);
  assert.deepStrictEqual(fora.map((r) => [r.x - px, r.y - py]), [],
    `casinhas fora da cortiça (x ${cortica.x - px}..${cortica.x - px + cortica.w}, y ${cortica.y - py}..${cortica.y - py + cortica.h}, px relativos)`);
  // e nada acima do topo declarado (o móvel alto vira sprite de altura topo + h: acima disso é cortado)
  const acima = casas.filter((r) => r.y - 1 < py - lib.topo);
  assert.deepStrictEqual(acima.map((r) => r.y - py), [], 'casinhas acima do topo (cortadas no sprite)');
  // e o quadro todo (faixa dourada inclusive) fica 2 px abaixo do alto do cômodo (a borda roxa da parede)
  const comodo = R.Interiores.def('escola').comodos.find((c) => o.x >= c.rect.x && o.x < c.rect.x + c.rect.w && o.y >= c.rect.y && o.y < c.rect.y + c.rect.h);
  const alto = Math.min(...ctx.rets.map((r) => r.y));
  assert.ok(alto >= comodo.rect.y * 16 + 2, `o mural sobe ${comodo.rect.y * 16 + 2 - alto} px por cima da borda do alto da parede`);
  assert.ok(py - lib.topo >= comodo.rect.y * 16 + 2, 'o topo declarado passa da borda do alto da parede');
});
