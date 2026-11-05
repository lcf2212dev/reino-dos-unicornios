// Testes de unidade: o combate do Bosque dos Fantasmas (js/sistemas/bosque-combate.js; docs/contratos/bosque.md §5).
// O passo é puro: estado de um mapa de mentira, dt explícito (ms), nada de Cena nem DOM. Golpe tira vida, vencido
// emite evento, desmaio, volta depois de voltaMs, nada se move com a cena bloqueada, zona segura e ninhos por zona.
// O ataque por alvo (js/sistemas/bosque-alvo.js): anda até o alcance, golpeia a cada recarga, segue quem foge e para.
// Rodar (em jogo/): node --test ferramentas/testes/unidade/bosque-combate.test.js   (tudo: npm test, na raiz)
const { test } = require('node:test');
const assert = require('assert');
const Jogo = require('../../jogo-no-node');

function montar() {
  const ctx = Jogo.contexto({ console, Math, Date, setTimeout, clearTimeout, Promise });
  Jogo.carregar(ctx, Jogo.scripts({ nomes: ['nucleo/config', 'nucleo/registros', 'nucleo/modulos', 'nucleo/util', 'nucleo/eventos', 'arte/desenho', 'sistemas/bosque-combate', 'sistemas/bosque-alvo'] }));
  return { R: ctx.Reino, ctx, BC: ctx.Reino.BosqueCombate, cfg: ctx.Reino.config.fantasmas };
}
// o Bosque do contrato: 56 × 44, cômodo (1, 1, 54, 40), spawn (28, 39); árvores sólidas em algumas casas
const MAPA = {
  comodo: { x: 1, y: 1, w: 54, h: 40 }, spawn: { x: 28, y: 39 },
  solido: (x, y) => x < 1 || y < 3 || x > 54 || y > 40 || (x % 7 === 0 && y % 5 === 0),
};
const T = 16;
const longe = () => ({ x: 28 * T + 8, y: 39 * T + 12, olharX: 0, olharY: -1 });   // no spawn (zona segura)
function perto(f, dx = 0, dy = 10) { return { x: f.x + dx, y: f.y + dy, olharX: 0, olharY: -1 }; }   // logo abaixo, olhando para ele
function andar(BC, est, ms, j) { for (let t = 0; t < ms; t += 16) BC.passo(est, 16, typeof j === 'function' ? j() : j); }

test('ninhos: quantos de cada tipo, na zona do tipo, em tile livre e fora da zona segura; sempre iguais', () => {
  const { BC, cfg } = montar();
  const est = BC.novoEstado(MAPA, cfg);
  const total = cfg.quantos.facil + cfg.quantos.medio + cfg.quantos.dificil + cfg.quantos.mosca;
  assert.strictEqual(est.fantasmas.length, total);
  est.fantasmas.forEach((f) => {
    const tx = Math.floor(f.casaX / T), ty = Math.floor(f.casaY / T), z = cfg.zonas[f.tipo];
    assert.ok(ty >= z[0] && ty <= z[1], f.id + ' fora da zona ' + f.tipo);
    assert.ok(!MAPA.solido(tx, ty), f.id + ' num tile sólido');
    assert.ok(Math.abs(tx - 28) > cfg.zonaSegura || Math.abs(ty - 39) > cfg.zonaSegura, f.id + ' na zona segura');
    assert.strictEqual(f.vida, cfg.tipos[f.tipo].vida);
  });
  // a mosca feia: o 4º tipo, mais vida/força/velocidade e vale 2 inimigos mortos
  assert.strictEqual(cfg.quantos.mosca, 2);
  assert.strictEqual(Array.from(cfg.zonas.mosca).join(','), '3,10');
  assert.strictEqual(cfg.tipos.mosca.mortos, 2);
  assert.ok(cfg.tipos.mosca.vida > cfg.tipos.dificil.vida && cfg.tipos.mosca.forca > cfg.tipos.dificil.forca && cfg.tipos.mosca.velocidade > cfg.tipos.dificil.velocidade);
  assert.strictEqual(est.fantasmas.filter((f) => f.tipo === 'mosca').length, 2);
  assert.ok(est.fantasmas.filter((f) => f.tipo === 'mosca').every((f) => Math.floor(f.casaY / T) <= 10));
  const casas = (e) => e.fantasmas.map((f) => f.casaX + ',' + f.casaY).join(' ');
  assert.strictEqual(casas(BC.novoEstado(MAPA, cfg)), casas(est));
});

