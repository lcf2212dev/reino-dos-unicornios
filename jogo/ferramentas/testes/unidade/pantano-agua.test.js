// Testes de unidade: água andável nos interiores (docs/contratos/cena-e-motor.md §10, arenas.md §6): as lagoas do
// Pântano (fundura dentro, na margem e fora; tiles de água fora da trilha e da zona segura, sem sólido, alcançáveis;
// caminho por terra primeiro), o Jogador.fundura de um interior com água, o do mapa da cidade igual (Mapa.fundura do
// lago de verdade na mesma rampa) e os inimigos do chão fora da água (o voador passa por cima).
// Rodar: node --test jogo/ferramentas/testes/unidade/pantano-agua.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const Jogo = require('../../jogo-no-node');

const T = 16;
let _tudo = null;
function tudo() {
  if (_tudo) return _tudo;
  const ctx = Jogo.contexto({ console: { warn() {}, log() {}, error() {} }, Math, Date, setTimeout, clearTimeout, Promise });
  Jogo.carregar(ctx, Jogo.scripts({}));
  return (_tudo = ctx.Reino);
}
// a rampa do Jogador.fundura: 12 px da margem até a água funda (smoothstep)
function rampa(px) { const d = px / 12; return d <= 0 ? 0 : d >= 1 ? 1 : d * d * (3 - 2 * d); }
// só personagens/jogador.js num vm, com a cena de agora e o Mapa de mentira (ou o de verdade)
function jogador(cenaAtual, mapa, montado) {
  const ctx = {
    Math, console,
    Mapa: mapa || { T },
    PA: { vistaDaDirecao: () => ({ vista: 'frente', espelhar: false }) },
    Reino: {
      util: { reduzMovimentoSistema: false },
      config: { nado: { fator: 0.6 } },
      Progresso: { estado: () => ({ ajustes: { animacoes: true }, unis: { u: { xp: montado ? 999 : 0 } }, usando: {} }), montaria: () => 'u' },
      Unicornios: { estagio: (xp) => (xp > 100 ? 2 : 0) },
      Cena: cenaAtual === undefined ? undefined : { atual: () => cenaAtual },
    },
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  const arq = Jogo.arquivo('personagens/jogador');
  vm.runInContext(fs.readFileSync(arq, 'utf8'), ctx, { filename: arq });
  return ctx.Jogador;
}

test('pântano: as lagoas têm água funda no meio, margem perto de 0 e nada longe delas', () => {
  const R = tudo(), P = R._predios.pantano;
  assert.ok(P.LAGOAS.length >= 4 && P.LAGOAS.length <= 6, 'de 4 a 6 lagoas');
  P.LAGOAS.forEach((l) => {
    const e = l.e[0];
    assert.ok(P.fundura(e.cx, e.cy) >= 16, 'lagoa ' + l.n + ': funda no meio');
    assert.ok(P.agua(Math.floor(e.cx / T), Math.floor(e.cy / T)), 'lagoa ' + l.n + ': o tile do meio é água');
    // na ponta da esquerda (a elipse que vai mais longe), a margem: perto de 0 (a onda da margem mexe 1,5 px)
    const p = l.e.reduce((a, b) => (b.cx - b.rx < a.cx - a.rx ? b : a));
    assert.ok(Math.abs(P.fundura(p.cx - p.rx, p.cy)) <= 3, 'lagoa ' + l.n + ': margem da esquerda ~0');
    assert.ok(P.fundura(p.cx - p.rx - 6, p.cy) < 0, 'lagoa ' + l.n + ': 6 px fora é terra (beira de lama)');
    const agua = [];
    for (let y = l.y; y < l.y + l.h; y++) for (let x = l.x; x < l.x + l.w; x++) if (P.agua(x, y)) agua.push(x + ',' + y);
    assert.ok(agua.length >= 8, 'lagoa ' + l.n + ': pelo menos 8 tiles de água (' + agua.length + ')');
  });
  assert.strictEqual(P.fundura(28 * T + 8, 39 * T + 12), -8, 'no spawn: longe de toda lagoa');
  assert.strictEqual(P.agua(28, 39), false);
});

test('pântano: a água é andável, fora da trilha e da zona segura, alcançável, e o caminho prefere a terra', () => {
  const R = tudo(), P = R._predios.pantano, def = R.Interiores.def('pantano');
  assert.ok(def.agua && def.agua.tile === P.agua && def.agua.fundura === P.fundura, 'o interior declara a água');
  const g = R.Interiores.grade(def), seg = R.config.fantasmas.zonaSegura + 1;
  // as 6 caixas entram no layout (enfeite plano, nada em cima)
  P.LAGOAS.forEach((l) => assert.ok(def.objetos.some((o) => o.tipo === 'pantano-lagoa-' + (l.n + 1) && o.x === l.x && o.y === l.y), 'lagoa ' + l.n + ' no layout'));
  const cena = R.Interiores.cena('pantano');
  const aguas = [];
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
    if (!cena.agua(x, y)) continue;
    aguas.push({ x, y });
    assert.ok(g.chao[y][x] && !g.solido[y][x], x + ',' + y + ': água é chão andável');
    assert.ok(!P.trilha(x, y), x + ',' + y + ': água fora da passarela');
    assert.ok(Math.abs(x - def.spawn.x) > seg || Math.abs(y - def.spawn.y) > seg, x + ',' + y + ': fora da zona segura');
    // nada além da própria lagoa ocupa o tile de água
    const donos = def.objetos.filter((o) => { const d = R.Interiores.dimensoes(o); return x >= o.x && x < o.x + d.w && y >= o.y && y < o.y + d.h; });
    assert.strictEqual(donos.map((o) => o.tipo.replace(/-\d+$/, '')).join(' '), 'pantano-lagoa', x + ',' + y + ': só a lagoa');
  }
  assert.ok(aguas.length > 40);
  // a cena: fundura = a do def; tile fora do interior não é água
  assert.strictEqual(cena.fundura(100, 200), P.fundura(100, 200));
  assert.strictEqual(cena.agua(-1, 5), false);
  // toda água se alcança do spawn (nadando)
  aguas.forEach((a) => assert.ok(cena.caminho(def.spawn, a), a.x + ',' + a.y + ': alcançável'));
  // destino em terra do outro lado da lagoa de baixo: vai por terra; destino na água: chega nadando
  const B = P.LAGOAS[1], alem = { x: B.x + B.w, y: B.y + 2 };
  const porTerra = cena.caminho(def.spawn, alem);
  assert.ok(porTerra && porTerra.length, 'há caminho até ' + alem.x + ',' + alem.y);
  assert.ok(porTerra.every((t) => !cena.agua(t.x, t.y)), 'o caminho até a terra não molha os pés');
  const meio = { x: Math.floor(B.e[0].cx / T), y: Math.floor(B.e[0].cy / T) };
  const nadando = cena.caminho(def.spawn, meio);
  assert.strictEqual(JSON.stringify(nadando[nadando.length - 1]), JSON.stringify(meio));
  // de dentro da água para a terra: sai nadando (sem caminho seco a partir da água funda)
  assert.ok(cena.caminho(meio, def.spawn), 'sai da lagoa');
  // interior sem água: nem agua nem fundura (como sempre)
  const outro = R.Interiores.cena('bosque');
  assert.strictEqual(outro.agua, undefined);
  assert.strictEqual(outro.fundura, undefined);
});

