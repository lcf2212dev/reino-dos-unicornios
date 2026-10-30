/* Kit de volume das fachadas, parte 2 (soma ao Mapa.fachada.kit, sem apagar o que existir). Quem usa:
   mundo/predios-2.js e os fora.js de português, matemática e geografia, sempre dentro da função de desenho.
   Só desenha: textura com Reino.Desenho.sorte (fixa por posição), nada de Math.random. Em px do jogo:
   - telhadoVolume(ctx, x, y, w, h, cor, meia): telhado em fileiras (junta a cada 3 px, borda recortada, clara em
     cima e escura embaixo), luz na água esquerda e sombra na direita; meia(j) = meia largura (padrão: triângulo w×h)
   - fundacaoBlocos(ctx, x, y, w, h, cor): fundação de pedra em três tons, com contorno em cima
   - quinas(ctx, x, y, w, h): luz de 1 px na quina esquerda e sombra de 3 px na direita
   - lanterna(ctx, x, y): lanterninha de parede (y = topo)
   - tabuasH / blocos(…, alto, larg) / azulejos(ctx, x, y, w, h, cor): parede de tábuas deitadas, pedra ou tijolo, azulejo
   - moitas(ctx, x0, x1, yb, cx, livre): moitinhas com flor ao longo do pé, pulando a porta (cx ± livre)
   - sombraBeiral(ctx, x, y, w): sombra de 2 px do beiral na parede; manchas(ctx, x, y, w, h, cor): reboco manchado
   - vr(ctx, x, y, w, h, c): retângulo arredondado ao pixel */
