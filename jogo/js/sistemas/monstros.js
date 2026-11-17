/* Treinadores de Monstros (docs/contratos/monstros.md): a coleção de monstros da Mariana e os monstros equipados (até
   `config.monstros.equipar.base`, mais 1 por matéria do bimestre terminada), que andam em fila atrás dela (com o ET, se
   ela levou um, no fim da fila) e ajudam na luta. Aqui: os nomes das espécies, os campos do save (`monstros`,
   `monstroCompanheiro`, `monstrosJuntos`), Reino.Monstros (espécies, capturados, equipar, vagas, dano da ajuda) e o módulo
   'monstros' com a camada de desenho. Cria o interno Reino._monstros, que as partes dividem:
     t                 o `t` do último quadro desenhado (ms; virtual no modo congelado)
     bola              a MonsterBall voando (monstros-bola.js): { alvo, tipo, arena, especie, pegou, em (Date.now), x0, y0, x, y, chegou } | null
     ataques           o último pulo de cada monstro equipado (monstros-ajuda.js): { <especie>: { em, x, y, dano } }
     distancia(n)      quanto o n-ésimo da fila anda atrás dela (px)
     itensDesenho, sobre  o desenho (monstros-desenho.js);  quadroBola(), quadroAjuda(t)  (as partes de regra)
     parada(), maisPerto(raio)  luta parada? / o inimigo ativo mais perto dela (monstros-bola.js)
   Partes: monstros-bola.js (jogar a bola), monstros-ajuda.js (o ataque dele), monstros-desenho.js (seguir e desenhar),
   sistemas/bosque-combate-monstros.js (ferir/capturar no combate). O rastro é o do ET (Reino._etCompanheiro).
   node: true: nada de DOM, Progresso nem Cena no carregamento (só dentro das funções). */