test('jogador: fundura num interior com água (dentro, margem, fora) e sem água; nadando mais devagar', () => {
  // água à direita de x = 100 (px)
  const cena = { tipo: 'interior', agua: (tx) => tx * T + 8 > 100, fundura: (x) => x - 100, solido: () => false };
  const J = jogador(cena);
  assert.strictEqual(J.fundura(90, 50), 0, 'fora');
  assert.strictEqual(J.fundura(100, 50), 0, 'na linha da margem');
  assert.strictEqual(J.fundura(106, 50), rampa(6), 'na rampa da margem');
  assert.ok(J.fundura(106, 50) > 0 && J.fundura(106, 50) < 1);
  assert.strictEqual(J.fundura(140, 50), 1, 'dentro, funda');
  J.posicionar(10, 3);
  assert.strictEqual(J.nadando(), true);
  assert.ok(Math.abs(J.velocidade() - 58 * 0.6) < 1e-9, 'a pé, nadando: 58 × 0,6');
  J.posicionar(2, 3);
  assert.strictEqual(J.nadando(), false);
  assert.strictEqual(J.velocidade(), 58);
  // interior sem água: 0, mesmo com o Mapa.fundura existindo; antes de a cena existir (o Mapa): 0, como antes
  const mapaFalso = { T, fundura: () => 99, agua: () => true, solido: () => false };
  assert.strictEqual(jogador({ tipo: 'interior', solido: () => false }, mapaFalso).fundura(140, 50), 0);
  assert.strictEqual(jogador(undefined, mapaFalso).fundura(140, 50), 0);
});