test('golpe: tira vida (dano), respeita a recarga e o alcance; vida zero some num puf e emite vencido', () => {
  const { BC, cfg } = montar();
  const est = BC.novoEstado(MAPA, cfg);
  est.parados = true;
  const f = est.fantasmas.find((x) => x.tipo === 'medio');
  const j = Object.assign(perto(f), { dano: 1 });
  assert.strictEqual(BC.golpear(est, j), true);
  assert.strictEqual(f.vida, cfg.tipos.medio.vida - 1);
  assert.ok(est.eventos.some((e) => e.tipo === 'golpe' && e.acertou === 1));
  assert.strictEqual(BC.golpear(est, j), false, 'golpeou antes da recarga');
  andar(BC, est, cfg.jogador.recargaMs, j);
  // longe demais: golpeia, mas não acerta
  const vida = f.vida;
  BC.golpear(est, { x: f.x, y: f.y + cfg.jogador.alcance + 5, olharX: 0, olharY: -1, dano: 1 });
  assert.strictEqual(f.vida, vida);
  // de costas para ele (fora do encostar): não acerta
  andar(BC, est, cfg.jogador.recargaMs, j);
  BC.golpear(est, { x: f.x, y: f.y + 15, olharX: 0, olharY: 1, dano: 1 });
  assert.strictEqual(f.vida, vida);
  // dano grande: vence; o evento só sai depois do puf (vencidoMs)
  est.eventos.length = 0;
  andar(BC, est, cfg.jogador.recargaMs, j);
  BC.golpear(est, Object.assign(perto(f), { dano: 99 }));
  assert.strictEqual(f.estado, 'sumindo');
  andar(BC, est, cfg.vencidoMs - 50, longe());
  assert.ok(!est.eventos.some((e) => e.tipo === 'vencido'), 'vencido antes do puf');
  andar(BC, est, 100, longe());
  const ev = est.eventos.filter((e) => e.tipo === 'vencido');
  assert.strictEqual(ev.map((e) => e.id + ':' + e.fantasma).join(' '), f.id + ':medio');
  assert.strictEqual(f.estado, 'vencido');
});

test('vencido volta só depois de devolver(id) + voltaMs, com a vida cheia', () => {
  const { BC, cfg } = montar();
  const est = BC.novoEstado(MAPA, cfg);
  est.parados = true;
  const f = est.fantasmas[0];
  BC.golpear(est, Object.assign(perto(f), { dano: 99 }));
  andar(BC, est, cfg.vencidoMs + 50, longe());
  andar(BC, est, cfg.voltaMs + 1000, longe());
  assert.strictEqual(f.estado, 'vencido', 'voltou sem devolver');
  assert.strictEqual(BC.devolverNo(est, f.id), true);
  assert.strictEqual(BC.devolverNo(est, 'f999'), false);
  andar(BC, est, cfg.voltaMs - 100, longe());
  assert.strictEqual(f.estado, 'esperando');
  andar(BC, est, 200, longe());
  assert.strictEqual(f.estado, 'surgindo');
  andar(BC, est, cfg.vencidoMs + 50, longe());
  assert.strictEqual(f.estado, 'vagando');
  assert.strictEqual(f.vida, f.max);
  assert.deepStrictEqual([f.x, f.y], [f.casaX, f.casaY]);
});

