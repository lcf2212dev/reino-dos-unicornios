/* Vila Arco-Íris, o chão e o céu aberto (docs/contratos/vila.md): o piso 'vila-grama' (grama clara com as ruas de
   pedrinhas coloridas e a praça redonda), a parede 'vila-colinas' (céu, arco-íris e colinas lá no fundo, com a cerca
   branca) e o fundo I.FUNDOS.vila (grama, árvores e flores em volta da vila).
   Cria Reino._predios.vila (V), que as outras partes da Vila usam:
     V.rua(tx, ty) → bool (rua de pedra: a de cima, das lojas; a avenida do portal à praça; a travessa da praça)
     V.praca(tx, ty) → bool (o chão redondo da praça)   V.caixa(ctx, x, y, w, h, cor) (retângulo contornado)
     V.ARCO (as 6 cores do arco-íris)   V.copas(ctx, x, y, w, h) (moitas redondas, na grade global)
   No carregamento só registra funções: nada de DOM nem canvas aqui fora. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, ret = D.ret, circulo = D.circulo;
  var K = R.Desenho.K, sorte = R.Desenho.sorte;
  var V = (R._predios = R._predios || {}).vila = R._predios.vila || {};

  V.ARCO = ['#ff5c6a', '#ff9f45', '#ffe066', '#6fdc8c', '#5fb4ff', '#a66bff'];
  V.caixa = function (ctx, x, y, w, h, cor) { ret(ctx, x, y, w, h, K); ret(ctx, x + 1, y + 1, w - 2, h - 2, cor); };
  // a praça: um círculo em volta da fonte (centro no meio dos tiles 20 e 21 de largura, fileira 18)
  V.praca = function (tx, ty) { var dx = tx - 20, dy = (ty - 18) * 1.1; return dx * dx + dy * dy <= 30; };
  V.rua = function (tx, ty) {
    if (tx < 1 || tx > 38 || ty < 3 || ty > 30) return false;
    return ty === 8 || ty === 9 ||                                  // a rua das lojas
      (tx >= 19 && tx <= 21 && ty >= 10) ||                         // a avenida do portal até a rua
      (ty === 19 && tx >= 9 && tx <= 31);                           // a travessa da praça até os terrenos
  };

  /* ---------- moitas redondas (o fundo em volta e a parede) ---------- */
  var VERDES = ['#3f8f45', '#55ad55', '#7fcf6a'];
  V.copas = function (ctx, x, y, w, h) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ret(ctx, x, y, w, h, VERDES[0]);
    var c0 = Math.floor((x - 8) / 12), c1 = Math.floor((x + w + 8) / 12), r0 = Math.floor((y - 8) / 12), r1 = Math.floor((y + h + 8) / 12);
    for (var cr = r0; cr <= r1; cr++) for (var cc = c0; cc <= c1; cc++) {
      var bx = cc * 12 + 6 + Math.round((sorte(cc, cr, 17) - 0.5) * 8) + (cr & 1) * 6, by = cr * 12 + 6 + Math.round((sorte(cc, cr, 18) - 0.5) * 6);
      circulo(ctx, bx, by, 8, VERDES[0]); circulo(ctx, bx - 1, by - 1, 6, VERDES[1]); circulo(ctx, bx - 2, by - 2, 3, VERDES[2]);
      var s = sorte(cc, cr, 19);
      if (s < 0.3) { var c = V.ARCO[Math.floor(sorte(cc, cr, 20) * 6)]; ret(ctx, bx + 2, by + 1, 2, 2, c); ret(ctx, bx + 2, by + 1, 1, 1, '#ffffff'); }
    }
    ctx.restore();
  };

  /* ---------- o piso: grama clarinha, ruas de pedrinhas e a praça ---------- */
  var PEDRAS = ['#f3e2c4', '#ead2ae', '#f6d6e4', '#dfe6f6', '#e6f0d0'];
  function pedrinhas(ctx, px, py, tx, ty, base) {
    ret(ctx, px, py, 16, 16, base);
    // pedras de 7×7 com junta de 1 px, deslocadas a cada fileira (calçamento)
    for (var j = 0; j < 2; j++) for (var i = -1; i < 2; i++) {
      var ox = i * 8 + ((ty * 2 + j) & 1) * 4, oy = j * 8;
      var c = PEDRAS[Math.floor(sorte(tx * 3 + i, ty * 2 + j, 70) * PEDRAS.length)];
      var x0 = Math.max(0, ox + 1), x1 = Math.min(16, ox + 8);
      if (x1 > x0) { ret(ctx, px + x0, py + oy + 1, x1 - x0, 6, c); ret(ctx, px + x0, py + oy + 1, x1 - x0, 1, '#ffffff'); }
    }
  }
  I.PISOS['vila-grama'] = { cores: { piso: '#9ad86a', piso2: '#8ccc5c', detalhe: '#68b04a', luz: '#c2ee8e' },
    desenhar: function (ctx, px, py, tx, ty, p) {
      var i;
      if (V.praca(tx, ty)) { pedrinhas(ctx, px, py, tx, ty, '#c9a6d8'); return; }
      if (V.rua(tx, ty)) {
        pedrinhas(ctx, px, py, tx, ty, '#c4a98a');
        if (!V.rua(tx, ty - 1) && !V.praca(tx, ty - 1)) ret(ctx, px, py, 16, 2, '#8ccc5c');   // a beirada de grama
        if (!V.rua(tx, ty + 1) && !V.praca(tx, ty + 1)) ret(ctx, px, py + 14, 16, 2, '#7fb850');
        if (!V.rua(tx - 1, ty) && !V.praca(tx - 1, ty)) ret(ctx, px, py, 2, 16, '#8ccc5c');
        if (!V.rua(tx + 1, ty) && !V.praca(tx + 1, ty)) ret(ctx, px + 14, py, 2, 16, '#7fb850');
        return;
      }
      ret(ctx, px, py, 16, 16, p.piso);
      if (sorte(tx, ty, 1) < 0.5) ret(ctx, px + Math.floor(sorte(tx, ty, 2) * 8), py + 2, 8, 5, p.piso2);
      if (sorte(tx, ty, 3) < 0.35) ret(ctx, px + 6 + Math.floor(sorte(tx, ty, 6) * 6), py + 9, 4, 3, p.luz);
      for (i = 0; i < 3; i++) {
        var gx = px + 1 + Math.floor(sorte(tx, ty, 10 + i) * 13), gy = py + 3 + Math.floor(sorte(tx, ty, 20 + i) * 11);
        ret(ctx, gx, gy - 2, 1, 3, p.detalhe); ret(ctx, gx + 1, gy - 3, 1, 3, p.detalhe); ret(ctx, gx + 2, gy - 1, 1, 2, p.detalhe);
      }
      if (sorte(tx, ty, 50) < 0.16) {
        var fx = px + 2 + Math.floor(sorte(tx, ty, 51) * 11), fy = py + 2 + Math.floor(sorte(tx, ty, 52) * 11);
        ret(ctx, fx, fy, 2, 2, V.ARCO[Math.floor(sorte(tx, ty, 53) * 6)]); ret(ctx, fx, fy, 1, 1, '#ffffff');
      }
    } };

  /* ---------- a parede: céu, um pedaço de arco-íris, colinas e a cerca branca ---------- */
  I.PAREDES['vila-colinas'] = { cores: { parede: '#bfe6ff', parede2: '#9ad86a', rodape: '#68b04a', detalhe: '#ffffff' },
    desenhar: function (ctx, px, py, tx) {
      ret(ctx, px, py, 16, 32, '#bfe6ff'); ret(ctx, px, py, 16, 6, '#a8dcff');
      // o arco-íris enorme atrás da vila: faixas que sobem e descem (meio arco por 40 tiles)
      var a = Math.sin(((tx + 0.5) / 40) * Math.PI);
      V.ARCO.forEach(function (c, i) { var y = Math.round(16 - a * 13) + i * 2; if (y < 22) ret(ctx, px, py + y, 16, 2, c); });
      // nuvem de vez em quando
      if (sorte(tx, 0, 81) < 0.25) { circulo(ctx, px + 8, py + 6, 4, '#ffffff'); circulo(ctx, px + 4, py + 7, 3, '#ffffff'); circulo(ctx, px + 12, py + 7, 3, '#ffffff'); }
      // colinas
      var h1 = 18 + Math.round(Math.sin(tx * 0.7) * 2), h2 = 21 + Math.round(Math.sin(tx * 1.3 + 1) * 2);
      ret(ctx, px, py + h1, 16, 32 - h1, '#7fcf6a'); ret(ctx, px, py + h2, 16, 32 - h2, '#55ad55');
      if (sorte(tx, 0, 82) < 0.4) { var x = px + 3 + Math.floor(sorte(tx, 0, 83) * 9); ret(ctx, x, py + h2 - 4, 3, 4, '#3f8f45'); ret(ctx, x + 1, py + h2 - 6, 1, 2, '#3f8f45'); }
      // a cerquinha branca
      ret(ctx, px, py + 23, 16, 1, K); ret(ctx, px, py + 24, 16, 2, '#ffffff'); ret(ctx, px, py + 26, 16, 1, K);
      [2, 10].forEach(function (r) { ret(ctx, px + r, py + 20, 4, 11, K); ret(ctx, px + r + 1, py + 21, 2, 9, '#ffffff'); });
      ret(ctx, px, py + 30, 16, 2, '#68b04a');
    } };

  /* ---------- o céu aberto: moitas e flores em volta da vila ---------- */
  I.FUNDOS.vila = { cor: VERDES[0], desenhar: function (ctx, w, h) { V.copas(ctx, 0, 0, w, h); } };
})();
