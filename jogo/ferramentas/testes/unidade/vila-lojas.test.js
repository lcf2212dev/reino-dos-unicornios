// Testes de unidade: as regras das 4 lojas da Vila Arco-Íris (js/sistemas/vila-lojas.js, Reino.VilaLojas; docs/contratos/
// vila.md §4, §5). Preços de compra e venda, comprar e vender vários de uma vez (tudo ou nada, saldo conferido antes),
// a peça vestida que não se vende, o enfeite da Casa Bonita na próxima chave 'loja:<id>:<n>', os móveis da loja fora
// do sorteio, a pergunta do 4º bimestre (filtros do Bosque, chave 'vila:pergunta') e a porteira do lojista. O jogo
// inteiro (todos os `node: true`) num vm com save sintético (ajudantes/jogo-save.js); peças, móveis e matérias de
// mentira (as de verdade vêm de outras frentes); nada toca no save real.
// Rodar: node --test jogo/ferramentas/testes/unidade/vila-lojas.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { Jogo, montar, saveHoje, copia } = require('./ajudantes/jogo-save');

const igual = (a, b, m) => assert.deepStrictEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)), m);
const d = (id, tipo, extra) => Object.assign({ id, tipo }, extra || {});
const MATERIAS = [
  { id: 'v4a', bimestre: 4, salas: [{ id: 'a1', nome: 'A1', desafios: [d('a1-1', 'escolha'), d('a1-2', 'memoria'), d('a1-3', 'escolha', { livre: true }), d('a1-4', 'escrever')] }] },
  { id: 'v4b', bimestre: 4, salas: [{ id: 'b1', nome: 'B1', desafios: [d('b1-1', 'vf'), d('b1-2', 'escrever', { chaves: ['sol'] })] }] },
  { id: 'v4x', bimestre: 4, arquivada: true, salas: [{ id: 'x1', nome: 'X', desafios: [d('x1-1', 'escolha')] }] },
  { id: 'v3', bimestre: 3, salas: [{ id: 'c1', nome: 'C1', desafios: [d('c1-1', 'escolha')] }] },
];
const VALEM = ['a1-1', 'b1-1', 'b1-2'];
// peças de loja de mentira (as que a F2 cria ainda podem não existir)
const PECAS = [
  { id: 'espada-teste-a', nome: 'Espada Teste A', tipo: 'espada', slot: 'espada', raridade: 'comum', bonus: { dano: 2 }, loja: 'armas', preco: 20 },
  { id: 'espada-teste-b', nome: 'Espada Teste B', tipo: 'espada', slot: 'espada', raridade: 'lendario', bonus: { dano: 9 }, loja: 'armas', preco: 81 },
  { id: 'chapeu-teste-a', nome: 'Chapéu Teste', tipo: 'chapeu', slot: 'cabeca', raridade: 'raro', bonus: { sorte: 0.1 }, loja: 'cabecas', preco: 35 },
  { id: 'botas-teste-a', nome: 'Botas Teste', tipo: 'botas', slot: 'botas', raridade: 'epico', bonus: { velocidade: 0.05 }, loja: 'armaduras', preco: 1 },
];

function jogo() {
  const orig = Jogo.scripts;
  Jogo.scripts = () => orig({});
  let j;
  try { j = montar({ save: saveHoje() }); } finally { Jogo.scripts = orig; }
  const R = j.R;
  PECAS.forEach((p) => { if (!R.ItensCatalogo.def(p.id)) R.ItensCatalogo.registrar(Object.assign({ arenas: [], icone: 'item:' + p.id }, copia(p))); });
  R.Interiores.OBJETOS['t-vaso'] = { w: 1, h: 1, solido: 'base' };
  ['vl-vaso', 'vl-quadro'].forEach((id) => {
    if (!R.movelCasa(id)) R.registrarMovelCasa({ id, nome: id, objeto: 't-vaso', comodo: 'estar', direcoes: 1, loja: true });
  });
  // miniaturas de mentira do Mercado de Lugares Famosos (as de verdade: conteudo/casa/lugares.js), cada uma com o seu preço
  [['vl-mini-a', 75], ['vl-mini-b', 120]].forEach(([id, preco]) => {
    if (!R.movelCasa(id)) R.registrarMovelCasa({ id, nome: id, objeto: 't-vaso', comodo: 'garagem', direcoes: 1, loja: 'lugares', preco });
  });
  R.materias.splice(0, R.materias.length, ...copia(MATERIAS));
  j.P.carregar();
  j.V = R.VilaLojas; j.It = R.Itens; j.cfg = R.config.vila;
  j.mapa = 0;
  R.util.on(R.EVENTOS.MAPA_MUDOU, () => { j.mapa++; });
  return j;
}
const vivo = (j, uid) => j.It.pecas().find((p) => p.uid === uid) || null;
function darEstrelas(j, n) { j.P.ganharEstrelas(n - j.P.estrelas()); }

