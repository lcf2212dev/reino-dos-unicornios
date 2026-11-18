// Testes de unidade: o número da Aura no chip do HUD (Reino.Aura.partesCurtas / textoCurto, js/sistemas/aura.js;
// D13-01) e por extenso no painel (Reino.Aura.textoNome). Pedido do Leandro (18/11): "só vai até trilhão": os nomes
// vão até o vigintilhão. Arredondado para baixo; no chip, até 999,9 numa linha (5 letras: o que cabe no celular ao
// lado dos botões) e daí o número (até 4 letras) em cima e o nome abreviado (até 7) embaixo.
// Rodar: node --test jogo/ferramentas/testes/unidade/aura-texto.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const Jogo = require('../../jogo-no-node');

function aura() {
  const ctx = Jogo.contexto({ console, Math, Date });
  Jogo.carregar(ctx, Jogo.ordemDosPredios(Jogo.scripts()));
  return ctx.Reino.Aura;
}

test('textoCurto: até 999,9 igual ao texto inteiro (sem nome)', () => {
  const A = aura();
  [0, 5, 98, 9999].forEach((d) => {
    assert.strictEqual(A.textoCurto(d), A.texto(d));
    assert.strictEqual(A.partesCurtas(d), null);
  });
  assert.strictEqual(A.textoCurto(9999), '999,9');
});

test('textoCurto: mil, mi, bi, tri… com uma casa abaixo de 100, sem casa zero, sempre para baixo', () => {
  const A = aura();
  const casos = [
    [10000, '1 mil'], [12345, '1,2 mil'], [100000, '10 mil'], [123456, '12,3 mil'], [129999, '12,9 mil'],
    [999999, '99,9 mil'], [1000000, '100 mil'], [1234567, '123 mil'], [9999999, '999 mil'],
    [10000000, '1 mi'], [12345678, '1,2 mi'], [1234567890, '123 mi'], [12345678901, '1,2 bi'],
    [12345678901234, '1,2 tri'], [1e16, '1 quatri'], [12345678901234567, '1,2 quatri'], [1e19, '1 quinti'],
    [1e22, '1 sexti'], [1.2e25, '1,2 septi'], [1e28, '1 octi'], [1e31, '1 noni'], [1e34, '1 deci'], [1e37, '1 undeci'],
    [1e40, '1 duodeci'], [1e43, '1 tredeci'], [1e46, '1 quatuor'], [5e48, '500 quatuor'], [1e49, '1 quindec'],
    [1e52, '1 sexdeci'], [1e55, '1 septend'], [1e58, '1 octodec'], [1e61, '1 novend'], [1e64, '1 viginti'],
  ];
  casos.forEach(([d, esperado]) => assert.strictEqual(A.textoCurto(d), esperado, 'd=' + d));
});

test('chip: o número com até 4 letras e a abreviação com até 7, de 1 mil até 999 vigintilhões', () => {
  const A = aura();
  for (let d = 1; d < 1e66; d = d * 3 + 7) {
    const p = A.partesCurtas(d);
    if (!p) { assert.ok(A.texto(d).length <= 5, d + ' → ' + A.texto(d)); continue; }
    assert.ok(p.numero.length <= 4 && p.unidade.length <= 7, d + ' → ' + JSON.stringify(p));
    assert.ok(Number(p.numero.replace(',', '.')) >= 1, d + ': nunca "0,…"');
  }
  A.GRANDES.forEach((g) => assert.ok(g[0].length <= 7, g[0]));
});

test('textoNome: por extenso de 1 milhão em diante, singular abaixo de 2; abaixo, o texto inteiro', () => {
  const A = aura();
  const casos = [
    [9999999, '999.999,9'], [10000000, '1 milhão'], [15000000, '1,5 milhão'], [20000000, '2 milhões'],
    [12345678901, '1,2 bilhão'], [123456789012345, '12,3 trilhões'], [1e16, '1 quatrilhão'],
    [45e16, '45 quatrilhões'], [1e19, '1 quintilhão'], [3e22, '3 sextilhões'], [1e25, '1 septilhão'],
    [1e28, '1 octilhão'], [1e31, '1 nonilhão'], [1e34, '1 decilhão'], [1e37, '1 undecilhão'], [1e40, '1 duodecilhão'],
    [1e43, '1 tredecilhão'], [1e46, '1 quatuordecilhão'], [1e49, '1 quindecilhão'], [1e52, '1 sexdecilhão'],
    [1e55, '1 septendecilhão'], [1e58, '1 octodecilhão'], [1e61, '1 novendecilhão'], [2e64, '2 vigintilhões'],
  ];
  casos.forEach(([d, esperado]) => assert.strictEqual(A.textoNome(d), esperado, 'd=' + d));
});
