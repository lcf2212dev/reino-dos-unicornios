// Testes de unidade: P.mesclar com um lado incompleto ou estragado (campo ausente, null, número, texto, lista).
// Bug (docs/pendencias.md): P.mesclar lançava TypeError quando um lado era um save sem `salas` ou sem `unis`
// (e sem `treinos`, `pago`, `loja`), e um campo que não é objeto no lado mais recente engolia o do outro lado.
// Regra: campo ausente ou estragado conta como vazio, e nada do lado bom se perde; saves válidos, como antes
// (conferido fora daqui contra a função antiga, com pares aleatórios).
// Saves 100% sintéticos, num vm (ajudantes/jogo-save.js); nada toca no save real.
const { test } = require('node:test');
const assert = require('assert');
const { montar, saveAtual, saveHoje, copia } = require('./ajudantes/jogo-save');

const CAMPOS = ['salas', 'treinos', 'provas', 'unis', 'loja', 'pago', 'estrelas', 'usando', 'aparencia', 'ajustes',
  'montaria', 'cuidados', 'despensa', 'escolhasEm', 'pagoEm'];
const ESTRAGADOS = [['ausente', undefined], ['null', null], ['número', 7], ['texto', 'abc'], ['lista', ['x']]];
const MAPAS = ['salas', 'treinos', 'provas', 'unis', 'loja', 'pago'];

// o lado bom: save de hoje com um pouco de tudo (carimbos inclusive), mais uma sala, um prêmio e um unicórnio só dele
function bom() {
  const s = saveHoje();
  s.salas.m1 = { vezes: 2, melhor: 5, feita: 1750300000000 };
  s.provas = { 'historia-3bim': { tentativas: 2, notas: [7, 9], melhor: 9, premio: 'raro', premioEm: 1750400000000 } };
  s.unis['m-sol'] = { em: 1750300000000, xp: 12, chocado: true };
  s.loja.coroa = true;
  s.escolhasEm = { montaria: 1750500000000 };
  s.pagoEm = { historia: 1750500000000 };
  return s;
}

test('um lado sem o campo, ou com ele estragado, não lança erro e não apaga nada do outro lado', () => {
  const j = montar();
  CAMPOS.forEach((campo) => ESTRAGADOS.forEach(([nome, valor]) => [true, false].forEach((estragadoRecente) => {
    const b = bom(), ruim = saveAtual();
    if (valor === undefined) delete ruim[campo]; else ruim[campo] = copia(valor);
    // o lado estragado é o mais recente (a mescla parte dele) ou o mais antigo
    ruim.atualizado = estragadoRecente ? 1760000000000 : 1740000000000;
    const caso = campo + ' ' + nome + (estragadoRecente ? ' (lado mais recente)' : ' (lado mais antigo)');
    [[b, ruim], [ruim, b]].forEach(([x, y]) => {
      let r;
      assert.doesNotThrow(() => { r = j.P.mesclar(copia(x), copia(y)); }, caso);
      MAPAS.forEach((m) => {
        assert.ok(r[m] && typeof r[m] === 'object' && !Array.isArray(r[m]), caso + ': ' + m + ' é objeto');
        Object.keys(b[m]).forEach((k) => assert.ok(Object.prototype.hasOwnProperty.call(r[m], k), caso + ': ' + m + '.' + k + ' continua'));
      });
      assert.strictEqual(r.unis['m-sol'].xp, 12, caso);
      assert.strictEqual(r.salas.m1.melhor, 5, caso);
      assert.strictEqual(r.provas['historia-3bim'].premio, 'raro', caso);
      assert.strictEqual(r.pago.historia, 4, caso);
      assert.strictEqual(r.loja.coroa, true, caso);
      assert.ok(r.estrelas.ganhas >= 37, caso + ': estrelas');
      assert.strictEqual(r.despensa.maca.compradas, 3, caso);
      // escolhas do lado bom: no campo estragado, valem as do lado bom
      if (campo === 'usando') assert.deepStrictEqual(copia(r.usando), b.usando, caso);
      if (campo === 'aparencia') assert.deepStrictEqual(copia(r.aparencia), b.aparencia, caso);
      if (campo === 'montaria') assert.strictEqual(r.montaria, 'inicial', caso);
      if (campo === 'ajustes') assert.strictEqual(r.ajustes.surpresaEm, b.ajustes.surpresaEm, caso);
    });
  })));
});

test('lado sem salas nem unis (o par das referências de dados do e2e): vale o outro lado inteiro', () => {
  const j = montar();
  const b = bom(), ruim = { v: 1, geracao: 1, ciclo: 1, atualizado: 1760000000000 };
  [[b, ruim], [ruim, b]].forEach(([x, y]) => {
    const r = j.P.mesclar(copia(x), copia(y));
    MAPAS.forEach((m) => assert.deepStrictEqual(copia(r[m]), b[m], m));
    assert.deepStrictEqual(copia(r.estrelas), b.estrelas);
  });
});

test('ciclo diferente com o ciclo mais novo sem salas/treinos/pago: conta como vazio, sem erro', () => {
  const j = montar();
  [1740000000000, 1760000000000].forEach((quando) => [true, false].forEach((primeiro) => {
    const velho = bom(), novo = saveAtual();
    novo.ciclo = 2; novo.atualizado = quando;
    delete novo.salas; novo.treinos = null; novo.pago = 'x';
    const [x, y] = primeiro ? [velho, novo] : [novo, velho];
    const r = j.P.mesclar(copia(x), copia(y));
    assert.strictEqual(r.ciclo, 2);
    // o ciclo novo zera salas, treinos e pagamentos (regra de sempre); provas e unicórnios ficam
    ['salas', 'treinos', 'pago'].forEach((m) => assert.deepStrictEqual(copia(r[m]), {}, m));
    assert.strictEqual(r.unis['m-sol'].xp, 12);
  }));
});