test('vila: 4 lojas com nome e famílias; à venda: as peças da loja e os enfeites loja:true a 30', () => {
  const j = jogo(), V = j.V;
  igual(Object.keys(V.LOJAS), ['casa', 'armas', 'cabecas', 'armaduras', 'lugares']);
  igual(V.LOJAS.cabecas.familias, ['capacete', 'chapeu']);
  igual(V.LOJAS.armaduras.familias, ['armadura', 'botas']);
  assert.strictEqual(V.LOJAS.armas.nome, 'Forja Brilhante');
  const armas = V.aVenda('armas').map((o) => o.id);
  assert.ok(armas.includes('espada-teste-a') && armas.includes('espada-teste-b'));
  assert.ok(!armas.includes('espada-madeira'), 'peça de drop não se vende');
  assert.ok(V.aVenda('armas').every((o) => o.def.loja === 'armas' && o.preco === o.def.preco));
  const casa = V.aVenda('casa');
  assert.ok(casa.some((o) => o.id === 'vl-vaso'));
  assert.ok(casa.every((o) => o.def.loja === true && o.preco === 30));
  igual(V.aVenda('nada'), []);
});

test('vila: preço de venda = metade (para baixo, mínimo 1); peça de drop pela raridade', () => {
  const j = jogo(), V = j.V, C = j.R.ItensCatalogo;
  assert.strictEqual(V.precoVenda(C.def('espada-teste-a')), 10);
  assert.strictEqual(V.precoVenda(C.def('espada-teste-b')), 40);
  assert.strictEqual(V.precoVenda(C.def('botas-teste-a')), 1, 'mínimo 1');
  assert.strictEqual(V.precoVenda(C.def('espada-madeira')), j.cfg.vendaDrop.comum);
  assert.strictEqual(V.precoVenda(C.def('espada-dragao')), j.cfg.vendaDrop.lendario);
});

test('vila: comprar vários de uma vez; sem saldo não compra nada; qtd fora do limite recusa', () => {
  const j = jogo(), V = j.V;
  darEstrelas(j, 100);
  const pedido = [{ id: 'espada-teste-a', qtd: 2 }, { id: 'espada-teste-b', qtd: 1 }];
  assert.strictEqual(V.total('armas', pedido), 121);
  const antes = j.It.pecas().length;
  const nao = V.comprar('armas', pedido);
  assert.strictEqual(nao.ok, false);
  assert.strictEqual(nao.motivo, 'saldo');
  assert.strictEqual(nao.falta, 21);
  assert.strictEqual(j.P.estrelas(), 100, 'nada gasto');
  assert.strictEqual(j.It.pecas().length, antes, 'nada ganho');
  assert.strictEqual(V.comprar('armas', [{ id: 'espada-teste-a', qtd: j.cfg.maxPorItem + 1 }]).ok, false);
  assert.strictEqual(V.comprar('armas', [{ id: 'chapeu-teste-a', qtd: 1 }]).ok, false, 'peça de outra loja');
  assert.strictEqual(V.comprar('armas', []).ok, false);
  darEstrelas(j, 200);
  const r = V.comprar('armas', pedido);
  assert.ok(r.ok);
  assert.strictEqual(r.total, 121);
  assert.strictEqual(j.P.estrelas(), 79);
  assert.strictEqual(j.It.pecas().filter((p) => p.id === 'espada-teste-a').length, 2);
  assert.strictEqual(j.lido().estrelas.gastas, j.P.estado().estrelas.gastas, 'gravou');
  assert.strictEqual(j.mapa, 1, 'MAPA_MUDOU');
});

