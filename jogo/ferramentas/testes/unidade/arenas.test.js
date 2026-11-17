// Testes de unidade: as arenas (js/motor/interiores-arena.js, docs/contratos/arenas.md). O motor do Bosque vale em qualquer
// arena com os números dela: o passo puro numa arena de mentira (tipos, vida e força diferentes, o voador), os ninhos
// por zona, o evento com a arena; o Bosque continua igual (mesmos números, mesmos ninhos com ou sem o registro). E o
// contrato de cada arena registrada no jogo: interior, lugar com portal, números, desenho dos 4 tipos (no Pântano).
// Rodar: node --test jogo/ferramentas/testes/unidade/arenas.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const Jogo = require('../../jogo-no-node');

function montar(nomes) {
  const ctx = Jogo.contexto({ console, Math, Date, setTimeout, clearTimeout, Promise });
  Jogo.carregar(ctx, Jogo.scripts({ nomes: nomes || ['nucleo/config', 'nucleo/registros', 'nucleo/modulos', 'nucleo/util', 'nucleo/eventos', 'arte/desenho', 'motor/interiores-arena', 'sistemas/bosque-combate', 'sistemas/bosque-alvo'] }));
  return { R: ctx.Reino, ctx, BC: ctx.Reino.BosqueCombate };
}
function tudo() {
  const ctx = Jogo.contexto({ console, Math, Date, setTimeout, clearTimeout, Promise });
  Jogo.carregar(ctx, Jogo.scripts({}));
  return ctx.Reino;
}
const T = 16;
const MAPA = {
  comodo: { x: 1, y: 1, w: 54, h: 40 }, spawn: { x: 28, y: 39 },
  solido: (x, y) => x < 1 || y < 3 || x > 54 || y > 40 || (x % 7 === 0 && y % 5 === 0),
};
const longe = () => ({ x: 28 * T + 8, y: 39 * T + 12, olharX: 0, olharY: -1 });
function andar(BC, est, ms, j) { for (let t = 0; t < ms; t += 16) BC.passo(est, 16, j); }
const casas = (e) => e.fantasmas.map((f) => f.tipo + '@' + f.casaX + ',' + f.casaY).join(' ');

test('arenas: cfg da arena = a do Bosque com a dela por cima; o Bosque usa só config.fantasmas', () => {
  const { R } = montar();
  assert.strictEqual(R.Arenas.cfg('bosque'), R.config.fantasmas, 'o mesmo objeto: nada muda no Bosque');
  const c = R.Arenas.cfg('pantano'), A = R.config.arenas.pantano;
  assert.strictEqual(c.tipos, A.tipos);
  assert.strictEqual(c.quantos, A.quantos);
  assert.strictEqual(c.visao, A.visao);
  assert.strictEqual(c.jogador, R.config.fantasmas.jogador, 'o jogador é o do Bosque');
  assert.strictEqual(c.voltaMs, R.config.fantasmas.voltaMs);
  assert.deepStrictEqual(Object.keys(c.tipos), ['facil', 'medio', 'dificil', 'voador']);
  // registro: id repetido é recusado; molde torto lança erro
  assert.strictEqual(R.registrarArena({ id: 'x1', nome: 'X', emoji: '👻' }), true);
  assert.strictEqual(R.registrarArena({ id: 'x1' }), false);
  assert.throws(() => R.registrarDesenhoInimigo('x1-facil', { linhas: ['K.', 'KKK'], paleta: { K: '#3a2446' } }));
  assert.throws(() => R.registrarDesenhoInimigo('x1-facil', { linhas: ['KK'], paleta: { K: '#3a2446' }, pisca: { 0: 'K' } }));
  assert.strictEqual(R.registrarDesenhoInimigo('x1-facil', { linhas: ['KK', 'KK'], paleta: { K: '#3a2446' } }), true);
  assert.throws(() => R.registrarDesenhoInimigo('x1-facil', { linhas: ['KK'], paleta: { K: '#3a2446' } }), /repetido/);
  assert.ok(R.Arenas.desenho('x1', 'facil'));
  assert.strictEqual(R.Arenas.daCena({ tipo: 'interior', id: 'x1' }), 'x1');
  assert.strictEqual(R.Arenas.daCena({ tipo: 'mapa', id: 'mapa' }), null);
});

