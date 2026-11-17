/* Treinadores de Monstros, parte da ajuda na luta (de sistemas/monstros.js, interno Reino._monstros; monstros.md §5):
   numa arena, com a luta andando, cada monstro equipado pula no inimigo ativo mais perto dela (até
   config.monstros.ajuda.alcance) a cada ajuda.recargaMs, cada um no seu tempo (o 2º meio passo depois do 1º…), e tira
   Monstros.danoAjuda (fração do dano da espada dela). Vencido por ele segue o caminho da espada (BosqueCombate.ferir):
   XP, pergunta e drop como se fosse ela. Guarda o pulo em S.ataques[especie] { em, x, y, dano } para o desenho
   (monstros-desenho.js). Roda a cada quadro desenhado, no `t` do quadro. node: true: só funções. */
(function () {
  var R = window.Reino;
  var S = R._monstros, M = R.Monstros;
  var proximo = {};   // por espécie: o `t` a partir do qual ele ataca de novo
  function cfg() { return R.config.monstros.ajuda; }

  S.quadroAjuda = function (t) {
    var BC = R.BosqueCombate, ids = M.equipados(), rec = cfg().recargaMs;
    if (!ids.length || !BC || !BC.arena() || S.parada()) return;
    S.ataques = S.ataques || {};
    var alvo = S.maisPerto(cfg().alcance);
    ids.forEach(function (id, n) {
      var p = proximo[id];
      if (p === undefined || t < p - rec * 2) p = proximo[id] = t + n * rec / ids.length;   // escalonados; relógio recomeçou
      if (t < p) return;
      // sem inimigo perto: o tempo dele anda, mantendo a escala (senão todos atacariam juntos quando um chegar)
      if (!alvo) { proximo[id] = t + n * rec / ids.length; return; }
      var B = R.Bosque, dano = M.danoAjuda(id, B && B.dano ? B.dano() : 1), r = BC.ferir(alvo.id, dano);
      if (!r) return;
      proximo[id] = t + rec;
      S.ataques[id] = { em: t, x: alvo.x, y: alvo.y, dano: dano };
      alvo = S.maisPerto(cfg().alcance);   // o golpe pode ter vencido o alvo
    });
  };
})();
