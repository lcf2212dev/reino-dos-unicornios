/* Treinadores de Monstros, parte dos outros bichinhos na luta (de sistemas/monstros.js, interno Reino._monstros;
   monstros.md §5). Pedido do Leandro (17/11): "todos os pets atacar no modo aventura". Numa arena, com a luta andando,
   além dos monstros equipados (monstros-ajuda.js) atacam:
     - o unicórnio, que está sempre com ela (o bebê a pé, ou montado): uma estrelinha de arco-íris do chifre;
     - o ET que ela levou (Reino.Viagem.companheiro): um raio verde.
   Cada um mira o inimigo ativo mais perto dela (até config.monstros.ajuda.alcance), a cada pets.<quem>.recargaMs, fora
   do compasso dos outros, com dano max(1, round(dano da espada × pets.<quem>.fator)). Vencido por eles segue o caminho
   da espada (BosqueCombate.ferir): XP, pergunta e drop como se fosse ela. O tiro fica em S.tiros[quem]
   { em, x0, y0, x, y, dano } para o desenho (monstros-desenho.js). Roda a cada quadro desenhado, no `t` do quadro.
   Nada no save. node: true: só funções. */
(function () {
  var R = window.Reino;
  var S = R._monstros;
  var QUEM = ['unicornio', 'et'];
  var proximo = {};   // por bichinho: o `t` a partir do qual ele ataca de novo
  function cfg() { return R.config.monstros.ajuda; }

  // de onde sai o tiro de cada um agora (px do jogo), ou null se ele não está com ela
  function origem(quem) {
    var J = window.Jogador;
    if (!J) return null;
    if (quem === 'unicornio') {
      var m = J.posMontaria ? J.posMontaria() : { x: J.x, y: J.y, montado: false };
      return { x: m.x, y: m.y - (m.montado ? 16 : 10) };   // o chifre
    }
    var V = R.Viagem, E = R._etCompanheiro;
    if (!V || !V.companheiro || !V.companheiro()) return null;
    var q = E && E.rastro && E.rastro.length && E.pontoAtras ? E.pontoAtras(E.distancia()) : null;
    return q ? { x: q.x, y: q.y - 12 } : { x: J.x, y: J.y - 12 };   // sem rastro ainda (acabou de entrar): perto dela
  }
  // quem ataca agora: o unicórnio sempre; o ET, se ela levou um
  S.petsNaLuta = function () { return QUEM.filter(function (q) { return !!origem(q); }); };

  S.tiros = {};
  S.quadroPets = function (t) {
    var BC = R.BosqueCombate, c = cfg(), P = c.pets;
    if (!BC || !BC.arena() || S.parada()) return;
    QUEM.forEach(function (quem, n) {
      var o = origem(quem), rec = P[quem].recargaMs, desvio = (n + 1) * rec / 3, p = proximo[quem];
      if (!o) return;
      if (p === undefined || t < p - rec * 2) p = proximo[quem] = t + desvio;   // começa fora do compasso; relógio recomeçou
      if (t < p) return;
      var alvo = S.maisPerto(c.alcance);
      if (!alvo) { proximo[quem] = t + desvio; return; }   // sem inimigo perto: espera, mantendo o compasso
      var B = R.Bosque, dano = Math.max(1, Math.round((B && B.dano ? B.dano() : 1) * P[quem].fator));
      if (!BC.ferir(alvo.id, dano)) return;
      proximo[quem] = t + rec;
      S.tiros[quem] = { em: t, x0: o.x, y0: o.y, x: alvo.x, y: alvo.y, dano: dano };
    });
  };
})();
