/* Treinadores de Monstros, parte da ajuda na luta (de sistemas/monstros.js, interno Reino._monstros; monstros.md §5):
   numa arena, com a luta andando, o monstro equipado pula no inimigo ativo mais perto dela (até config.monstros.ajuda.alcance)
   a cada ajuda.recargaMs e tira Monstros.danoAjuda (fração do dano da espada dela). Vencido por ele segue o caminho da
   espada (BosqueCombate.ferir): XP, pergunta e drop como se fosse ela. Guarda o pulo em S.ataque { em, x, y, dano } para o
   desenho (monstros-desenho.js). Roda a cada quadro desenhado, no `t` do quadro. node: true: só funções. */
(function () {
  var R = window.Reino;
  var S = R._monstros, M = R.Monstros;
  var proximo = 0;   // `t` a partir do qual ele ataca de novo
  function cfg() { return R.config.monstros.ajuda; }

  S.quadroAjuda = function (t) {
    var BC = R.BosqueCombate, id = M.equipado();
    if (t < proximo - cfg().recargaMs * 2) proximo = 0;   // o relógio do quadro recomeçou (outra aba, teste)
    if (!id || !BC || !BC.arena() || S.parada() || t < proximo) return;
    var alvo = S.maisPerto(cfg().alcance);
    if (!alvo) return;
    var B = R.Bosque, dano = M.danoAjuda(id, B && B.dano ? B.dano() : 1), r = BC.ferir(alvo.id, dano);
    if (!r) return;
    proximo = t + cfg().recargaMs;
    S.ataque = { em: t, x: alvo.x, y: alvo.y, dano: dano };
  };
})();