test('toque tira vida (força do tipo), invencível um tempo, regenera; vida zero = desmaio', () => {
  const { BC, cfg } = montar();
  const est = BC.novoEstado(MAPA, cfg);
  est.parados = true;
  const f = est.fantasmas.find((x) => x.tipo === 'dificil');
  const j = { x: f.x, y: f.y + 2, olharX: 0, olharY: -1, vidaMax: 10 };
  BC.passo(est, 16, j);
  assert.strictEqual(est.vida, 10 - cfg.tipos.dificil.forca);
  // invencível: outro toque não tira
  f.estado = 'vagando'; f.x = j.x; f.y = j.y;
  BC.passo(est, 16, j);
  assert.strictEqual(est.vida, 10 - cfg.tipos.dificil.forca);
  // regenera: nada antes de regenSemDanoMs; depois, 1 a cada regenACadaMs
  const longeJ = Object.assign(longe(), { vidaMax: 10 });
  andar(BC, est, cfg.jogador.regenSemDanoMs - 200, longeJ);
  assert.strictEqual(est.vida, 10 - cfg.tipos.dificil.forca);
  andar(BC, est, 400, longeJ);
  assert.strictEqual(est.vida, 10 - cfg.tipos.dificil.forca + 1);
  andar(BC, est, cfg.jogador.regenACadaMs, longeJ);
  assert.strictEqual(est.vida, 10 - cfg.tipos.dificil.forca + 2);
  // até zerar: desmaio (evento) e nada mais anda
  est.eventos.length = 0;
  for (let i = 0; i < 10 && !est.desmaiado; i++) {
    est.invencivelAte = 0; f.estado = 'vagando'; f.x = j.x; f.y = j.y;
    BC.passo(est, 16, j);
  }
  assert.strictEqual(est.vida, 0);
  assert.strictEqual(est.desmaiado, true);
  assert.ok(est.eventos.some((e) => e.tipo === 'desmaio'));
  assert.strictEqual(BC.golpear(est, j), false, 'golpeou desmaiada');
  BC.reiniciarEstado(est);
  assert.strictEqual(est.vida, est.max);
  assert.strictEqual(est.desmaiado, false);
  assert.deepStrictEqual([f.x, f.y], [f.casaX, f.casaY]);
});

test('persegue dentro da visão, preso pela coleira, e nunca entra na zona segura', () => {
  const { BC, cfg } = montar();
  const est = BC.novoEstado(MAPA, cfg);
  // o fácil mais acima (longe da zona segura), com ela logo acima dele
  const f = est.fantasmas.filter((x) => x.tipo === 'facil').sort((a, b) => a.casaY - b.casaY)[0];
  const j = { x: f.x, y: f.y - (cfg.visao - 20), olharX: 0, olharY: 1, vidaMax: 10 };
  const antes = Math.abs(j.y - f.y);
  BC.passo(est, 50, j);
  assert.strictEqual(f.estado, 'perseguindo');
  assert.ok(Math.abs(j.y - f.y) < antes);
  // ela foge para longe: o fantasma não passa da coleira (+ um passo)
  let maior = 0;
  for (let t = 0; t < 20000; t += 50) {
    j.x = Math.min(j.x + 1.5, 53 * T); est.invencivelAte = 1e12;
    BC.passo(est, 50, j);
    maior = Math.max(maior, Math.hypot(f.x - f.casaX, f.y - f.casaY));
  }
  assert.ok(maior <= cfg.coleira + 3, 'passou da coleira: ' + maior);
  // ela no spawn: ninguém entra na zona segura, por mais tempo que passe
  const sp = longe(), Z = est.segura;
  andar(BC, est, 30000, Object.assign(sp, { vidaMax: 10 }));
  est.fantasmas.forEach((x) => assert.ok(!(x.x >= Z.x0 && x.x < Z.x1 && x.y >= Z.y0 && x.y < Z.y1), x.id + ' na zona segura'));
  assert.strictEqual(est.vida, 10);
});