test('vila: Casa Bonita guarda cada enfeite na próxima chave loja:<id>:<n>; não compra de volta', () => {
  const j = jogo(), V = j.V;
  darEstrelas(j, 200);
  assert.ok(V.comprar('casa', [{ id: 'vl-vaso', qtd: 2 }]).ok);
  assert.ok(V.comprar('casa', [{ id: 'vl-vaso', qtd: 1 }, { id: 'vl-quadro', qtd: 1 }]).ok);
  const cm = j.lido().casaMoveis;
  igual(Object.keys(cm).filter((k) => k.startsWith('loja:')).sort(), ['loja:vl-quadro:1', 'loja:vl-vaso:1', 'loja:vl-vaso:2', 'loja:vl-vaso:3']);
  assert.strictEqual(cm['loja:vl-vaso:3'].movel, 'vl-vaso');
  assert.strictEqual(j.R.CasaMoveis.qtd('vl-vaso'), 3);
  assert.strictEqual(j.P.estrelas(), 200 - 4 * 30);
  igual(V.compraveis('casa'), []);
});

test('vila: vender vários (mochila e baú), nunca a vestida nem de outra família; tudo ou nada', () => {
  const j = jogo(), V = j.V, It = j.It;
  darEstrelas(j, 0);
  const a = It.ganhar('espada-teste-a').uid, b = It.ganhar('espada-teste-a').uid, c = It.ganhar('espada-madeira').uid;
  const vest = It.ganhar('espada-teste-b').uid;
  It.vestir(vest);
  It.guardar(b);
  const ch = It.ganhar('chapeu-teste-a').uid;
  const g = V.compraveis('armas');
  igual(g.map((x) => [x.id, x.uids.length, x.preco]), [['espada-madeira', 1, j.cfg.vendaDrop.comum], ['espada-teste-a', 2, 10]], 'na ordem do catálogo');
  assert.ok(!g.some((x) => x.uids.includes(vest)), 'a vestida fica de fora');
  assert.ok(!g.some((x) => x.uids.includes(ch)), 'chapéu não é da Forja');
  assert.strictEqual(V.compraveis('cabecas')[0].uids[0], ch);
  assert.strictEqual(V.vender('armas', [a, vest]).ok, false, 'com a vestida: nada');
  assert.strictEqual(V.vender('armas', [a, a]).ok, false, 'uid repetido: nada');
  assert.ok(vivo(j, a), 'nada foi jogado fora');
  assert.strictEqual(V.totalVenda('armas', [a, b, c]), 20 + j.cfg.vendaDrop.comum);
  const r = V.vender('armas', [a, b, c]);
  assert.ok(r.ok);
  assert.strictEqual(j.P.estrelas(), 20 + j.cfg.vendaDrop.comum);
  assert.strictEqual(vivo(j, a), null);
  assert.strictEqual(j.lido().itens[b].onde, 'fora', 'lápide gravada');
  assert.strictEqual(j.lido().estrelas.ganhas, j.P.estado().estrelas.ganhas, 'estrelas gravadas');
  assert.ok(vivo(j, vest), 'a vestida continua');
  igual(V.compraveis('armas'), []);
});

test('vila: pergunta só do 4º bimestre (config), filtros do Bosque, sorteio pela chave vila:pergunta', () => {
  const j = jogo(), V = j.V, R = j.R;
  assert.strictEqual(j.cfg.bimestre, 4);
  R.Bimestres.atual = 3;
  igual(V.perguntas().map((p) => p.desafio.id), VALEM, 'o bimestre da Vila, não o atual');
  const visto = [];
  const orig = R.util.sortear;
  R.util.sortear = (l, k) => { visto.push([l.map((x) => x.desafio.id), k]); return l[0]; };
  const p = V.pergunta();
  R.util.sortear = orig;
  igual(visto, [[VALEM, 'vila:pergunta']]);
  assert.ok(p.materia.id && p.sala.id && p.desafio.id);
  j.cfg.bimestre = 9;
  assert.strictEqual(V.pergunta(), null);
});

