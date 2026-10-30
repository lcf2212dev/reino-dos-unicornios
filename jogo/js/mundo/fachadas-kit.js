/* Kit de volume das fachadas: Mapa.fachada.kit.<peça>(ctx, ...), em px do jogo. Quem usa: os desenhos de fora
   dos prédios (js/interiores/<p>/fora.js), sempre dentro da função de desenho (var V = Mapa.fachada.kit).
   Só desenha: textura fixa por posição (Reino.Desenho.sorte), alfa só nos degraus 0,25 e 0,15.
   fundacao(x, y, w, h, cor)        faixa de blocos de pedra em 3 tons, contorno e luz em cima (h de 4 a 6)
   telhado(x, y, w, h, cor, passo)  fileiras de escama no triângulo do D.triangulo: clara em cima, escura embaixo,
                                    meia-água direita na sombra, luz na beirada esquerda e cumeeira com brilho
   telhadoRet(x, y, w, h, cor)      o mesmo numa faixa retangular (telhado reto)
   beiral(x, y, w, cor)             beiral de 2 px com a sombra de 2 px na parede embaixo
   sombra(x, y, w)                  faixa de sombra de 2 px (embaixo de beiral, cornija ou aro)
   volume(x, y, w, h)               luz de 1 px na quina esquerda e sombra de 3 px na direita
   reboco(x, y, w, h, cor)          manchas e pedrinhas · tabuas(x, y, w, h, cor): tábuas deitadas com tom e junta
   fundoJanela(x, y, w, h)          sombra de 1 px em cima e à esquerda por dentro da moldura
   lampiao(x, y, dir)               lampião de parede com braço (dir -1 = para a esquerda); y = topo da luz
   degraus(cx, yb, larg)            2º nível do degrau (embaixo do de Mapa.fachada.entrada); yb = chão
   capacho(cx, yb, cor)             capacho na frente da porta */