test('zona segura: na borda dela, por dentro, nenhum toque chega (o fantasma fica a mais de raioToque)', () => {
  const { BC, cfg } = montar();
  const est = BC.novoEstado(MAPA, cfg), Z = est.segura;
  // ela parada em cada canto e no meio de cada borda, por dentro; os fantasmas correm atrás de quem está por perto
  const pontos = [[Z.x0, Z.y0], [Z.x1 - 0.5, Z.y0], [Z.x0, Z.y1 - 0.5], [Z.x1 - 0.5, Z.y1 - 0.5],
    [(Z.x0 + Z.x1) / 2, Z.y0], [Z.x0, (Z.y0 + Z.y1) / 2], [Z.x1 - 0.5, (Z.y0 + Z.y1) / 2]];
  for (const [x, y] of pontos) {
    // alguns fantasmas trazidos para logo fora, vagando com o alvo bem em cima dela (a borda os segura)
    est.fantasmas.forEach((f, i) => {
      if (i % 4) return;
      f.x = f.casaX = x + (x < 450 ? -30 : 30); f.y = f.casaY = y - 30;
      f.estado = 'vagando'; f.pausa = false; f.alvoX = x; f.alvoY = y;
    });
    andar(BC, est, 4000, { x, y, olharX: 0, olharY: 1, vidaMax: 10 });
    est.fantasmas.forEach((f) => {
      assert.ok(Math.hypot(f.x - x, f.y - y) > cfg.raioToque, f.id + ' encostou nela dentro da zona segura em ' + x + ',' + y);
    });
  }
  assert.strictEqual(est.vida, 10, 'levou toque dentro da zona segura');
  assert.ok(!est.eventos.some((e) => e.tipo === 'vida' && e.n < 10));
});

test('no jogo: congela com a cena bloqueada ou tela aberta; ativo só no Bosque; atacar pela API', () => {
  const { R, ctx, BC } = montar();
  let bloq = false, tela = false;
  const grade = {};
  const cena = { id: 'bosque', tipo: 'interior', grade, def: { spawn: MAPA.spawn, comodos: [{ rect: MAPA.comodo }] }, solido: MAPA.solido };
  R.Cena = { atual: () => cena, bloqueado: () => bloq };
  R.UI = { temTela: () => tela };
  ctx.Jogador = { x: 28 * T + 8, y: 39 * T + 12, olharX: 0, olharY: -1, tile: () => ({ x: 28, y: 39 }) };
  const eventos = [];
  R.util.on(R.EVENTOS.BOSQUE, (e) => eventos.push(e));
  const camada = R.modulo('bosque-combate').camada;
  assert.strictEqual(camada.ativo(), true);
  const pintor = { escala: 2, cam: { x: 0, y: 0 }, ctx: null, ret() {}, sprite() {} };
  camada.itensDesenho(pintor, 0, true);
  const est = R._bosqueCombate.estado;
  assert.ok(est && est.fantasmas.length > 0);
  const pos = () => JSON.stringify(BC.fantasmas());
  for (let t = 16; t < 3000; t += 16) camada.itensDesenho(pintor, t, true);
  const tAntes = est.t;
  // bloqueada: nada anda (nem o relógio do combate)
  bloq = true;
  const fotos = pos();
  for (let t = 3000; t < 8000; t += 16) camada.itensDesenho(pintor, t, true);
  assert.strictEqual(pos(), fotos);
  assert.strictEqual(est.t, tAntes);
  assert.strictEqual(BC.atacar(), false, 'atacou bloqueada');
  bloq = false; tela = true;
  for (let t = 8000; t < 9000; t += 16) camada.itensDesenho(pintor, t, true);
  assert.strictEqual(pos(), fotos);
  tela = false;
  // atacar: golpe com evento; ninguém perto no spawn
  assert.strictEqual(BC.atacar(), true);
  assert.ok(eventos.some((e) => e.tipo === 'golpe' && e.acertou === 0));
  assert.deepStrictEqual(JSON.parse(JSON.stringify(BC.vida())), { n: 10, max: 10 });
  // fora do Bosque: inativo e atacar não faz nada
  cena.id = 'casa';
  assert.strictEqual(camada.ativo(), false);
  assert.strictEqual(BC.atacar(), false);
});

