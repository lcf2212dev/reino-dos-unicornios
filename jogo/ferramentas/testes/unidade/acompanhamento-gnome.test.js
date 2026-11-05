// Testes de unidade: o resumo dia a dia da extensão do GNOME (jogo/ferramentas/gnome), com save SINTÉTICO.
// Rodar: node --test jogo/ferramentas/testes/unidade/acompanhamento-gnome.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const os = require('os');

const R = () => import(path.join(__dirname, '../../gnome/extensao/resumo.js'));
const D = (s) => new Date(s).getTime();

function save() {
  return {
    estrelas: { ganhas: 10, gastas: 0 },
    salas: { c1: { feita: D('2026-11-03T10:00'), melhor: 5, perfeita: true, vezes: 1 }, x9: { feita: D('2026-11-04T09:00'), vezes: 2 } },
    provas: { p1: { tentativas: 1, melhor: 9, premioEm: D('2026-11-04T15:00') } },
    unis: { inicial: { em: D('2026-01-01T00:00'), xp: 5 }, 'c-brotinho': { em: D('2026-11-03T11:00'), nome: '', chocado: true } },
    cuidados: { inicial: { acaoFome: D('2026-11-04T16:00'), acaoSede: 0, acaoBanho: D('2026-11-03T18:00') } },
    tempoUsos: { [D('2026-11-04T17:00') + '-ab']: 10, [D('2026-11-04T19:00') + '-cd']: 5, 'lixo': 3 },
    despensa: { cenoura: { compradas: 3, usadas: 1 } },
  };
}
const nomes = { materias: { ciencias: 'Ciências' }, salas: { c1: { nome: 'Plantas', materia: 'ciencias' } }, provas: { p1: 'Revisão' }, unis: { inicial: 'Estrelinha', 'c-brotinho': 'Brotinho' } };

test('acompanhamento: eventos com carimbo caem no dia certo, do mais novo ao mais velho', async () => {
  const { resumir } = await R();
  const dias = resumir(save(), {}, nomes, D('2026-11-05T08:00'));
  assert.deepStrictEqual(dias.map((d) => d.dia), ['2026-11-04', '2026-11-03']);
  const d3 = dias[1].linhas.join('\n');
  assert.match(d3, /Plantas \(Ciências\) \(perfeita/);
  assert.match(d3, /unicórnio Brotinho/);
  assert.match(d3, /banho em Estrelinha/);
  const d4 = dias[0].linhas.join('\n');
  assert.match(d4, /sala x9/);
  assert.match(d4, /Revisão: nota 9/);
  assert.match(d4, /15 min de tempo de celular/);
  assert.doesNotMatch(d4 + d3, /água/);
});

test('acompanhamento: o diário só guarda números e as diferenças viram linhas do dia', async () => {
  const { atualizarDiario, resumir } = await R();
  const s = save();
  let diario = atualizarDiario({}, s, D('2026-11-04T20:00'));
  const s2 = save(); s2.estrelas.ganhas = 13; s2.salas.c1.vezes = 3; s2.despensa.cenoura.usadas = 2;
  diario = atualizarDiario(diario, s2, D('2026-11-05T20:00'));
  assert.deepStrictEqual(Object.keys(diario), ['2026-11-04', '2026-11-05']);
  assert.ok(!JSON.stringify(diario).includes('feita'), 'o diário não guarda o save');
  const hoje = resumir(s2, diario, nomes, D('2026-11-05T21:00'))[0];
  assert.strictEqual(hoje.dia, '2026-11-05');
  assert.match(hoje.linhas.join('\n'), /Ganhou 3 estrelas/);
  assert.match(hoje.linhas.join('\n'), /Jogou salas 2x: Plantas \(Ciências\) ×2/);
  assert.match(hoje.linhas.join('\n'), /Deu 1 comida aos/);
});

test('acompanhamento: save estragado não quebra', async () => {
  const { resumir, atualizarDiario } = await R();
  const ruim = { salas: { a: null, b: { feita: 'x' } }, unis: 7, tempoUsos: null, estrelas: { ganhas: NaN } };
  assert.deepStrictEqual(resumir(ruim, atualizarDiario({}, ruim, Date.now()), {}, Date.now()), []);
});

test('acompanhamento: o instalador monta a extensão com os nomes do jogo', () => {
  const { montar } = require('../../gnome/instalar.js');
  const destino = fs.mkdtempSync(path.join(os.tmpdir(), 'reino-gnome-'));
  montar(destino);
  const n = JSON.parse(fs.readFileSync(path.join(destino, 'nomes.json'), 'utf8'));
  assert.strictEqual(n.unis.inicial, 'Estrelinha');
  assert.ok(Object.keys(n.salas).length > 10);
  const meta = JSON.parse(fs.readFileSync(path.join(destino, 'metadata.json'), 'utf8'));
  assert.ok(meta['shell-version'].includes('50'));
});

test('acompanhamento: diário com buraco, entrada nula, estado nulo, texto e Novo ciclo', async () => {
  const { resumir, contagens } = await R();
  assert.deepStrictEqual(contagens(null).salas, {});
  assert.deepStrictEqual(resumir(null, { '2026-11-01': null, '2026-11-02': {} }, {}, D('2026-11-05T08:00')), []);
  const diario = { '2026-11-01': { estrelas: '50', salas: { a: 5 } }, '2026-11-04': { estrelas: 52, salas: { a: 1 } } };
  const l = resumir({}, diario, {}, D('2026-11-05T08:00'))[0].linhas.join('\n');
  assert.match(l, /Ganhou 2 estrelas/);
  assert.match(l, /Jogou salas 1x: a/);
});

test('acompanhamento: o instalador monta o app do dock (.desktop, ícone, resumo)', () => {
  const { montarApp, APP_ID } = require('../../gnome/instalar.js');
  const t = fs.mkdtempSync(path.join(os.tmpdir(), 'reino-gnome-app-'));
  montarApp(path.join(t, 'app'), path.join(t, 'apl'), path.join(t, 'ico'));
  for (const f of ['main.js', 'resumo.js', 'nomes.json']) assert.ok(fs.existsSync(path.join(t, 'app', f)), f);
  assert.ok(fs.existsSync(path.join(t, 'ico', APP_ID + '.png')));
  const d = fs.readFileSync(path.join(t, 'apl', APP_ID + '.desktop'), 'utf8');
  assert.match(d, /^Exec=gjs -m .*main\.js$/m);
  assert.match(d, new RegExp('^Icon=' + APP_ID + '$', 'm'));
});
