/* Treinadores de Monstros, parte da MonsterBall (de sistemas/monstros.js, interno Reino._monstros; monstros.md §4, §5):
   numa arena, joga 1 MonsterBall da mochila no inimigo ativo mais perto dela (até config.monstros.alcanceBola). O gasto
   e o sorteio (chanceCaptura; Reino.Itens.rolar('monstros:bola'), pela chave no modo congelado) são na hora, e o alvo
   fica preso enquanto ela voa (BosqueCombate.prender: parado, nem a espada nem a ajuda o ferem; prêmio nunca dobra).
   Ao chegar (bolaVooMs): pegou → BosqueCombate.capturar (some sem XP, pergunta nem drop) e só então a captura se
   grava; escapou → ele é solto e a bola balança e abre (bolaBalancoMs). Sai o 'capturou' ou o 'escapou'
   (EVENTOS.MONSTROS; o aviso é do ui/monstros.js). Não chegou (trocou de cena) ou não deu para capturar: a bola volta
   para a mochila ('voltou'), nada se perde. Três bolas (`tipo`): 'mini' (bola-mini, chanceMini), 'comum'
   (bola-monster, chanceCaptura) e 'super' (bola-super, chanceSuper: pega sempre). Acrescenta a Reino.Monstros: podeJogar(tipo?), jogar(tipo?), bolas(tipo?),
   ITEM_BOLA. node: true. */