test('arenas: o passo puro numa arena com outros números (vida, força, voador que conta 2) e o Bosque igual', () => {
  const { R, BC } = montar();
  const c = R.Arenas.cfg('pantano');
  const est = BC.novoEstado(MAPA, c);
  est.arena = 'pantano';
  const total = c.quantos.facil + c.quantos.medio + c.quantos.dificil + c.quantos.voador;
  assert.strictEqual(est.fantasmas.length, total);
  est.fantasmas.forEach((f) => {
    const ty = Math.floor(f.casaY / T), z = c.zonas[f.tipo];
    assert.ok(ty >= z[0] && ty <= z[1], f.id + ' fora da zona ' + f.tipo);
    assert.strictEqual(f.vida, c.tipos[f.tipo].vida);
  });
  // o toque tira a força do tipo da arena
  est.parados = true;
  const f = est.fantasmas.find((x) => x.tipo === 'medio'), j = { x: f.x, y: f.y + 2, olharX: 0, olharY: -1, vidaMax: 30 };
  BC.passo(est, 16, j);
  assert.strictEqual(est.vida, 30 - c.tipos.medio.forca);
  // o golpe precisa de mais golpes que no Bosque (vida maior); o vencido leva a arena no evento
  const v = est.fantasmas.find((x) => x.tipo === 'voador');
  let golpes = 0;
  while (v.estado !== 'sumindo' && golpes < 100) {
    est.recargaAte = 0; v.estado = v.estado === 'recuando' ? 'vagando' : v.estado; v.x = v.casaX; v.y = v.casaY;
    BC.golpear(est, { x: v.x, y: v.y + 10, olharX: 0, olharY: -1, dano: 1 }); golpes++;
  }
  assert.strictEqual(golpes, c.tipos.voador.vida);
  est.eventos.length = 0;
  andar(BC, est, c.vencidoMs + 50, longe());
  const ev = est.eventos.find((e) => e.tipo === 'vencido');
  assert.deepStrictEqual([ev.id, ev.fantasma, ev.arena], [v.id, 'voador', 'pantano']);
  // o Bosque: os mesmos ninhos com ou sem o registro das arenas (e sem `arena` no evento do estado puro)
  const sem = montar(['nucleo/config', 'nucleo/registros', 'nucleo/modulos', 'nucleo/util', 'nucleo/eventos', 'arte/desenho', 'sistemas/bosque-combate']);
  assert.strictEqual(casas(BC.novoEstado(MAPA, R.Arenas.cfg('bosque'))), casas(sem.BC.novoEstado(MAPA, sem.R.config.fantasmas)));
  assert.deepStrictEqual(Object.keys(R.config.fantasmas.tipos), ['facil', 'medio', 'dificil', 'mosca']);
});

