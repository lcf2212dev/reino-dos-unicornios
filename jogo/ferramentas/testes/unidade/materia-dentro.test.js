// Matéria dentro de um prédio que já existe (lugar.dentro + lugar.interior; mundo/mapa.js): o mapa sai
// idêntico com e sem ela (nem as clareiras das outras mudam de lugar) e Mapa.lugares() ganha a entrada do
// menu com a porta do anfitrião. Matéria SINTÉTICA, do próprio teste.
// Rodar (em jogo/): node --test ferramentas/testes/unidade/materia-dentro.test.js
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const Jogo = require('../../jogo-no-node');
const Lugares = require('../../validar/lugares-do-mapa');

const DENTRO = { id: 'sintetica', lugar: { nome: 'Sala Sintética', artigo: 'a', dentro: 'observatorio', interior: 'observatorio-9' } };

function materias() {
  const ctx = Jogo.contexto({ console: { warn() {}, log() {} } });
  return Jogo.carregar(ctx, Jogo.scripts({ nomes: ['nucleo/config', 'nucleo/registros'], grupos: ['materias'] })).Reino.materias || [];
}
// o mapa num vm: grades, lugares desenhados e Mapa.lugares()
function mapa(mats) {
  const g = vm.createContext({ Reino: { lugaresRegistrados: [] } });
  g.window = g;
  ['arte/desenho', 'mundo/mapa', 'mundo/lugares'].forEach((n) => vm.runInContext(fs.readFileSync(Jogo.arquivo(n), 'utf8'), g, { filename: n }));
  g.Mapa.criar(mats);
  const I = g.Mapa._interno;
  return { grades: JSON.stringify([I.tipo, I.solido, I.decor, I.tipoSorteio, I.decorSorteio]),
    desenhados: JSON.stringify(I.lugares), todos: JSON.parse(JSON.stringify(g.Mapa.lugares())), Mapa: g.Mapa };
}

test('matéria "dentro" não muda nada no mapa (nem na frente das outras)', () => {
  const mats = materias().filter((m) => !(m.lugar && m.lugar.dentro));
  const sem = mapa(mats);
  // no começo da lista: se contasse na vez das clareiras, deslocaria as outras
  const com = mapa([DENTRO].concat(mats));
  assert.strictEqual(com.grades, sem.grades);
  assert.strictEqual(com.desenhados, sem.desenhados);
  // e o validador vê os mesmos lugares com área no mapa
  const ctx = (ms) => ({ Reino: { materias: ms, lugaresRegistrados: [] } });
  assert.strictEqual(JSON.stringify(Lugares.todos(ctx([DENTRO].concat(mats)))), JSON.stringify(Lugares.todos(ctx(mats))));
});

test('Mapa.lugares() tem a entrada do menu com a porta do anfitrião', () => {
  const m = mapa([DENTRO]);
  const l = m.todos.find((x) => x.id === 'materia:sintetica');
  const obs = m.todos.find((x) => x.id === 'observatorio');
  assert.ok(l && obs);
  assert.strictEqual(l.tipo, 'materia');
  assert.strictEqual(l.materiaId, 'sintetica');
  assert.strictEqual(l.dentro, 'observatorio');
  assert.strictEqual(l.interior, 'observatorio-9');
  assert.deepStrictEqual(l.porta, obs.porta);
  // a porta do mapa continua sendo a do Observatório (pisar nela entra no térreo)
  assert.strictEqual(m.Mapa.portaEm(obs.porta.x, obs.porta.y).id, 'observatorio');
  assert.strictEqual(m.Mapa.lugar('materia:sintetica').dentro, 'observatorio');
});

test('anfitrião inexistente: fica fora do menu (o validador acusa)', () => {
  const m = mapa([{ id: 'perdida', lugar: { nome: 'X', dentro: 'nao-existe', interior: 'x' } }]);
  assert.ok(!m.todos.some((x) => x.id === 'materia:perdida'));
});
