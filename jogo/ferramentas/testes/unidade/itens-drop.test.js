// Testes de unidade: o que cai do inimigo vencido (js/sistemas/itens-drop.js, Reino.ItensDrop; docs/contratos/itens.md §5,
// §12) e o catálogo (js/conteudo/itens/catalogo.js). Chance por tipo e com Sorte (teto), pesos de categoria, raridade e
// `repetido`, drop gravado na hora do 'vencido', mochila cheia vai ao baú, estrelas, modo congelado estável (sem gastar o
// Math.random) e a distribuição em 10.000 inimigos perto da conta do §12. O jogo inteiro (todos os `node: true`) num vm
// com save sintético (ajudantes/jogo-save.js); nada toca no save real.
// Rodar: node --test jogo/ferramentas/testes/unidade/itens-drop.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { Jogo, montar, saveHoje } = require('./ajudantes/jogo-save');

const igual = (a, b, m) => assert.deepStrictEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)), m);
function jogo() {
  const orig = Jogo.scripts;
  Jogo.scripts = () => orig({});
  let j;
  try { j = montar({ save: saveHoje() }); } finally { Jogo.scripts = orig; }
  j.P.carregar();
  j.It = j.R.Itens; j.D = j.R.ItensDrop; j.cfg = j.R.config.itens.drop;
  j.itensEv = [];
  j.R.util.on(j.R.EVENTOS.ITENS, (c) => j.itensEv.push(c));
  return j;
}
// só uma categoria cai, sempre
function sempre(j, cat) { Object.keys(j.cfg.chance).forEach((k) => { j.cfg.chance[k] = 1; }); j.cfg.chanceMax = 1; j.cfg.categorias = { [cat]: 1 }; }
const perto = (x, alvo, tol, m) => assert.ok(Math.abs(x - alvo) <= tol, (m || '') + ': ' + x + ' longe de ' + alvo);

test('itens: catálogo com 31 equipamentos, 2 poções e uma comidinha por comida da config; cada arena tem todo slot', () => {
  const j = jogo(), C = j.R.ItensCatalogo;
  assert.strictEqual(C.equipamentos().length, 31);
  igual(C.daArena('bosque', 'pocao').map((d) => d.id), ['pocao-pequena']);
  igual(C.daArena('gelo', 'pocao').map((d) => d.id), ['pocao-pequena', 'pocao-grande']);
  igual(C.daArena('vulcao', 'comida').map((d) => d.id), j.R.config.comidas.map((c) => 'comida-' + c.id));
  const bolo = C.def('comida-bolo');
  assert.strictEqual(bolo.fome, 100);
  assert.strictEqual(bolo.icone, '🎂');
  assert.strictEqual(C.def('comida-maca').peso, j.R.config.itens.pesoComida.maca);
  ['bosque', 'pantano', 'gelo', 'dunas', 'cristal', 'vulcao'].forEach((a) => {
    const slots = new Set(C.daArena(a, 'equip').map((d) => d.slot));
    igual([...slots].sort(), ['armadura', 'botas', 'cabeca', 'escudo', 'espada'], a);
  });
  assert.ok(C.daArena('vulcao', 'equip').filter((d) => d.id.endsWith('-dragao')).length === 5, 'o conjunto do Dragão no Vulcão');
  assert.strictEqual(C.NOMES_RARIDADE.epico, 'Épico');
  assert.throws(() => C.registrar({ id: 'espada-gelo', nome: 'x', tipo: 'espada', slot: 'espada', raridade: 'raro', arenas: ['gelo'] }), /repetido/);
  assert.throws(() => C.registrar({ id: 'chapeu-x', nome: 'x', tipo: 'chapeu', slot: 'chapeu', raridade: 'raro', arenas: ['gelo'] }), /slot/);
});

test('itens: chance por tipo (mosca = voador, tipo desconhecido = fácil), com Sorte e teto', () => {
  const j = jogo();
  perto(j.D.chance('bosque', 'facil'), 0.12, 1e-9);
  perto(j.D.chance('vulcao', 'facil'), 0.12, 1e-9, 'igual em todas as arenas');
  perto(j.D.chance('bosque', 'mosca'), 0.30, 1e-9);
  perto(j.D.chance('bosque', 'qualquer'), 0.12, 1e-9);
  j.It.vestir(j.It.ganhar('chapeu-coroa').uid);
  perto(j.D.chance('bosque', 'facil'), 0.15, 1e-9, 'Sorte +25%');
  perto(j.D.chance('bosque', 'voador'), 0.375, 1e-9);
  j.cfg.chance.voador = 0.45;
  perto(j.D.chance('bosque', 'voador'), 0.5, 1e-9, 'teto chanceMax');
});

