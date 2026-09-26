/* Castelo da Medalha, parte 1 de 2: os objetos temáticos (prefixo castelo-), os da ala de Português
   e os desenhos pequenos que eles usam. A estante das medalhas fica em castelo/castelo.js.
   O que as outras partes usam fica em Reino._predios.castelo (ver o fim do arquivo). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var K = '#3a2446';
  var F = (R.FALAS_INTERIORES && R.FALAS_INTERIORES.castelo) || { npcs: {}, objetos: {} };
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};
  // o que as partes do prédio compartilham (criado aqui; cada parte põe o seu no fim do arquivo)
  var S = (R._predios = R._predios || {}).castelo = {};
  var MEDALHA = { ouro: ['#ffd34d', '#fff3a0', '#d9a93a'], prata: ['#d8e0ea', '#ffffff', '#9aa6ba'], bronze: ['#e0975a', '#ffc896', '#a8603a'] };

  function v(o, k, padrao) { return (o && o.var && o.var[k] !== undefined) ? o.var[k] : padrao; }
  // desenho por texto: cada letra da linha é uma cor do mapa (ponto = vazio)
  function matriz(ctx, x, y, linhas, cores) {
    linhas.forEach(function (l, j) { for (var i = 0; i < l.length; i++) if (cores[l[i]]) ret(ctx, x + i, y + j, 1, 1, cores[l[i]]); });
  }
  // medalha pequena com fita (usada no brasão e na estante)
  function medalha(ctx, cx, cy, tipo) {
    var c = MEDALHA[tipo] || MEDALHA.ouro;
    ret(ctx, cx - 3, cy - 7, 3, 5, K); ret(ctx, cx + 1, cy - 7, 3, 5, K);
    ret(ctx, cx - 2, cy - 7, 1, 4, '#ff5c6a'); ret(ctx, cx + 2, cy - 7, 1, 4, '#5fb4ff');
    circulo(ctx, cx, cy, 4, K); circulo(ctx, cx, cy, 3, c[0]);
    ret(ctx, cx - 1, cy - 2, 2, 1, c[1]); ret(ctx, cx, cy - 1, 1, 3, c[2]);
  }
  function chama(ctx, x, y, t, fase) {
    var h = 3 + Math.round(Math.sin(t / 130 + fase) * 1);
    ret(ctx, x, y - h, 1, h, C.laranja); ret(ctx, x, y - h - 1, 1, 1, C.ouro3);
  }

  /* ================= OBJETOS DO CASTELO ================= */
  I.objeto('castelo-trono', { w: 3, h: 2, topo: 14, solido: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 24;
      // degraus
      ret(ctx, px + 1, py + 22, 46, 10, K); ret(ctx, px + 2, py + 23, 44, 4, '#c8324a'); ret(ctx, px + 2, py + 27, 44, 4, '#9a2438');
      ret(ctx, px + 2, py + 23, 44, 1, '#ff7a8a');
      // encosto alto
      ret(ctx, cx - 12, py - 14, 25, 30, K); ret(ctx, cx - 11, py - 13, 23, 28, C.ouro2);
      ret(ctx, cx - 9, py - 11, 19, 24, '#b0306a'); ret(ctx, cx - 9, py - 11, 19, 1, '#e060a0');
      triangulo(ctx, cx - 6, py - 22, 13, 9, K); triangulo(ctx, cx - 4, py - 20, 9, 6, C.ouro);
      circulo(ctx, cx, py - 18, 1, C.vermelho);
      // coroa bordada
      matriz(ctx, cx - 4, py - 6, ['y.y.y', 'yyyyy', 'yyyyy'], { y: C.ouro3 });
      // braços e assento
      ret(ctx, cx - 16, py + 4, 7, 14, K); ret(ctx, cx - 15, py + 5, 5, 12, C.ouro); ret(ctx, cx - 15, py + 5, 5, 1, C.ouro3);
      ret(ctx, cx + 10, py + 4, 7, 14, K); ret(ctx, cx + 11, py + 5, 5, 12, C.ouro); ret(ctx, cx + 11, py + 5, 5, 1, C.ouro3);
      ret(ctx, cx - 11, py + 12, 23, 8, K); ret(ctx, cx - 10, py + 13, 21, 3, '#e060a0'); ret(ctx, cx - 10, py + 16, 21, 3, C.ouro2);
      ret(ctx, cx - 1, py + 15, 3, 1, C.branco);
    } });
  I.objeto('castelo-tapete-real', { w: 3, h: 4, solido: false, semSombra: true, plano: true,
    desenhar: function (ctx, px, py, o) {
      var W = (o.w || 3) * 16, H = (o.h || 4) * 16;
      ret(ctx, px + 4, py, W - 8, H, K); ret(ctx, px + 5, py, W - 10, H, '#c8324a');
      ret(ctx, px + 7, py, 1, H, C.ouro); ret(ctx, px + W - 8, py, 1, H, C.ouro);
      ret(ctx, px + 9, py, W - 18, H, '#d8404e');
      for (var y = py + 6; y < py + H - 4; y += 16) {
        var cx = px + W / 2;
        for (var j = -2; j <= 2; j++) { var m = 2 - Math.abs(j); ret(ctx, cx - m, y + j, m * 2 + 1, 1, C.ouro); }
      }
    } });
  I.objeto('castelo-tapecaria', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 2, py + 4, 28, 2, K); ret(ctx, px + 3, py + 4, 26, 1, C.ouro);
      circulo(ctx, px + 2, py + 5, 1, C.ouro); circulo(ctx, px + 29, py + 5, 1, C.ouro);
      ret(ctx, px + 4, py + 6, 24, 22, K); ret(ctx, px + 5, py + 6, 22, 21, '#7c3a9a'); ret(ctx, px + 5, py + 6, 1, 21, '#a060c0');
      ret(ctx, px + 7, py + 8, 18, 17, C.ouro2); ret(ctx, px + 8, py + 9, 16, 15, C.creme);
      // o plano: título e três linhas com ✓
      ret(ctx, px + 10, py + 11, 12, 2, '#c8324a');
      for (var i = 0; i < 3; i++) {
        ret(ctx, px + 10, py + 15 + i * 3, 2, 2, C.verde); ret(ctx, px + 13, py + 15 + i * 3, 9 - i * 2, 1, '#8a7aa8');
      }
      // franjas
      for (var f = px + 5; f < px + 27; f += 3) ret(ctx, f, py + 27, 1, 3, C.ouro);
    } });
  I.objeto('castelo-brasao', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 6, py + 8, 13, 12, K); triangulo(ctx, cx - 6, py + 20, 13, 7, K);
      ret(ctx, cx - 5, py + 9, 5, 11, '#ff8a3d'); ret(ctx, cx + 1, py + 9, 5, 11, '#8a5cff');
      triangulo(ctx, cx - 5, py + 20, 11, 5, '#8a5cff'); ret(ctx, cx - 5, py + 20, 5, 2, '#ff8a3d');
      medalha(ctx, cx, py + 17, 'ouro');
      ret(ctx, cx - 6, py + 8, 13, 1, C.ouro);
    } });
  I.objeto('castelo-escudo', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var cx = px + 8, c = v(o, 'cor', '#5fb4ff');
      // espadas cruzadas atrás
      for (var i = 0; i < 12; i++) { ret(ctx, cx - 6 + i, py + 8 + i, 1, 1, C.metal2); ret(ctx, cx + 5 - i, py + 8 + i, 1, 1, C.metal2); }
      circulo(ctx, cx, py + 15, 6, K); circulo(ctx, cx, py + 15, 5, c);
      circulo(ctx, cx, py + 15, 3, C.ouro); circulo(ctx, cx, py + 15, 1, C.ouro3);
      ret(ctx, cx - 3, py + 11, 2, 1, C.branco);
    } });
  I.objeto('castelo-armadura', { w: 1, h: 1, topo: 14, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var cx = px + 8, pluma = v(o, 'pluma', '#ff5c6a');
      ret(ctx, cx - 5, py + 12, 11, 3, K); ret(ctx, cx - 4, py + 12, 9, 2, C.madeira2);
      ret(ctx, cx - 3, py + 5, 3, 7, K); ret(ctx, cx + 1, py + 5, 3, 7, K);
      ret(ctx, cx - 2, py + 5, 1, 6, C.metal); ret(ctx, cx + 2, py + 5, 1, 6, C.metal);
      ret(ctx, cx - 5, py - 3, 11, 9, K); ret(ctx, cx - 4, py - 2, 9, 7, C.metal); ret(ctx, cx - 4, py - 2, 2, 7, '#dfe6f0');
      ret(ctx, cx - 7, py - 2, 3, 7, K); ret(ctx, cx + 5, py - 2, 3, 7, K);
      ret(ctx, cx - 6, py - 1, 1, 5, C.metal2); ret(ctx, cx + 6, py - 1, 1, 5, C.metal2);
      ret(ctx, cx - 4, py - 11, 9, 9, K); ret(ctx, cx - 3, py - 10, 7, 7, C.metal); ret(ctx, cx - 3, py - 7, 7, 1, K);
      ret(ctx, cx - 3, py - 10, 2, 3, '#dfe6f0');
      ret(ctx, cx - 1, py - 14, 3, 4, K); ret(ctx, cx, py - 14, 1, 3, pluma);
      ret(ctx, cx, py + 1, 1, 1, C.ouro);
    } });
  I.objeto('castelo-candelabro', { w: 1, h: 1, topo: 12, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 4, py + 12, 9, 3, K); ret(ctx, cx - 3, py + 12, 7, 2, C.ouro2);
      ret(ctx, cx - 1, py - 4, 3, 16, K); ret(ctx, cx, py - 4, 1, 15, C.ouro);
      ret(ctx, cx - 6, py - 5, 13, 3, K); ret(ctx, cx - 5, py - 4, 11, 1, C.ouro);
      [-5, 0, 5].forEach(function (d) { ret(ctx, cx + d - 1, py - 10, 3, 6, K); ret(ctx, cx + d, py - 9, 1, 5, C.creme); });
    },
    anim: function (ctx, px, py, t) {
      var cx = px + 8;
      chama(ctx, cx - 5, py - 10, t, 0); chama(ctx, cx, py - 11, t, 2); chama(ctx, cx + 5, py - 10, t, 4);
      elipse(ctx, cx, py - 12, 7, 4, 'rgba(255,210,120,0.16)');
    } });
  I.objeto('castelo-alvo', { w: 1, h: 1, topo: 8, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8, cy = py + 1;
      ret(ctx, cx - 5, py + 6, 2, 9, K); ret(ctx, cx + 4, py + 6, 2, 9, K); ret(ctx, cx - 1, py + 6, 2, 9, K);
      ret(ctx, cx, py + 6, 1, 8, C.madeira2);
      circulo(ctx, cx, cy, 7, K); circulo(ctx, cx, cy, 6, C.creme); circulo(ctx, cx, cy, 5, C.vermelho);
      circulo(ctx, cx, cy, 3, C.creme); circulo(ctx, cx, cy, 1, C.vermelho);
      // flechinha de espuma no meio
      ret(ctx, cx + 1, cy - 1, 5, 1, C.madeira3); ret(ctx, cx + 5, cy - 2, 1, 3, C.azul);
    } });
  I.objeto('castelo-boneco', { w: 1, h: 1, topo: 12, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8, palha = '#f2cf6a', palha2 = '#c9a040';
      ret(ctx, cx - 4, py + 12, 9, 3, K); ret(ctx, cx - 3, py + 12, 7, 2, C.madeira3);
      ret(ctx, cx - 1, py + 4, 3, 9, K); ret(ctx, cx, py + 4, 1, 8, C.madeira);
      ret(ctx, cx - 8, py - 3, 17, 3, K); ret(ctx, cx - 7, py - 2, 15, 1, palha2);
      ret(ctx, cx - 4, py - 4, 9, 10, K); ret(ctx, cx - 3, py - 3, 7, 8, palha);
      ret(ctx, cx - 3, py, 7, 1, '#c8324a');
      for (var i = 0; i < 3; i++) ret(ctx, cx - 2 + i * 2, py + 2, 1, 3, palha2);
      circulo(ctx, cx, py - 8, 4, K); circulo(ctx, cx, py - 8, 3, palha);
      ret(ctx, cx - 2, py - 9, 1, 1, K); ret(ctx, cx + 2, py - 9, 1, 1, K); ret(ctx, cx - 1, py - 6, 3, 1, palha2);
    } });
  I.objeto('castelo-suporte-espadas', { w: 2, h: 1, topo: 10, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 2, py + 11, 28, 4, K); ret(ctx, px + 3, py + 12, 26, 2, C.madeira2);
      ret(ctx, px + 2, py - 2, 3, 14, K); ret(ctx, px + 27, py - 2, 3, 14, K);
      ret(ctx, px + 3, py - 1, 1, 12, C.madeira); ret(ctx, px + 28, py - 1, 1, 12, C.madeira);
      ret(ctx, px + 2, py + 2, 28, 3, K); ret(ctx, px + 3, py + 3, 26, 1, C.madeiraClara);
      [8, 13, 18, 23].forEach(function (x, i) {
        var lam = i % 2 ? C.madeiraClara : '#e8c890';
        ret(ctx, px + x - 1, py - 9, 3, 18, K); ret(ctx, px + x, py - 8, 1, 12, lam);
        ret(ctx, px + x - 2, py + 4, 5, 2, K); ret(ctx, px + x, py + 6, 1, 3, C.madeira3);
      });
    } });
  I.objeto('castelo-feno', { w: 1, h: 1, topo: 2, solido: true,
    desenhar: function (ctx, px, py) {
      contornoRet(ctx, px + 1, py - 2, 14, 16, '#f2cf6a');
      ret(ctx, px + 2, py - 1, 12, 1, '#fff0a8');
      for (var i = 0; i < 5; i++) ret(ctx, px + 3 + i * 2, py + 1 + (i % 2) * 3, 1, 4, '#c9a040');
      ret(ctx, px + 1, py + 3, 14, 1, '#b0306a'); ret(ctx, px + 1, py + 9, 14, 1, '#b0306a');
    } });
  I.objeto('castelo-ampulheta', { w: 1, h: 1, topo: 8, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 6, py + 4, 13, 4, K); ret(ctx, cx - 5, py + 5, 11, 2, C.madeira); ret(ctx, cx - 5, py + 5, 11, 1, C.madeiraClara);
      ret(ctx, cx - 5, py + 8, 2, 7, K); ret(ctx, cx + 4, py + 8, 2, 7, K);
      ret(ctx, cx - 5, py - 9, 11, 2, K); ret(ctx, cx - 5, py + 2, 11, 2, K);
      ret(ctx, cx - 4, py - 9, 9, 1, C.ouro); ret(ctx, cx - 4, py + 3, 9, 1, C.ouro);
      matriz(ctx, cx - 4, py - 7, ['kvvvvvvvk', '.kaaaaak.', '..kaaak..', '...kak...', '..kvavk..', '.kvaaavk.', 'kaaaaaaak', 'kaaaaaaak', 'kkkkkkkkk'],
        { k: K, v: C.vidro, a: '#f2cf6a' });
    } });
  I.objeto('castelo-pergaminhos', { w: 1, h: 1, topo: 6, solido: true,
    desenhar: function (ctx, px, py) {
      contornoRet(ctx, px + 2, py + 4, 12, 10, '#c9733a');
      ret(ctx, px + 3, py + 6, 10, 1, '#a0562a');
      [[4, -4, 0], [7, -6, 1], [10, -3, 0]].forEach(function (p) {
        ret(ctx, px + p[0] - 1, py + p[1], 4, 10, K); ret(ctx, px + p[0], py + p[1] + 1, 2, 8, C.creme);
        ret(ctx, px + p[0], py + p[1] + 3, 2, 1, p[2] ? C.vermelho : '#8a7aa8');
      });
    } });
  I.objeto('castelo-mapa-antigo', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 2, py + 7, 28, 19, K); ret(ctx, px + 3, py + 8, 26, 17, '#f0dca8');
      ret(ctx, px + 1, py + 6, 3, 21, K); ret(ctx, px + 28, py + 6, 3, 21, K);
      ret(ctx, px + 2, py + 7, 1, 19, '#c9a060'); ret(ctx, px + 29, py + 7, 1, 19, '#c9a060');
      // ilhas, rio, caminho pontilhado e o X do tesouro
      matriz(ctx, px + 5, py + 10, ['..gggg....', '.gggggg...', 'gggggggg..', '.gggggg...', '..ggg.....'], { g: '#9ac070' });
      matriz(ctx, px + 17, py + 15, ['..ggg', '.gggg', 'ggggg', '.ggg.'], { g: '#9ac070' });
      for (var i = 0; i < 6; i++) ret(ctx, px + 11 + i * 2, py + 13 + (i % 2), 1, 1, '#a0562a');
      ret(ctx, px + 13, py + 20, 3, 1, C.azul); ret(ctx, px + 15, py + 21, 4, 1, C.azul);
      ret(ctx, px + 23, py + 11, 1, 1, C.vermelho); ret(ctx, px + 25, py + 11, 1, 1, C.vermelho);
      ret(ctx, px + 24, py + 12, 1, 1, C.vermelho); ret(ctx, px + 23, py + 13, 1, 1, C.vermelho); ret(ctx, px + 25, py + 13, 1, 1, C.vermelho);
      circulo(ctx, px + 7, py + 21, 2, '#a0562a'); ret(ctx, px + 7, py + 19, 1, 5, '#f0dca8'); ret(ctx, px + 5, py + 21, 5, 1, '#f0dca8');
    } });
  I.objeto('castelo-bandeirolas', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      var cores = ['#c8324a', '#ffffff', '#2f6fd6', '#ffd34d', '#c8324a', '#ffffff'];
      for (var fio = 0; fio < 2; fio++) {
        var y0 = py + 8 + fio * 10;
        for (var x = px + 1; x < px + 31; x++) ret(ctx, x, y0 + Math.round(Math.sin((x - px) / 30 * Math.PI) * 2), 1, 1, K);
        for (var i = 0; i < 5; i++) {
          var bx = px + 3 + i * 6, by = y0 + Math.round(Math.sin((bx - px) / 30 * Math.PI) * 2) + 1;
          triangulo(ctx, bx, by, 5, 5, K);
          triangulo(ctx, bx + 1, by, 3, 3, cores[(i + fio * 3) % cores.length]);
        }
      }
    } });
  I.objeto('castelo-cartaz-ingles', { w: 1, h: 1, topo: 12, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 5, py + 2, 2, 13, K); ret(ctx, cx + 4, py + 2, 2, 13, K);
      ret(ctx, cx - 4, py + 3, 1, 11, C.madeira); ret(ctx, cx + 5, py + 3, 1, 11, C.madeira);
      ret(ctx, cx - 7, py - 12, 15, 14, K); ret(ctx, cx - 6, py - 11, 13, 12, C.creme);
      ret(ctx, cx - 6, py - 11, 13, 3, '#2f6fd6'); ret(ctx, cx - 6, py - 10, 13, 1, C.branco);
      // "HI!" em letrinhas de pixel
      matriz(ctx, cx - 5, py - 6, ['r.r.bbb.g', 'r.r..b..g', 'rrr..b..g', 'r.r..b...', 'r.r.bbb.g'], { r: '#c8324a', b: '#2f6fd6', g: C.verde });
    } });

  /* ---------- ala de Português: letras, livro aberto, receita (verde e vermelho da Casa das Palavras) ---------- */
  var PT_VERDE = '#39a860', PT_VERMELHO = '#e0433f';
  // letrinhas 3×5 das palavras do quadro
  var LETRAS_PT = {
    C: ['.xx', 'x..', 'x..', 'x..', '.xx'], H: ['x.x', 'x.x', 'xxx', 'x.x', 'x.x'],
    L: ['x..', 'x..', 'x..', 'x..', 'xxx'], N: ['x.x', 'xxx', 'xxx', 'x.x', 'x.x'],
    A: ['.x.', 'x.x', 'xxx', 'x.x', 'x.x'], B: ['xx.', 'x.x', 'xx.', 'x.x', 'xx.'],
  };
  function letras(ctx, texto, x, y, cor) {
    for (var i = 0; i < texto.length; i++) if (LETRAS_PT[texto[i]]) matriz(ctx, x + i * 4, y, LETRAS_PT[texto[i]], { x: cor });
  }
  // quadro-verde de giz com CH, LH e NH (moldura de madeira e bandeja de giz)
  I.objeto('castelo-quadro-palavras', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 6, 30, 21, K); ret(ctx, px + 2, py + 7, 28, 19, C.madeira);
      ret(ctx, px + 4, py + 9, 24, 14, '#2e6b45'); ret(ctx, px + 4, py + 9, 24, 1, '#3f8a5a');
      letras(ctx, 'CH', px + 6, py + 11, C.branco);
      letras(ctx, 'LH', px + 17, py + 11, C.ouro3);
      letras(ctx, 'NH', px + 11, py + 17, '#ffd0d6');
      // bandeja com giz e apagador
      ret(ctx, px + 3, py + 23, 26, 2, C.madeira3);
      ret(ctx, px + 7, py + 22, 3, 1, C.branco); ret(ctx, px + 12, py + 22, 2, 1, '#ffb0b8');
      ret(ctx, px + 21, py + 21, 5, 2, K); ret(ctx, px + 22, py + 21, 3, 1, C.ouro);
    } });
  // livro aberto num atril de madeira
  I.objeto('castelo-livro-aberto', { w: 1, h: 1, topo: 8, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 4, py + 12, 9, 3, K); ret(ctx, cx - 3, py + 12, 7, 2, C.madeira2);
      ret(ctx, cx - 1, py + 1, 3, 12, K); ret(ctx, cx, py + 1, 1, 11, C.madeira);
      // tampo inclinado
      ret(ctx, cx - 7, py - 2, 15, 4, K); ret(ctx, cx - 6, py - 1, 13, 2, C.madeira3);
      // páginas abertas
      ret(ctx, cx - 7, py - 8, 15, 7, K);
      ret(ctx, cx - 6, py - 7, 6, 5, C.creme); ret(ctx, cx + 1, py - 7, 6, 5, C.creme);
      ret(ctx, cx, py - 7, 1, 5, PT_VERMELHO);
      for (var i = 0; i < 2; i++) { ret(ctx, cx - 5, py - 6 + i * 2, 4, 1, '#8a7aa8'); ret(ctx, cx + 2, py - 6 + i * 2, 4, 1, '#8a7aa8'); }
      ret(ctx, cx + 2, py - 7, 1, 1, PT_VERDE);
      // fitinha marcadora
      ret(ctx, cx, py - 2, 1, 3, PT_VERMELHO);
    } });
  // cubinhos de letras empilhados (A, B, C)
  I.objeto('castelo-blocos-letras', { w: 1, h: 1, topo: 6, solido: true,
    desenhar: function (ctx, px, py) {
      function cubo(x, y, c, l) {
        ret(ctx, x, y, 7, 7, K); ret(ctx, x + 1, y + 1, 5, 5, c); ret(ctx, x + 1, y + 1, 5, 1, D.clarear(c, 0.35));
        matriz(ctx, x + 2, y + 1, LETRAS_PT[l], { x: C.branco });
      }
      cubo(px + 1, py + 7, PT_VERMELHO, 'A'); cubo(px + 8, py + 7, PT_VERDE, 'B'); cubo(px + 4, py + 1, C.ouro2, 'C');
    } });
  // cavalete com a receita da salada de frutas (morango e as linhas dos ingredientes)
  I.objeto('castelo-cavalete-receita', { w: 1, h: 1, topo: 12, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 6, py + 2, 2, 13, K); ret(ctx, cx + 5, py + 2, 2, 13, K); ret(ctx, cx - 1, py + 4, 2, 9, K);
      ret(ctx, cx - 5, py + 3, 1, 11, C.madeira); ret(ctx, cx + 6, py + 3, 1, 11, C.madeira);
      ret(ctx, cx - 7, py - 12, 15, 15, K); ret(ctx, cx - 6, py - 11, 13, 13, C.creme);
      ret(ctx, cx - 6, py - 11, 13, 2, PT_VERDE);
      // morango
      circulo(ctx, cx - 3, py - 5, 2, PT_VERMELHO); ret(ctx, cx - 4, py - 8, 3, 1, PT_VERDE);
      ret(ctx, cx - 3, py - 5, 1, 1, C.ouro3);
      // ingredientes com tracinhos
      for (var i = 0; i < 3; i++) { ret(ctx, cx + 1, py - 7 + i * 3, 1, 1, PT_VERMELHO); ret(ctx, cx + 3, py - 7 + i * 3, 3 - (i % 2), 1, '#8a7aa8'); }
      ret(ctx, cx - 5, py - 1, 11, 1, '#8a7aa8');
    } });

  // para as outras partes (R._predios.castelo)
  S.matriz = matriz; S.medalha = medalha; S.PT_VERMELHO = PT_VERMELHO;
})();
