// Testes de unidade: o Parquinho (js/sistemas/parquinho.js, js/interiores/parquinho/; docs/contratos/parquinho.md).
// A fase sai na hora das salas feitas: 3 matérias completas com Matemática ou Língua Portuguesa = 1; todas = 2.
// O jogo inteiro (todos os `node: true`) num vm com save sintético (ajudantes/jogo-save.js); nada toca no save real.
// Rodar: node --test jogo/ferramentas/testes/unidade/parquinho.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { Jogo, montar, saveHoje, copia } = require('./ajudantes/jogo-save');

const igual = (a, b, m) => assert.deepStrictEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)), m);

// 6 matérias do 4º bimestre (2 salas cada) e uma do 3º; os ids seguem os de verdade no começo (matematica…, portugues…)
const MATERIAS = [
  { id: 't-hist3', bimestre: 3, salas: [{ id: 's-h3' }] },
  { id: 'portugues-t', bimestre: 4, salas: [{ id: 's-p1' }, { id: 's-p2' }] },
  { id: 'matematica-t', bimestre: 4, salas: [{ id: 's-m1' }, { id: 's-m2' }] },
  { id: 't-ingles', bimestre: 4, salas: [{ id: 's-i1' }, { id: 's-i2' }] },
  { id: 't-ciencias', bimestre: 4, salas: [{ id: 's-c1' }, { id: 's-c2' }] },
  { id: 't-geo', bimestre: 4, salas: [{ id: 's-g1' }, { id: 's-g2' }] },
  { id: 't-hist', bimestre: 4, salas: [{ id: 's-x1' }, { id: 's-x2' }] },
];
const SALAS = Object.fromEntries(MATERIAS.map((m) => [m.id, m.salas.map((s) => s.id)]));

function jogo() {
  const orig = Jogo.scripts;
  Jogo.scripts = () => orig({});
  let j;
  try { j = montar({ save: saveHoje() }); } finally { Jogo.scripts = orig; }
  j.R.materias.splice(0, j.R.materias.length, ...copia(MATERIAS));
  j.P.carregar();
  return j;
}
function completar(j, ...ids) {
  ids.forEach((m) => SALAS[m].forEach((s) => { j.P.estado().salas[s] = { vezes: 1, melhor: 6, feita: j.relogio.agora }; }));
}

test('parquinho: fase 0 sem matéria completa; matéria pela metade e do 3º bimestre não contam', () => {
  const j = jogo(), Pq = j.R.Parquinho;
  assert.strictEqual(Pq.fase(), 0);
  completar(j, 't-hist3');
  j.P.estado().salas['s-m1'] = { vezes: 1, melhor: 6, feita: j.relogio.agora };   // só metade da Matemática
  assert.strictEqual(Pq.completas().length, 0);
  assert.strictEqual(Pq.fase(), 0);
  assert.strictEqual(Pq.contam().length, 6, 'só as do bimestre >= config.casa.desdeBimestre');
});

test('parquinho: 3 completas sem Matemática nem Língua Portuguesa não abre o portal', () => {
  const j = jogo(), Pq = j.R.Parquinho;
  completar(j, 't-ingles', 't-ciencias', 't-geo');
  assert.strictEqual(Pq.completas().length, 3);
  assert.strictEqual(Pq.fase(), 0);
  igual(Pq.falta(), { fase: 0, completas: 3, precisa: 3, chave: false, total: 6 });
  completar(j, 't-hist');
  assert.strictEqual(Pq.fase(), 0, 'nem com 4 (falta uma de Matemática ou LP)');
});

test('parquinho: 3 completas com Matemática ou com Língua Portuguesa = fase 1; 2 não bastam', () => {
  const a = jogo();
  completar(a, 'matematica-t', 't-ingles');
  assert.strictEqual(a.R.Parquinho.fase(), 0, 'duas não bastam');
  completar(a, 't-geo');
  assert.strictEqual(a.R.Parquinho.fase(), 1);
  assert.strictEqual(a.R.Parquinho.liberado(), true);
  const b = jogo();
  completar(b, 'portugues-t', 't-ciencias', 't-hist');
  assert.strictEqual(b.R.Parquinho.fase(), 1);
});

test('parquinho: todas completas = fase 2 (mais brinquedos)', () => {
  const j = jogo(), Pq = j.R.Parquinho;
  completar(j, 'portugues-t', 'matematica-t', 't-ingles', 't-ciencias', 't-geo');
  assert.strictEqual(Pq.fase(), 1);
  completar(j, 't-hist');
  assert.strictEqual(Pq.fase(), 2);
  assert.strictEqual(Pq.falta().completas, 6);
});

test('parquinho: o lugar só fica liberado com a fase 1 (Reino.lugarLiberado)', () => {
  const j = jogo(), R = j.R;
  const l = R.lugaresRegistrados.find((x) => x.id === 'parquinho');
  assert.ok(l, 'lugar registrado');
  igual(l.rect, { x: 20, y: 20, w: 1, h: 1 });
  assert.strictEqual(R.lugarLiberado(l), false);
  completar(j, 'matematica-t', 't-ingles', 't-geo');
  assert.strictEqual(R.lugarLiberado(l), true);
  assert.strictEqual(R.lugarLiberado({ id: 'outro' }), true, 'sem liberado: aberto');
  assert.strictEqual(R.lugarLiberado({ id: 'x', liberado() { throw new Error('ops'); } }), true, 'erro: aberto');
});

test('parquinho: o interior tem os 7 brinquedos com a ação e uma pose para cada; os da fase 2 são surpresa', () => {
  const R = jogo().R, d = R.Interiores.doLugar('parquinho');
  assert.ok(d && d.id === 'parquinho' && d.entrada);
  const brinquedos = d.objetos.filter((o) => o.acao && o.acao.tipo === 'parquinhoBrincar');
  const ids = brinquedos.map((o) => o.acao.brinquedo).sort();
  igual(ids, ['areia', 'balanco', 'bolinhas', 'carrossel', 'escorregador', 'gangorra', 'pulapula']);
  igual(brinquedos.filter((o) => o.acao.surpresa).map((o) => o.acao.brinquedo).sort(), ['bolinhas', 'carrossel', 'pulapula']);
  igual(R.ParquinhoBrincar.poses().sort(), ids);
  ids.forEach((id) => assert.ok(R.config.parquinho.ms[id] > 0, 'duração de ' + id));
  assert.ok(R.modulo('parquinho').acoes.parquinhoBrincar, 'a ação vem do módulo');
});
