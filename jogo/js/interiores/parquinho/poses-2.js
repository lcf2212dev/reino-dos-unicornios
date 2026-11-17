/* Parquinho, parte 6: como ela e o unicórnio brincam nos brinquedos da fase 2 (carrossel, pula-pula, tanque de
   bolinhas), pelos ajudantes P.H de poses.js. Só chegam aqui com todas as matérias completas (antes, o toque mostra a
   surpresa: interiores/parquinho/brincar.js). Sem Animações: a pose parada. Nada roda no carregamento. */
(function () {
  var R = window.Reino;
  var P = R._predios.parquinho, GEO = P.GEO, H = P.H, reg = P.registrarPose;

  /* ---------- carrossel: os cavalinhos giram; ela monta no rosa e o unicórnio vai em pé no lugar do amarelo ---------- */
  reg('carrossel', {
    esconde: true,
    sons: [[0.05, 'selecionar'], [0.3, 'plim'], [0.6, 'plim'], [0.95, 'estrela']],
    itens: function (p, st, e, animar) {
      var o = H.origem(st), g = GEO.carrossel, c = P.pintor(p);
      // gira devagar no começo e no fim; parado: um quarto de volta
      var k = e / st.dur, ang = animar ? 1.6 * (k * k * (3 - 2 * k)) + 0.08 : 0.2;
      var sobe = animar ? Math.round(Math.sin(e / 260) * 1.5) : 0;
      return [H.item(H.base(st), function () {
        var cavalo = function (n, x, y, dir) {
          if (n === 2) { H.spr(p, H.uni('lado'), x, y, dir < 0); return; }
          var dy = n % 2 ? -sobe : sobe;
          P.cavalinho(c, x, y + dy, n, dir, o.y + g.teto);
          if (n === 0) H.spr(p, H.ela(true, 'lado'), x - dir, y + dy - 6, dir < 0);
        };
        P.giro(o.x, o.y, ang, function (n, x, y, dir) { if (y < o.y + g.cy) cavalo(n, x, y, dir); });
        P.mastro(c, o.x, o.y);
        P.giro(o.x, o.y, ang, function (n, x, y, dir) { if (y >= o.y + g.cy) cavalo(n, x, y, dir); });
      })];
    },
  });

  /* ---------- pula-pula: os dois pulam, um de cada vez, e a lona afunda quando eles caem ---------- */
  reg('pulapula', {
    sons: [[0.1, 'toque'], [0.3, 'toque'], [0.5, 'toque'], [0.7, 'toque'], [0.95, 'plim']],
    itens: function (p, st, e, animar) {
      var o = H.origem(st), g = GEO.pulapula, c = P.pintor(p);
      function altura(fase) { return animar ? Math.round(Math.abs(Math.sin((e / 820 + fase) * Math.PI)) * 14) : (fase ? 0 : 9); }
      var he = altura(0), hu = altura(0.5), chao = o.y + g.cy + 2;
      return [H.item(H.base(st), function () {
        [[g.ela, he], [g.uni, hu]].forEach(function (q) {
          var x = o.x + q[0];
          if (q[1] < 3) { c.fillStyle = '#1e2a5c'; c.fillRect(x - 6, chao - 1, 13, 2); }   // a lona afundando
          H.sombra(p, x, chao, Math.max(3, 7 - Math.round(q[1] / 6)));
        });
        H.spr(p, H.uni('frente', hu > 8 ? 1 : 0), o.x + g.uni, chao - hu, false);
        H.spr(p, H.ela(false, 'frente', he > 8 ? 1 : 0), o.x + g.ela, chao + 1 - he, false);
      })];
    },
  });

  /* ---------- tanque de bolinhas: ela pula para dentro, as bolinhas voam; o unicórnio vai junto e os dois saem ---------- */
  var VOAM = [[-9, 0.0], [7, 0.3], [-3, 0.55], [11, 0.8], [-12, 0.45], [4, 0.15]];
  var CORES = ['#ff5c6a', '#ffe066', '#5fb4ff', '#6fdc8c', '#ff7eb6', '#a66bff'];
  reg('bolinhas', {
    sons: [[0.12, 'splash'], [0.3, 'splash'], [0.6, 'bolhas'], [0.95, 'plim']],
    itens: function (p, st, e, animar) {
      var o = H.origem(st), g = GEO.bolinhas, c = P.pintor(p), k = animar ? e / st.dur : 0.5;
      var linha = o.y + g.superficie + 2;                                  // as bolinhas cobrem daqui para baixo
      var dentroEla = { x: o.x + g.ela, y: linha + 8 }, dentroUni = { x: o.x + g.uni, y: linha + 6 };
      var fora = { x: st.de.x, y: st.de.y };
      function onde(dentro, ida, volta, alto) {
        if (k < ida[0]) return { x: fora.x, y: fora.y, chao: true };
        if (k < ida[1]) return H.arco(fora, dentro, H.trecho(k, ida[0], ida[1]), alto);
        if (k < volta[0]) return { x: dentro.x, y: dentro.y + (animar ? Math.round(Math.sin(e / 300 + alto) * 1.5) : 0) };
        if (k < volta[1]) return H.arco(dentro, fora, H.trecho(k, volta[0], volta[1]), alto);
        return { x: fora.x, y: fora.y, chao: true };
      }
      var ela = onde(dentroEla, [0, 0.14], [0.84, 0.97], 12), uni = onde(dentroUni, [0.18, 0.32], [0.86, 0.99], 10);
      if (ela.chao) ela.x += 6;
      return [H.item(H.base(st), function () {
        [[uni, true], [ela, false]].forEach(function (q) {
          var pos = q[0], img = q[1] ? H.uni('frente') : H.ela(false, 'frente');
          if (pos.chao) { H.sombra(p, pos.x, pos.y, q[1] ? 8 : 5); H.spr(p, img, pos.x, pos.y, false); return; }
          H.faixa(p, -9999, linha + 1, function () { H.spr(p, img, pos.x, pos.y, false); });
        });
        // as bolinhas da frente por cima da cintura deles, e a parede da frente
        H.faixa(p, linha, o.y + 21, function () { P.bolas(c, o.x + 4, o.y + 7, 40, 14, 3); });
        P.paredeBolinhas(c, o.x, o.y);
        if (animar && k > 0.12 && k < 0.84) VOAM.forEach(function (v, i) {   // bolinhas pulando
          var f = (e / 700 + v[1]) % 1, x = o.x + g.ela + v[0] + (i > 2 ? 16 : 0), y = linha - Math.round(Math.sin(f * Math.PI) * 14);
          c.fillStyle = CORES[i]; c.fillRect(x - 1, y, 3, 1); c.fillRect(x, y - 1, 1, 3);
        });
      })];
    },
  });
})();
