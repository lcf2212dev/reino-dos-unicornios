// Testes de unidade: Treinadores de Monstros (docs/contratos/monstros.md): as espécies, os campos `monstros` e
// `monstroCompanheiro` (ida e volta, mescla com dois aparelhos, limpeza, save antigo), só 1 companheiro (o monstro ou o
// ET), o dano da ajuda, a MonsterBall (podeJogar, gasta 1, sorteio, captura gravada) e o combate (ferir, capturar).
// O jogo inteiro (todos os `node: true`) num vm com save sintético (ajudantes/jogo-save.js); nada toca no save real.
// Rodar: node --test jogo/ferramentas/testes/unidade/monstros.test.js   (tudo: npm test)
const { test } = require('node:test');
const assert = require('assert');
const { Jogo, montar, saveHoje } = require('./ajudantes/jogo-save');

function jogo(save) {
  const orig = Jogo.scripts;
  Jogo.scripts = () => orig({});
  let j;
  try { j = montar({ save: save || saveHoje(), agora: Date.UTC(2026, 10, 16) }); } finally { Jogo.scripts = orig; }
  j.P.carregar();
  j.M = j.R.Monstros; j.V = j.R.Viagem; j.BC = j.R.BosqueCombate; j.It = j.R.Itens;
  j.mon = [];
  j.R.util.on(j.R.EVENTOS.MONSTROS, (c) => j.mon.push(c));
  return j;
}
const igual = (a, b, m) => assert.deepStrictEqual(JSON.parse(JSON.stringify(a)), b, m);   // objetos do vm (outro realm)
const pegar = (j, id, n = 1) => { for (let i = 0; i < n; i++) assert.ok(j.M.registrarCaptura(id)); };

test('monstros: as espécies de todas as arenas, com nome em português, sem repetir', () => {
  const { M, R } = jogo();
  const l = M.especies(), ids = l.map((e) => e.id);
  assert.strictEqual(new Set(ids).size, ids.length, 'espécie repetida');
  assert.strictEqual(l.length, R.Arenas.ids().length * 4);
  R.Arenas.ids().forEach((a) => assert.ok(ids.includes(a + '-facil'), a));
  l.forEach((e) => {
    assert.ok(M.NOMES[e.id], 'sem nome: ' + e.id);
    assert.ok(e.nivel >= 1 && e.lugar && e.curto, e.id);
  });
  assert.strictEqual(M.especie('lua-dificil').nome, 'Urso da Lua');
  assert.strictEqual(M.especie('bosque-mosca').nivel, 1);
  assert.strictEqual(M.especie('lua-facil').nivel, R.config.arenas.lua.nivel);
  assert.strictEqual(M.especie('nada-x'), null);
});

test('monstros: captura conta, equipar só o que tem, tirar com null, tudo gravado', () => {
  const j = jogo(), { M } = j;
  igual(M.capturados(), []);
  assert.strictEqual(M.equipado(), null);
  assert.strictEqual(M.equipar('lua-dificil'), false, 'não tem');
  pegar(j, 'lua-dificil', 2); pegar(j, 'bosque-facil');
  igual(M.capturados().map((c) => c.id + ':' + c.qtd), ['bosque-facil:1', 'lua-dificil:2']);
  assert.strictEqual(M.equipar('lua-dificil'), true);
  assert.strictEqual(M.equipado(), 'lua-dificil');
  assert.strictEqual(j.lido().monstroCompanheiro.mariana.id, 'lua-dificil');
  igual(j.lido().monstros, { 'lua-dificil': 2, 'bosque-facil': 1 });
  assert.ok(j.mon.some((c) => c.tipo === 'equipou' && c.especie === 'lua-dificil'));
  assert.strictEqual(M.equipar(null), true);
  assert.strictEqual(M.equipado(), null);
  assert.strictEqual(M.equipar(42), false);
  // recarregar: volta igual
  M.equipar('bosque-facil');
  j.P.carregar();
  assert.strictEqual(j.R.Monstros.equipado(), 'bosque-facil');
});

