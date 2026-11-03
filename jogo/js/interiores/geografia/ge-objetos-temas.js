/* Estação dos Caminhos da Geografia do Mundo (4º bimestre), parte 2 dos objetos novos: os enfeites dos capítulos.
   Capítulo 10 (matérias-primas: madeira, látex, sal e o lápis), 11 (paisagem: a câmera e os quadros de paisagem) e
   12 (transformação das paisagens: a gruta, o antes e depois, os tijolos, o cone e a muda).
   Carrega depois de geografia/ge-objetos.js; usa de Reino._predios.geografia: LARANJA. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var K = R.Desenho.K;
  var S = R._predios.geografia;
  var LARANJA = S.LARANJA;
  function v(o, k, padrao) { return (o && o.var && o.var[k] !== undefined) ? o.var[k] : padrao; }

  /* ================= CAPÍTULO 10: MATÉRIAS-PRIMAS ================= */
  // três toras de madeira empilhadas, vistas de ponta (os anéis da árvore)
  I.objeto('geografia-toras', { w: 1, h: 1, topo: 4, solido: true,
    desenhar: function (ctx, px, py) {
      [[4, 11], [12, 11], [8, 4]].forEach(function (p) {
        circulo(ctx, px + p[0], py + p[1], 4, K); circulo(ctx, px + p[0], py + p[1], 3, C.madeiraClara);
        circulo(ctx, px + p[0], py + p[1], 1, C.madeira); ret(ctx, px + p[0] - 2, py + p[1] - 2, 1, 1, C.madeira3);
      });
    } });
  // a seringueira: o tronco com o risco na casca e a tigelinha recolhendo o látex branco; a copa verde em cima
  I.objeto('geografia-seringueira', { w: 1, h: 1, topo: 26, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      elipse(ctx, cx, py + 13, 6, 2, '#8fb83a');
      ret(ctx, cx - 3, py - 10, 7, 24, K); ret(ctx, cx - 2, py - 10, 5, 23, '#9a7a5a'); ret(ctx, cx - 2, py - 10, 1, 23, '#b8987a');
      for (var i = 0; i < 3; i++) ret(ctx, cx - 2 + i, py - 2 + i, 2, 1, C.creme);   // o risco na casca
      ret(ctx, cx + 1, py + 1, 1, 3, C.branco);
      ret(ctx, cx + 1, py + 4, 6, 4, K); ret(ctx, cx + 2, py + 4, 4, 2, C.branco);    // a tigelinha
      circulo(ctx, cx, py - 17, 8, K); circulo(ctx, cx, py - 17, 7, C.folha3);
      circulo(ctx, cx - 3, py - 19, 3, C.folha); circulo(ctx, cx + 3, py - 15, 3, C.folha); ret(ctx, cx - 1, py - 23, 2, 2, C.folha4);
    } });
  // monte de sal branquinho com a pazinha e o saco
  I.objeto('geografia-sal', { w: 1, h: 1, topo: 6, solido: true,
    desenhar: function (ctx, px, py) {
      triangulo(ctx, px + 1, py - 5, 13, 19, K); triangulo(ctx, px + 2, py - 4, 11, 18, '#f4f6fb');
      ret(ctx, px + 5, py + 2, 2, 1, '#d8dce8'); ret(ctx, px + 8, py + 8, 2, 1, '#d8dce8'); ret(ctx, px + 4, py + 10, 1, 1, '#d8dce8');
      ret(ctx, px + 12, py + 1, 1, 9, K); ret(ctx, px + 11, py + 10, 3, 4, K); ret(ctx, px + 12, py + 10, 1, 3, C.metal);   // a pá
    } });
  // o cartaz das partes do lápis (parede): grafite, madeira, o anel de metal e a borracha, com as setinhas
  I.objeto('geografia-lapis', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      var x = px + 1, y = py + 7;
      contornoRet(ctx, x, y, 30, 20, C.creme);
      for (var i = 0; i < 20; i++) {
        var lx = x + 4 + i, ly = y + 15 - Math.floor(i * 0.55);
        var cor = i < 3 ? C.rosa : i < 5 ? C.metal : i < 17 ? '#ffb020' : i < 19 ? C.madeiraClara : '#4a4a5a';
        ret(ctx, lx, ly - 1, 1, 3, K); ret(ctx, lx, ly, 1, 1, cor);
      }
      ret(ctx, x + 23, y + 4, 3, 1, '#4a4a5a'); ret(ctx, x + 2, y + 3, 3, 1, LARANJA); ret(ctx, x + 2, y + 5, 2, 1, '#c8b8d8');
      ret(ctx, x + 22, y + 15, 4, 1, LARANJA); ret(ctx, x + 22, y + 17, 3, 1, '#c8b8d8');
    } });

  /* ================= CAPÍTULO 11: PAISAGEM ================= */
  // a câmera fotográfica no tripé: o retrato de um lugar
  I.objeto('geografia-camera', { w: 1, h: 1, topo: 20, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 1, py - 6, 3, 18, K); ret(ctx, cx, py - 6, 1, 17, C.metal2);
      for (var i = 0; i < 7; i++) { ret(ctx, cx - 2 - i, py + 6 + i, 2, 1, K); ret(ctx, cx + 1 + i, py + 6 + i, 2, 1, K); }
      contornoRet(ctx, cx - 7, py - 16, 15, 10, '#3a3a4a'); ret(ctx, cx - 6, py - 15, 13, 1, '#5a5a6a');
      ret(ctx, cx - 5, py - 19, 4, 3, K); ret(ctx, cx - 4, py - 18, 2, 2, C.ouro3);   // o flash
      circulo(ctx, cx + 1, py - 11, 3, K); circulo(ctx, cx + 1, py - 11, 2, '#5fb4ff'); ret(ctx, cx, py - 12, 1, 1, C.branco);
      ret(ctx, cx + 5, py - 15, 1, 1, '#e0433f');
    },
    anim: function (ctx, px, py, t) {
      if (Math.floor(t / 900) % 5 === 0) { ret(ctx, px + 3, py - 21, 3, 1, C.ouro3); ret(ctx, px + 4, py - 22, 1, 3, C.ouro3); }
    } });
  // quadro de paisagem na parede (var.cena: 'natural' montanha, rio e árvores; 'cidade' prédios, rua e carro;
  // 'campo' plantação, cerca e casinha)
  I.objeto('geografia-paisagem', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var x = px + 1, y = py + 6, cena = v(o, 'cena', 'natural');
      contornoRet(ctx, x, y, 30, 22, C.madeira2); ret(ctx, x + 2, y + 2, 26, 18, C.ceu);
      circulo(ctx, x + 23, y + 6, 2, C.ouro);
      if (cena === 'cidade') {
        [[3, 6, 10, '#c8b8d8'], [9, 5, 13, '#9fb4d8'], [15, 6, 8, '#f4c0a0'], [21, 5, 11, '#c8d8b8']].forEach(function (b) {
          ret(ctx, x + b[0], y + 20 - b[2], b[1], b[2], K); ret(ctx, x + b[0] + 1, y + 21 - b[2], b[1] - 2, b[2] - 1, b[3]);
          for (var j = y + 23 - b[2]; j < y + 17; j += 3) ret(ctx, x + b[0] + 2, j, 1, 1, C.ouro3);
        });
        ret(ctx, x + 2, y + 17, 26, 3, '#5a5a6a'); ret(ctx, x + 5, y + 18, 3, 1, C.branco); ret(ctx, x + 14, y + 18, 3, 1, C.branco);
        ret(ctx, x + 20, y + 16, 5, 2, '#e0433f');
      } else if (cena === 'campo') {
        ret(ctx, x + 2, y + 12, 26, 8, '#b6d24e');
        for (var f = 0; f < 4; f++) ret(ctx, x + 3, y + 13 + f * 2, 14, 1, '#8fb83a');
        ret(ctx, x + 19, y + 9, 7, 6, K); ret(ctx, x + 20, y + 10, 5, 4, '#fff1dc'); triangulo(ctx, x + 18, y + 5, 9, 4, '#e07a4a');
        for (var c = 3; c < 28; c += 4) ret(ctx, x + c, y + 10, 1, 3, C.madeira2);
        ret(ctx, x + 2, y + 11, 26, 1, C.madeira2);
      } else {
        triangulo(ctx, x + 2, y + 5, 16, 12, '#8a9ab8'); triangulo(ctx, x + 7, y + 5, 6, 4, C.branco);
        triangulo(ctx, x + 13, y + 9, 14, 8, '#7a8aa8');
        ret(ctx, x + 2, y + 16, 26, 4, C.folha2);
        ret(ctx, x + 2, y + 17, 26, 2, '#5fb4ff'); ret(ctx, x + 6, y + 17, 4, 1, C.azul2);
        circulo(ctx, x + 22, y + 14, 3, C.folha3); ret(ctx, x + 22, y + 16, 1, 2, C.madeira3);
        circulo(ctx, x + 5, y + 14, 2, C.folha3);
      }
    } });

  /* ================= CAPÍTULO 12: TRANSFORMAÇÃO DAS PAISAGENS ================= */
  // o antes e depois (parede): o mesmo morro, antes só com árvores e depois com casinhas e a rua
  I.objeto('geografia-antes-depois', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      var y = py + 8;
      [px + 1, px + 18].forEach(function (x, i) {
        contornoRet(ctx, x, y, 13, 17, C.creme); ret(ctx, x + 1, y + 1, 11, 9, C.ceu);
        elipse(ctx, x + 6, y + 11, 6, 4, C.folha2); ret(ctx, x + 1, y + 12, 11, 4, C.folha);
        if (i === 0) { circulo(ctx, x + 4, y + 9, 2, C.folha3); circulo(ctx, x + 8, y + 8, 2, C.folha3); }
        else {
          ret(ctx, x + 2, y + 8, 4, 4, K); ret(ctx, x + 3, y + 9, 2, 2, '#fff1dc'); ret(ctx, x + 7, y + 7, 4, 5, K); ret(ctx, x + 8, y + 8, 2, 3, '#f4c0a0');
          ret(ctx, x + 1, y + 13, 11, 2, '#7a7a8a');
        }
      });
      ret(ctx, px + 14, y + 8, 3, 1, LARANJA); ret(ctx, px + 15, y + 7, 1, 3, LARANJA); ret(ctx, px + 16, y + 8, 1, 1, LARANJA);
    } });
  // a gruta: a pedra do mar com a abertura escura e as ondas batendo embaixo ("água mole em pedra dura…")
  I.objeto('geografia-gruta', { w: 2, h: 1, topo: 16, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 16, py - 1, 15, 15, K); elipse(ctx, px + 16, py - 1, 14, 14, '#a8a098');
      elipse(ctx, px + 12, py - 6, 6, 5, '#c8c0b4'); elipse(ctx, px + 21, py - 12, 5, 2, C.folha3);
      ret(ctx, px + 1, py + 7, 30, 8, K);
      elipse(ctx, px + 17, py + 4, 5, 6, K); elipse(ctx, px + 17, py + 5, 4, 5, '#4a3a4a');   // a abertura
      ret(ctx, px + 2, py + 9, 28, 5, '#5fb4ff'); ret(ctx, px + 2, py + 9, 28, 1, C.azul2);
      ret(ctx, px + 4, py + 11, 4, 1, C.branco); ret(ctx, px + 23, py + 11, 5, 1, C.branco);
    },
    anim: function (ctx, px, py, t) {
      var f = Math.floor(t / 400) % 4;
      ret(ctx, px + 6 + f * 5, py + 12, 3, 1, C.branco);
    } });
  // pilha de tijolos
  I.objeto('geografia-tijolos', { w: 1, h: 1, topo: 6, solido: true,
    desenhar: function (ctx, px, py) {
      [[1, 9], [8, 9], [4, 4], [6, -1]].forEach(function (p, i) {
        contornoRet(ctx, px + p[0], py + p[1], 7, 5, i % 2 ? '#c8603a' : '#e07a4a');
        ret(ctx, px + p[0] + 1, py + p[1] + 1, 5, 1, '#f4a07a');
      });
    } });
  // o cone laranja e branco da obra
  I.objeto('geografia-cone', { w: 1, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 2, py + 11, 12, 4, K); ret(ctx, px + 3, py + 12, 10, 2, '#ff8a3d');
      triangulo(ctx, px + 3, py - 9, 10, 21, K); triangulo(ctx, px + 4, py - 8, 8, 20, '#ff8a3d');
      ret(ctx, px + 6, py - 2, 4, 2, C.branco); ret(ctx, px + 5, py + 4, 6, 2, C.branco);
    } });
  // a muda de árvore num vaso com a estaquinha: plantar árvores também muda a paisagem
  I.objeto('geografia-muda', { w: 1, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      contornoRet(ctx, cx - 5, py + 6, 11, 9, '#b95a36'); ret(ctx, cx - 4, py + 7, 9, 1, '#e07a4a');
      ret(ctx, cx - 4, py + 6, 9, 2, '#6b4428');
      ret(ctx, cx, py - 4, 1, 10, K);
      ret(ctx, cx + 3, py - 6, 1, 12, C.madeira3);
      [[-4, -8], [1, -10], [-3, -2], [2, -5]].forEach(function (f) {
        elipse(ctx, cx + f[0] + 1, py + f[1] + 1, 3, 2, K); elipse(ctx, cx + f[0] + 1, py + f[1] + 1, 2, 1, C.folha);
      });
    } });

})();
