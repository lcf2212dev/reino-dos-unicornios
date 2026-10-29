// Reino.util.colar (arte.md §17): grupos de até 12 caracteres; à direita a palavra de 1–2 letras, "R$" e número; à
// esquerda o número do fim, o de "Sala N" e o emoji do fim. A voz normaliza \s (o U+00A0 também): a fala não muda.
const { test } = require('node:test');
const assert = require('assert');
const Jogo = require('../../jogo-no-node.js');

const ctx = Jogo.contexto({ console, Math, Date, JSON, setTimeout: () => 0, clearTimeout() {} });
Jogo.carregar(ctx, [{ js: 'js/nucleo/util.js' }]);
const U = ctx.Reino.util;
const ver = (t) => U.colar(t).replace(/ /g, '_');

test('palavra curta, "R$" e número colam na seguinte', () => {
  assert.strictEqual(ver('Inglês • 3º bimestre • 11 questões'), 'Inglês • 3º_bimestre • 11_questões');
  assert.strictEqual(ver('a star'), 'a_star');
  assert.strictEqual(ver('R$ 100,00'), 'R$_100,00');
});

test('número do fim, "Sala N" e emoji do fim colam à esquerda', () => {
  assert.strictEqual(ver('Oi! Eu cuido da Sala 4.'), 'Oi! Eu_cuido da Sala_4.');
  assert.strictEqual(ver('Agora vamos para a Sala 4! 🥁'), 'Agora vamos para a Sala_4!_🥁');
  assert.strictEqual(ver('Você acertou 3 de 10.'), 'Você acertou 3_de_10.');
  assert.strictEqual(ver('Apostila: pp. 20, 21, 28 e 29'), 'Apostila: pp._20, 21,_28 e_29');
  assert.strictEqual(ver('no dia 15/04/1956?'), 'no dia_15/04/1956?');
  assert.strictEqual(ver('Já ganhou R$ 4,00! 💰'), 'Já_ganhou R$_4,00!_💰');
  assert.strictEqual(ver('Que cientista caprichosa! ✨'), 'Que cientista caprichosa!_✨');
});

test('grupo passa de 12 caracteres: não cola (espaço e pontuação contam)', () => {
  assert.strictEqual(ver('Leia em "Impossível".'), 'Leia em "Impossível".');
  assert.strictEqual(ver('por 4 e por 5 e resolver'), 'por 4_e por 5_e resolver');
  assert.strictEqual(ver('a paralelepípedo'), 'a paralelepípedo');
  const t = 'Terminar por último é coisa de campeã! 🏆';
  assert.strictEqual(U.colar(t).replace(/\u00a0/g, ' '), t);
});
