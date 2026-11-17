// Testes de unidade: os outros bichinhos atacam na arena (js/sistemas/monstros-pets.js; monstros.md §5; pedido de 17/11:
// "todos os pets atacar no modo aventura"): o unicórnio sempre, o ET só se ela levou um, cada um no seu compasso, com a
// fração do dano da espada; parada (desmaio) ou longe não atacam; vencido por eles segue o caminho da espada.
// O jogo inteiro (todos os `node: true`) num vm com save sintético (ajudantes/jogo-save.js); nada toca no save real.
// Rodar: node --test jogo/ferramentas/testes/unidade/monstros-pets.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { Jogo, montar, saveHoje } = require('./ajudantes/jogo-save');

function jogo() {
  const orig = Jogo.scripts;
  Jogo.scripts = () => orig({});
  let j;
  try { j = montar({ save: saveHoje(), agora: Date.UTC(2026, 10, 17) }); } finally { Jogo.scripts = orig; }
  j.P.carregar();
  j.BC = j.R.BosqueCombate; j.S = j.R._monstros; j.V = j.R.Viagem;
  return j;
}
// a luta numa arena (como em monstros.test.js): o 1º inimigo do lado dela
function naArena(j, arena) {
  const C = j.R._bosqueCombate, cfg = j.R.Arenas.cfg(arena);
  const est = j.BC.novoEstado({ comodo: { x: 1, y: 1, w: 54, h: 40 }, spawn: { x: 28, y: 39 },
    solido: (x, y) => x < 1 || y < 3 || x > 54 || y > 40 }, cfg);
  est.arena = arena; est.parados = true;
  C.estado = est; C.estados[arena] = est; C.arena = arena;
  j.BC.arena = () => arena;
  const f = est.fantasmas[0];
  j.ctx.Jogador = { x: f.x + 10, y: f.y, olharX: 0, olharY: -1 };
  return { est, f };
}
const P = (j) => j.R.config.monstros.ajuda.pets;

test('pets: fora da arena ninguém ataca; na arena o unicórnio ataca sozinho, com a fração do dano da espada', () => {
  const j = jogo(), { S, R } = j;
  j.ctx.Jogador = { x: 100, y: 100 };
  S.quadroPets(1000);
  assert.deepStrictEqual(Object.keys(S.tiros), []);
  const { f } = naArena(j, 'pantano');
  f.vida = f.max = 100;
  R.Bosque.dano = () => 10;
  const p = P(j), d = Math.max(1, Math.round(10 * p.unicornio.fator));
  assert.deepStrictEqual(JSON.parse(JSON.stringify(S.petsNaLuta())), ['unicornio'], 'sem ET levado: só o unicórnio');
  S.quadroPets(1000);   // o 1º quadro marca o compasso
  assert.strictEqual(f.vida, f.max, 'espera o compasso dele');
  S.quadroPets(1000 + p.unicornio.recargaMs / 3);
  assert.strictEqual(f.vida, f.max - d);
  const tiro = S.tiros.unicornio;
  assert.ok(tiro && tiro.dano === d && tiro.x === f.x && tiro.y === f.y, 'o tiro vai até o inimigo');
  S.quadroPets(1000 + p.unicornio.recargaMs / 3 + 100);
  assert.strictEqual(f.vida, f.max - d, 'na recarga não ataca');
  S.quadroPets(1000 + p.unicornio.recargaMs / 3 + p.unicornio.recargaMs);
  assert.strictEqual(f.vida, f.max - 2 * d);
  assert.ok(!S.tiros.et, 'sem ET, sem raio');
});

test('pets: o ET levado também ataca, fora do compasso do unicórnio', () => {
  const j = jogo(), { S, R, V } = j;
  const { f } = naArena(j, 'gelo');
  f.vida = f.max = 100000;
  R.Bosque.dano = () => 10;
  V.fazerAmigo('lua-lumi');
  assert.ok(V.escolherCompanheiro('lua-lumi'));
  assert.deepStrictEqual(JSON.parse(JSON.stringify(S.petsNaLuta())), ['unicornio', 'et']);
  const quando = {};
  for (let t = 1000; t <= 1000 + 4000; t += 16) {
    S.quadroPets(t);
    ['unicornio', 'et'].forEach((q) => { if (S.tiros[q] && !quando[q]) quando[q] = S.tiros[q].em; });
  }
  assert.ok(quando.unicornio > 0 && quando.et > 0, 'os dois atacaram: ' + JSON.stringify(quando));
  assert.notStrictEqual(quando.unicornio, quando.et, 'em tempos diferentes');
  assert.strictEqual(S.tiros.et.dano, Math.max(1, Math.round(10 * P(j).et.fator)));
});

test('pets: parada (desmaio) e inimigo longe não atacam; vencido por eles segue o caminho da espada', () => {
  const j = jogo(), { S, R, BC } = j;
  const { est, f } = naArena(j, 'pantano');
  R.Bosque.dano = () => 10;
  const rec = P(j).unicornio.recargaMs;
  // desmaio: a luta parou
  R._bosqueCombate.desmaio = true;
  for (let t = 1000; t <= 1000 + rec * 2; t += 16) S.quadroPets(t);
  assert.ok(!S.tiros.unicornio, 'parada não ataca');
  R._bosqueCombate.desmaio = false;
  // longe (fora do alcance): não ataca
  j.ctx.Jogador = { x: f.x + R.config.monstros.ajuda.alcance + 80, y: f.y };
  const vidas = est.fantasmas.map((x) => x.vida);
  for (let t = 5000; t <= 5000 + rec * 2; t += 16) S.quadroPets(t);
  est.fantasmas.forEach((x, i) => {
    if (Math.hypot(x.x - j.ctx.Jogador.x, x.y - j.ctx.Jogador.y) > R.config.monstros.ajuda.alcance) assert.strictEqual(x.vida, vidas[i]);
  });
  // perto e com 1 de vida: vence; no passo, o 'vencido' de sempre (XP, pergunta e drop)
  j.ctx.Jogador = { x: f.x + 10, y: f.y };
  f.vida = 1;
  for (let t = 10000; t <= 10000 + rec * 2 && f.estado !== 'sumindo'; t += 16) S.quadroPets(t);
  assert.strictEqual(f.estado, 'sumindo');
  for (let i = 0; i < 20 && f.estado === 'sumindo'; i++) BC.passo(est, 50, { x: 0, y: 0, olharX: 0, olharY: 1, vidaMax: 10 });
  assert.strictEqual(f.estado, 'vencido');
  assert.ok(est.eventos.some((e) => e.tipo === 'vencido' && e.id === f.id && e.arena === 'pantano'));
});
