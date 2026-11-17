/* Treinadores de Monstros, parte dos outros bichinhos na luta (de sistemas/monstros.js, interno Reino._monstros;
   monstros.md §5). Pedido do Leandro (17/11): "todos os pets atacar no modo aventura". Numa arena, com a luta andando,
   além dos monstros equipados (monstros-ajuda.js) atacam:
     - o unicórnio, que está sempre com ela (o bebê a pé, ou montado): uma estrelinha de arco-íris do chifre;
     - o ET que ela levou (Reino.Viagem.companheiro): um raio verde.
   Cada um mira o inimigo ativo mais perto dela (até config.monstros.ajuda.alcance), a cada pets.<quem>.recargaMs, fora
   do compasso dos outros (recomeça a cada arena), com dano max(1, round(dano da espada × pets.<quem>.fator)). O tiro
   voa pets.vooMs e o dano entra quando ele chega (o inimigo pisca junto do acerto); vencido por eles segue o caminho
   da espada (BosqueCombate.ferir): XP, pergunta e drop como se fosse ela. O tiro fica em S.tiros[quem]
   { em, x0, y0, x, y, dano, alvo, arena, chegou } para o desenho (monstros-desenho.js). Roda a cada quadro desenhado,
   no `t` do quadro. Nada no save. node: true: só funções. */
(function () {
  var R = window.Reino;
  var S = R._monstros;
  var QUEM = ['unicornio', 'et'];
  var proximo = {}, arenaDoCompasso = null;   // por bichinho: o `t` a partir do qual ele ataca de novo (nesta arena)
  function cfg() { return R.config.monstros.ajuda; }

  // está com ela? o unicórnio sempre; o ET, se ela levou um
  function presente(quem) {
    if (!window.Jogador) return false;
    if (quem === 'unicornio') return true;
    var V = R.Viagem;
    return !!(V && V.companheiro && V.companheiro());
  }
  // de onde sai o tiro agora (px do jogo): só na hora do tiro (lê o rastro)
  function origem(quem) {
    var J = window.Jogador;
    if (quem === 'unicornio') {
      var m = J.posMontaria ? J.posMontaria() : { x: J.x, y: J.y, montado: false };
      return { x: m.x, y: m.y - (m.montado ? 16 : 10) };   // o chifre
    }
    var E = R._etCompanheiro;
    var q = E && E.rastro && E.rastro.length && E.pontoAtras ? E.pontoAtras(E.distancia()) : null;
    return q ? { x: q.x, y: q.y - 12 } : { x: J.x, y: J.y - 12 };   // sem rastro ainda (acabou de entrar): perto dela
  }
  // quem ataca agora
  S.petsNaLuta = function () { return QUEM.filter(presente); };

  S.tiros = {};
  S.quadroPets = function (t) {
    var BC = R.BosqueCombate, c = cfg(), P = c.pets, arena = BC && BC.arena ? BC.arena() : null;
    if (!arena) return;
    if (arena !== arenaDoCompasso) { arenaDoCompasso = arena; proximo = {}; S.tiros = {}; }   // arena nova: compasso novo
    if (S.parada()) return;
    // os tiros que chegaram: o dano entra agora
    QUEM.forEach(function (quem) {
      var a = S.tiros[quem];
      if (a && !a.chegou && t >= a.em + P.vooMs) { a.chegou = true; BC.ferir(a.alvo, a.dano); }
    });
    QUEM.forEach(function (quem, n) {
      if (!presente(quem)) return;
      var rec = P[quem].recargaMs, desvio = (n + 1) * rec / 3, p = proximo[quem];
      if (p === undefined || t < p - rec * 2) p = proximo[quem] = t + desvio;   // começa fora do compasso; relógio recomeçou
      if (t < p) return;
      var alvo = S.maisPerto(c.alcance);
      if (!alvo) { proximo[quem] = t + desvio; return; }   // sem inimigo perto: espera, mantendo o compasso
      var B = R.Bosque, dano = Math.max(1, Math.round((B && B.dano ? B.dano() : 1) * P[quem].fator)), o = origem(quem);
      proximo[quem] = t + rec;
      S.tiros[quem] = { em: t, x0: o.x, y0: o.y, x: alvo.x, y: alvo.y, dano: dano, alvo: alvo.id, arena: arena, chegou: false };
    });
  };
})();