test('monstros: só 1 companheiro: equipar o monstro tira o ET; levar o ET tira o monstro', () => {
  const j = jogo(), { M, V } = j;
  V.fazerAmigo('lua-lumi');
  assert.ok(V.escolherCompanheiro('lua-lumi'));
  assert.strictEqual(V.companheiro(), 'lua-lumi');
  pegar(j, 'gelo-medio');
  assert.ok(M.equipar('gelo-medio'));
  assert.strictEqual(V.companheiro(), null, 'o ET ficou em casa');
  assert.strictEqual(j.lido().etCompanheiro.mariana.id, null);
  assert.strictEqual(M.equipado(), 'gelo-medio');
  j.relogio.agora += 1000;
  assert.ok(V.escolherCompanheiro('lua-lumi'));
  assert.strictEqual(V.companheiro(), 'lua-lumi');
  assert.strictEqual(M.equipado(), null, 'o monstro ficou em casa');
  assert.strictEqual(j.lido().monstroCompanheiro.mariana.id, null);
  assert.ok(V.ehAmigo('lua-lumi'), 'a amizade não some');
});

test('monstros: dois aparelhos: contadores pelo maior, companheiro pelo mais recente, ET x monstro pelo em', () => {
  const j = jogo(), { P } = j;
  const a = Object.assign(saveHoje(), { atualizado: 2, monstros: { 'lua-dificil': 1, 'gelo-medio': 3 },
    monstroCompanheiro: { mariana: { id: 'lua-dificil', em: 10 } } });
  const b = Object.assign(saveHoje(), { atualizado: 1, monstros: { 'lua-dificil': 2, 'bosque-facil': 1 },
    monstroCompanheiro: { mariana: { id: null, em: 20 } } });
  [P.mesclar(a, b), P.mesclar(b, a)].forEach((m) => {
    igual(m.monstros, { 'lua-dificil': 2, 'gelo-medio': 3, 'bosque-facil': 1 });
    assert.strictEqual(m.monstroCompanheiro.mariana.id, null);
  });
  // um aparelho levou o ET depois de o outro equipar o monstro: vale o mais recente (sem gravar nada na leitura)
  const v = jogo(Object.assign(saveHoje(), { etsAmigos: { 'lua-lumi': true }, monstros: { 'lua-dificil': 1 },
    etCompanheiro: { mariana: { id: 'lua-lumi', em: 30 } }, monstroCompanheiro: { mariana: { id: 'lua-dificil', em: 20 } } }));
  assert.strictEqual(v.M.equipado(), null);
  assert.strictEqual(v.V.companheiro(), 'lua-lumi');
  const w = jogo(Object.assign(saveHoje(), { etsAmigos: { 'lua-lumi': true }, monstros: { 'lua-dificil': 1 },
    etCompanheiro: { mariana: { id: 'lua-lumi', em: 20 } }, monstroCompanheiro: { mariana: { id: 'lua-dificil', em: 30 } } }));
  assert.strictEqual(w.M.equipado(), 'lua-dificil');
  assert.strictEqual(w.V.companheiro(), null);
  // equipado de uma espécie que ela não tem (mescla estranha) = nenhum; o ET continua
  const x = jogo(Object.assign(saveHoje(), { etsAmigos: { 'lua-lumi': true }, etCompanheiro: { mariana: { id: 'lua-lumi', em: 5 } },
    monstroCompanheiro: { mariana: { id: 'lua-dificil', em: 30 } } }));
  assert.strictEqual(x.M.equipado(), null);
  assert.strictEqual(x.V.companheiro(), 'lua-lumi');
});

