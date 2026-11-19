// Testes de unidade: as 6 peças épicas da Pluma, conquistadas pela letra cursiva nas lojas da Vila (docs/contratos/
// cursiva.md §6; js/conteudo/itens/pluma.js, Reino.VilaLojas.conquistas/conquistar, o lugar `calca` do Reino.Itens).
// Dados: uma peça por lugar do corpo, todas épicas, sem preço, sem arena, na loja do tipo, com molde e ícone.
// Regras: não se compram, não caem e não se vendem; conquistar dá a peça sem gastar estrela, uma de cada (jogou fora,
// conquista de novo); mochila cheia vai ao baú. A calça veste, tira e soma no bônus como os outros lugares.
// O jogo inteiro (todos os `node: true`) num vm com save sintético (ajudantes/jogo-save.js); nada toca no save real.
// Rodar: node --test jogo/ferramentas/testes/unidade/vila-conquistas.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { Jogo, montar, saveHoje } = require('./ajudantes/jogo-save');

const igual = (a, b, m) => assert.deepStrictEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)), m);
// id: [loja, lugar do corpo, artigo]
const PLUMA = {
  'espada-pluma': ['armas', 'espada', 'a'], 'escudo-pluma': ['armas', 'escudo', 'o'], 'capacete-pluma': ['cabecas', 'cabeca', 'o'],
  'armadura-pluma': ['armaduras', 'armadura', 'a'], 'calca-pluma': ['armaduras', 'calca', 'a'], 'botas-pluma': ['armaduras', 'botas', 'as'],
};
const IDS = Object.keys(PLUMA);

function jogo() {
  const orig = Jogo.scripts;
  Jogo.scripts = () => orig({});
  let j;
  try { j = montar({ save: saveHoje() }); } finally { Jogo.scripts = orig; }
  j.P.carregar();
  j.V = j.R.VilaLojas; j.It = j.R.Itens; j.C = j.R.ItensCatalogo;
  return j;
}
const vivas = (j, id) => j.It.pecas().filter((p) => p.id === id);

test('pluma: 6 peças épicas, uma por lugar do corpo, sem preço e sem arena, na loja do tipo', () => {
  const j = jogo(), R = j.R, C = j.C;
  const pecas = C.todos().filter((d) => d.cursiva);
  igual(pecas.map((d) => d.id), IDS);
  igual(pecas.map((d) => d.slot).sort(), Array.from(j.It.SLOTS).sort(), 'o conjunto veste o corpo inteiro');
  assert.ok(C.TIPOS.includes('calca'));
  pecas.forEach((d) => {
    const [loja, slot, artigo] = PLUMA[d.id];
    igual([d.loja, d.slot, d.artigo, d.raridade], [loja, slot, artigo, 'epico'], d.id);
    assert.strictEqual(d.preco, undefined, d.id + ' não tem preço');
    assert.strictEqual(d.arenas.length, 0, d.id + ' não cai de monstro');
    assert.ok(/ da Pluma$/.test(d.nome) && d.nome.length <= 22, d.id + ' nome');
    assert.ok(Object.keys(d.bonus).length && Object.values(d.bonus).every((n) => n > 0), d.id + ' bônus');
    const ic = j.ctx.ICONES[d.icone];
    assert.strictEqual(d.icone, 'item:' + d.id);
    assert.ok(ic, d.id + ' sem ícone');
    igual(R.conferirIcone(ic), [], d.id + ' ícone torto');
  });
  // nem à venda por estrelas, nem no sorteio das arenas
  Object.keys(j.V.LOJAS).forEach((l) => assert.ok(!j.V.aVenda(l).some((o) => o.def.cursiva), l));
  C.ARENAS.forEach((a) => assert.ok(!C.daArena(a, 'equip').some((d) => d.cursiva), a));
  assert.strictEqual(R.ItensDrop.chance('bosque', 'facil') > 0, true);
});

test('pluma: o catálogo recusa peça da letra cursiva com preço ou sem loja; peça de loja comum continua pedindo preço', () => {
  const C = jogo().C;
  const base = { nome: 'Teste', tipo: 'calca', slot: 'calca', raridade: 'epico', bonus: { vida: 1 }, arenas: [], icone: 'item:x' };
  assert.throws(() => C.registrar(Object.assign({}, base, { id: 'calca-t1', cursiva: true, loja: 'armaduras', preco: 10 })), /não tem preco/);
  assert.throws(() => C.registrar(Object.assign({}, base, { id: 'calca-t2', cursiva: true, arenas: ['bosque'] })), /tem loja/, 'cai de monstro, sem loja');
  assert.throws(() => C.registrar(Object.assign({}, base, { id: 'calca-t3', loja: 'armaduras' })), /precisa de preco/);
  assert.throws(() => C.registrar(Object.assign({}, base, { id: 'calca-t4', slot: 'botas', cursiva: true, loja: 'armaduras' })), /slot precisa ser "calca"/);
  assert.ok(C.registrar(Object.assign({}, base, { id: 'calca-t5', cursiva: true, loja: 'armaduras' })));
});