(function () {
  var Mapa = window.Mapa;
  var K = Mapa.fachada.kit = Mapa.fachada.kit || {};
  // telhado em fileiras legíveis: tom por fileira, borda recortada, luz na água esquerda e sombra na direita.
  // meia(j) = meia largura na linha j (padrão: o triângulo w×h)
  K.telhadoVolume = function (ctx, x, y, w, h, cor, meia) {
    var De = window.Reino.Desenho, cx = Math.round(x + w / 2), nf = Math.max(1, Math.floor((h - 1) / 3));
    meia = meia || function (j) { return window.Mapa.fachada.meiaTri(w, h, j); };
    for (var j = 1; j < h; j++) {
      var m = meia(j), fil = Math.floor((j - 1) / 3), junta = (j - 1) % 3 === 2;
      if (cor && m > 1) {
        var t = De.misturar(De.clarear(cor, 0.22), De.escurecer(cor, 0.18), Math.min(1, fil / nf));
        K.vr(ctx, cx - m + 1, y + j, m * 2 - 2, 1, junta ? De.escurecer(cor, 0.42) : t);
        // borda de baixo recortada: a telha desce no meio, a junta sobe nas pontas
        if (junta) for (var bx = cx - m + 2 + (fil % 2) * 2; bx + 1 < cx + m - 1; bx += 4) K.vr(ctx, bx, y + j, 2, 1, t);
        else if ((j - 1) % 3 === 0) for (var lx = cx - m + 2 + (fil % 2) * 2; lx < cx + m - 2; lx += 4) K.vr(ctx, lx, y + j, 2, 1, De.clarear(t, 0.3));
      }
      K.vr(ctx, cx, y + j, Math.max(0, m - 1), 1, 'rgba(58,36,70,0.16)');
      K.vr(ctx, cx - m + 1, y + j, 2, 1, 'rgba(255,255,255,0.5)');
      K.vr(ctx, cx + m - 3, y + j, 2, 1, 'rgba(58,36,70,0.25)');
    }
  };
  // fundação de pedra em três tons (h de 4 a 5 px), com contorno em cima
  K.fundacaoBlocos = function (ctx, x, y, w, h, cor) {
    var De = window.Reino.Desenho; cor = cor || '#c9bfd2';
    var tons = [cor, De.clarear(cor, 0.25), De.escurecer(cor, 0.14)];
    K.vr(ctx, x, y, w, 1, '#3a2446'); K.vr(ctx, x, y + 1, w, h - 1, De.escurecer(cor, 0.35));
    var meio = y + 1 + Math.floor((h - 1) / 2);
    [[y + 1, meio - y - 2, 0], [meio, y + h - meio - 1, 3]].forEach(function (f) {
      for (var i = x + f[2]; i < x + w; i += 7) {
        var t = tons[Math.floor(De.sorte(i, f[0], 11) * 3)], lw = Math.min(6, x + w - i);
        if (lw <= 0 || f[1] <= 0) continue;
        K.vr(ctx, i, f[0], lw, f[1], t); K.vr(ctx, i, f[0], lw, 1, De.clarear(t, 0.35));
      }
    });
    K.vr(ctx, x + w - 3, y + 1, 3, h - 1, 'rgba(58,36,70,0.2)');
  };
  // luz na quina esquerda e sombra de 3 px na direita
  K.quinas = function (ctx, x, y, w, h) { K.vr(ctx, x, y, 1, h, 'rgba(255,255,255,0.8)'); K.vr(ctx, x + w - 3, y, 3, h, 'rgba(58,36,70,0.25)'); };
  // lanterninha de parede (y = topo)
  K.lanterna = function (ctx, x, y) {
    K.vr(ctx, x - 1, y - 1, 6, 1, '#3a2446'); K.vr(ctx, x, y, 4, 6, '#3a2446'); K.vr(ctx, x + 1, y + 1, 2, 4, '#ffe066');
    K.vr(ctx, x + 1, y + 1, 1, 1, '#fff8c8'); K.vr(ctx, x + 1, y + 6, 2, 2, '#3a2446');
  };
  // paredes: tábuas deitadas (junta a cada 3 px, tom por tábua), blocos de pedra, tijolo e azulejo
  K.tabuasH = function (ctx, x, y, w, h, cor) {
    var De = window.Reino.Desenho;
    for (var j = y, k = 0; j < y + h; j += 3, k++) {
      for (var i = x; i < x + w; ) {
        var lg = 10 + Math.floor(De.sorte(i, j, 13) * 12), t = De.sorte(i, j, 17) < 0.5 ? cor : De.escurecer(cor, 0.06);
        K.vr(ctx, i, j, Math.min(lg, x + w - i), Math.min(2, y + h - j), t); K.vr(ctx, i, j, 1, 2, De.escurecer(cor, 0.14)); i += lg;
      }
      if (j + 2 < y + h) K.vr(ctx, x, j + 2, w, 1, De.escurecer(cor, 0.2));
    }
  };
  K.blocos = function (ctx, x, y, w, h, cor, alto, larg) {
    var De = window.Reino.Desenho; alto = alto || 5; larg = larg || 8;
    K.vr(ctx, x, y, w, h, De.escurecer(cor, 0.3));
    for (var j = y, k = 0; j < y + h; j += alto, k++) for (var i = x - (k % 2) * (larg >> 1); i < x + w; i += larg) {
      var a = Math.max(x, i), b = Math.min(x + w, i + larg - 1), hh = Math.min(alto - 1, y + h - j);
      if (b <= a || hh <= 0) continue;
      var r = De.sorte(i, j, 19), t = r < 0.33 ? cor : r < 0.66 ? De.clarear(cor, 0.12) : De.escurecer(cor, 0.08);
      K.vr(ctx, a, j, b - a, hh, t); K.vr(ctx, a, j, b - a, 1, De.clarear(t, 0.35));
    }
  };
  K.azulejos = function (ctx, x, y, w, h, cor) {
    var De = window.Reino.Desenho, cor2 = De.escurecer(cor, 0.08), junta = De.escurecer(cor, 0.22);
    for (var j = y, k = 0; j < y + h; j += 5, k++) for (var i = x, q = 0; i < x + w; i += 5, q++) {
      var t = (k + q) % 2 ? cor : cor2;
      K.vr(ctx, i, j, Math.min(4, x + w - i), Math.min(4, y + h - j), t); K.vr(ctx, i, j, Math.min(4, x + w - i), 1, De.clarear(t, 0.5));
      if (i + 4 < x + w) K.vr(ctx, i + 4, j, 1, Math.min(5, y + h - j), junta);
      if (j + 4 < y + h) K.vr(ctx, i, j + 4, Math.min(5, x + w - i), 1, junta);
    }
  };
  // moitinhas e flores ao longo do pé (pula a porta: de cx - livre a cx + livre); yb = chão
  K.moitas = function (ctx, x0, x1, yb, cx, livre) {
    var De = window.Reino.Desenho, flores = ['#ff7eb6', '#ffe066', '#ffffff', '#b58cff', '#ff9d2e'];
    for (var i = x0; i + 5 <= x1; i += 6) {
      if (i + 5 > cx - livre && i < cx + livre) continue;
      var a = 3 + Math.floor(De.sorte(i, yb, 23) * 2);
      K.vr(ctx, i, yb - a - 1, 6, a + 1, '#3a2446'); K.vr(ctx, i + 1, yb - a, 4, a, '#4f9a3a'); K.vr(ctx, i + 1, yb - a, 3, 1, '#8fd06a');
      K.vr(ctx, i + 2, yb - a + 1, 1, 1, flores[Math.floor(De.sorte(i, yb, 29) * flores.length)]);
    }
  };
  K.vr = function (ctx, x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); };
  K.sombraBeiral = function (ctx, x, y, w) { K.vr(ctx, x, y, w, 2, 'rgba(58,36,70,0.25)'); K.vr(ctx, x, y + 2, w, 1, 'rgba(58,36,70,0.12)'); };
  K.manchas = function (ctx, x, y, w, h, cor) {
    var m = window.Reino.Desenho.escurecer(cor, 0.07);
    for (var j = y + 1; j < y + h - 1; j += 3) for (var i = x + 1; i < x + w - 2; i += 3) if (window.Reino.Desenho.sorte(i, j, 7) < 0.07) K.vr(ctx, i, j, 2, 1, m);
  };
})();