test('monstros: save antigo sem os campos abre igual (o ET de antes continua) e lixo é limpo', () => {
  const j = jogo(Object.assign(saveHoje(), { etsAmigos: { 'lua-lumi': true }, etCompanheiro: { mariana: { id: 'lua-lumi', em: 5 } } }));
  igual(j.P.estado().monstros, {});
  assert.strictEqual(j.M.equipado(), null);
  assert.strictEqual(j.V.companheiro(), 'lua-lumi');
  const k = jogo(Object.assign(saveHoje(), { monstros: { 'lua-dificil': 2.7, 'x y': 3, ruim: 4, 'gelo-medio': -1 },
    monstroCompanheiro: { mariana: { id: '<script>', em: 'ontem' } } }));
  igual(k.P.estado().monstros, { 'lua-dificil': 2 });
  igual(k.P.estado().monstroCompanheiro, { mariana: { id: null, em: 0 } });
});

test('monstros: o dano da ajuda é a fração do tipo mais o bônus do nível, mínimo 1', () => {
  const { M, R } = jogo(), a = R.config.monstros.ajuda;
  const nv = R.config.arenas.lua.nivel;
  assert.strictEqual(M.danoAjuda('lua-dificil', 40), Math.max(1, Math.round(40 * (a.fator.dificil + a.bonusNivel * nv))));
  assert.strictEqual(M.danoAjuda('bosque-facil', 10), Math.round(10 * (a.fator.facil + a.bonusNivel)));
  assert.strictEqual(M.danoAjuda('bosque-facil', 1), 1, 'mínimo 1');
  assert.ok(M.danoAjuda('lua-dificil', 40) > M.danoAjuda('lua-facil', 40), 'o tipo mais forte bate mais');
  assert.ok(M.danoAjuda('lua-facil', 40) > M.danoAjuda('pantano-facil', 40), 'a arena mais alta bate mais');
  assert.strictEqual(M.danoAjuda('nada-x', 40), 0);
});

// a arena num vm: estado de combate montado à mão (sem Cena de verdade), Mariana do lado de um inimigo
function naArena(j, arena) {
  const C = j.R._bosqueCombate, cfg = j.R.Arenas.cfg(arena);
  const est = j.BC.novoEstado({ comodo: { x: 1, y: 1, w: 54, h: 40 }, spawn: { x: 28, y: 39 },
    solido: (x, y) => x < 1 || y < 3 || x > 54 || y > 40 }, cfg);
  est.arena = arena; est.parados = true;
  C.estado = est; C.estados[arena] = est; C.arena = arena;
  j.BC.arena = () => arena;   // o vm não tem Cena de arena: a arena de agora é esta
  const f = est.fantasmas[0];
  j.ctx.Jogador = { x: f.x + 10, y: f.y, olharX: 0, olharY: -1 };
  return { est, f };
}

