/* Treinadores de Monstros (docs/contratos/monstros.md): a coleção de monstros da Mariana e o monstro equipado, que anda
   atrás dela no lugar do ET (só 1 companheiro) e ajuda na luta. Aqui: os nomes das espécies, os dois campos do save
   (`monstros`, `monstroCompanheiro`), Reino.Monstros (espécies, capturados, equipar, dano da ajuda) e o módulo
   'monstros' com a camada de desenho. Cria o interno Reino._monstros, que as partes dividem:
     t                 o `t` do último quadro desenhado (ms; virtual no modo congelado)
     bola              a MonsterBall voando (monstros-bola.js): { alvo, tipo, arena, especie, pegou, em (Date.now), x0, y0, x, y, chegou } | null
     ataque            o último pulo do monstro (monstros-ajuda.js): { em, x, y, dx, dy } | null
     itensDesenho, sobre  o desenho (monstros-desenho.js);  quadroBola(), quadroAjuda(t)  (as partes de regra)
     parada(), maisPerto(raio)  luta parada? / o inimigo ativo mais perto dela (monstros-bola.js)
   Partes: monstros-bola.js (jogar a bola), monstros-ajuda.js (o ataque dele), monstros-desenho.js (seguir e desenhar),
   sistemas/bosque-combate-monstros.js (ferir/capturar no combate). O rastro é o do ET (Reino._etCompanheiro).
   node: true: nada de DOM, Progresso nem Cena no carregamento (só dentro das funções). */
(function () {
  var R = window.Reino;
  var S = R._monstros = { t: 0, bola: null, ataque: null };
  var ESPECIE = /^[a-z0-9]+-[a-z0-9]+$/;
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
  function estado() { try { return R.Progresso.estado(); } catch (e) { return null; } }

  /* ================= ESPÉCIES ================= */
  // todas as espécies: as de cada arena registrada (o Bosque primeiro), na ordem dos tipos da config
  function especies() {
    var A = R.Arenas, lista = [];
    if (!A) return lista;
    A.ids().forEach(function (arena) {
      var c = A.cfg(arena), d = A.def(arena) || {}, nivel = arena === 'bosque' ? 1 : (c.nivel || 1);
      Object.keys(c.tipos || {}).forEach(function (tipo) {
        var id = arena + '-' + tipo;
        lista.push({ id: id, arena: arena, tipo: tipo, nome: NOMES[id] || d.nome || id, nivel: nivel,
          lugar: d.nome || arena, curto: d.curto || d.nome || arena, emoji: d.emoji || null });
      });
    });
    return lista;
  }
  function especie(id) {
    if (typeof id !== 'string') return null;
    var l = especies();
    for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i];
    return null;
  }
  // os que ela tem (espécie conhecida, quantos > 0), na ordem das espécies
  function capturados() {
    var est = estado(), m = (est && est.monstros) || {};
    return especies().filter(function (e) { return m[e.id] > 0; }).map(function (e) { return { id: e.id, qtd: m[e.id], def: e }; });
  }
  function quantos(id) { var est = estado(), m = est && est.monstros; return m && m[id] > 0 ? m[id] : 0; }

  /* ================= O COMPANHEIRO (só 1: o monstro ou o ET) ================= */
  function brutoMonstro() {
    var est = estado(), m = est && est.monstroCompanheiro && est.monstroCompanheiro.mariana, id = m && m.id;
    if (!id || !quantos(id) || !especie(id)) return null;
    return { id: id, em: m.em || 0 };
  }
  function brutoEt() {
    var V = R.Viagem, est = estado(), id = V && V.companheiroBruto ? V.companheiroBruto() : null;
    if (!id) return null;
    var m = est && est.etCompanheiro && est.etCompanheiro.mariana;
    return { id: id, em: (m && m.em) || 0 };
  }
  // o equipado: o monstro, se o ET não foi escolhido depois (dois aparelhos: vale o `em` maior; empate = o monstro)
  function equipado() {
    var mo = brutoMonstro();
    if (!mo) return null;
    var et = brutoEt();
    return et && et.em > mo.em ? null : mo.id;
  }
  // equipar (espécie que ela tem) ou tirar (null); tira o ET. true = gravou
  function equipar(id) {
    var est = estado();
    if (!est || (id !== null && (!especie(id) || !quantos(id)))) return false;
    if (id !== null && R.Viagem && R.Viagem.companheiroBruto && R.Viagem.companheiroBruto()) R.Viagem.escolherCompanheiro(null);
    var m = est.monstroCompanheiro && est.monstroCompanheiro.mariana;
    est.monstroCompanheiro = { mariana: { id: id, em: Math.max(Date.now(), ((m && m.em) || 0) + 1) } };
    if (R._etCompanheiro) R._etCompanheiro.rastro = [];
    S.ataque = null;
    try { R.Progresso.salvar(); } catch (e) { /* sem save (teste) */ }
    emitir({ tipo: 'equipou', especie: id });
    return true;
  }
  // a MonsterBall pegou: +1 dessa espécie, gravado na hora
  function registrarCaptura(id) {
    var est = estado();
    if (!est || typeof id !== 'string' || !ESPECIE.test(id)) return false;
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
    equipado: equipado, equipar: equipar, danoAjuda: danoAjuda, registrarCaptura: registrarCaptura,
    // o ET some quando o monstro está equipado (et-companheiro.js pergunta)
    tiraEt: function () { return !!equipado(); },
    emitir: emitir,
  };

  R.registrarModulo({
    id: 'monstros',
    depurar: function () {
      return { equipado: equipado(), capturados: capturados().map(function (c) { return c.id + '×' + c.qtd; }),
        bola: S.bola ? { alvo: S.bola.alvo, pegou: S.bola.pegou } : null, ataque: !!S.ataque };
    },
    // desenho junto dos personagens (ordenado por y) e a bola por cima: com o monstro equipado ou a bola voando
    camada: {
      ativo: function () { return !!(window.Jogador && S.itensDesenho && (S.bola || equipado())); },
      itensDesenho: function (p, t, animar) { return S.itensDesenho(p, t, animar); },
      sobre: function (ctx, p, t, animar) { if (S.sobre) S.sobre(p, t, animar); },
    },
  });
})();
