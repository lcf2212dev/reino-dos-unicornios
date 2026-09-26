/* Casa das Palavras, parte 1 de 6: as cores da casa, as letrinhas 3×5, as miudezas desenhadas e os
   objetos do Hall e da Cozinha das Receitas (prefixo portugues-).
   O que as outras partes usam fica em Reino._predios.portugues (ver o fim do arquivo). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var clarear = D.clarear, escurecer = D.escurecer;
  var K = R.Desenho.K;
  var F = (R.FALAS_INTERIORES && R.FALAS_INTERIORES.portugues) || { npcs: {}, objetos: {} };
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};
  // o que as partes do prédio compartilham (criado aqui; cada parte põe o seu no fim do arquivo)
  var S = (R._predios = R._predios || {}).portugues = {};
  // cores da casa: parede creme, telhado vermelho e o verde dos detalhes
  var CREME = '#fff4ec', VERM = '#e0433f', VERM2 = '#b82e35', VERDE = '#39a860', VERDE2 = '#2a7d48', VERDE3 = '#8fd08f';
  var MORANGO = '#ff4f6a', MORANGO2 = '#c9304a', BANANA = '#ffe066', LARANJA = '#ff9d2e', UVA = '#9b6bd6', KIWI = '#9fd65a';
  var GELO = '#eaf8ff', GELO2 = '#bfe4f5', GELO3 = '#8cc8e6', MAR = '#3f9ad6', MAR2 = '#2f78b8', MAR3 = '#8fd0f5';
  var TERRA = '#8a5a3a', TERRA2 = '#6b4428', FOLHA = '#5fb85a', FOLHA2 = '#3f9a45';

  function v(o, k, padrao) { return (o && o.var && o.var[k] !== undefined) ? o.var[k] : padrao; }
  var brilho = R.Desenho.brilho;   // brilho em cruz (aqui sempre com a cor)

  /* ---------- letrinhas 3×5 (placas, blocos, amarelinha) ---------- */
  var FONTE = {
    A: ['.#.', '#.#', '###', '#.#', '#.#'], B: ['##.', '#.#', '##.', '#.#', '##.'], C: ['.##', '#..', '#..', '#..', '.##'],
    D: ['##.', '#.#', '#.#', '#.#', '##.'], E: ['###', '#..', '##.', '#..', '###'], F: ['###', '#..', '##.', '#..', '#..'],
    G: ['.##', '#..', '#.#', '#.#', '.##'], H: ['#.#', '#.#', '###', '#.#', '#.#'], I: ['###', '.#.', '.#.', '.#.', '###'],
    L: ['#..', '#..', '#..', '#..', '###'], M: ['#.#', '###', '###', '#.#', '#.#'], N: ['##.', '#.#', '#.#', '#.#', '#.#'],
    O: ['.#.', '#.#', '#.#', '#.#', '.#.'], P: ['##.', '#.#', '##.', '#..', '#..'], Q: ['.#.', '#.#', '#.#', '.#.', '..#'],
    R: ['##.', '#.#', '##.', '#.#', '#.#'], S: ['.##', '#..', '.#.', '..#', '##.'], T: ['###', '.#.', '.#.', '.#.', '.#.'],
    U: ['#.#', '#.#', '#.#', '#.#', '.#.'], V: ['#.#', '#.#', '#.#', '.#.', '.#.'], X: ['#.#', '#.#', '.#.', '#.#', '#.#'],
    Z: ['###', '..#', '.#.', '#..', '###'], a: ['##.', '..#', '.##', '#.#', '.##'],
  };
  function letra(ctx, ch, x, y, cor) {
    var m = FONTE[ch];
    if (!m) return;
    for (var j = 0; j < 5; j++) for (var i = 0; i < 3; i++) if (m[j][i] === '#') ret(ctx, x + i, y + j, 1, 1, cor);
  }
  // "a" minúsculo de fôrma em 4×5 (o mesmo do livro do telhado): tampinha, barriga redonda e a perninha
  var A_MINUSCULO = ['.##.', '...#', '.###', '#..#', '.###'];
  function aMinusculo(ctx, x, y, cor) { D.matriz(ctx, x, y, A_MINUSCULO, { '#': cor }); }
  function palavra(ctx, txt, x, y, cor) { for (var i = 0; i < txt.length; i++) letra(ctx, txt[i], x + i * 4, y, cor); }

  /* ---------- miudezas da casa ---------- */
  function morango(ctx, x, y) {
    ret(ctx, x, y, 4, 3, MORANGO); ret(ctx, x + 1, y + 3, 2, 1, MORANGO); ret(ctx, x + 1, y + 1, 1, 1, '#ffd0d8');
    ret(ctx, x + 1, y - 1, 2, 1, FOLHA); ret(ctx, x, y - 1, 1, 1, FOLHA2); ret(ctx, x + 3, y - 1, 1, 1, FOLHA2);
  }
  function livrinho(ctx, x, yb, w, h, cor) {
    ret(ctx, x, yb - h, w, h, K); ret(ctx, x + 1, yb - h + 1, w - 2, h - 2, cor);
    ret(ctx, x + 1, yb - h + 2, w - 2, 1, clarear(cor, 0.5));
  }
  function ovo(ctx, cx, cy, cor) { elipse(ctx, cx, cy, 2, 3, K); elipse(ctx, cx, cy, 1, 2, cor || C.creme); ret(ctx, cx - 1, cy - 1, 1, 1, C.branco); }
  function nuvemNeve(ctx, x, y, w) { ret(ctx, x, y, w, 2, C.branco); ret(ctx, x + 1, y - 1, w - 2, 1, C.branco); }
  // mesinha redonda de pé único (base em py+15), tampo em ty
  function mesinha(ctx, cx, py, ty, tampo) {
    ret(ctx, cx - 5, py + 13, 11, 2, K); ret(ctx, cx - 4, py + 13, 9, 1, C.madeira2);
    ret(ctx, cx - 1, ty + 3, 3, py + 13 - ty - 3, K); ret(ctx, cx, ty + 3, 1, py + 13 - ty - 3, C.madeira);
    ret(ctx, cx - 7, ty, 15, 4, K); ret(ctx, cx - 6, ty + 1, 13, 2, tampo || C.madeiraClara); ret(ctx, cx - 6, ty + 1, 13, 1, clarear(tampo || C.madeiraClara, 0.4));
  }
  // toquinho de árvore (base em py+15), topo em ty
  function toco(ctx, cx, py, ty) {
    ret(ctx, cx - 6, ty, 13, py + 15 - ty, K); ret(ctx, cx - 5, ty + 2, 11, py + 13 - ty - 1, C.madeira2);
    for (var y = ty + 4; y < py + 13; y += 3) ret(ctx, cx - 3 + (y % 2), y, 1, 2, C.madeira3);
    elipse(ctx, cx, ty + 1, 6, 2, K); elipse(ctx, cx, ty + 1, 5, 1, C.madeiraClara); ret(ctx, cx - 2, ty + 1, 5, 1, '#f3c890');
  }

  /* ================= HALL ================= */
  I.objeto('portugues-pulpito', { w: 1, h: 1, topo: 12, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 6, py + 11, 13, 4, K); ret(ctx, cx - 5, py + 12, 11, 2, VERDE2);
      ret(ctx, cx - 3, py - 2, 7, 14, K); ret(ctx, cx - 2, py - 2, 5, 13, VERDE); ret(ctx, cx - 2, py - 2, 1, 13, VERDE3);
      ret(ctx, cx - 1, py + 3, 3, 3, C.ouro);
      ret(ctx, cx - 8, py - 7, 17, 6, K); ret(ctx, cx - 7, py - 6, 15, 4, C.madeira2); ret(ctx, cx - 7, py - 6, 15, 1, C.madeiraClara);
      // o Livro das Letras aberto: "Aa" de um lado, linhas do outro
      ret(ctx, cx - 7, py - 13, 15, 7, K);
      ret(ctx, cx - 6, py - 12, 6, 5, C.creme); ret(ctx, cx + 1, py - 12, 6, 5, C.creme);
      ret(ctx, cx, py - 12, 1, 6, VERDE);
      letra(ctx, 'A', cx - 6, py - 12, VERM); ret(ctx, cx - 2, py - 10, 1, 1, VERM); ret(ctx, cx - 3, py - 9, 2, 1, VERM);
      ret(ctx, cx + 2, py - 11, 4, 1, '#c8b8d8'); ret(ctx, cx + 2, py - 9, 3, 1, '#c8b8d8');
      ret(ctx, cx, py - 6, 1, 3, VERM);
    },
    anim: function (ctx, px, py, t) {
      var f = Math.floor(t / 260) % 8;
      if (f < 3) brilho(ctx, px + 3 + f * 5, py - 16 - f, C.ouro3);
    } });
  I.objeto('portugues-dicionario', { w: 1, h: 1, topo: 12, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      // suporte em X
      for (var j = 0; j < 12; j++) { ret(ctx, cx - 5 + Math.round(j / 2), py + 3 + j, 2, 1, C.madeira3); ret(ctx, cx + 4 - Math.round(j / 2), py + 3 + j, 2, 1, C.madeira3); }
      // dicionário gordo, fechado, com o A-Z na capa
      ret(ctx, cx - 7, py - 10, 15, 14, K); ret(ctx, cx - 6, py - 9, 13, 12, '#c9365a'); ret(ctx, cx - 6, py - 9, 2, 12, '#e8607a');
      ret(ctx, cx - 6, py + 1, 13, 2, C.creme); ret(ctx, cx - 5, py + 2, 11, 1, '#e8dcc8');
      ret(ctx, cx - 3, py - 8, 9, 7, C.ouro); letra(ctx, 'A', cx - 2, py - 7, K); letra(ctx, 'Z', cx + 2, py - 7, K);
      ret(ctx, cx - 3, py - 1, 9, 1, C.ouro2);
    } });
  I.objeto('portugues-mapa', { w: 2, h: 1, topo: 14, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 4, py, 3, 15, K); ret(ctx, px + 25, py, 3, 15, K);
      ret(ctx, px + 5, py, 1, 14, C.madeira); ret(ctx, px + 26, py, 1, 14, C.madeira);
      contornoRet(ctx, px + 1, py - 14, 30, 16, VERDE2);
      ret(ctx, px + 3, py - 12, 26, 12, C.creme);
      // a planta da casa: 3 cômodos em cima, 3 embaixo (hall no meio de baixo)
      var cores = ['#ffd34d', '#8fd0f5', '#8fe0a0', '#ff9cc6', '#fff4ec', '#9fe0a0'];
      var icone = [LARANJA, GELO, '#ff6b8a', MORANGO, VERDE, FOLHA2];
      for (var i = 0; i < 6; i++) {
        var x = px + 4 + (i % 3) * 8, y = py - 11 + Math.floor(i / 3) * 5;
        ret(ctx, x, y, 7, 4, K); ret(ctx, x + 1, y + 1, 5, 2, cores[i]); ret(ctx, x + 3, y + 1, 1, 2, icone[i]);
      }
      ret(ctx, px + 15, py - 3, 2, 2, VERM);   // "você está aqui"
      ret(ctx, px + 1, py - 15, 30, 2, K); ret(ctx, px + 2, py - 14, 28, 1, C.ouro);
    } });
  I.objeto('portugues-blocos', { w: 1, h: 1, topo: 6, solido: true,
    desenhar: function (ctx, px, py) {
      function bloco(x, y, ch, cor) {
        ret(ctx, x, y, 8, 8, K); ret(ctx, x + 1, y + 1, 6, 6, cor); ret(ctx, x + 1, y + 1, 6, 1, clarear(cor, 0.45));
        letra(ctx, ch, x + 3 - 1, y + 2, C.branco);
      }
      bloco(px, py + 6, 'A', '#ff6b8a'); bloco(px + 8, py + 6, 'B', '#5fb4ff'); bloco(px + 4, py - 1, 'C', VERDE);
    } });
  I.objeto('portugues-varal', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var W = (o.w || 2) * 16, txt = v(o, 'letras', 'ABCDE');
      var cores = ['#ff6b8a', '#ffd34d', '#5fb4ff', VERDE, '#b58cff', LARANJA];
      for (var x = 0; x < W; x++) ret(ctx, px + x, py + 8 + Math.round(Math.sin(x / W * Math.PI) * 3), 1, 1, K);
      var passo = Math.floor((W - 2) / txt.length);
      for (var i = 0; i < txt.length; i++) {
        var cx = px + 2 + i * passo, cy = py + 9 + Math.round(Math.sin((cx - px + 3) / W * Math.PI) * 3);
        ret(ctx, cx, cy, 7, 9, K); ret(ctx, cx + 1, cy + 1, 5, 7, C.creme);
        ret(ctx, cx + 3, cy - 1, 1, 2, cores[i % cores.length]);
        letra(ctx, txt[i], cx + 2, cy + 2, cores[i % cores.length]);
      }
    } });
  I.objeto('portugues-cartaz-aa', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var c = v(o, 'cor', VERM);
      contornoRet(ctx, px + 2, py + 7, 12, 18, C.creme);
      ret(ctx, px + 3, py + 8, 10, 3, c);
      letra(ctx, 'A', px + 4, py + 13, c); aMinusculo(ctx, px + 8, py + 13, VERDE);
      ret(ctx, px + 4, py + 20, 8, 1, '#c8b8d8'); ret(ctx, px + 4, py + 22, 6, 1, '#c8b8d8');
      ret(ctx, px + 7, py + 5, 2, 2, K);
    } });
  // tapete de "página de caderno": papel creme, pauta azul, margem vermelha e o "Aa" escrito
  I.objeto('portugues-tapete-caderno', { w: 4, h: 1, solido: false, semSombra: true, plano: true,
    desenhar: function (ctx, px, py, o) {
      var W = (o.w || 4) * 16, x = px + 2, y = py + 1, w = W - 4, h = 14;
      ret(ctx, x + 1, y + h, w, 1, 'rgba(58,36,70,0.18)');
      ret(ctx, x, y, w, h, K); ret(ctx, x + 1, y + 1, w - 2, h - 2, '#fffdf6');
      ret(ctx, x + 1, y + 1, w - 2, 2, '#fbe9ef');
      for (var ly = y + 4; ly < y + h - 1; ly += 3) ret(ctx, x + 1, ly, w - 2, 1, '#9fc8f0');
      ret(ctx, x + 9, y + 1, 1, h - 2, '#ff6b7a');
      // furinhos de fichário na borda
      for (var fx = x + 3; fx < x + 8; fx += 4) ret(ctx, fx, y + 5, 2, 2, '#e8dcc8');
      ret(ctx, x + 3, y + 10, 2, 2, '#e8dcc8');
      // "Aa" e uma palavrinha escrita a lápis
      // (a poltrona fica na frente do meio do tapete: o "Aa" vai à direita dela)
      ret(ctx, x + 11, y + 5, 3, 1, '#6a5a8a'); ret(ctx, x + 11, y + 8, 2, 1, '#6a5a8a');
      letra(ctx, 'A', x + 33, y + 4, VERM); aMinusculo(ctx, x + 37, y + 4, VERDE2);
      ret(ctx, x + 42, y + 7, 7, 1, '#6a5a8a'); ret(ctx, x + 50, y + 7, 5, 1, '#6a5a8a');
      ret(ctx, x + 33, y + 10, 9, 1, '#6a5a8a'); ret(ctx, x + 43, y + 10, 3, 1, '#6a5a8a');
      // lápis largado no canto
      ret(ctx, x + w - 11, y + 10, 8, 3, K); ret(ctx, x + w - 10, y + 11, 5, 1, '#ffd34d'); ret(ctx, x + w - 5, y + 11, 1, 1, '#f3c890');
      ret(ctx, x + w - 12, y + 11, 1, 1, '#ff9cc6');
    } });
  // poltrona de leitura com encosto alto e braços roliços
  I.objeto('portugues-poltrona', { w: 1, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var c = v(o, 'cor', VERM), e = escurecer(c, 0.22), l = clarear(c, 0.35), cx = px + 8;
      // encosto alto e arredondado, com capitonê
      ret(ctx, cx - 6, py - 9, 13, 12, K); ret(ctx, cx - 5, py - 10, 11, 1, K);
      ret(ctx, cx - 5, py - 9, 11, 11, c); ret(ctx, cx - 4, py - 9, 9, 1, l);
      ret(ctx, cx - 2, py - 6, 1, 1, e); ret(ctx, cx + 2, py - 6, 1, 1, e); ret(ctx, cx, py - 3, 1, 1, e);
      // assento
      ret(ctx, cx - 6, py + 2, 13, 7, K); ret(ctx, cx - 5, py + 3, 11, 5, l); ret(ctx, cx - 5, py + 6, 11, 2, c);
      // braços roliços dos dois lados
      [cx - 8, cx + 5].forEach(function (bx) {
        ret(ctx, bx, py - 2, 4, 11, K); ret(ctx, bx + 1, py - 1, 2, 9, e); ret(ctx, bx + 1, py - 1, 2, 1, l);
        ret(ctx, bx - 0, py - 3, 4, 2, K); ret(ctx, bx + 1, py - 2, 2, 1, l);
      });
      // saia com babado e pezinhos de madeira
      ret(ctx, cx - 8, py + 9, 17, 3, K); ret(ctx, cx - 7, py + 9, 15, 2, e);
      for (var b = cx - 7; b < cx + 8; b += 3) ret(ctx, b, py + 10, 1, 1, l);
      ret(ctx, cx - 7, py + 12, 2, 3, K); ret(ctx, cx + 6, py + 12, 2, 3, K);
      ret(ctx, cx - 7, py + 12, 1, 2, C.madeira); ret(ctx, cx + 6, py + 12, 1, 2, C.madeira);
      // almofadinha com o "A"
      ret(ctx, cx - 3, py - 1, 7, 5, K); ret(ctx, cx - 2, py, 5, 3, C.creme); ret(ctx, cx, py, 1, 3, VERDE);
    } });

  /* ================= COZINHA DAS RECEITAS ================= */
  I.objeto('portugues-fogao', { w: 2, h: 1, topo: 14, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      // fogão branco com forno e panelão de sopa
      ret(ctx, px + 1, py - 4, 30, 19, K); ret(ctx, px + 2, py - 3, 28, 17, '#f4f2fa'); ret(ctx, px + 2, py - 3, 28, 2, '#ffffff');
      ret(ctx, px + 5, py + 2, 22, 10, K); ret(ctx, px + 6, py + 3, 20, 8, '#5a4a6a'); ret(ctx, px + 7, py + 4, 18, 2, '#ff9d2e');
      ret(ctx, px + 6, py + 3, 20, 1, '#8a7aa8'); ret(ctx, px + 9, py + 1, 14, 1, C.metal2);
      [7, 13, 19, 25].forEach(function (x) { ret(ctx, px + x - 1, py - 2, 3, 2, K); ret(ctx, px + x, py - 2, 1, 1, VERM); });
      // panela
      ret(ctx, px + 5, py - 13, 14, 10, K); ret(ctx, px + 6, py - 12, 12, 8, VERM); ret(ctx, px + 6, py - 12, 12, 1, '#ff8a8a');
      ret(ctx, px + 3, py - 11, 3, 2, K); ret(ctx, px + 18, py - 11, 3, 2, K);
      ret(ctx, px + 6, py - 14, 12, 2, K); ret(ctx, px + 7, py - 14, 10, 1, '#ff8a8a');
      // frigideira com ovo
      ret(ctx, px + 20, py - 7, 10, 3, K); ret(ctx, px + 21, py - 7, 8, 2, '#5a5a6a'); ret(ctx, px + 29, py - 6, 3, 1, K);
      ret(ctx, px + 23, py - 8, 4, 2, C.branco); ret(ctx, px + 24, py - 8, 2, 1, BANANA);
    },
    anim: function (ctx, px, py, t) {
      for (var i = 0; i < 3; i++) {
        var f = ((t / 900) + i / 3) % 1, x = px + 9 + i * 3 + Math.round(Math.sin(f * 6 + i) * 1.5), y = py - 16 - Math.round(f * 12);
        ctx.fillStyle = 'rgba(255,255,255,' + (0.8 * (1 - f)).toFixed(2) + ')'; ctx.fillRect(x, y, 2, 2);
      }
    } });
  I.objeto('portugues-bancada', { w: 2, h: 1, topo: 8, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py - 3, 30, 18, K); ret(ctx, px + 2, py - 2, 28, 16, C.madeira); ret(ctx, px + 2, py - 2, 28, 3, C.madeiraClara);
      ret(ctx, px + 4, py + 3, 11, 9, C.madeira2); ret(ctx, px + 17, py + 3, 11, 9, C.madeira2);
      ret(ctx, px + 13, py + 7, 2, 1, C.ouro); ret(ctx, px + 17, py + 7, 2, 1, C.ouro);
      // tábua com morangos, faca e bananas
      ret(ctx, px + 3, py - 6, 13, 4, K); ret(ctx, px + 4, py - 5, 11, 2, '#f3c890');
      morango(ctx, px + 5, py - 9); morango(ctx, px + 10, py - 8);
      ret(ctx, px + 18, py - 7, 9, 3, K); ret(ctx, px + 19, py - 6, 7, 1, BANANA); ret(ctx, px + 19, py - 7, 7, 1, '#fff3a0');
      ret(ctx, px + 20, py - 9, 8, 2, K); ret(ctx, px + 21, py - 9, 6, 1, BANANA);
    } });
  I.objeto('portugues-salada', { w: 1, h: 1, topo: 12, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      mesinha(ctx, cx, py, py + 1, '#ffc2d8');
      // tigelona de vidro transbordando de salada de frutas, com a colher de pau
      ret(ctx, cx - 8, py - 6, 17, 3, K); ret(ctx, cx - 7, py - 3, 15, 3, K); ret(ctx, cx - 5, py, 11, 2, K);
      ret(ctx, cx - 7, py - 5, 15, 2, '#dff4ff'); ret(ctx, cx - 6, py - 3, 13, 2, '#dff4ff'); ret(ctx, cx - 4, py - 1, 9, 2, '#c8e8f8');
      ret(ctx, cx - 6, py - 5, 1, 3, C.branco); ret(ctx, cx - 5, py - 2, 1, 1, C.branco);
      ret(ctx, cx - 5, py - 4, 3, 1, MORANGO); ret(ctx, cx - 1, py - 3, 2, 1, KIWI); ret(ctx, cx + 3, py - 4, 3, 1, LARANJA);
      // frutas por cima (montinho)
      ret(ctx, cx - 7, py - 8, 15, 3, K); ret(ctx, cx - 5, py - 10, 11, 2, K);
      ret(ctx, cx - 6, py - 8, 3, 2, MORANGO); ret(ctx, cx - 3, py - 9, 3, 2, BANANA); ret(ctx, cx, py - 8, 2, 2, KIWI);
      ret(ctx, cx + 2, py - 9, 3, 2, LARANJA); ret(ctx, cx + 5, py - 8, 2, 2, UVA); ret(ctx, cx - 1, py - 10, 2, 1, UVA);
      ret(ctx, cx - 4, py - 10, 2, 1, MORANGO); ret(ctx, cx + 3, py - 10, 2, 1, KIWI); ret(ctx, cx - 5, py - 9, 1, 1, '#ffd0d8');
      // colher de pau espetada na salada
      ret(ctx, cx + 3, py - 16, 3, 3, K); ret(ctx, cx + 4, py - 15, 1, 1, C.madeiraClara);
      for (var i = 0; i < 4; i++) { ret(ctx, cx + 4 + i, py - 14 + i, 2, 2, K); }
      for (var j = 0; j < 4; j++) ret(ctx, cx + 4 + j, py - 13 + j, 1, 1, C.madeira);
      ret(ctx, cx + 2, py - 18, 4, 3, K); ret(ctx, cx + 3, py - 17, 2, 1, C.madeiraClara);
    } });
  // mesa de preparo: tábua com massa, rolo de macarrão, tigela de farinha e ovos
  I.objeto('portugues-mesa-preparo', { w: 2, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py - 1, 30, 6, K); ret(ctx, px + 2, py, 28, 4, C.madeiraClara); ret(ctx, px + 2, py + 3, 28, 1, C.madeira);
      ret(ctx, px + 3, py + 5, 3, 10, K); ret(ctx, px + 26, py + 5, 3, 10, K); ret(ctx, px + 4, py + 5, 1, 9, C.madeira);  ret(ctx, px + 27, py + 5, 1, 9, C.madeira);
      ret(ctx, px + 5, py + 10, 22, 2, K); ret(ctx, px + 6, py + 10, 20, 1, C.madeira2);
      ret(ctx, px + 8, py + 12, 16, 1, 'rgba(58,36,70,0.25)');
      // tábua com a massa de biscoito e as forminhas de coração e estrela
      ret(ctx, px + 3, py - 3, 15, 4, K); ret(ctx, px + 4, py - 2, 13, 2, '#f3c890');
      elipse(ctx, px + 9, py - 3, 4, 1, '#fff0d8'); ret(ctx, px + 13, py - 3, 2, 1, '#ff7eb6'); ret(ctx, px + 15, py - 4, 1, 1, '#ffd34d');
      // rolo de macarrão
      ret(ctx, px + 3, py - 6, 14, 3, K); ret(ctx, px + 5, py - 5, 10, 1, C.madeiraClara); ret(ctx, px + 4, py - 5, 1, 1, C.madeira); ret(ctx, px + 15, py - 5, 1, 1, C.madeira);
      // tigela de farinha com a colher
      ret(ctx, px + 19, py - 6, 10, 6, K); ret(ctx, px + 20, py - 5, 8, 4, '#9fd0ff'); ret(ctx, px + 20, py - 6, 8, 1, C.branco); ret(ctx, px + 21, py - 7, 6, 1, C.branco);
      ret(ctx, px + 26, py - 11, 1, 5, C.madeira3);
      // dois ovos e farinha espalhada
      ovo(ctx, px + 22, py + 1, C.creme); ret(ctx, px + 27, py, 2, 1, C.branco); ret(ctx, px + 7, py + 1, 3, 1, C.branco);
    } });
  I.objeto('portugues-liquidificador', { w: 1, h: 1, topo: 14, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      mesinha(ctx, cx, py, py + 1, '#9fe0a0');
      // base e copo com o suco de morango
      ret(ctx, cx - 4, py - 4, 9, 6, K); ret(ctx, cx - 3, py - 3, 7, 4, '#f4f2fa'); ret(ctx, cx - 1, py - 2, 3, 2, VERM);
      ret(ctx, cx - 4, py - 16, 9, 13, K); ret(ctx, cx - 3, py - 15, 7, 11, '#eaf8ff');
      ret(ctx, cx - 3, py - 11, 7, 7, '#ff7e9a'); ret(ctx, cx - 3, py - 11, 7, 1, '#ffc2d0');
      ret(ctx, cx - 2, py - 9, 1, 1, '#ffd0d8'); ret(ctx, cx + 1, py - 7, 1, 1, '#ffd0d8');
      ret(ctx, cx - 3, py - 15, 1, 10, C.branco);
      ret(ctx, cx - 5, py - 18, 11, 3, K); ret(ctx, cx - 4, py - 17, 9, 1, '#5a4a6a');
      morango(ctx, cx + 5, py - 2);
    } });
  I.objeto('portugues-caneca-bolo', { w: 1, h: 1, topo: 8, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      mesinha(ctx, cx, py, py + 2, '#ffe28a');
      // caneca com o bolo crescendo por cima
      ret(ctx, cx - 5, py - 7, 9, 10, K); ret(ctx, cx - 4, py - 6, 7, 8, '#5fb4ff'); ret(ctx, cx - 4, py - 6, 1, 8, '#9fdcff');
      ret(ctx, cx + 4, py - 5, 3, 6, K); ret(ctx, cx + 4, py - 4, 2, 4, '#5fb4ff'); ret(ctx, cx + 4, py - 3, 1, 2, K);
      ret(ctx, cx - 1, py - 3, 2, 2, C.branco);
      elipse(ctx, cx - 1, py - 8, 6, 3, K); elipse(ctx, cx - 1, py - 8, 5, 2, '#8a5a3a');
      ret(ctx, cx - 3, py - 10, 2, 1, '#b07a4a'); ret(ctx, cx + 1, py - 9, 2, 1, '#b07a4a');
      ret(ctx, cx - 1, py - 12, 1, 1, MORANGO); ret(ctx, cx - 2, py - 11, 3, 1, MORANGO);
    } });
  I.objeto('portugues-abacaxi', { w: 1, h: 1, topo: 14, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      // caixote de feira
      ret(ctx, px + 1, py + 3, 14, 12, K); ret(ctx, px + 2, py + 4, 12, 10, C.madeiraClara);
      ret(ctx, px + 2, py + 8, 12, 1, C.madeira); ret(ctx, px + 2, py + 11, 12, 1, C.madeira);
      // abacaxi grandão
      elipse(ctx, cx, py - 2, 6, 7, K); elipse(ctx, cx, py - 2, 5, 6, '#ffc234');
      for (var j = -7; j <= 3; j += 3) for (var i = -4; i <= 4; i += 3) ret(ctx, cx + i + ((j + 7) % 2), py + j, 1, 1, '#c98a1a');
      ret(ctx, cx - 3, py - 6, 1, 3, '#ffe28a');
      // coroa de folhas
      triangulo(ctx, cx - 5, py - 15, 11, 7, K); triangulo(ctx, cx - 4, py - 14, 9, 5, FOLHA);
      ret(ctx, cx, py - 16, 1, 6, FOLHA2); ret(ctx, cx - 3, py - 13, 1, 3, FOLHA2); ret(ctx, cx + 3, py - 13, 1, 3, FOLHA2);
    } });
  I.objeto('portugues-geladeira', { w: 1, h: 1, topo: 18, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py - 18, 14, 33, K); ret(ctx, px + 2, py - 17, 12, 31, '#f4f2fa'); ret(ctx, px + 2, py - 17, 2, 31, '#ffffff');
      ret(ctx, px + 2, py - 7, 12, 1, K);
      ret(ctx, px + 11, py - 14, 1, 5, C.metal2); ret(ctx, px + 11, py - 4, 1, 7, C.metal2);
      // imãs: morango, flor e uma listinha
      morango(ctx, px + 4, py - 14); ret(ctx, px + 5, py - 1, 5, 6, K); ret(ctx, px + 6, py, 3, 4, C.creme);
      ret(ctx, px + 6, py + 1, 3, 1, '#c8b8d8'); ret(ctx, px + 6, py + 3, 2, 1, '#c8b8d8'); ret(ctx, px + 7, py - 2, 1, 1, VERM);
      ret(ctx, px + 8, py - 12, 2, 2, '#b58cff');
    } });
  I.objeto('portugues-panelas', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 8, 30, 2, K); ret(ctx, px + 2, py + 8, 28, 1, C.metal);
      // concha, colher de pau, panela pequena, frigideira, batedor
      ret(ctx, px + 4, py + 10, 1, 9, K); circulo(ctx, px + 4, py + 20, 2, K); circulo(ctx, px + 4, py + 20, 1, C.metal);
      ret(ctx, px + 9, py + 10, 1, 9, C.madeira3); elipse(ctx, px + 9, py + 21, 2, 3, K); elipse(ctx, px + 9, py + 21, 1, 2, C.madeiraClara);
      ret(ctx, px + 15, py + 10, 1, 5, K); ret(ctx, px + 12, py + 15, 8, 7, K); ret(ctx, px + 13, py + 16, 6, 5, '#ff9d2e'); ret(ctx, px + 13, py + 16, 6, 1, '#ffc27a');
      ret(ctx, px + 24, py + 10, 1, 6, K); circulo(ctx, px + 24, py + 20, 4, K); circulo(ctx, px + 24, py + 20, 3, '#5a5a6a'); ret(ctx, px + 22, py + 18, 2, 1, '#8a8aa0');
      ret(ctx, px + 29, py + 10, 1, 5, K); elipse(ctx, px + 29, py + 18, 2, 4, K); elipse(ctx, px + 29, py + 18, 1, 3, C.metal);
    } });
  I.objeto('portugues-receita', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      // cartão de receita: título, ingredientes (lista) e modo de preparo (texto)
      contornoRet(ctx, px + 1, py + 6, 14, 20, C.creme);
      ret(ctx, px + 2, py + 7, 12, 3, MORANGO); ret(ctx, px + 4, py + 8, 8, 1, C.branco);
      for (var i = 0; i < 3; i++) { ret(ctx, px + 3, py + 12 + i * 2, 1, 1, VERDE); ret(ctx, px + 5, py + 12 + i * 2, 6 - i, 1, '#b8aac8'); }
      ret(ctx, px + 3, py + 19, 9, 1, VERM2); ret(ctx, px + 3, py + 21, 10, 1, '#b8aac8'); ret(ctx, px + 3, py + 23, 7, 1, '#b8aac8');
      ret(ctx, px + 7, py + 5, 2, 2, VERM);
    } });
  I.objeto('portugues-cesta-frutas', { w: 1, h: 1, topo: 5, solido: true,
    desenhar: function (ctx, px, py) {
      circulo(ctx, px + 5, py + 4, 3, K); circulo(ctx, px + 5, py + 4, 2, LARANJA);
      circulo(ctx, px + 10, py + 3, 3, K); circulo(ctx, px + 10, py + 3, 2, '#ff5c6a');
      morango(ctx, px + 6, py + 1); ret(ctx, px + 3, py + 2, 1, 1, UVA); ret(ctx, px + 12, py + 5, 2, 2, UVA);
      ret(ctx, px + 1, py + 6, 14, 9, K); ret(ctx, px + 2, py + 7, 12, 7, '#e0a860');
      for (var j = 0; j < 3; j++) for (var i = 0; i < 6; i++) ret(ctx, px + 2 + i * 2 + (j % 2), py + 8 + j * 2, 1, 1, '#b8803e');
      ret(ctx, px, py + 6, 16, 2, K); ret(ctx, px + 1, py + 6, 14, 1, '#f3c890');
    } });

  // para as outras partes (R._predios.portugues)
  S.CREME = CREME; S.VERM = VERM; S.VERM2 = VERM2; S.VERDE = VERDE; S.VERDE2 = VERDE2; S.VERDE3 = VERDE3;
  S.MORANGO = MORANGO; S.BANANA = BANANA; S.LARANJA = LARANJA; S.KIWI = KIWI; S.GELO = GELO; S.GELO2 = GELO2;
  S.GELO3 = GELO3; S.MAR = MAR; S.MAR2 = MAR2; S.MAR3 = MAR3; S.TERRA = TERRA; S.TERRA2 = TERRA2; S.FOLHA = FOLHA;
  S.FOLHA2 = FOLHA2; S.v = v; S.brilho = brilho; S.letra = letra; S.palavra = palavra; S.livrinho = livrinho;
  S.nuvemNeve = nuvemNeve; S.mesinha = mesinha; S.toco = toco;
})();