test('modo congelado: fantasmas parados no ninho (foto do e2e estável)', () => {
  const { R, ctx, BC } = montar();
  R.congelado = true;
  const cena = { id: 'bosque', tipo: 'interior', grade: {}, def: { spawn: MAPA.spawn, comodos: [{ rect: MAPA.comodo }] }, solido: MAPA.solido };
  R.Cena = { atual: () => cena, bloqueado: () => false };
  ctx.Jogador = { x: 28 * T + 8, y: 39 * T + 12, olharX: 0, olharY: -1 };
  const camada = R.modulo('bosque-combate').camada, pintor = { escala: 2, cam: { x: 0, y: 0 }, ctx: null, ret() {}, sprite() {} };
  for (let t = 0; t < 10000; t += 16) camada.itensDesenho(pintor, t, false);
  R._bosqueCombate.estado.fantasmas.forEach((f) => assert.deepStrictEqual([f.x, f.y], [f.casaX, f.casaY]));
  assert.ok(BC.fantasmas().every((f) => f.estado === 'vagando'));
});

test('no jogo: vida máxima e dano lidos só com ponto/acerto e ao entrar; vencido preso volta a esperar ao entrar', () => {
  const { R, ctx, BC, cfg } = montar();
  let lidas = 0, vidaMax = 10;
  R.Bosque = { vidaMax: () => { lidas++; return vidaMax; }, dano: () => 1, temEspada: () => true };
  const cena = { id: 'bosque', tipo: 'interior', grade: {}, def: { spawn: MAPA.spawn, comodos: [{ rect: MAPA.comodo }] }, solido: MAPA.solido };
  R.Cena = { atual: () => cena, bloqueado: () => false };
  ctx.Jogador = { x: 28 * T + 8, y: 39 * T + 12, olharX: 0, olharY: -1, tile: () => ({ x: 28, y: 39 }) };
  R.modulo('bosque-combate').iniciar({});
  const camada = R.modulo('bosque-combate').camada, pintor = { escala: 2, cam: { x: 0, y: 0 }, ctx: null, ret() {}, sprite() {} };
  for (let t = 0; t < 2000; t += 16) camada.itensDesenho(pintor, t, false);
  assert.ok(lidas <= 2, 'leu a vida máxima a cada quadro: ' + lidas);
  // ponto em Vida: relê no próximo quadro e a vida nova já vem cheia
  vidaMax = 12;
  R.util.emit(R.EVENTOS.BOSQUE, { tipo: 'ponto' });
  camada.itensDesenho(pintor, 2016, false);
  assert.strictEqual(BC.vida().n + '/' + BC.vida().max, '12/12');
  // vencido sem devolver: ao entrar no Bosque vinda de fora, depois de vencidoPresoMs, volta a esperar
  const est = R._bosqueCombate.estado, f = est.fantasmas[0], g = est.fantasmas[1];
  f.estado = 'vencido'; g.estado = 'vencido';
  R._bosqueCombate.vencidoEm[f.id] = Date.now() - cfg.vencidoPresoMs - 1000;
  R._bosqueCombate.vencidoEm[g.id] = Date.now();
  const antes = lidas;
  R.util.emit(R.EVENTOS.CENA, { de: 'mapa', para: 'bosque' });
  assert.strictEqual(f.estado, 'esperando', 'o preso não foi solto');
  assert.strictEqual(g.estado, 'vencido', 'soltou o que ainda espera a pergunta');
  assert.ok(lidas > antes, 'não releu ao entrar');
});