test('pluma: moldes de vestir no formato de cada lugar; a paleta de botas e calça cabe nas letras da parte', () => {
  const R = jogo().R, V = R.VESTES;
  const letras = (ls) => ls.join('').split('').filter((c) => c !== '.' && c !== '_' && c !== 'k');
  const semCor = (m, ls) => letras(ls).filter((c) => !m.paleta[c]);
  const esp = V['espada-pluma'], esc = V['escudo-pluma'], elmo = V['capacete-pluma'], arm = V['armadura-pluma'], cal = V['calca-pluma'], bot = V['botas-pluma'];
  assert.ok(esp.linhas.length === 11 && esp.linhas.every((l) => l.length === 5));
  igual(semCor(esp, esp.linhas), []);
  assert.ok(esc.linhas.length <= 9 && esc.linhas.every((l) => l.length === 8));
  igual(semCor(esc, esc.linhas), []);
  assert.ok(Object.keys(elmo.paleta).length <= 8);
  ['frente', 'lado'].forEach((v) => {
    const vi = elmo.vistas[v];
    assert.ok(vi.y >= -4 && vi.linhas.every((l) => l.length === 11), v);
    igual(semCor(elmo, vi.linhas), [], v);
  });
  Object.values(arm.troca).concat([arm.ombro, arm.cinto, arm.fivela, arm.peito]).forEach((l) => assert.ok(arm.paleta[l], 'armadura ' + l));
  assert.ok(!arm.saia, 'peitoral curto: a calça aparece inteira');
  assert.ok(cal.paleta[cal.calca.perna] && cal.paleta[cal.calca.sombra]);
  assert.ok(Object.keys(cal.paleta).length <= 4, 'a calça tem 4 letras (itens-vestir.js: CORES.calca)');
  Object.values(bot.troca).forEach((l) => assert.ok(bot.paleta[l], 'botas ' + l));
  // as botas ficaram com 6 letras quando a calça entrou: nenhum molde de botas pode ter mais cores que isso
  Object.keys(V).filter((id) => id.indexOf('botas-') === 0).forEach((id) => assert.ok(Object.keys(V[id].paleta).length <= 6, id));
});

test('pluma: cada loja mostra as suas; conquistar dá a peça sem gastar estrela, uma de cada; jogou fora, conquista de novo', () => {
  const j = jogo(), V = j.V;
  let mapa = 0;
  j.R.util.on(j.R.EVENTOS.MAPA_MUDOU, () => { mapa++; });
  igual(V.conquistas('armas').map((o) => [o.id, o.tem]), [['espada-pluma', false], ['escudo-pluma', false]]);
  igual(V.conquistas('cabecas').map((o) => o.id), ['capacete-pluma']);
  igual(V.conquistas('armaduras').map((o) => o.id), ['armadura-pluma', 'calca-pluma', 'botas-pluma']);
  igual(V.conquistas('casa'), []);
  igual(V.conquistas('nada'), []);
  assert.strictEqual(V.frasesPorPeca(), 5, 'pedido: 5 frases');
  assert.strictEqual(j.R.config.cursiva.frasesPorPeca, 5);
  assert.strictEqual(j.R.config.cursiva.frasesPorBola, 2, 'a MonsterBall continua com 2');

  const estrelas = j.P.estrelas();
  const r = V.conquistar('armaduras', 'calca-pluma');
  assert.ok(r.ok && r.onde === 'mochila' && r.id === 'calca-pluma', JSON.stringify(r));
  assert.strictEqual(j.P.estrelas(), estrelas, 'sem gastar estrela');
  assert.strictEqual(vivas(j, 'calca-pluma').length, 1);
  assert.strictEqual(j.lido().itens[r.uid].id, 'calca-pluma', 'gravou');
  assert.strictEqual(mapa, 1, 'MAPA_MUDOU');
  igual(V.conquistas('armaduras').map((o) => o.tem), [false, true, false]);
  // uma de cada: na mochila, no baú ou vestida
  igual(V.conquistar('armaduras', 'calca-pluma'), { ok: false, motivo: 'ja-tem', id: 'calca-pluma' });
  j.It.guardar(r.uid);
  assert.strictEqual(V.conquistar('armaduras', 'calca-pluma').motivo, 'ja-tem', 'no baú');
  j.It.retirar(r.uid); j.It.vestir(r.uid);
  assert.strictEqual(V.conquistar('armaduras', 'calca-pluma').motivo, 'ja-tem', 'vestida');
  assert.strictEqual(vivas(j, 'calca-pluma').length, 1);
  // jogou fora: pode conquistar de novo
  j.It.jogarFora(r.uid);
  igual(V.conquistas('armaduras').map((o) => o.tem), [false, false, false]);
  const r2 = V.conquistar('armaduras', 'calca-pluma');
  assert.ok(r2.ok && r2.uid !== r.uid);
  // loja errada, peça que não é da letra cursiva e peça que não existe: nada
  assert.strictEqual(V.conquistar('armas', 'calca-pluma').motivo, 'itens');
  assert.strictEqual(V.conquistar('armas', 'espada-rubi').motivo, 'itens');
  assert.strictEqual(V.conquistar('armas', 'xx').motivo, 'itens');
  assert.strictEqual(vivas(j, 'espada-rubi').length, 0);
});