test('monstros: MonsterBall: fora da arena, sem bola e longe não joga; jogar gasta 1 e grava a captura', () => {
  const j = jogo(), { M, It, R } = j;
  assert.strictEqual(M.podeJogar().motivo, 'fora-arena');
  const { f } = naArena(j, 'lua');
  assert.strictEqual(M.podeJogar().motivo, 'sem-bola');
  It.ganhar('bola-monster'); It.ganhar('bola-monster');
  assert.strictEqual(M.bolas().length, 2);
  j.ctx.Jogador.x = f.x + R.config.monstros.alcanceBola + 40;
  assert.strictEqual(M.podeJogar().motivo, 'longe');
  j.ctx.Jogador.x = f.x + 10;
  assert.ok(M.podeJogar().ok);
  R.config.monstros.chanceCaptura = 1;   // pega sempre
  assert.strictEqual(M.jogar(), true);
  assert.strictEqual(M.bolas().length, 1, 'gastou 1');
  assert.strictEqual(M.podeJogar().motivo, 'recarga', 'a bola está no ar');
  // no ar: o alvo fica preso; nem a espada nem a ajuda o ferem (sem prêmio dobrado), e ainda não contou
  assert.strictEqual(f.estado, 'preso');
  assert.strictEqual(M.quantos('lua-' + f.tipo), 0, 'só grava quando a bola chega');
  const est = j.R._bosqueCombate.estado, vida = f.vida;
  est.recargaAte = 0;
  j.BC.golpear(est, { x: f.x + 4, y: f.y, olharX: -1, olharY: 0, dano: 999 });
  assert.strictEqual(f.vida, vida, 'a espada não fere o preso');
  assert.strictEqual(j.BC.ferir(f.id, 999), null, 'a ajuda não fere o preso');
  const x0 = f.x; j.BC.passo(est, 50, { x: f.x + 4, y: f.y, olharX: 0, olharY: 1, vidaMax: 10 });
  assert.strictEqual(f.x, x0, 'parado');
  // a bola chega: o inimigo entra nela (sem XP, sem vencido), a captura se grava e termina com o 'capturou'
  j.relogio.agora += R.config.monstros.bolaVooMs + 1; R._monstros.quadroBola();
  assert.strictEqual(f.estado, 'esperando');
  assert.strictEqual(M.quantos('lua-' + f.tipo), 1, 'captura gravada');
  assert.strictEqual(j.lido().monstros['lua-' + f.tipo], 1);
  assert.ok(!f.eventos && !j.R._bosqueCombate.estado.eventos.some((e) => e.tipo === 'vencido'), 'sem vencido');
  j.relogio.agora += R.config.monstros.bolaBalancoMs + 1; R._monstros.quadroBola();
  assert.ok(j.mon.some((c) => c.tipo === 'capturou' && c.especie === 'lua-' + f.tipo));
  assert.strictEqual(R._monstros.bola, null);
});

test('monstros: MonsterBall que escapa: gasta 1, não conta, o inimigo continua', () => {
  const j = jogo(), { M, It, R } = j;
  const { f } = naArena(j, 'gelo');
  It.ganhar('bola-monster');
  R.config.monstros.chanceCaptura = 0;   // escapa sempre
  assert.ok(M.jogar());
  assert.strictEqual(M.bolas().length, 0);
  j.relogio.agora += R.config.monstros.bolaVooMs + R.config.monstros.bolaBalancoMs + 2;
  R._monstros.quadroBola(); R._monstros.quadroBola();
  igual(M.capturados(), []);
  assert.notStrictEqual(f.estado, 'esperando');
  assert.ok(j.mon.some((c) => c.tipo === 'escapou'));
  assert.strictEqual(f.estado, 'vagando', 'solto depois de escapar');
  // trocou de cena com a bola no ar: o alvo é solto e a bola volta para a mochila (não perde nada)
  It.ganhar('bola-monster');
  R.config.monstros.chanceCaptura = 1;
  j.relogio.agora += R.config.monstros.recargaBolaMs + 1;
  const g = j.R._bosqueCombate.estado.fantasmas.find((x) => x.estado === 'vagando');
  j.ctx.Jogador.x = g.x + 10; j.ctx.Jogador.y = g.y;
  assert.ok(M.jogar());
  assert.strictEqual(M.bolas().length, 0);
  j.BC.arena = () => null;
  R._monstros.quadroBola();
  assert.strictEqual(M.bolas().length, 1, 'a bola voltou');
  assert.strictEqual(g.estado, 'vagando');
  assert.deepStrictEqual([M.capturados().length, j.mon[j.mon.length - 1].tipo], [0, 'voltou']);
  j.BC.arena = () => 'gelo';
  It.jogarFora(M.bolas());
  // Itens.usar da bola fora da arena não gasta
  It.ganhar('bola-monster');
  j.BC.arena = () => null;
  assert.strictEqual(It.usar(M.bolas()[0]).ok, false);
  assert.strictEqual(M.bolas().length, 1);
});

