// Testes de unidade: as 100 peças das lojas da Vila Arco-Íris (docs/contratos/vila.md §2 e §4; js/conteudo/itens/loja-*.js).
// Contagens por família e raridade, ids e nomes únicos (com os do catálogo das arenas), loja e preço pela raridade,
// arenas vazias (não caem de monstro), bônus da família, molde de vestir no formato de itens.md §8 e ícone 16×16.
// Carrega os `node: true` do jogo num vm (sem save, sem DOM).
// Rodar: node --test jogo/ferramentas/testes/unidade/vila-itens.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const J = require('../../jogo-no-node');

function jogo() {
  const ctx = J.contexto({ console });
  J.carregar(ctx, J.scripts());
  return ctx;
}
const FAMILIAS = { espada: 'armas', capacete: 'cabecas', chapeu: 'cabecas', armadura: 'armaduras', botas: 'armaduras' };
// as 100 que se compram com estrelas (as da letra cursiva, sem preço, têm o teste delas: vila-conquistas.test.js)
const DA_LOJA = (d) => d.loja && d.loja !== 'treinadores' && !d.cursiva;
const BONUS = { espada: ['dano'], capacete: ['defesa', 'vida'], chapeu: ['sorte', 'vida', 'velocidade'],
  armadura: ['vida', 'defesa'], botas: ['velocidade'] };

test('vila: 20 peças por família, com a mistura de raridades, loja e preço', () => {
  const w = jogo(), R = w.Reino, C = R.ItensCatalogo, precos = R.config.vila.precos;
  const loja = C.todos().filter(DA_LOJA);
  assert.strictEqual(loja.length, 100);
  Object.keys(FAMILIAS).forEach((t) => {
    const f = loja.filter((d) => d.tipo === t);
    assert.strictEqual(f.length, 20, t);
    const n = (r) => f.filter((d) => d.raridade === r).length;
    assert.deepStrictEqual([n('comum'), n('raro'), n('epico'), n('lendario')], [8, 6, 4, 2], t);
    f.forEach((d) => {
      assert.strictEqual(d.loja, FAMILIAS[t], d.id);
      assert.strictEqual(d.preco, precos[d.raridade], d.id);
      assert.strictEqual(d.arenas.length, 0, d.id + ' não cai de monstro');
      assert.ok(Object.keys(d.bonus).length && Object.keys(d.bonus).every((k) => BONUS[t].includes(k) && d.bonus[k] > 0), d.id + ' bônus');
      if (t === 'espada') assert.ok(d.bonus.dano >= 1 && d.bonus.dano <= 12, d.id);
      assert.ok(d.nome.length <= 22, d.id + ' nome comprido');
    });
  });
  // nenhuma peça da loja entra no sorteio das arenas
  C.ARENAS.forEach((a) => assert.ok(!C.daArena(a, 'equip').some((d) => d.loja), a));
});

test('vila: ids e nomes únicos (com os das arenas), molde e ícone de cada peça', () => {
  const w = jogo(), R = w.Reino, C = R.ItensCatalogo;
  const nomes = Array.from(C.todos(), (d) => d.nome);   // Array.from: arrays do vm têm outro protótipo
  assert.deepStrictEqual(nomes.filter((n, i) => nomes.indexOf(n) !== i), [], 'nomes repetidos');
  C.todos().filter(DA_LOJA).forEach((d) => {
    const m = R.VESTES[d.id], ic = w.ICONES['item:' + d.id];
    assert.ok(m && m.paleta, d.id + ' sem molde');
    assert.strictEqual(d.icone, 'item:' + d.id);
    assert.ok(ic, d.id + ' sem ícone');
    assert.deepStrictEqual(Array.from(R.conferirIcone(ic)), [], d.id + ' ícone torto');
    const letras = (ls) => ls.join('').split('').filter((c) => c !== '.' && c !== '_' && c !== 'k');
    const semCor = (ls) => letras(ls).filter((c) => !m.paleta[c]);
    if (d.tipo === 'espada') {
      assert.strictEqual(m.linhas.length, 11, d.id);
      assert.ok(m.linhas.every((l) => l.length === 5), d.id);
      assert.deepStrictEqual(semCor(m.linhas), [], d.id);
    } else if (d.slot === 'cabeca') {
      assert.ok(Object.keys(m.paleta).length <= 8, d.id + ' mais de 8 cores');
      ['frente', 'lado'].forEach((v) => {
        const vi = m.vistas[v];
        assert.ok(vi && vi.y >= -4 && vi.linhas.every((l) => l.length === 11), d.id + ' ' + v);
        assert.deepStrictEqual(semCor(vi.linhas), [], d.id + ' ' + v);
      });
    } else {
      assert.ok(Object.keys(m.paleta).length <= 8, d.id + ' mais de 8 cores');
      Object.values(m.troca).forEach((l) => assert.ok(m.paleta[l], d.id + ' troca'));
      ['ombro', 'cinto', 'fivela', 'peito', 'mangas'].forEach((k) => { if (m[k]) assert.ok(m.paleta[m[k]], d.id + ' ' + k); });
    }
  });
  // forma e cor: duas peças da mesma família nunca têm o mesmo ícone
  const desenhos = C.todos().filter(DA_LOJA).map((d) => JSON.stringify(w.ICONES['item:' + d.id].d) + JSON.stringify(w.ICONES['item:' + d.id].p));
  assert.strictEqual(new Set(desenhos).size, 100);
});
