/* Bosque da Neblina, o chão, o céu e os objetos-assinatura (prefixo neblina-): o piso 'neblina-neblina' (grama
   cinza-esverdeada pálida, as poças de névoa e a trilha de terra), a parede 'neblina-copas' (as copas cinza-azuladas lá
   no fundo, com a névoa presa entre elas) e o fundo I.FUNDOS.neblina (a mata em volta, cinza-lilás, em camadas de
   névoa). Os objetos-assinatura: a árvore da neblina (w 2, a mata da borda), o banco de neblina (a nuvem achatada que
   passa por cima da grama) e o cogumelo-da-neblina. O resto do layout usa os objetos do Bosque (interiores/bosque/).
   A trilha (P.trilha) fica em neblina.js, a segunda parte: o piso a lê na hora de desenhar, nunca na carga.
   Divide Reino._predios.neblina (P.folhagem, P.copas). No carregamento só registra funções: nada de DOM nem canvas. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, ret = D.ret, circulo = D.circulo, elipse = D.elipse;
  var K = R.Desenho.K, sorte = R.Desenho.sorte;
  var P = (R._predios = R._predios || {}).neblina = R._predios.neblina || {};
  var PL = R._predios.planetas || {};
  function tempo(t) { return PL.tempo ? PL.tempo(t) : ((R.util && R.util.reduzMovimentoSistema) ? 0 : (t || 0)); }
  var COPA = ['#46546e', '#5d6f8e', '#8394b2'];   // as copas cinza-azuladas: a árvore, a parede e o céu
  var TRONCO = ['#4a4256', '#6a6078', '#8a8098'];
  var NEVOA = 'rgba(216,222,236,0.34)';

  // folhagem em bolas [cx, cy, raio], com o contorno só por fora (todas as bolas de contorno primeiro)
  function folhagem(ctx, px, py, bolas, c) {
    bolas.forEach(function (b) { circulo(ctx, px + b[0], py + b[1], b[2] + 1, K); });
    bolas.forEach(function (b) { circulo(ctx, px + b[0], py + b[1], b[2], c[0]); });
    bolas.forEach(function (b) { circulo(ctx, px + b[0] - 1, py + b[1] - 2, Math.max(1, b[2] - 3), c[1]); });
    bolas.forEach(function (b) { circulo(ctx, px + b[0] - 3, py + b[1] - 4, Math.max(1, Math.round(b[2] / 3)), c[2]); });
  }
  P.folhagem = folhagem;
  function sombra(ctx, cx, y, rx) { elipse(ctx, cx, y, rx, 2, 'rgba(52,56,84,0.3)'); }
  function tronco(ctx, x, y, w, h) { ret(ctx, x - 1, y, w + 2, h, K); ret(ctx, x, y, w, h, TRONCO[1]); ret(ctx, x, y, 2, h, TRONCO[2]); ret(ctx, x + w - 2, y, 2, h, TRONCO[0]); }

  /* ---------- copas: folhagem em bolas na grade global (as emendas dos tiles não aparecem), com a névoa presa nela ---------- */
  function copas(ctx, x, y, w, h) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ret(ctx, x, y, w, h, COPA[0]);
    var c0 = Math.floor((x - 8) / 12), c1 = Math.floor((x + w + 8) / 12), r0 = Math.floor((y - 8) / 12), r1 = Math.floor((y + h + 8) / 12);
    for (var cr = r0; cr <= r1; cr++) for (var cc = c0; cc <= c1; cc++) {
      var bx = cc * 12 + 6 + Math.round((sorte(cc, cr, 1) - 0.5) * 8) + (cr & 1) * 6, by = cr * 12 + 6 + Math.round((sorte(cc, cr, 2) - 0.5) * 6);
      circulo(ctx, bx, by, 8, COPA[0]); circulo(ctx, bx - 1, by - 1, 6, COPA[1]); circulo(ctx, bx - 2, by - 2, 3, COPA[2]);
      if (sorte(cc, cr, 3) < 0.24) ret(ctx, bx + 2, by + 1, 4, 1, 'rgba(214,220,236,0.5)');   // a névoa presa entre as folhas
      if (sorte(cc, cr, 4) < 0.1) ret(ctx, bx - 3, by + 3, 1, 1, '#e6eeff');                  // uma gotinha de luz
    }
    ctx.restore();
  }
  P.copas = copas;

  /* ---------- o piso: grama cinza-esverdeada pálida, poças de névoa e a trilha de terra ---------- */
  I.PISOS['neblina-neblina'] = { cores: { piso: '#a8b8ad', piso2: '#a1b2a5', detalhe: '#94ab9c', luz: '#c0cec2', nevoa: '#dbe2e4' },
    desenhar: function (ctx, px, py, tx, ty, p) {
      ret(ctx, px, py, 16, 16, p.piso);
      var i;
      if (P.trilha && P.trilha(tx, ty)) {
        // a trilha de terra: terra batida mais escura (o chão da neblina é claro), com pedrinhas e a grama na borda
        var cima = P.trilha(tx, ty - 1), baixo = P.trilha(tx, ty + 1), esq = P.trilha(tx - 1, ty), dir = P.trilha(tx + 1, ty);
        ret(ctx, px, py, 16, 16, '#8d8163');
        if (sorte(tx, ty, 31) < 0.72) ret(ctx, px + 1 + Math.floor(sorte(tx, ty, 32) * 6), py + 2 + Math.floor(sorte(tx, ty, 33) * 9), 5, 2, '#9a8e70');
        if (sorte(tx, ty, 34) < 0.6) ret(ctx, px + 6 + Math.floor(sorte(tx, ty, 35) * 7), py + 6 + Math.floor(sorte(tx, ty, 36) * 7), 4, 2, '#796e53');
        for (i = 0; i < 3; i++) ret(ctx, px + 1 + Math.floor(sorte(tx, ty, 40 + i) * 13), py + 2 + Math.floor(sorte(tx, ty, 45 + i) * 12), 2, 1, '#645b45');
        if (!cima) { ret(ctx, px, py, 16, 2, p.piso2); ret(ctx, px + 3, py + 2, 3, 1, p.piso2); }
        if (!baixo) { ret(ctx, px, py + 14, 16, 2, p.piso2); ret(ctx, px + 7, py + 13, 4, 1, '#6f654c'); }
        if (!esq) { ret(ctx, px, py, 2, 16, p.piso2); ret(ctx, px + 2, py + 6, 1, 4, '#6f654c'); }
        if (!dir) { ret(ctx, px + 14, py, 2, 16, p.piso2); ret(ctx, px + 13, py + 9, 1, 4, '#6f654c'); }
        return;
      }
      // manchas de grama (mais escura e mais clara), sem xadrez
      if (sorte(tx, ty, 1) < 0.5) ret(ctx, px + Math.floor(sorte(tx, ty, 2) * 8), py + 2, 8, 5, p.piso2);
      if (sorte(tx, ty, 3) < 0.4) ret(ctx, px + 1, py + 8 + Math.floor(sorte(tx, ty, 4) * 4), 9, 4, p.piso2);
      if (sorte(tx, ty, 5) < 0.3) ret(ctx, px + 6 + Math.floor(sorte(tx, ty, 6) * 6), py + 5, 4, 3, p.luz);
      // as poças de névoa: uma mancha clara e rasa (rasa de propósito: névoa, não pedra)
      if (sorte(tx, ty, 7) < 0.3) {
        var nx = px + 3 + Math.floor(sorte(tx, ty, 8) * 6), ny = py + 5 + Math.floor(sorte(tx, ty, 9) * 6);
        elipse(ctx, nx + 3, ny + 2, 6, 2, 'rgba(214,224,226,0.4)');
        elipse(ctx, nx + 4, ny + 1, 4, 1, 'rgba(240,246,248,0.42)');
      }
      // dois tufos de capim fino, cinza-esverdeado (na cor da grama, para não virar uma grade de "m")
      for (i = 0; i < 2; i++) {
        var gx = px + 2 + Math.floor(sorte(tx, ty, 10 + i) * 12), gy = py + 5 + Math.floor(sorte(tx, ty, 20 + i) * 9);
        ret(ctx, gx, gy - 2, 1, 3, p.detalhe); ret(ctx, gx + 1, gy - 3, 1, 2, p.detalhe);
      }
      if (sorte(tx, ty, 50) < 0.1) {
        var fx = px + 3 + Math.floor(sorte(tx, ty, 51) * 10), fy = py + 3 + Math.floor(sorte(tx, ty, 52) * 10);
        ret(ctx, fx, fy, 2, 2, '#f2f4fa'); ret(ctx, fx, fy, 1, 1, '#ffffff');
      }
    } };

  /* ---------- a parede: as copas cinza-azuladas lá no fundo, com os troncos e a névoa na base ---------- */
  I.PAREDES['neblina-copas'] = { cores: { parede: '#46546e', parede2: '#5d6f8e', rodape: '#2c3650', detalhe: '#8394b2' },
    desenhar: function (ctx, px, py, tx) {
      copas(ctx, px, py, 16, 32);
      var t = Math.floor(sorte(tx, 0, 60) * 10);
      ret(ctx, px + t, py + 22, 3, 8, '#4a4256'); ret(ctx, px + t, py + 22, 1, 8, '#6a6078'); ret(ctx, px + t + 3, py + 25, 2, 1, '#4a4256');
      ret(ctx, px, py + 29, 16, 3, '#2c3650');
      if (sorte(tx, 0, 61) < 0.55) { ret(ctx, px + 1, py + 26, 12, 2, NEVOA); ret(ctx, px + 4, py + 25, 8, 1, NEVOA); }
    } };

  /* ---------- a árvore da neblina: copa cinza-azulada com a névoa presa nela (a mata da borda) ---------- */
  I.objeto('neblina-arvore', { w: 2, h: 1, solido: true, alto: true, topo: 46,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 14, 13);
      tronco(ctx, px + 12, py - 6, 8, 20);
      ret(ctx, px + 9, py + 10, 4, 3, K); ret(ctx, px + 20, py + 10, 4, 3, K);   // as raízes de fora
      ret(ctx, px + 10, py + 11, 2, 2, TRONCO[1]); ret(ctx, px + 21, py + 11, 2, 2, TRONCO[0]);
      folhagem(ctx, px, py, [[16, -20, 14], [6, -10, 9], [26, -10, 9], [16, -8, 10]], COPA);
      // a névoa presa na copa, em fios e gotinhas de luz
      ret(ctx, px + 4, py - 24, 6, 1, 'rgba(214,220,236,0.42)'); ret(ctx, px + 19, py - 15, 5, 1, 'rgba(214,220,236,0.36)');
      ret(ctx, px + 12, py - 32, 2, 1, '#e6eeff'); ret(ctx, px + 23, py - 27, 2, 2, '#e6eeff'); ret(ctx, px + 7, py - 13, 1, 1, '#e6eeff');
      ret(ctx, px + 13, py - 2, 5, 1, 'rgba(214,220,236,0.45)');
    } });

  /* ---------- o banco de neblina: a nuvem achatada que passa por cima da grama (não sólida) ---------- */
  I.objeto('neblina-banco', { w: 2, h: 1, solido: false, plano: true, semSombra: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 16, py + 11, 15, 4, 'rgba(214,222,238,0.42)');
      elipse(ctx, px + 10, py + 9, 9, 3, 'rgba(230,234,246,0.42)');
      elipse(ctx, px + 23, py + 10, 8, 3, 'rgba(206,214,234,0.36)');
      ret(ctx, px + 4, py + 8, 9, 1, 'rgba(244,247,253,0.55)');
      ret(ctx, px + 17, py + 7, 7, 1, 'rgba(244,247,253,0.45)');
      ret(ctx, px + 8, py + 12, 13, 1, 'rgba(196,204,226,0.32)');
      ret(ctx, px + 2, py + 11, 3, 1, 'rgba(226,230,244,0.45)');
    },
    anim: function (ctx, px, py, t) {
      var f = tempo(t) ? Math.floor(tempo(t) / 700) % 3 : 0;
      ret(ctx, px + 5 + f * 4, py + 6 + (f & 1), 2, 1, 'rgba(248,250,255,0.6)');
      ret(ctx, px + 20 - f * 3, py + 9, 2, 1, 'rgba(248,250,255,0.5)');
    } });

  /* ---------- o cogumelo-da-neblina: o chapéu lilás-cinza com a névoa em volta (não sólido) ---------- */
  // o chapéu lilás-cinza de pontinha clara e o pé esbranquiçado; (cx, base) = meio e chão
  function cogumelo(ctx, cx, base, r) {
    ret(ctx, cx - 2, base - r - 1, 5, r + 2, K);
    ret(ctx, cx - 1, base - r, 3, r + 1, '#eeeaf8');
    ret(ctx, cx - 1, base - r, 1, r + 1, '#ffffff');
    elipse(ctx, cx, base - r - 1, r + 2, r, K);
    elipse(ctx, cx, base - r - 1, r + 1, Math.max(1, r - 1), '#a898c8');
    elipse(ctx, cx - 1, base - r - 2, Math.max(1, r - 2), Math.max(1, r - 3), '#c4b6dc');
    ret(ctx, cx - r + 1, base - r - 3, 2, 1, '#f0ecfa'); ret(ctx, cx + 1, base - r - 2, 1, 1, '#f0ecfa');
    ret(ctx, cx + r, base - r + 1, 1, 1, '#8f80b0');   // a sombrinha do chapéu
  }
  I.objeto('neblina-cogumelo', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 8, py + 9, 9, 6, 'rgba(196,194,232,0.18)');
      cogumelo(ctx, px + 8, py + 15, 4);
      cogumelo(ctx, px + 15, py + 16, 2);
      ret(ctx, px + 2, py + 5, 1, 1, '#e6eeff'); ret(ctx, px + 13, py + 3, 1, 1, '#e6eeff');
    },
    anim: function (ctx, px, py, t) {
      var f = tempo(t) ? Math.floor(tempo(t) / 520) % 3 : 0;
      ret(ctx, px + 1 + f * 5, py + 2 + (f & 1) * 4, 1, 1, 'rgba(232,236,255,0.8)');
    } });

  /* ---------- o céu aberto: a mata em volta em cinza-lilás, em camadas de névoa ---------- */
  I.FUNDOS.neblina = { cor: '#4e5872',
    desenhar: function (ctx, w, h) {
      copas(ctx, 0, 0, w, h);
      // três camadas de névoa atravessando a mata: uma larga, uma no meio e uma baixa, todas moles
      var CAMADAS = [[0.18, 0.9, 26, 'rgba(206,214,230,0.1)'], [0.42, 1.2, 30, 'rgba(220,224,240,0.11)'], [0.68, 0.8, 22, 'rgba(198,206,226,0.1)']];
      for (var f = 0; f < CAMADAS.length; f++) {
        var c = CAMADAS[f], fy = Math.round(h * c[0]);
        elipse(ctx, Math.round(w / 2), fy, Math.round(w * c[1]), c[2], c[3]);
        elipse(ctx, Math.round(w / 2), fy + Math.round(c[2] * 0.6), Math.round(w * 0.42), Math.round(c[2] * 0.5), c[3]);
      }
      // fios de névoa mais claros, soltos entre as copas
      for (var i = 0; i < 6; i++) {
        var y = Math.round(h * (0.1 + i * 0.15)), x = Math.round(w * (0.1 + sorte(i, 1, 3) * 0.7));
        ret(ctx, x, y, Math.round(w * 0.18), 2, 'rgba(224,228,242,0.09)');
      }
    } };
})();
