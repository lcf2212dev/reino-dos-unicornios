/* O ET que acompanha (et-companheiro), parte de desenho: o sprite do elenco (Reino.NPCs.sprite, já cacheado), um
   pouco acima do chão com sombrinha, balançando devagar; parado sem Animações. Divide o estado com
   et-companheiro.js em Reino._etCompanheiro. Nada de canvas novo por quadro (o espelho é cacheado por canvas). */
(function () {
  var R = window.Reino;
  var S = R._etCompanheiro;
  var ALTURA = 5, BALANCO = 1.5;   // px do jogo: quanto flutua acima do chão e quanto sobe e desce
  var espelhos = new WeakMap();
  function espelho(c) {
    var e = espelhos.get(c);
    if (!e) { e = window.PA.espelhado(c); espelhos.set(c, e); }
    return e;
  }
  var npcs = {};   // um NPC montado por id do elenco (o cache de sprite é pelo sprite)
  function npc(id) {
    var el = R.NPCs.ELENCO[id];
    if (!npcs[id] || npcs[id].sprite !== el.sprite) npcs[id] = { id: id, sprite: el.sprite };
    return npcs[id];
  }

  S.itensDesenho = function (p, t, animar) {
    var J = window.Jogador, id = R.Viagem.companheiro(), cena = R.Cena && R.Cena.atual();
    S.atualizar(J.x, J.y, cena && cena.id, J.olharX, J.olharY);
    var q = S.pontoAtras(S.distancia());
    if (!q) return [];
    // vira para o lado em que anda (guarda o último lado enquanto está parado)
    if (S.ultX !== null && Math.abs(q.x - S.ultX) > 0.05) S.espelhar = q.x < S.ultX;
    S.ultX = q.x;
    var n = npc(id);
    return [{ y: q.y, desenhar: function () {
      var quadro = 0, sobe = ALTURA;
      if (animar) {
        quadro = Math.floor(t / 700) % 2;
        if (t % 3900 < 140) quadro |= 2;   // pisca de vez em quando
        sobe += Math.sin(t / 520) * BALANCO;
      }
      if (J.sombra) J.sombra(p, q.x, q.y, 4);
      var spr = R.NPCs.sprite(n, quadro);
      p.sprite(S.espelhar ? espelho(spr) : spr, q.x, Math.round(q.y + 1 - sobe));
    } }];
  };
})();
