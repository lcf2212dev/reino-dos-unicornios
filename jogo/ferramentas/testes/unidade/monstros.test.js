// Testes de unidade: Treinadores de Monstros (docs/contratos/monstros.md): as espécies, os campos `monstros` e
// `monstroCompanheiro` (ida e volta, mescla com dois aparelhos, limpeza, save antigo), o monstro e o ET juntos (os 3
// bichinhos com o unicórnio, o ET atrás do monstro), o dano da ajuda, a MonsterBall (podeJogar, gasta 1, sorteio, captura gravada) e o combate (ferir, capturar).
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

test('monstros: até 4 equipados em fila; o 5º só com uma matéria terminada; deixar um abre a vaga', () => {
  const j = jogo(), { M, R } = j;
  const ids = ['bosque-facil', 'gelo-medio', 'lua-dificil', 'pantano-facil', 'dunas-medio', 'vulcao-dificil'];
  ids.forEach((id) => pegar(j, id));
  assert.strictEqual(M.vagas(), R.config.monstros.equipar.base);
  assert.strictEqual(R.config.monstros.equipar.base, 4, 'pedido: até 4');
  ids.slice(0, 4).forEach((id) => assert.ok(M.equipar(id), id));
  igual(M.equipados(), ids.slice(0, 4));
  assert.strictEqual(M.equipado(), ids[0], 'o primeiro da fila');
  assert.strictEqual(M.equipar(ids[4]), false, 'sem vaga');
  assert.strictEqual(M.equipados().length, 4);
  // gravado: a lista em monstrosJuntos e o primeiro em monstroCompanheiro (versão antiga), no mesmo carimbo
  const lido = j.lido();
  igual(lido.monstrosJuntos.mariana.ids, ids.slice(0, 4));
  assert.strictEqual(lido.monstroCompanheiro.mariana.id, ids[0]);
  assert.strictEqual(lido.monstroCompanheiro.mariana.em, lido.monstrosJuntos.mariana.em);
  // termina uma matéria do bimestre de agora: +1 vaga (matéria arquivada não conta)
  const arquivada = R.materias.find((m) => m.arquivada && m.salas.length);
  arquivada.salas.forEach((s) => { j.P.estado().salas[s.id] = { feita: true }; });
  assert.strictEqual(M.vagas(), 4, 'matéria do 3º bimestre não conta');
  const m = R.materias.find((x) => !x.arquivada && x.salas.length);
  m.salas.forEach((s) => { j.P.estado().salas[s.id] = { feita: true }; });
  assert.strictEqual(M.materiasTerminadas(), 1);
  assert.strictEqual(M.vagas(), 5);
  assert.ok(M.equipar(ids[4]));
  assert.strictEqual(M.equipar(ids[5]), false);
  // deixar um em casa: a fila continua na ordem, e a vaga volta
  assert.ok(M.deixar(ids[1]));
  igual(M.equipados(), [ids[0], ids[2], ids[3], ids[4]]);
  assert.ok(M.equipar(ids[5]));
  igual(M.equipados(), [ids[0], ids[2], ids[3], ids[4], ids[5]]);
  assert.strictEqual(M.deixar('lua-medio'), false, 'quem não está junto');
  // sem a matéria (outro aparelho, Novo ciclo): a fila fica só com as vagas de agora, sem apagar a lista gravada
  m.salas.forEach((s) => { delete j.P.estado().salas[s.id]; });
  assert.strictEqual(M.equipados().length, 4);
  assert.strictEqual(j.lido().monstrosJuntos.mariana.ids.length, 5);
  assert.ok(M.equipar(null));
  igual(M.equipados(), []);
  assert.strictEqual(j.lido().monstroCompanheiro.mariana.id, null);
});