test('monstros: a ajuda: o monstro equipado tira vida do inimigo mais perto; vencido segue o caminho da espada', () => {
  const j = jogo(), { M, R, BC } = j;
  const { est, f } = naArena(j, 'pantano');
  f.vida = f.max = 100;   // aguenta dois ataques
  R.Bosque.dano = () => 10;
  R._monstros.quadroAjuda(1000);
  assert.strictEqual(f.vida, f.max, 'sem monstro equipado não ataca');
  pegar(j, 'lua-dificil'); M.equipar('lua-dificil');
  const d = M.danoAjuda('lua-dificil', 10);
  R._monstros.quadroAjuda(2000);
  assert.strictEqual(f.vida, f.max - d);
  assert.ok(R._monstros.ataque && R._monstros.ataque.dano === d);
  R._monstros.quadroAjuda(2100);
  assert.strictEqual(f.vida, f.max - d, 'na recarga não ataca');
  R._monstros.quadroAjuda(2000 + R.config.monstros.ajuda.recargaMs);
  assert.strictEqual(f.vida, f.max - 2 * d);
  // vence: sumindo e, no passo, o 'vencido' de sempre (XP, pergunta e drop pelo caminho da espada)
  f.vida = 1;
  R._monstros.quadroAjuda(10000);
  assert.strictEqual(f.estado, 'sumindo');
  BC.passo(est, 50, { x: 0, y: 0, olharX: 0, olharY: 1, vidaMax: 10 });
  for (let i = 0; i < 20 && f.estado === 'sumindo'; i++) BC.passo(est, 50, { x: 0, y: 0, olharX: 0, olharY: 1, vidaMax: 10 });
  assert.strictEqual(f.estado, 'vencido');
  assert.ok(est.eventos.some((e) => e.tipo === 'vencido' && e.id === f.id && e.arena === 'pantano'));
  // longe: não ataca
  const g = est.fantasmas[1];
  j.ctx.Jogador = { x: g.x + R.config.monstros.ajuda.alcance + 50, y: g.y };
  const antes = g.vida;
  R._monstros.quadroAjuda(20000);
  assert.ok(g.vida === antes || Math.hypot(g.x - j.ctx.Jogador.x, g.y - j.ctx.Jogador.y) <= R.config.monstros.ajuda.alcance);
});

test('monstros: trocou de arena para arena com a bola no ar: o alvo é solto na arena dele e a bola volta', () => {
  const j = jogo(), { M, It, R, BC } = j;
  const { f } = naArena(j, 'lua'), C = R._bosqueCombate;
  It.ganhar('bola-monster');
  R.config.monstros.chanceCaptura = 1;
  assert.ok(M.jogar());
  assert.strictEqual(f.estado, 'preso');
  // o ouvinte de CENA troca o estado de agora para o da arena nova antes de a bola terminar
  const outra = BC.novoEstado({ comodo: { x: 1, y: 1, w: 54, h: 40 }, spawn: { x: 28, y: 39 },
    solido: (x, y) => x < 1 || y < 3 || x > 54 || y > 40 }, R.Arenas.cfg('gelo'));
  outra.arena = 'gelo'; C.estados.gelo = outra; C.estado = outra; C.arena = 'gelo'; BC.arena = () => 'gelo';
  R._monstros.quadroBola();
  assert.strictEqual(f.estado, 'vagando', 'solto na arena da Lua');
  assert.strictEqual(M.bolas().length, 1, 'a bola voltou');
  assert.strictEqual(M.capturados().length, 0);
  // e o reinício da arena também solta um preso que sobrou
  const est = C.estados.lua, g = est.fantasmas[1];
  g.estado = 'preso';
  BC.reiniciarEstado(est);
  assert.strictEqual(g.estado, 'vagando');
});

