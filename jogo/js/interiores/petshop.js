/* Pet Shop: a Loja (balcão da Dona Aveia, comidinhas, aquário, casinha) e o Cantinho da Água
   (o bebedouro grande, toalhas e a banheira de espuma). O bebedouro é o ÚNICO lugar com água:
   enche a sede da montaria na hora, de graça (Reino.Cuidados.beber), com som e animação.
   Também desenha a Pet Shop de fora, no mapa (Mapa.PREDIOS.petshop).
   Só dados, objetos e registros (funções guardadas); nada de DOM, PA ou Progresso no carregamento.
   As falas moram em petshop-falas.js. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var K = '#3a2446';
  var F = (R.FALAS_INTERIORES && R.FALAS_INTERIORES.petshop) || { npcs: {}, objetos: {}, extras: [] };
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};

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

  /* ================= OBJETOS DO CANTINHO DA ÁGUA ================= */
  // hora do último gole (mesma base de tempo do quadro: performance.now), para a animação do bebedouro
  var golouEm = -1e9;
  var GOLE_MS = 1800;
  // bebedouro grande: painel de azulejos com a bica de unicórnio dourada e o tanque de pedra
  I.objeto('petshop-bebedouro', { w: 3, h: 2, topo: 14, solido: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 24;
      // painel de azulejos em arco
      ret(ctx, px + 7, py - 6, 34, 22, K); elipse(ctx, cx, py - 6, 17, 8, K);
      ret(ctx, px + 8, py - 5, 32, 20, '#c8eef8'); elipse(ctx, cx, py - 6, 16, 7, '#c8eef8');
      for (var y = py - 8; y < py + 14; y += 5) ret(ctx, px + 8, y, 32, 1, '#9fd6e8');
      for (var x = px + 13; x < px + 40; x += 6) ret(ctx, x, py - 4, 1, 18, '#9fd6e8');
      // estrelinhas no arco
      brilho(ctx, cx - 10, py - 8, C.ouro); brilho(ctx, cx + 10, py - 8, C.ouro);
      // bica: cabecinha de unicórnio dourada com chifre
      // crina lilás e rosa dos lados
      ret(ctx, cx - 7, py - 6, 3, 9, K); ret(ctx, cx - 6, py - 5, 2, 7, '#c9a8ff'); ret(ctx, cx - 6, py - 2, 2, 2, ROSA2);
      ret(ctx, cx + 4, py - 6, 3, 9, K); ret(ctx, cx + 4, py - 5, 2, 7, '#c9a8ff'); ret(ctx, cx + 4, py - 2, 2, 2, ROSA2);
      // cabeça dourada, orelhinhas e chifre em espiral
      ret(ctx, cx - 4, py - 6, 9, 10, K); ret(ctx, cx - 3, py - 5, 7, 8, C.ouro); ret(ctx, cx - 3, py - 5, 7, 1, C.ouro3);
      ret(ctx, cx - 4, py - 8, 2, 3, K); ret(ctx, cx + 3, py - 8, 2, 3, K); ret(ctx, cx - 3, py - 7, 1, 1, ROSA2); ret(ctx, cx + 3, py - 7, 1, 1, ROSA2);
      ret(ctx, cx - 1, py - 14, 3, 9, K); ret(ctx, cx, py - 13, 1, 8, C.branco); ret(ctx, cx, py - 12, 1, 1, C.ouro); ret(ctx, cx, py - 9, 1, 1, C.ouro);
      ret(ctx, cx - 2, py - 2, 1, 2, K); ret(ctx, cx + 2, py - 2, 1, 2, K); ret(ctx, cx - 3, py + 1, 1, 1, ROSA2); ret(ctx, cx + 3, py + 1, 1, 1, ROSA2);
      // focinho que vira bica
      ret(ctx, cx - 2, py + 2, 5, 4, K); ret(ctx, cx - 1, py + 2, 3, 2, C.ouro2); ret(ctx, cx, py + 4, 1, 1, '#2a6a8a');
      // tanque de pedra (o tanque é grande: dá para a montaria inteira beber)
      ret(ctx, px + 1, py + 10, 46, 21, K);
      ret(ctx, px + 2, py + 11, 44, 19, '#f3e6c8');
      ret(ctx, px + 2, py + 11, 44, 2, C.creme);
      ret(ctx, px + 4, py + 14, 40, 9, K);
      ret(ctx, px + 5, py + 15, 38, 7, AGUA); ret(ctx, px + 5, py + 15, 38, 1, AGUA2); ret(ctx, px + 5, py + 20, 38, 2, AGUA3);
      // jato fixo da bica até a água
      ret(ctx, cx - 1, py + 5, 2, 10, AGUA2); ret(ctx, cx, py + 5, 1, 10, C.branco);
      // frente do tanque: pedras e a gotinha
      ret(ctx, px + 2, py + 24, 44, 1, '#d8c6a0');
      for (var i = 0; i < 5; i++) ret(ctx, px + 6 + i * 9, py + 25 + (i % 2) * 2, 5, 1, '#d8c6a0');
      ret(ctx, cx - 3, py + 23, 7, 8, K); ret(ctx, cx - 2, py + 25, 5, 5, AGUA); ret(ctx, cx - 1, py + 24, 3, 1, AGUA); ret(ctx, cx, py + 23, 1, 1, AGUA);
      ret(ctx, cx - 1, py + 26, 1, 2, C.branco);
    },
    // água viva: o jato escorre e faz anéis; logo depois de beber, a água ondula e espirra gotinhas
    anim: function (ctx, px, py, t) {
      if (!t) return;
      var cx = px + 24;
      var f = (t / 90) % 10;
      ret(ctx, cx - 1, py + 5 + Math.floor(f), 2, 1, C.branco);
      ret(ctx, cx - 1, py + 5 + Math.floor((f + 5) % 10), 1, 1, C.branco);
      var anel = (t / 700) % 1, m = 2 + Math.round(anel * 12);
      ret(ctx, cx - m, py + 16, m * 2 + 1, 1, 'rgba(255,255,255,' + (0.85 * (1 - anel)).toFixed(2) + ')');
      var b = Math.floor(t / 260) % 38;
      ret(ctx, px + 5 + b, py + 18, 3, 1, 'rgba(255,255,255,0.55)');
      var d = t - golouEm;
      if (d >= 0 && d < GOLE_MS) {
        var k = d / GOLE_MS;
        // ondas atravessando o tanque
        for (var w = 0; w < 3; w++) {
          var off = Math.round((k * 3 + w / 3) % 1 * 36);
          ret(ctx, px + 5 + off, py + 15 + w * 2, 4, 1, C.branco);
          ret(ctx, px + 41 - off, py + 16 + w * 2, 3, 1, AGUA2);
        }
        // repuxo: gotas grandes saltando da bica em arco para os dois lados
        for (var g = 0; g < 8; g++) {
          var lado = g % 2 ? 1 : -1, s = (k * 2.2 + g / 8) % 1;
          var gx = Math.round(cx + lado * (2 + s * 17)), gy = Math.round(py + 2 - Math.sin(s * Math.PI) * 14 + s * 12);
          ret(ctx, gx - 1, gy - 1, 3, 3, AGUA3); ret(ctx, gx, gy, 1, 1, g % 3 ? AGUA2 : C.branco);
        }
        // coraçõezinhos de alegria subindo
        if (k < 0.85) {
          var sobe = Math.round(k * 18);
          coracao(ctx, px + 9, py + 6 - sobe, ROSA2); coracao(ctx, px + 35, py + 2 - sobe, ROSA2);
          brilho(ctx, px + 16, py + 4 - sobe, C.ouro3); brilho(ctx, px + 31, py + 9 - sobe, C.branco);
        }
      }
    } });
  // banheira de espuma com patinho (bolhas sobem com Animações)
  I.objeto('petshop-banheira', { w: 3, h: 2, topo: 12, solido: true,
    desenhar: function (ctx, px, py) {
      // pezinhos dourados
      [px + 6, px + 38].forEach(function (x) { ret(ctx, x, py + 25, 5, 5, K); ret(ctx, x + 1, py + 26, 3, 3, C.ouro); });
      // banheira rosa
      ret(ctx, px + 2, py + 4, 44, 23, K); ret(ctx, px + 1, py + 6, 46, 18, K);
      ret(ctx, px + 3, py + 5, 42, 21, ROSA); ret(ctx, px + 2, py + 7, 44, 16, ROSA);
      ret(ctx, px + 3, py + 22, 42, 3, ROSA2); ret(ctx, px + 4, py + 9, 2, 10, ROSA3);
      ret(ctx, px + 2, py + 4, 44, 3, K); ret(ctx, px + 3, py + 5, 42, 1, C.branco);
      for (var x = px + 12; x < px + 40; x += 9) coracao(ctx, x, py + 13, C.branco);
      // torneira à esquerda
      ret(ctx, px + 3, py - 6, 3, 10, K); ret(ctx, px + 3, py - 7, 8, 3, K); ret(ctx, px + 4, py - 6, 6, 1, C.metal); ret(ctx, px + 4, py - 5, 1, 8, C.metal);
      // espuma por cima
      [[10, 3, 4], [16, 1, 5], [23, 2, 4], [29, 0, 5], [36, 2, 4], [41, 4, 3], [13, -2, 3], [26, -3, 3], [33, -3, 3]].forEach(function (b) {
        bolha(ctx, px + b[0], py + b[1], b[2]);
      });
      // patinho amarelo
      ret(ctx, px + 20, py - 7, 8, 5, K); ret(ctx, px + 21, py - 6, 6, 3, C.ouro);
      ret(ctx, px + 25, py - 10, 4, 4, K); ret(ctx, px + 26, py - 9, 2, 2, C.ouro); ret(ctx, px + 29, py - 8, 2, 1, LAR); ret(ctx, px + 27, py - 9, 1, 1, K);
    },
    anim: function (ctx, px, py, t) {
      if (!t) return;
      for (var i = 0; i < 4; i++) {
        var s = (t / 1400 + i * 0.27) % 1, x = px + 12 + i * 8 + Math.round(Math.sin(t / 300 + i) * 2);
        var y = Math.round(py - 4 - s * 14);
        if (s < 0.85) { ret(ctx, x - 1, y - 1, 3, 3, K); ret(ctx, x, y, 1, 1, C.branco); }
        else { brilho(ctx, x, y, C.branco); }
      }
    } });
  // na parede: toalheiro com três toalhas listradas
  I.objeto('petshop-toalhas', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 10, 30, 3, K); ret(ctx, px + 2, py + 11, 28, 1, C.metal);
      ret(ctx, px + 1, py + 9, 2, 5, K); ret(ctx, px + 29, py + 9, 2, 5, K);
      [[3, ROSA, C.branco], [12, MENTA, '#ffd34d'], [21, '#c9a8ff', ROSA3]].forEach(function (tw, i) {
        var x = px + tw[0], h = 15 - (i % 2) * 2;
        ret(ctx, x, py + 11, 8, h, K); ret(ctx, x + 1, py + 12, 6, h - 2, tw[1]);
        ret(ctx, x + 1, py + 11 + h - 5, 6, 1, tw[2]); ret(ctx, x + 1, py + 11 + h - 3, 6, 1, tw[2]);
        ret(ctx, x + 1, py + 12, 6, 1, 'rgba(255,255,255,0.5)');
      });
    } });
  // desenho em mapa de pixels: cada letra é uma cor (o ponto é transparente)
  function mapaPixels(ctx, x0, y0, linhas, cores) {
    for (var j = 0; j < linhas.length; j++) for (var i = 0; i < linhas[j].length; i++) {
      var c = cores[linhas[j][i]];
      if (c) ret(ctx, x0 + i, y0 + j, 1, 1, c);
    }
  }
  // na parede: chuveirinho de mão de dar banho — o cabo apoiado no suporte rosa, a cabeça redonda
  // virada para baixo com os furinhos e os jatinhos, e a mangueira sanfonada descendo até o registro
  // (os pingos correm com Animações). Começa em py + 11, para não encostar na placa do cômodo.
  var CHUVEIRINHO = [
    '...........KKKK.',
    '..........KrbrrK',
    '..........KrrRRK',
    '.........KKKKKK.',
    '........KbmK.KgK',
    '.......KmmK..KmK',
    '......KmmK...KgK',
    '...KKKmmK....KmK',
    '..KrrbrrrK...KgK',
    '.KrrrrrrrrK..KmK',
    '.KRRRRRRRRK.KgK.',
    'KKKKKKKKKKKKKmK.',
    'KmAmAmAmAmmKKK..',
    '.KKKKKKKKKK.KrK.',
    '.a..a..a..a.KRK.',
    'a..a..a..a...K..',
    '.a..a..a.a......',
  ];
  I.objeto('petshop-chuveirinho', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      mapaPixels(ctx, px, py + 11, CHUVEIRINHO, { K: K, r: ROSA, R: ROSA2, b: C.branco, m: C.metal, g: C.metal2, A: AGUA2, a: AGUA3 });
    },
    anim: function (ctx, px, py, t) {
      if (!t) return;
      for (var i = 0; i < 3; i++) {
        var s = (t / 650 + i / 3) % 1;
        ret(ctx, px + 1 + i * 3 - Math.round(s * 2), Math.round(py + 25 + s * 5), 1, 2, AGUA3);
      }
    } });
  // pilha de toalhas dobradas no banquinho
  I.objeto('petshop-pilha-toalhas', { w: 1, h: 1, topo: 8, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 2, py + 9, 12, 6, K); ret(ctx, px + 3, py + 10, 10, 2, MADC); ret(ctx, px + 3, py + 12, 2, 3, MAD); ret(ctx, px + 11, py + 12, 2, 3, MAD);
      [[ROSA, C.branco], [MENTA, C.branco], ['#ffd34d', ROSA3], ['#c9a8ff', C.branco]].forEach(function (c, i) {
        var y = py + 5 - i * 4, x = px + 2 + (i % 2);
        ret(ctx, x, y, 12, 5, K); ret(ctx, x + 1, y + 1, 10, 3, c[0]); ret(ctx, x + 1, y + 2, 10, 1, c[1]);
      });
    } });
  // cestinho com frascos de xampu
  I.objeto('petshop-xampus', { w: 1, h: 1, topo: 9, solido: true,
    desenhar: function (ctx, px, py) {
      [[3, 8, ROSA2], [7, 10, MENTA2], [11, 7, '#b58cff']].forEach(function (b) {
        var x = px + b[0] - 2, h = b[1];
        ret(ctx, x, py + 8 - h, 5, h + 2, K); ret(ctx, x + 1, py + 9 - h, 3, h, b[2]); ret(ctx, x + 1, py + 11 - h, 1, 3, C.branco);
        ret(ctx, x + 1, py + 6 - h, 3, 2, K);
      });
      cesta(ctx, px, py + 1, '#9fdcff');
    } });
  // tapetinho de banho de bolinhas (plano)
  I.objeto('petshop-tapete-banho', { w: 2, h: 1, solido: false, semSombra: true, plano: true,
    desenhar: function (ctx, px, py, o) {
      var W = (o.w || 2) * 16;
      contornoRet(ctx, px + 2, py + 3, W - 4, 10, '#9fdcff');
      for (var x = px + 5; x < px + W - 4; x += 5) { ret(ctx, x, py + 6, 2, 2, C.branco); ret(ctx, x + 2, py + 9, 1, 1, C.branco); }
      for (var f = px + 3; f < px + W - 3; f += 2) { ret(ctx, f, py + 2, 1, 1, C.creme2); ret(ctx, f, py + 13, 1, 1, C.creme2); }
    } });
  // balde cheio de espuma
  I.objeto('petshop-balde-espuma', { w: 1, h: 1, topo: 8, solido: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      for (var i = -5; i <= 5; i++) ret(ctx, cx + i, py - 1 + Math.round(i * i / 8), 1, 1, K);
      ret(ctx, cx - 6, py + 4, 13, 11, K); ret(ctx, cx - 5, py + 5, 11, 9, MENTA); ret(ctx, cx - 5, py + 9, 11, 1, MENTA2); ret(ctx, cx - 4, py + 6, 2, 6, MENTA3);
      bolha(ctx, cx - 3, py + 3, 3); bolha(ctx, cx + 2, py + 2, 4); bolha(ctx, cx, py - 2, 3);
    } });
  // secador de crina no pedestal
  I.objeto('petshop-secador', { w: 1, h: 1, topo: 22, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 5, py + 12, 11, 3, K); ret(ctx, cx - 4, py + 12, 9, 1, C.metal);
      ret(ctx, cx - 1, py - 8, 3, 21, K); ret(ctx, cx, py - 8, 1, 20, C.metal2);
      // capacete do secador: cúpula rosa aberta embaixo
      elipse(ctx, cx, py - 15, 7, 6, K); elipse(ctx, cx, py - 15, 6, 5, ROSA); ret(ctx, cx - 4, py - 19, 3, 2, ROSA3);
      elipse(ctx, cx, py - 11, 6, 2, K); elipse(ctx, cx, py - 11, 5, 1, '#8a4a7a');
      ret(ctx, cx + 3, py - 17, 2, 2, C.branco); ret(ctx, cx - 1, py - 22, 3, 2, K); ret(ctx, cx, py - 22, 1, 1, C.ouro);
      // ventinho quente saindo
      ret(ctx, cx - 3, py - 8, 1, 2, '#ffc0d8'); ret(ctx, cx + 3, py - 8, 1, 2, '#ffc0d8');
    } });
  // bacia azul com patinhos de borracha
  I.objeto('petshop-patinhos', { w: 1, h: 1, topo: 5, solido: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 8, py + 10, 7, 4, K); elipse(ctx, px + 8, py + 10, 6, 3, '#5fb4ff'); elipse(ctx, px + 8, py + 9, 5, 2, AGUA2);
      [[5, 7], [10, 6]].forEach(function (d) {
        var x = px + d[0], y = py + d[1];
        ret(ctx, x - 3, y - 1, 7, 4, K); ret(ctx, x - 2, y, 5, 2, C.ouro);
        ret(ctx, x, y - 4, 4, 4, K); ret(ctx, x + 1, y - 3, 2, 2, C.ouro); ret(ctx, x + 4, y - 2, 2, 1, LAR); ret(ctx, x + 2, y - 3, 1, 1, K);
      });
    } });
  // poça de espuma no chão (plana, andável): lâmina d'água azul baixinha e brilhante, com bolhas redondas na beira
  // (nada de montinho branco, para não parecer nuvem)
  var POCA = [
    '...........oo...',
    '..oo......owwo..',
    '.owwooooooowwoo.',
    'ooaalwlaaaaaaaao',
    'oaaaaaaaaaaaawao',
    '.ooaaaaaaaaaaoo.',
    '...oooooooooo...',
  ];
  I.objeto('petshop-espuma', { w: 1, h: 1, solido: false, semSombra: true, plano: true,
    desenhar: function (ctx, px, py) {
      mapaPixels(ctx, px, py + 6, POCA, { o: AGUA3, a: AGUA, l: AGUA2, w: C.branco });
    } });

  /* ================= AJUDANTES DE MONTAGEM ================= */
  function inter(chave, nome, o) {
    return Object.assign(o, { chave: chave, nome: nome, fala: F.objetos[chave] || '(fala de ' + chave + ')' });
  }
  function npc(id, x, y, acao) {
    var e = ELENCO[id] || {};
    return { id: id, nome: e.nome || id, sprite: e.sprite ? Object.assign({ base: 'pessoa' }, e.sprite) : { base: 'pessoa' },
      voz: e.voz || 'npc-' + id, x: x, y: y, acao: acao, falas: F.npcs[id] || {} };
  }
  var TELA = { tipo: 'tela', tela: 'petshop' };

  /* ================= LAYOUT ================= */
  // Loja (14×11) à esquerda, com a Dona Aveia ao lado do balcão; Cantinho da Água (9×11) à direita
  var loja = [
    // parede do fundo (y 1-2)
    { tipo: 'petshop-escovas', x: 1, y: 1 },
    { tipo: 'cortina', x: 3, y: 1, var: { cor: '#8fe0d0' } },
    { tipo: 'janela', x: 4, y: 1 },
    { tipo: 'petshop-placa-patinha', x: 5, y: 1 },
    { tipo: 'relogio-parede', x: 7, y: 1 },
    { tipo: 'prateleira-parede', x: 8, y: 1, var: { itens: ['bolo', 'planta', 'ursinho'] } },
    { tipo: 'bandeirinhas', x: 10, y: 1 },
    { tipo: 'janela', x: 12, y: 1 },
    { tipo: 'petshop-coleiras', x: 13, y: 1 },
    // fundo: nada que se toca nos cantos de cima, que somem sob as colunas do HUD (à esquerda os avisos,
    // como "🥚 1 ovo!"; à direita o ↙ e o cartão da montaria). A estante fica uma fileira à frente, à direita
    { tipo: 'petshop-sacos-feno', x: 1, y: 3 },
    { tipo: 'planta-alta', x: 2, y: 3 },
    { tipo: 'petshop-potes-biscoito', x: 3, y: 3 },
    { tipo: 'petshop-cesta-cenouras', x: 4, y: 3 },
    { tipo: 'petshop-cesta-macas', x: 5, y: 3 },
    { tipo: 'flores', x: 6, y: 3, var: { vaso: '#ff9cc6' } },
    { tipo: 'petshop-sacos-feno', x: 9, y: 3 },
    { tipo: 'caixote', x: 10, y: 3, var: { item: 'estrela' } },
    { tipo: 'petshop-potes-biscoito', x: 11, y: 3 },
    { tipo: 'petshop-sacos-feno', x: 12, y: 3 },
    { tipo: 'planta-alta', x: 13, y: 3 },
    { tipo: 'petshop-sacos-feno', x: 14, y: 3 },
    { tipo: 'petshop-balcao', x: 9, y: 4 },
    // lado esquerdo
    { tipo: 'cesto', x: 1, y: 4 },
    { tipo: 'petshop-tapete-patinhas', x: 3, y: 5, w: 3, h: 2 },
    { tipo: 'petshop-sacos-feno', x: 1, y: 6 },
    inter('aquario', 'Aquário', { tipo: 'petshop-aquario', x: 1, y: 8 }),
    { tipo: 'flores', x: 3, y: 8, var: { vaso: '#8fe0d0' } },
    inter('casinha', 'Casinha', { tipo: 'petshop-casinha', x: 4, y: 10 }),
    { tipo: 'almofada', x: 6, y: 8, var: { cor: '#ffd34d' } },
    { tipo: 'petshop-cesta-macas', x: 1, y: 11 },
    { tipo: 'cesto', x: 2, y: 11 },
    { tipo: 'caixote', x: 6, y: 11 },
    // lado direito: atrás da estante, só enfeites (o chão ali ficaria preso)
    { tipo: 'petshop-potes-biscoito', x: 13, y: 4 },
    { tipo: 'cesto', x: 14, y: 4 },
    inter('estante', 'Estante das comidinhas', { tipo: 'petshop-estante-comida', x: 13, y: 5, acao: TELA }),
    inter('bolo', 'Bolo arco-íris', { tipo: 'petshop-vitrine-bolo', x: 10, y: 6, acao: TELA }),
    inter('balanca', 'Balança', { tipo: 'petshop-balanca', x: 14, y: 7 }),
    { tipo: 'flores', x: 14, y: 6, var: { vaso: '#b58cff' } },
    { tipo: 'almofada', x: 12, y: 7, var: { cor: '#ff9cc6' } },
    { tipo: 'petshop-tapete-patinhas', x: 10, y: 10, w: 3, h: 2 },
    { tipo: 'vaso-planta', x: 14, y: 10, var: { vaso: '#8fe0d0' } },
    { tipo: 'petshop-cesta-cenouras', x: 13, y: 11 },
    { tipo: 'flores', x: 14, y: 11, var: { vaso: '#ff9cc6' } },
  ];
  var agua = [
    // parede do fundo (y 1-2)
    { tipo: 'janela', x: 16, y: 1 },
    { tipo: 'arandela', x: 17, y: 1 },            // longe da placa do cômodo (a chama não encosta)
    { tipo: 'petshop-chuveirinho', x: 18, y: 1 },
    { tipo: 'espelho', x: 22, y: 1 },
    inter('toalhas', 'Toalhas', { tipo: 'petshop-toalhas', x: 23, y: 1 }),
    // fundo: o bebedouro grande no meio
    { tipo: 'petshop-xampus', x: 16, y: 3 },
    { tipo: 'petshop-pilha-toalhas', x: 17, y: 3 },
    { tipo: 'petshop-balde-espuma', x: 18, y: 3 },
    { tipo: 'petshop-bebedouro', x: 19, y: 3, nome: 'Bebedouro', acao: { tipo: 'beber' } },
    { tipo: 'balde', x: 22, y: 3 },
    { tipo: 'flores', x: 24, y: 3, var: { vaso: '#ff9cc6' } },
    { tipo: 'petshop-xampus', x: 18, y: 4 },
    { tipo: 'vaso-planta', x: 16, y: 5, var: { vaso: '#5fb4ff' } },   // 1 fileira abaixo: os xampus aparecem inteiros
    { tipo: 'tapete-redondo', x: 17, y: 5, w: 2, h: 2, var: { cores: ['#5fb4ff', '#bfe9ff', '#ffffff', '#9fdcff'] } },
    { tipo: 'petshop-tapete-banho', x: 19, y: 5, w: 3, h: 1 },
    { tipo: 'flores', x: 24, y: 5, var: { vaso: '#9fdcff' } },
    // banheira de espuma à direita
    inter('banheira', 'Banheira de espuma', { tipo: 'petshop-banheira', x: 22, y: 6 }),
    { tipo: 'petshop-balde-espuma', x: 16, y: 7 },
    { tipo: 'petshop-espuma', x: 21, y: 7 },
    // frente
    { tipo: 'petshop-secador', x: 24, y: 9 },
    { tipo: 'petshop-pilha-toalhas', x: 16, y: 10 },
    { tipo: 'petshop-espuma', x: 18, y: 11 },
    { tipo: 'petshop-patinhos', x: 19, y: 11 },
    { tipo: 'petshop-patinhos', x: 18, y: 7 },
    { tipo: 'petshop-tapete-banho', x: 20, y: 10, w: 2, h: 1 },
    { tipo: 'cesto', x: 23, y: 11, var: { cor: '#9fdcff' } },
    { tipo: 'vaso-planta', x: 24, y: 11, var: { vaso: '#ff9cc6' } },
    { tipo: 'petshop-balde-espuma', x: 22, y: 10 },
  ];

  Reino.registrarInterior({
    id: 'petshop',
    lugar: 'petshop',
    nome: 'Pet Shop',
    entrada: true,
    pacote: 'interior-petshop',
    tamanho: { w: 26, h: 13 },
    saida: { x: 8, y: 11 },
    spawn: { x: 8, y: 10 },
    comodos: [
      { id: 'loja', nome: 'Pet Shop', placa: 'Pet Shop', rect: { x: 1, y: 1, w: 14, h: 11 },
        piso: 'taco', parede: 'papel',
        paleta: { piso: '#f3cfa0', piso2: '#dcae78', parede: '#e9fbf5', parede2: '#bfeee2', rodape: '#4fbfae', detalhe: '#ff9cc6' } },
      { id: 'agua', nome: 'Cantinho da Água', placa: 'Cantinho da Água', rect: { x: 16, y: 1, w: 9, h: 11 },
        piso: 'azulejo', parede: 'azulejo',
        paleta: { piso: '#eef8ff', piso2: '#c4e6f7', detalhe: '#8fd0ec', parede: '#f4fcff', parede2: '#a8e4f0', rodape: '#4fa8c8' } },
    ],
    portas: [{ x: 15, y: 8, w: 1, h: 2 }],   // Loja ↔ Cantinho da Água
    corredores: [
      { x: 7, y: 5, w: 3, h: 7 },     // da porta até o fundo
      { x: 9, y: 5, w: 4, h: 1 },     // até a Dona Aveia
      { x: 9, y: 8, w: 6, h: 2 },     // até o Cantinho da Água
      { x: 16, y: 8, w: 6, h: 2 },    // entrada do Cantinho
      { x: 19, y: 6, w: 3, h: 2 },    // até o bebedouro
    ],
    objetos: loja.concat(agua),
    npcs: [
      npc('aveia', 12, 4, TELA),
    ],
  });

  /* ================= AÇÕES, TELA E STATUS (só guardam funções) ================= */
  function retratoUni(id) {
    try {
      var P = R.Progresso, d = P.defUni(id), u = P.estado().unis[id];
      var s = window.PA && PA.unicornio ? PA.unicornio(d, R.Unicornios.estagio(u ? u.xp : 0), 0) : null;
      return s ? (s.canvas || s) : null;
    } catch (e) { return null; }
  }
  // balão modal de uma frase do Reino.Cuidados, na voz de quem fala (o unicórnio ou o Claude)
  function falarFrase(chave, id) {
    var Cu = R.Cuidados, Cl = R.Claude;
    var texto = Cu.frases && Cu.frases[chave];
    if (!texto || !Cl || !Cl.falar) return Promise.resolve(null);
    var voz = Cu.vozDaFrase ? Cu.vozDaFrase(chave) : 'claude';
    var op = { modal: true, voz: voz, botoes: [{ texto: 'Ok! 👍', valor: 'ok', principal: true }] };
    if (voz === 'unicornio') {
      var P = R.Progresso;
      op.quem = { nome: (P.nomeUni && P.nomeUni(id)) || 'Unicórnio', retrato: retratoUni(id), voz: voz };
    }
    return Cl.falar(texto, op);
  }
  function beber() {
    var Cu = R.Cuidados, P = R.Progresso, Cl = R.Claude;
    if (!Cu || !Cu.beber || !P) return Promise.resolve(null);
    var id = P.montaria ? P.montaria() : null;
    var r = Cu.beber(id);
    if (r && r.ok) {
      if (R.Som && R.Som.tocar) R.Som.tocar('gole');
      golouEm = (window.performance && performance.now) ? performance.now() : Date.now();
      return falarFrase('bebeu', id);
    }
    if (r && r.motivo === 'cheio') return falarFrase('semSede', id);
    // ninguém para beber: a narradora conta para que serve o bebedouro
    var ex = (F.extras || [])[0];
    if (!ex || !Cl || !Cl.falar) return Promise.resolve(null);
    return Cl.falar(ex.texto, { modal: true, voz: ex.voz, quem: { nome: 'Bebedouro', voz: ex.voz },
      botoes: [{ texto: 'Ok! 👍', valor: 'ok', principal: true }] });
  }
  if (R.NPCs && R.NPCs.registrarTela) {
    R.NPCs.registrarTela('petshop', function () { if (R.UI && R.UI.telaPetShop) R.UI.telaPetShop(); }, (F.npcs.aveia && F.npcs.aveia.nova && F.npcs.aveia.nova[0]) || 'Quer ver as comidinhas? 🥕');
  }
  if (R.NPCs && R.NPCs.registrarAcao) R.NPCs.registrarAcao('beber', beber);
  // a Dona Aveia mostra 🍎/💧 quando a montaria está com fome ou sede
  if (R.NPCs && R.NPCs.registrarStatus) {
    R.NPCs.registrarStatus(function (n) {
      if (!n || n.id !== 'aveia' || !R.Cuidados || !R.Cuidados.iconeMontaria) return null;
      var ic = R.Cuidados.iconeMontaria();
      if (!ic || !(window.PA && PA.iconeDesenho && PA.iconeDesenho(ic))) return null;
      var b = R.Cuidados.baixo ? R.Cuidados.baixo() : null;
      return { icone: ic, rotulo: b && b.fome && b.sede ? 'Com fome e sede' : (ic === '💧' ? 'Com sede' : 'Com fome') };
    });
  }
  /* ================= DE FORA: o prédio no mapa (80 × 64 px) ================= */
  function desenharFora(ctx, px, py, w, h) {
    var cx = px + 40;                      // meio do tile da porta (tile 4 de 2..6)
    var parede = '#fff4e6', parede2 = '#f3dcc0', telhado = '#4fbfae', telhado2 = '#2f9e90';
    // corpo da loja com tábuas
    contornoRet(ctx, px + 4, py + 24, w - 8, h - 24, parede);
    for (var j = py + 29; j < py + h - 2; j += 5) ret(ctx, px + 5, j, w - 10, 1, parede2);
    ret(ctx, px + w - 12, py + 25, 7, h - 26, '#f6e6d0');
    // telhado de telhas menta com beiral
    triangulo(ctx, px, py + 4, w, 23, K);
    triangulo(ctx, px + 3, py + 7, w - 6, 19, telhado);
    for (var tj = py + 13; tj < py + 25; tj += 4) {
      var meia = Math.round((w - 6) / 2 * (tj - py - 7 + 1) / 19) - 3;
      for (var tx = cx - meia + 2; tx < cx + meia - 2; tx += 6) ret(ctx, tx, tj, 3, 1, telhado2);
    }
    ret(ctx, px + 1, py + 23, w - 2, 3, K); ret(ctx, px + 2, py + 24, w - 4, 1, telhado2);
    // placa da patinha no telhado: plaquinha redonda clarinha com uma patinha escura e bem marcada
    // (4 dedinhos separados + almofada), que se lê mesmo em 1× e não vira carinha de porquinho
    var PATA = '#7a2a66';
    circulo(ctx, cx, py + 14, 8, K); circulo(ctx, cx, py + 14, 7, C.branco);
    // 4 dedinhos do mesmo tamanho em arco (os do meio mais altos), bem separados da almofada
    ret(ctx, cx - 2, py + 10, 2, 2, PATA); ret(ctx, cx + 1, py + 10, 2, 2, PATA);
    ret(ctx, cx - 5, py + 12, 2, 2, PATA); ret(ctx, cx + 4, py + 12, 2, 2, PATA);
    // almofada: gota larga, estreita em cima e arredondada embaixo
    ret(ctx, cx - 1, py + 14, 3, 1, PATA); ret(ctx, cx - 2, py + 15, 5, 1, PATA);
    ret(ctx, cx - 3, py + 16, 7, 2, PATA); ret(ctx, cx - 2, py + 18, 5, 1, PATA);
    // ossinho de cata-vento no topo
    ret(ctx, cx, py - 2, 1, 7, K);
    ret(ctx, cx - 4, py - 3, 9, 3, K); ret(ctx, cx - 3, py - 2, 7, 1, C.creme); ret(ctx, cx - 5, py - 4, 2, 2, K); ret(ctx, cx + 4, py - 4, 2, 2, K); ret(ctx, cx - 5, py - 1, 2, 2, K); ret(ctx, cx + 4, py - 1, 2, 2, K);
    // toldo listrado rosa e branco com babadinho
    var ty = py + 27;
    ret(ctx, px + 6, ty, w - 12, 8, K);
    for (var i = px + 7, k = 0; i < px + w - 7; i += 4, k++) ret(ctx, i, ty + 1, 4, 6, k % 2 ? C.branco : ROSA2);
    for (var s = px + 7, k2 = 0; s < px + w - 7; s += 4, k2++) { ret(ctx, s, ty + 7, 4, 2, K); ret(ctx, s + 1, ty + 7, 2, 1, k2 % 2 ? C.branco : ROSA2); }
    // vitrine grande (esquerda): aquário, cenouras e maçã
    var vx = px + 8, vy = py + 39;
    contornoRet(ctx, vx, vy, 22, 16, '#d9f3ff');
    ret(ctx, vx + 1, vy + 1, 20, 3, '#eef9ff'); ret(ctx, vx + 2, vy + 2, 4, 1, C.branco);
    ret(ctx, vx + 2, vy + 6, 9, 8, K); ret(ctx, vx + 3, vy + 7, 7, 6, AGUA); ret(ctx, vx + 3, vy + 7, 7, 1, AGUA2);
    ret(ctx, vx + 5, vy + 9, 3, 2, LAR); ret(ctx, vx + 4, vy + 9, 1, 2, LAR);
    cenoura(ctx, vx + 13, vy + 14); cenoura(ctx, vx + 16, vy + 14);
    maca(ctx, vx + 18, vy + 7);
    ret(ctx, vx - 1, vy + 16, 24, 3, K); ret(ctx, vx, vy + 16, 22, 1, MAD);
    [[3, '#ff7eb6'], [9, '#ffd34d'], [15, '#b58cff'], [20, '#ff7eb6']].forEach(function (f) {
      ret(ctx, vx + f[0] - 1, vy + 18, 3, 1, f[1]); ret(ctx, vx + f[0], vy + 17, 1, 3, f[1]); ret(ctx, vx + f[0], vy + 18, 1, 1, C.ouro3);
    });
    // janela redonda (direita) com o bolo arco-íris
    var jx = px + 60, jy = py + 45;
    circulo(ctx, jx, jy, 8, K); circulo(ctx, jx, jy, 7, MAD); circulo(ctx, jx, jy, 5, K); circulo(ctx, jx, jy, 4, '#eef9ff');
    ['#ff7eb6', '#ffd34d', '#6fdc8c', '#5fb4ff'].forEach(function (c, i) { ret(ctx, jx - 3, jy + 2 - i, 7, 1, c); });
    ret(ctx, jx - 3, jy - 3, 7, 1, C.branco); ret(ctx, jx, jy - 4, 1, 1, VERM);
    // porta com arco e janelinha de coração
    var dx = cx - 7, dy = py + h - 22;
    ret(ctx, dx - 1, dy + 2, 16, 20, C.ouro); elipse(ctx, dx + 7, dy + 3, 8, 3, C.ouro);
    ret(ctx, dx, dy + 3, 14, 19, LAR); elipse(ctx, dx + 7, dy + 4, 7, 3, LAR);
    ret(ctx, dx + 1, dy + 5, 12, 1, '#ffb070');
    ret(ctx, dx + 6, dy + 5, 1, 17, '#d96a2a');
    coracao(ctx, dx + 5, dy + 7, C.creme);
    ret(ctx, dx + 10, dy + 13, 2, 2, C.ouro);
    // tapetinho da porta
    ret(ctx, cx - 6, py + h - 2, 13, 2, K); ret(ctx, cx - 5, py + h - 2, 11, 1, MENTA);
    // saco de feno e potinho de água do lado de fora
    fardo(ctx, px + 49, py + h - 2, 10, 8);
    var bx = px + 68, by = py + h - 5;
    elipse(ctx, bx, by, 5, 3, K); elipse(ctx, bx, by, 4, 2, '#5fb4ff'); ret(ctx, bx - 3, by - 2, 7, 1, AGUA2);
    // brilhinhos
    [[6, 34], [74, 36]].forEach(function (b) { brilho(ctx, px + b[0], py + b[1], C.branco); });
  }
  if (window.Mapa && Mapa.PREDIOS) Mapa.PREDIOS.petshop = desenharFora;
})();
