// O retrato de um objeto que fala (o desenho dele no balão) tem de acompanhar o progresso, como o desenho da cena.
// Hoje interiores-toque.js guarda o retrato em E.retratos na 1ª vez e nunca refaz: no Baú, o "Monte de moedas"
// tocado com R$ 0 continua vazio no balão depois de ela ganhar dinheiro (a cena já mostra o monte maior).
// Mesmo caso: mural da Escola, estante de medalhas do Castelo, vitrines da Loja, ninho do Estábulo. Save sintético.
const { test } = require('node:test');
const assert = require('assert');
const Jogo = require('../../jogo-no-node.js');

// canvas de mentira: guarda quem desenhou nele (o ctx aceita qualquer chamada)
function paFalso() {
  let n = 0;
  function novoCanvas(w, h) {
    const c = { id: ++n, width: w, height: h };
    const alvo = { canvas: c, getImageData: (x, y, ww, hh) => ({ data: new Uint8ClampedArray(ww * hh * 4) }), measureText: () => ({ width: 0 }) };
    const ctx = new Proxy(alvo, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
    c.getContext = () => ctx;
    return c;
  }
  return { novoCanvas, APARENCIA_PADRAO: { pele: '#f1c7a3', cabelo: '#5a3825', roupa: '#ff7eb6', laco: '#ffd34d' },
    contornar: (c) => c, iconeEmoji: () => null, cor: { escurecer: (c) => c, clarear: (c) => c, misturar: (a) => a } };
}

test('o retrato do Monte de moedas no balão mostra o dinheiro de agora', async () => {
  const guardado = {};
  const ctx = Jogo.contexto({ console, Math, Date, JSON, Promise, setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
    localStorage: { getItem: (k) => (k in guardado ? guardado[k] : null), setItem: (k, v) => { guardado[k] = String(v); }, removeItem() {} },
    location: { protocol: 'file:', search: '' }, document: { hidden: false, addEventListener() {} }, addEventListener() {}, PA: paFalso() });
  Jogo.carregar(ctx, Jogo.ordemDosPredios(Jogo.scripts()));
  const R = ctx.Reino, P = R.Progresso;
  P.carregar();
  // cada desenho do monte: em que canvas e com quanto dinheiro
  const lib = R.Interiores.OBJETOS['bau-monte'], desenhos = [], original = lib.desenhar;
  lib.desenhar = function (c, px, py, o, PP) { desenhos.push({ canvas: c.canvas, cent: Math.round(P.dinheiroTotal() * 100) }); return original.apply(this, arguments); };
  const retratos = [];
  R.Claude = { falar: (t, op) => { retratos.push(op.quem.retrato); return Promise.resolve(null); } };

  const cena = R.Interiores.cena('bau');
  await cena.preparar();
  const it = cena._objetos.find((x) => x.o.tipo === 'bau-monte');
  const tocar = () => cena.alvoEm(it.px + it.W / 2, it.py + 8).agir();
  await tocar();
  assert.strictEqual(desenhos.filter((d) => d.canvas === retratos[0]).pop().cent, 0, '1º toque: monte vazio');

  // ela faz duas salas de História: o monte cresce na cena
  const h = R.materias.find((m) => m.id === 'historia');
  h.salas.slice(0, 2).forEach((s) => { P.estado().salas[s.id] = { vezes: 1, melhor: 5, feita: 1750100000000 }; });
  R.util.emit(R.EVENTOS.PROGRESSO);
  await cena.preparar();
  const agora = Math.round(P.dinheiroTotal() * 100);
  assert.ok(agora > 0);
  await tocar();
  const ultimo = desenhos.filter((d) => d.canvas === retratos[1]).pop();
  assert.strictEqual(ultimo.cent, agora, 'o retrato do 2º toque é desenhado com o dinheiro de agora');
});
