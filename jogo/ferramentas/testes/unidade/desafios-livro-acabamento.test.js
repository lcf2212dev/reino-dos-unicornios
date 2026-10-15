// Testes de unidade: acabamento dos tipos do livro do 4º bimestre (js/atividades/desafios/marcar.js): o rótulo do item
// no começo da linha ("a) ", "1. ", "2) ") é só texto (não é tocável nem conta como token, a marca nele não é erro);
// no meio da linha, ou colado à palavra, continua token.
// Rodar (em jogo/): node --test ferramentas/testes/unidade/desafios-livro-acabamento.test.js   (tudo: npm test, na raiz)
const { test } = require('node:test');
const assert = require('assert');
const Jogo = require('./ajudantes/terceiro-bimestre');

function carregar() {
  const ctx = Jogo.contexto({ console, Math, Date, JSON });
  Jogo.carregar(ctx, Jogo.scripts({ nomes: ['nucleo/config', 'nucleo/registros', 'nucleo/util', 'nucleo/eventos'], grupos: ['atividades'] }));
  return ctx.Reino;
}
const R = carregar();
const D = R.Desafios;
const _d = R._desafios;

test('marcar: rótulo do item no começo da linha é só texto; os índices dos tokens começam depois dele', () => {
  const a = _d.analisarMarcar('a) Adotei um {filhote}.\nb) O {gato} miou!\n1. Fim\n2) Sim\nA) Oi');
  assert.deepStrictEqual(JSON.parse(JSON.stringify(a.rotulos)), { 0: 'a)', 1: 'b)', 2: '1.', 3: '2)', 4: 'A)' });
  assert.deepStrictEqual(Array.from(a.tokens).map((t) => t.t), ['Adotei', 'um', 'filhote', '.', 'O', 'gato', 'miou', '!', 'Fim', 'Sim', 'Oi']);
  assert.deepStrictEqual(Array.from(a.alvos).map((x) => Array.from(x.idx)), [[2], [5]]);
  assert.deepStrictEqual(Array.from(a.erros), []);
  // marcar o "filhote" e o "gato" é tudo; não existe token do rótulo para tocar
  const d = { id: 'm', tipo: 'marcar', pergunta: 'Circule.', texto: 'a) Adotei um {filhote}.\nb) O {gato} miou!' };
  assert.strictEqual(D.pontuar(d, { 2: 0, 5: 0 }), 1);
  assert.strictEqual(D.respostaCertaTexto(d), 'filhote, gato');
});

test('marcar: "a)" fora do começo da linha, sem espaço depois ou dentro de um alvo continua token', () => {
  const tokens = (t) => Array.from(_d.analisarMarcar(t).tokens).map((x) => x.t);
  assert.deepStrictEqual(tokens('Veja a) e b)'), ['Veja', 'a', ')', 'e', 'b', ')']);
  assert.deepStrictEqual(tokens('a)b'), ['a', ')', 'b']);
  assert.deepStrictEqual(tokens('{a) Oi}'), ['a', ')', 'Oi']);
  assert.deepStrictEqual(tokens('E. T. voltou'), ['E', '.', 'T', '.', 'voltou']);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(_d.analisarMarcar('Oi\n  c) tchau').rotulos)), { 1: 'c)' });
});
