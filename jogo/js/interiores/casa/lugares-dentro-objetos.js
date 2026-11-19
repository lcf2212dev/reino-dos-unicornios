/* Minha Casa, por dentro dos lugares famosos (casa/lugares-dentro.js; pedido de 19/11), objetos temáticos parte 1:
   a janela com vista (função compartilhada) e os objetos da Torre Eiffel, das Pirâmides, do Big Ben, da Torre de
   Pisa, da Liberdade e do Cristo. Cria Reino._predios.casa.dentro { caixa, janela, nuvem, obj, BRONZE, VERDE, MARMORE }, que a
   parte 2 (lugares-dentro-objetos-2.js) usa. Pixel art com contorno #3a2446 e luz de cima e da esquerda; sem
   movimento. Nada de DOM no carregamento. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = R.Desenho, C = D.C, K = D.K;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, matriz = D.matriz, escurecer = D.escurecer, clarear = D.clarear;
  var CASA = (R._predios = R._predios || {}).casa = R._predios.casa || {};
  var BRONZE = '#b07848', VERDE = '#6fc4a8', MARMORE = '#f4f0ea', OURO = C.ouro;

  // caixa com contorno, a cor e a luz de cima e da esquerda
  function caixa(ctx, x, y, w, h, cor) {
    ret(ctx, x, y, w, h, K); ret(ctx, x + 1, y + 1, w - 2, h - 2, cor);
    ret(ctx, x + 1, y + 1, w - 2, 1, clarear(cor, 0.35)); ret(ctx, x + 1, y + 1, 1, h - 2, clarear(cor, 0.2));
  }
  function obj(nome, def) { I.objeto('casa-dentro-' + nome, def); }

  /* ---------- a janela com vista (2 × 2, na parede): paisagem(ctx, x, y, w, h) pinta o lado de fora ---------- */
  function janela(nome, paisagem, moldura) {
    obj('janela-' + nome, { w: 2, h: 2, parede: true, solido: false,
      desenhar: function (ctx, px, py) {
        var x = px + 2, y = py + 7, w = 28, h = 21, m = moldura || C.creme;
        ret(ctx, x, y, w, h, K); ret(ctx, x + 1, y + 1, w - 2, h - 2, m);
        ctx.save(); ctx.beginPath(); ctx.rect(x + 2, y + 2, w - 4, h - 4); ctx.clip();
        ret(ctx, x + 2, y + 2, w - 4, h - 4, C.ceu);
        paisagem(ctx, x + 2, y + 2, w - 4, h - 4);
        ctx.restore();
        ret(ctx, x + 13, y + 2, 2, h - 4, m); ret(ctx, x + 13, y + 2, 1, h - 4, clarear(m, 0.3));
        ret(ctx, x - 1, y + h - 1, w + 2, 3, K); ret(ctx, x, y + h - 1, w, 2, C.madeiraClara); ret(ctx, x, y + h - 1, w, 1, clarear(C.madeiraClara, 0.4));
      },
      luz: function (ctx, px, py) { I.OBJETOS.janela.luz(ctx, px, py, { w: 2 }); } });
  }
  function nuvem(ctx, x, y) { ret(ctx, x, y, 6, 2, C.branco); ret(ctx, x + 2, y - 1, 3, 1, C.branco); }

  /* ================= Torre Eiffel ================= */
  // Paris: os telhados azulados, o rio Sena e as nuvens
  janela('paris', function (ctx, x, y, w, h) {
    nuvem(ctx, x + 3, y + 4); nuvem(ctx, x + 16, y + 2);
    [[0, 9, '#9aa8d0'], [5, 7, '#b4b0d8'], [11, 10, '#a0a0c8'], [16, 6, '#b8b4dc'], [20, 8, '#9aa8d0']].forEach(function (c) {
      ret(ctx, x + c[0], y + c[1], 6, h - c[1], K); ret(ctx, x + c[0] + 1, y + c[1] + 1, 4, h - c[1], c[2]);
      ret(ctx, x + c[0] + 1, y + c[1] + 3, 4, h, '#f2e6d4'); ret(ctx, x + c[0] + 2, y + c[1] + 4, 1, 2, '#5a6a9a');
    });
    ret(ctx, x, y + h - 3, w, 3, '#5fb4ff'); ret(ctx, x + 2, y + h - 2, 5, 1, C.branco);
  }, '#d8c0a0');
  // a viga de ferro em treliça (1 × 2, na parede)
  obj('trelica', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 2, py + 4, 12, 28, K); ret(ctx, px + 3, py + 5, 10, 27, escurecer(BRONZE, 0.25));
      ret(ctx, px + 3, py + 5, 2, 27, BRONZE); ret(ctx, px + 11, py + 5, 2, 27, BRONZE); ret(ctx, px + 3, py + 5, 1, 27, clarear(BRONZE, 0.35));
      for (var k = 0; k < 4; k++) for (var i = 0; i < 6; i++) {
        ret(ctx, px + 5 + i, py + 6 + k * 6 + i, 1, 1, BRONZE); ret(ctx, px + 10 - i, py + 6 + k * 6 + i, 1, 1, BRONZE);
      }
      ret(ctx, px + 1, py + 3, 14, 3, K); ret(ctx, px + 2, py + 4, 12, 1, clarear(BRONZE, 0.35));
    } });
  // o elevador antigo de grade (2 × 1, sobe 22 px): a cabine com a porta sanfonada e as setas no letreiro
  obj('elevador', { w: 2, h: 1, topo: 22, solido: true,
    desenhar: function (ctx, px, py) {
      caixa(ctx, px + 1, py - 22, 30, 37, BRONZE);
      ret(ctx, px + 9, py - 20, 14, 5, K); ret(ctx, px + 10, py - 19, 12, 3, '#4a3358');
      matriz(ctx, px + 11, py - 19, ['.y.', 'yyy', '...'], { y: OURO }); matriz(ctx, px + 18, py - 19, ['yyy', '.y.', '...'], { y: OURO });
      ret(ctx, px + 4, py - 14, 24, 27, K); ret(ctx, px + 5, py - 13, 22, 25, '#7a5a72'); ret(ctx, px + 5, py - 13, 22, 3, '#a8869c');
      for (var i = 0; i < 8; i++) ret(ctx, px + 5 + i * 3, py - 13, 1, 25, clarear(BRONZE, 0.25));
      for (var j = 0; j < 4; j++) ret(ctx, px + 5, py - 9 + j * 6, 22, 1, escurecer(BRONZE, 0.1));
      ret(ctx, px + 28, py - 6, 2, 4, OURO); ret(ctx, px + 28, py - 6, 2, 1, C.ouro3);
      ret(ctx, px + 4, py + 11, 24, 3, K); ret(ctx, px + 5, py + 11, 22, 2, '#e0b070');
    } });
  // a mesinha redonda do café com o croissant e a xícara (1 × 1)
  obj('mesa-cafe', { w: 1, h: 1, topo: 8,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 7, py + 1, 2, 12, K); ret(ctx, px + 4, py + 12, 8, 3, K); ret(ctx, px + 5, py + 13, 6, 1, C.metal2);
      elipse(ctx, px + 8, py + 1, 7, 3, K); elipse(ctx, px + 8, py + 1, 6, 2, MARMORE); ret(ctx, px + 4, py - 1, 6, 1, C.branco);
      matriz(ctx, px + 1, py - 6, ['..kkkkk..', '.koyoyok.', 'koyoyoyok', 'kk.....kk'], { k: K, o: '#e09a40', y: '#ffd080' });
      D.miudeza(ctx, 'xicara', px + 12, py + 1);
    } });

  /* ================= Pirâmides ================= */
  // a parede de hieróglifos (2 × 2): olho, ave, sol, cruz da vida, água e gato
  var GLIFOS = {
    olho: ['.kkk...', 'kwakk..', 'kkkkkkk', '..k.k..', '.k...k.'],
    ave: ['.kk....', 'kvk....', '..kkkk.', '..kvvvk', '...kkk.', '...k.k.'],
    sol: ['..vvv..', '.vyyyv.', '.vyyyv.', '..vvv..', 'k.....k', '.kkkkk.'],
    ankh: ['..aaa..', '.a...a.', '..aaa..', 'aaaaaaa', '...a...', '...a...'],
    agua: ['.a..a..', 'a.aa.aa', '.......', '.a..a..', 'a.aa.aa'],
    gato: ['k...k..', 'kk.kk..', 'kyky...', '.kkkk..', '.kkkkk.', '.kk.kkk'],
  };
  obj('hieroglifos', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      caixa(ctx, px + 1, py + 5, 30, 25, '#ecd29a');
      var pal = { k: '#5a3a2a', w: C.branco, a: '#3a6ab0', v: '#c0502a', y: OURO };
      ['olho', 'ave', 'sol', 'ankh', 'agua', 'gato'].forEach(function (g, i) {
        matriz(ctx, px + 3 + (i % 3) * 9, py + 8 + Math.floor(i / 3) * 10, GLIFOS[g], pal);
      });
      ret(ctx, px + 2, py + 17, 28, 1, '#c9a868');
    } });
  // o sarcófago dourado em pé (1 × 1, sobe 22 px): o rosto, o lenço listrado, o colar e os braços cruzados
  obj('sarcofago', { w: 1, h: 1, topo: 22, solido: true,
    desenhar: function (ctx, px, py) {
      var ouro = '#ffcf4d', azul = '#3a6ab0';
      ret(ctx, px + 4, py - 22, 8, 2, K); ret(ctx, px + 3, py - 20, 10, 2, K); ret(ctx, px + 2, py - 18, 12, 31, K);
      ret(ctx, px + 4, py - 21, 8, 1, azul); ret(ctx, px + 3, py - 19, 10, 2, azul); ret(ctx, px + 3, py - 17, 10, 29, ouro);
      for (var j = 0; j < 4; j++) { ret(ctx, px + 3, py - 17 + j * 2, 2, 1, azul); ret(ctx, px + 11, py - 17 + j * 2, 2, 1, azul); }
      ret(ctx, px + 5, py - 17, 6, 7, '#f0b060'); ret(ctx, px + 6, py - 15, 1, 1, K); ret(ctx, px + 9, py - 15, 1, 1, K);
      ret(ctx, px + 7, py - 12, 2, 1, '#c07830');
      ret(ctx, px + 3, py - 9, 10, 1, '#c0502a'); ret(ctx, px + 3, py - 8, 10, 1, azul); ret(ctx, px + 3, py - 7, 10, 1, '#c0502a');
      for (var i = 0; i < 5; i++) { ret(ctx, px + 4 + i, py - 5 + i, 1, 1, K); ret(ctx, px + 11 - i, py - 5 + i, 1, 1, K); }
      for (var b = 0; b < 3; b++) ret(ctx, px + 4, py + 2 + b * 3, 8, 1, azul);
      ret(ctx, px + 3, py - 17, 1, 29, clarear(ouro, 0.35));
      ret(ctx, px + 1, py + 12, 14, 3, K); ret(ctx, px + 2, py + 12, 12, 2, '#c9a868');
    } });
  // a estátua do gatinho preto do Egito (1 × 1, sobe 12 px), com o brinco de ouro
  obj('gato-egito', { w: 1, h: 1, topo: 6,
    desenhar: function (ctx, px, py) {
      py += 8;   // o gato sentado em cima da base de areia
      matriz(ctx, px + 3, py - 12, [
        '.k...k....', 'kbk.kbk...', 'kbbkbbk...', 'kybbbyk...', 'kbbbbbk...', '.kbbbk....', '.kbbbk....', 'kbbbbbk...',
        'kbbbbbbk..', 'kbbbbbbk..', 'kbbbbbbbk.', 'kbbbbbbbkk', 'kbbbbbbbbk', 'kbbbbbbbbk', '.kkkkkkkk.'],
        { k: K, b: '#2e2a40', y: OURO });
      ret(ctx, px + 4, py - 9, 1, 3, '#4a4466'); ret(ctx, px + 4, py - 4, 1, 8, '#4a4466');
      ret(ctx, px + 4, py - 6, 5, 1, OURO); ret(ctx, px + 8, py - 5, 1, 2, OURO);
      ret(ctx, px + 1, py + 3, 14, 4, K); ret(ctx, px + 2, py + 4, 12, 2, '#ecd29a'); ret(ctx, px + 2, py + 4, 12, 1, '#fff0c8');
    } });

  /* ================= Big Ben ================= */
  // o sino grande, o próprio Big Ben (2 × 1, sobe 24 px), na armação de madeira
  var SINO = [8, 10, 12, 12, 12, 14, 14, 14, 16, 16, 18, 20, 22, 24, 26, 26];
  obj('sino-grande', { w: 2, h: 1, topo: 24, solido: true,
    desenhar: function (ctx, px, py) {
      [px + 1, px + 28].forEach(function (x) { caixa(ctx, x, py - 22, 4, 37, C.madeira); });
      caixa(ctx, px, py - 26, 32, 5, C.madeira);
      ret(ctx, px + 15, py - 21, 2, 3, K);
      SINO.forEach(function (w, j) {
        var x = px + 16 - w / 2, y = py - 18 + j;
        ret(ctx, x - 1, y, w + 2, 1, K); ret(ctx, x, y, w, 1, j > 13 ? escurecer(BRONZE, 0.15) : BRONZE);
        ret(ctx, x, y, 2, 1, clarear(BRONZE, 0.35)); ret(ctx, x + w - 2, y, 2, 1, escurecer(BRONZE, 0.25));
      });
      ret(ctx, px + 7, py - 19, 18, 1, K); ret(ctx, px + 2, py - 2, 28, 1, K);
      ret(ctx, px + 9, py - 8, 14, 1, clarear(BRONZE, 0.2));
      ret(ctx, px + 14, py - 2, 4, 3, K); ret(ctx, px + 15, py - 2, 2, 2, C.metal2);
      ret(ctx, px + 2, py + 12, 28, 3, K); ret(ctx, px + 3, py + 12, 26, 2, C.madeiraClara);
    } });
  // a cabine vermelha de telefone de Londres (1 × 1, sobe 22 px)
  obj('cabine', { w: 1, h: 1, topo: 22, solido: true,
    desenhar: function (ctx, px, py) {
      var v = '#e0403a';
      ret(ctx, px + 4, py - 23, 8, 2, K); ret(ctx, px + 5, py - 22, 6, 1, v);
      caixa(ctx, px + 2, py - 21, 12, 36, v);
      ret(ctx, px + 4, py - 18, 8, 3, K); ret(ctx, px + 5, py - 17, 1, 1, C.branco); ret(ctx, px + 7, py - 17, 1, 1, C.branco); ret(ctx, px + 9, py - 17, 2, 1, C.branco);
      ret(ctx, px + 4, py - 13, 8, 18, K);
      for (var r = 0; r < 4; r++) for (var c = 0; c < 2; c++) ret(ctx, px + 5 + c * 4, py - 12 + r * 4, 3, 3, r ? C.vidro : C.ouro3);
      ret(ctx, px + 12, py - 2, 1, 3, OURO);
      ret(ctx, px + 1, py + 12, 14, 3, K); ret(ctx, px + 2, py + 12, 12, 2, escurecer(v, 0.3));
    } });
  // o guardinha de brinquedo de Londres (1 × 1, sobe 16 px): chapéu alto preto, casaco vermelho
  obj('guarda', { w: 1, h: 1, topo: 6,
    desenhar: function (ctx, px, py) {
      py += 10;   // o guardinha em pé em cima da base de madeira
      ret(ctx, px + 2, py + 1, 12, 4, K); ret(ctx, px + 3, py + 2, 10, 2, C.madeira); ret(ctx, px + 3, py + 2, 10, 1, C.madeiraClara);
      matriz(ctx, px + 3, py - 16, [
        '...kkk...', '..kpppk..', '..kpppk..', '..kpppk..', '..kpppk..', '..kpppk..', '..kssk...', '..ksssk..',
        '.krrrrrk.', 'krrryrrrk', 'ksrryrrsk', 'kkrryrrkk', '..kbbbk..', '..kbkbk..', '..kbkbk..', '..kbkbk..',
        '.kkk.kkk.'], { k: K, p: '#2e2a40', s: '#f5c9a6', r: '#e0403a', y: OURO, b: '#3a3a5a' });
      ret(ctx, px + 6, py - 14, 1, 3, '#4a4466');
    } });

  /* ================= Torre de Pisa ================= */
  // a praça lá fora: a grama e a catedral branca de cúpula
  janela('pisa', function (ctx, x, y, w, h) {
    nuvem(ctx, x + 2, y + 3); nuvem(ctx, x + 17, y + 5);
    ret(ctx, x, y + h - 5, w, 5, '#7fc85a'); ret(ctx, x, y + h - 5, w, 1, '#a8e078');
    ret(ctx, x + 6, y + 8, 14, 7, K); ret(ctx, x + 7, y + 9, 12, 6, MARMORE);
    for (var i = 0; i < 4; i++) ret(ctx, x + 8 + i * 3, y + 11, 1, 3, '#b8b0c8');
    elipse(ctx, x + 13, y + 7, 4, 3, K); elipse(ctx, x + 13, y + 7, 3, 2, MARMORE);
  }, '#e6e1ee');
  // a escada em caracol (2 × 1, sobe 24 px): os degraus de mármore girando em volta da coluna
  obj('caracol', { w: 2, h: 1, topo: 24, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      // o vão da escada (escuro, para os degraus brancos aparecerem) com o arco em cima
      ret(ctx, px + 4, py - 24, 24, 39, K); ret(ctx, px + 2, py - 20, 28, 35, K);
      ret(ctx, px + 5, py - 23, 22, 37, '#6a5a7e'); ret(ctx, px + 3, py - 19, 26, 33, '#6a5a7e'); ret(ctx, px + 5, py - 23, 22, 2, '#857496');
      caixa(ctx, px + 14, py - 24, 4, 39, MARMORE);
      // os degraus girando em volta da coluna: o de trás mais curto, o da frente mais comprido
      for (var k = 0; k < 8; k++) {
        var y = py + 9 - k * 4 - (k >> 1), dir = k % 2, w = 9 + (k % 4 < 2 ? 3 : 0), x = dir ? px + 17 : px + 15 - w;
        ret(ctx, x, y, w, 5, K); ret(ctx, x + 1, y + 1, w - 2, 2, C.branco); ret(ctx, x + 1, y + 3, w - 2, 1, '#b8ae9e');
        ret(ctx, dir ? x + w - 2 : x + 1, y - 5, 1, 5, '#8a5a3a');
      }
      ret(ctx, px + 2, py + 12, 28, 3, K); ret(ctx, px + 3, py + 12, 26, 2, '#cfc6b8');
    } });
  // a coluna de mármore branco (1 × 1, sobe 22 px)
  obj('coluna', { w: 1, h: 1, topo: 22, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      caixa(ctx, px + 2, py - 22, 12, 5, MARMORE); ret(ctx, px + 3, py - 18, 2, 1, '#cfc6b8'); ret(ctx, px + 11, py - 18, 2, 1, '#cfc6b8');
      caixa(ctx, px + 4, py - 18, 8, 30, MARMORE);
      ret(ctx, px + 7, py - 16, 1, 27, '#d8d0c4'); ret(ctx, px + 9, py - 16, 1, 27, '#d8d0c4');
      caixa(ctx, px + 2, py + 10, 12, 5, MARMORE);
    } });

  /* ================= Liberdade ================= */
  // a tocha original, no pedestal do museu (1 × 1, sobe 22 px): a chama dourada e o cabo de cobre verde
  obj('tocha', { w: 1, h: 1, topo: 22, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      caixa(ctx, px + 2, py + 3, 12, 12, '#e8e4f2');
      ret(ctx, px + 6, py - 8, 4, 12, K); ret(ctx, px + 7, py - 7, 2, 11, VERDE);
      ret(ctx, px + 3, py - 12, 10, 5, K); ret(ctx, px + 4, py - 11, 8, 3, VERDE); ret(ctx, px + 4, py - 11, 8, 1, clarear(VERDE, 0.35));
      matriz(ctx, px + 4, py - 23, ['...kk...', '..kyyk..', '..kyyk..', '.kyyyyk.', '.kyowyk.', 'kyyowyyk', 'kyoowoyk', 'kyoooyyk', '.kyyyyk.', '..kkkk..'],
        { k: K, y: OURO, o: '#ffb03a', w: C.ouro3 });
      ret(ctx, px + 4, py + 8, 8, 1, '#b8b0cc');
    } });
  // a coroa de sete pontas, verde de cobre (2 × 1, sobe 12 px), num suporte baixo
  obj('coroa', { w: 2, h: 1, topo: 12,
    desenhar: function (ctx, px, py) {
      caixa(ctx, px + 2, py + 6, 28, 9, '#e8e4f2');
      // os 7 raios em leque, de 160° a 20°: primeiro o contorno, depois o miolo
      [2, 1].forEach(function (passo) {
        for (var r = 0; r < 7; r++) {
          var a = (160 - r * 20) * Math.PI / 180, n = r === 3 ? 12 : r % 6 === 0 ? 8 : 10;
          for (var t = 2; t <= n; t++) {
            var x = Math.round(px + 16 + Math.cos(a) * t), y = Math.round(py - 2 - Math.sin(a) * t);
            if (passo === 2) ret(ctx, x - 1, y - 1, 3, 3, K); else ret(ctx, x, y, 1, 1, t > n - 2 ? C.branco : clarear(VERDE, 0.2));
          }
        }
      });
      caixa(ctx, px + 4, py - 3, 24, 9, VERDE);
      for (var i = 0; i < 6; i++) ret(ctx, px + 7 + i * 3, py, 2, 2, '#3a7a6a');
    } });
  // a tábua da estátua (1 × 1, sobe 10 px), com a data em números romanos (riscos)
  obj('tabua', { w: 1, h: 1, topo: 10,
    desenhar: function (ctx, px, py) {
      caixa(ctx, px + 3, py - 10, 10, 18, VERDE);
      for (var j = 0; j < 4; j++) ret(ctx, px + 5, py - 6 + j * 3, j % 2 ? 4 : 6, 1, '#3a7a6a');
      caixa(ctx, px + 1, py + 8, 14, 7, '#e8e4f2');
    } });

  /* ================= Cristo ================= */
  // o Rio lá embaixo: o mar azul, o Pão de Açúcar e o sol
  janela('rio', function (ctx, x, y, w, h) {
    circulo(ctx, x + 20, y + 4, 2, OURO); nuvem(ctx, x + 3, y + 3);
    ret(ctx, x, y + h - 6, w, 6, '#5fb4ff'); ret(ctx, x + 3, y + h - 4, 4, 1, C.branco); ret(ctx, x + 15, y + h - 2, 5, 1, C.branco);
    elipse(ctx, x + 5, y + h - 6, 4, 7, K); elipse(ctx, x + 5, y + h - 6, 3, 6, '#6fae6a'); ret(ctx, x + 3, y + h - 11, 1, 3, '#9ad86a');
    elipse(ctx, x + 19, y + h - 6, 4, 3, K); elipse(ctx, x + 19, y + h - 6, 3, 2, '#6fae6a');
    for (var i = 0; i < 12; i++) ret(ctx, x + 7 + i, y + h - 12 + Math.floor(i / 3), 1, 1, '#4a3358');
  }, '#f4f0ea');
  // o altarzinho da capela (2 × 1, sobe 8 px): a toalha branca, as velas e o vaso de flores
  obj('altar', { w: 2, h: 1, topo: 8,
    desenhar: function (ctx, px, py) {
      caixa(ctx, px + 2, py, 28, 15, C.madeira);
      ret(ctx, px + 3, py + 1, 26, 6, C.branco); ret(ctx, px + 3, py + 6, 26, 1, OURO);
      for (var i = 0; i < 5; i++) ret(ctx, px + 5 + i * 5, py + 7, 2, 2, C.branco);
      D.miudeza(ctx, 'vela', px + 7, py + 1); D.miudeza(ctx, 'vela', px + 25, py + 1); D.miudeza(ctx, 'vaso', px + 16, py + 1);
    } });

  CASA.dentro = { caixa: caixa, janela: janela, nuvem: nuvem, obj: obj, BRONZE: BRONZE, VERDE: VERDE, MARMORE: MARMORE };
})();
