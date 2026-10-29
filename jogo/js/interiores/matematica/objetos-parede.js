/* Torre dos Números (Matemática), objetos de parede (prefixo matematica-): números, formas, calendário,
   relógio, gráfico, varal de pares e tabuada. Os algarismos em pixel (S.texto) ficam em Reino._predios.matematica
   para os objetos de chão (objetos-chao.js) e a planta das salas (salas.js). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var clarear = D.clarear, escurecer = D.escurecer;
  var K = R.Desenho.K;
  var S = (R._predios = R._predios || {}).matematica = (R._predios.matematica || {});
  function v(o, k, padrao) { return (o && o.var && o.var[k] !== undefined) ? o.var[k] : padrao; }
  // cores da Torre: o azul da matéria (arte.md §22) e os acentos dos blocos de contar
  var AZUL = '#3f7fe0', AMAR = '#ffc93c', VERM = '#e0433f', VERDE = '#3fbf7f', LARANJA = '#ff8c42', ROSA = '#ff7aa8';
  S.CORES = { azul: AZUL, amarelo: AMAR, vermelho: VERM, verde: VERDE, laranja: LARANJA, rosa: ROSA, lousa: '#2f6b55' };
  var BLOCOS = [VERM, AMAR, AZUL, VERDE, LARANJA, ROSA];
  S.BLOCOS = BLOCOS;

  /* ================= ALGARISMOS 3×5 ================= */
  var FONTE = {
    '0': ['###', '#.#', '#.#', '#.#', '###'], '1': ['.#.', '##.', '.#.', '.#.', '###'],
    '2': ['##.', '..#', '.#.', '#..', '###'], '3': ['##.', '..#', '.#.', '..#', '##.'],
    '4': ['#.#', '#.#', '###', '..#', '..#'], '5': ['###', '#..', '##.', '..#', '##.'],
    '6': ['.##', '#..', '###', '#.#', '###'], '7': ['###', '..#', '.#.', '.#.', '.#.'],
    '8': ['###', '#.#', '###', '#.#', '###'], '9': ['###', '#.#', '###', '..#', '##.'],
    'x': ['...', '#.#', '.#.', '#.#', '...'], '+': ['...', '.#.', '###', '.#.', '...'],
    '=': ['...', '###', '...', '###', '...'], ':': ['.', '#', '.', '#', '.'],
    'D': ['##.', '#.#', '#.#', '#.#', '##.'], 'S': ['.##', '#..', '.#.', '..#', '##.'],
    'T': ['###', '.#.', '.#.', '.#.', '.#.'], 'Q': ['.#.', '#.#', '#.#', '#.#', '.##'],
  };
  // um caractere (3×5, ':' 1×5); devolve a largura
  function letra(ctx, x, y, ch, cor) {
    var m = FONTE[ch];
    if (!m) return 3;
    D.matriz(ctx, x, y, m, { '#': cor });
    return m[0].length;
  }
  // texto em pixel, 1 px entre as letras; devolve a largura total
  function texto(ctx, x, y, s, cor) {
    var w = 0;
    String(s).split('').forEach(function (ch) { if (ch === ' ') { w += 2; return; } w += letra(ctx, x + w, y, ch, cor) + 1; });
    return w - 1;
  }
  function largura(s) {
    return String(s).split('').reduce(function (w, ch) { return w + (ch === ' ' ? 2 : ((FONTE[ch] || ['...'])[0].length + 1)); }, 0) - 1;
  }
  S.texto = texto; S.largura = largura;
  // texto centrado em cx
  function textoC(ctx, cx, y, s, cor) { return texto(ctx, Math.round(cx - largura(s) / 2), y, s, cor); }
  S.textoC = textoC;
  // brilho de 1 px no canto de cima à esquerda (luz de cima, arte.md §13)
  function luz(ctx, x, y, w, cor) { ret(ctx, x, y, w, 1, cor); }

  /* ================= PAREDE ================= */
  // faixa de números coloridos (var.texto: até 5 caracteres; cada algarismo numa placa de cor)
  I.objeto('matematica-numeros', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var s = String(v(o, 'texto', '123')).slice(0, 5), n = s.length, W = 32, pw = n > 4 ? 5 : 6;
      var x0 = px + Math.round((W - (n * (pw + 1) - 1)) / 2);
      ret(ctx, px + 2, py + 7, W - 4, 1, K);   // o cordão
      for (var i = 0; i < n; i++) {
        var x = x0 + i * (pw + 1), y = py + 9 + (i % 2) * 2, c = BLOCOS[(i + v(o, 'desloca', 0)) % BLOCOS.length];
        ret(ctx, x + 2, py + 7, 1, y - py - 7, K);
        contornoRet(ctx, x - 1, y, pw + 2, 11, c);
        luz(ctx, x, y + 1, pw, clarear(c, 0.45));
        letra(ctx, x + 1, y + 3, s[i], s[i] === 'x' || s[i] === '+' ? C.branco : K);
      }
    } });
  // cartaz das formas: círculo, triângulo e quadrado
  I.objeto('matematica-formas', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      contornoRet(ctx, px + 1, py + 5, 14, 23, C.creme);
      ret(ctx, px + 2, py + 6, 12, 2, AZUL); luz(ctx, px + 2, py + 6, 12, clarear(AZUL, 0.45));
      circulo(ctx, px + 5, py + 12, 3, K); circulo(ctx, px + 5, py + 12, 2, VERM);
      triangulo(ctx, px + 8, py + 9, 7, 6, K); triangulo(ctx, px + 9, py + 11, 5, 4, AMAR);
      ret(ctx, px + 4, py + 18, 8, 7, K); ret(ctx, px + 5, py + 19, 6, 5, VERDE); luz(ctx, px + 5, py + 19, 6, clarear(VERDE, 0.4));
    } });
  // calendário de folha grande: mês no alto, a grade dos dias e um dia marcado (var.dia, var.cor)
  I.objeto('matematica-calendario', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var x = px + 3, y = py + 5, c = v(o, 'cor', VERM), marca = v(o, 'dia', 10);
      ret(ctx, x + 6, y - 1, 2, 3, K); ret(ctx, x + 18, y - 1, 2, 3, K);   // argolas
      contornoRet(ctx, x, y + 1, 26, 22, C.branco);
      ret(ctx, x + 1, y + 2, 24, 5, c); luz(ctx, x + 1, y + 2, 24, clarear(c, 0.45));
      // as 7 colunas da semana, domingo em vermelho
      for (var d = 0; d < 28; d++) {
        var cx = x + 2 + (d % 7) * 3, cy = y + 9 + Math.floor(d / 7) * 4;
        ret(ctx, cx, cy, 2, 2, d % 7 === 0 ? clarear(VERM, 0.3) : '#b8c6e0');
        if (d === marca) { ret(ctx, cx - 1, cy - 1, 4, 4, K); ret(ctx, cx, cy, 2, 2, AMAR); }
      }
    } });
  // relógio grande de parede, com os números 12, 3, 6 e 9 e os ponteiros (var.hora)
  I.objeto('matematica-relogio', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var cx = px + 16, cy = py + 16, h = v(o, 'hora', 3) % 12;
      circulo(ctx, cx, cy, 12, K); circulo(ctx, cx, cy, 11, v(o, 'cor', AZUL)); circulo(ctx, cx, cy, 9, C.creme);
      ret(ctx, cx - 5, cy - 10, 5, 1, clarear(v(o, 'cor', AZUL), 0.5));   // brilho da borda, em cima
      textoC(ctx, cx, cy - 8, '12', K); texto(ctx, cx + 5, cy - 2, '3', K);
      textoC(ctx, cx, cy + 4, '6', K); texto(ctx, cx - 7, cy - 2, '9', K);
      // ponteiro dos minutos no 12 e das horas na hora pedida (passos de 3 horas)
      ret(ctx, cx, cy - 6, 1, 6, K);
      var dir = [[0, -1], [1, 0], [0, 1], [-1, 0]][Math.floor(h / 3) % 4];
      for (var i = 1; i <= 4; i++) ret(ctx, cx + dir[0] * i, cy + dir[1] * i, 1, 1, VERM);
      ret(ctx, cx, cy, 1, 1, K);
    },
    anim: function (ctx, px, py, t) {
      // o ponteiro dos segundos dá a volta devagar (8 posições)
      var cx = px + 16, cy = py + 16, a = Math.floor(t / 1000) % 8, d = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]][a];
      for (var i = 2; i <= 6; i++) ret(ctx, cx + d[0] * i, cy + d[1] * i, 1, 1, AMAR);
    } });
  // cartaz do dia e da noite: o sol em cima (manhã) e a lua embaixo (noite)
  I.objeto('matematica-dia-noite', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 5, 14, 23, K);
      ret(ctx, px + 2, py + 6, 12, 10, '#bfe9ff'); ret(ctx, px + 2, py + 16, 12, 11, '#2e2b5f');
      circulo(ctx, px + 8, py + 11, 3, K); circulo(ctx, px + 8, py + 11, 2, AMAR);
      ret(ctx, px + 8, py + 7, 1, 1, AMAR); ret(ctx, px + 4, py + 11, 1, 1, AMAR); ret(ctx, px + 12, py + 11, 1, 1, AMAR);
      circulo(ctx, px + 8, py + 21, 3, '#fff3a0'); circulo(ctx, px + 10, py + 20, 3, '#2e2b5f');
      ret(ctx, px + 4, py + 18, 1, 1, C.branco); ret(ctx, px + 12, py + 24, 1, 1, C.branco);
    } });
  // gráfico de barras com a contagem de risquinhos embaixo (var.barras: alturas de 1 a 5)
  I.objeto('matematica-grafico', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var x = px + 2, y = py + 6, b = v(o, 'barras', [2, 4, 3, 5]);
      contornoRet(ctx, x, y, 28, 22, C.branco);
      ret(ctx, x + 3, y + 3, 1, 15, K); ret(ctx, x + 3, y + 18, 22, 1, K);
      b.forEach(function (h, i) {
        var c = BLOCOS[i % BLOCOS.length], bx = x + 6 + i * 5, bh = h * 3;
        ret(ctx, bx, y + 18 - bh, 4, bh, K); ret(ctx, bx + 1, y + 19 - bh, 2, bh - 1, c);
        ret(ctx, bx + 1, y + 19 - bh, 1, 1, clarear(c, 0.5));
      });
    } });
  // varal de pares de meias: cada par é o dobro de uma (Sala do Dobro e do Triplo)
  I.objeto('matematica-varal-pares', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 8, 30, 1, K);
      ret(ctx, px + 1, py + 6, 1, 4, K); ret(ctx, px + 30, py + 6, 1, 4, K);
      [VERM, AZUL, VERDE].forEach(function (c, p) {
        for (var k = 0; k < 2; k++) {
          var x = px + 3 + p * 10 + k * 4;
          ret(ctx, x + 1, py + 7, 1, 3, C.madeira);   // prendedor
          ret(ctx, x, py + 9, 4, 11, K); ret(ctx, x + 1, py + 10, 2, 9, c); ret(ctx, x + 1, py + 10, 2, 1, C.branco);
          ret(ctx, x, py + 18, 6, 4, K); ret(ctx, x + 1, py + 18, 4, 3, c); ret(ctx, x + 1, py + 13, 2, 1, clarear(c, 0.5));
        }
      });
    } });
  // lousa verde com a tabuada escrita a giz (var.tab: 4 ou 5)
  I.objeto('matematica-tabuada', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var x = px + 1, y = py + 5, n = v(o, 'tab', 4), giz = '#eef6e8';
      contornoRet(ctx, x, y, 30, 22, C.madeira);
      ret(ctx, x + 2, y + 2, 26, 17, S.CORES.lousa);
      ret(ctx, x + 2, y + 2, 26, 1, clarear(S.CORES.lousa, 0.25));
      for (var i = 1; i <= 3; i++) texto(ctx, x + 3, y + 4 + (i - 1) * 5, n + 'x' + i + '=' + (n * i), i === 3 ? AMAR : giz);
      ret(ctx, x + 1, y + 20, 28, 2, K); ret(ctx, x + 2, y + 20, 26, 1, C.madeiraClara);
      ret(ctx, x + 20, y + 19, 3, 1, C.branco); ret(ctx, x + 24, y + 19, 2, 1, ROSA);
    } });

  S.escurecer = escurecer; S.clarear = clarear;
})();