test('itens: o vencido grava na hora; mochila cheia vai ao baú; estrelas também gravam', () => {
  const j = jogo();
  sempre(j, 'equip');
  j.R.util.emit(j.R.EVENTOS.BOSQUE, { tipo: 'vencido', id: 'f1', fantasma: 'facil', arena: 'vulcao' });
  const ev = j.itensEv.pop();
  assert.strictEqual(ev.tipo, 'ganhou');
  assert.ok(ev.id.endsWith('-dragao'), 'no Vulcão cai o conjunto do Dragão: ' + ev.id);
  assert.strictEqual(ev.arena, 'vulcao');
  assert.strictEqual(j.lido().itens[ev.uid].id, ev.id, 'não gravou na hora do drop');
  for (let i = 0; i < 19; i++) j.It.ganhar('espada-madeira');
  const r = j.D.aoVencer({ id: 'f2', fantasma: 'medio', arena: 'bosque' });
  assert.strictEqual(r.onde, 'bau');
  assert.strictEqual(j.lido().itens[r.uid].onde, 'bau');
  // estrelas: n do [min, max] da arena, no campo de sempre
  sempre(j, 'estrelas');
  const antes = j.P.estado().estrelas.ganhas;
  const e = j.D.aoVencer({ id: 'f3', fantasma: 'dificil', arena: 'cristal' });
  assert.ok(e.estrelas >= 2 && e.estrelas <= 3);
  assert.strictEqual(j.lido().estrelas.ganhas, antes + e.estrelas);
  igual(j.itensEv.pop(), { tipo: 'estrelas', n: e.estrelas, arena: 'cristal', x: null, y: null });
  // sem arena na carga (o Bosque de antes): vale o bosque
  sempre(j, 'pocao');
  assert.strictEqual(j.D.aoVencer({ id: 'f4', fantasma: 'mosca' }).item, 'pocao-pequena');
  // nada caiu: não grava
  j.cfg.chance.facil = 0; j.cfg.chanceMax = 0;
  const n = j.contagem.salvar;
  assert.strictEqual(j.D.aoVencer({ id: 'f5', fantasma: 'facil', arena: 'bosque' }), null);
  assert.strictEqual(j.contagem.salvar, n);
});

test('itens: raridade e repetido: os novos saem mais', () => {
  const j = jogo();
  sempre(j, 'equip');
  const conta = (n) => { const c = {}; for (let i = 0; i < n; i++) { const r = j.D.rolar('bosque', 'facil'); c[r.item] = (c[r.item] || 0) + 1; } return c; };
  const N = 20000;
  let c = conta(N);
  // no Bosque: 6 comuns (60) e 1 raro (28)
  perto(c['chapeu-bruxinha'] / N, 28 / 388, 0.012, 'raro');
  perto(c['espada-madeira'] / N, 60 / 388, 0.015, 'comum');
  j.It.ganhar('espada-madeira');
  c = conta(N);
  perto(c['espada-madeira'] / N, 18 / 346, 0.01, 'repetido');
});

test('itens: modo congelado estável e sem gastar o Math.random', () => {
  function congelado() {
    const j = jogo();
    const usos = {};
    j.R.congelado = true;
    j.R.sorteioDaChave = (k) => {   // o mesmo formato do nucleo/congelar.js: semente = chave + nº de usos
      const u = usos[k] = (usos[k] || 0) + 1;
      let s = 0;
      for (const ch of k + ':' + u) s = (Math.imul(s, 31) + ch.charCodeAt(0)) | 0;
      return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    };
    const M = Object.create(Math);
    M.random = () => { throw new Error('gastou o Math.random'); };
    j.ctx.Math = M;
    return j;
  }
  const seq = (j) => { const l = []; for (let i = 0; i < 300; i++) l.push(j.D.aoVencer({ id: 'f' + i, fantasma: 'voador', arena: 'gelo' })); return l; };
  const a = congelado(), b = congelado();
  const la = seq(a), lb = seq(b);
  igual(la, lb);
  assert.ok(la.filter(Boolean).length > 50, 'quase nada caiu');
  igual(a.P.estado().itens, b.P.estado().itens);
});

test('itens: 10.000 inimigos do Bosque dão perto de 17 drops a cada 100 (conta do §12)', () => {
  const j = jogo();
  const quantos = { facil: 5, medio: 4, dificil: 3, mosca: 2 }, tipos = [];
  Object.keys(quantos).forEach((t) => { for (let i = 0; i < quantos[t]; i++) tipos.push(t); });
  const N = 10000, cat = { equip: 0, pocao: 0, comida: 0, estrelas: 0 };
  let drops = 0;
  for (let i = 0; i < N; i++) {
    const r = j.D.rolar('bosque', tipos[i % tipos.length]);
    if (!r) continue;
    drops++;
    if (r.estrelas) cat.estrelas++;
    else cat[j.R.ItensCatalogo.def(r.item).tipo === 'pocao' ? 'pocao' : j.R.ItensCatalogo.def(r.item).tipo === 'comida' ? 'comida' : 'equip']++;
  }
  perto(drops / N, 0.171, 0.02, 'drops por inimigo');
  perto(cat.equip / drops, 0.35, 0.05, 'equipamentos');
  perto(cat.pocao / drops, 0.30, 0.05, 'poções');
  perto(cat.comida / drops, 0.23, 0.05, 'comidinhas');
  perto(cat.estrelas / drops, 0.12, 0.04, 'estrelas');
});
