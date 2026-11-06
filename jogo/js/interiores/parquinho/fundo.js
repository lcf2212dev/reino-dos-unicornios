/* Parquinho, parte 1: o chão, a cerca e o céu aberto (docs/contratos/parquinho.md). Piso 'parquinho-grama' (grama clara
   com a trilha de areia batida em cruz, P.trilha), parede 'parquinho-cerca' (moitas e árvores lá no fundo, com a
   cerquinha branca na frente) e o fundo I.FUNDOS.parquinho (grama e árvores em volta, com `saida`: o portal de volta,
   no lugar do capacho). Cria Reino._predios.parquinho (P), que as outras partes usam:
     P.trilha(tx, ty) → bool    P.copas(ctx, x, y, w, h)    P.caixa(ctx, x, y, w, h, cor) (retângulo contornado)
     P.linha(ctx, x0, y0, x1, y1, cor) (reta pixel a pixel)  P.pintor(p) → um ctx de mentira que desenha no pintor
   No carregamento só registra funções: nada de DOM nem canvas aqui fora. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, ret = D.ret, circulo = D.circulo, elipse = D.elipse;
  var K = R.Desenho.K, sorte = R.Desenho.sorte;
  var P = (R._predios = R._predios || {}).parquinho = R._predios.parquinho || {};

  // trilha de areia: a coluna do portal de volta subindo até o meio e a faixa de lado a lado (tiles)
  P.trilha = function (tx, ty) { return ((tx === 13 || tx === 14) && ty >= 7 && ty <= 17) || ((ty === 7 || ty === 8) && tx >= 2 && tx <= 25); };
  P.caixa = function (ctx, x, y, w, h, cor) { ret(ctx, x, y, w, h, K); ret(ctx, x + 1, y + 1, w - 2, h - 2, cor); };
  P.linha = function (ctx, x0, y0, x1, y1, cor) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    var dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, err = dx + dy;
    ctx.fillStyle = cor;
    for (var n = 0; n < 400; n++) {
      ctx.fillRect(x0, y0, 1, 1);
      if (x0 === x1 && y0 === y1) break;
      var e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  };
  // o mesmo desenho, no pintor da camada (px do jogo): os helpers só usam fillStyle + fillRect
  P.pintor = function (p) { return { fillStyle: '#000', fillRect: function (x, y, w, h) { p.ret(x, y, w, h, this.fillStyle); } }; };

  /* ---------- copas: moitas redondas, na grade global (as emendas dos tiles não aparecem) ---------- */
  var VERDES = ['#3f8f45', '#55ad55', '#7fcf6a'];
  P.copas = function (ctx, x, y, w, h) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ret(ctx, x, y, w, h, VERDES[0]);
    var c0 = Math.floor((x - 8) / 12), c1 = Math.floor((x + w + 8) / 12), r0 = Math.floor((y - 8) / 12), r1 = Math.floor((y + h + 8) / 12);
    for (var cr = r0; cr <= r1; cr++) for (var cc = c0; cc <= c1; cc++) {
      var bx = cc * 12 + 6 + Math.round((sorte(cc, cr, 7) - 0.5) * 8) + (cr & 1) * 6, by = cr * 12 + 6 + Math.round((sorte(cc, cr, 8) - 0.5) * 6);
      circulo(ctx, bx, by, 8, VERDES[0]); circulo(ctx, bx - 1, by - 1, 6, VERDES[1]); circulo(ctx, bx - 2, by - 2, 3, VERDES[2]);
      var s = sorte(cc, cr, 9);
      if (s < 0.12) { ret(ctx, bx + 2, by + 1, 2, 2, '#ff9ec8'); ret(ctx, bx + 2, by + 1, 1, 1, '#ffffff'); }   // florzinha na moita
      else if (s < 0.2) ret(ctx, bx - 3, by + 2, 2, 2, '#ffe066');
    }
    ctx.restore();
  };

  /* ---------- o piso: grama clarinha com a trilha de areia ---------- */
  I.PISOS['parquinho-grama'] = { cores: { piso: '#9ad86a', piso2: '#8ccc5c', detalhe: '#68b04a', luz: '#c2ee8e' },
    desenhar: function (ctx, px, py, tx, ty, p) {
      ret(ctx, px, py, 16, 16, p.piso);
      var i;
      if (P.trilha(tx, ty)) {
        var cima = P.trilha(tx, ty - 1), baixo = P.trilha(tx, ty + 1), esq = P.trilha(tx - 1, ty), dir = P.trilha(tx + 1, ty);
        ret(ctx, px, py, 16, 16, '#ecd9a4');
        ret(ctx, px + 3, py + 4, 4, 2, '#f6e8bf'); ret(ctx, px + 9, py + 10, 5, 2, '#dfc890');
        for (i = 0; i < 3; i++) ret(ctx, px + Math.floor(sorte(tx, ty, 30 + i) * 14), py + Math.floor(sorte(tx, ty, 40 + i) * 14), 1, 1, '#c9b07a');
        if (!cima) ret(ctx, px, py, 16, 2, p.piso2);
        if (!baixo) ret(ctx, px, py + 14, 16, 2, p.piso2);
        if (!esq) ret(ctx, px, py, 2, 16, p.piso2);
        if (!dir) ret(ctx, px + 14, py, 2, 16, p.piso2);
        return;
      }
      if (sorte(tx, ty, 1) < 0.5) ret(ctx, px + Math.floor(sorte(tx, ty, 2) * 8), py + 2, 8, 5, p.piso2);
      if (sorte(tx, ty, 3) < 0.35) ret(ctx, px + 6 + Math.floor(sorte(tx, ty, 6) * 6), py + 9, 4, 3, p.luz);
      for (i = 0; i < 3; i++) {
        var gx = px + 1 + Math.floor(sorte(tx, ty, 10 + i) * 13), gy = py + 3 + Math.floor(sorte(tx, ty, 20 + i) * 11);
        ret(ctx, gx, gy - 2, 1, 3, p.detalhe); ret(ctx, gx + 1, gy - 3, 1, 3, p.detalhe); ret(ctx, gx + 2, gy - 1, 1, 2, p.detalhe);
      }
      if (sorte(tx, ty, 50) < 0.12) {
        var fx = px + 2 + Math.floor(sorte(tx, ty, 51) * 11), fy = py + 2 + Math.floor(sorte(tx, ty, 52) * 11);
        ret(ctx, fx, fy, 2, 2, sorte(tx, ty, 53) < 0.5 ? '#ffffff' : '#ffe27a'); ret(ctx, fx, fy, 1, 1, '#ff9ec8');
      }
    } };

  /* ---------- a parede: moitas no fundo e a cerquinha branca de ripas na frente ---------- */
  I.PAREDES['parquinho-cerca'] = { cores: { parede: '#3f8f45', parede2: '#55ad55', rodape: '#68b04a', detalhe: '#ffffff' },
    desenhar: function (ctx, px, py, tx) {
      P.copas(ctx, px, py, 16, 22);
      ret(ctx, px, py + 22, 16, 10, '#9ad86a');                      // a grama atrás da cerca
      ret(ctx, px, py + 18, 16, 1, K); ret(ctx, px, py + 19, 16, 2, '#ffffff'); ret(ctx, px, py + 21, 16, 1, K);   // travessa de cima
      ret(ctx, px, py + 26, 16, 1, K); ret(ctx, px, py + 27, 16, 2, '#ffffff'); ret(ctx, px, py + 29, 16, 1, K);   // travessa de baixo
      [1, 9].forEach(function (r) {                                   // duas ripas de ponta por tile
        ret(ctx, px + r, py + 15, 6, 16, K); ret(ctx, px + r + 1, py + 14, 4, 1, K);
        ret(ctx, px + r + 1, py + 15, 4, 15, '#ffffff'); ret(ctx, px + r + 4, py + 16, 1, 14, '#dcdcef');
      });
      ret(ctx, px, py + 31, 16, 1, '#68b04a');
      if (sorte(tx, 0, 61) < 0.3) { ret(ctx, px + 7, py + 27, 2, 2, '#ff7eb6'); ret(ctx, px + 7, py + 27, 1, 1, '#ffd1e6'); }   // flor na cerca
    } };

  /* ---------- o céu aberto: moitas em volta; a saída é o portal de volta ---------- */
  var ARCO = ['#ff5c6a', '#ff9f45', '#ffe066', '#6fdc8c', '#5fb4ff', '#a66bff'];
  P.redemoinho = function (ctx, cx, cy) {
    elipse(ctx, cx, cy, 9, 5, K);
    ARCO.forEach(function (c, i) { elipse(ctx, cx, cy, 8 - i, Math.max(1, 4 - Math.floor(i * 0.7)), c); });
    elipse(ctx, cx, cy, 1, 1, '#ffffff');
    ret(ctx, cx - 6, cy - 1, 3, 1, '#fff4cc'); ret(ctx, cx + 3, cy + 1, 3, 1, '#fff4cc');
  };
  var PEDRA = ['#8a8a9c', '#b0b0c2', '#d4d4e0'];
  P.anelDePedras = function (ctx, cx, cy) {
    elipse(ctx, cx, cy + 1, 11, 7, 'rgba(58,36,70,0.22)');
    for (var i = 0; i < 9; i++) {
      var a = (i + 0.5) / 9 * Math.PI * 2, sx = cx + Math.round(Math.cos(a) * 10), sy = cy + Math.round(Math.sin(a) * 6);
      ret(ctx, sx - 1, sy - 2, 3, 4, K); ret(ctx, sx - 2, sy - 1, 5, 2, K);
      ret(ctx, sx - 1, sy - 1, 3, 2, PEDRA[1]); ret(ctx, sx - 1, sy - 1, 2, 1, PEDRA[2]);
    }
  };
  I.FUNDOS.parquinho = { cor: VERDES[0],
    desenhar: function (ctx, w, h) { P.copas(ctx, 0, 0, w, h); },
    saida: function (ctx, px, py) {
      ret(ctx, px, py, 16, 16, '#ecd9a4');
      P.anelDePedras(ctx, px + 8, py + 9);
      P.redemoinho(ctx, px + 8, py + 9);
      ret(ctx, px + 1, py + 1, 1, 3, '#fff3a0'); ret(ctx, px, py + 2, 3, 1, '#fff3a0');
      ret(ctx, px + 14, py + 4, 1, 3, '#ffffff'); ret(ctx, px + 13, py + 5, 3, 1, '#ffffff');
    } };
})();
