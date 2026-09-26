// Checagens de voz do elenco (ferramentas/vozes/elenco-vozes.js) com perfis sintéticos.
// Rodar (na raiz): node --test jogo/ferramentas/testes/unidade/elenco-vozes.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { checarElenco, personagensDoJogo } = require('../../vozes/elenco-vozes');

const VOZES = {
  claude: { voz: 'pt-BR-AntonioNeural', velocidade: '-5%', tom: '+0Hz' },
  'npc-a': { voz: 'pt-BR-AntonioNeural', velocidade: '+0%', tom: '+10Hz' },    // perto do Claude
  'npc-b': { voz: 'pt-BR-AntonioNeural', velocidade: '+12%', tom: '+16Hz' },   // longe o bastante
  'npc-c': { voz: 'en-US-AvaMultilingualNeural', velocidade: '+2%', tom: '+6Hz' },
  'npc-d': { voz: 'en-US-AvaMultilingualNeural', velocidade: '+0%', tom: '+0Hz' },
  'npc-e': { voz: 'it-IT-GiuseppeMultilingualNeural', velocidade: '+0%', tom: '+0Hz' },
};
const P = (voz, nome, pacote, falas) => ({ id: voz, voz, nome, pacotes: [pacote], falas: falas || [] });

test('voz base do Claude com tom e velocidade perto: erro; longe: nada', () => {
  const r = checarElenco([P('npc-a', 'Seu Zé', 'interior-x'), P('npc-b', 'Carteiro Chico', 'interior-y')], VOZES);
  assert.strictEqual(r.erros.length, 1);
  assert.match(r.erros[0], /Seu Zé/);
});

test('mesmo prédio, mesma voz base e perto: aviso; em prédios diferentes: nada', () => {
  const junto = checarElenco([P('npc-c', 'Guarda Jana', 'interior-lab'), P('npc-d', 'Guia Tainá', 'interior-lab')], VOZES);
  assert.ok(junto.avisos.some((a) => /soam iguais/.test(a)));
  const longe = checarElenco([P('npc-c', 'Guarda Jana', 'interior-lab'), P('npc-d', 'Guia Tainá', 'interior-museu')], VOZES);
  assert.deepStrictEqual(longe.avisos, []);
});

test('mesmo nome próprio no mesmo prédio: aviso', () => {
  const r = checarElenco([P('npc-c', 'Doutora Lia', 'interior-o'), P('npc-e', 'Jardineira Lia', 'interior-o')], VOZES);
  assert.ok(r.avisos.some((a) => /mesmo nome/.test(a)));
});

test('gênero: voz masculina para quem se apresenta no feminino (e o contrário)', () => {
  const r = checarElenco([
    P('npc-e', 'Detetive Lupa', 'interior-a', ['Oi! Eu sou a Detetive Lupa.']),
    P('npc-c', 'Professor Bento', 'interior-b'),
    P('npc-b', 'Guia Rui', 'interior-c'),                // sem sinal: não decide
  ], VOZES);
  assert.strictEqual(r.avisos.length, 2);
  assert.ok(r.avisos.some((a) => /Lupa.*feminino.*masculina/.test(a)));
  assert.ok(r.avisos.some((a) => /Bento.*masculino.*feminina/.test(a)));
});

test('o elenco do jogo não tem erro (vozes aprovadas pelo Leandro)', () => {
  const { personagens, vozes } = personagensDoJogo();
  assert.ok(personagens.length > 10);
  assert.deepStrictEqual(checarElenco(personagens, vozes).erros, []);
});