test('pluma: não se compra com estrelas nem se vende; mochila cheia, a peça vai para o baú', () => {
  const j = jogo(), V = j.V, It = j.It;
  j.P.ganharEstrelas(500);
  const antes = j.P.estrelas();
  assert.strictEqual(V.total('armas', [{ id: 'espada-pluma', qtd: 1 }]), 0);
  igual([V.comprar('armas', [{ id: 'espada-pluma', qtd: 1 }]).ok, j.P.estrelas()], [false, antes], 'não está à venda');
  const esp = V.conquistar('armas', 'espada-pluma'), rubi = It.ganhar('espada-rubi');
  igual(V.compraveis('armas').map((g) => g.id), ['espada-rubi'], 'a conquistada não entra na venda');
  igual([V.vender('armas', [esp.uid]).ok, V.vender('armas', [rubi.uid, esp.uid]).ok], [false, false]);
  assert.strictEqual(vivas(j, 'espada-pluma').length, 1);
  assert.strictEqual(j.P.estrelas(), antes);
  igual(V.compraveis('armaduras').map((g) => g.id), [], 'calça, armadura e botas da Pluma também não');
  // mochila cheia: baú
  while (It.espacos().usados < It.CAPACIDADE()) It.ganhar('espada-madeira');
  const elmo = V.conquistar('cabecas', 'capacete-pluma');
  igual([elmo.ok, elmo.onde], [true, 'bau']);
  assert.strictEqual(It.bau().some((g) => g.id === 'capacete-pluma'), true);
});

test('itens: a calça tem lugar próprio (vestir, tirar, bônus, vestes); o conjunto inteiro se veste junto', () => {
  const j = jogo(), It = j.It, V = j.V;
  igual(It.SLOTS, ['espada', 'escudo', 'cabeca', 'armadura', 'calca', 'botas']);
  igual(It.vestido().calca, null);
  igual(It.vestes().calca, null);
  const uids = {};
  IDS.forEach((id) => { uids[id] = V.conquistar(PLUMA[id][0], id).uid; });
  // na mochila, na ordem de tela: espada, escudo, cabeça, armadura, calça, botas
  igual(It.mochila().map((g) => g.id), IDS);
  IDS.forEach((id) => assert.strictEqual(It.vestir(uids[id]), true, id));
  igual(It.vestes(), { espada: 'espada-pluma', escudo: 'escudo-pluma', cabeca: 'capacete-pluma', armadura: 'armadura-pluma', calca: 'calca-pluma', botas: 'botas-pluma' });
  igual(It.bonus(), { dano: 9, defesa: 3 + 2 + 1 + 1, vida: 2 + 4 + 9 + 3, velocidade: 0.13, sorte: 0 });
  assert.strictEqual(It.espacos().usados, 0, 'o vestido não ocupa a mochila');
  igual(It.tirar('calca'), { ok: true, onde: 'mochila' });
  igual([It.vestes().calca, It.bonus().vida], [null, 2 + 4 + 9]);
  assert.strictEqual(j.lido().itens[uids['calca-pluma']].onde, 'mochila', 'gravou');
  // a armadura não tira a calça do lugar (lugares diferentes)
  It.vestir(uids['calca-pluma']);
  igual([It.vestido().armadura.id, It.vestido().calca.id], ['armadura-pluma', 'calca-pluma']);
});
