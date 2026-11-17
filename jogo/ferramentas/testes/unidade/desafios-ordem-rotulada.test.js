// Opções com rótulo em sequência ("A:", "b)", "Foto 1:", "Grupo 2:", "3)") ficam na ordem do conteúdo, sem sorteio
// (desafios/escolha.js, _d.ordemRotulada; também no `varias`); sem rótulo, o sorteio é o de antes (pela mesma chave).
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/desafios-ordem-rotulada.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const Jogo = require('../../jogo-no-node');

const ctx = Jogo.contexto({ console });
Jogo.carregar(ctx, Jogo.scripts({ node: true }));
const R = ctx.Reino, _d = R._desafios;
const achar = (id) => { for (const m of R.materias) for (const s of m.salas || []) for (const d of s.desafios || []) if (d.id === id) return d; return null; };

test('rotuladas ficam na ordem do conteúdo; as outras continuam sorteadas', () => {
  // um caso de cada rótulo do bimestre
  for (const id of ['hi10a2-02', 'hi11t1-02', 'hi12t1-04', 'ma10t2-01', 'en11p3-02']) {
    const d = achar(id);
    assert.ok(d, id + ' sumiu do conteúdo');
    assert.deepStrictEqual(Array.from(_d.ordemRotulada(d) || []), Array.from(d.opcoes, (_, i) => i), id + ': fora da ordem do conteúdo');
  }
  // fora de sequência, rótulo só em algumas ou sem rótulo: null (o sorteio pela chave, como antes)
  const casos = [
    [{ t: 'B: dois' }, { t: 'A: um' }],
    [{ t: 'Foto 1: rio' }, { t: 'a ponte' }],
    [{ t: 'Sim.' }, { t: 'Não.' }],
    [{ t: 'Ambientalista' }, { t: 'Bombeiro' }, { t: 'Cozinheiro' }],
    [{ t: 'A' }, { t: 'B' }],
  ];
  for (const opcoes of casos) assert.strictEqual(_d.ordemRotulada({ opcoes }), null, JSON.stringify(opcoes));
  // no conteúdo do bimestre, só as 8 rotuladas mudam
  const rotuladas = [];
  for (const m of R.materias) for (const s of m.salas || []) for (const d of s.desafios || []) {
    if ((d.tipo === 'escolha' || d.tipo === 'varias') && _d.ordemRotulada(d)) rotuladas.push(d.id);
  }
  assert.deepStrictEqual(rotuladas.sort(), ['en11p3-02', 'hi10a2-02', 'hi11t1-02', 'hi11t1-03', 'hi11t1-04', 'hi12t1-04', 'hi12t1-05', 'ma10t2-01']);
});