// o ataque por alvo, quadro a quadro: ela anda (v px/s) até onde seguirAlvo manda e o passo roda depois
function atacarAte(BC, est, j, fim, ms = 20000, v = 58) {
  const golpes = [];
  for (let t = 0; t < ms && !fim(); t += 16) {
    BC.passo(est, 16, j);
    const r = BC.seguirAlvo(est, j);
    if (!r) break;
    if (r.golpeou) golpes.push({ t: est.t, d: Math.hypot(r.x - j.x, r.y - j.y) });
    if (r.andar) {
      const dx = r.x - j.x, dy = r.y - j.y, d = Math.hypot(dx, dy), p = v * 0.016;
      j.x += dx / d * Math.min(p, d); j.y += dy / d * Math.min(p, d);
    }
  }
  return golpes;
}

test('ataque por alvo: anda até o alcance, golpeia a cada recarga, segue quem foge e para no vencido', () => {
  const { BC, cfg } = montar();
  const cj = cfg.jogador;
  const est = BC.novoEstado(MAPA, cfg);
  est.parados = true;
  const f = est.fantasmas.find((x) => x.tipo === 'medio');
  // a caixa do toque: no corpo dele (acima dos pés) acerta; longe, não
  assert.strictEqual(BC.fantasmaEm(est, f.x, f.y - 12), f);
  assert.strictEqual(BC.fantasmaEm(est, f.x + 30, f.y - 12), null);
  const j = { x: f.x, y: f.y + 70, olharX: 0, olharY: 1, dano: 1 };
  assert.strictEqual(BC.mirarNo(est, f.id), true);
  // longe: só anda, sem golpe
  const r0 = BC.seguirAlvo(est, j);
  assert.deepStrictEqual([r0.andar, r0.golpeou, r0.x, r0.y], [true, false, f.x, f.y]);
  const golpes = atacarAte(BC, est, j, () => f.estado === 'sumindo');
  assert.strictEqual(f.estado, 'sumindo', 'venceu sozinha');
  assert.strictEqual(golpes.length, cfg.tipos.medio.vida, 'um golpe de dano 1 por vida');
  golpes.forEach((g, i) => {
    assert.ok(g.d <= cj.alcance, 'golpe ' + i + ' no alcance (' + g.d.toFixed(1) + ')');
    if (i) assert.ok(g.t - golpes[i - 1].t >= cj.recargaMs, 'golpe ' + i + ' respeita a recarga');
  });
  assert.ok(j.olharY < 0, 'virada para ele (acima dela)');
  // vencido (sumindo): o alvo acaba
  assert.strictEqual(BC.seguirAlvo(est, j), null);
  assert.strictEqual(est.alvo, null);
  assert.strictEqual(BC.mirarNo(est, f.id), false, 'quem some não vira alvo');
});

test('ataque por alvo: segue o fantasma que fugiu; parar (cancelar) e desmaio acabam o ataque', () => {
  const { BC, cfg } = montar();
  const est = BC.novoEstado(MAPA, cfg);
  est.parados = true;
  const f = est.fantasmas.find((x) => x.tipo === 'dificil');
  const j = { x: f.x, y: f.y + 15, olharX: 0, olharY: 1, dano: 1 };
  BC.mirarNo(est, f.id);
  assert.strictEqual(BC.seguirAlvo(est, j).golpeou, true, 'no alcance: golpe na hora');
  // fugiu para longe: ela vai atrás (andar até onde ele está agora), sem golpe
  f.x += 50;
  const r = BC.seguirAlvo(est, j);
  assert.deepStrictEqual([r.andar, r.golpeou, r.x], [true, false, f.x]);
  const antes = f.vida;
  const golpes = atacarAte(BC, est, j, () => f.vida < antes, 3000);
  assert.ok(golpes.length === 1 && Math.hypot(f.x - j.x, f.y - j.y) <= cfg.jogador.alcance, 'alcançou e golpeou de novo');
  // cancelar: nada mais
  BC.pararNo(est);
  assert.strictEqual(BC.seguirAlvo(est, j), null);
  const vida = f.vida;
  BC.passo(est, cfg.jogador.recargaMs + 50, j);
  assert.strictEqual(BC.seguirAlvo(est, j), null);
  assert.strictEqual(f.vida, vida, 'parado: sem golpe');
  // desmaio: o alvo acaba
  BC.mirarNo(est, f.id);
  est.desmaiado = true;
  assert.strictEqual(BC.seguirAlvo(est, j), null);
  assert.strictEqual(est.alvo, null);
});

