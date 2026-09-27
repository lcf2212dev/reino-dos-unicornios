// NPCs.frases divide a fala em frases e "o emoji fica com a frase dele" (npcs-falas.js). No fim do texto isso falha:
// o RE_FRASE casa só a pontuação e o espaço antes do emoji, o emoji vira um pedaço sozinho e o filtro de letras o
// descarta. Toda fala que termina em "! 💪" aparece no balão do NPC sem o emoji (e o do unicórnio da baia também).
const { test } = require('node:test');
const assert = require('assert');
const Jogo = require('../../jogo-no-node.js');

function jogo() {
  const ctx = Jogo.contexto({ console, Math, Date, JSON, setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
    localStorage: { getItem: () => null, setItem() {} }, location: { protocol: 'file:', search: '' },
    document: { hidden: false, addEventListener() {} }, addEventListener() {} });
  Jogo.carregar(ctx, Jogo.scripts());
  return ctx.Reino;
}

test('o emoji do fim da fala fica com a última frase', () => {
  const R = jogo(), frases = (t) => Array.from(R.NPCs.frases(t));   // o array vem de outro contexto (vm)
  assert.deepStrictEqual(frases('Sala novinha! Leia com calma. 📖'), ['Sala novinha!', 'Leia com calma. 📖']);
  assert.deepStrictEqual(frases('No meu ninho mora o NH! 🐣'), ['No meu ninho mora o NH! 🐣']);
  // no meio do texto já funciona
  assert.deepStrictEqual(frases('Oi! 😄 Vamos?'), ['Oi! 😄', 'Vamos?']);
});

test('a página do balão mostra o emoji da fala padrão', () => {
  const R = jogo();
  const pags = R._npcs.paginas(['Faltam duas salas! 💪']);
  assert.strictEqual(pags.map((p) => p.join(' ')).join(' | '), 'Faltam duas salas! 💪');
});
