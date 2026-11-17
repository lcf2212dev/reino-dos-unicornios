/* A Teleportadora na praça da cidade (docs/contratos/vila.md §6): unicórnio de aura arco-íris no tile
   Reino.config.vila.teleportadoraMapa, olhando para a fonte. Entra em Mapa.CIDADE.objetos (tipo 'teleportadora',
   2 × 1: o tile da config e o da direita, onde fica a garupa) antes de o mapa ser montado, para os tiles virarem
   sólidos sem mexer no resto; no estático (I.OBJETOS.teleportadora) só a sombra. Ela e a aura vêm numa camada
   (módulo 'teleportadora-mapa'), na ordem por y com a Mariana (desenho em arte/teleportadora.js).
   Toque: encadeia Mapa.alvoObjeto e Mapa.alvoObjetoPerto (os do cofre continuam valendo); tocar nela chama
   Reino.Teleportadora.tocar('vila') (sistemas/teleportadora.js). */
(function () {
  var Mapa = window.Mapa, I = Mapa._interno, T = Mapa.T, R = window.Reino;
  var lugar = (R.config.vila && R.config.vila.teleportadoraMapa) || { x: 31, y: 20 };
  var OBJ = { tipo: 'teleportadora', x: lugar.x, y: lugar.y, w: 2, h: 1 };
  Mapa.CIDADE.objetos.push(OBJ);

  function objeto() { return (I.objetos || []).find(function (o) { return o.tipo === 'teleportadora'; }); }
  // o meio dela (a linha entre os 2 tiles) e a última fileira dos cascos, em px do jogo
  function centro(o) { return { x: o.x * T + o.w * T / 2, b: o.y * T + 14 }; }

  /* ----- estático: só a sombra de chão (ela vem pela camada) ----- */
  I.OBJETOS.teleportadora = function (ctx, o) {
    var c = centro(o);
    I.elipse(ctx, c.x, c.b + 1, 15, 2, 'rgba(58,36,70,0.12)');
  };

  /* ----- a camada ----- */
  if (R.registrarModulo) R.registrarModulo({ id: 'teleportadora-mapa',
    camada: {
      ativo: function () { return !!(R.Cena && R.Cena.atual && R.Cena.atual().tipo === 'mapa' && objeto() && R.TeleportadoraArte); },
      itensDesenho: function (p, t, animar) {
        var o = objeto(), c = centro(o), A = R.TeleportadoraArte, pe = o.y * T + 12 - 0.005;   // antes de quem pisa a fileira dela
        return [{ y: pe, desenhar: function () {
          var ctx = p.ctx, e = p.escala;
          ctx.save();
          ctx.setTransform(e, 0, 0, e, -Math.round(p.cam.x * e), -Math.round(p.cam.y * e));
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(A.imagem(A.fase(t, animar)), c.x - A.CX, c.b - A.BASE);
          A.brilhos(function (x, y, w, h, cor) { ctx.fillStyle = cor; ctx.fillRect(x, y, w, h); }, c.x, c.b, t, animar);
          ctx.restore();
        } }];
      },
    } });

  /* ----- toque (encadeado: o que não for ela segue para o anterior, o do cofre) ----- */
  function agir() { return R.Teleportadora ? R.Teleportadora.tocar('vila') : Promise.resolve(); }
  function nela(o, tx, ty) { return tx >= o.x && tx < o.x + o.w && ty >= o.y && ty < o.y + o.h; }
  var alvoAntes = Mapa.alvoObjeto, pertoAntes = Mapa.alvoObjetoPerto;
  // em px do jogo: o desenho sobe ~1,5 tile acima dos tiles dela; ela para num vizinho livre, o mais perto
  Mapa.alvoObjeto = function (wx, wy) {
    var o = objeto();
    if (!o || wx < o.x * T - 4 || wx >= (o.x + o.w) * T + 4 || wy < o.y * T - 24 || wy >= (o.y + o.h) * T) {
      return alvoAntes ? alvoAntes(wx, wy) : null;
    }
    var de = (window.Jogador && Jogador.tile()) || { x: o.x, y: o.y + 1 }, melhor = null;
    var vizinhos = [{ x: o.x - 1, y: o.y, olhar: { x: 1, y: 0 } }, { x: o.x, y: o.y + 1, olhar: { x: 0, y: -1 } },
      { x: o.x + 1, y: o.y + 1, olhar: { x: 0, y: -1 } }, { x: o.x, y: o.y - 1, olhar: { x: 0, y: 1 } },
      { x: o.x + 1, y: o.y - 1, olhar: { x: 0, y: 1 } }, { x: o.x + o.w, y: o.y, olhar: { x: -1, y: 0 } }];
    vizinhos.forEach(function (v) {
      if (Mapa.solido(v.x, v.y)) return;
      var d = Math.abs(v.x - de.x) + Math.abs(v.y - de.y);
      if (!melhor || d < melhor.d) melhor = { d: d, v: v };
    });
    if (!melhor) return alvoAntes ? alvoAntes(wx, wy) : null;
    return { tipo: 'objeto', id: 'teleportadora', tile: { x: melhor.v.x, y: melhor.v.y }, olhar: melhor.v.olhar, agir: agir };
  };
  // Enter/Espaço: ela num dos 4 vizinhos (o da direção do olhar primeiro)
  Mapa.alvoObjetoPerto = function (tl, olhar) {
    var o = objeto();
    if (o) {
      var viz = [olhar && { x: olhar.x, y: olhar.y }, { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];
      for (var i = 0; i < viz.length; i++) {
        var v = viz[i];
        if (v && (v.x || v.y) && nela(o, tl.x + v.x, tl.y + v.y)) return { tipo: 'objeto', id: 'teleportadora', tile: { x: tl.x, y: tl.y }, olhar: v, agir: agir };
      }
    }
    return pertoAntes ? pertoAntes(tl, olhar) : null;
  };
})();
