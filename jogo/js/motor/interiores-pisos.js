/* Interiores: pisos (tile 16 × 16) e paredes (coluna de 16 × 32 px) dos cômodos.
   Veio de motor/interiores.js. Registra PISOS e PAREDES em Reino._interiores (e na API
   Reino.Interiores, montada em interiores-cena.js). Sem DOM no carregamento. */
(function () {
  var R = window.Reino;
  var D = R.Desenho, C = D.C, K = D.K;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet,
    matriz = D.matriz, sorte = D.sorte, misturar = D.misturar, escurecer = D.escurecer, clarear = D.clarear,
    brilho = D.brilho, miudeza = D.miudeza;

  /* ================= PISOS ================= */
  var PISOS = {
    taco: { cores: { piso: '#eab47c', piso2: '#d09358' }, desenhar: function (ctx, px, py, tx, ty, p) {
      var linha = escurecer(p.piso2, 0.2), luz = clarear(p.piso, 0.28);
      for (var j = 0; j < 2; j++) for (var i = 0; i < 2; i++) {
        var qx = px + i * 8, qy = py + j * 8, horiz = (i + j + tx + ty) % 2 === 0;
        ret(ctx, qx, qy, 8, 8, horiz ? p.piso : misturar(p.piso, p.piso2, 0.45));
        for (var s = 0; s < 2; s++) {
          if (horiz) { ret(ctx, qx, qy + s * 4, 7, 1, luz); ret(ctx, qx, qy + s * 4 + 3, 8, 1, linha); }
          else { ret(ctx, qx + s * 4, qy, 1, 7, luz); ret(ctx, qx + s * 4 + 3, qy, 1, 8, linha); }
        }
        if (sorte(tx * 2 + i, ty * 2 + j, 3) < 0.25) ret(ctx, qx + 2, qy + 1 + (horiz ? 1 : 3), 2, 1, p.piso2);
      }
    } },
    mosaico: { cores: { piso: '#fff1dc', piso2: '#ff9d7a', detalhe: '#7ec8d9' }, desenhar: function (ctx, px, py, tx, ty, p) {
      var junta = misturar(p.piso, p.piso2, 0.35);
      ret(ctx, px, py, 16, 16, p.piso);
      for (var j = 0; j < 2; j++) for (var i = 0; i < 2; i++) {
        var qx = px + i * 8, qy = py + j * 8, par = (i + j + tx + ty) % 2 === 0;
        ret(ctx, qx + 7, qy, 1, 8, junta); ret(ctx, qx, qy + 7, 8, 1, junta);
        var cor = par ? p.piso2 : (p.detalhe || C.agua);
        ret(ctx, qx + 3, qy + 1, 1, 5, cor); ret(ctx, qx + 1, qy + 3, 5, 1, cor);
        ret(ctx, qx + 2, qy + 2, 3, 3, cor); ret(ctx, qx + 3, qy + 3, 1, 1, clarear(cor, 0.6));
        ret(ctx, qx, qy, 1, 1, clarear(p.piso, 0.5));
      }
    } },
    pedra: { cores: { piso: '#e9e0cf', piso2: '#c9b99a' }, desenhar: function (ctx, px, py, tx, ty, p) {
      var junta = escurecer(p.piso2, 0.12), luz = clarear(p.piso, 0.4);
      ret(ctx, px, py, 16, 16, junta);
      for (var r = 0; r < 2; r++) {
        var y = py + r * 8, corte = 4 + Math.floor(sorte(tx, ty * 2 + r, 7) * 8);
        var pedras = [[0, corte], [corte + 1, 16 - corte - 1]];
        pedras.forEach(function (pd, k) {
          var cor = sorte(tx * 3 + k, ty * 2 + r, 11) < 0.4 ? misturar(p.piso, p.piso2, 0.4) : p.piso;
          ret(ctx, px + pd[0], y, pd[1], 7, cor);
          ret(ctx, px + pd[0], y, pd[1] - 1, 1, luz);
          ret(ctx, px + pd[0] + pd[1] - 1, y + 1, 1, 6, misturar(cor, p.piso2, 0.6));
          if (sorte(tx + k, ty + r, 5) < 0.3) ret(ctx, px + pd[0] + 2, y + 3, 2, 1, p.piso2);
        });
      }
    } },
    palha: { cores: { piso: '#f5d77a', piso2: '#d9ab45' }, desenhar: function (ctx, px, py, tx, ty, p) {
      ret(ctx, px, py, 16, 16, p.piso);
      var luz = clarear(p.piso, 0.45);
      for (var k = 0; k < 11; k++) {
        var x = px + Math.floor(sorte(tx, ty, k) * 14), y = py + Math.floor(sorte(ty, tx, k + 40) * 14);
        var cor = k % 3 === 0 ? luz : p.piso2, dir = sorte(tx, k, ty) < 0.5 ? 1 : -1;
        for (var s = 0; s < 3; s++) ret(ctx, x + s * dir + (dir < 0 ? 2 : 0), y + s, 1, 1, cor);
      }
    } },
    tabuas: { cores: { piso: '#dca56c', piso2: '#b9804e' }, desenhar: function (ctx, px, py, tx, ty, p) {
      var escuro = escurecer(p.piso2, 0.2), luz = clarear(p.piso, 0.3);
      for (var r = 0; r < 4; r++) {
        var y = py + r * 4, cor = (ty * 4 + r) % 3 === 1 ? misturar(p.piso, p.piso2, 0.3) : p.piso;
        ret(ctx, px, y, 16, 3, cor);
        ret(ctx, px, y, 16, 1, luz);
        ret(ctx, px, y + 3, 16, 1, escuro);
        if (sorte(tx, ty * 4 + r, 2) < 0.45) {
          var jx = 2 + Math.floor(sorte(tx, ty * 4 + r, 9) * 12);
          ret(ctx, px + jx, y, 1, 3, escuro);
          ret(ctx, px + jx - 2, y + 1, 1, 1, p.piso2); ret(ctx, px + jx + 2, y + 1, 1, 1, p.piso2);
        }
      }
    } },
    azulejo: { cores: { piso: '#eef8ff', piso2: '#b9dcf2', detalhe: '#7fb8ec' }, desenhar: function (ctx, px, py, tx, ty, p) {
      for (var j = 0; j < 2; j++) for (var i = 0; i < 2; i++) {
        var qx = px + i * 8, qy = py + j * 8;
        ret(ctx, qx, qy, 8, 8, p.piso2);
        ret(ctx, qx, qy, 7, 7, p.piso);
        ret(ctx, qx, qy, 3, 1, C.branco); ret(ctx, qx, qy, 1, 2, C.branco);
        if ((i + j + tx + ty) % 2 === 0) {
          var d = p.detalhe || C.azul;
          ret(ctx, qx + 3, qy + 2, 1, 3, d); ret(ctx, qx + 2, qy + 3, 3, 1, d);
        }
      }
    } },
    carpete: { cores: { piso: '#c9a8ff', piso2: '#b08cf0' }, desenhar: function (ctx, px, py, tx, ty, p) {
      ret(ctx, px, py, 16, 16, p.piso);
      for (var j = 0; j < 4; j++) for (var i = 0; i < 4; i++) {
        if ((i + j) % 2) continue;
        ret(ctx, px + i * 4 + 1, py + j * 4 + 1, 1, 1, p.piso2);
        ret(ctx, px + i * 4 + 2, py + j * 4 + 2, 1, 1, clarear(p.piso, 0.25));
      }
    } },
  };

  /* ================= PAREDES (coluna de 16 × 32 px: 2 fileiras) ================= */
  function acabamento(ctx, px, py, p) {
    ret(ctx, px, py, 16, 1, escurecer(p.parede, 0.35));
    ret(ctx, px, py + 1, 16, 1, clarear(p.parede, 0.45));
    ret(ctx, px, py + 2, 16, 1, escurecer(p.parede, 0.14));
    ret(ctx, px, py + 27, 16, 1, escurecer(p.parede, 0.18));
    ret(ctx, px, py + 28, 16, 1, clarear(p.rodape, 0.3));
    ret(ctx, px, py + 29, 16, 2, p.rodape);
    ret(ctx, px, py + 31, 16, 1, escurecer(p.rodape, 0.4));
  }
  var PAREDES = {
    papel: { cores: { parede: '#ffe3ec', parede2: '#ffcadd', rodape: '#c98a4b', detalhe: '#ffffff' }, desenhar: function (ctx, px, py, tx, p) {
      ret(ctx, px, py, 16, 32, p.parede);
      for (var s = 0; s < 4; s++) if ((tx * 4 + s) % 2) ret(ctx, px + s * 4, py + 3, 4, 14, p.parede2);
      var fl = (tx % 2) ? 6 : 12;
      ret(ctx, px + 7, py + fl - 1, 1, 3, p.detalhe); ret(ctx, px + 6, py + fl, 3, 1, p.detalhe);
      ret(ctx, px + 7, py + fl, 1, 1, C.ouro);
      ret(ctx, px, py + 17, 16, 1, clarear(p.rodape, 0.35));
      ret(ctx, px, py + 18, 16, 1, p.rodape);
      var lam = misturar(p.parede2, p.rodape, 0.3);
      ret(ctx, px, py + 19, 16, 8, lam);
      ret(ctx, px + 2, py + 20, 12, 1, escurecer(lam, 0.15)); ret(ctx, px + 2, py + 20, 1, 6, escurecer(lam, 0.15));
      ret(ctx, px + 3, py + 25, 11, 1, clarear(lam, 0.3)); ret(ctx, px + 13, py + 21, 1, 5, clarear(lam, 0.3));
      acabamento(ctx, px, py, p);
    } },
    pedra: { cores: { parede: '#ebe2d2', parede2: '#cdbfa6', rodape: '#a89a86', detalhe: '#ffffff' }, desenhar: function (ctx, px, py, tx, p) {
      var junta = escurecer(p.parede2, 0.15);
      ret(ctx, px, py, 16, 32, junta);
      for (var r = 0; r < 5; r++) {
        var y = py + 3 + r * 5, off = (r % 2) ? 4 : 0;
        for (var b = -1; b < 2; b++) {
          var x0 = px + off + b * 8, x1 = Math.max(px, x0), x2 = Math.min(px + 16, x0 + 7);
          if (x2 <= x1) continue;
          var cor = sorte(tx * 3 + b, r, 21) < 0.35 ? misturar(p.parede, p.parede2, 0.5) : p.parede;
          ret(ctx, x1, y, x2 - x1, 4, cor);
          ret(ctx, x1, y, x2 - x1, 1, clarear(cor, 0.4));
        }
      }
      acabamento(ctx, px, py, p);
    } },
    madeira: { cores: { parede: '#e2a468', parede2: '#c4864c', rodape: '#8a604a', detalhe: '#fff1d0' }, desenhar: function (ctx, px, py, tx, p) {
      ret(ctx, px, py, 16, 32, p.parede);
      for (var s = 0; s < 4; s++) {
        ret(ctx, px + s * 4 + 3, py + 3, 1, 24, p.parede2);
        ret(ctx, px + s * 4, py + 3, 1, 24, clarear(p.parede, 0.2));
        if (sorte(tx * 4 + s, 1, 5) < 0.35) { var ny = py + 6 + Math.floor(sorte(tx, s, 8) * 16); ret(ctx, px + s * 4 + 1, ny, 2, 2, p.parede2); }
      }
      ret(ctx, px, py + 15, 16, 1, clarear(p.parede2, 0.2));
      ret(ctx, px, py + 16, 16, 2, p.parede2);
      ret(ctx, px, py + 18, 16, 1, escurecer(p.parede2, 0.25));
      acabamento(ctx, px, py, p);
    } },
    tijolo: { cores: { parede: '#f2a785', parede2: '#dc8564', rodape: '#9b6a55', detalhe: '#fff1e0' }, desenhar: function (ctx, px, py, tx, p) {
      var massa = clarear(p.parede, 0.55);
      ret(ctx, px, py, 16, 32, massa);
      for (var r = 0; r < 6; r++) {
        var y = py + 3 + r * 4, off = (r % 2) ? 4 : 0;
        for (var b = -1; b < 2; b++) {
          var x0 = px + off + b * 8, x1 = Math.max(px, x0), x2 = Math.min(px + 16, x0 + 7);
          if (x2 <= x1) continue;
          var cor = sorte(tx * 3 + b, r, 31) < 0.3 ? p.parede2 : p.parede;
          ret(ctx, x1, y, x2 - x1, 3, cor);
          ret(ctx, x1, y, x2 - x1, 1, clarear(cor, 0.25));
        }
      }
      acabamento(ctx, px, py, p);
    } },
    azulejo: { cores: { parede: '#fff6e8', parede2: '#9fdcd0', rodape: '#5fae9e', detalhe: '#5fb4ff' }, desenhar: function (ctx, px, py, tx, p) {
      ret(ctx, px, py, 16, 32, p.parede);
      ret(ctx, px, py + 9, 16, 1, clarear(p.parede2, 0.4));
      ret(ctx, px, py + 14, 16, 2, p.detalhe);
      for (var i = 0; i < 4; i++) ret(ctx, px + i * 4 + 1, py + 14, 2, 1, clarear(p.detalhe, 0.5));
      for (var j = 0; j < 3; j++) for (var k = 0; k < 4; k++) {
        var x = px + k * 4, y = py + 16 + j * 4;
        ret(ctx, x, y, 4, 4, escurecer(p.parede2, 0.12));
        ret(ctx, x, y, 3, 3, (j + k + tx) % 2 ? p.parede2 : clarear(p.parede2, 0.45));
        ret(ctx, x, y, 1, 1, C.branco);
      }
      acabamento(ctx, px, py, p);
    } },
  };

  R._interiores.PISOS = PISOS;
  R._interiores.PAREDES = PAREDES;
})();
