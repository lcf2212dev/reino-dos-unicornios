/* Parquinho, parte 7: o portal na praça (Mapa.PREDIOS['portal-parquinho'], 1 × 1 tile; docs/contratos/parquinho.md).
   O desenho parado do mapa (o mesmo para todo mundo) é o portal DORMINDO: o redemoinho cinza (Reino.Portal.vortice).
   Acordado (fase 1 do Reino.Parquinho), a camada do módulo 'parquinho-portal' pinta por cima o redemoinho de
   todo portal e, com Animações, a coluna de luz e os brilhinhos subindo (sem Animações: parado).
   A fase é relida só quando o progresso muda (PROGRESSO, PROGRESSO_REMOTO, MAPA_MUDOU). Nada de DOM no carregamento. */
(function () {
  var R = window.Reino, P = R._predios.parquinho;
  var D = R.Interiores.desenho, ret = D.ret, elipse = D.elipse;
  var T = 16, X = 20, Y = 20;   // o tile do portal (lugar.js)
  var CINZA = ['#6e6a88', '#8e8aa8', '#a9a6c0', '#c4c2d6'];

  function dormindo(ctx, px, py) {
    // o redemoinho de todo portal (arte/portal.js), apagado: aro e espiral cinzas
    R.Portal.vortice(ctx, px + 8, py + 9, CINZA, 0, CINZA);
  }
  if (window.Mapa && Mapa.PREDIOS) Mapa.PREDIOS['portal-parquinho'] = dormindo;

  /* ---------- o portal acordado (camada no mapa) ---------- */
  var acordado = null;
  var U = R.util, EV = R.EVENTOS;
  if (U && U.on && EV) [EV.PROGRESSO, EV.PROGRESSO_REMOTO, EV.MAPA_MUDOU].forEach(function (e) { U.on(e, function () { acordado = null; }); });
  function liberado() {
    if (acordado === null) { try { acordado = !!(R.Parquinho && R.Parquinho.liberado()); } catch (e) { acordado = false; } }
    return acordado;
  }
  // acordado: o redemoinho arco-íris girando e, com Animações, a coluna de luz e os brilhinhos (arte/portal.js)
  function desenhar(p, t, animar) {
    var c = P.pintor(p), px = X * T, py = Y * T;
    R.Portal.vortice(c, px + 8, py + 9, R.Portal.AZUL, animar ? Math.floor(t / 160) % 6 : 0);
    if (animar) R.Portal.brilho(c, px + 8, py + 9, t);
  }
  if (R.registrarModulo) R.registrarModulo({   // (a prévia dos interiores não carrega os módulos)
    id: 'parquinho-portal',
    camada: {
      ativo: function () { var c = R.Cena && R.Cena.atual(); return !!c && c.tipo === 'mapa' && liberado(); },
      itensDesenho: function (p, t, animar) { return [{ y: Y * T + 11.995, desenhar: function () { desenhar(p, t, animar); } }]; },
    },
  });
})();
