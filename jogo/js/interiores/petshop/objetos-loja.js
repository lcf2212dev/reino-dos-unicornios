/* Pet Shop, parte 1 de 5: as cores da Pet Shop, as miudezas desenhadas (comidinhas, patinhas, bolhas)
   e os objetos da Loja (estante, balcão da Dona Aveia, aquário, casinha...).
   O que as outras partes usam fica em Reino._predios.petshop (ver o fim do arquivo). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var K = '#3a2446';
  var F = (R.FALAS_INTERIORES && R.FALAS_INTERIORES.petshop) || { npcs: {}, objetos: {}, extras: [] };
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};
  // o que as partes do prédio compartilham (criado aqui; cada parte põe o seu no fim do arquivo)
  var S = (R._predios = R._predios || {}).petshop = {};
  // cores da Pet Shop: menta, rosa, madeira quentinha e a laranja da Dona Aveia
  var MENTA = '#8fe0d0', MENTA2 = '#4fbfae', MENTA3 = '#d4f7ef';
  var ROSA = '#ff9cc6', ROSA2 = '#ff7eb6', ROSA3 = '#ffd0e4';
  var MAD = '#c98a4b', MAD2 = '#a0745a', MADC = '#e8b27a', FUNDO_MAD = '#f6dcb4';
  var LAR = '#ff8a3d', VERDE = '#6fc25a', VERDE2 = '#3f9a45', VERM = '#ff4f5e', VERM2 = '#d9304a';
  var PALHA = '#f5d77a', PALHA2 = '#d9ab45', PALHA3 = '#fff0a8';
  var AGUA = '#5fc8e8', AGUA2 = '#a8ecff', AGUA3 = '#2f9ec4', BISC = '#d99a52', BISC2 = '#8a5a2e';

  function v(o, k, padrao) { return (o && o.var && o.var[k] !== undefined) ? o.var[k] : padrao; }
  function brilho(ctx, x, y, c) { ret(ctx, x, y - 1, 1, 3, c); ret(ctx, x - 1, y, 3, 1, c); }

  /* ---------- miudezas (comidinhas desenhadas pequenas) ---------- */
  // cenoura em pé com as folhas (base em yb)
  function cenoura(ctx, x, yb) {
    ret(ctx, x - 1, yb - 7, 5, 5, K); ret(ctx, x, yb - 2, 3, 2, K); ret(ctx, x + 1, yb, 1, 1, K);
    ret(ctx, x, yb - 6, 3, 4, LAR); ret(ctx, x + 1, yb - 2, 1, 2, LAR); ret(ctx, x, yb - 6, 1, 2, '#ffb070');
    ret(ctx, x, yb - 9, 1, 2, VERDE); ret(ctx, x + 1, yb - 10, 1, 3, VERDE2); ret(ctx, x + 2, yb - 9, 1, 2, VERDE);
  }
  // maçã redondinha com cabo e folha (centro cx, cy)
  function maca(ctx, cx, cy, cor) {
    circulo(ctx, cx, cy, 3, K); circulo(ctx, cx, cy, 2, cor || VERM);
    ret(ctx, cx - 1, cy - 1, 1, 1, '#ffc0c8'); ret(ctx, cx + 1, cy + 1, 1, 1, VERM2);
    ret(ctx, cx, cy - 4, 1, 2, BISC2); ret(ctx, cx + 1, cy - 4, 2, 1, VERDE);
  }
  // biscoito de aveia (centro cx, cy)
  function biscoito(ctx, cx, cy) {
    circulo(ctx, cx, cy, 2, K); ret(ctx, cx - 1, cy - 1, 3, 3, BISC); ret(ctx, cx, cy, 1, 1, BISC2); ret(ctx, cx - 1, cy - 1, 1, 1, '#f3c890');
  }
  // pote de vidro (x à esquerda, base em yb, largura w) com tampa colorida
  function pote(ctx, x, yb, w, tampa, recheio) {
    ret(ctx, x, yb - 11, w, 11, K); ret(ctx, x + 1, yb - 10, w - 2, 9, '#eaf8ff');
    if (recheio) recheio(x + 1, yb - 1, w - 2);
    ret(ctx, x + 1, yb - 10, 1, 4, C.branco);
    ret(ctx, x - 1, yb - 13, w + 2, 3, K); ret(ctx, x, yb - 12, w, 1, tampa);
  }
  // fardinho de feno amarrado (x, base yb, largura w)
  function fardo(ctx, x, yb, w, h) {
    ret(ctx, x, yb - h, w, h, K); ret(ctx, x + 1, yb - h + 1, w - 2, h - 2, PALHA);
    for (var y = yb - h + 3; y < yb - 1; y += 3) ret(ctx, x + 1, y, w - 2, 1, PALHA2);
    ret(ctx, x + 1, yb - h + 1, w - 2, 1, PALHA3);
    ret(ctx, x + 3, yb - h + 1, 1, h - 2, '#b8452e'); ret(ctx, x + w - 4, yb - h + 1, 1, h - 2, '#b8452e');
  }
  // patinha (almofada + 4 dedinhos), centro da almofada em cx, cy
  function patinha(ctx, cx, cy, cor) {
    ret(ctx, cx - 2, cy, 5, 2, cor); ret(ctx, cx - 1, cy + 2, 3, 1, cor);
    ret(ctx, cx - 3, cy - 2, 1, 1, cor); ret(ctx, cx - 1, cy - 3, 1, 1, cor); ret(ctx, cx + 1, cy - 3, 1, 1, cor); ret(ctx, cx + 3, cy - 2, 1, 1, cor);
  }
  function coracao(ctx, x, y, cor) {
    ret(ctx, x, y, 2, 1, cor); ret(ctx, x + 3, y, 2, 1, cor); ret(ctx, x, y + 1, 5, 1, cor); ret(ctx, x + 1, y + 2, 3, 1, cor); ret(ctx, x + 2, y + 3, 1, 1, cor);
  }
  // bolhinha de espuma (redonda, com brilho)
  function bolha(ctx, cx, cy, r) {
    circulo(ctx, cx, cy, r, K); circulo(ctx, cx, cy, r - 1, C.branco);
    if (r > 2) ret(ctx, cx + 1, cy + 1, r - 2, 1, '#e3eefc');
  }
  // cesta de palha trançada (x, y do topo da borda), 14 × 10
  function cesta(ctx, px, py, cor) {
    ret(ctx, px + 1, py + 5, 14, 10, K); ret(ctx, px + 2, py + 6, 12, 8, cor || '#e0a860');
    for (var j = 0; j < 3; j++) for (var i = 0; i < 6; i++) ret(ctx, px + 2 + i * 2 + (j % 2), py + 8 + j * 2, 1, 1, '#b8803e');
    ret(ctx, px, py + 5, 16, 2, K); ret(ctx, px + 1, py + 5, 14, 1, '#f3c890');
  }

  /* ================= OBJETOS DA LOJA ================= */
  // estante das comidinhas: cenouras e maçãs em cima, potes de biscoito no meio, fardos embaixo
  I.objeto('petshop-estante-comida', { w: 2, h: 1, topo: 26, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var inverte = v(o, 'inverte', false);
      ret(ctx, px, py - 26, 32, 3, K); ret(ctx, px + 1, py - 25, 30, 1, MENTA2);
      ret(ctx, px + 1, py - 24, 30, 39, K); ret(ctx, px + 2, py - 23, 28, 37, MAD); ret(ctx, px + 3, py - 22, 26, 35, FUNDO_MAD);
      [py - 13, py - 2, py + 9].forEach(function (y) { ret(ctx, px + 2, y, 28, 3, K); ret(ctx, px + 2, y, 28, 1, MADC); ret(ctx, px + 2, y + 1, 28, 1, MAD); });
      // em cima: molho de cenouras e maçãs
      var xa = inverte ? px + 17 : px + 4, xb = inverte ? px + 4 : px + 17;
      cenoura(ctx, xa, py - 13); cenoura(ctx, xa + 4, py - 13); cenoura(ctx, xa + 8, py - 13);
      maca(ctx, xb + 3, py - 17); maca(ctx, xb + 8, py - 17, '#ff6b7a'); maca(ctx, xb + 5, py - 20, '#9fdc5a');
      // meio: potes de biscoito de aveia
      [px + 3, px + 12, px + 21].forEach(function (x, i) {
        pote(ctx, x, py - 2, 8, [ROSA2, MENTA2, '#ffd34d'][i], function (x0, yb, w) {
          biscoito(ctx, x0 + 3, yb - 3); biscoito(ctx, x0 + 3, yb - 6);
        });
      });
      // embaixo: fardinhos de feno dourado
      fardo(ctx, px + 3, py + 9, 12, 9); fardo(ctx, px + 17, py + 9, 12, 9);
      // pezinhos
      ret(ctx, px + 2, py + 14, 3, 1, K); ret(ctx, px + 27, py + 14, 3, 1, K);
    } });
  // sacos de feno dourado (um grande e um pequeno)
  I.objeto('petshop-sacos-feno', { w: 1, h: 1, topo: 9, solido: true,
    desenhar: function (ctx, px, py) {
      function saco(x, y, w, h) {
        ret(ctx, x, y, w, h, K); ret(ctx, x + 1, y + 1, w - 2, h - 2, '#dcc49c'); ret(ctx, x + 1, y + 1, 2, h - 2, '#efdcc0');
        ret(ctx, x + 2, y - 2, w - 4, 3, K); ret(ctx, x + 3, y - 1, w - 6, 1, '#b89a70');
        // feno saindo pela boca do saco
        ret(ctx, x + 3, y - 5, 1, 3, PALHA2); ret(ctx, x + 5, y - 6, 1, 4, PALHA); ret(ctx, x + w - 4, y - 5, 1, 3, PALHA);
        // espiguinha estampada
        var cx = x + Math.floor(w / 2);
        ret(ctx, cx, y + 4, 1, h - 6, PALHA2); ret(ctx, cx - 1, y + 4, 1, 1, PALHA2); ret(ctx, cx + 1, y + 5, 1, 1, PALHA2); ret(ctx, cx - 1, y + 6, 1, 1, PALHA2); ret(ctx, cx + 1, y + 7, 1, 1, PALHA2);
      }
      saco(px + 1, py - 3, 10, 18);
      saco(px + 8, py + 4, 8, 11);
    } });
  // cesta de cenouras crocantes
  I.objeto('petshop-cesta-cenouras', { w: 1, h: 1, topo: 6, solido: true,
    desenhar: function (ctx, px, py) {
      [[3, 7], [6, 6], [9, 7], [5, 9], [8, 9]].forEach(function (c) { cenoura(ctx, px + c[0], py + c[1]); });
      cesta(ctx, px, py);
    } });
  // cesta de maçãs do Reino
  I.objeto('petshop-cesta-macas', { w: 1, h: 1, topo: 5, solido: true,
    desenhar: function (ctx, px, py) {
      maca(ctx, px + 5, py + 3); maca(ctx, px + 10, py + 3, '#ff6b7a'); maca(ctx, px + 8, py, '#9fdc5a');
      cesta(ctx, px, py, '#d99a52');
    } });
  // caixote com potes de biscoito de aveia
  I.objeto('petshop-potes-biscoito', { w: 1, h: 1, topo: 8, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 6, 14, 9, K); ret(ctx, px + 2, py + 7, 12, 7, MAD); ret(ctx, px + 2, py + 10, 12, 1, MAD2);
      pote(ctx, px + 1, py + 7, 7, ROSA2, function (x0, yb) { biscoito(ctx, x0 + 2, yb - 2); biscoito(ctx, x0 + 3, yb - 6); });
      pote(ctx, px + 8, py + 7, 7, MENTA2, function (x0, yb) { biscoito(ctx, x0 + 2, yb - 3); ret(ctx, x0 + 1, yb - 8, 3, 2, BISC); });
    } });
  // balança de pesar feno, com mostrador
  I.objeto('petshop-balanca', { w: 1, h: 1, topo: 13, solido: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, px + 1, py + 8, 14, 6, K); ret(ctx, px + 2, py + 9, 12, 4, C.metal); ret(ctx, px + 2, py + 9, 12, 1, '#e3e9f3');
      fardo(ctx, px + 4, py + 9, 8, 6);
      ret(ctx, cx - 1, py - 3, 3, 6, K); ret(ctx, cx, py - 3, 1, 5, C.metal2);
      circulo(ctx, cx, py - 7, 5, K); circulo(ctx, cx, py - 7, 4, C.branco);
      ret(ctx, cx - 3, py - 8, 1, 1, K); ret(ctx, cx + 3, py - 8, 1, 1, K); ret(ctx, cx, py - 11, 1, 1, K);
      ret(ctx, cx, py - 10, 1, 3, VERM); ret(ctx, cx + 1, py - 9, 1, 1, VERM); ret(ctx, cx, py - 7, 1, 1, K);
      ret(ctx, cx - 5, py - 12, 11, 1, ROSA2);
    } });
  // balcão da Dona Aveia: pote de biscoito, campainha e caixa registradora
  I.objeto('petshop-balcao', { w: 3, h: 1, topo: 17, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var W = 48;
      ret(ctx, px + 1, py - 2, W - 2, 17, K); ret(ctx, px + 2, py - 1, W - 4, 15, MENTA);
      for (var x = px + 9; x < px + W - 4; x += 10) ret(ctx, x, py, 1, 13, MENTA2);
      ret(ctx, px + 2, py + 12, W - 4, 2, MENTA2);
      patinha(ctx, px + 5, py + 6, C.branco); patinha(ctx, px + 24, py + 6, ROSA3); patinha(ctx, px + 43, py + 6, C.branco);
      ret(ctx, px, py - 5, W, 4, K); ret(ctx, px + 1, py - 4, W - 2, 2, MADC); ret(ctx, px + 1, py - 3, W - 2, 1, MAD);
      // pote de biscoito
      pote(ctx, px + 3, py - 4, 9, ROSA2, function (x0, yb) { biscoito(ctx, x0 + 2, yb - 2); biscoito(ctx, x0 + 5, yb - 3); biscoito(ctx, x0 + 3, yb - 6); });
      // campainha
      elipse(ctx, px + 18, py - 7, 4, 3, K); elipse(ctx, px + 18, py - 7, 3, 2, C.ouro); ret(ctx, px + 18, py - 11, 1, 2, K); ret(ctx, px + 17, py - 8, 1, 1, C.ouro3);
      // caixa registradora rosa com a patinha
      ret(ctx, px + 30, py - 16, 15, 12, K); ret(ctx, px + 31, py - 15, 13, 10, ROSA);
      ret(ctx, px + 32, py - 14, 11, 3, '#e6f7ff'); ret(ctx, px + 33, py - 13, 4, 1, MENTA2);
      for (var i = 0; i < 3; i++) ret(ctx, px + 33 + i * 4, py - 9, 2, 2, C.creme);
      ret(ctx, px + 38, py - 19, 6, 4, K); ret(ctx, px + 39, py - 18, 4, 2, C.ouro);
    } });
  // vitrine do bolo arco-íris (e cupcakes)
  I.objeto('petshop-vitrine-bolo', { w: 2, h: 1, topo: 21, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 16;
      ret(ctx, px + 1, py - 1, 30, 16, K); ret(ctx, px + 2, py, 28, 14, ROSA); ret(ctx, px + 2, py, 28, 2, ROSA3);
      for (var x = px + 5; x < px + 29; x += 6) coracao(ctx, x, py + 6, C.branco);
      // caixa de vidro
      ret(ctx, px + 2, py - 20, 28, 20, K); ret(ctx, px + 3, py - 19, 26, 18, '#eef9ff');
      ret(ctx, px + 1, py - 21, 30, 2, K); ret(ctx, px + 2, py - 21, 28, 1, MENTA2);
      // bolo arco-íris no pratinho
      ret(ctx, cx - 7, py - 3, 15, 2, K); ret(ctx, cx - 6, py - 3, 13, 1, C.branco); ret(ctx, cx - 1, py - 1, 3, 1, K);
      var cores = ['#b58cff', '#5fb4ff', '#6fdc8c', '#ffd34d', '#ff7eb6'];
      ret(ctx, cx - 6, py - 14, 13, 11, K);
      cores.forEach(function (c, i) { ret(ctx, cx - 5, py - 5 - i * 2, 11, 2, c); });
      ret(ctx, cx - 5, py - 14, 11, 2, C.branco); ret(ctx, cx - 5, py - 12, 2, 2, C.branco); ret(ctx, cx + 1, py - 12, 2, 1, C.branco); ret(ctx, cx + 4, py - 12, 1, 2, C.branco);
      circulo(ctx, cx, py - 16, 2, K); ret(ctx, cx - 1, py - 17, 2, 2, VERM); ret(ctx, cx, py - 19, 1, 2, VERDE2);
      // cupcakes dos lados
      [px + 6, px + 25].forEach(function (x, i) {
        ret(ctx, x - 3, py - 7, 7, 5, K); ret(ctx, x - 2, py - 6, 5, 3, i ? MENTA : '#ffd34d');
        elipse(ctx, x, py - 8, 3, 2, K); elipse(ctx, x, py - 8, 2, 1, i ? ROSA3 : C.branco); ret(ctx, x, py - 10, 1, 1, VERM);
      });
      // reflexo do vidro
      ret(ctx, px + 4, py - 18, 1, 6, C.branco); ret(ctx, px + 5, py - 18, 1, 3, C.branco); ret(ctx, px + 27, py - 9, 1, 5, C.branco);
    } });
  // aquário com peixinhos (nadam com Animações)
  I.objeto('petshop-aquario', { w: 2, h: 1, topo: 19, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      // móvel
      ret(ctx, px + 2, py + 2, 28, 13, K); ret(ctx, px + 3, py + 3, 26, 11, MAD); ret(ctx, px + 15, py + 3, 1, 11, MAD2);
      ret(ctx, px + 12, py + 7, 2, 2, K); ret(ctx, px + 18, py + 7, 2, 2, K);
      // tanque
      ret(ctx, px + 1, py - 17, 30, 20, K);
      ret(ctx, px + 2, py - 16, 28, 2, '#e3f7ff'); ret(ctx, px + 2, py - 14, 28, 16, AGUA); ret(ctx, px + 2, py - 14, 28, 1, AGUA2);
      ret(ctx, px + 2, py - 7, 28, 9, '#48b6dc');
      // areia, pedrinhas e castelinho
      ret(ctx, px + 2, py - 1, 28, 3, '#f3d9a0'); ret(ctx, px + 6, py - 1, 2, 1, ROSA); ret(ctx, px + 12, py, 2, 1, '#b58cff'); ret(ctx, px + 23, py - 1, 2, 1, C.branco);
      ret(ctx, px + 17, py - 7, 7, 7, K); ret(ctx, px + 18, py - 6, 5, 6, '#e6c8f5'); ret(ctx, px + 17, py - 9, 2, 2, K); ret(ctx, px + 22, py - 9, 2, 2, K); ret(ctx, px + 20, py - 3, 1, 3, K);
      // plantinhas
      [[4, 11], [8, 8], [27, 10]].forEach(function (p) {
        for (var j = 0; j < p[1]; j++) ret(ctx, px + p[0] + (j % 4 < 2 ? 0 : 1), py - 1 - j, 1, 1, j % 2 ? VERDE2 : VERDE);
      });
      // tampa
      ret(ctx, px, py - 19, 32, 3, K); ret(ctx, px + 1, py - 18, 30, 1, MENTA2);
      ret(ctx, px + 3, py - 13, 1, 5, C.branco);
    },
    // os peixinhos são sempre desenhados aqui (parados, sem Animações)
    anim: function (ctx, px, py, t) {
      var f = t ? t / 70 : 0;
      function peixe(x, y, cor, dir) {
        ctx.fillStyle = K; ctx.fillRect(x - 3, y - 2, 7, 4);
        ctx.fillStyle = cor; ctx.fillRect(x - 2, y - 1, 5, 2);
        ctx.fillStyle = cor; ctx.fillRect(dir > 0 ? x - 4 : x + 4, y - 2, 1, 4);
        ctx.fillStyle = K; ctx.fillRect(dir > 0 ? x + 1 : x - 1, y - 1, 1, 1);
      }
      var a = f % 36, x1 = a < 18 ? a : 36 - a;
      peixe(px + 7 + Math.round(x1), py - 10, LAR, a < 18 ? 1 : -1);
      var b = (f * 0.7 + 11) % 30, x2 = b < 15 ? b : 30 - b;
      peixe(px + 23 - Math.round(x2), py - 5, '#ffd34d', b < 15 ? -1 : 1);
      var s = t ? (t / 90) % 12 : 4;
      ctx.fillStyle = C.branco; ctx.fillRect(px + 10, Math.round(py - 3 - s), 1, 1);
    } });
  // casinha fofinha com almofada e potinho
  I.objeto('petshop-casinha', { w: 2, h: 1, topo: 21, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 14;
      ret(ctx, cx - 12, py - 8, 25, 22, K); ret(ctx, cx - 11, py - 7, 23, 20, '#fff1d6');
      for (var y = py - 3; y < py + 13; y += 4) ret(ctx, cx - 11, y, 23, 1, '#f0d4a8');
      triangulo(ctx, cx - 15, py - 21, 31, 15, K); triangulo(ctx, cx - 12, py - 18, 25, 11, ROSA2);
      ret(ctx, cx - 15, py - 8, 31, 2, K);
      for (var i = 0; i < 4; i++) ret(ctx, cx - 7 + i * 4, py - 12, 2, 1, ROSA3);
      // porta arredondada com a almofada lilás lá dentro
      ret(ctx, cx - 5, py + 1, 11, 12, K); elipse(ctx, cx, py + 1, 5, 4, K);
      ret(ctx, cx - 4, py + 2, 9, 11, '#5a3a6e'); elipse(ctx, cx, py + 2, 4, 3, '#5a3a6e');
      elipse(ctx, cx, py + 11, 4, 2, '#c9a8ff'); ret(ctx, cx - 2, py + 10, 3, 1, '#e6d6ff');
      coracao(ctx, cx - 2, py - 5, VERM);
      // potinho de comida ao lado
      elipse(ctx, px + 29, py + 12, 3, 2, K); ret(ctx, px + 26, py + 10, 7, 3, K); ret(ctx, px + 27, py + 10, 5, 2, '#5fb4ff');
      ret(ctx, px + 27, py + 9, 5, 1, BISC); ret(ctx, px + 28, py + 8, 2, 1, BISC2);
    } });
  // tapete de patinhas (plano, andável)
  I.objeto('petshop-tapete-patinhas', { w: 3, h: 2, solido: false, semSombra: true, plano: true,
    desenhar: function (ctx, px, py, o) {
      var W = (o.w || 3) * 16, H = (o.h || 2) * 16, cx = px + W / 2, cy = py + H / 2;
      elipse(ctx, cx, cy, W / 2 - 1, H / 2 - 2, K);
      elipse(ctx, cx, cy, W / 2 - 2, H / 2 - 3, MENTA2);
      elipse(ctx, cx, cy, W / 2 - 4, H / 2 - 5, MENTA);
      for (var i = 0; i < 3; i++) patinha(ctx, px + 10 + i * ((W - 20) / 2), cy - 3 + (i % 2) * 6, i % 2 ? ROSA3 : C.branco);
    } });
  // na parede: quadrinho furado com escovas de crina e um pente
  I.objeto('petshop-escovas', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      contornoRet(ctx, px + 1, py + 7, 14, 20, FUNDO_MAD);
      for (var j = 0; j < 4; j++) for (var i = 0; i < 3; i++) ret(ctx, px + 4 + i * 4, py + 10 + j * 4, 1, 1, '#d9b88a');
      // escova rosa
      ret(ctx, px + 3, py + 9, 4, 12, K); ret(ctx, px + 4, py + 10, 2, 5, MAD); ret(ctx, px + 4, py + 15, 2, 5, ROSA);
      for (var k = 0; k < 3; k++) ret(ctx, px + 2, py + 16 + k * 2, 1, 1, K);
      // escova azul
      ret(ctx, px + 8, py + 9, 5, 7, K); ret(ctx, px + 9, py + 10, 3, 5, '#9fdcff'); ret(ctx, px + 10, py + 16, 1, 5, K);
      // pente
      ret(ctx, px + 7, py + 22, 7, 2, K); for (var d = 0; d < 4; d++) ret(ctx, px + 7 + d * 2, py + 24, 1, 2, K);
    } });
  // na parede: coleiras coloridas com medalhinhas
  I.objeto('petshop-coleiras', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      contornoRet(ctx, px + 2, py + 7, 28, 20, FUNDO_MAD);
      ret(ctx, px + 3, py + 8, 26, 1, '#fff1d6');
      [[9, 13, ROSA2], [22, 13, '#5fb4ff'], [9, 22, '#b58cff'], [22, 22, '#ffd34d']].forEach(function (c) {
        var cx = px + c[0], cy = py + c[1];
        ret(ctx, cx, cy - 5, 1, 2, K);
        elipse(ctx, cx, cy, 5, 3, K); elipse(ctx, cx, cy, 4, 2, c[2]); elipse(ctx, cx, cy, 2, 1, FUNDO_MAD);
        ret(ctx, cx - 1, cy + 3, 3, 3, K); ret(ctx, cx, cy + 4, 1, 1, C.ouro);
      });
    } });
  // na parede: placa redonda da patinha
  I.objeto('petshop-placa-patinha', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      var cx = px + 16, cy = py + 18;
      ret(ctx, cx - 6, py + 4, 1, 6, K); ret(ctx, cx + 5, py + 4, 1, 6, K);
      circulo(ctx, cx, cy, 10, K); circulo(ctx, cx, cy, 9, C.creme); circulo(ctx, cx, cy, 7, MENTA);
      elipse(ctx, cx, cy + 2, 3, 2, ROSA2); ret(ctx, cx - 2, cy + 4, 5, 1, ROSA2);
      circulo(ctx, cx - 4, cy - 2, 1, ROSA2); circulo(ctx, cx - 1, cy - 4, 1, ROSA2); circulo(ctx, cx + 2, cy - 4, 1, ROSA2); circulo(ctx, cx + 5, cy - 2, 1, ROSA2);
      coracao(ctx, px + 1, py + 10, ROSA2); coracao(ctx, px + 26, py + 22, ROSA2);
      brilho(ctx, px + 28, py + 10, C.ouro); brilho(ctx, px + 3, py + 24, C.ouro);
    } });

  // para as outras partes (R._predios.petshop)
  S.MENTA = MENTA; S.MENTA2 = MENTA2; S.MENTA3 = MENTA3; S.ROSA = ROSA; S.ROSA2 = ROSA2; S.ROSA3 = ROSA3;
  S.MAD = MAD; S.MADC = MADC; S.LAR = LAR; S.VERM = VERM; S.AGUA = AGUA; S.AGUA2 = AGUA2; S.AGUA3 = AGUA3;
  S.brilho = brilho; S.cenoura = cenoura; S.maca = maca; S.fardo = fardo; S.coracao = coracao; S.bolha = bolha;
  S.cesta = cesta;
})();
