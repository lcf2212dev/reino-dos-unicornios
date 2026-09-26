// Reino.registrarPersonagem com predio/x/y (nucleo/registros.js) nos prédios de antes: cada <p>.js soma
// Reino.personagensDoPredio('<id do interior>') aos npcs, com sprite e voz do elenco; hoje a lista é vazia.
// O validar-interiores com um personagem assim fica em validadores.test.js (cópia do jogo).
// Rodar (em jogo/): node --test ferramentas/testes/unidade/interiores-personagens.test.js   (tudo: npm test, na raiz)
const { test } = require('node:test');
const assert = require('assert');
const Jogo = require('../../jogo-no-node');

// o jogo no vm; antes(Reino) roda logo antes do primeiro script dos prédios
function reino(antes) {
  const ctx = Jogo.contexto({ console, setTimeout, clearTimeout, Math, Date });
  const lista = Jogo.ordemDosPredios(Jogo.scripts());
  const k = lista.findIndex((s) => s.grupo === 'interiores');
  Jogo.carregar(ctx, lista.slice(0, k));
  if (antes) antes(ctx.Reino);
  Jogo.carregar(ctx, lista.slice(k));
  return ctx.Reino;
}
const VISITANTE = { id: 'visitante-teste', nome: 'Visitante', predio: 'museu', x: 22, y: 21,
  sprite: { base: 'pessoa', pele: '#f1c7a5', cabelo: '#5a3825', penteado: 'rabo', roupa: '#e36b8a', roupa2: '#5a4a8a', perna: 'saia' } };

test('cada personagem registrado com predio (e x/y) aparece UMA vez no seu interior, e só lá', () => {
  // relativo ao que o jogo tiver: vale hoje (nenhum) e depois de qualquer `npm run novo -- personagem`
  const R = reino();
  R._personagensPredio.filter((p) => p.x != null && p.y != null).forEach((p) => {
    R.interiores.forEach((d) => {
      const n = (d.npcs || []).filter((x) => x.id === p.id).length;
      assert.strictEqual(n, d.id === p.predio ? 1 : 0, `${p.id} em ${d.id}`);
    });
  });
});

test('registrado com predio museu e x/y aparece nos npcs do museu, com sprite e voz do elenco', () => {
  const R = reino((R) => R.registrarPersonagem(VISITANTE));
  const museu = R.interiores.find((d) => d.id === 'museu');
  const n = museu.npcs.find((p) => p.id === VISITANTE.id);
  assert.ok(n, 'o visitante não entrou nos npcs do museu');
  assert.strictEqual(n.nome, 'Visitante');
  assert.strictEqual(n.voz, 'npc-visitante-teste');
  assert.deepStrictEqual([n.x, n.y, n.sprite.base, n.sprite.roupa], [22, 21, 'pessoa', '#e36b8a']);
  assert.strictEqual(n.acao.tipo, 'guia');   // sem acao: a do guia do museu
  // sem x/y num prédio antigo: não aparece (o validar-interiores acusa)
  const R2 = reino((R) => R.registrarPersonagem(Object.assign({}, VISITANTE, { x: undefined, y: undefined })));
  assert.ok(!R2.interiores.find((d) => d.id === 'museu').npcs.some((p) => p.id === VISITANTE.id));
});
