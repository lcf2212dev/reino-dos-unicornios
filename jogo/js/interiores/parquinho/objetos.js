/* Parquinho, parte 2: os brinquedos da fase 1 (prefixo parquinho-): balanço, escorregador, gangorra e caixa de areia.
   Cada um tem a ação { tipo: 'parquinhoBrincar', brinquedo } (interiores/parquinho/brincar.js); a parte que se mexe
   (assentos, prancha) sai do desenho parado enquanto ele está em uso (B.emUso, na `chave`) e a pose a desenha
   (poses.js, com as medidas de P.GEO, em px da pegada). Divide Reino._predios.parquinho (P, de fundo.js).
   Nada de DOM nem canvas no carregamento. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, ret = D.ret, elipse = D.elipse, triangulo = D.triangulo;
  var K = R.Desenho.K;
  var P = R._predios.parquinho;
  function B() { return R.ParquinhoBrincar; }
  function emUso(id) { var b = B(); return !!(b && b.emUso(id)); }
  function sombra(ctx, cx, y, rx) { elipse(ctx, cx, y, rx, 2, 'rgba(58,36,70,0.2)'); }
  var GEO = P.GEO = {};

  /* ---------- balanço (3 × 2): barra vermelha, postes amarelos e dois assentos ---------- */
  GEO.balanco = { barra: -13, assentos: [16, 32], assento: 16, cores: ['#5fb4ff', '#ff7eb6'] };
  // um assento pendurado: correntes da barra (ax, ay) até o assento (cx, cy = topo da tábua)
  P.assento = function (ctx, ax, ay, cx, cy, cor) {
    P.linha(ctx, ax - 5, ay, cx - 5, cy, '#8e9ab4'); P.linha(ctx, ax + 5, ay, cx + 5, cy, '#8e9ab4');
    P.caixa(ctx, cx - 7, cy, 15, 4, cor); ret(ctx, cx - 6, cy + 1, 13, 1, '#ffffff');
  };
  I.objeto('parquinho-balanco', { w: 3, h: 2, solido: 'base', alto: true, topo: 20,
    chave: function () { return emUso('balanco') ? 'uso' : ''; },
    desenhar: function (ctx, px, py) {
      var g = GEO.balanco;
      sombra(ctx, px + 24, py + 30, 22);
      [2, 42].forEach(function (x) {                                   // os postes (pernas em A)
        P.caixa(ctx, px + x, py - 16, 5, 47, '#ffd34d'); ret(ctx, px + x + 1, py - 15, 1, 45, '#fff1a0');
        P.caixa(ctx, px + x - 2, py + 28, 9, 4, '#e0a020');
      });
      P.caixa(ctx, px, py - 19, 48, 6, '#ff5c6a'); ret(ctx, px + 1, py - 18, 46, 1, '#ffb0b8');   // a barra
      if (emUso('balanco')) return;
      g.assentos.forEach(function (x, i) { P.assento(ctx, px + x, py + g.barra, px + x, py + g.assento, g.cores[i]); });
    } });

  /* ---------- escorregador (3 × 2): escada azul à esquerda, plataforma e rampa amarela até embaixo à direita ---------- */
  GEO.escorregador = { escada: 8, plataforma: -12, rampa: [[17, -10], [43, 22]], fim: [47, 27] };
  I.objeto('parquinho-escorregador', { w: 3, h: 2, solido: 'base', alto: true, topo: 24,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 24, py + 30, 22);
      var x, y;
      // a escada
      P.caixa(ctx, px + 3, py - 12, 3, 43, '#5fb4ff'); P.caixa(ctx, px + 11, py - 12, 3, 43, '#5fb4ff');
      for (y = -8; y < 30; y += 5) P.caixa(ctx, px + 5, py + y, 7, 3, '#bfe9ff');
      // a plataforma com o corrimão e o poste de baixo
      P.caixa(ctx, px + 13, py - 10, 4, 41, '#a66bff');
      P.caixa(ctx, px + 2, py - 14, 17, 5, '#ff7eb6'); ret(ctx, px + 3, py - 13, 15, 1, '#ffd1e6');
      P.caixa(ctx, px + 2, py - 24, 3, 11, '#5fb4ff'); P.caixa(ctx, px + 16, py - 24, 3, 11, '#5fb4ff'); P.caixa(ctx, px + 2, py - 24, 17, 3, '#5fb4ff');
      // a rampa: faixa em degraus de (17, -10) até (43, 22), depois reta até a ponta
      var r = GEO.escorregador.rampa;
      for (x = r[0][0]; x <= 46; x++) {
        y = x <= r[1][0] ? Math.round(r[0][1] + (x - r[0][0]) * (r[1][1] - r[0][1]) / (r[1][0] - r[0][0])) : r[1][1];
        ret(ctx, px + x, py + y - 3, 1, 8, K);
        ret(ctx, px + x, py + y - 2, 1, 2, '#ff9f45');              // a beirada
        ret(ctx, px + x, py + y, 1, 3, x % 6 < 3 ? '#ffd34d' : '#ffe066');
        ret(ctx, px + x, py + y, 1, 1, '#fff1a0');
      }
      P.caixa(ctx, px + 41, py + 24, 3, 7, '#a66bff');                 // o pé da rampa
    } });

  /* ---------- gangorra (4 × 1): o pé vermelho no meio e a prancha (que se inclina em degraus) ---------- */
  GEO.gangorra = { meio: 32, pivo: 7, meia: 28, inclina: 5 };
  // a prancha com inclinação a (px que a ponta esquerda desce); pegada em (px, py)
  P.prancha = function (ctx, px, py, a) {
    var g = GEO.gangorra, x, y;
    for (x = g.meio - g.meia; x <= g.meio + g.meia; x++) {
      y = py + g.pivo + Math.round(a * (g.meio - x) / g.meia);
      ret(ctx, px + x, y - 1, 1, 5, K);
      ret(ctx, px + x, y, 1, 3, x < g.meio ? '#5fb4ff' : '#ff7eb6');
      ret(ctx, px + x, y, 1, 1, '#ffffff');
    }
    [g.meio - g.meia + 6, g.meio + g.meia - 6].forEach(function (hx, i) {   // as alças
      var hy = py + g.pivo + Math.round(a * (g.meio - hx) / g.meia) - 6;
      P.caixa(ctx, px + hx - 1, hy, 3, 6, '#ffd34d'); P.caixa(ctx, px + hx - 3, hy - 1, 7, 3, i ? '#ff5c6a' : '#5fb4ff');
    });
  };
  I.objeto('parquinho-gangorra', { w: 4, h: 1, solido: true, alto: true, topo: 8,
    chave: function () { return emUso('gangorra') ? 'uso' : ''; },
    desenhar: function (ctx, px, py) {
      var g = GEO.gangorra;
      sombra(ctx, px + 32, py + 14, 26);
      ret(ctx, px + g.meio - 6, py + 6, 13, 9, K); triangulo(ctx, px + g.meio - 5, py + 7, 11, 8, '#ff5c6a');   // o pé
      ret(ctx, px + g.meio - 1, py + 9, 2, 2, '#ffd34d');
      if (!emUso('gangorra')) P.prancha(ctx, px, py, g.inclina);
    } });

  /* ---------- caixa de areia (3 × 2): moldura de madeira, balde e pazinha; o castelinho fica depois de brincar ---------- */
  GEO.areia = { ela: [12, 23], castelo: [30, 25], uni: [56, 30] };   // o unicórnio fica na grama, do lado de fora
  // o castelinho em etapas (1 a 4), com a base em (x, y)
  P.castelo = function (ctx, x, y, etapa) {
    var A = '#e8c77e', L = '#f6e2a8', S = '#c9a45e';
    if (etapa >= 1) { P.caixa(ctx, x - 8, y - 6, 17, 7, A); ret(ctx, x - 7, y - 5, 15, 1, L); ret(ctx, x - 1, y - 3, 3, 3, S); }
    if (etapa >= 2) { P.caixa(ctx, x - 9, y - 12, 6, 7, A); P.caixa(ctx, x + 4, y - 12, 6, 7, A); ret(ctx, x - 8, y - 11, 1, 5, L); ret(ctx, x + 5, y - 11, 1, 5, L); }
    if (etapa >= 3) { P.caixa(ctx, x - 3, y - 17, 7, 12, A); ret(ctx, x - 2, y - 16, 1, 10, L); ret(ctx, x - 9, y - 14, 2, 2, K); ret(ctx, x - 5, y - 14, 2, 2, K); ret(ctx, x + 4, y - 14, 2, 2, K); ret(ctx, x + 8, y - 14, 2, 2, K); }
    if (etapa >= 4) { ret(ctx, x, y - 24, 1, 8, K); ret(ctx, x + 1, y - 24, 4, 3, K); ret(ctx, x + 1, y - 23, 3, 1, '#ff7eb6'); }   // a bandeirinha
  };
  I.objeto('parquinho-areia', { w: 3, h: 2, solido: true, alto: false,
    chave: function () { return (emUso('areia') ? 'uso' : '') + (P.castelos && P.castelos() > 0 ? 'c' : ''); },
    desenhar: function (ctx, px, py) {
      var x, y;
      sombra(ctx, px + 24, py + 30, 23);
      P.caixa(ctx, px + 1, py + 3, 46, 28, '#c98a4a');
      ret(ctx, px + 2, py + 4, 44, 1, '#e0a868');
      ret(ctx, px + 4, py + 6, 40, 22, K); ret(ctx, px + 5, py + 7, 38, 20, '#f3dc9a');
      for (y = 0; y < 5; y++) for (x = 0; x < 9; x++) if ((x * 7 + y * 3) % 5 === 0) ret(ctx, px + 7 + x * 4, py + 9 + y * 4, 1, 1, '#d8bd78');
      ret(ctx, px + 6, py + 8, 36, 1, '#e3c788');                                 // a sombra da borda
      if (P.castelos && P.castelos() > 0 && !emUso('areia')) P.castelo(ctx, px + GEO.areia.castelo[0], py + GEO.areia.castelo[1], 4);
      if (emUso('areia')) return;
      // o balde vermelho e a pazinha amarela, no canto
      P.caixa(ctx, px + 34, py + 15, 7, 7, '#ff5c6a'); ret(ctx, px + 35, py + 16, 5, 1, '#ffb0b8'); ret(ctx, px + 35, py + 13, 5, 1, K);
      ret(ctx, px + 9, py + 20, 6, 1, K); P.caixa(ctx, px + 14, py + 18, 5, 5, '#ffd34d');
    } });

  /* ---------- presente (os brinquedos da fase 2 antes de ela completar todas as matérias) ---------- */
  // caixa embrulhada na pegada inteira (W × H px), com fita e laço; cor = [papel, papel escuro, fita]
  P.presente = function (ctx, px, py, W, H, cor) {
    sombra(ctx, px + W / 2, py + H - 2, W / 2 - 2);
    var x0 = px + 3, y0 = py + 8, w = W - 6, h = H - 10, mx = px + Math.floor(W / 2);
    P.caixa(ctx, x0, y0, w, h, cor[0]);
    for (var i = 0; i < w - 2; i += 6) ret(ctx, x0 + 1 + i, y0 + 1, 3, h - 2, cor[1]);   // listras do papel
    P.caixa(ctx, x0 - 2, y0 - 2, w + 4, 7, cor[0]); ret(ctx, x0 - 1, y0 - 1, w + 2, 1, '#ffffff');   // a tampa
    ret(ctx, mx - 3, y0 - 2, 7, h + 2, K); ret(ctx, mx - 2, y0 - 1, 5, h, cor[2]);                   // a fita
    ret(ctx, x0, y0 + Math.floor(h / 2) - 2, w, 5, K); ret(ctx, x0 + 1, y0 + Math.floor(h / 2) - 1, w - 2, 3, cor[2]);
    ret(ctx, mx - 2, y0 - 1, 5, h, cor[2]);
    // o laço: duas voltas e o nó
    elipse(ctx, mx - 6, y0 - 6, 5, 4, K); elipse(ctx, mx + 6, y0 - 6, 5, 4, K);
    elipse(ctx, mx - 6, y0 - 6, 4, 3, cor[2]); elipse(ctx, mx + 6, y0 - 6, 4, 3, cor[2]);
    ret(ctx, mx - 7, y0 - 7, 2, 1, '#ffffff'); ret(ctx, mx + 5, y0 - 7, 2, 1, '#ffffff');
    P.caixa(ctx, mx - 3, y0 - 9, 7, 7, cor[2]);
    // a estrelinha "?" de surpresa
    ret(ctx, px + 6, py + 2, 1, 3, '#ffe066'); ret(ctx, px + 5, py + 3, 3, 1, '#ffe066');
    ret(ctx, px + W - 6, py + 4, 1, 3, '#ffffff'); ret(ctx, px + W - 7, py + 5, 3, 1, '#ffffff');
  };
})();