(function () {
  var Dz = window.Reino.Desenho, Kz = Dz.K, rz = Dz.ret, SOMB = 'rgba(58,36,70,0.25)', SOMB2 = 'rgba(58,36,70,0.15)';
  function Fa() { return window.Mapa.fachada; }
  var kit = {
    // faixa de blocos de pedra em 3 tons, contorno em cima e luz; h de 4 a 5
    fundacao: function (ctx, x, y, w, h, cor) {
      cor = cor || '#cdbba6';
      var tons = [cor, Dz.clarear(cor, 0.18), Dz.escurecer(cor, 0.12)], junta = Dz.escurecer(cor, 0.3);
      rz(ctx, x, y, w, 1, Kz); rz(ctx, x, y + 1, w, h - 1, junta);
      for (var j = y + 1, l = 0; j < y + h; j += 2, l++) {
        for (var i = x + (l % 2 ? -3 : 0); i < x + w; i += 6) {
          var x0 = Math.max(x, i), x1 = Math.min(x + w, i + 5), tom = tons[Math.floor(Dz.sorte(i, j, 11) * 3)];
          if (x1 <= x0) continue;
          rz(ctx, x0, j, x1 - x0, Math.min(1, y + h - j), tom);
          if (l === 0) rz(ctx, x0, j, x1 - x0, 1, Dz.clarear(cor, 0.35));
        }
      }
      rz(ctx, x, y + h - 1, w, 1, junta);
    },
    // fileiras de telha dentro do triângulo (x, y, w, h): escama recortada, de cima clara para baixo escura,
    // meia-água direita na sombra e cumeeira com brilho
    telhado: function (ctx, x, y, w, h, cor, passo) {
      passo = passo || 4;
      var mx = x + (w >> 1), n = Math.ceil(h / passo);
      for (var j = 0; j < h; j++) {
        var m = Fa().meiaTri(w, h, j), k = Math.floor(j / passo), f = n > 1 ? k / (n - 1) : 0;
        var tom = f < 0.5 ? Dz.misturar(Dz.clarear(cor, 0.22), cor, f * 2) : Dz.misturar(cor, Dz.escurecer(cor, 0.2), f * 2 - 1);
        rz(ctx, mx - m + 1, y + j, m * 2 - 1, 1, tom);
        if (j % passo === passo - 1) {
          var esc = Dz.escurecer(tom, 0.3);
          for (var i = mx - m + 1 + (k % 2) * 2; i < mx + m - 1; i += 4) { rz(ctx, i, y + j, 3, 1, esc); rz(ctx, i + 3, y + j - 1, 1, 1, esc); }
        } else if (j % passo === 0) rz(ctx, mx - m + 1, y + j, m * 2 - 1, 1, Dz.clarear(tom, 0.15));
        rz(ctx, mx + 1, y + j, Math.max(0, m - 1), 1, SOMB2);
        rz(ctx, mx - m + 1, y + j, 1, 1, Dz.clarear(cor, 0.5));
      }
      rz(ctx, mx - 1, y, 2, Math.min(3, h), Dz.clarear(cor, 0.6));
    },
    // fileiras de telha numa faixa retangular (telhado reto)
    telhadoRet: function (ctx, x, y, w, h, cor) {
      for (var j = 0; j < h; j++) {
        var f = j / Math.max(1, h - 1), tom = Dz.misturar(Dz.clarear(cor, 0.22), Dz.escurecer(cor, 0.15), f);
        rz(ctx, x, y + j, w, 1, j % 3 === 0 ? Dz.clarear(tom, 0.12) : tom);
        if (j % 3 === 2) for (var i = x + ((j / 3 | 0) % 2) * 2; i < x + w - 1; i += 4) { rz(ctx, i, y + j, 3, 1, Dz.escurecer(tom, 0.3)); rz(ctx, i + 3, y + j - 1, 1, 1, Dz.escurecer(tom, 0.3)); }
      }
      rz(ctx, x + w - 8, y, 8, h, SOMB2);
    },
    // beiral de 2 px de espessura e a sombra de 2 px na parede embaixo dele
    beiral: function (ctx, x, y, w, cor) {
      rz(ctx, x, y, w, 3, Kz); rz(ctx, x + 1, y + 1, w - 2, 1, Dz.clarear(cor, 0.3));
      rz(ctx, x + 1, y + 2, w - 2, 1, Dz.escurecer(cor, 0.2));
      kit.sombra(ctx, x + 2, y + 3, w - 4);
    },
    sombra: function (ctx, x, y, w) { rz(ctx, x, y, w, 1, SOMB); rz(ctx, x, y + 1, w, 1, SOMB2); },
    // luz de 1 px na quina esquerda e sombra de 3 px na direita (x, w = o miolo da parede)
    volume: function (ctx, x, y, w, h) {
      rz(ctx, x, y, 1, h, 'rgba(255,255,255,0.75)');
      rz(ctx, x + w - 3, y, 3, h, SOMB2); rz(ctx, x + w - 1, y, 1, h, SOMB2);
    },
    // reboco: manchas e pedrinhas fixas por posição
    reboco: function (ctx, x, y, w, h, cor) {
      var esc = Dz.escurecer(cor, 0.09), luz = Dz.clarear(cor, 0.5);
      for (var j = y + 1; j < y + h - 1; j += 3) for (var i = x + 1; i < x + w - 2; i += 4) {
        var s = Dz.sorte(i, j, 13);
        if (s < 0.22) rz(ctx, i, j, 3, 1, esc);
        else if (s < 0.3) { rz(ctx, i, j, 1, 1, Dz.escurecer(cor, 0.2)); rz(ctx, i, j - 1, 1, 1, luz); }
      }
    },
    // tábuas deitadas de 4 px, tom por tábua, junta e topo das emendas
    tabuas: function (ctx, x, y, w, h, cor) {
      for (var j = y, l = 0; j < y + h; j += 4, l++) {
        var hh = Math.min(4, y + h - j), tom = Dz.sorte(x, j, 17) < 0.5 ? cor : Dz.escurecer(cor, 0.05);
        rz(ctx, x, j, w, hh, tom); rz(ctx, x, j, w, 1, Dz.clarear(tom, 0.4));
        if (hh === 4) rz(ctx, x, j + 3, w, 1, Dz.escurecer(cor, 0.16));
        for (var i = x + 7 + (l % 3) * 5; i < x + w; i += 17) rz(ctx, i, j, 1, hh, Dz.escurecer(cor, 0.16));
      }
    },
    // fundo da janela: sombra de 1 px em cima e à esquerda por dentro da moldura
    fundoJanela: function (ctx, x, y, w, h) { rz(ctx, x + 2, y + 2, w - 4, 1, SOMB); rz(ctx, x + 2, y + 3, 1, h - 5, SOMB); },
    // lampião de parede com braço; x = parede, y = topo da luz
    lampiao: function (ctx, x, y, dir) {
      var bx = dir < 0 ? x - 4 : x;
      rz(ctx, bx, y + 1, 5, 2, Kz); rz(ctx, bx + 1, y + 1, 3, 1, '#6f6198');
      var lx = dir < 0 ? x - 7 : x + 4;
      rz(ctx, lx - 1, y - 1, 7, 2, Kz); rz(ctx, lx, y + 1, 5, 6, Kz); rz(ctx, lx + 1, y + 2, 3, 4, '#ffe066');
      rz(ctx, lx + 1, y + 2, 1, 2, '#fff8c8'); rz(ctx, lx + 1, y + 7, 3, 1, Kz);
    },
    // capacho na frente da porta e o 2º nível do degrau; cx = meio da porta, yb = chão
    degraus: function (ctx, cx, yb, larg) {
      larg = larg || 28;
      rz(ctx, cx - (larg >> 1), yb - 2, larg, 2, Kz); rz(ctx, cx - (larg >> 1) + 1, yb - 1, larg - 2, 1, '#d4bc8c');
      rz(ctx, cx - (larg >> 1) + 1, yb - 2, larg - 2, 1, '#f3e2bd');
    },
    capacho: function (ctx, cx, yb, cor) {
      rz(ctx, cx - 6, yb - 2, 12, 2, Kz); rz(ctx, cx - 5, yb - 2, 10, 1, cor);
      for (var i = cx - 4; i < cx + 5; i += 2) rz(ctx, i, yb - 2, 1, 1, Dz.clarear(cor, 0.3));
    },
  };
  window.Mapa.fachada.kit = kit;
})();
