// Testes de unidade: o número da Aura no chip do HUD (Reino.Aura.textoCurto, js/sistemas/aura.js; D13-01).
// Até 8 letras, arredondado para baixo; o painel usa o texto inteiro (Reino.Aura.texto).
// Rodar: node --test jogo/ferramentas/testes/unidade/aura-texto.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const Jogo = require('../../jogo-no-node');

function aura() {
  const ctx = Jogo.contexto({ console, Math, Date });
  Jogo.carregar(ctx, Jogo.ordemDosPredios(Jogo.scripts()));
  return ctx.Reino.Aura;
}

test('textoCurto: até 9.999,9 igual ao texto inteiro', () => {
  const A = aura();
  [0, 5, 98, 12345, 99999].forEach((d) => assert.strictEqual(A.textoCurto(d), A.texto(d)));
  assert.strictEqual(A.textoCurto(12345), '1.234,5');
});

test('textoCurto: mil, mi, bi com uma casa abaixo de 100, sem casa zero, sempre para baixo', () => {
  const A = aura();
  const casos = [
    [100000, '10 mil'], [123456, '12,3 mil'], [129999, '12,9 mil'], [999999, '99,9 mil'],
    [1000000, '100 mil'], [1234567, '123 mil'], [9999999, '999 mil'],
    [10000000, '1 mi'], [12345678, '1,2 mi'], [1234567890, '123 mi'], [12345678901, '1,2 bi'],
  ];
  casos.forEach(([d, esperado]) => assert.strictEqual(A.textoCurto(d), esperado, 'd=' + d));
});

test('textoCurto: nunca passa de 8 letras até 999 tri (a largura fixa do chip no celular)', () => {
  const A = aura();
  for (let d = 1; d < 1e16; d = d * 3 + 7) assert.ok(A.textoCurto(d).length <= 8, d + ' → ' + A.textoCurto(d));
});
