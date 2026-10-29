// Memória dos interiores: só as 4 cenas usadas por último guardam o estático e os sprites dos móveis altos
// (interiores-cena.js, usar/liberar). A que sai é refeita no preparar da próxima visita; a cena ativa nunca sai.
// As listas do jogo vêm de outro contexto do vm: [...] para comparar com deepStrictEqual.
// E o aquecimento dos NPCs: a volta inteira só na 1ª vez de cada sprite. Save sintético (localStorage de mentira).
const { test } = require('node:test');
const assert = require('assert');
const Jogo = require('../../jogo-no-node.js');

// canvas de mentira (o ctx aceita qualquer chamada)
function paFalso() {
  function novoCanvas(w, h) {
    const c = { width: w, height: h };
    const alvo = { canvas: c, getImageData: (x, y, ww, hh) => ({ data: new Uint8ClampedArray(ww * hh * 4) }), measureText: () => ({ width: 0 }) };
    const ctx = new Proxy(alvo, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
    c.getContext = () => ctx;
    return c;
  }
  return { novoCanvas, APARENCIA_PADRAO: { pele: '#f1c7a3', cabelo: '#5a3825', roupa: '#ff7eb6', laco: '#ffd34d' },
    contornar: (c) => c, iconeEmoji: () => null, iconeDesenho: () => null, cor: { escurecer: (c) => c, clarear: (c) => c, misturar: (a) => a } };
}

function carregarJogo() {
  const guardado = {};
  const ctx = Jogo.contexto({ console, Math, Date, JSON, Promise, setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
    localStorage: { getItem: (k) => (k in guardado ? guardado[k] : null), setItem: (k, v) => { guardado[k] = String(v); }, removeItem() {} },
    location: { protocol: 'file:', search: '' }, document: { hidden: false, addEventListener() {} }, addEventListener() {}, PA: paFalso() });
  Jogo.carregar(ctx, Jogo.ordemDosPredios(Jogo.scripts()));
  ctx.Reino.Progresso.carregar();
  return ctx;
}

test('só as 4 cenas usadas por último guardam o estático; a que saiu é refeita na volta', async () => {
  const R = carregarJogo().Reino, I = R.Interiores;
  // seis interiores com móveis altos (os sprites deles também saem da memória)
  const ids = [...R.interiores.map((d) => d.id).filter((id) => I.cena(id)._objetos.some((it) => it.alto)).slice(0, 6)];
  assert.strictEqual(ids.length, 6);
  const cena = (id) => I.cena(id), altos = (id) => cena(id)._objetos.filter((it) => it.alto);
  for (const id of ids.slice(0, 5)) await cena(id).preparar();
  assert.deepStrictEqual([...I._naMemoria()], ids.slice(1, 5), 'a 1ª visitada saiu');
  assert.strictEqual(cena(ids[0])._temEstatico(), false);
  assert.ok(altos(ids[0]).every((it) => it.sprite === null), 'os sprites dos móveis altos dela também saíram');
  assert.ok(altos(ids[4]).every((it) => it.sprite), 'a última tem os sprites prontos');

  // voltou à 1ª: refeita no preparar, e agora sai a 2ª
  await cena(ids[0]).preparar();
  assert.strictEqual(cena(ids[0])._temEstatico(), true);
  assert.ok(altos(ids[0]).every((it) => it.sprite), 'sprites refeitos');
  assert.deepStrictEqual([...I._naMemoria()], [ids[2], ids[3], ids[4], ids[0]]);
  assert.strictEqual(cena(ids[1])._temEstatico(), false);

  // preparar de novo uma cena que está na memória só a põe no fim da fila
  await cena(ids[2]).preparar();
  assert.deepStrictEqual([...I._naMemoria()], [ids[3], ids[4], ids[0], ids[2]]);
});

test('a cena ativa nunca sai da memória', async () => {
  const R = carregarJogo().Reino, I = R.Interiores;
  const ids = [...R.interiores.map((d) => d.id).slice(0, 7)];
  await I.cena(ids[0]).preparar();
  R.Cena = { atual: () => I.cena(ids[0]) };
  for (const id of ids.slice(1)) await I.cena(id).preparar();
  assert.strictEqual(I.cena(ids[0])._temEstatico(), true, 'a ativa ficou');
  assert.strictEqual(I._naMemoria().length, 4);
  assert.deepStrictEqual([...I._naMemoria()], [ids[0], ids[4], ids[5], ids[6]]);
});

test('o aquecimento dos NPCs dá a volta inteira só na 1ª vez; depois, um desenho parado por NPC', async () => {
  const R = carregarJogo().Reino, I = R.Interiores;
  const id = R.interiores.find((d) => (d.npcs || []).length >= 2).id, n = I.cena(id).npcs().length;
  const original = R.NPCs.desenhar;
  let chamadas = 0;
  R.NPCs.desenhar = function () { chamadas++; return original.apply(this, arguments); };
  await I.cena(id).preparar();
  assert.ok(chamadas > n * 100, `1ª vez: a volta inteira (${chamadas} desenhos)`);
  chamadas = 0;
  await I.cena(id).preparar();
  assert.strictEqual(chamadas, n, 'depois: um desenho por NPC');
});
