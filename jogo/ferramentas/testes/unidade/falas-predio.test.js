// Reino.falasDoPredio: falas de um prédio em várias partes. A mesma chave (ou NPC/objeto) em duas partes
// é erro; trocar a ordem de carga das partes do Observatório dá o mesmo conteúdo.
// Uso: node --test jogo/ferramentas/testes/unidade/falas-predio.test.js
const test = require('node:test');
const assert = require('node:assert');
const J = require('../../jogo-no-node');

function soRegistros() {
  const ctx = J.contexto({ console });
  return J.carregar(ctx, J.scripts({ nomes: ['nucleo/registros'] })).Reino;
}

// JSON com as chaves em ordem alfabética e os extras ordenados: compara conteúdo, não a ordem de carga
// (as listas são concatenadas na ordem em que as partes carregam)
function canonico(v, chave) {
  if (Array.isArray(v)) {
    const l = Array.from(v, (x) => canonico(x));
    return chave === 'extras' ? l.sort((x, y) => (JSON.stringify(x) < JSON.stringify(y) ? -1 : 1)) : l;
  }
  if (v && typeof v === 'object') {
    const o = {};
    Object.keys(v).sort().forEach((k) => { o[k] = canonico(v[k], k); });
    return o;
  }
  return v;
}

test('junta npcs, objetos, listas e chaves de partes diferentes', () => {
  const R = soRegistros();
  const base = R.falasDoPredio('zz');
  assert.strictEqual(R.FALAS_INTERIORES.zz, base);
  R.falasDoPredio('zz', { npcs: { a: { oi: ['1'] } }, extras: [{ texto: 'x' }], nomes: { a: 'A' } });
  R.falasDoPredio('zz', { npcs: { b: { oi: ['2'] } }, objetos: { mesa: ['3'] }, extras: [{ texto: 'y' }], outra: {} });
  assert.deepStrictEqual([...Object.keys(base.npcs)], ['a', 'b']);
  assert.deepStrictEqual([...base.extras.map((e) => e.texto)], ['x', 'y']);
  assert.strictEqual(JSON.stringify(base.objetos), JSON.stringify({ mesa: ['3'] }));
  assert.strictEqual(R.falasDoPredio('zz'), base);
});

test('a mesma chave, NPC ou objeto em duas partes é erro', () => {
  const R = soRegistros();
  R.falasDoPredio('zz', { npcs: { a: {} }, objetos: { mesa: [] }, nomes: {} });
  assert.throws(() => R.falasDoPredio('zz', { npcs: { a: {} } }), /npcs\["a"\] veio de duas partes/);
  assert.throws(() => R.falasDoPredio('zz', { objetos: { mesa: [] } }), /objetos\["mesa"\] veio de duas partes/);
  assert.throws(() => R.falasDoPredio('zz', { nomes: {} }), /chave "nomes" de "zz" veio de duas partes/);
});

test('Observatório: partes em qualquer ordem dão o mesmo conteúdo', () => {
  const lista = J.ordemDosPredios(J.scripts());
  const partes = ['interiores/observatorio/falas', 'interiores/observatorio/nasa-falas', 'interiores/observatorio/lab-falas'];
  const pos = partes.map((n) => lista.findIndex((s) => J.nome(s) === n));
  pos.forEach((p, i) => assert.ok(p >= 0, partes[i] + ' no manifesto'));
  const falas = (l) => J.carregar(J.contexto({ console }), l).Reino.FALAS_INTERIORES.observatorio;
  const normal = falas(lista);
  [[2, 1, 0], [1, 0, 2], [2, 0, 1]].forEach((ordem) => {
    const outra = lista.slice();
    pos.forEach((p, i) => { outra[p] = lista[pos[ordem[i]]]; });
    assert.strictEqual(JSON.stringify(canonico(falas(outra))), JSON.stringify(canonico(normal)), 'ordem ' + ordem.join(','));
  });
});