test('monstros: save de antes (só monstroCompanheiro) e aparelho da versão antiga trocando depois', () => {
  const base = { monstros: { 'lua-dificil': 1, 'gelo-medio': 1, 'bosque-facil': 1 } };
  // save de antes: o monstro de sempre continua
  const a = jogo(Object.assign(saveHoje(), base, { monstroCompanheiro: { mariana: { id: 'lua-dificil', em: 5 } } }));
  igual(a.M.equipados(), ['lua-dificil']);
  // a lista é a mais nova (o primeiro dela no campo antigo, no mesmo carimbo): vale a lista
  const b = jogo(Object.assign(saveHoje(), base, { monstrosJuntos: { mariana: { ids: ['gelo-medio', 'bosque-facil'], em: 30 } },
    monstroCompanheiro: { mariana: { id: 'gelo-medio', em: 30 } } }));
  igual(b.M.equipados(), ['gelo-medio', 'bosque-facil']);
  // um aparelho da versão antiga trocou o monstro depois (em maior): vale o dele, sozinho
  const c = jogo(Object.assign(saveHoje(), base, { monstrosJuntos: { mariana: { ids: ['gelo-medio', 'bosque-facil'], em: 30 } },
    monstroCompanheiro: { mariana: { id: 'lua-dificil', em: 40 } } }));
  igual(c.M.equipados(), ['lua-dificil']);
  const d = jogo(Object.assign(saveHoje(), base, { monstrosJuntos: { mariana: { ids: ['gelo-medio'], em: 30 } },
    monstroCompanheiro: { mariana: { id: null, em: 40 } } }));
  igual(d.M.equipados(), [], 'deixou em casa no aparelho antigo');
  // lixo na lista é limpo; espécie que ela não tem fica de fora (sem apagar)
  const e = jogo(Object.assign(saveHoje(), base, { monstrosJuntos: { mariana: { ids: ['gelo-medio', 'x y', 42, 'gelo-medio', 'lua-medio'], em: 9 } } }));
  igual(e.P.estado().monstrosJuntos.mariana.ids, ['gelo-medio', 'lua-medio']);
  igual(e.M.equipados(), ['gelo-medio']);
});

test('monstros: com vários na fila, o ET anda atrás do último', () => {
  const j = jogo(), { M, V, R } = j;
  V.fazerAmigo('lua-lumi'); V.escolherCompanheiro('lua-lumi');
  ['bosque-facil', 'gelo-medio', 'lua-dificil'].forEach((id) => { pegar(j, id); M.equipar(id); });
  const MS = R._monstros, c = R.config;
  assert.strictEqual(MS.distancia(1) - MS.distancia(0), c.monstros.entreMonstros);
  assert.strictEqual(R._etCompanheiro.distancia(), Math.max(c.viagem.companheiroDistancia, MS.distancia(2)) + c.viagem.etAtrasDoMonstro);
  assert.ok(c.monstros.entreMonstros >= 16, 'um não encosta no outro');
});

test('monstros: o monstro e o ET vão juntos: equipar um não tira o outro', () => {
  const j = jogo(), { M, V } = j;
  V.fazerAmigo('lua-lumi');
  assert.ok(V.escolherCompanheiro('lua-lumi'));
  assert.strictEqual(V.companheiro(), 'lua-lumi');
  pegar(j, 'gelo-medio');
  assert.ok(M.equipar('gelo-medio'));
  assert.strictEqual(V.companheiro(), 'lua-lumi', 'o ET continua junto');
  assert.strictEqual(j.lido().etCompanheiro.mariana.id, 'lua-lumi');
  assert.strictEqual(M.equipado(), 'gelo-medio');
  j.relogio.agora += 1000;
  assert.ok(V.escolherCompanheiro('lua-lumi'));
  assert.strictEqual(M.equipado(), 'gelo-medio', 'o monstro continua junto');
  assert.strictEqual(j.lido().monstroCompanheiro.mariana.id, 'gelo-medio');
  // deixar um em casa não mexe no outro
  assert.ok(V.escolherCompanheiro(null));
  assert.strictEqual(M.equipado(), 'gelo-medio');
  assert.ok(V.escolherCompanheiro('lua-lumi'));
  assert.ok(M.equipar(null));
  assert.strictEqual(V.companheiro(), 'lua-lumi');
  assert.ok(V.ehAmigo('lua-lumi'), 'a amizade não some');
});