test('ataque por alvo no jogo: fantasma sobre tile sólido e fora do alcance: um caminho só e ela espera; mudou de tile, vai', () => {
  const { R, ctx, BC, cfg } = montar();
  const est = BC.novoEstado(MAPA, cfg);
  est.parados = true;
  // a jogadora de mentira: segue o caminho a 58 px/s; conta as buscas de caminho
  const J = ctx.Jogador = { x: 14 * T + 8, y: 30 * T + 12, olharX: 0, olharY: 1, caminho: [], aoChegar: null, marcador: null, buscas: 0,
    tile() { return { x: Math.floor(this.x / T), y: Math.floor((this.y - 2) / T) }; },
    irPara(tx, ty) { this.buscas++; this.caminho = [{ x: tx * T + 8, y: ty * T + 12 }]; return true; },
    parar() { this.caminho = []; },
    virar8(dx, dy) { const n = Math.hypot(dx, dy); if (n) { this.olharX = dx / n; this.olharY = dy / n; } } };
  // o livre mais perto do tile sólido fica 3 tiles abaixo (fora do alcance)
  R.Cena = { atual: () => ({ id: 'bosque', solido: MAPA.solido, maisPerto: (tx, ty) => ({ x: tx, y: ty + 3 }) }) };
  R.modulo('bosque-alvo').iniciar();
  const S = R._bosqueCombate;
  S.estado = est;
  const f = est.fantasmas.find((x) => x.tipo === 'medio');
  assert.ok(MAPA.solido(14, 20), 'o tile do fantasma é sólido');
  f.x = 14 * T + 8; f.y = 20 * T + 12;
  const quadros = (n) => {
    for (let i = 0; i < n; i++) {
      const j = { x: J.x, y: J.y, olharX: J.olharX, olharY: J.olharY, dano: 1 };
      BC.passo(est, 16, j);
      S.quadro(est, j);
      const p = J.caminho[0];
      if (p) {
        const dx = p.x - J.x, dy = p.y - J.y, d = Math.hypot(dx, dy), s = 58 * 0.016;
        if (d <= s) { J.x = p.x; J.y = p.y; J.caminho.shift(); } else { J.x += dx / d * s; J.y += dy / d * s; }
      }
    }
  };
  assert.strictEqual(BC.mirarNo(est, f.id), true);
  quadros(180);
  assert.deepStrictEqual(J.tile(), { x: 14, y: 23 }, 'chegou ao livre mais perto');
  assert.strictEqual(J.buscas, 1, 'um caminho só, nada de buscar a cada quadro');
  assert.strictEqual(f.vida, f.max, 'fora do alcance: sem golpe');
  assert.strictEqual(est.alvo, f.id, 'esperando, ainda mirando');
  // ele vai para um tile livre (não vizinho): um caminho novo, depois reto, e ela golpeia
  f.x = 15 * T + 8; f.y = 21 * T + 12;
  quadros(120);
  assert.ok(f.vida < f.max, 'alcançou e golpeou');
  assert.ok(J.buscas <= 2, 'buscas: ' + J.buscas);
  // o resultado é o mesmo objeto a cada quadro (nada criado por quadro)
  assert.strictEqual(BC.seguirAlvo(est, { x: J.x, y: J.y, dano: 1 }), BC.seguirAlvo(est, { x: J.x, y: J.y, dano: 1 }));
});