(function () {
  var R = window.Reino;
  var S = R._monstros = { t: 0, bola: null, ataques: {} };
  var ESPECIE = /^[a-z0-9]+-[a-z0-9]+$/;
  var MAX_JUNTOS = 60;   // teto da lista no save (lixo); a vaga de verdade é vagas()
  function cfg() { return R.config.monstros; }

  // os nomes de cada espécie (os dos comentários de config.fantasmas e config.arenas)
  var NOMES = {
    'bosque-facil': 'Fantasminha Lilás', 'bosque-medio': 'Fantasminha Turquesa', 'bosque-dificil': 'Fantasma Rei',
    'bosque-mosca': 'Mosca Feia',
    'pantano-facil': 'Rã Resmungona', 'pantano-medio': 'Bolha de Lodo', 'pantano-dificil': 'Sapo-Rei', 'pantano-voador': 'Libélula',
    'gelo-facil': 'Boneco de Neve', 'gelo-medio': 'Pinguim', 'gelo-dificil': 'Yeti', 'gelo-voador': 'Coruja das Neves',
    'dunas-facil': 'Escorpião', 'dunas-medio': 'Cacto Andante', 'dunas-dificil': 'Múmia Fofa', 'dunas-voador': 'Abutre',
    'cristal-facil': 'Slime de Cristal', 'cristal-medio': 'Golem de Cristal', 'cristal-dificil': 'Aranha de Cristal',
    'cristal-voador': 'Morcego de Cristal',
    'vulcao-facil': 'Salamandra de Fogo', 'vulcao-medio': 'Bola de Lava', 'vulcao-dificil': 'Dragãozinho',
    'vulcao-voador': 'Morceguinho de Fogo',
    'orvalho-facil': 'Caracol do Orvalho', 'orvalho-medio': 'Lagarta do Orvalho', 'orvalho-dificil': 'Ouriço do Orvalho',
    'orvalho-voador': 'Mariposa do Orvalho',
    'neblina-facil': 'Guaxinim da Neblina', 'neblina-medio': 'Raposa da Neblina', 'neblina-dificil': 'Javali da Neblina',
    'neblina-voador': 'Gavião da Neblina',
    'lua-facil': 'Gato da Lua', 'lua-medio': 'Cervo da Lua', 'lua-dificil': 'Urso da Lua', 'lua-voador': 'Corvo da Lua',
  };

  /* ================= NO SAVE (save-e-mescla.md §11) ================= */
  // monstros: { <especie>: n } quantos de cada ela já pegou (só cresce; espécie de versão nova fica guardada)
  R.Progresso.registrarCampo('monstros', {
    padrao: function () { return {}; },
    mesclar: 'contadores',
    novoCiclo: 'mantem',
    copiaSeguranca: true,
    limpar: function (v) {
      var r = {};
      Object.keys(v).forEach(function (k) { if (ESPECIE.test(k) && v[k] > 0) r[k] = Math.floor(v[k]); });
      return r;
    },
    exemplos: [{ 'lua-dificil': 2, 'bosque-facil': 1 }, { 'lua-dificil': 1, 'gelo-medio': 3 }],
  });
  // monstroCompanheiro: { mariana: { id: especie | null, em } }: vale o mais recente entre aparelhos (como o ET)
  R.Progresso.registrarCampo('monstroCompanheiro', {
    padrao: function () { return {}; },
    mesclar: 'carimbo',
    novoCiclo: 'mantem',
    copiaSeguranca: true,
    limpar: function (v) {
      var m = v.mariana;
      if (m === undefined) return v;
      var id = typeof m.id === 'string' && ESPECIE.test(m.id) ? m.id : null;
      return { mariana: { id: id, em: typeof m.em === 'number' && m.em >= 0 ? m.em : 0 } };
    },
    exemplos: [{ mariana: { id: 'lua-dificil', em: 10 } }, { mariana: { id: null, em: 20 } }],
  });
  // monstrosJuntos: { mariana: { ids: [especie…], em } }: os equipados, em ordem (pedido de 17/11: até 4, e mais 1 por
  // matéria terminada); vale o mais recente entre aparelhos. O `monstroCompanheiro` continua gravado com o primeiro,
  // no mesmo `em`: um aparelho da versão antiga vê 1 monstro e, se trocar depois, o dele vale (em maior)
  R.Progresso.registrarCampo('monstrosJuntos', {
    padrao: function () { return {}; },
    mesclar: 'carimbo',
    novoCiclo: 'mantem',
    copiaSeguranca: true,
    limpar: function (v) {
      var m = v.mariana;
      if (m === undefined) return v;
      var ids = (Array.isArray(m.ids) ? m.ids : []).filter(function (x, i, l) {
        return typeof x === 'string' && ESPECIE.test(x) && l.indexOf(x) === i;
      }).slice(0, MAX_JUNTOS);
      return { mariana: { ids: ids, em: typeof m.em === 'number' && m.em >= 0 ? m.em : 0 } };
    },
    exemplos: [{ mariana: { ids: ['lua-dificil', 'gelo-medio'], em: 10 } }, { mariana: { ids: [], em: 20 } }],
  });
  function estado() { try { return R.Progresso.estado(); } catch (e) { return null; } }

  /* ================= ESPÉCIES ================= */
  // os monstros das matérias (monstros-materias.js, monstros.md §10): { id, arena: 'assombrada', tipo, nome, nivel,
  // lugar, curto, assunto, molde }; ganhos com a matéria completa (derivado), nunca pela MonsterBall
  var EXTRAS = [], mapa = null, nArenas = -1;
  var ASSOMBRADA = { lugar: 'Casa Mal-Assombrada', curto: 'Casa Assombrada' };
  function registrarEspecie(d) {
    var c = cfg().materias;   // o tipo e o nível de todos (config.monstros.materias)
    if (!d || typeof d.id !== 'string' || !ESPECIE.test(d.id) || !d.molde || !d.assunto) throw new Error('monstro da matéria inválido: ' + (d && d.id));
    if (EXTRAS.some(function (e) { return e.id === d.id; })) throw new Error('monstro da matéria repetido: ' + d.id);
    EXTRAS.push({ id: d.id, arena: 'assombrada', tipo: c.tipo, nome: d.nome, nivel: c.nivel,
      lugar: ASSOMBRADA.lugar, curto: ASSOMBRADA.curto, emoji: null, assunto: d.assunto, molde: d.molde, daMateria: true });
    mapa = null;
  }
  // a matéria (id) que ela tem de terminar: a de agora do prédio do assunto (Bimestres.ativa)
  function materiaDe(e) { var B = R.Bimestres; return B && B.ativa ? B.ativa(e.assunto) : e.assunto; }
  // ganhou: alguma matéria do mesmo prédio completa, menos a do 3º bimestre (id = o assunto, arquivada antes desta
  // novidade). A de agora conta; quando ela também for arquivada (bimestre novo), o monstro continua dela
  function ganhou(e) {
    try {
      return (R.materias || []).some(function (m) {
        return m.id !== e.assunto && m.lugar && m.lugar.dentro === 'materia:' + e.assunto && Array.isArray(m.salas) &&
          m.salas.length && R.Progresso.materiaCompleta(m);
      });
    } catch (err) { return false; }   // sem save carregado (teste)
  }
  // todas as espécies: as de cada arena registrada (o Bosque primeiro), na ordem dos tipos da config, e depois as das
  // matérias
  function especies() {
    var A = R.Arenas, lista = [];
    if (!A) return lista.concat(EXTRAS);
    A.ids().forEach(function (arena) {
      var c = A.cfg(arena), d = A.def(arena) || {}, nivel = arena === 'bosque' ? 1 : (c.nivel || 1);
      Object.keys(c.tipos || {}).forEach(function (tipo) {
        var id = arena + '-' + tipo;
        lista.push({ id: id, arena: arena, tipo: tipo, nome: NOMES[id] || d.nome || id, nivel: nivel,
          lugar: d.nome || arena, curto: d.curto || d.nome || arena, emoji: d.emoji || null });
      });
    });
    return lista.concat(EXTRAS);
  }
  // por id, refeito só quando muda o número de arenas (elas se registram no carregamento): especie() é chamado a cada
  // quadro, para cada monstro da fila
  function especie(id) {
    if (typeof id !== 'string') return null;
    var n = R.Arenas ? R.Arenas.ids().length : 0;
    if (!mapa || n !== nArenas) {
      mapa = {}; nArenas = n;
      especies().forEach(function (e) { mapa[e.id] = e; });
    }
    return Object.prototype.hasOwnProperty.call(mapa, id) ? mapa[id] : null;
  }
  // os que ela tem (espécie conhecida, quantos > 0), na ordem das espécies
  function capturados() {
    return especies().map(function (e) { return { id: e.id, qtd: quantos(e.id), def: e }; }).filter(function (c) { return c.qtd > 0; });
  }
  // quantos ela tem: os pegos pela MonsterBall (campo `monstros`); o da matéria, 1 com a matéria completa
  function quantos(id) {
    var e = especie(id);
    if (e && e.daMateria) return ganhou(e) ? 1 : 0;
    var est = estado(), m = est && est.monstros;
    return m && m[id] > 0 ? m[id] : 0;
  }
  // os monstros das matérias, na ordem: { id, nome, materia (a de agora), ganho }
  function daMateria() {
    return EXTRAS.map(function (e) { return { id: e.id, nome: e.nome, materia: materiaDe(e), ganho: ganhou(e) }; });
  }
  // o molde do desenho: o do inimigo da arena, ou o do monstro da matéria
  function molde(id) {
    var e = especie(id);
    if (!e) return null;
    if (e.daMateria) return e.molde;
    return R.Arenas ? R.Arenas.desenho(e.arena, e.tipo) : null;
  }
  // o sprite com contorno (quadro 0 parado, 1 piscando, 3 o passo dos que andam): o das arenas
  // (BosqueCombate.spriteInimigo) ou o do molde da matéria, feito uma vez
  var SPR = {};
  function sprite(id, quadro) {
    var e = especie(id), q = quadro || 0;
    if (!e) return null;
    if (!e.daMateria) { var BC = R.BosqueCombate; return BC && BC.spriteInimigo ? BC.spriteInimigo(e.tipo, q, e.arena) : null; }
    if (q !== 1) q = 0;
    var k = id + '|' + q;
    if (SPR[k]) return SPR[k];
    var m = e.molde, linhas = m.linhas.slice();
    if (q === 1 && m.pisca) Object.keys(m.pisca).forEach(function (i) { linhas[+i] = m.pisca[i]; });
    var c = window.PA.novoCanvas(linhas[0].length, linhas.length);
    R.Desenho.matriz(c.getContext('2d'), 0, 0, linhas, m.paleta);
    return (SPR[k] = c);
  }

  /* ================= OS EQUIPADOS (os monstros que vão com ela; o ET é à parte, vai junto) ================= */
  // matérias do bimestre de agora (não arquivadas) com todas as salas feitas
  function materiasTerminadas() {
    var P = R.Progresso;
    try {
      return (R.materias || []).filter(function (m) {
        return !m.arquivada && Array.isArray(m.salas) && m.salas.length && P.materiaCompleta(m);
      }).length;
    } catch (e) { return 0; }   // sem save carregado (teste)
  }
  // quantos ela pode levar: `equipar.base` e mais `porMateria` por matéria terminada
  function vagas() { var c = cfg().equipar; return c.base + c.porMateria * materiasTerminadas(); }
  // ainda dá para ganhar vaga (alguma matéria do bimestre de agora por terminar)?
  function maisVagas() {
    var ativas = (R.materias || []).filter(function (m) { return !m.arquivada && Array.isArray(m.salas) && m.salas.length; }).length;
    return materiasTerminadas() < ativas;
  }
  // a lista gravada: a de `monstrosJuntos`, ou o `monstroCompanheiro` se ele é mais novo (aparelho da versão antiga
  // trocou depois) ou se a lista não existe (save de antes)
  function listaGravada() {
    var est = estado(), j = est && est.monstrosJuntos && est.monstrosJuntos.mariana;
    var a = est && est.monstroCompanheiro && est.monstroCompanheiro.mariana;
    if (j && (!a || (j.em || 0) >= (a.em || 0))) return j.ids || [];
    return a && a.id ? [a.id] : [];
  }
  // os equipados, em ordem: espécies que ela tem (mescla estranha ou espécie de versão nova ficam de fora), até as vagas
  function equipados() {
    var l = listaGravada().filter(function (id, i, x) { return x.indexOf(id) === i && quantos(id) && especie(id); });
    return l.length > cfg().equipar.base ? l.slice(0, vagas()) : l;   // a conta das matérias só quando passa da base
  }
  function equipado() { return equipados()[0] || null; }
  function estaJunto(id) { return equipados().indexOf(id) >= 0; }
  // a distância atrás dela do n-ésimo da fila (0 = o primeiro): nunca em cima do bebê (como o ET); o ET usa a do
  // último para ir atrás da fila (et-companheiro.js)
  S.distancia = function (n) {
    var d = cfg().distancia, J = window.Jogador;
    if (J && J.DIST_BEBE && !(J.montado && J.montado())) d = Math.max(d, J.DIST_BEBE + 16);
    return d + (n || 0) * cfg().entreMonstros;
  };
  // a lista gravada, sem repetir: conserva espécie de versão nova (save-e-mescla.md §6.6) e quem a vaga esconde
  function gravada() { return listaGravada().filter(function (id, i, l) { return typeof id === 'string' && l.indexOf(id) === i; }); }
  function gravar(ids, especieMudou) {
    var est = estado();
    var j = est.monstrosJuntos && est.monstrosJuntos.mariana, a = est.monstroCompanheiro && est.monstroCompanheiro.mariana;
    var em = Math.max(Date.now(), Math.max((j && j.em) || 0, (a && a.em) || 0) + 1);
    est.monstrosJuntos = { mariana: { ids: ids.slice(), em: em } };
    // o 1º que esta versão mostra, menos o da matéria (a versão de antes da fila só lê este campo e não o conhece)
    var primeiro = ids.filter(function (id) { var e = especie(id); return e && !e.daMateria && quantos(id); })[0] || null;
    est.monstroCompanheiro = { mariana: { id: primeiro, em: em } };
    if (R._etCompanheiro) R._etCompanheiro.rastro = [];
    S.ataques = {};
    try { R.Progresso.salvar(); } catch (e) { /* sem save (teste) */ }
    emitir({ tipo: 'equipou', especie: especieMudou });
    return true;
  }
  // levar mais um (espécie que ela tem, com vaga) no fim da fila (logo depois do último que aparece); null = deixar
  // todos em casa (a espécie de versão nova fica guardada). true = gravou
  function equipar(id) {
    var est = estado(), l = equipados(), g = gravada();
    if (!est) return false;
    if (id === null) return gravar(g.filter(function (x) { return !especie(x); }), null);
    if (!especie(id) || !quantos(id)) return false;
    if (l.indexOf(id) >= 0) return true;
    if (l.length >= vagas()) return false;
    g = g.filter(function (x) { return x !== id; });
    var depois = l.length ? g.indexOf(l[l.length - 1]) + 1 : 0;
    g.splice(depois, 0, id);
    return gravar(g, id);
  }
  // deixar um em casa (os outros continuam). true = gravou
  function deixar(id) {
    var est = estado();
    if (!est || equipados().indexOf(id) < 0) return false;
    return gravar(gravada().filter(function (x) { return x !== id; }), id);
  }
  // a MonsterBall pegou: +1 dessa espécie, gravado na hora (o da matéria não se pega: vem com a matéria completa)
  function registrarCaptura(id) {
    var est = estado(), e = especie(id);
    if (!est || typeof id !== 'string' || !ESPECIE.test(id) || (e && e.daMateria)) return false;
    var m = est.monstros = est.monstros || {};
    m[id] = (m[id] > 0 ? m[id] : 0) + 1;
    try { R.Progresso.salvar(); } catch (e) { /* sem save (teste) */ }
    return true;
  }
  function emitir(carga) { if (R.util && R.util.emit && R.EVENTOS.MONSTROS) R.util.emit(R.EVENTOS.MONSTROS, carga); }

  /* ================= A AJUDA NA LUTA (§5) ================= */
  // o dano de um ataque do monstro: fração do dano da espada pelo tipo, + bonusNivel por nível da arena de origem; mínimo 1
  function danoAjuda(id, danoEspada) {
    var e = especie(id), a = cfg().ajuda;
    if (!e) return 0;
    var f = (a.fator[e.tipo] || a.fator.facil) + a.bonusNivel * e.nivel;
    return Math.max(1, Math.round((danoEspada || 1) * f));
  }

  R.Monstros = {
    NOMES: NOMES, especies: especies, especie: especie, capturados: capturados, quantos: quantos,
    registrarEspecie: registrarEspecie, daMateria: daMateria, molde: molde, sprite: sprite,
    equipado: equipado, equipados: equipados, estaJunto: estaJunto, equipar: equipar, deixar: deixar, vagas: vagas, maisVagas: maisVagas,
    materiasTerminadas: materiasTerminadas, danoAjuda: danoAjuda, registrarCaptura: registrarCaptura,
    emitir: emitir,
  };

  R.registrarModulo({
    id: 'monstros',
    depurar: function () {
      return { equipados: equipados(), vagas: vagas(), capturados: capturados().map(function (c) { return c.id + '×' + c.qtd; }),
        bola: S.bola ? { alvo: S.bola.alvo, pegou: S.bola.pegou } : null, ataques: Object.keys(S.ataques || {}) };
    },
    // desenho junto dos personagens (ordenado por y) e a bola por cima: com o monstro equipado, a bola voando ou na arena
    camada: {
      // na arena sempre: o unicórnio e o ET também atacam (monstros-pets.js)
      ativo: function () {
        var BC = R.BosqueCombate;
        return !!(window.Jogador && S.itensDesenho && (S.bola || equipado() || (BC && BC.arena && BC.arena())));
      },
      itensDesenho: function (p, t, animar) { return S.itensDesenho(p, t, animar); },
      sobre: function (ctx, p, t, animar) { if (S.sobre) S.sobre(p, t, animar); },
    },
  });
})();
