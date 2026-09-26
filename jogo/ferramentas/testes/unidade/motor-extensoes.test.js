// Testes de unidade das extensões do motor para features novas: `acoes` no def do módulo (a conversa dos NPCs
// acha a ação de um sistema), Reino.registrarIcones (ícone na pasta da feature) e as chaves do sprite de NPC
// (Reino.NPCs.OPCOES_SPRITE, que o validar-interiores usa para avisar chave desconhecida).
// Rodar (em jogo/): node --test ferramentas/testes/unidade/motor-extensoes.test.js   (tudo: npm test, na raiz)
const { test } = require('node:test');
const assert = require('assert');
const Jogo = require('../../jogo-no-node');
const Extras = require('../../validar/interiores-extras');

// todos os scripts `node: true` (como o validar-interiores)
function carregar() {
  const ctx = Jogo.contexto({ console, Math, Date, setTimeout, clearTimeout });
  Jogo.carregar(ctx, Jogo.ordemDosPredios(Jogo.scripts()));
  return ctx;
}
const ICONE = { n: 'croissant', p: { k: '#3a2446', o: '#f0a04a' }, d: Array.from({ length: 16 }, (_, i) => (i === 8 ? 'kkkkoooooooookkk' : '................')) };

test('acoes do módulo: N.acoes() lista, executar() chama com (acao, ctx) e registrarAcao ganha no empate', async () => {
  const R = carregar().Reino;
  const chamadas = [];
  R.registrarModulo({ id: 'padaria-teste', acoes: {
    assar: (acao, ctx) => { chamadas.push([acao.pao, ctx.npc]); return Promise.resolve('tchau'); },
    beber: () => 'do módulo',
  } });
  assert.ok(R.NPCs.acoes().includes('assar'));
  assert.strictEqual(R.NPCs.acoes().filter((a) => a === 'beber').length, 1);
  assert.strictEqual(await R.NPCs.executar({ tipo: 'assar', pao: 'croissant' }, { npc: 'manu' }), 'tchau');
  assert.deepStrictEqual(chamadas, [['croissant', 'manu']]);
  // a de registrarAcao (Pet Shop) vem antes da do módulo
  R.NPCs.registrarAcao('beber', () => 'do registrarAcao');
  assert.strictEqual(await R.NPCs.executar({ tipo: 'beber' }, {}), 'do registrarAcao');
  // erro na ação vira null (a conversa segue)
  R.registrarModulo({ id: 'quebrado', acoes: { quebrar: () => { throw new Error('de propósito'); } } });
  const erro = console.error; console.error = () => {};
  try { assert.strictEqual(await R.NPCs.executar({ tipo: 'quebrar' }, {}), null); } finally { console.error = erro; }
});

test('registrarIcones: guarda sem o \\uFE0F, recusa chave que existe e formato torto', () => {
  const ctx = carregar(), R = ctx.Reino;
  R.registrarIcones({ '🥐️': ICONE });
  assert.strictEqual(ctx.ICONES['🥐'], ICONE);
  assert.throws(() => R.registrarIcones({ '🥐': ICONE }), /já existe/);
  assert.throws(() => R.registrarIcones({ '🦄': ICONE }), /já existe/);
  assert.throws(() => R.registrarIcones({ '🍞': Object.assign({}, ICONE, { d: ICONE.d.slice(1) }) }), /linhas faltando/);
  assert.throws(() => R.registrarIcones({ '🍞': Object.assign({}, ICONE, { p: { k: '#3a2446' } }) }), /letras sem cor na paleta: o/);
  assert.throws(() => R.registrarIcones({ '🍞': Object.assign({}, ICONE, { n: '' }) }), /sem nome/);
  assert.strictEqual(ctx.ICONES['🍞'], undefined);
  assert.deepStrictEqual(Array.from(R.conferirIcone(ICONE)), []);
});

test('emoji do menu sem desenho: aviso; com registrarIcones: nada', () => {
  const ctx = carregar();
  const lugar = { id: 'padaria', menu: { emoji: '🥐' } };
  assert.match(Extras.emojiDoMenu(ctx, lugar)[0], /padaria: o emoji do menu 🥐 não tem desenho/);
  ctx.Reino.registrarIcones({ '🥐': ICONE });
  assert.deepStrictEqual(Extras.emojiDoMenu(ctx, lugar), []);
});

test('sprite: o elenco de hoje não gera aviso; chave e valor desconhecidos avisam; base registrada soma as suas', () => {
  const R = carregar().Reino;
  Object.keys(R.NPCs.ELENCO).forEach((id) => assert.deepStrictEqual(Extras.chavesDoSprite(R, R.NPCs.ELENCO[id].sprite, id), [], id));
  const a = Extras.chavesDoSprite(R, { penteado: 'moicano', touca: true, roupa: 'azul', oculos: true }, 'npc x');
  assert.strictEqual(a.length, 3, a.join('\n'));
  assert.match(a.join('\n'), /penteado = "moicano" não existe/);
  assert.match(a.join('\n'), /chave de sprite "touca" desconhecida/);
  assert.match(a.join('\n'), /sprite.roupa precisa ser uma cor/);
  R.NPCs.registrarBase('gato', () => null, { bigodes: 'cor' });
  assert.deepStrictEqual(Extras.chavesDoSprite(R, { base: 'gato', bigodes: '#ffffff' }, 'gato'), []);
});