test('monstros: a Super MonsterBall pega sempre e gasta 1 Super (a comum fica)', () => {
  const j = jogo(), { M, It, R } = j;
  const def = R.ItensCatalogo.def('bola-super');
  assert.deepStrictEqual([def.nome, def.tipo, def.loja, def.preco, def.icone], ['Super MonsterBall', 'bola', 'treinadores', R.config.monstros.precoSuper, 'item:bola-super']);
  assert.strictEqual(R.config.monstros.precoSuper, 125);
  assert.strictEqual(R.config.monstros.chanceSuper, 1);
  const { f } = naArena(j, 'dunas');
  It.ganhar('bola-monster'); It.ganhar('bola-super');
  assert.strictEqual(M.podeJogar('super').ok, true);
  R.config.monstros.chanceCaptura = 0;   // a comum escaparia: a Super não liga
  assert.ok(M.jogar('super'));
  assert.deepStrictEqual([M.bolas('super').length, M.bolas('comum').length], [0, 1]);
  assert.strictEqual(R._monstros.bola.super, true);
  j.relogio.agora += R.config.monstros.bolaVooMs + 1; R._monstros.quadroBola();
  assert.strictEqual(M.quantos('dunas-' + f.tipo), 1, 'pegou');
  // sem Super: o tipo super não joga (a comum sim)
  j.relogio.agora += R.config.monstros.bolaBalancoMs + R.config.monstros.recargaBolaMs + 2; R._monstros.quadroBola();
  assert.strictEqual(M.podeJogar('super').motivo, 'sem-bola');
  const g = j.R._bosqueCombate.estado.fantasmas.find((x) => x.estado === 'vagando');
  j.ctx.Jogador.x = g.x + 10; j.ctx.Jogador.y = g.y;
  assert.strictEqual(M.podeJogar().ok, true);
});

test('monstros: a Mini MonsterBall (25 estrelas, 20%) gasta 1 Mini, usa chanceMini e volta como Mini', () => {
  const j = jogo(), { M, It, R } = j;
  const def = R.ItensCatalogo.def('bola-mini');
  assert.deepStrictEqual([def.nome, def.tipo, def.loja, def.preco, def.icone], ['Mini MonsterBall', 'bola', 'treinadores', 25, 'item:bola-mini']);
  assert.strictEqual(R.config.monstros.chanceMini, 0.2);
  assert.strictEqual(JSON.stringify(R.config.monstros.desconto.faixas.map((f) => [f.salas, f.desconto])), '[[5,0.1],[16,0.25],[32,0.5]]');
  const { f } = naArena(j, 'dunas');
  It.ganhar('bola-monster'); It.ganhar('bola-mini');
  R.config.monstros.chanceMini = 1; R.config.monstros.chanceCaptura = 0;   // a chance é a da Mini, não a da comum
  assert.ok(M.jogar('mini'));
  assert.deepStrictEqual([M.bolas('mini').length, M.bolas('comum').length], [0, 1]);
  assert.strictEqual(R._monstros.bola.mini, true);
  j.relogio.agora += R.config.monstros.bolaVooMs + 1; R._monstros.quadroBola();
  assert.strictEqual(M.quantos('dunas-' + f.tipo), 1, 'pegou com a Mini');
  // trocou de cena com a Mini no ar: volta uma Mini (não uma MonsterBall)
  j.relogio.agora += R.config.monstros.bolaBalancoMs + R.config.monstros.recargaBolaMs + 2; R._monstros.quadroBola();
  It.ganhar('bola-mini');
  const g = j.R._bosqueCombate.estado.fantasmas.find((x) => x.estado === 'vagando');
  j.ctx.Jogador.x = g.x + 10; j.ctx.Jogador.y = g.y;
  assert.ok(M.jogar('mini'));
  j.R.BosqueCombate.arena = () => null;   // saiu da arena
  R._monstros.quadroBola();
  assert.deepStrictEqual([M.bolas('mini').length, M.bolas('comum').length], [1, 1], 'a Mini voltou como Mini');
});