test('vila: porteira só para o lojista; sem pergunta, conversa; ação vilaLoja se despede com tchau', async () => {
  const j = jogo(), R = j.R, m = R.modulo('vila-lojas');
  assert.strictEqual(m.porteira({ id: 'x', acao: { tipo: 'tela' } }), null);
  assert.strictEqual(m.porteira({ id: 'x' }), null);
  let pediu = null;
  R.UI = { perguntaVila: (npc) => { pediu = npc.id; return Promise.resolve(false); } };
  assert.strictEqual(await m.porteira({ id: 'bigorna', acao: { tipo: 'vilaLoja', loja: 'armas' } }), false);
  assert.strictEqual(pediu, 'bigorna');
  j.cfg.bimestre = 9;
  pediu = null;
  assert.strictEqual(await m.porteira({ id: 'bigorna', acao: { tipo: 'vilaLoja', loja: 'armas' } }), true);
  assert.strictEqual(pediu, null, 'sem pergunta, sem tela');
  let aberta = null;
  R.UI.telaVilaLoja = (l) => { aberta = l; return Promise.resolve(); };
  assert.strictEqual(await m.acoes.vilaLoja({ tipo: 'vilaLoja', loja: 'cabecas' }), 'tchau');
  assert.strictEqual(aberta, 'cabecas');
});

test('lugares: o Mercado da Garagem vende só as miniaturas, pelo preço de cada uma, e guarda como móvel da casa', () => {
  const j = jogo(), V = j.V;
  assert.strictEqual(V.LOJAS.lugares.nome, 'Mercado de Lugares Famosos');
  assert.ok(V.LOJAS.lugares.moveis && V.LOJAS.casa.moveis);
  const lug = V.aVenda('lugares');
  assert.ok(lug.length >= 2 && lug.every((o) => o.def.loja === 'lugares'), 'só as da loja lugares');
  assert.strictEqual(lug.find((o) => o.id === 'vl-mini-b').preco, 120);
  assert.ok(!V.aVenda('casa').some((o) => o.def.loja === 'lugares'), 'a Casa Bonita não vende as miniaturas');
  darEstrelas(j, 300);
  assert.strictEqual(V.comprar('lugares', [{ id: 'vl-mini-a', qtd: 1 }, { id: 'vl-mini-b', qtd: 1 }]).ok, true);
  assert.strictEqual(j.P.estrelas(), 300 - 75 - 120);
  const cm = j.lido().casaMoveis;
  assert.strictEqual(cm['loja:vl-mini-a:1'].movel, 'vl-mini-a');
  assert.strictEqual(j.R.CasaMoveis.qtd('vl-mini-b'), 1);
  // um de cada: o que ela já tem sai da lista e não se compra de novo; mais de 1 numa compra também não
  assert.ok(!V.aVenda('lugares').some((o) => o.id === 'vl-mini-b'), 'o que ela já tem sai da lista');
  assert.strictEqual(V.comprar('lugares', [{ id: 'vl-mini-b', qtd: 1 }]).ok, false, 'não compra de novo');
  assert.strictEqual(V.maxDa('lugares'), 1);
  assert.strictEqual(V.maxDa('casa'), j.cfg.maxPorItem);
  igual(V.compraveis('lugares'), []);
});

test('vila: os móveis da loja ficam fora do presente surpresa', () => {
  const j = jogo(), R = j.R, CM = R.CasaMoveis;
  for (let i = 0; i < 40; i++) {
    const p = CM.presente('bosque:p' + i);
    if (p) assert.ok(!R.movelCasa(p.movel).loja, 'sorteou um móvel de loja: ' + p.movel);
  }
});