(function () {
  var R = window.Reino;
  var S = R._monstros, M = R.Monstros;
  var ATIVOS = { vagando: 1, perseguindo: 1, voltando: 1, recuando: 1 };
  var proxima = 0;   // Date.now() a partir do qual pode jogar outra (a bola corre no relógio: virtual no modo congelado)
  var ITEM = { mini: 'bola-mini', comum: 'bola-monster', super: 'bola-super' };
  function cfg() { return R.config.monstros; }
  function chance(tipo) { return tipo === 'super' ? cfg().chanceSuper : tipo === 'mini' ? cfg().chanceMini : cfg().chanceCaptura; }
  function tipoDe(t) { return ITEM[t] ? t : 'comum'; }

  // os uids das bolas da mochila (só as da mochila se usam): de um tipo ('mini' | 'comum' | 'super') ou de todos
  function bolas(tipo) {
    var It = R.Itens, r = [];
    if (!It || !It.mochila) return r;
    try { if (!R.Progresso.estado()) return r; } catch (e) { return r; }
    It.mochila().forEach(function (s) { if (s.def.tipo === 'bola' && (!tipo || s.id === ITEM[tipo])) Array.prototype.push.apply(r, s.uids); });
    return r;
  }
  function parada() {
    var C = R.Cena, UI = R.UI;
    return !!(C && C.bloqueado && C.bloqueado()) || !!(UI && UI.temTela && UI.temTela()) || !!(R._bosqueCombate || {}).desmaio;
  }
  // o inimigo ativo mais perto dela, até `raio`
  function maisPerto(raio) {
    var BC = R.BosqueCombate, J = window.Jogador, melhor = null, dm = raio;
    if (!BC || !J) return null;
    BC.fantasmas().forEach(function (f) {
      if (!ATIVOS[f.estado]) return;
      var d = Math.hypot(f.x - J.x, f.y - J.y);
      if (d <= dm) { dm = d; melhor = f; }
    });
    return melhor;
  }

  /** tipo 'mini' | 'comum' (padrão) | 'super' → { ok: true, alvo, arena, uid, tipo } | { ok: false, motivo: 'fora-arena' | 'parada' |
      'recarga' | 'sem-bola' | 'longe' } */
  function podeJogar(tipo) {
    tipo = tipoDe(tipo);
    var BC = R.BosqueCombate, arena = BC && BC.arena ? BC.arena() : null, nao = function (m) { return { ok: false, motivo: m }; };
    if (!arena) return nao('fora-arena');
    if (parada()) return nao('parada');
    if (S.bola || Date.now() < proxima) return nao('recarga');
    var uids = bolas(tipo);
    if (!uids.length) return nao('sem-bola');
    var alvo = maisPerto(cfg().alcanceBola);
    if (!alvo) return nao('longe');
    return { ok: true, alvo: alvo, arena: arena, uid: uids[0], tipo: tipo };
  }

  /** joga uma bola do tipo ('mini' | 'comum' padrão | 'super'): true se jogou (gastou 1 dela) */
  function jogar(tipo) {
    var p = podeJogar(tipo);
    if (!p.ok) return false;
    var r = R.Itens.usar(p.uid);   // o ramo 'bola' do Itens.usar confere o podeJogar de novo e gasta
    if (!r || !r.ok) return false;
    var especie = p.arena + '-' + p.alvo.tipo, J = window.Jogador;
    var pegou = R.Itens.rolar('monstros:bola') < chance(p.tipo);
    R.BosqueCombate.prender(p.alvo.id);
    S.bola = { alvo: p.alvo.id, tipo: p.alvo.tipo, arena: p.arena, especie: especie, pegou: pegou, bola: p.tipo, super: p.tipo === 'super', mini: p.tipo === 'mini', em: Date.now(),
      x0: J.x, y0: J.y - 10, x: p.alvo.x, y: p.alvo.y, chegou: false };
    proxima = Date.now() + cfg().recargaBolaMs;
    if (R.Som) R.Som.tocar('toque');
    M.emitir({ tipo: 'jogou', especie: especie });
    return true;
  }

  // a bola não pegou ninguém de verdade: volta para a mochila (gastou no jogar)
  function devolver(b) {
    if (R.BosqueCombate && R.BosqueCombate.soltar) R.BosqueCombate.soltar(b.alvo, b.arena);
    R.Itens.ganhar(ITEM[b.bola] || ITEM.comum);
    b.pegou = false; b.voltou = true;
  }
  function fim() {
    var b = S.bola;
    if (!b) return;
    S.bola = null;
    if (!b.chegou) devolver(b);   // trocou de cena com ela no ar
    if (R.Som) R.Som.tocar(b.pegou ? 'acerto' : 'toque');
    M.emitir({ tipo: b.voltou ? 'voltou' : b.pegou ? 'capturou' : 'escapou', especie: b.especie, arena: b.arena });
  }
  // a cada quadro desenhado (monstros-desenho.js): a bola segue o alvo voando, chega, balança e termina
  S.quadroBola = function () {
    var b = S.bola, BC = R.BosqueCombate;
    if (!b) return;
    if (!BC || BC.arena() !== b.arena) { fim(); return; }
    var dt = Date.now() - b.em, c = cfg();
    if (!b.chegou) {
      var f = BC.fantasmas().filter(function (x) { return x.id === b.alvo; })[0];
      if (f && (ATIVOS[f.estado] || f.estado === 'preso')) { b.x = f.x; b.y = f.y; }
      if (dt >= c.bolaVooMs) {
        b.chegou = true;
        if (b.pegou) {
          if (BC.capturar(b.alvo)) M.registrarCaptura(b.especie);   // só agora grava: o alvo estava preso, sem prêmio dobrado
          else devolver(b);
        } else BC.soltar(b.alvo, b.arena);
        if (R.Som) R.Som.tocar(b.pegou ? 'plim' : 'toque');
      }
    } else if (dt >= c.bolaVooMs + c.bolaBalancoMs) fim();
  };

  S.parada = parada; S.maisPerto = maisPerto;   // também do monstros-ajuda.js
  M.podeJogar = podeJogar;
  M.jogar = jogar;
  M.bolas = bolas;
  M.ITEM_BOLA = ITEM;

  R.registrarModulo({
    id: 'monstros-bola',
    // trocou de cena com a bola no ar: termina na hora (o alvo é solto na arena dele e a bola volta)
    iniciar: function () { R.util.on(R.EVENTOS.CENA, function () { if (S.bola) fim(); }); },
  });
})();
