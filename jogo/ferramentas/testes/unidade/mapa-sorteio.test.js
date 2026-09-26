// Mapa.criar + enfeites do Mapa.prerender (mundo/mapa.js, mundo/mapa-desenho.js) num vm com um ctx que só anota
// os fillRect: um lugar registrado não muda nenhum pixel de flor/enfeite fora do próprio rect e do caminho.
// E Reino.util.hoje() (nucleo/util.js). Rodar (em jogo/): node --test ferramentas/testes/unidade/mapa-sorteio.test.js
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const Jogo = require('../../jogo-no-node');
const Lugares = require('../../validar/lugares-do-mapa');

function materias() {
  const ctx = Jogo.contexto({ console: { warn() {}, log() {} } });
  return Jogo.carregar(ctx, Jogo.scripts({ nomes: ['nucleo/config', 'nucleo/registros'], grupos: ['materias'] }));
}
// desenha os enfeites do chão e devolve os fillRect de cada tile: { 'x,y': [...] }
function enfeites(registrados, mats) {
  const g = vm.createContext({ Reino: { lugaresRegistrados: registrados } });
  g.window = g;
  ['arte/desenho', 'mundo/mapa', 'mundo/lugares', 'mundo/mapa-desenho'].forEach((n) =>
    vm.runInContext(fs.readFileSync(Jogo.arquivo(n), 'utf8'), g, { filename: n }));
  g.Mapa.criar(mats);
  const T = g.Mapa.T, porTile = {};
  const ctx = { fillStyle: '', fillRect(x, y, w, h) {
    const k = Math.floor(x / T) + ',' + Math.floor(y / T);
    (porTile[k] = porTile[k] || []).push([this.fillStyle, x, y, w, h].join(' '));
  } };
  g.Mapa._interno.desenharEnfeites(ctx);
  return porTile;
}

test('lugar registrado não muda as flores fora do rect e do caminho', () => {
  const R = materias().Reino;
  const mats = R.materias || [];
  const antes = enfeites([], mats);
  // um lugar livre de 4×3 bem em cima, para o deslocamento (se houvesse) chegar em quase todo o reino
  const livres = Lugares.livres(materias(), 4, 3);
  assert.ok(livres.length > 0);
  const l = livres.reduce((a, b) => (b.rect.y < a.rect.y ? b : a));
  const def = Object.assign({ id: 'ninho', nome: 'Ninho', sprite: 'torre' }, l);
  const depois = enfeites([def], mats);
  const dentro = (k) => {
    const [x, y] = k.split(',').map(Number), r = def.rect;
    if (x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h) return true;
    return def.caminho.some((p) => p[0] === x && p[1] === y);
  };
  let fora = 0;
  new Set(Object.keys(antes).concat(Object.keys(depois))).forEach((k) => {
    if (dentro(k)) return;
    fora++;
    assert.deepStrictEqual(depois[k], antes[k], 'tile ' + k);
  });
  assert.ok(fora > 100);
  // e o lugar tirou algo (senão o teste não prova nada)
  assert.ok(Object.keys(antes).some((k) => dentro(k) && !depois[k]), 'o lugar de teste caiu num lugar sem enfeite');
});

test('matéria porCima nova também não mexe nas flores do resto', () => {
  const mats = materias().Reino.materias || [];
  const [livre] = Lugares.livres(materias(), 5, 4);
  const nova = { id: 'nova', lugar: { nome: 'Nova', rect: livre.rect, porCima: true } };
  const antes = enfeites([], mats), depois = enfeites([], mats.concat([nova]));
  const r = livre.rect, px = r.x + Math.floor(r.w / 2);
  Object.keys(antes).forEach((k) => {
    const [x, y] = k.split(',').map(Number);
    if ((x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h) || x === px) return;
    assert.deepStrictEqual(depois[k], antes[k], 'tile ' + k);
  });
});

test('Reino.util.hoje(): aaaa-mm-dd local, segue o relógio (Date virtual)', () => {
  let agora = new Date(2026, 0, 31, 23, 59, 30).getTime();
  const D = function (...a) { return a.length ? new Date(...a) : new Date(agora); };
  D.now = () => agora;
  const ctx = Jogo.contexto({ Date: D });
  Jogo.carregar(ctx, Jogo.scripts({ nomes: ['nucleo/util'] }));
  assert.strictEqual(ctx.Reino.util.hoje(), '2026-01-31');
  agora += 60 * 1000;
  assert.strictEqual(ctx.Reino.util.hoje(), '2026-02-01');
});