test('monstros: com os dois juntos, o ET anda atrás do monstro (nunca em cima dele nem do bebê)', () => {
  const j = jogo(), { M, V, R } = j;
  const E = R._etCompanheiro, cfg = R.config.viagem;
  V.fazerAmigo('lua-lumi');
  V.escolherCompanheiro('lua-lumi');
  const so = E.distancia();
  pegar(j, 'gelo-medio');
  M.equipar('gelo-medio');
  assert.strictEqual(E.distancia(), Math.max(so, R.config.monstros.distancia) + cfg.etAtrasDoMonstro, 'o ET vai atrás do monstro');
  R.config.monstros.distancia = so + 40;   // monstro mais longe: o ET continua atrás dele
  assert.strictEqual(E.distancia(), so + 40 + cfg.etAtrasDoMonstro);
  assert.ok(cfg.etAtrasDoMonstro >= 16, 'sem encostar no monstro');
});

test('monstros: dois aparelhos: contadores pelo maior, companheiro pelo mais recente; ET e monstro cada um no seu campo', () => {
  const j = jogo(), { P } = j;
  const a = Object.assign(saveHoje(), { atualizado: 2, monstros: { 'lua-dificil': 1, 'gelo-medio': 3 },
    monstroCompanheiro: { mariana: { id: 'lua-dificil', em: 10 } } });
  const b = Object.assign(saveHoje(), { atualizado: 1, monstros: { 'lua-dificil': 2, 'bosque-facil': 1 },
    monstroCompanheiro: { mariana: { id: null, em: 20 } } });
  [P.mesclar(a, b), P.mesclar(b, a)].forEach((m) => {
    igual(m.monstros, { 'lua-dificil': 2, 'gelo-medio': 3, 'bosque-facil': 1 });
    assert.strictEqual(m.monstroCompanheiro.mariana.id, null);
  });
  // o ET e o monstro gravados: os dois vão juntos, seja qual for o mais recente (nada gravado na leitura)
  [[30, 20], [20, 30]].forEach(([emEt, emMonstro]) => {
    const v = jogo(Object.assign(saveHoje(), { etsAmigos: { 'lua-lumi': true }, monstros: { 'lua-dificil': 1 },
      etCompanheiro: { mariana: { id: 'lua-lumi', em: emEt } }, monstroCompanheiro: { mariana: { id: 'lua-dificil', em: emMonstro } } }));
    assert.strictEqual(v.M.equipado(), 'lua-dificil');
    assert.strictEqual(v.V.companheiro(), 'lua-lumi');
  });
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
  assert.ok(R._monstros.ataques['lua-dificil'] && R._monstros.ataques['lua-dificil'].dano === d);
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


test('monstros: a fila ataca escalonada, também depois de esperar sem inimigo perto', () => {
  const j = jogo(), { M, R } = j;
  const { f } = naArena(j, 'pantano');
  f.vida = f.max = 100000;
  R.Bosque.dano = () => 10;
  const ids = ['bosque-facil', 'gelo-medio', 'lua-dificil'];
  ids.forEach((id) => { pegar(j, id); M.equipar(id); });
  const rec = R.config.monstros.ajuda.recargaMs, S = R._monstros, Jog = j.ctx.Jogador;
  // 3 s longe do inimigo (fora do alcance): ninguém ataca
  Jog.x = f.x + 500;
  for (let t = 1000; t <= 4000; t += 16) S.quadroAjuda(t);
  assert.deepStrictEqual(Object.keys(S.ataques || {}), []);
  // o inimigo chega perto: os três atacam em tempos diferentes
  Jog.x = f.x + 10;
  const quando = {};
  for (let t = 4016; t <= 4016 + rec * 2; t += 16) {
    S.quadroAjuda(t);
    ids.forEach((id) => { const a = S.ataques[id]; if (a && !quando[id]) quando[id] = a.em; });
  }
  const tempos = ids.map((id) => quando[id]);
  assert.ok(tempos.every((x) => x > 0), 'todos atacaram: ' + JSON.stringify(tempos));
  assert.strictEqual(new Set(tempos).size, 3, 'em tempos diferentes: ' + JSON.stringify(tempos));
});

test('monstros: a gravação conserva espécie de versão nova e quem a vaga esconde', () => {
  const j = jogo(Object.assign(saveHoje(), { monstros: { 'lua-dificil': 1, 'gelo-medio': 1, 'bosque-facil': 1, 'pantano-facil': 1, 'dunas-medio': 1 },
    monstrosJuntos: { mariana: { ids: ['nova-facil', 'gelo-medio', 'bosque-facil', 'pantano-facil', 'dunas-medio', 'lua-dificil'], em: 10 } } }));
  const { M } = j;
  igual(M.equipados(), ['gelo-medio', 'bosque-facil', 'pantano-facil', 'dunas-medio'], 'até 4; a de versão nova não aparece');
  assert.ok(M.deixar('bosque-facil'));
  igual(j.lido().monstrosJuntos.mariana.ids, ['nova-facil', 'gelo-medio', 'pantano-facil', 'dunas-medio', 'lua-dificil']);
  igual(M.equipados(), ['gelo-medio', 'pantano-facil', 'dunas-medio', 'lua-dificil'], 'o escondido entra na vaga');
  assert.strictEqual(j.lido().monstroCompanheiro.mariana.id, 'gelo-medio', 'o 1º que esta versão mostra');
  assert.ok(M.deixar('lua-dificil'));
  assert.ok(M.equipar('bosque-facil'));
  igual(j.lido().monstrosJuntos.mariana.ids, ['nova-facil', 'gelo-medio', 'pantano-facil', 'dunas-medio', 'bosque-facil']);
  assert.ok(M.equipar(null));
  igual(j.lido().monstrosJuntos.mariana.ids, ['nova-facil'], 'deixar todos em casa guarda a de versão nova');
  igual(M.equipados(), []);
});

test('monstros: maisVagas: sem vaga, a frase muda quando não há matéria por terminar', () => {
  const j = jogo(), { M, R } = j;
  assert.strictEqual(M.maisVagas(), true);
  R.materias.filter((m) => !m.arquivada).forEach((m) => m.salas.forEach((s) => { j.P.estado().salas[s.id] = { feita: true }; }));
  assert.strictEqual(M.maisVagas(), false);
  assert.strictEqual(M.vagas(), 4 + R.materias.filter((m) => !m.arquivada && m.salas.length).length);
});

test('monstros: mescla com o doc de um aparelho da versão antiga (sem a fila, mais recente)', () => {
  const j = jogo(), { P } = j;
  const base = { monstros: { 'lua-dificil': 1, 'gelo-medio': 1, 'bosque-facil': 1 } };
  const novo = Object.assign(saveHoje(), base, { atualizado: 10,
    monstrosJuntos: { mariana: { ids: ['gelo-medio', 'bosque-facil'], em: 10 } }, monstroCompanheiro: { mariana: { id: 'gelo-medio', em: 10 } } });
  // o antigo não conhece a fila: trocou o monstro depois
  const antigo = Object.assign(saveHoje(), base, { atualizado: 20, monstroCompanheiro: { mariana: { id: 'lua-dificil', em: 20 } } });
  [P.mesclar(novo, antigo), P.mesclar(antigo, novo)].forEach((m) => {
    igual(m.monstrosJuntos.mariana.ids, ['gelo-medio', 'bosque-facil'], 'a fila não some');
    assert.strictEqual(m.monstroCompanheiro.mariana.id, 'lua-dificil');
    const k = jogo(m);
    igual(k.M.equipados(), ['lua-dificil'], 'vale a troca mais nova, a do aparelho antigo');
  });
  // o antigo só abriu e gravou (sem trocar): a fila continua
  const so = Object.assign(saveHoje(), base, { atualizado: 30, monstroCompanheiro: { mariana: { id: 'gelo-medio', em: 10 } } });
  igual(jogo(P.mesclar(novo, so)).M.equipados(), ['gelo-medio', 'bosque-facil']);
});
