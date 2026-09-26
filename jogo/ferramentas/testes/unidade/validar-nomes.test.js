// Testes de unidade do validador de nomes repetidos (jogo/ferramentas/validar/validar-nomes.js), com elenco sintético.
// Rodar (da raiz): node --test jogo/ferramentas/testes/unidade/validar-nomes.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { conferirNomes, personagensDosPredios } = require('../../validar/validar-nomes');

test('nomes: mesmo nome (sem título) em personagens diferentes do mesmo prédio é erro', () => {
  const r = conferirNomes([
    { nome: 'Doutora Lia', quem: 'npc-lia', predio: 'observatorio' },
    { nome: 'Jardineira Lia', quem: 'npc-lia-2', predio: 'observatorio' },
  ]);
  assert.strictEqual(r.erros.length, 1, JSON.stringify(r));
  assert.match(r.erros[0], /observatorio: Doutora Lia e Jardineira Lia/);
});

test('nomes: em prédios diferentes é aviso; o mesmo personagem em dois prédios é legítimo', () => {
  const r = conferirNomes([
    { nome: 'Seu Ponteiro', quem: 'npc-ponteiro', predio: 'torre' },
    { nome: 'Dona Ponteiro', quem: 'npc-outra', predio: 'escola' },
    { nome: 'Bibi', quem: 'npc-bibi', predio: 'torre' },
    { nome: 'Bibi', quem: 'npc-bibi', predio: 'escola' },
  ]);
  assert.deepStrictEqual(r.erros, []);
  assert.strictEqual(r.avisos.length, 1, JSON.stringify(r));
  assert.match(r.avisos[0], /"ponteiro" em prédios diferentes/);
});

test('nomes: o jogo de hoje não tem nome repetido no mesmo prédio', () => {
  const lista = personagensDosPredios();
  assert.ok(lista.length > 10);
  assert.deepStrictEqual(conferirNomes(lista).erros, []);
});
