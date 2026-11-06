/* Parquinho, parte 7: o portal na praça (Mapa.PREDIOS['portal-parquinho'], 1 × 1 tile; docs/contratos/parquinho.md).
   O desenho parado do mapa (o mesmo para todo mundo) é o portal DORMINDO: o anel de pedrinhas com o miolo cinza.
   Acordado (fase 1 do Reino.Parquinho), a camada do módulo 'parquinho-portal' pinta por cima o redemoinho de
   arco-íris e, com Animações, o brilho que pulsa, a coluna de luz e as faíscas subindo (sem Animações: parado).
   A fase é relida só quando o progresso muda (PROGRESSO, PROGRESSO_REMOTO, MAPA_MUDOU). Nada de DOM no carregamento. */
(function () {
  var R = window.Reino, P = R._predios.parquinho;
  var D = R.Interiores.desenho, ret = D.ret, elipse = D.elipse;
  var T = 16, X = 20, Y = 20;   // o tile do portal (lugar.js)

  function dormindo(ctx, px, py) {
    P.anelDePedras(ctx, px + 8, py + 9);
    elipse(ctx, px + 8, py + 9, 9, 5, R.Desenho.K);
    elipse(ctx, px + 8, py + 9, 8, 4, '#8e8aa8'); elipse(ctx, px + 8, py + 9, 5, 2, '#a9a6c0'); elipse(ctx, px + 8, py + 9, 2, 1, '#c4c2d6');
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
  var HALO = ['rgba(255,240,170,0.9)', 'rgba(255,240,170,0.55)', 'rgba(255,240,170,0.25)', 'rgba(255,240,170,0.55)'];
  var FAISCA = ['#ffffff', '#ffe066', '#ff9ed2', '#9fd8ff'];
  // y do item: logo depois da peça parada (pé em 12 - 0,01, mundo/mapa-desenho.js) e antes de quem pisa no tile
  function desenhar(p, t, animar) {
    var c = P.pintor(p), px = X * T, py = Y * T, cx = px + 8, cy = py + 9, i;
    if (animar) {                                                        // halo pulsando por fora do anel
      var f = Math.floor(t / 300) % 4;
      c.fillStyle = HALO[f];
      c.fillRect(cx - 12, cy - 1, 2, 3); c.fillRect(cx + 11, cy - 1, 2, 3); c.fillRect(cx - 4, cy - 8, 9, 1); c.fillRect(cx - 4, cy + 8, 9, 1);
      c.fillRect(cx - 9, cy - 6, 3, 1); c.fillRect(cx + 7, cy - 6, 3, 1); c.fillRect(cx - 9, cy + 6, 3, 1); c.fillRect(cx + 7, cy + 6, 3, 1);
    }
    P.redemoinho(c, cx, cy);
    if (animar) {
      var giro = Math.floor(t / 140) % 6;                                 // o miolo trocando de cor em degraus
      c.fillStyle = ['#ffffff', '#fff4cc', '#ffd1e6', '#e0f2ff', '#fff4cc', '#ffffff'][giro]; c.fillRect(cx - 2, cy - 1, 5, 3);
      for (i = 0; i < 2; i++) { c.fillStyle = i ? 'rgba(255,248,220,0.16)' : 'rgba(255,248,220,0.3)'; c.fillRect(cx - 3 + i * 2, cy - 5 - i * 9, 7 - i * 4, 9); }
      for (i = 0; i < 4; i++) {                                           // faíscas 2×2 subindo
        var k = ((t / 2000) + i * 0.25) % 1;
        c.fillStyle = FAISCA[i]; c.fillRect(px + 3 + i * 3 + Math.round(Math.sin(k * 6.3 + i) * 2), py + 6 - Math.round(k * 28), 2, 2);
      }
    } else {
      ret(c, px + 1, py + 2, 1, 3, '#ffe066'); ret(c, px, py + 3, 3, 1, '#ffe066');   // estrelinhas paradas
      ret(c, px + 14, py + 1, 1, 3, '#ffffff'); ret(c, px + 13, py + 2, 3, 1, '#ffffff');
    }
  }
  if (R.registrarModulo) R.registrarModulo({   // (a prévia dos interiores não carrega os módulos)
    id: 'parquinho-portal',
    camada: {
      ativo: function () { var c = R.Cena && R.Cena.atual(); return !!c && c.tipo === 'mapa' && liberado(); },
      itensDesenho: function (p, t, animar) { return [{ y: Y * T + 11.995, desenhar: function () { desenhar(p, t, animar); } }]; },
    },
  });
})();