test('jogador: o mapa da cidade igual (Mapa.fundura do lago de verdade, na mesma rampa; sem agua, 0)', () => {
  const R = tudo();
  const g = vm.createContext({ Reino: { lugaresRegistrados: [] } });
  g.window = g;
  ['arte/desenho', 'mundo/mapa', 'mundo/lugares', 'mundo/mapa-desenho', 'mundo/lago'].forEach((n) =>
    vm.runInContext(fs.readFileSync(Jogo.arquivo(n), 'utf8'), g, { filename: n }));
  g.Mapa.criar(R.materias || []);
  const M = g.Mapa, L = M.CIDADE.lago;
  const cenaMapa = { tipo: 'mapa', agua: (x, y) => M.agua(x, y), solido: (x, y) => M.solido(x, y) };
  const J = jogador(cenaMapa, M);
  let dentro = 0, margem = 0;
  for (let wy = (L.cy - L.ry - 1) * T; wy <= (L.cy + L.ry + 1) * T; wy += 3) {
    for (let wx = (L.cx - L.rx - 1) * T; wx <= (L.cx + L.rx + 1) * T; wx += 3) {
      const f = J.fundura(wx, wy);
      assert.strictEqual(f, rampa(M.fundura(wx, wy)), wx + ',' + wy);
      if (f === 1) dentro++; else if (f > 0) margem++;
    }
  }
  assert.ok(dentro > 100 && margem > 50, 'o lago tem fundo e margem (' + dentro + ', ' + margem + ')');
  const cx = L.cx * T, cy = L.cy * T;
  assert.strictEqual(J.fundura(cx, cy), 1);
  assert.strictEqual(jogador({ tipo: 'mapa', solido: () => false }, M).fundura(cx, cy), 0, 'cena do mapa sem agua: 0');
  assert.strictEqual(jogador(undefined, M).fundura(cx, cy), 0, 'antes da cena: 0');
});

test('inimigos: os do chão nascem e andam fora da água; o voador passa por cima', () => {
  const R = tudo(), BC = R.BosqueCombate;
  const c = R.Arenas.cfg('pantano');
  const aguaEm = (x, y) => x >= 10 && x <= 46 && ((y >= 29 && y <= 33) || (y >= 17 && y <= 21) || (y >= 5 && y <= 8));
  const mapa = { comodo: { x: 1, y: 1, w: 54, h: 40 }, spawn: { x: 28, y: 39 }, agua: aguaEm,
    solido: (x, y) => x < 1 || y < 3 || x > 54 || y > 40 };
  const est = BC.novoEstado(mapa, c);
  est.fantasmas.forEach((f) => {
    if (f.tipo === 'voador') return;
    assert.ok(!aguaEm(Math.floor(f.casaX / T), Math.floor(f.casaY / T)), f.id + ' (' + f.tipo + ') nasceu fora da água');
  });
  // ela parada no meio da água, perto de um do chão: ele vem até a margem e não entra
  const f = est.fantasmas.find((x) => x.tipo === 'facil');
  f.x = f.casaX = 20 * T + 8; f.y = f.casaY = 27 * T + 12;
  est.fantasmas = [f];
  const ela = { x: 20 * T + 8, y: 31 * T + 12, olharX: 0, olharY: -1 };
  for (let t = 0; t < 4000; t += 16) {
    BC.passo(est, 16, ela);
    assert.ok(!aguaEm(Math.floor(f.x / T), Math.floor(f.y / T)), 'o do chão não entra na água (t=' + t + ')');
  }
  assert.ok(f.y > 27 * T + 12, 'ele chegou mais perto, pela terra');
  // o voador entra
  const v = BC.novoEstado(mapa, c).fantasmas.find((x) => x.tipo === 'voador');
  v.x = v.casaX = 20 * T + 8; v.y = v.casaY = 27 * T + 12;
  const est2 = BC.novoEstado(mapa, c);
  est2.fantasmas = [v];
  let molhou = false;
  for (let t = 0; t < 4000 && !molhou; t += 16) { BC.passo(est2, 16, ela); molhou = aguaEm(Math.floor(v.x / T), Math.floor(v.y / T)); }
  assert.ok(molhou, 'o voador passa por cima da água');
});

test('inimigo do chão voltando para casa com a lagoa no meio não trava na margem', () => {
  const R = tudo(), BC = R.BosqueCombate;
  const def = R.Interiores.def('pantano'), cena = R.Interiores.cena('pantano');
  const mapa = { comodo: def.comodos[0].rect, spawn: def.spawn, solido: cena.solido, agua: cena.agua };
  const est = BC.novoEstado(mapa, R.Arenas.cfg('pantano'));
  const f = est.fantasmas[0]; est.fantasmas = [f];
  f.x = 43.9 * T; f.y = 38.2 * T; f.estado = 'voltando';   // atrás da lagoa 2, longe de casa (achado do conferente)
  const ela = { x: 28 * T + 8, y: 39 * T + 12, olharX: 0, olharY: -1 };
  for (let t = 0; t < 20000; t += 16) BC.passo(est, 16, ela);
  assert.notStrictEqual(f.estado, 'voltando');
  assert.ok(!cena.agua(Math.floor(f.x / T), Math.floor(f.y / T)), 'continua fora da água');
});
