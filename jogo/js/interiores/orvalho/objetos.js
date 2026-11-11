/* Bosque do Orvalho, os objetos da mata de manhã (prefixo orvalho-): a árvore de copa verde-clara com gotas de
   orvalho (a árvore-assinatura da mata), a folha grande caída com a gota em cima e a florzinha de orvalho (enfeites
   do chão, não sólidos). Os demais objetos da floresta são os do Bosque dos Fantasmas (bosque-*), emprestados aqui.
   Este arquivo registra também o piso 'orvalho-orvalho' (grama verde-menta clara com gotinhas brilhando e a trilha de
   terra clara), a parede 'orvalho-copas' (copas verde-claras com brilhos) e o céu I.FUNDOS.orvalho (a mata em volta em
   verde-água claro, com raios de sol). Reino._predios.orvalho guarda as trilhas (P.trilha), usadas pelo piso.
   Nada de DOM nem canvas no carregamento. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, ret = D.ret, circulo = D.circulo, elipse = D.elipse;
  var K = R.Desenho.K, sorte = R.Desenho.sorte;
  var P = (R._predios = R._predios || {}).orvalho = R._predios.orvalho || {};

  /* ---------- as copas: folhagem em bolas na grade global, com gotinhas brilhando nas folhas ---------- */
  var VERDES = ['#6fae6e', '#8ccc84', '#b4e6a2'];
  function copas(ctx, x, y, w, h) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ret(ctx, x, y, w, h, VERDES[0]);
    var c0 = Math.floor((x - 8) / 12), c1 = Math.floor((x + w + 8) / 12), r0 = Math.floor((y - 8) / 12), r1 = Math.floor((y + h + 8) / 12);
    for (var cr = r0; cr <= r1; cr++) for (var cc = c0; cc <= c1; cc++) {
      var bx = cc * 12 + 6 + Math.round((sorte(cc, cr, 1) - 0.5) * 8) + (cr & 1) * 6, by = cr * 12 + 6 + Math.round((sorte(cc, cr, 2) - 0.5) * 6);
      circulo(ctx, bx, by, 8, VERDES[0]); circulo(ctx, bx - 1, by - 1, 6, VERDES[1]); circulo(ctx, bx - 2, by - 2, 3, VERDES[2]);
      if (sorte(cc, cr, 3) < 0.3) { ret(ctx, bx + 2, by + 1, 2, 2, '#e8fff4'); ret(ctx, bx + 2, by + 1, 1, 1, '#ffffff'); }   // gotinha de orvalho
      else if (sorte(cc, cr, 4) < 0.14) ret(ctx, bx - 3, by + 2, 1, 1, '#f4ffe8');                                             // brilhinho
    }
    ctx.restore();
  }
  P.copas = copas;

  /* ---------- folhagem em bolas [cx, cy, raio] com contorno só por fora (todas as bolas de contorno primeiro) ---------- */
  function folhagem(ctx, px, py, bolas, c) {
    bolas.forEach(function (b) { circulo(ctx, px + b[0], py + b[1], b[2] + 1, K); });
    bolas.forEach(function (b) { circulo(ctx, px + b[0], py + b[1], b[2], c[0]); });
    bolas.forEach(function (b) { circulo(ctx, px + b[0] - 1, py + b[1] - 2, Math.max(1, b[2] - 3), c[1]); });
    bolas.forEach(function (b) { circulo(ctx, px + b[0] - 3, py + b[1] - 4, Math.max(1, Math.round(b[2] / 3)), c[2]); });
  }
  function sombra(ctx, cx, y, rx) { elipse(ctx, cx, y, rx, 2, 'rgba(30,60,40,0.3)'); }
  var TRONCO = ['#6a5240', '#8c7058', '#b09472'];
  function tronco(ctx, x, y, w, h) { ret(ctx, x - 1, y, w + 2, h, K); ret(ctx, x, y, w, h, TRONCO[1]); ret(ctx, x, y, 2, h, TRONCO[2]); ret(ctx, x + w - 2, y, 2, h, TRONCO[0]); }
  // gota de orvalho redonda, com o contorno e o brilho: (cx, cy) = centro, r = raio
  function gota(ctx, cx, cy, r) {
    circulo(ctx, cx, cy, r + 1, K); circulo(ctx, cx, cy, r, '#cfeffa'); circulo(ctx, cx, cy, r - 1, '#f4fdff');
    ret(ctx, cx - 1, cy - 1, 1, 1, '#ffffff');
  }
  P.gota = gota;

  /* ---------- o piso: grama verde-menta clara, gotinhas de orvalho e a trilha de terra clara ---------- */
  I.PISOS['orvalho-orvalho'] = { cores: { piso: '#bde8c8', piso2: '#a9dcb8', detalhe: '#7fc294', luz: '#ddf6e2' },
    desenhar: function (ctx, px, py, tx, ty, p) {
      ret(ctx, px, py, 16, 16, p.piso);
      var i;
      if (P.trilha(tx, ty)) {
        // a trilha de terra clara, com a borda de grama onde ela acaba (como a do Bosque)
        var cima = P.trilha(tx, ty - 1), baixo = P.trilha(tx, ty + 1), esq = P.trilha(tx - 1, ty), dir = P.trilha(tx + 1, ty);
        ret(ctx, px, py, 16, 16, '#e6dcc0');
        ret(ctx, px + 2, py + 3, 5, 3, '#f4eeda'); ret(ctx, px + 8, py + 10, 6, 3, '#d6c8a2');
        for (i = 0; i < 3; i++) ret(ctx, px + Math.floor(sorte(tx, ty, 30 + i) * 14), py + Math.floor(sorte(tx, ty, 40 + i) * 14), 2, 1, '#c2b184');
        if (!cima) { ret(ctx, px, py, 16, 2, p.piso2); ret(ctx, px + 3, py + 2, 4, 1, p.piso2); ret(ctx, px + 10, py + 2, 3, 1, '#d0c29c'); }
        if (!baixo) { ret(ctx, px, py + 14, 16, 2, p.piso2); ret(ctx, px + 4, py + 13, 5, 1, '#d0c29c'); }
        if (!esq) { ret(ctx, px, py, 2, 16, p.piso2); ret(ctx, px + 2, py + 5, 1, 4, '#d0c29c'); }
        if (!dir) { ret(ctx, px + 14, py, 2, 16, p.piso2); ret(ctx, px + 13, py + 7, 1, 4, '#d0c29c'); }
        return;
      }
      // manchas de grama mais escura e mais clara, sem xadrez
      if (sorte(tx, ty, 1) < 0.5) ret(ctx, px + Math.floor(sorte(tx, ty, 2) * 8), py + 2, 8, 5, p.piso2);
      if (sorte(tx, ty, 3) < 0.4) ret(ctx, px + 1, py + 8 + Math.floor(sorte(tx, ty, 4) * 4), 9, 4, p.piso2);
      if (sorte(tx, ty, 5) < 0.3) ret(ctx, px + 6 + Math.floor(sorte(tx, ty, 6) * 6), py + 5, 4, 3, p.luz);
      // tufos de capim: lâminas de 3 px
      for (i = 0; i < 4; i++) {
        var gx = px + 1 + Math.floor(sorte(tx, ty, 10 + i) * 13), gy = py + 3 + Math.floor(sorte(tx, ty, 20 + i) * 11);
        ret(ctx, gx, gy - 2, 1, 3, p.detalhe); ret(ctx, gx + 1, gy - 3, 1, 3, p.detalhe); ret(ctx, gx + 2, gy - 1, 1, 2, p.detalhe);
      }
      // as gotinhas de orvalho brilhando na grama: 2 a 3 por tile, com a sombrinha e o brilho
      for (i = 0; i < 3; i++) {
        if (sorte(tx, ty, 60 + i) > 0.62) continue;
        var dx = px + 1 + Math.floor(sorte(tx, ty, 70 + i) * 13), dy = py + 1 + Math.floor(sorte(tx, ty, 80 + i) * 13);
        ret(ctx, dx, dy, 2, 2, '#eefcff'); ret(ctx, dx, dy, 1, 1, '#ffffff'); ret(ctx, dx + 1, dy + 2, 1, 1, 'rgba(120,190,215,0.55)');
      }
      // florzinha miúda de vez em quando (o bosque de manhã)
      if (sorte(tx, ty, 90) < 0.1) {
        var fx = px + 2 + Math.floor(sorte(tx, ty, 91) * 11), fy = py + 2 + Math.floor(sorte(tx, ty, 92) * 11);
        ret(ctx, fx, fy + 2, 1, 3, p.detalhe); ret(ctx, fx - 1, fy, 3, 2, sorte(tx, ty, 93) < 0.5 ? '#ffffff' : '#ffd9ea'); ret(ctx, fx, fy + 1, 1, 1, '#ffd34d');
      }
    } };

  /* ---------- a parede: as copas verde-claras lá no fundo, com troncos claros e gotinhas ---------- */
  I.PAREDES['orvalho-copas'] = { cores: { parede: '#6fae6e', parede2: '#8ccc84', rodape: '#4f8a56', detalhe: '#b4e6a2' },
    desenhar: function (ctx, px, py, tx) {
      copas(ctx, px, py, 16, 32);
      var t = Math.floor(sorte(tx, 0, 60) * 10);
      ret(ctx, px + t, py + 21, 3, 9, '#7a5a3c'); ret(ctx, px + t, py + 21, 1, 9, '#9c7a52');
      ret(ctx, px, py + 29, 16, 3, '#4f8a56');
      if (sorte(tx, 0, 61) < 0.4) { ret(ctx, px + 11, py + 6, 2, 2, '#e8fff4'); ret(ctx, px + 11, py + 6, 1, 1, '#ffffff'); }
    } };

  /* ---------- o céu aberto: a mata em volta em verde-água claro, com os raios de sol da manhã ---------- */
  var MATA = ['#8fd0b4', '#a2dcc2', '#bfecd6', '#7cc4a8'];
  function raios(ctx, w, h) {
    // os raios de sol da manhã: faixas diagonais em degraus de 1 px (pixel art), uma larga e uma fina
    ctx.fillStyle = 'rgba(255, 252, 214, 0.12)';
    for (var k = -h; k < w; k += 44) for (var j = 0; j < h; j++) ctx.fillRect(k + Math.round(j * 1.5), j, 14, 1);
    ctx.fillStyle = 'rgba(255, 255, 234, 0.18)';
    for (k = -h + 22; k < w; k += 44) for (j = 0; j < h; j++) ctx.fillRect(k + Math.round(j * 1.5), j, 4, 1);
  }
  function mata(ctx, w, h) {
    // as copas distantes da mata em volta: manchas grandes e irregulares, em verde-água claro
    ret(ctx, 0, 0, w, h, MATA[0]);
    for (var cy = 0; cy * 22 < h + 22; cy++) for (var cx = 0; cx * 22 < w + 22; cx++) {
      var bx = cx * 22 + 11 + Math.round((sorte(cx, cy, 11) - 0.5) * 16);
      var by = cy * 22 + 11 + Math.round((sorte(cx, cy, 12) - 0.5) * 14);
      circulo(ctx, bx, by, 12 + Math.floor(sorte(cx, cy, 13) * 6), MATA[1]);                       // a copa
      if (sorte(cx, cy, 14) < 0.55) circulo(ctx, bx - 4, by - 4, 6, MATA[2]);                      // a luz da manhã
      if (sorte(cx, cy, 15) < 0.35) circulo(ctx, bx + 6, by + 4, 4, MATA[3]);                      // a sombra da copa
      if (sorte(cx, cy, 16) < 0.22) { ret(ctx, bx + 2, by - 3, 2, 2, '#f2fff6'); ret(ctx, bx + 2, by - 3, 1, 1, '#ffffff'); }   // gotinha
    }
    raios(ctx, w, h);
  }
  I.FUNDOS.orvalho = { cor: MATA[0], desenhar: mata };

  /* ---------- a árvore-assinatura da mata: copa verde-clara enorme, com gotas de orvalho penduradas ---------- */
  I.objeto('orvalho-arvore', { w: 2, h: 1, solido: true, alto: true, topo: 46,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 14, 13);
      tronco(ctx, px + 12, py - 6, 8, 20);
      ret(ctx, px + 9, py + 11, 4, 3, K); ret(ctx, px + 20, py + 11, 4, 3, K); ret(ctx, px + 10, py + 11, 2, 2, TRONCO[1]); ret(ctx, px + 21, py + 11, 2, 2, TRONCO[0]);
      folhagem(ctx, px, py, [[16, -20, 14], [6, -10, 9], [26, -10, 9], [16, -8, 10]], VERDES);
      // as gotas de orvalho: no meio da copa e nas pontas das folhas
      gota(ctx, px + 10, py - 14, 2); gota(ctx, px + 23, py - 9, 2); gota(ctx, px + 17, py - 25, 2);
      ret(ctx, px + 4, py - 6, 2, 2, '#e8fff4'); ret(ctx, px + 27, py - 3, 2, 2, '#e8fff4');
    } });

  /* ---------- a folha grande com a gota de orvalho em cima (não sólida: ela passa por cima) ---------- */
  I.objeto('orvalho-folha', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      // o cabinho e a folha caída na grama, apontando para a direita
      ret(ctx, px + 1, py + 11, 4, 2, '#6f9e5a'); ret(ctx, px + 1, py + 11, 4, 1, '#8cbc74');
      elipse(ctx, px + 8, py + 9, 7, 4, K); elipse(ctx, px + 8, py + 9, 6, 3, '#8ccc84');
      elipse(ctx, px + 7, py + 9, 4, 2, '#b4e6a2'); ret(ctx, px + 3, py + 9, 11, 1, '#6fae6e');
      ret(ctx, px + 12, py + 7, 2, 1, '#6fae6e'); ret(ctx, px + 10, py + 11, 3, 1, '#6fae6e');
      // a gota de orvalho em cima da folha
      gota(ctx, px + 10, py + 7, 2);
      ret(ctx, px + 14, py + 9, 1, 1, '#ffffff');
    } });

  /* ---------- a florzinha de orvalho: branquinha, com a gota brilhando na ponta ---------- */
  I.objeto('orvalho-florzinha', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 7, py + 9, 2, 6, '#6fae6e'); ret(ctx, px + 5, py + 11, 2, 1, '#8ccc84'); ret(ctx, px + 9, py + 13, 2, 1, '#8ccc84');
      // pétalas em cruz, com o miolinho dourado
      ret(ctx, px + 5, py + 5, 6, 2, K); ret(ctx, px + 5, py + 8, 6, 2, K);
      ret(ctx, px + 7, py + 2, 2, 10, K); ret(ctx, px + 3, py + 5, 10, 2, K); ret(ctx, px + 3, py + 8, 10, 2, K);
      ret(ctx, px + 6, py + 5, 4, 2, '#ffffff'); ret(ctx, px + 5, py + 8, 2, 2, '#ffffff');
      ret(ctx, px + 9, py + 8, 2, 2, '#ffffff'); ret(ctx, px + 7, py + 3, 2, 2, '#ffffff'); ret(ctx, px + 7, py + 10, 2, 2, '#ffffff');
      ret(ctx, px + 7, py + 7, 2, 2, '#ffd34d');
      gota(ctx, px + 8, py + 1, 1);
    } });
})();