test('arenas: no jogo, cada arena tem o seu estado; a cena de uma arena qualquer liga o combate', () => {
  const { R, ctx, BC } = montar();
  R.registrarArena({ id: 'bosque' }); R.registrarArena({ id: 'pantano' });
  R.Bosque = { vidaMax: () => 10, dano: () => 1, temEspada: () => true };
  const def = { spawn: MAPA.spawn, comodos: [{ rect: MAPA.comodo }] };
  const cenas = { bosque: { id: 'bosque', tipo: 'interior', grade: {}, def, solido: MAPA.solido },
    pantano: { id: 'pantano', tipo: 'interior', grade: {}, def, solido: MAPA.solido },
    casa: { id: 'casa', tipo: 'interior', grade: {}, def, solido: MAPA.solido } };
  let atual = cenas.casa;
  R.Cena = { atual: () => atual, bloqueado: () => false };
  ctx.Jogador = { x: 28 * T + 8, y: 39 * T + 12, olharX: 0, olharY: -1, tile: () => ({ x: 28, y: 39 }) };
  R.modulo('bosque-combate').iniciar({});
  const camada = R.modulo('bosque-combate').camada, pintor = { escala: 2, cam: { x: 0, y: 0 }, ctx: null, ret() {}, sprite() {} };
  assert.strictEqual(camada.ativo(), false, 'fora de arena, nada');
  atual = cenas.pantano;
  camada.itensDesenho(pintor, 0, false);
  assert.strictEqual(BC.arena(), 'pantano');
  assert.strictEqual(BC.fantasmas()[0].vida, R.config.arenas.pantano.tipos[BC.fantasmas()[0].tipo].vida);
  const doPantano = R._bosqueCombate.estado;
  atual = cenas.bosque;
  camada.itensDesenho(pintor, 16, false);
  assert.strictEqual(BC.arena(), 'bosque');
  assert.notStrictEqual(R._bosqueCombate.estado, doPantano, 'um estado por arena');
  assert.ok(BC.fantasmas().some((f) => f.tipo === 'mosca'));
  atual = cenas.pantano;
  camada.itensDesenho(pintor, 32, false);
  assert.strictEqual(R._bosqueCombate.estado, doPantano, 'e o do pântano fica guardado');
});

