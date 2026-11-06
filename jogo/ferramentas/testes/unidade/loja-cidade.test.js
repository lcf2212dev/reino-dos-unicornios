// Testes de unidade: as 4 lojas da Cidade Nova (js/sistemas/loja-cidade.js, docs/contratos/cidade-nova.md).
// Catálogo (50 móveis a 30 estrelas; 20 armas, 20 elmos, 20 chapéus, 20 armaduras e 20 botas), preço e venda,
// carrinho de vários itens, estrelas, mochila/baú, peças da casa e a pergunta do 4º bimestre. O jogo inteiro num vm
// com save sintético (ajudantes/jogo-save.js); nada toca no save real.
// Rodar: node --test jogo/ferramentas/testes/unidade/loja-cidade.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { Jogo, montar, saveHoje } = require('./ajudantes/jogo-save');

function jogo() {
  const orig = Jogo.scripts;
  Jogo.scripts = () => orig({});
  let j;
  try { j = montar({ save: saveHoje() }); } finally { Jogo.scripts = orig; }
  j.P.carregar();
  j.L = j.R.LojaCidade;
  return j;
}

test('cidade-nova: 50 móveis a 30 estrelas e 20 de cada equipamento nas 3 lojas', () => {
  const j = jogo(), R = j.R, L = j.L;
  assert.ok(L && R.LOJA_DECOR_ITENS, 'Reino.LojaCidade e a lista de decoração');
  assert.strictEqual(L.compra('casa').length, 50);
  L.compra('casa').forEach((m) => { assert.strictEqual(m.preco, 30, m.id + ': cada móvel custa 30'); assert.ok(m.objeto, m.id + ': objeto para o modo decorar'); });
  const C = R.ItensCatalogo;
  ['armas', 'cabecas', 'armaduras'].forEach((id) => assert.ok(L.compra(id).length >= 20, id + ': pelo menos 20'));
  assert.strictEqual(C.equipamentos().filter((d) => d.loja === 'armas').length, 20);
  assert.strictEqual(C.equipamentos().filter((d) => d.loja === 'cabecas' && d.tipo === 'capacete').length, 20);
  assert.strictEqual(C.equipamentos().filter((d) => d.loja === 'cabecas' && d.tipo === 'chapeu').length, 20);
  assert.strictEqual(C.equipamentos().filter((d) => d.loja === 'armaduras' && d.tipo === 'armadura').length, 20);
  assert.strictEqual(C.equipamentos().filter((d) => d.loja === 'armaduras' && d.tipo === 'botas').length, 20);
  assert.strictEqual(L.LOJAS.armas.nome, 'Forja das Lâminas');
  assert.deepStrictEqual(Object.keys(L.LOJAS).sort(), ['armaduras', 'armas', 'cabecas', 'casa']);
});

test('cidade-nova: comprar e vender VÁRIOS itens, com estrelas, mochila/baú e peças da casa', () => {
  const j = jogo(), L = j.L, P = j.R.Progresso, I = j.R.Itens, CM = j.R.CasaMoveis;
  const base = P.estrelas() + 500;
  P.ganharEstrelas(500);
  // 2 espadas de cobre + 1 de prata = 3 × 18 = 54
  const r = L.comprar('armas', [{ id: 'espada-cobre', qtd: 2 }, { id: 'espada-prata', qtd: 1 }]);
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.total, 54);
  assert.strictEqual(r.entregues, 3);
  assert.strictEqual(P.estrelas(), base - 54);
  const mochila = I.mochila();
  assert.strictEqual(mochila.reduce((n, g) => n + g.qtd, 0), 3);
  // vende as 2 de cobre de uma vez: 2 × 9 = 18
  const vend = L.vende('armas')[0];
  assert.strictEqual(vend.id, 'espada-cobre');
  assert.strictEqual(vend.qtd, 2);
  const v = L.vender('armas', vend.uids.slice(0, 2));
  assert.strictEqual(v.ok, true);
  assert.strictEqual(v.total, 18);
  assert.strictEqual(P.estrelas(), base - 54 + 18);
  assert.strictEqual(I.mochila().reduce((n, g) => n + g.qtd, 0), 1);
  // 2 móveis da casa (60 estrelas), guardados como peças da CasaMoveis
  const d = L.comprar('casa', [{ id: 'vaso-rosas', qtd: 2 }]);
  assert.strictEqual(d.ok, true);
  assert.strictEqual(d.total, 60);
  assert.strictEqual(P.estrelas(), base - 54 + 18 - 60);
  assert.strictEqual(CM.qtd('vaso-rosas'), 2);
  assert.ok(Object.keys(P.estado().casaMoveis).some((k) => /^loja:vaso-rosas:/.test(k)));
  // sem estrelas: recusa sem gastar
  const antes = P.estrelas();
  P.gastarEstrelas(antes);
  const falha = L.comprar('armas', [{ id: 'espada-ouro', qtd: 1 }]);
  assert.strictEqual(falha.ok, false);
  assert.strictEqual(falha.motivo, 'estrelas');
  assert.strictEqual(P.estrelas(), 0);
  // o carrinho não passa do máximo por item
  P.ganharEstrelas(9999);
  assert.strictEqual(L.comprar('armas', [{ id: 'espada-cobre', qtd: L.maxPorItem() + 1 }]).ok, false);
});

test('cidade-nova: a pergunta de entrada é do 4º bimestre e de todos os tipos respondíveis', () => {
  const j = jogo(), R = j.R;
  const lista = R.Bosque.perguntasDe(4);
  assert.ok(lista.length > 0);
  lista.forEach((q) => {
    assert.strictEqual(q.materia.bimestre, 4);
    assert.ok(!q.materia.arquivada);
    assert.ok(!q.desafio.livre);
    assert.ok(R.config.fantasmas.perguntaForaTipos.indexOf(q.desafio.tipo) < 0);
  });
  const q = R.Bosque.perguntaDoBimestre(4);
  assert.ok(q && q.materia && q.sala && q.desafio);
  assert.strictEqual(q.materia.bimestre, 4);
  assert.strictEqual(R.LojaCidade.pergunta().materia.bimestre, 4);
});

test('cidade-nova: o módulo registra a ação dos NPCs e o balão/portal da Teleportadora', () => {
  const j = jogo(), R = j.R;
  assert.ok(R.NPCs.acoes().includes('lojaCidade'));
  assert.ok(R.NPCs.acoes().includes('entrarLoja'));
  assert.ok(R.NPCs.acoes().includes('sairLoja'));
  assert.ok(R.NPCs.acoes().includes('teleportadora'));
  assert.ok(R.NPCs.acoes().includes('portalCidade'));
  assert.ok(R.Teleportadora && R.Teleportadora.falar && R.Teleportadora.irCidade && R.Teleportadora.portal);
});
