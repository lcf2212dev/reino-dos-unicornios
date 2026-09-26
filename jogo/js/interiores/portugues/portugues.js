/* Casa das Palavras (Português): hall + 5 cômodos, um para cada sala.
   Hall (Dona Palavrinha e o Livro das Letras), Cozinha das Receitas, Horta do H, Pátio do Circo,
   Porto da Expedição e Parque do Carrossel. Também desenha a casa de fora, no mapa (Mapa.PREDIOS.palavras).
   Só dados, objetos e registros; nada de DOM, PA ou Progresso no carregamento.
   As falas moram em portugues/falas.js. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var clarear = D.clarear, escurecer = D.escurecer;
  var K = '#3a2446';
  var F = (R.FALAS_INTERIORES && R.FALAS_INTERIORES.portugues) || { npcs: {}, objetos: {} };
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};

  // cores da casa: parede creme, telhado vermelho e o verde dos detalhes
  var CREME = '#fff4ec', VERM = '#e0433f', VERM2 = '#b82e35', VERDE = '#39a860', VERDE2 = '#2a7d48', VERDE3 = '#8fd08f';
  var MORANGO = '#ff4f6a', MORANGO2 = '#c9304a', BANANA = '#ffe066', LARANJA = '#ff9d2e', UVA = '#9b6bd6', KIWI = '#9fd65a';
  var GELO = '#eaf8ff', GELO2 = '#bfe4f5', GELO3 = '#8cc8e6', MAR = '#3f9ad6', MAR2 = '#2f78b8', MAR3 = '#8fd0f5';
  var TERRA = '#8a5a3a', TERRA2 = '#6b4428', FOLHA = '#5fb85a', FOLHA2 = '#3f9a45';

  function v(o, k, padrao) { return (o && o.var && o.var[k] !== undefined) ? o.var[k] : padrao; }
  function brilho(ctx, x, y, c) { ret(ctx, x, y - 1, 1, 3, c); ret(ctx, x - 1, y, 3, 1, c); }

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

  /* ================= HORTA DO H ================= */
  I.objeto('portugues-canteiro', { w: 2, h: 1, topo: 8, solido: true,
    desenhar: function (ctx, px, py, o) {
      var W = (o.w || 2) * 16, planta = v(o, 'planta', 'alface');
      if (v(o, 'chao', false)) {
        // canteiro direto no chão: montinho de terra fofa com a bordinha de pedras
        ret(ctx, px + 1, py + 4, W - 2, 11, K); ret(ctx, px + 2, py + 5, W - 4, 9, TERRA); ret(ctx, px + 2, py + 5, W - 4, 1, '#a8744a');
        for (var r = py + 8; r < py + 14; r += 3) for (var q = px + 3 + (r % 2) * 2; q < px + W - 3; q += 4) ret(ctx, q, r, 2, 1, TERRA2);
        for (var pd = px + 1; pd < px + W - 2; pd += 4) { ret(ctx, pd, py + 13, 3, 2, '#b8b0a8'); ret(ctx, pd, py + 13, 3, 1, '#e0dad2'); }
      } else {
        ret(ctx, px + 1, py + 3, W - 2, 12, K); ret(ctx, px + 2, py + 4, W - 4, 10, C.madeira); ret(ctx, px + 2, py + 4, W - 4, 1, C.madeiraClara);
        ret(ctx, px + 3, py + 5, W - 6, 4, TERRA); for (var t = px + 4; t < px + W - 4; t += 4) ret(ctx, t, py + 6, 1, 1, TERRA2);
      }
      for (var x = px + 6; x < px + W - 4; x += 8) {
        if (planta === 'alface') { elipse(ctx, x, py + 3, 3, 3, K); elipse(ctx, x, py + 3, 2, 2, KIWI); ret(ctx, x, py + 2, 1, 2, FOLHA2); }
        else if (planta === 'cenoura') { ret(ctx, x - 1, py + 5, 3, 2, LARANJA); ret(ctx, x, py - 1, 1, 6, FOLHA); ret(ctx, x - 2, py, 1, 4, FOLHA2); ret(ctx, x + 2, py, 1, 4, FOLHA2); }
        else if (planta === 'tomate') {
          // tutor de madeira, galhinho com folhas e tomates redondos com o cabinho verde em estrela
          ret(ctx, x + 3, py - 9, 1, 14, C.madeira2);
          ret(ctx, x, py - 8, 1, 13, FOLHA2); ret(ctx, x - 3, py - 6, 3, 2, FOLHA); ret(ctx, x + 1, py - 3, 3, 2, FOLHA); ret(ctx, x - 3, py + 1, 3, 1, FOLHA);
          [[-2, -1], [2, -6]].forEach(function (tm) {
            var tx = x + tm[0], ty = py + tm[1];
            circulo(ctx, tx, ty, 3, K); circulo(ctx, tx, ty, 2, '#ff3b3b'); ret(ctx, tx - 1, ty - 1, 1, 1, '#ffb0a0'); ret(ctx, tx + 1, ty + 1, 1, 1, '#c81e2e');
            ret(ctx, tx - 1, ty - 3, 3, 1, '#2f8a3a'); ret(ctx, tx, ty - 4, 1, 1, '#2f8a3a');
          });
        } else { // hortelã
          [[-2, 2], [0, 0], [2, 2], [-1, -2], [1, -3]].forEach(function (f) { ret(ctx, x + f[0], py + f[1] + 1, 2, 2, K); ret(ctx, x + f[0], py + f[1] + 1, 1, 1, '#7fe08a'); });
        }
      }
    } });
  // leira de terra arada, pintada no chão da horta (dá para pisar), com brotinhos ou repolhinhos
  I.objeto('portugues-leira', { w: 3, h: 1, solido: false, plano: true, semSombra: true,
    desenhar: function (ctx, px, py, o) {
      var W = (o.w || 3) * 16, H = (o.h || 1) * 16, tipo = v(o, 'planta', 'broto');
      ret(ctx, px + 2, py + 2, W - 4, H - 3, '#7a4e30'); ret(ctx, px + 3, py + 1, W - 6, H - 1, '#7a4e30');
      ret(ctx, px + 3, py + 3, W - 6, H - 6, TERRA);
      for (var r = py + 5; r < py + H - 3; r += 4) { ret(ctx, px + 4, r, W - 8, 1, TERRA2); ret(ctx, px + 4, r + 1, W - 8, 1, '#a8744a'); }
      for (var x = px + 7; x < px + W - 5; x += 8) for (var y = py + 4; y < py + H - 4; y += 8) {
        if (tipo === 'repolho') { circulo(ctx, x, y + 1, 2, '#3f9a45'); ret(ctx, x - 1, y, 2, 2, '#9fe08a'); }
        else { ret(ctx, x, y, 1, 3, '#3f9a45'); ret(ctx, x - 2, y, 2, 1, '#6fdc8c'); ret(ctx, x + 1, y - 1, 2, 1, '#6fdc8c'); }
      }
    } });
  I.objeto('portugues-hortela', { w: 1, h: 1, topo: 8, solido: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      // moita de hortelã: folhas redondinhas e serrilhadas, com as nervuras claras
      var folhas = [[-5, -1], [5, -1], [-3, -5], [3, -5], [0, -8], [-6, -5], [6, -5], [0, -2], [-3, 1], [3, 1]];
      folhas.forEach(function (f) { elipse(ctx, cx + f[0], py + f[1], 3, 2, K); });
      folhas.forEach(function (f, i) {
        var x = cx + f[0], y = py + f[1];
        elipse(ctx, x, y, 2, 1, i % 2 ? '#4fbf6a' : '#6fdc8c'); ret(ctx, x - 1, y, 3, 1, '#b8f0c0'); ret(ctx, x - 2, y - 1, 1, 1, '#2f8a45');
      });
      // vaso de barro com a plaquinha "H"
      ret(ctx, cx - 6, py + 2, 13, 3, K); ret(ctx, cx - 5, py + 3, 11, 1, C.terracota2);
      ret(ctx, cx - 5, py + 4, 11, 11, K); ret(ctx, cx - 4, py + 5, 9, 9, C.terracota); ret(ctx, cx - 4, py + 5, 2, 9, '#f09a6a');
      ret(ctx, cx - 3, py + 7, 7, 7, K); ret(ctx, cx - 2, py + 8, 5, 5, C.creme); letra(ctx, 'H', cx - 1, py + 8, VERDE2);
    } });
  I.objeto('portugues-hibisco', { w: 1, h: 1, topo: 16, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      // vaso de barro
      ret(ctx, cx - 5, py + 5, 11, 10, K); ret(ctx, cx - 4, py + 6, 9, 8, '#e8b27a'); ret(ctx, cx - 4, py + 6, 9, 1, '#ffd9a8'); ret(ctx, cx - 4, py + 6, 2, 8, '#f3c898');
      // folhagem com folhas pontudas
      circulo(ctx, cx, py - 4, 9, K); circulo(ctx, cx, py - 4, 8, FOLHA2);
      circulo(ctx, cx + 3, py - 7, 4, FOLHA); circulo(ctx, cx - 5, py - 1, 3, FOLHA); circulo(ctx, cx + 4, py + 1, 3, '#4ea84e');
      [[-8, -8], [8, -4], [-9, 1], [7, 3]].forEach(function (f) { ret(ctx, cx + f[0], py + f[1], 2, 1, FOLHA2); ret(ctx, cx + f[0], py + f[1] - 1, 1, 1, K); });
      // um botão fechado e duas flores grandes de hibisco: 5 pétalas, o fundinho escuro e o miolo amarelo comprido
      ret(ctx, cx + 5, py - 11, 3, 4, K); ret(ctx, cx + 6, py - 10, 1, 2, '#ff3b5c'); ret(ctx, cx + 6, py - 8, 1, 2, FOLHA);
      var PET = [[0, -3], [3, -1], [2, 3], [-2, 3], [-3, -1]], FLORES = [[-3, -7, 1], [4, 0, -1]];
      FLORES.forEach(function (f) { PET.forEach(function (p) { circulo(ctx, cx + f[0] + p[0], py + f[1] + p[1], 2, K); }); });
      FLORES.forEach(function (f) { flor(cx + f[0], py + f[1], f[2]); });
      function flor(x, y, lado) {
        PET.forEach(function (p) { circulo(ctx, x + p[0], y + p[1], 1, '#ff3b5c'); ret(ctx, x + p[0] + (p[0] > 0 ? 1 : -1), y + p[1] + (p[1] > 0 ? 1 : -1), 1, 1, '#ff3b5c'); });
        PET.forEach(function (p) { ret(ctx, x + Math.round(p[0] * 1.3), y + Math.round(p[1] * 1.3), 1, 1, '#ff8aa0'); });
        ret(ctx, x - 1, y - 1, 3, 3, '#e0203f'); ret(ctx, x, y, 1, 1, '#8a0a26');
        // miolo comprido saindo para o lado, com as pontinhas de pólen
        for (var i = 1; i <= 4; i++) ret(ctx, x + lado * i, y - i, 1, 1, BANANA);
        ret(ctx, x + lado * 5, y - 5, 1, 1, '#ff9d2e'); ret(ctx, x + lado * 4, y - 5, 1, 1, '#ff9d2e'); ret(ctx, x + lado * 5, y - 4, 1, 1, '#ff9d2e');
      }
    } });
  I.objeto('portugues-placa-horta', { w: 1, h: 1, topo: 12, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 1, py - 2, 3, 17, K); ret(ctx, cx, py - 2, 1, 16, C.madeira);
      ret(ctx, px - 4, py - 11, 24, 11, K); ret(ctx, px - 3, py - 10, 22, 9, C.madeiraClara); ret(ctx, px - 3, py - 10, 22, 1, '#ffe0b8');
      palavra(ctx, 'ORTA', px + 3, py - 8, VERDE2);
      letra(ctx, 'H', px - 1, py - 8, VERM);   // o H em destaque (a letra que não tem som)
      elipse(ctx, cx, py + 14, 4, 1, FOLHA2);
    } });
  I.objeto('portugues-helicoptero', { w: 1, h: 1, topo: 12, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      toco(ctx, cx, py, py - 1);
      // helicóptero de brinquedo
      ret(ctx, cx - 5, py - 9, 9, 7, K); ret(ctx, cx - 4, py - 8, 7, 5, '#ff9d2e'); ret(ctx, cx - 3, py - 7, 3, 2, '#bfe9ff');
      ret(ctx, cx + 3, py - 7, 6, 3, K); ret(ctx, cx + 4, py - 6, 4, 1, '#ff9d2e'); ret(ctx, cx + 8, py - 9, 2, 5, K);
      ret(ctx, cx - 5, py - 2, 9, 1, K); ret(ctx, cx - 3, py - 3, 1, 1, K); ret(ctx, cx + 1, py - 3, 1, 1, K);
      ret(ctx, cx - 1, py - 11, 1, 2, K);
      letra(ctx, 'H', cx - 4, py - 16, VERM);
    },
    anim: function (ctx, px, py, t) {
      var cx = px + 8, f = Math.floor(t / 90) % 2;
      ret(ctx, cx - 7 + f * 2, py - 12, 14 - f * 4, 1, K);
    } });
  I.objeto('portugues-regador', { w: 1, h: 1, topo: 2, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 3, py + 5, 8, 9, K); ret(ctx, px + 4, py + 6, 6, 7, '#5fb4ff'); ret(ctx, px + 4, py + 6, 1, 7, '#9fdcff');
      for (var i = 0; i < 4; i++) ret(ctx, px + 10 + i, py + 8 - i, 1, 2, K);
      ret(ctx, px + 13, py + 3, 3, 2, K); ret(ctx, px + 14, py + 3, 1, 1, C.metal);
      ret(ctx, px + 5, py + 2, 5, 1, K); ret(ctx, px + 4, py + 3, 1, 3, K); ret(ctx, px + 10, py + 3, 1, 3, K);
    } });
  I.objeto('portugues-carrinho', { w: 1, h: 1, topo: 4, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 2, 12, 8, K); ret(ctx, px + 2, py + 3, 10, 6, VERDE); ret(ctx, px + 2, py + 3, 10, 1, VERDE3);
      ret(ctx, px + 3, py + 1, 8, 2, TERRA); elipse(ctx, px + 7, py + 1, 4, 2, TERRA2);
      circulo(ctx, px + 4, py + 12, 2, K); circulo(ctx, px + 4, py + 12, 1, C.metal2);
      ret(ctx, px + 12, py + 6, 4, 1, K); ret(ctx, px + 11, py + 10, 1, 5, K);
      ret(ctx, px + 5, py - 2, 1, 4, FOLHA2); ret(ctx, px + 4, py - 2, 3, 1, FOLHA);
    } });
  I.objeto('portugues-cartaz-h', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      // cartaz do H: o hotel ou o helicóptero, com o H bem grande
      var qual = v(o, 'figura', 'hotel');
      contornoRet(ctx, px + 1, py + 5, 14, 21, C.creme);
      ret(ctx, px + 2, py + 6, 12, 7, '#bfe9ff');
      if (qual === 'hotel') {
        ret(ctx, px + 4, py + 7, 8, 6, K); ret(ctx, px + 5, py + 8, 6, 5, '#ffd1e6');
        ret(ctx, px + 6, py + 9, 1, 1, '#5fb4ff'); ret(ctx, px + 9, py + 9, 1, 1, '#5fb4ff'); ret(ctx, px + 7, py + 11, 2, 2, C.madeira2);
      } else {
        ret(ctx, px + 5, py + 9, 6, 3, K); ret(ctx, px + 6, py + 10, 4, 1, '#ff9d2e'); ret(ctx, px + 10, py + 10, 3, 1, K); ret(ctx, px + 3, py + 8, 10, 1, K);
      }
      // o H bem grande (letra de 2 px)
      ret(ctx, px + 5, py + 15, 2, 9, VERM); ret(ctx, px + 9, py + 15, 2, 9, VERM); ret(ctx, px + 7, py + 18, 2, 2, VERM);
    } });
  I.objeto('portugues-espantalho', { w: 1, h: 1, topo: 20, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 1, py - 8, 3, 23, K); ret(ctx, cx, py - 8, 1, 22, C.madeira);
      ret(ctx, cx - 8, py - 7, 17, 3, K); ret(ctx, cx - 7, py - 6, 15, 1, C.madeira);
      ret(ctx, cx - 4, py - 8, 9, 10, K); ret(ctx, cx - 3, py - 7, 7, 8, '#e0433f');
      for (var i = 0; i < 3; i++) ret(ctx, cx - 3 + i * 3, py - 7, 1, 8, '#ffd34d');
      ret(ctx, cx - 7, py - 5, 2, 3, '#f5d77a'); ret(ctx, cx + 6, py - 5, 2, 3, '#f5d77a');
      circulo(ctx, cx, py - 13, 4, K); circulo(ctx, cx, py - 13, 3, '#f3d9a8');
      ret(ctx, cx - 2, py - 14, 1, 1, K); ret(ctx, cx + 2, py - 14, 1, 1, K); ret(ctx, cx - 1, py - 11, 3, 1, VERM2);
      ret(ctx, cx - 6, py - 17, 13, 2, K); ret(ctx, cx - 5, py - 17, 11, 1, '#f2cf6b'); ret(ctx, cx - 3, py - 21, 7, 4, K); ret(ctx, cx - 2, py - 20, 5, 3, '#f2cf6b');
      ret(ctx, cx - 2, py - 18, 5, 1, VERM);
    } });

  /* ================= PÁTIO DO CIRCO ================= */
  // amarelinha pintada no chão: 7 casas com a inicial de cada dia da semana e o céu no fim
  I.objeto('portugues-amarelinha', { w: 2, h: 5, solido: false, plano: true, semSombra: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 16, giz = '#fdfbff', cores = ['#ffd34d', '#ff9cc6', '#9fdcff', '#9fe0a0', '#c9a8ff', '#ffb070', '#ff9cc6'];
      // de baixo para cima: D | S T | Q | Q S | S | céu
      var casas = [
        [[0, 'D']], [[-1, 'S'], [1, 'T']], [[0, 'Q']], [[-1, 'Q'], [1, 'S']], [[0, 'S']],
      ];
      var h = 12, base = py + 78, n = 0;
      casas.forEach(function (linha, j) {
        var y = base - (j + 1) * h;
        linha.forEach(function (c) {
          var x = c[0] === 0 ? cx - 6 : c[0] < 0 ? cx - 12 : cx;
          ret(ctx, x, y, 12, h + 1, giz); ret(ctx, x + 1, y + 1, 10, h - 1, cores[n % cores.length]);
          ret(ctx, x + 1, y + 1, 10, 1, clarear(cores[n % cores.length], 0.4));
          letra(ctx, c[1], x + 5 - 1, y + 4, K);
          n++;
        });
      });
      // céu (meia-lua no topo)
      var yc = base - 5 * h;
      for (var j = 0; j < 12; j++) {
        var m = Math.round(Math.sqrt(Math.max(0, 144 - (12 - j) * (12 - j))));
        ret(ctx, cx - m, yc - 12 + j, m * 2, 1, giz);
        if (m > 1) ret(ctx, cx - m + 1, yc - 12 + j, m * 2 - 2, 1, '#bfe9ff');
      }
      ret(ctx, cx - 1, yc - 8, 3, 3, C.ouro); ret(ctx, cx, yc - 9, 1, 5, C.ouro); ret(ctx, cx - 2, yc - 7, 5, 1, C.ouro);
      // pedrinha e giz
      ret(ctx, cx + 9, base - 6, 3, 2, '#8a8aa0'); ret(ctx, cx - 14, base - 4, 4, 2, giz);
    } });
  // chocalho em pé no seu suporte: cabeça redonda listrada, anel dourado e cabo curto de madeira
  I.objeto('portugues-chocalho', { w: 1, h: 1, topo: 14, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8, cy = py - 8;
      // suporte: banquinho roxo acolchoado com a franja dourada e a estrelinha na frente
      ret(ctx, cx - 6, py + 14, 13, 1, 'rgba(58,36,70,0.25)');
      ret(ctx, cx - 6, py + 7, 13, 8, K); ret(ctx, cx - 5, py + 8, 11, 6, '#7c5cff');
      ret(ctx, cx - 5, py + 8, 11, 1, '#a88cff'); ret(ctx, cx - 5, py + 8, 1, 6, '#a88cff'); ret(ctx, cx + 4, py + 9, 1, 5, '#5a3fd0');
      for (var f = cx - 5; f <= cx + 5; f += 2) ret(ctx, f, py + 13, 1, 1, C.ouro);
      ret(ctx, cx, py + 9, 1, 3, C.ouro); ret(ctx, cx - 1, py + 10, 3, 1, C.ouro);
      // cabo curto de madeira, encaixado no suporte
      ret(ctx, cx - 2, py - 2, 5, 10, K); ret(ctx, cx - 1, py - 1, 3, 8, C.madeira); ret(ctx, cx - 1, py - 1, 1, 8, C.madeiraClara);
      ret(ctx, cx + 1, py + 2, 1, 1, C.madeira2); ret(ctx, cx + 1, py + 5, 1, 1, C.madeira2);
      ret(ctx, cx - 3, py + 7, 7, 1, K);
      // cabeça redonda com as listras (laranja, vermelha, amarela e azul), sombra embaixo à direita
      for (var dy = -7; dy <= 7; dy++) for (var dx = -7; dx <= 7; dx++) {
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d > 6.6) continue;
        var cor = K;
        if (d <= 5.6) {
          var faixa = dy + dx * dx * 0.06;
          cor = faixa < -3 ? '#ff9d2e' : faixa < -1.2 ? VERM : faixa < 0.8 ? '#ffe066' : faixa < 2.8 ? '#5fb4ff' : '#ff9d2e';
          if (dx + dy > 4.5 && d > 3.5) cor = escurecer(cor, 0.2);
        }
        ret(ctx, cx + dx, cy + dy, 1, 1, cor);
      }
      ret(ctx, cx - 3, cy - 4, 2, 1, C.branco); ret(ctx, cx - 4, cy - 3, 1, 2, C.branco);
      // anel dourado entre a cabeça e o cabo
      ret(ctx, cx - 3, py - 3, 7, 2, K); ret(ctx, cx - 2, py - 3, 5, 1, C.ouro);
    },
    anim: function (ctx, px, py, t) {
      // chique-chique: risquinhos de som dos dois lados da cabeça
      var f = Math.floor(t / 180) % 6, cx = px + 8, cy = py - 8;
      if (f < 2) { ret(ctx, cx + 8, cy - 4 - f, 1, 2, K); ret(ctx, cx - 9, cy - 4 - f, 1, 2, K); ret(ctx, cx + 6, cy - 8 + f, 2, 1, K); ret(ctx, cx - 7, cy - 8 + f, 2, 1, K); }
    } });
  I.objeto('portugues-lona', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var W = (o.w || 2) * 16, c = v(o, 'cor', VERM);
      // cortina de circo listrada, aberta para os lados, com a estrela no meio
      ret(ctx, px, py + 3, W, 3, K); ret(ctx, px + 1, py + 4, W - 2, 1, C.ouro);
      for (var x = 1; x < W - 1; x++) {
        var lado = x < W / 2 ? x : W - 1 - x, alt = 26 - Math.round(lado * 0.2);
        ret(ctx, px + x, py + 6, 1, Math.min(26, 8 + lado), (Math.floor(x / 3) % 2) ? C.branco : c);
      }
      ret(ctx, px + W / 2 - 5, py + 16, 10, 16, '#5a3a7a');
      ret(ctx, px + W / 2 - 2, py + 20, 5, 5, C.ouro); ret(ctx, px + W / 2, py + 18, 1, 9, C.ouro); ret(ctx, px + W / 2 - 4, py + 22, 9, 1, C.ouro);
      for (var b = 0; b < W; b += 4) { triangulo(ctx, px + b, py + 6, 4, 3, b % 8 ? C.ouro : c); }
    } });
  // ninho de palha em cima de um arbusto, com três ovinhos pintados
  I.objeto('portugues-ninho', { w: 1, h: 1, topo: 12, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      // arbusto redondo com folhas e duas florzinhas
      circulo(ctx, cx, py + 6, 8, K); circulo(ctx, cx, py + 6, 7, FOLHA2);
      circulo(ctx, cx - 3, py + 4, 4, FOLHA); circulo(ctx, cx + 4, py + 7, 3, FOLHA); circulo(ctx, cx - 1, py + 10, 3, '#4ea84e');
      [[-5, 2], [-1, 6], [3, 3], [5, 9], [-4, 10], [1, 12]].forEach(function (p) { ret(ctx, cx + p[0], py + p[1], 2, 1, '#8fe08a'); });
      ret(ctx, cx - 6, py + 8, 2, 2, '#ff9cc6'); ret(ctx, cx + 5, py + 4, 2, 2, C.branco);
      ret(ctx, cx - 7, py + 13, 15, 2, K);
      // ninho de palha marrom: a tigela, o fundo escuro por dentro e os três ovinhos sentados nele
      var PALHA = '#b07838', PALHA2 = '#7a4a22', PALHA3 = '#e0a858';
      elipse(ctx, cx, py, 9, 4, K); elipse(ctx, cx, py, 8, 3, PALHA);
      elipse(ctx, cx, py - 2, 7, 1, '#4a2c18');
      ovoPintado(ctx, cx - 3, py - 11, '#ffd0e2', '#e07aa6');  // rosa clarinho (no meio, mais alto: fica atrás)
      ovoPintado(ctx, cx - 8, py - 9, '#fff2d0', '#c89a5a');   // creme
      ovoPintado(ctx, cx + 2, py - 9, '#cdeeff', '#5f9fd0');   // azul clarinho
      // a beirada da frente do ninho, trançada, por cima da base dos ovos
      ret(ctx, cx - 8, py - 2, 17, 4, K); ret(ctx, cx - 9, py - 1, 19, 2, K);
      ret(ctx, cx - 7, py - 1, 15, 2, PALHA); ret(ctx, cx - 8, py, 17, 1, PALHA);
      for (var i = -7; i <= 7; i += 3) { ret(ctx, cx + i, py - 1, 2, 1, PALHA3); ret(ctx, cx + i + 1, py, 2, 1, PALHA2); }
      for (var k = -6; k <= 6; k += 4) ret(ctx, cx + k, py + 2, 2, 1, PALHA2);
      // fiapos de palha escapando
      ret(ctx, cx - 10, py - 2, 1, 1, PALHA2); ret(ctx, cx - 9, py - 3, 1, 1, PALHA);
      ret(ctx, cx + 9, py - 3, 1, 1, PALHA2); ret(ctx, cx + 8, py - 3, 1, 1, PALHA); ret(ctx, cx + 7, py + 3, 2, 1, PALHA2);
    } });
  // ovinho oval (6×8; a base fica atrás da beirada do ninho) com pintinhas
  var OVO = ['..kk..', '.kwck.', 'kwccck', 'kccpck', 'kpccck', 'kcccpk', 'kcccck', '.kkkk.'];
  function ovoPintado(ctx, x, y, cor, pinta) { D.matriz(ctx, x, y, OVO, { k: K, c: cor, w: C.branco, p: pinta }); }
  I.objeto('portugues-pipoca', { w: 1, h: 1, topo: 18, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      // carrinho de pipoca: rodas, balcão listrado, vitrine cheia e o toldo
      circulo(ctx, cx - 4, py + 12, 3, K); circulo(ctx, cx - 4, py + 12, 2, C.metal2);
      circulo(ctx, cx + 5, py + 12, 3, K); circulo(ctx, cx + 5, py + 12, 2, C.metal2);
      ret(ctx, cx - 7, py - 1, 15, 11, K); ret(ctx, cx - 6, py, 13, 9, VERM);
      for (var i = 0; i < 4; i++) ret(ctx, cx - 5 + i * 4, py, 2, 9, C.branco);
      ret(ctx, cx - 7, py - 12, 15, 12, K); ret(ctx, cx - 6, py - 11, 13, 10, '#eaf8ff');
      for (var j = 0; j < 12; j++) { var x = cx - 5 + (j * 5) % 11, y = py - 6 + Math.floor(j / 4) * 2; ret(ctx, x, y, 2, 2, j % 3 ? C.branco : '#fff3a0'); }
      ret(ctx, cx - 6, py - 11, 1, 5, C.branco);
      ret(ctx, cx - 9, py - 17, 19, 5, K);
      for (var t = 0; t < 17; t += 4) ret(ctx, cx - 8 + t, py - 16, 2, 3, VERM);
      ret(ctx, cx - 8, py - 16, 17, 1, C.ouro3);
      ret(ctx, cx - 1, py - 20, 3, 3, K); ret(ctx, cx, py - 19, 1, 1, C.ouro);
      // espigas de milho de enfeite
      ret(ctx, cx + 6, py + 1, 3, 6, K); ret(ctx, cx + 7, py + 2, 1, 4, BANANA);
    } });
  I.objeto('portugues-bola-circo', { w: 1, h: 1, topo: 4, solido: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8, cy = py + 7;
      circulo(ctx, cx, cy, 7, K); circulo(ctx, cx, cy, 6, '#5fb4ff');
      ret(ctx, cx - 6, cy - 1, 13, 3, VERM); ret(ctx, cx - 1, cy - 6, 3, 13, C.ouro);
      circulo(ctx, cx, cy, 2, C.branco); ret(ctx, cx - 4, cy - 4, 2, 2, '#bfe9ff');
    } });
  I.objeto('portugues-banquinho', { w: 1, h: 1, topo: 6, solido: true,
    desenhar: function (ctx, px, py, o) {
      // banquinho redondo de circo: tambor com zigue-zague dourado e o tampo de estrela
      var cx = px + 8, c = v(o, 'cor', '#7c5cff'), cl = clarear(c, 0.35);
      ret(ctx, cx - 6, py, 13, 13, K); ret(ctx, cx - 5, py, 11, 12, c); ret(ctx, cx - 5, py, 2, 12, cl);
      elipse(ctx, cx, py + 13, 6, 2, K); elipse(ctx, cx, py + 13, 5, 1, escurecer(c, 0.2));
      for (var i = 0; i < 11; i++) ret(ctx, cx - 5 + i, py + 5 + (i % 4 < 2 ? i % 2 : 1 - i % 2) * 2, 1, 2, C.ouro);
      elipse(ctx, cx, py, 6, 3, K); elipse(ctx, cx, py, 5, 2, C.ouro3); elipse(ctx, cx, py, 3, 1, C.ouro);
      ret(ctx, cx, py - 1, 1, 3, '#ff9d2e'); ret(ctx, cx - 1, py, 3, 1, '#ff9d2e');
    } });

  /* ================= PORTO DA EXPEDIÇÃO ================= */
  // tanque de vidro: a pontinha do iceberg fora da água e a maior parte embaixo
  I.objeto('portugues-iceberg', { w: 2, h: 1, topo: 18, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 16, nivel = py - 6;
      var FUNDO = '#1f6f96', FUNDO2 = '#2a88b4', GELOF = '#56c3de', GELOF2 = '#8fe0f0', CONT = '#12506e';
      // base de madeira do tanque
      ret(ctx, px + 2, py + 8, 28, 7, K); ret(ctx, px + 3, py + 9, 26, 5, C.madeira2); ret(ctx, px + 3, py + 9, 26, 1, C.madeiraClara);
      ret(ctx, px + 5, py + 11, 22, 1, C.madeira3);
      // vidro: ar em cima, água funda embaixo
      ret(ctx, px + 1, py - 17, 30, 26, K);
      ret(ctx, px + 2, py - 16, 28, nivel - py + 16, '#eef9ff');
      ret(ctx, px + 2, nivel, 28, py + 8 - nivel, FUNDO2);
      for (var a = nivel + 4; a < py + 8; a += 4) ret(ctx, px + 2, a, 28, 2, FUNDO);
      // a parte escondida: bem MAIOR, embaixo d'água, com contorno
      var fundo = [[0, 7], [1, 9], [2, 10], [3, 11], [4, 12], [5, 12], [6, 12], [7, 11], [8, 11], [9, 10], [10, 9], [11, 8], [12, 6], [13, 4]];
      fundo.forEach(function (f) { var y = nivel + 1 + f[0], m = f[1], d = f[0] % 4 === 1 ? 1 : 0; ret(ctx, cx - m - 1 + d, y, m * 2 + 2 - d, 1, CONT); });
      fundo.forEach(function (f) { var y = nivel + 1 + f[0], m = f[1] - 1, d = f[0] % 4 === 1 ? 1 : 0; if (m > 0) ret(ctx, cx - m + d, y, m * 2 - d, 1, GELOF); });
      for (var k = 1; k < 12; k++) ret(ctx, cx - (fundo[k][1] - 2), nivel + 1 + k, 2, 1, GELOF2);
      [[3, 3], [6, 5], [9, 2]].forEach(function (r) { ret(ctx, cx + r[0] - 2, nivel + r[1] + 2, 3, 1, '#3aa6c8'); });
      // a pontinha (pequena) fora d'água: branca, com a sombra azul-clara do lado direito
      triangulo(ctx, cx - 6, nivel - 9, 12, 10, K);
      triangulo(ctx, cx - 5, nivel - 8, 10, 9, C.branco);
      for (var j = 0; j < 8; j++) { var mm = Math.round((j + 1) * 5 / 9); ret(ctx, cx + 1, nivel - 7 + j, Math.max(1, mm - 1), 1, GELO2); }
      ret(ctx, cx - 1, nivel - 6, 1, 3, GELO);
      // linha d'água com espuma
      ret(ctx, px + 2, nivel, 28, 1, '#8fd0f5');
      for (var e = px + 3; e < px + 29; e += 3) ret(ctx, e, nivel, 2, 1, C.branco);
      ret(ctx, cx - 8, nivel + 1, 3, 1, C.branco); ret(ctx, cx + 6, nivel + 1, 3, 1, C.branco);
      // brilho do vidro
      ret(ctx, px + 3, py - 15, 1, 21, 'rgba(255,255,255,0.75)'); ret(ctx, px + 5, py - 15, 1, 6, 'rgba(255,255,255,0.6)');
      // bolhinhas
      ret(ctx, px + 25, py + 1, 1, 1, '#bfe9ff'); ret(ctx, px + 26, py - 2, 2, 2, '#bfe9ff');
      // tampa do tanque
      ret(ctx, px, py - 18, 32, 2, K); ret(ctx, px + 1, py - 18, 30, 1, '#5a6a84');
    } });
  I.objeto('portugues-barco', { w: 3, h: 2, topo: 18, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      // água do cais: só no lugar do barco (da parede até o fim da fileira dele), com a borda de pedra
      ret(ctx, px, py + 1, 48, 27, K); ret(ctx, px + 1, py + 1, 46, 26, MAR2); ret(ctx, px + 1, py + 1, 46, 3, '#23649e');
      ret(ctx, px + 1, py + 16, 46, 11, MAR);
      for (var w = 0; w < 6; w++) { ret(ctx, px + 3 + w * 8, py + 6 + (w % 2) * 4, 4, 1, MAR); ret(ctx, px + 2 + w * 8, py + 23 + (w % 2) * 2, 4, 1, MAR3); }
      ret(ctx, px + 2, py + 21, 5, 1, C.branco); ret(ctx, px + 41, py + 21, 5, 1, C.branco);
      // borda do cais: pedras com a luz em cima
      ret(ctx, px, py + 27, 48, 5, K);
      for (var pd = 0; pd < 8; pd++) { var pxp = px + 1 + pd * 6; ret(ctx, pxp, py + 28, 5, 3, pd % 2 ? '#b8b0c8' : '#c9c2d8'); ret(ctx, pxp, py + 28, 5, 1, '#e4e0ee'); }

      // casco vermelho com faixa branca
      ret(ctx, px + 3, py + 8, 42, 14, K);
      ret(ctx, px + 4, py + 9, 40, 12, VERM); ret(ctx, px + 4, py + 9, 40, 2, C.branco); ret(ctx, px + 4, py + 17, 40, 4, VERM2);
      for (var i = 0; i < 4; i++) { circulo(ctx, px + 12 + i * 8, py + 14, 2, K); circulo(ctx, px + 12 + i * 8, py + 14, 1, '#bfe9ff'); }
      triangulo(ctx, px + 40, py + 8, 10, 14, K); ret(ctx, px + 44, py + 9, 2, 10, VERM);
      // cabine e mastro com a bandeirinha da expedição
      ret(ctx, px + 10, py - 4, 18, 13, K); ret(ctx, px + 11, py - 3, 16, 11, C.branco);
      ret(ctx, px + 13, py - 1, 4, 3, '#9fdcff'); ret(ctx, px + 20, py - 1, 4, 3, '#9fdcff');
      ret(ctx, px + 9, py - 6, 20, 3, K); ret(ctx, px + 10, py - 5, 18, 1, '#5fb4ff');
      ret(ctx, px + 34, py - 18, 2, 27, K); ret(ctx, px + 36, py - 17, 8, 6, K); ret(ctx, px + 37, py - 16, 6, 4, '#ffd34d');
      ret(ctx, px + 39, py - 15, 2, 2, VERM);
      ret(ctx, px + 20, py - 12, 4, 7, K); ret(ctx, px + 21, py - 11, 2, 6, '#ffd34d');
    } });
  I.objeto('portugues-pinguins', { w: 1, h: 1, topo: 8, solido: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 8, py + 13, 8, 3, K); elipse(ctx, px + 8, py + 13, 7, 2, GELO);
      function pinguim(cx, yb, alt) {
        elipse(ctx, cx, yb - alt / 2, 3, alt / 2, K); elipse(ctx, cx, yb - alt / 2 + 1, 2, alt / 2 - 1, C.branco);
        ret(ctx, cx - 3, yb - alt, 7, 3, K); ret(ctx, cx - 1, yb - alt + 1, 1, 1, C.branco); ret(ctx, cx + 1, yb - alt + 1, 1, 1, C.branco);
        ret(ctx, cx, yb - alt + 2, 1, 1, LARANJA); ret(ctx, cx - 2, yb, 2, 1, LARANJA); ret(ctx, cx + 1, yb, 2, 1, LARANJA);
      }
      pinguim(px + 4, py + 13, 12); pinguim(px + 12, py + 13, 14); pinguim(px + 8, py + 15, 9);
    } });
  var FOCA_DEITADA = [
    '............kkk...',
    '...........kpppk..',
    '..........kppwkpk.',
    '....kkkkkkkppppppk',
    '...kppppppppplllnk',
    '..kpppppppppllllk.',
    'kkpppppplllllllk..',
    'kdkplllllllllkk...',
    'k.kkkkkdddkkk.....',
  ];
  var FOCA_ERGUIDA = [
    '...kkk........',
    '..kpppk.......',
    '.kpkwpk.......',
    'knplppk.......',
    '.kllppk.......',
    '..kllpk.......',
    '..kllppkkkk...',
    '..kllpppppppk.',
    '.kllllpppppdpk',
    '.kllllllpppkdk',
    'kdkkllllllkk.k',
    'k..kkkkkkk....',
  ];
  I.objeto('portugues-focas', { w: 2, h: 1, topo: 6, solido: true,
    desenhar: function (ctx, px, py) {
      // placa de gelo com duas focas: uma deitada e outra de cabeça levantada
      elipse(ctx, px + 16, py + 12, 16, 4, K); elipse(ctx, px + 16, py + 12, 15, 3, GELO); ret(ctx, px + 5, py + 14, 22, 1, GELO2);
      ret(ctx, px + 3, py + 11, 4, 1, C.branco); ret(ctx, px + 26, py + 13, 3, 1, C.branco);
      var pal = { k: K, p: '#7f8aa3', d: '#56607a', l: '#dfe5ef', w: C.branco, n: '#2a1e34' };
      function espelho(m) { return m.map(function (l) { return l.split('').reverse().join(''); }); }
      // costas com costas: a deitada olha para a esquerda e a de cabeça erguida para a direita
      D.matriz(ctx, px, py + 4, espelho(FOCA_DEITADA), pal);
      D.matriz(ctx, px + 18, py + 1, espelho(FOCA_ERGUIDA), pal);
      // luz no lombo e bigodinhos
      ret(ctx, px + 9, py + 8, 5, 1, '#a3adc2'); ret(ctx, px + 21, py + 8, 4, 1, '#a3adc2');
      ret(ctx, px - 1, py + 7, 1, 1, '#4a4058'); ret(ctx, px - 2, py + 9, 2, 1, '#4a4058'); ret(ctx, px - 1, py + 8, 1, 1, '#4a4058');
      ret(ctx, px + 32, py + 3, 1, 1, '#4a4058'); ret(ctx, px + 32, py + 5, 2, 1, '#4a4058'); ret(ctx, px + 32, py + 4, 1, 1, '#4a4058');
    } });
  // albatroz em pé no chão do cais, de frente, com as asas bem abertas (pontas escuras) e o bico de lado
  var ALBATROZ = [
    '........kkk.........',
    '.......kwwwk........',
    '.......kgkwkkkkk....',
    '.......kwwwkyyyyk...',
    '........kwwkkkkok...',
    '.kkkkkkkkwwkkkkkkkk.',
    'kppdddddgwwgdddddppk',
    'kpppddddwwwwddddpppk',
    '.kppwwwwwwwwwwwwppk.',
    '..kkkkkwwwwwwkkkkk..',
    '......kwwwwwwk......',
    '......kgwwwwgk......',
    '.......kgwwgk.......',
    '........kddk........',
    '.......kr..rk.......',
    '......rrr..rrr......',
  ];
  I.objeto('portugues-albatroz', { w: 1, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      // o sprite de um móvel alto só tem 2 px de folga de cada lado: 20 px de ponta a ponta de asa
      D.matriz(ctx, px - 2, py - 1, ALBATROZ, { k: K, w: C.branco, g: '#d6dbe8', d: '#4e4a62', p: '#241f33', y: '#ffd08a', o: '#e07a6a', r: '#ff8fa8' });
      ret(ctx, px + 5, py + 6, 2, 1, '#6e6a84'); ret(ctx, px + 9, py + 6, 2, 1, '#6e6a84');
    } });
  // lampião de navio: gaiola de latão com vidro e a chama, pendurado num suporte
  I.objeto('portugues-lampiao', { w: 1, h: 1, topo: 20, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8, LATAO = '#d9a441', LATAO2 = '#a8742a';
      ret(ctx, cx - 4, py + 12, 9, 3, K); ret(ctx, cx - 3, py + 12, 7, 1, LATAO);
      ret(ctx, cx - 1, py - 8, 3, 21, K); ret(ctx, cx, py - 8, 1, 20, '#5a6a84');
      ret(ctx, cx - 1, py - 10, 7, 3, K); ret(ctx, cx, py - 9, 5, 1, '#5a6a84'); ret(ctx, cx + 4, py - 8, 1, 3, K);
      // lampião
      ret(ctx, cx + 1, py - 5, 7, 2, K); ret(ctx, cx + 2, py - 5, 5, 1, LATAO);
      ret(ctx, cx + 1, py - 3, 7, 9, K); ret(ctx, cx + 2, py - 2, 5, 7, '#fff3c0');
      ret(ctx, cx + 3, py - 1, 3, 4, '#ffd34d'); ret(ctx, cx + 4, py, 1, 2, '#ff9d2e');
      ret(ctx, cx + 4, py - 3, 1, 9, LATAO2); ret(ctx, cx + 2, py + 1, 5, 1, LATAO2);
      ret(ctx, cx + 1, py + 6, 7, 2, K); ret(ctx, cx + 2, py + 6, 5, 1, LATAO);
    },
    anim: function (ctx, px, py, t) {
      var f = Math.floor(t / 300) % 3;
      ret(ctx, px + 12, py - 1 + (f === 1 ? 1 : 0), 1, 1, f === 2 ? '#fff3a0' : '#ffb020');
    } });
  // leme de navio num pedestal (roda vazada: aro, oito raios e manoplas)
  I.objeto('portugues-leme', { w: 1, h: 1, topo: 14, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8, cy = py - 2;
      ret(ctx, cx - 4, py + 11, 9, 4, K); ret(ctx, cx - 3, py + 12, 7, 2, C.madeira2); ret(ctx, cx - 3, py + 12, 7, 1, C.madeiraClara);
      ret(ctx, cx - 1, py + 6, 3, 6, K); ret(ctx, cx, py + 6, 1, 5, C.madeira);
      for (var dy = -9; dy <= 9; dy++) for (var dx = -9; dx <= 9; dx++) {
        var r = Math.sqrt(dx * dx + dy * dy), raio = dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy), cor = null;
        if (r >= 3.9 && r <= 6.5) cor = (r < 4.3 || r > 5.7) ? K : (dy < 0 ? C.madeiraClara : C.madeira);
        else if (raio && r < 3.9 && r > 2.2) cor = C.madeira3;
        else if (raio && r > 6.5 && r <= 7.5) cor = C.madeira2;
        else if (r <= 2.2) cor = r > 1.5 ? K : '#d9a441';
        if (cor) ret(ctx, cx + dx, cy + dy, 1, 1, cor);
      }
      // manoplas nas pontas dos raios
      [[0, -8], [0, 8], [-8, 0], [8, 0], [-6, -6], [6, -6], [-6, 6], [6, 6]].forEach(function (m) {
        ret(ctx, cx + m[0] - 1, cy + m[1] - 1, 3, 3, K); ret(ctx, cx + m[0], cy + m[1], 1, 1, C.madeiraClara);
      });
    } });
  I.objeto('portugues-diario', { w: 1, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      mesinha(ctx, cx, py, py - 1, '#9fcfff');
      // diário aberto com lápis e bússola
      ret(ctx, cx - 7, py - 8, 15, 8, K); ret(ctx, cx - 6, py - 7, 6, 6, C.creme); ret(ctx, cx + 1, py - 7, 6, 6, C.creme);
      ret(ctx, cx, py - 7, 1, 7, '#2f6fd6');
      for (var j = 0; j < 3; j++) { ret(ctx, cx - 5, py - 6 + j * 2, 4, 1, '#9fcfff'); ret(ctx, cx + 2, py - 6 + j * 2, 4, 1, '#9fcfff'); }
      ret(ctx, cx + 3, py - 12, 1, 5, K); ret(ctx, cx + 3, py - 11, 1, 3, '#ffd34d');
      circulo(ctx, cx - 4, py - 11, 2, K); circulo(ctx, cx - 4, py - 11, 1, C.ouro3); ret(ctx, cx - 4, py - 12, 1, 1, VERM);
    } });
  I.objeto('portugues-boia', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      var cx = px + 8, cy = py + 17;
      ret(ctx, cx, py + 5, 1, 4, K);
      circulo(ctx, cx, cy, 7, K); circulo(ctx, cx, cy, 6, C.branco); circulo(ctx, cx, cy, 3, K); circulo(ctx, cx, cy, 2, '#dcc8b0');
      ret(ctx, cx - 6, cy - 1, 3, 3, VERM); ret(ctx, cx + 4, cy - 1, 3, 3, VERM); ret(ctx, cx - 1, cy - 6, 3, 3, VERM); ret(ctx, cx - 1, cy + 4, 3, 3, VERM);
    } });
  I.objeto('portugues-bandeira', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      // bandeira da expedição: azul com o floquinho de neve
      ret(ctx, px + 3, py + 4, 1, 24, K);
      ret(ctx, px + 4, py + 6, 11, 9, K); ret(ctx, px + 5, py + 7, 9, 7, '#2f6fd6');
      ret(ctx, px + 9, py + 8, 1, 5, C.branco); ret(ctx, px + 7, py + 10, 5, 1, C.branco);
      ret(ctx, px + 7, py + 8, 1, 1, C.branco); ret(ctx, px + 11, py + 8, 1, 1, C.branco); ret(ctx, px + 7, py + 12, 1, 1, C.branco); ret(ctx, px + 11, py + 12, 1, 1, C.branco);
      circulo(ctx, px + 3, py + 4, 1, C.ouro);
    } });
  // placa de gelo pintada no chão, com rachaduras e montinhos de neve
  I.objeto('portugues-gelo', { w: 3, h: 2, solido: false, plano: true, semSombra: true,
    desenhar: function (ctx, px, py, o) {
      var W = (o.w || 3) * 16, H = (o.h || 2) * 16, cx = px + W / 2, cy = py + H / 2;
      elipse(ctx, cx, cy, W / 2 - 1, H / 2 - 1, GELO3); elipse(ctx, cx, cy, W / 2 - 2, H / 2 - 2, GELO); elipse(ctx, cx - 3, cy - 2, W / 2 - 8, H / 2 - 6, '#f6fcff');
      [[-12, -3, 7], [4, 4, 6], [10, -6, 4]].forEach(function (r) { for (var i = 0; i < r[2]; i++) ret(ctx, cx + r[0] + i, cy + r[1] + (i % 3 === 1 ? 1 : 0), 1, 1, GELO2); });
      nuvemNeve(ctx, cx - 16, cy + 6, 6); nuvemNeve(ctx, cx + 12, cy + 7, 5);
    } });
  I.objeto('portugues-ancora', { w: 1, h: 1, topo: 8, solido: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      circulo(ctx, cx, py - 5, 3, K); circulo(ctx, cx, py - 5, 1, '#e9e0cf');
      ret(ctx, cx - 1, py - 2, 3, 14, K); ret(ctx, cx, py - 2, 1, 13, '#5a6a84');
      ret(ctx, cx - 5, py + 1, 11, 3, K); ret(ctx, cx - 4, py + 2, 9, 1, '#5a6a84');
      for (var i = 0; i < 6; i++) { ret(ctx, cx - 7 + i, py + 8 + Math.round(i * 0.8), 2, 2, K); ret(ctx, cx + 6 - i, py + 8 + Math.round(i * 0.8), 2, 2, K); }
      ret(ctx, cx - 8, py + 6, 2, 3, K); ret(ctx, cx + 7, py + 6, 2, 3, K);
    } });
  I.objeto('portugues-cordas', { w: 1, h: 1, topo: 2, solido: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 8, py + 10, 7, 4, K); elipse(ctx, px + 8, py + 10, 6, 3, '#e8c98a');
      elipse(ctx, px + 8, py + 9, 4, 2, '#c9a060'); elipse(ctx, px + 8, py + 9, 2, 1, '#e8c98a'); ret(ctx, px + 8, py + 9, 1, 1, K);
      ret(ctx, px + 13, py + 11, 3, 1, '#c9a060');
    } });

  /* ================= PARQUE DO CARROSSEL ================= */
  // carrossel de três unicórnios, cada um preso na sua barra, em alturas alternadas
  var CARROSSEL_BARRAS = [-15, 0, 15];
  I.objeto('portugues-carrossel', { w: 3, h: 3, topo: 23, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 24;
      // sombra no chão e a plataforma redonda com a saia listrada
      elipse(ctx, cx, py + 44, 24, 4, 'rgba(58,36,70,0.22)');
      elipse(ctx, cx, py + 40, 23, 7, K); elipse(ctx, cx, py + 40, 22, 6, '#ffd1e6'); elipse(ctx, cx, py + 38, 21, 4, '#ffe6f2');
      ret(ctx, cx - 22, py + 40, 45, 3, '#ff7eb6');
      for (var sx = cx - 21; sx < cx + 22; sx += 6) ret(ctx, sx, py + 40, 3, 3, '#ffc2dc');
      ret(ctx, cx - 22, py + 43, 45, 1, K);
      ret(ctx, cx - 19, py + 36, 6, 1, C.branco);
      // coluna central (espelhada, com luzinhas)
      ret(ctx, cx - 3, py - 4, 7, 42, K); ret(ctx, cx - 2, py - 4, 5, 41, '#ffd1e6'); ret(ctx, cx - 2, py - 4, 1, 41, C.branco);
      for (var ly = py + 2; ly < py + 36; ly += 6) { ret(ctx, cx, ly, 1, 1, C.ouro); ret(ctx, cx, ly + 3, 1, 1, '#5fb4ff'); }
      // as três barras douradas, do teto até a plataforma
      CARROSSEL_BARRAS.forEach(function (dx) {
        var bx = cx + dx;
        ret(ctx, bx - 1, py + 3, 3, 36, K); ret(ctx, bx, py + 3, 1, 36, C.ouro); ret(ctx, bx, py + 3, 1, 36, C.ouro);
        for (var k = py + 5; k < py + 38; k += 4) ret(ctx, bx, k, 1, 1, C.ouro3);
      });
      // telhado de lona listrada com babados
      triangulo(ctx, cx - 25, py - 18, 51, 16, K);
      for (var j = 0; j < 14; j++) {
        var m = Math.round(24 * (j + 1) / 15);
        for (var i = -m; i < m; i++) ret(ctx, cx + i, py - 17 + j, 1, 1, (Math.floor((i + 48) / 6) % 2) ? C.branco : '#ff5c8a');
      }
      ret(ctx, cx - 25, py - 3, 51, 4, K); ret(ctx, cx - 24, py - 2, 49, 2, C.ouro);
      for (var b = 0; b < 12; b++) { ret(ctx, cx - 24 + b * 4, py + 1, 4, 3, K); ret(ctx, cx - 23 + b * 4, py + 1, 2, 2, b % 2 ? '#5fb4ff' : '#ff5c8a'); }
      ret(ctx, cx, py - 22, 1, 5, K); ret(ctx, cx + 1, py - 22, 5, 3, VERDE); ret(ctx, cx + 1, py - 22, 5, 1, VERDE3);
    },
    anim: function (ctx, px, py, t) {
      bichinhos(ctx, px, py, t);
    } });
  // unicórnio de carrossel (olhando para a direita): chifre dourado, crina e rabo de duas cores
  var UNI_CARROSSEL = [
    '............y...',
    '...........yy...',
    '.........kkyk...',
    '........kmccck..',
    '.......kmnccecck',
    '.......knmccccck',
    '......kmnmcckkk.',
    '..kkkkknmccck...',
    '.kmkcccccccccck.',
    'kmnkcccccccccck.',
    'kn.kcccccccccck.',
    '....kcckkkkcck..',
    '....kk.....kk...',
  ];
  // sobem e descem em alturas alternadas; parado (sem animações) um fica em cima e os outros embaixo
  function bichinhos(ctx, px, py, t) {
    var cx = px + 24;
    var cores = [['#ffffff', '#ff7eb6', '#b58cff'], ['#e8dcff', '#5fb4ff', '#6fdc8c'], ['#ffe6f2', '#ffd34d', '#ff9d2e']];
    CARROSSEL_BARRAS.forEach(function (dx, i) {
      var fase = (i % 2 ? Math.PI : 0), y = py + 16 + Math.round(Math.sin(t / 420 + fase) * 4.5), x = cx + dx, vira = dx < 0;
      if (!t) y = py + (i % 2 ? 21 : 12);
      var pal = { k: K, K: K, c: cores[i][0], m: cores[i][1], n: cores[i][2], e: K, y: C.ouro };
      for (var j = 0; j < UNI_CARROSSEL.length; j++) for (var a = 0; a < 16; a++) {
        var ch = UNI_CARROSSEL[j][vira ? 15 - a : a], cor = pal[ch];
        if (cor) ret(ctx, x - (vira ? 9 : 6) + a, y + j, 1, 1, cor);
      }
      // bochecha rosada, a selinha no lombo e a barra passando por ela
      ret(ctx, x + (vira ? -3 : 6), y + 5, 1, 1, '#ff9cc6');
      ret(ctx, x - 2, y + 7, 5, 2, VERM); ret(ctx, x - 2, y + 8, 5, 1, VERM2); ret(ctx, x - 1, y + 9, 3, 1, C.ouro);
      ret(ctx, x, y + 6, 1, 4, C.ouro); ret(ctx, x, y + 6, 1, 1, C.ouro3);
    });
  }
  I.objeto('portugues-arvore', { w: 1, h: 1, topo: 28, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 3, py - 6, 7, 21, K); ret(ctx, cx - 2, py - 6, 5, 20, C.madeira2); ret(ctx, cx - 2, py - 6, 1, 20, C.madeira);
      ret(ctx, cx - 5, py + 13, 11, 2, K);
      circulo(ctx, cx, py - 16, 12, K); circulo(ctx, cx, py - 16, 11, FOLHA2);
      circulo(ctx, cx - 4, py - 19, 6, FOLHA); circulo(ctx, cx + 5, py - 14, 5, FOLHA); circulo(ctx, cx + 1, py - 23, 4, '#8fd08f');
      [[-6, -12], [4, -21], [7, -9], [-2, -16]].forEach(function (p) { ret(ctx, cx + p[0], py + p[1], 2, 2, '#ff5c6a'); });
    } });
  I.objeto('portugues-baloes', { w: 1, h: 1, topo: 24, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 5, py + 9, 11, 6, K); ret(ctx, cx - 4, py + 10, 9, 4, '#5fb4ff');
      baloes(ctx, px, py, 0);
    },
    anim: function (ctx, px, py, t) { baloes(ctx, px, py, t); } });
  function baloes(ctx, px, py, t) {
    var cx = px + 8, cores = ['#ff5c8a', '#ffd34d', '#5fb4ff', '#6fdc8c', '#b58cff'];
    [[-6, -20], [0, -24], [6, -19], [-3, -14], [4, -12]].forEach(function (b, i) {
      var d = t ? Math.round(Math.sin(t / 500 + i) * 1) : 0, x = cx + b[0] + d, y = py + b[1];
      ret(ctx, cx, y + 4, 1, py + 10 - y - 4, '#8a7aa8');
      elipse(ctx, x, y, 3, 4, K); elipse(ctx, x, y, 2, 3, cores[i]); ret(ctx, x - 1, y - 2, 1, 1, C.branco);
      ret(ctx, x, y + 4, 1, 1, K);
    });
  }
  I.objeto('portugues-mel', { w: 1, h: 1, topo: 17, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8, MEL = '#ffb020', MEL2 = '#e08a10', MEL3 = '#ffe08a';
      mesinha(ctx, cx, py, py + 1, '#ffe28a');
      // pote de vidro cheio de mel, com rótulo MEL, tampa de paninho xadrez e o mel escorrendo
      ret(ctx, cx - 6, py - 11, 13, 13, K); ret(ctx, cx - 7, py - 9, 15, 9, K);
      ret(ctx, cx - 5, py - 10, 11, 11, MEL); ret(ctx, cx - 6, py - 8, 13, 7, MEL);
      ret(ctx, cx + 4, py - 9, 2, 9, MEL2); ret(ctx, cx - 5, py - 9, 1, 8, MEL3);
      ret(ctx, cx - 5, py, 11, 1, MEL2);
      // rótulo
      ret(ctx, cx - 7, py - 8, 15, 7, K); ret(ctx, cx - 6, py - 7, 13, 5, C.creme);
      D.matriz(ctx, cx - 6, py - 7, ['#...#', '##.##', '#.#.#', '#...#', '#...#'], { '#': '#b8603a' });
      letra(ctx, 'E', cx, py - 7, '#b8603a'); letra(ctx, 'L', cx + 4, py - 7, '#b8603a');
      // tampa de pano vermelho com bolinhas, amarrada
      ret(ctx, cx - 6, py - 15, 13, 5, K); ret(ctx, cx - 5, py - 14, 11, 3, VERM); ret(ctx, cx - 7, py - 12, 15, 2, K); ret(ctx, cx - 6, py - 12, 13, 1, VERM2);
      ret(ctx, cx - 3, py - 14, 1, 1, C.branco); ret(ctx, cx + 1, py - 13, 1, 1, C.branco); ret(ctx, cx + 4, py - 14, 1, 1, C.branco);
      ret(ctx, cx - 5, py - 11, 11, 1, '#f3c890');
      // mel escorrendo pela beirada do pote
      ret(ctx, cx - 6, py - 10, 2, 2, MEL); ret(ctx, cx - 7, py - 9, 1, 4, MEL); ret(ctx, cx - 7, py - 5, 1, 1, MEL2);
      // pingo de mel na mesa e a abelhinha
      ret(ctx, cx + 6, py + 2, 2, 1, MEL);
      ret(ctx, cx + 6, py - 16, 4, 3, K); ret(ctx, cx + 7, py - 15, 1, 1, BANANA); ret(ctx, cx + 9, py - 15, 1, 1, BANANA); ret(ctx, cx + 8, py - 15, 1, 1, K);
      ret(ctx, cx + 7, py - 18, 2, 2, '#dff4ff');
    } });
  I.objeto('portugues-algodao', { w: 1, h: 1, topo: 16, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      circulo(ctx, cx - 4, py + 12, 2, K); circulo(ctx, cx + 5, py + 12, 2, K);
      ret(ctx, cx - 6, py, 13, 11, K); ret(ctx, cx - 5, py + 1, 11, 9, '#9fdcff');
      for (var i = 0; i < 3; i++) ret(ctx, cx - 4 + i * 4, py + 1, 2, 9, C.branco);
      // três algodões-doces nos palitos
      [[-4, -9, '#ff9cc6'], [1, -12, '#c9a8ff'], [5, -8, '#ff9cc6']].forEach(function (a) {
        ret(ctx, cx + a[0], py + a[1] + 3, 1, 1 - a[1] - 3 + 0, C.creme);
        circulo(ctx, cx + a[0], py + a[1], 4, K); circulo(ctx, cx + a[0], py + a[1], 3, a[2]); ret(ctx, cx + a[0] - 2, py + a[1] - 2, 1, 1, C.branco);
      });
    } });
  I.objeto('portugues-poste', { w: 1, h: 1, topo: 22, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 4, py + 11, 9, 4, K); ret(ctx, cx - 3, py + 12, 7, 2, VERDE2);
      ret(ctx, cx - 1, py - 14, 3, 26, K); ret(ctx, cx, py - 14, 1, 25, VERDE);
      ret(ctx, cx - 4, py - 22, 9, 9, K); ret(ctx, cx - 3, py - 21, 7, 7, '#fff3a0'); ret(ctx, cx - 3, py - 21, 2, 7, C.branco);
      triangulo(ctx, cx - 5, py - 26, 11, 5, K); ret(ctx, cx, py - 28, 1, 2, K);
    } });
  I.objeto('portugues-banco-praca', { w: 2, h: 1, topo: 8, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 2, py - 8, 28, 9, K);
      for (var j = 0; j < 3; j++) ret(ctx, px + 3, py - 7 + j * 3, 26, 2, j % 2 ? '#ff9d6a' : '#ff7e5a');
      ret(ctx, px + 1, py + 1, 30, 5, K); ret(ctx, px + 2, py + 2, 28, 3, '#ff9d6a'); ret(ctx, px + 2, py + 2, 28, 1, '#ffc2a0');
      ret(ctx, px + 4, py + 6, 3, 9, K); ret(ctx, px + 25, py + 6, 3, 9, K);
      ret(ctx, px + 5, py + 6, 1, 8, '#5a5a6a'); ret(ctx, px + 26, py + 6, 1, 8, '#5a5a6a');
    } });
  I.objeto('portugues-bola', { w: 1, h: 1, topo: 1, solido: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8, cy = py + 9;
      circulo(ctx, cx, cy, 5, K); circulo(ctx, cx, cy, 4, C.branco);
      ret(ctx, cx - 4, cy - 1, 9, 2, '#ff5c8a'); ret(ctx, cx - 1, cy - 4, 2, 9, '#5fb4ff'); ret(ctx, cx - 2, cy - 3, 1, 1, C.branco);
    } });
  I.objeto('portugues-canteiro-flores', { w: 1, h: 1, topo: 4, solido: true,
    desenhar: function (ctx, px, py, o) {
      var c = v(o, 'cor', '#ff7eb6');
      ret(ctx, px + 1, py + 7, 14, 8, K); ret(ctx, px + 2, py + 8, 12, 6, '#c9a27a'); ret(ctx, px + 2, py + 8, 12, 1, '#e8c9a0');
      ret(ctx, px + 3, py + 9, 10, 2, TERRA);
      [3, 7, 11].forEach(function (x, i) {
        ret(ctx, px + x + 1, py + 3, 1, 6, FOLHA2);
        ret(ctx, px + x, py + 1 + i % 2, 3, 3, i === 1 ? '#ffd34d' : c); ret(ctx, px + x + 1, py + 2 + i % 2, 1, 1, C.branco);
      });
    } });

  /* ================= QUADRO DO RARO, ESTREITO ================= */
  // o mesmo quadro-unicornio da biblioteca, 4 px mais estreito e encostado num lado (var.lado: 'dir'|'esq'),
  // para ficar inteiro ao lado de uma placa de sala comprida (a placa fica no meio da parede, em cima)
  var QU = I.OBJETOS['quadro-unicornio'];
  I.objeto('portugues-quadro-estreito', { w: 2, h: 2, parede: true, solido: false,
    chave: function (P, o) { return QU.chave(P, o); },
    desenhar: function (ctx, px, py, o, P) {
      QU.desenhar(ctx, px + (v(o, 'lado', 'dir') === 'dir' ? 4 : 0), py, Object.assign({}, o, { w: 1.75 }), P);
    } });

  /* ================= AJUDANTES DE MONTAGEM ================= */
  // coordenadas locais do cômodo (0..10 × 0..10; fileiras 0 e 1 são a parede)
  function sala(ox, oy, lista) {
    return lista.map(function (o) { var n = Object.assign({}, o); n.x = o.x + ox; n.y = o.y + oy; return n; });
  }
  function inter(chave, nome, o) {
    return Object.assign(o, { chave: chave, nome: nome, fala: F.objetos[chave] || '(fala de ' + chave + ')' });
  }
  function npc(id, x, y, acao) {
    var e = ELENCO[id] || {};
    return { id: id, nome: e.nome || id, sprite: e.sprite ? Object.assign({ base: 'pessoa' }, e.sprite) : { base: 'pessoa' },
      voz: e.voz || 'npc-' + id, x: x, y: y, acao: acao, falas: F.npcs[id] || {} };
  }
  function acaoSala(s) { return { tipo: 'sala', materia: 'portugues', sala: s }; }

  /* ================= LAYOUT ================= */
  // colunas: 1 | 13 | 25 ; fileiras: 1 (circo, porto, parque) e 13 (cozinha, hall, horta)
  var objetos = [].concat(
    /* ---------- HALL: Casa das Palavras (creme, vermelho e verde) ---------- */
    sala(13, 13, [
      { tipo: 'janela', x: 0, y: 0 }, { tipo: 'portugues-cartaz-aa', x: 1, y: 0 },
      { tipo: 'portugues-varal', x: 2, y: 0, var: { letras: 'ABCDE' } },
      { tipo: 'arandela', x: 4, y: 0 }, { tipo: 'arandela', x: 6, y: 0 },
      { tipo: 'portugues-varal', x: 7, y: 0, var: { letras: 'FGHIL' } },
      { tipo: 'relogio-parede', x: 9, y: 0 }, { tipo: 'janela', x: 10, y: 0 },
      { tipo: 'estante', x: 0, y: 2 }, { tipo: 'pilha-livros', x: 2, y: 2 },
      inter('livro', 'Livro das Letras', { tipo: 'portugues-pulpito', x: 2, y: 3, acao: { tipo: 'tela', tela: 'livro', materia: 'portugues' } }),
      { tipo: 'tapete', x: 0, y: 4, w: 4, h: 1, var: { cor: '#ff9cc6', borda: '#39a860' } },
      { tipo: 'vaso-planta', x: 3, y: 2 },
      { tipo: 'planta-alta', x: 0, y: 5 },
      { tipo: 'flores', x: 8, y: 2, var: { vaso: '#e0433f' } }, { tipo: 'estante', x: 9, y: 2 },
      inter('mapa-casa', 'Mapa da Casa', { tipo: 'portugues-mapa', x: 8, y: 3 }),
      // tapete de página de caderno e a poltrona de leitura com braços
      { tipo: 'portugues-tapete-caderno', x: 7, y: 4, w: 4, h: 1 },
      { tipo: 'portugues-poltrona', x: 8, y: 5 }, { tipo: 'cesto', x: 10, y: 5 },
      // canto do dicionário: nada alto logo embaixo do dicionário e do globo (não "pousam" em cima de nada)
      inter('dicionario', 'Dicionário', { tipo: 'portugues-dicionario', x: 0, y: 8 }),
      { tipo: 'tapete-redondo', x: 1, y: 8, w: 1, h: 1 }, { tipo: 'globo', x: 2, y: 8 },
      { tipo: 'pilha-livros', x: 0, y: 9 }, { tipo: 'almofada', x: 1, y: 9, var: { cor: '#9fe0a0' } },
      { tipo: 'banco', x: 0, y: 10 }, { tipo: 'vaso-planta', x: 2, y: 10 }, { tipo: 'luminaria-pe', x: 3, y: 10 },
      // os blocos ficam um tile abaixo dos pés da Dona Palavrinha (ela fica em 7,8)
      inter('blocos', 'Blocos de letras', { tipo: 'portugues-blocos', x: 7, y: 10 }),
      { tipo: 'mesa', x: 8, y: 9, var: { toalha: '#ffd1e6', itens: ['livro', 'xicara'] } },
      { tipo: 'cabideiro', x: 10, y: 8 }, { tipo: 'relogio-pe', x: 10, y: 10 }, { tipo: 'caixote', x: 10, y: 9, var: { item: 'estrela' } },
      { tipo: 'banco', x: 8, y: 10 }, { tipo: 'almofada', x: 7, y: 8, var: { cor: '#ff9cc6' } },
    ]),
    /* ---------- SALA 1: Cozinha das Receitas (azulejo de morango) ---------- */
    sala(1, 13, [
      // o quadro do raro no canto da parede, fora da placa da sala (que fica no meio, em cima)
      { tipo: 'janela', x: 0, y: 0 }, { tipo: 'portugues-receita', x: 1, y: 0 },
      { tipo: 'portugues-panelas', x: 2, y: 0 }, { tipo: 'cortina', x: 4, y: 0, var: { cor: '#ff9cc6' } },
      { tipo: 'relogio-parede', x: 5, y: 0 }, { tipo: 'prateleira-parede', x: 6, y: 0 }, { tipo: 'janela', x: 8, y: 0 },
      { tipo: 'quadro-unicornio', x: 9, y: 0, var: { uni: 'p-receitinha' } },
      { tipo: 'portugues-geladeira', x: 0, y: 2 }, { tipo: 'portugues-fogao', x: 1, y: 2 },
      { tipo: 'portugues-bancada', x: 3, y: 2 },
      inter('liquidificador', 'Liquidificador', { tipo: 'portugues-liquidificador', x: 6, y: 3 }),
      { tipo: 'portugues-cesta-frutas', x: 5, y: 2 }, { tipo: 'flores', x: 6, y: 2, var: { vaso: '#ff4f6a' } }, { tipo: 'vaso-planta', x: 7, y: 2 },
      inter('abacaxi', 'Abacaxi', { tipo: 'portugues-abacaxi', x: 9, y: 3 }),
      // o caixote embaixo do quadro do raro fica sem nada em cima (senão invade a moldura)
      { tipo: 'barril', x: 8, y: 2 }, { tipo: 'caixote', x: 10, y: 2 }, { tipo: 'cesto', x: 9, y: 2 },
      { tipo: 'tapete-listrado', x: 0, y: 4, w: 3, h: 1, var: { cores: ['#ff4f6a', '#fff4ec', '#39a860', '#fff4ec'] } },
      { tipo: 'tapete', x: 1, y: 6, w: 3, h: 2, var: { cor: '#ffd1e6', borda: '#ff4f6a' } },
      inter('salada', 'Salada de frutas', { tipo: 'portugues-salada', x: 1, y: 8 }),
      { tipo: 'cadeira', x: 0, y: 8, var: { almofada: '#ff9cc6' } }, { tipo: 'cadeira', x: 2, y: 8, var: { almofada: '#9fe0a0' } },
      { tipo: 'mesa', x: 4, y: 9, var: { toalha: '#ffc2d8', itens: ['xicara', 'bolo'] } },
      { tipo: 'portugues-mesa-preparo', x: 7, y: 5 }, { tipo: 'portugues-cesta-frutas', x: 9, y: 5 },
      { tipo: 'portugues-cesta-frutas', x: 5, y: 7 },
      inter('caneca-bolo', 'Bolo de caneca', { tipo: 'portugues-caneca-bolo', x: 6, y: 10 }),
      { tipo: 'portugues-cesta-frutas', x: 0, y: 10 }, { tipo: 'balde', x: 2, y: 10 }, { tipo: 'banco', x: 7, y: 10 },
      { tipo: 'vaso-grande', x: 10, y: 10 }, { tipo: 'cesto', x: 9, y: 10 },
      { tipo: 'almofada', x: 3, y: 8, var: { cor: '#ff9cc6' } },   // encostada na cadeira
    ]),
    /* ---------- SALA 2: Horta do H (terra e verde) ---------- */
    sala(25, 13, [
      { tipo: 'quadro-unicornio', x: 0, y: 0, var: { uni: 'p-hibisco' } },
      { tipo: 'janela', x: 2, y: 0 }, { tipo: 'portugues-cartaz-h', x: 3, y: 0, var: { figura: 'hotel' } },
      { tipo: 'janela', x: 4, y: 0 }, { tipo: 'portugues-cartaz-h', x: 5, y: 0, var: { figura: 'helicoptero' } },
      { tipo: 'bandeirinhas', x: 6, y: 0 }, { tipo: 'janela', x: 8, y: 0 }, { tipo: 'relogio-parede', x: 9, y: 0 }, { tipo: 'janela', x: 10, y: 0 },
      { tipo: 'vaso-planta', x: 6, y: 2 },
      // a placa e o vaso de hortelã ficam uma fileira abaixo dos canteiros (sem cobrir a ponta deles)
      inter('placa-horta', 'Placa da horta', { tipo: 'portugues-placa-horta', x: 1, y: 4 }),
      { tipo: 'portugues-canteiro', x: 2, y: 2, var: { planta: 'alface' } },
      { tipo: 'portugues-canteiro', x: 4, y: 2, var: { planta: 'tomate' } },
      inter('hortela', 'Vaso de hortelã', { tipo: 'portugues-hortela', x: 7, y: 4 }),
      { tipo: 'portugues-canteiro', x: 7, y: 2, var: { planta: 'hortela' } },
      { tipo: 'planta-alta', x: 10, y: 2 }, { tipo: 'portugues-regador', x: 1, y: 2 },
      { tipo: 'portugues-canteiro', x: 3, y: 4, var: { planta: 'cenoura', chao: true } },
      inter('hibisco', 'Pé de hibisco', { tipo: 'portugues-hibisco', x: 9, y: 5 }),
      { tipo: 'portugues-carrinho', x: 10, y: 6 },
      { tipo: 'portugues-leira', x: 6, y: 6, w: 3, h: 1 },
      { tipo: 'portugues-leira', x: 8, y: 8, w: 3, h: 1, var: { planta: 'repolho' } },
      inter('helicoptero', 'Helicóptero de brinquedo', { tipo: 'portugues-helicoptero', x: 5, y: 8 }),
      { tipo: 'portugues-espantalho', x: 3, y: 8 },
      { tipo: 'vaso-grande', x: 0, y: 10 }, { tipo: 'banco', x: 1, y: 10 }, { tipo: 'balde', x: 3, y: 10 },
      { tipo: 'cesto', x: 4, y: 10 }, { tipo: 'flores', x: 6, y: 10 }, { tipo: 'caixote', x: 7, y: 10, var: { item: 'moedas' } },
      { tipo: 'portugues-canteiro', x: 8, y: 10, var: { planta: 'alface', chao: true } },   // com uma fileira livre entre ele e a leira
      { tipo: 'vaso-planta', x: 10, y: 10 }, { tipo: 'portugues-regador', x: 5, y: 6 },
      { tipo: 'portugues-carrinho', x: 0, y: 8 },
    ]),
    /* ---------- SALA 3: Pátio do Circo (lona vermelha e amarelinha no chão) ---------- */
    sala(1, 1, [
      // o quadro do raro no canto da direita, fora da placa da sala (e, no notebook, fora do dinheiro e da estrela)
      { tipo: 'janela', x: 0, y: 0 }, { tipo: 'cartaz', x: 1, y: 0 }, { tipo: 'portugues-lona', x: 2, y: 0 },
      { tipo: 'bandeirinhas', x: 4, y: 0 }, { tipo: 'portugues-lona', x: 6, y: 0, var: { cor: '#7c5cff' } },
      { tipo: 'estandarte', x: 8, y: 0, var: { cor: '#e0433f', emblema: 'estrela' } },
      { tipo: 'quadro-unicornio', x: 9, y: 0, var: { uni: 'p-xicara' } },
      { tipo: 'portugues-banquinho', x: 0, y: 2 },
      inter('chocalho', 'Chocalho', { tipo: 'portugues-chocalho', x: 1, y: 3 }),
      inter('amarelinha', 'Amarelinha', { tipo: 'portugues-amarelinha', x: 2, y: 5 }),
      { tipo: 'portugues-bola-circo', x: 3, y: 2 }, { tipo: 'flores', x: 5, y: 2, var: { vaso: '#7c5cff' } },
      inter('pipoca', 'Carrinho de pipoca', { tipo: 'portugues-pipoca', x: 7, y: 3 }),
      { tipo: 'portugues-banquinho', x: 6, y: 2, var: { cor: '#e0433f' } }, { tipo: 'vaso-planta', x: 4, y: 2 },
      { tipo: 'barril', x: 10, y: 3 },   // longe do chocalho: atrás dele fica o chão
      inter('ninho', 'Ninho', { tipo: 'portugues-ninho', x: 9, y: 4 }),
      { tipo: 'portugues-bola-circo', x: 0, y: 6 }, { tipo: 'balde', x: 0, y: 7 },
      { tipo: 'banco', x: 4, y: 10 }, { tipo: 'portugues-banquinho', x: 6, y: 10, var: { cor: '#39c5bb' } },
      { tipo: 'tapete', x: 7, y: 8, w: 3, h: 2, var: { cor: '#ffd34d', borda: '#e0433f' } },
      { tipo: 'caixote', x: 10, y: 10, var: { item: 'estrela' } }, { tipo: 'cesto', x: 8, y: 10 },
      { tipo: 'luminaria-pe', x: 0, y: 10 }, { tipo: 'portugues-banquinho', x: 5, y: 8, var: { cor: '#ff9d2e' } },
      { tipo: 'portugues-bola-circo', x: 10, y: 8 },
    ]),
    /* ---------- SALA 4: Porto da Expedição (convés de madeira, gelo e mar) ---------- */
    sala(13, 1, [
      { tipo: 'janela', x: 0, y: 0 }, { tipo: 'portugues-boia', x: 1, y: 0 },
      { tipo: 'mapa-parede', x: 2, y: 0 }, { tipo: 'portugues-bandeira', x: 4, y: 0 },
      { tipo: 'relogio-parede', x: 5, y: 0 }, { tipo: 'portugues-boia', x: 6, y: 0 }, { tipo: 'janela', x: 7, y: 0 }, { tipo: 'janela', x: 8, y: 0 },
      { tipo: 'portugues-quadro-estreito', x: 9, y: 0, var: { uni: 'p-iceberg', lado: 'dir' } },
      { tipo: 'portugues-barco', x: 0, y: 2 },
      inter('iceberg', 'Tanque do iceberg', { tipo: 'portugues-iceberg', x: 7, y: 3 }),
      { tipo: 'portugues-ancora', x: 3, y: 2 },
      // na frente do cais só coisas baixas; o albatroz fica num tile livre, com chão atrás dele
      { tipo: 'portugues-cordas', x: 0, y: 4 }, { tipo: 'caixote', x: 1, y: 4, var: { item: 'concha' } },
      { tipo: 'portugues-albatroz', x: 9, y: 4 }, { tipo: 'portugues-leme', x: 7, y: 5 },
      { tipo: 'barril', x: 8, y: 2 }, { tipo: 'portugues-cordas', x: 9, y: 2 }, { tipo: 'caixote', x: 10, y: 2 },   // sem nada em cima: fica embaixo do quadro do raro
      inter('pinguins', 'Pinguins', { tipo: 'portugues-pinguins', x: 0, y: 5 }),
      { tipo: 'portugues-gelo', x: 0, y: 8, w: 3, h: 2 },
      inter('focas', 'Focas', { tipo: 'portugues-focas', x: 8, y: 5 }),
      inter('diario', 'Diário da expedição', { tipo: 'portugues-diario', x: 9, y: 9 }),
      { tipo: 'caixote', x: 10, y: 10, var: { item: 'estrela' } }, { tipo: 'banco', x: 6, y: 10 }, { tipo: 'globo', x: 10, y: 9 },
      { tipo: 'portugues-lampiao', x: 0, y: 10 }, { tipo: 'balde', x: 1, y: 10 }, { tipo: 'portugues-cordas', x: 3, y: 10 },
      { tipo: 'portugues-pinguins', x: 2, y: 8 }, { tipo: 'cesto', x: 8, y: 8 }, { tipo: 'tapete', x: 3, y: 9, w: 2, h: 1, var: { cor: '#9fcfff', borda: '#2f6fd6' } },
    ]),
    /* ---------- SALA 5: Parque do Carrossel (grama e festa) ---------- */
    sala(25, 1, [
      // o quadro do raro no canto da esquerda, fora da placa da sala (e, no notebook, fora da carta do unicórnio)
      { tipo: 'quadro-unicornio', x: 0, y: 0, var: { uni: 'p-farol' } },
      { tipo: 'bandeirinhas', x: 2, y: 0 }, { tipo: 'janela', x: 4, y: 0 }, { tipo: 'bandeirinhas', x: 5, y: 0 }, { tipo: 'janela', x: 7, y: 0 },
      { tipo: 'estandarte', x: 8, y: 0, var: { cor: '#ff5c8a', emblema: 'coracao' } }, { tipo: 'janela', x: 9, y: 0 }, { tipo: 'janela', x: 10, y: 0 },
      inter('arvore', 'Árvore', { tipo: 'portugues-arvore', x: 1, y: 4 }), { tipo: 'portugues-canteiro-flores', x: 2, y: 2 },
      { tipo: 'portugues-bola', x: 0, y: 2 }, { tipo: 'portugues-bola', x: 3, y: 4 },
      inter('carrossel', 'Carrossel', { tipo: 'portugues-carrossel', x: 5, y: 2 }),
      { tipo: 'portugues-canteiro-flores', x: 4, y: 2, var: { cor: '#b58cff' } }, { tipo: 'portugues-canteiro-flores', x: 8, y: 2, var: { cor: '#ffd34d' } },
      { tipo: 'planta-alta', x: 10, y: 2 }, { tipo: 'portugues-poste', x: 9, y: 2 }, { tipo: 'portugues-poste', x: 3, y: 2 },
      inter('baloes', 'Balões', { tipo: 'portugues-baloes', x: 9, y: 4 }),
      { tipo: 'portugues-algodao', x: 10, y: 5 },
      inter('mel', 'Pote de mel', { tipo: 'portugues-mel', x: 8, y: 9 }),
      { tipo: 'portugues-banco-praca', x: 9, y: 10 }, { tipo: 'portugues-bola', x: 10, y: 8 },
      { tipo: 'portugues-banco-praca', x: 0, y: 10 }, { tipo: 'flores', x: 2, y: 10 },
      { tipo: 'portugues-bola', x: 1, y: 8 }, { tipo: 'vaso-grande', x: 0, y: 8 },
      { tipo: 'portugues-canteiro-flores', x: 3, y: 8, var: { cor: '#ff5c6a' } }, { tipo: 'cesto', x: 5, y: 10 },
      { tipo: 'tapete', x: 5, y: 8, w: 2, h: 1, var: { cor: '#ffd1e6', borda: '#ff5c8a' } },
      { tipo: 'portugues-canteiro-flores', x: 6, y: 10 },
      { tipo: 'tapete-listrado', x: 7, y: 7, w: 3, h: 1, var: { cores: ['#ff5c8a', '#fff4ec', '#5fb4ff', '#fff4ec'] } },
    ])
  );

  Reino.registrarInterior({
    id: 'portugues',
    lugar: 'materia:portugues',
    nome: 'Casa das Palavras',
    entrada: true,
    pacote: 'interior-portugues',
    tamanho: { w: 37, h: 25 },
    saida: { x: 18, y: 23 },
    spawn: { x: 18, y: 22 },
    comodos: [
      { id: 'hall', nome: 'Hall', placa: 'Hall • Casa das Palavras', rect: { x: 13, y: 13, w: 11, h: 11 },
        piso: 'mosaico', parede: 'papel', paleta: { piso: '#fff4ec', piso2: '#ff9cc6', detalhe: '#39a860', parede: '#fff4ec', parede2: '#ffd9d0', rodape: '#b82e35' } },
      { id: 'cozinha', nome: 'Cozinha das Receitas', placa: 'Sala 1 • Receita de Quê?', rect: { x: 1, y: 13, w: 11, h: 11 },
        piso: 'azulejo', parede: 'azulejo', paleta: { piso: '#fff4ec', piso2: '#ffc2c8', detalhe: '#ff4f6a', parede: '#fffaf2', parede2: '#ffd1d6', rodape: '#b82e35' } },
      { id: 'horta', nome: 'Horta do H', placa: 'Sala 2 • O H Silencioso', rect: { x: 25, y: 13, w: 11, h: 11 },
        piso: 'carpete', parede: 'madeira', paleta: { piso: '#b4d67e', piso2: '#94bd62', parede: '#e8f6d8', parede2: '#b6d88a', rodape: '#2a7d48' } },
      { id: 'circo', nome: 'Pátio do Circo', placa: 'Sala 3 • CH, LH, NH e o X', rect: { x: 1, y: 1, w: 11, h: 11 },
        piso: 'tabuas', parede: 'papel', paleta: { piso: '#f0c890', piso2: '#d09a5a', parede: '#fff1f4', parede2: '#ffd34d', rodape: '#7c5cff' } },
      { id: 'porto', nome: 'Porto da Expedição', placa: 'Sala 4 • Expedição Antártida', rect: { x: 13, y: 1, w: 11, h: 11 },
        piso: 'tabuas', parede: 'madeira', paleta: { piso: '#d8c0a0', piso2: '#a88a68', parede: '#e8f6ff', parede2: '#bfe4f5', rodape: '#2f4f8a' } },
      { id: 'parque', nome: 'Parque do Carrossel', placa: 'Sala 5 • L, R e RR', rect: { x: 25, y: 1, w: 11, h: 11 },
        piso: 'carpete', parede: 'papel', paleta: { piso: '#a8dc8a', piso2: '#8fcc72', parede: '#e6f6ff', parede2: '#ffd1e6', rodape: '#39a860' } },
    ],
    portas: [
      { x: 12, y: 19, w: 1, h: 2 },   // cozinha ↔ hall
      { x: 24, y: 19, w: 1, h: 2 },   // hall ↔ horta
      { x: 18, y: 12, w: 1, h: 3 },   // hall ↔ porto (atravessa a parede do fundo do hall)
      { x: 12, y: 7, w: 1, h: 2 },    // circo ↔ porto
      { x: 24, y: 7, w: 1, h: 2 },    // porto ↔ parque
    ],
    corredores: [
      { x: 17, y: 15, w: 3, h: 9 }, { x: 13, y: 19, w: 11, h: 2 },   // hall
      { x: 8, y: 19, w: 4, h: 2 }, { x: 25, y: 19, w: 4, h: 2 },     // entradas da cozinha e da horta
      { x: 17, y: 3, w: 3, h: 9 }, { x: 13, y: 7, w: 11, h: 2 },     // porto
      { x: 8, y: 7, w: 4, h: 2 }, { x: 25, y: 7, w: 4, h: 2 },       // entradas do circo e do parque
    ],
    objetos: objetos,
    npcs: [
      npc('palavrinha', 20, 21, { tipo: 'guia', lugar: 'materia:portugues', livro: 'portugues' }),
      npc('manu', 5, 18, acaoSala('p1')),
      npc('heitor', 30, 18, acaoSala('p2')),
      npc('chocalho', 6, 6, acaoSala('p3')),
      npc('brisa', 16, 6, acaoSala('p4')),
      npc('carlos', 30, 6, acaoSala('p5')),
    ],
  });

  /* ================= A CASA DE FORA (mapa) ================= */
  // casinha de cozinha com chaminé, o livro aberto "Aa" no telhado e a flâmula do lápis; porta roxa no meio da última fileira
  function desenharFora(ctx, px, py, w, h, cores) {
    cores = cores || {};
    var parede = cores.parede || CREME, telhado = cores.telhado || VERM, det = cores.detalhe || VERDE;
    var parede2 = '#f3dccb', telhado2 = escurecer(telhado, 0.22), telhadoL = clarear(telhado, 0.3), det2 = escurecer(det, 0.25);
    var cx = px + w / 2;
    // chaminé de tijolinho (atrás do telhado, à direita) com a fumacinha parada
    ret(ctx, px + 55, py + 6, 11, 20, K); ret(ctx, px + 56, py + 7, 9, 19, '#d9785a');
    for (var tj = py + 9; tj < py + 24; tj += 3) ret(ctx, px + 56 + ((tj / 3) % 2 ? 0 : 4), tj, 4, 1, '#b85a40');
    ret(ctx, px + 54, py + 4, 13, 4, K); ret(ctx, px + 55, py + 5, 11, 2, '#e8957a');
    [[61, 1, 3], [65, -4, 4], [60, -8, 3]].forEach(function (f) { circulo(ctx, px + f[0], py + f[1], f[2], '#f1eef8'); ret(ctx, px + f[0] - 1, py + f[1] - 1, 1, 1, C.branco); });
    // corpo da casa com as tábuas
    contornoRet(ctx, px + 6, py + 34, w - 12, h - 34, parede);
    for (var j = py + 40; j < py + h - 2; j += 6) ret(ctx, px + 7, j, w - 14, 1, parede2);
    ret(ctx, px + w - 14, py + 35, 7, h - 36, '#f7e6da');
    // telhado vermelho com fileiras de telhas redondinhas
    triangulo(ctx, px + 1, py + 8, w - 2, 28, K);
    triangulo(ctx, px + 4, py + 11, w - 8, 24, telhado);
    for (var ty = py + 17; ty < py + 34; ty += 4) {
      var meia = Math.round((w - 8) / 2 * (ty - py - 11 + 1) / 24) - 3;
      for (var tx = cx - meia + 1; tx < cx + meia - 2; tx += 5) { ret(ctx, tx, ty, 4, 1, telhado2); ret(ctx, tx + 1, ty - 1, 2, 1, telhadoL); }
    }
    ret(ctx, px + 2, py + 33, w - 4, 3, K); ret(ctx, px + 3, py + 34, w - 6, 1, telhado2);
    // livro aberto no telhado (a placa da casa), com o "Aa" grandão: capa vermelha, páginas e a fitinha
    var LA = ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'];
    var La = ['.##.', '...#', '.###', '#..#', '.###'];
    ret(ctx, cx - 14, py + 18, 29, 12, K); ret(ctx, cx - 13, py + 19, 27, 10, telhado2);
    ret(ctx, cx - 12, py + 16, 25, 12, K);
    ret(ctx, cx - 11, py + 17, 11, 10, C.creme); ret(ctx, cx + 1, py + 17, 11, 10, C.creme);
    ret(ctx, cx - 11, py + 17, 3, 1, '#fffaf2'); ret(ctx, cx + 9, py + 17, 3, 1, '#fffaf2');
    ret(ctx, cx - 1, py + 16, 3, 1, K); ret(ctx, cx - 2, py + 17, 1, 10, '#e8d8c0'); ret(ctx, cx + 2, py + 17, 1, 10, '#e8d8c0');
    ret(ctx, cx, py + 17, 1, 11, K);
    D.matriz(ctx, cx - 9, py + 19, LA, { '#': telhado });
    D.matriz(ctx, cx + 4, py + 21, La, { '#': det2 });
    ret(ctx, cx - 10, py + 27, 21, 1, '#e8d8c0');
    ret(ctx, cx + 1, py + 28, 1, 4, '#ffd34d'); ret(ctx, cx + 1, py + 31, 1, 1, '#e0a020');
    // flâmula amarela com um lápis, no bico do telhado (3 px mais baixa: a placa do nome não tampa a ponta do mastro)
    var fy = py + 3;
    ret(ctx, cx - 1, fy - 5, 2, py + 10 - (fy - 5), K); ret(ctx, cx - 1, fy - 4, 1, py + 9 - (fy - 4), '#c9a27a');
    circulo(ctx, cx - 1, fy - 6, 1, C.ouro);
    for (var fi = 0; fi < 14; fi++) {
      var meiaF = Math.max(0, Math.round(4 * (1 - fi / 14))), fx = cx + 1 + fi;
      ret(ctx, fx, fy - 1 - meiaF - 1, 1, meiaF * 2 + 3, K);
      if (meiaF > 0) { ret(ctx, fx, fy - 1 - meiaF, 1, meiaF * 2 + 1, '#ffd34d'); ret(ctx, fx, fy - 1 - meiaF, 1, 1, '#fff0a0'); }
    }
    // o lápis: borracha rosa, corpo laranja, madeira e a ponta
    ret(ctx, cx + 2, fy - 2, 1, 3, '#ff9cc6'); ret(ctx, cx + 3, fy - 2, 1, 3, '#c9c2d8');
    ret(ctx, cx + 4, fy - 2, 4, 3, '#ff7a3a'); ret(ctx, cx + 4, fy - 1, 4, 1, '#ffb070');
    ret(ctx, cx + 8, fy - 2, 1, 3, '#f3c890'); ret(ctx, cx + 9, fy - 1, 1, 1, K);
    // toldo listrado verde e creme em cima da porta e das janelas
    var ay = py + 37;
    ret(ctx, px + 9, ay, w - 18, 6, K);
    for (var i = px + 10, k = 0; i < px + w - 10; i += 4, k++) ret(ctx, i, ay + 1, 4, 4, k % 2 ? C.branco : det);
    for (var s = px + 10, k2 = 0; s < px + w - 10; s += 4, k2++) { ret(ctx, s, ay + 5, 4, 2, K); ret(ctx, s + 1, ay + 5, 2, 1, k2 % 2 ? C.branco : det); }
    // janela da cozinha (esquerda) com a torta esfriando e a cortininha
    var jx = px + 10, jy = py + 47;
    contornoRet(ctx, jx, jy, 16, 13, '#bfe9ff');
    ret(ctx, jx + 1, jy + 1, 14, 3, '#ff9cc6'); for (var c = jx + 2; c < jx + 15; c += 3) ret(ctx, c, jy + 4, 1, 1, '#ff9cc6');
    ret(ctx, jx + 2, jy + 5, 3, 3, C.branco);
    ret(ctx, jx - 1, jy + 13, 18, 3, K); ret(ctx, jx, jy + 13, 16, 1, det);
    ret(ctx, jx + 3, jy + 10, 10, 3, K); ret(ctx, jx + 4, jy + 10, 8, 2, '#e8a060'); ret(ctx, jx + 5, jy + 10, 2, 1, MORANGO); ret(ctx, jx + 9, jy + 10, 2, 1, MORANGO);
    // janela redonda (direita) com uma xícara
    var rx = px + 62, ry = py + 52;
    circulo(ctx, rx, ry, 7, K); circulo(ctx, rx, ry, 6, det); circulo(ctx, rx, ry, 4, K); circulo(ctx, rx, ry, 3, '#eef9ff');
    ret(ctx, rx - 2, ry, 4, 3, '#ff7eb6'); ret(ctx, rx + 2, ry + 1, 1, 1, '#ff7eb6'); ret(ctx, rx - 1, ry - 2, 1, 1, C.branco);
    // degrau de pedra e a porta roxa de arco com moldura dourada (como todas as entradas do reino)
    ret(ctx, cx - 12, py + h - 5, 25, 5, K); ret(ctx, cx - 11, py + h - 4, 23, 3, '#e8d3a8');
    ret(ctx, cx - 11, py + h - 4, 23, 1, '#fff0d0'); ret(ctx, cx - 11, py + h - 2, 23, 1, '#d4bc8c');
    for (var dg = cx - 7; dg < cx + 11; dg += 6) ret(ctx, dg, py + h - 3, 1, 2, '#c9ae80');
    var dx = cx - 7, dy = py + h - 26, dw = 14, dh = 21, roxo = '#7c5cff';
    ret(ctx, dx - 1, dy + 2, dw + 2, dh - 2, C.ouro); elipse(ctx, dx + dw / 2 - 0.5, dy + 3, dw / 2, 3, C.ouro);
    ret(ctx, dx, dy + 3, dw, dh - 3, roxo); elipse(ctx, dx + dw / 2 - 0.5, dy + 4, dw / 2 - 1, 3, roxo);
    ret(ctx, dx + dw / 2 - 1, dy + 5, 1, dh - 5, escurecer(roxo, 0.25));
    ret(ctx, dx + 1, dy + 6, 1, dh - 7, clarear(roxo, 0.3));
    ret(ctx, dx + dw - 4, dy + dh / 2 + 2, 2, 2, C.ouro);
    // sombra de 2 px na base da casa
    ret(ctx, px + 7, py + h, w - 14, 1, 'rgba(58,36,70,0.28)'); ret(ctx, px + 9, py + h + 1, w - 18, 1, 'rgba(58,36,70,0.14)');
    // pilha de livros ao lado da porta (esquerda) e um vaso de hortelã (direita)
    var lx = px + 12, lb = py + h - 2;
    livrinho(ctx, lx, lb, 14, 5, '#5fb4ff'); livrinho(ctx, lx + 1, lb - 4, 12, 5, '#ffd34d'); livrinho(ctx, lx + 2, lb - 8, 11, 5, '#ff7eb6');
    livrinho(ctx, lx + 3, lb - 12, 8, 5, det);
    var vx = px + w - 20, vb = py + h - 2;
    ret(ctx, vx, vb - 7, 9, 7, K); ret(ctx, vx + 1, vb - 6, 7, 5, C.terracota); ret(ctx, vx - 1, vb - 8, 11, 2, K);
    [[1, -12], [4, -14], [7, -12], [3, -10], [6, -10]].forEach(function (f) { ret(ctx, vx + f[0], vb + f[1], 2, 3, K); ret(ctx, vx + f[0], vb + f[1], 1, 2, '#6fdc8c'); });
    // brilhinhos
    [[4, 30], [76, 40]].forEach(function (b) { brilho(ctx, px + b[0], py + b[1], C.branco); });
  }
  if (window.Mapa && Mapa.PREDIOS) Mapa.PREDIOS.palavras = desenharFora;
})();