test('arenas do jogo: interior, lugar com portal 1×1 na borda, números completos e desenhos do Pântano', () => {
  const R = tudo();
  // as 6 arenas do mapa (portal na borda da cidade) e os 3 bosques de dentro do Bosque (portais dentro da arena; arenas.md §8)
  const DO_MAPA = ['bosque', 'cristal', 'dunas', 'gelo', 'pantano', 'vulcao'];
  const DE_DENTRO = ['lua', 'neblina', 'orvalho'];
  const ids = R.Arenas.ids();
  assert.deepStrictEqual(Array.from(ids).sort(), DO_MAPA.concat(DE_DENTRO).sort());
  DO_MAPA.forEach((id) => {
    const a = R.Arenas.def(id), d = R.Interiores.def(id), l = R.lugaresRegistrados.find((x) => x.id === id);
    assert.ok(a.nome && a.emoji, id + ': nome e emoji');
    assert.ok(d && d.lugar === id && d.entrada && d.fundo && d.pacote, id + ': interior de entrada com fundo e pacote');
    assert.deepStrictEqual([d.tamanho.w, d.tamanho.h, d.spawn.x, d.spawn.y, d.saida.x, d.saida.y], [56, 44, 28, 39, 28, 40], id + ': o contrato das arenas');
    assert.ok(l && l.rect.w === 1 && l.rect.h === 1 && l.caminho.length && /^portal-/.test(l.sprite), id + ': portal 1×1 com caminho');
    const r = l.rect;
    assert.ok(r.x <= 2 || r.x >= 53 || r.y <= 3 || r.y >= 38, id + ': na borda da cidade, colado na floresta');
    numerosDaArena(R, id);
    if (id !== 'bosque') {
      assert.ok(R.config.arenas[id].nivel > 1, id + ': nível recomendado');
      assert.match(l.menu.info(), /^Nível recomendado: \d+$/);
    }
  });
  // os 3 bosques de dentro do Bosque: interior com lugar 'bosque', sem tapete de saída (a volta é o portal) e sem lugar no mapa
  DE_DENTRO.forEach((id) => {
    const a = R.Arenas.def(id), d = R.Interiores.def(id);
    assert.ok(a.nome && a.emoji, id + ': nome e emoji');
    assert.ok(d && d.lugar === 'bosque' && !d.entrada && d.fundo === id && d.pacote, id + ': interior de dentro do Bosque');
    assert.strictEqual(d.saida, undefined, id + ': sem tapete de saída (volta pelo portal)');
    assert.deepStrictEqual([d.tamanho.w, d.tamanho.h, d.spawn.x, d.spawn.y], [56, 44, 28, 39], id + ': o contrato das arenas de dentro do Bosque');
    assert.strictEqual(R.lugaresRegistrados.find((x) => x.id === id), undefined, id + ': não é lugar do mapa');
    numerosDaArena(R, id);
    assert.ok(R.config.arenas[id].nivel > 20, id + ': nível recomendado');
    // o portal no Bosque, a placa do nível, a escada de ida, o portal de volta e a escada de volta (pareadas)
    const bosque = R.Interiores.def('bosque');
    assert.ok(bosque.objetos.some((o) => o.tipo === 'bosque-portal-' + id), id + ': o portal novo no Bosque');
    assert.ok(bosque.objetos.some((o) => o.tipo === 'bosque-placa-' + id), id + ': a placa do nível no Bosque');
    assert.ok(d.objetos.some((o) => o.tipo === id + '-portal-volta'), id + ': o portal de volta na floresta');
    const ida = bosque.escadas.filter((e) => e.para === id), volta = d.escadas.filter((e) => e.para === 'bosque');
    assert.strictEqual(ida.length, 1, id + ': uma escada no Bosque');
    assert.strictEqual(volta.length, 1, id + ': uma escada de volta para o Bosque');
    assert.strictEqual(ida[0].sentido, 'portal', id + ': sentido portal');
    // os 4 desenhos próprios dos monstros (contorno K, até 17 × 20)
    ['facil', 'medio', 'dificil', 'voador'].forEach((t) => {
      const m = R.Arenas.desenho(id, t);
      assert.ok(m, id + '-' + t + ': desenho próprio');
      assert.ok(m.linhas.length <= 20 && m.linhas[0].length <= 17, id + '-' + t + ': até 17 × 20');
      assert.strictEqual(m.paleta.K, '#3a2446', id + '-' + t + ': contorno');
    });
  });
  // de dentro do Bosque: mais fortes que o Vulcão (o mapa mais forte de hoje) e crescendo de floresta em floresta
  const ORDEM = ['vulcao', 'orvalho', 'neblina', 'lua'];
  ORDEM.slice(1).forEach((id, i) => ['facil', 'medio', 'dificil', 'voador'].forEach((t) => {
    const a = R.Arenas.cfg(ORDEM[i]).tipos[t], b = R.Arenas.cfg(id).tipos[t];
    assert.ok(b.vida > a.vida && b.forca >= a.forca && b.xp > a.xp, id + ' ' + t + ' mais forte que ' + ORDEM[i]);
  }));
  ORDEM.forEach((id, i) => assert.ok(!i || R.config.arenas[id].nivel > R.config.arenas[ORDEM[i - 1]].nivel, id + ': nível recomendado crescente'));
  ['facil', 'medio', 'dificil', 'voador'].forEach((t) => {
    const m = R.Arenas.desenho('pantano', t);
    assert.ok(m, 'pantano-' + t);
    assert.ok(m.linhas.length <= 20 && m.linhas[0].length <= 17, 'pantano-' + t + ': até 17 × 20');
    assert.strictEqual(m.paleta.K, '#3a2446', 'contorno');
  });
});

// os números de uma arena: os 4 tipos com vida, força, velocidade, mortos e XP; quantos e zona de cada um
function numerosDaArena(R, id) {
  const c = R.Arenas.cfg(id);
  Object.keys(c.tipos).forEach((t) => {
    const n = c.tipos[t];
    ['vida', 'forca', 'velocidade', 'mortos', 'xp'].forEach((k) => assert.ok(n[k] > 0, id + ' ' + t + '.' + k));
    assert.ok(c.quantos[t] > 0 && c.zonas[t], id + ' ' + t + ': quantos e zona');
  });
}
