/* Casa das Palavras (Português): hall + 5 cômodos, um para cada sala.
   Hall (Dona Palavrinha e o Livro das Letras), Cozinha das Receitas, Horta do H, Pátio do Circo,
   Porto da Expedição e Parque do Carrossel. Também desenha a casa de fora, no mapa (Mapa.PREDIOS.palavras).
   Só dados, objetos e registros; nada de DOM, PA ou Progresso no carregamento.
   As falas moram em portugues-falas.js. */
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
    Z: ['###', '..#', '.#.', '#..', '###'], a: ['...', '##.', '.##', '#.#', '.##'],
  };
  function letra(ctx, ch, x, y, cor) {
    var m = FONTE[ch];
    if (!m) return;
    for (var j = 0; j < 5; j++) for (var i = 0; i < 3; i++) if (m[j][i] === '#') ret(ctx, x + i, y + j, 1, 1, cor);
  }
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
      letra(ctx, 'A', px + 4, py + 13, c); letra(ctx, 'a', px + 8, py + 13, VERDE);
      ret(ctx, px + 4, py + 20, 8, 1, '#c8b8d8'); ret(ctx, px + 4, py + 22, 6, 1, '#c8b8d8');
      ret(ctx, px + 7, py + 5, 2, 2, K);
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
  I.objeto('portugues-salada', { w: 1, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      mesinha(ctx, cx, py, py - 1, '#ffc2d8');
      // tigela de vidro com a salada de frutas
      elipse(ctx, cx, py - 5, 7, 5, K);
      ret(ctx, cx - 7, py - 7, 15, 3, K); ret(ctx, cx - 6, py - 7, 13, 3, '#dff4ff');
      elipse(ctx, cx, py - 4, 6, 3, '#dff4ff'); ret(ctx, cx - 5, py - 7, 1, 3, C.branco);
      ret(ctx, cx - 6, py - 9, 13, 3, K);
      ret(ctx, cx - 5, py - 9, 3, 2, MORANGO); ret(ctx, cx - 2, py - 10, 3, 2, BANANA); ret(ctx, cx + 1, py - 9, 2, 2, KIWI);
      ret(ctx, cx + 3, py - 10, 3, 2, LARANJA); ret(ctx, cx - 1, py - 8, 2, 1, UVA); ret(ctx, cx + 4, py - 8, 2, 1, MORANGO);
      ret(ctx, cx + 5, py - 13, 1, 4, C.metal); ret(ctx, cx + 4, py - 14, 3, 2, C.metal2);
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
      ret(ctx, px + 1, py + 3, W - 2, 12, K); ret(ctx, px + 2, py + 4, W - 4, 10, C.madeira); ret(ctx, px + 2, py + 4, W - 4, 1, C.madeiraClara);
      ret(ctx, px + 3, py + 5, W - 6, 4, TERRA); for (var t = px + 4; t < px + W - 4; t += 4) ret(ctx, t, py + 6, 1, 1, TERRA2);
      for (var x = px + 6; x < px + W - 4; x += 8) {
        if (planta === 'alface') { elipse(ctx, x, py + 3, 3, 3, K); elipse(ctx, x, py + 3, 2, 2, KIWI); ret(ctx, x, py + 2, 1, 2, FOLHA2); }
        else if (planta === 'cenoura') { ret(ctx, x - 1, py + 5, 3, 2, LARANJA); ret(ctx, x, py - 1, 1, 6, FOLHA); ret(ctx, x - 2, py, 1, 4, FOLHA2); ret(ctx, x + 2, py, 1, 4, FOLHA2); }
        else if (planta === 'tomate') {
          ret(ctx, x, py - 7, 1, 12, FOLHA2); ret(ctx, x - 2, py - 4, 5, 1, FOLHA);
          circulo(ctx, x - 2, py - 1, 2, K); circulo(ctx, x - 2, py - 1, 1, '#ff4f5e'); circulo(ctx, x + 2, py - 5, 2, K); circulo(ctx, x + 2, py - 5, 1, '#ff4f5e');
        } else { // hortelã
          [[-2, 2], [0, 0], [2, 2], [-1, -2], [1, -3]].forEach(function (f) { ret(ctx, x + f[0], py + f[1] + 1, 2, 2, K); ret(ctx, x + f[0], py + f[1] + 1, 1, 1, '#7fe08a'); });
        }
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
      ret(ctx, cx - 5, py + 5, 11, 10, K); ret(ctx, cx - 4, py + 6, 9, 8, '#e8b27a'); ret(ctx, cx - 4, py + 6, 9, 1, '#ffd9a8');
      circulo(ctx, cx, py - 5, 9, K); circulo(ctx, cx, py - 5, 8, FOLHA2);
      circulo(ctx, cx - 3, py - 8, 4, FOLHA); circulo(ctx, cx + 4, py - 3, 4, FOLHA); circulo(ctx, cx - 2, py, 3, FOLHA);
      // flores de hibisco: 5 pétalas vermelhas e o miolo amarelo comprido
      [[-4, -9], [4, -7], [0, -2], [-5, 0], [5, 1]].forEach(function (f) {
        var x = cx + f[0], y = py + f[1];
        ret(ctx, x - 2, y - 1, 5, 3, '#ff3b5c'); ret(ctx, x - 1, y - 2, 3, 5, '#ff3b5c'); ret(ctx, x - 1, y - 1, 1, 1, '#ff8aa0');
        ret(ctx, x, y, 1, 1, '#c01a3a'); ret(ctx, x + 1, y - 2, 1, 1, BANANA);
      });
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
  I.objeto('portugues-chocalho', { w: 1, h: 1, topo: 14, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      // pedestal de circo (tamborzinho vermelho e dourado)
      ret(ctx, cx - 6, py + 3, 13, 12, K); ret(ctx, cx - 5, py + 4, 11, 10, VERM);
      for (var i = 0; i < 4; i++) ret(ctx, cx - 4 + i * 3, py + 5 + (i % 2) * 4, 2, 4, C.ouro);
      elipse(ctx, cx, py + 3, 6, 2, K); elipse(ctx, cx, py + 3, 5, 1, C.ouro3);
      // chocalho grandão: cabo e cabeça redonda com bolinhas
      ret(ctx, cx - 1, py - 4, 3, 7, K); ret(ctx, cx, py - 4, 1, 6, C.madeira);
      circulo(ctx, cx, py - 9, 6, K); circulo(ctx, cx, py - 9, 5, '#ff9d2e');
      ret(ctx, cx - 5, py - 9, 11, 1, '#fff3a0');
      [[-2, -12], [2, -11], [-3, -6], [2, -6]].forEach(function (p) { ret(ctx, cx + p[0], py + p[1], 1, 1, '#b8452e'); });
      // contas coloridas em volta (o chique-chique do chocalho)
      [[-7, -9, '#5fb4ff'], [7, -9, '#ff4f9a'], [-5, -14, '#6fdc8c'], [5, -14, '#ffe066'], [-5, -4, '#b58cff'], [5, -4, '#6fdc8c']].forEach(function (p) { ret(ctx, cx + p[0] - 1, py + p[1] - 1, 3, 3, K); ret(ctx, cx + p[0], py + p[1], 1, 1, p[2]); });
      ret(ctx, cx - 1, py - 3, 3, 1, VERM); ret(ctx, cx - 1, py - 1, 3, 1, VERM);
      ret(ctx, cx - 3, py - 13, 2, 1, C.branco);
    },
    anim: function (ctx, px, py, t) {
      var f = Math.floor(t / 180) % 6;
      if (f < 2) { var cx = px + 8; ret(ctx, cx - 9, py - 11 + f, 2, 1, K); ret(ctx, cx + 8, py - 9 - f, 2, 1, K); ret(ctx, cx - 9, py - 7, 1, 1, K); }
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
  I.objeto('portugues-ninho', { w: 1, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      toco(ctx, cx, py, py - 1);
      // ninho de gravetos com três ovinhos
      elipse(ctx, cx, py - 4, 7, 4, K); elipse(ctx, cx, py - 4, 6, 3, '#b07a4a');
      ovo(ctx, cx - 3, py - 7, '#dff4ff'); ovo(ctx, cx + 3, py - 7, '#dff4ff'); ovo(ctx, cx, py - 8, C.creme);
      ret(ctx, cx - 6, py - 4, 13, 1, '#8a5a3a'); ret(ctx, cx - 5, py - 2, 11, 1, '#d9a36a');
      for (var i = -6; i <= 6; i += 3) ret(ctx, cx + i, py - 3, 2, 1, '#6b4428');
    } });
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
  I.objeto('portugues-iceberg', { w: 2, h: 1, topo: 16, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 2, py + 8, 28, 7, K); ret(ctx, px + 3, py + 9, 26, 5, C.madeira2); ret(ctx, px + 3, py + 9, 26, 1, C.madeiraClara);
      ret(ctx, px + 1, py - 16, 30, 25, K); ret(ctx, px + 2, py - 15, 28, 23, '#eaf8ff');
      ret(ctx, px + 2, py - 7, 28, 15, MAR3); ret(ctx, px + 2, py - 7, 28, 1, C.branco);
      // parte de baixo (grande) e pontinha de cima (pequena)
      var cx = px + 16;
      for (var j = 0; j < 14; j++) { var m = Math.round(4 + Math.sin((j + 1) / 14 * Math.PI) * 7); ret(ctx, cx - m, py - 6 + j, m * 2, 1, j % 5 === 2 ? GELO3 : GELO2); }
      triangulo(ctx, cx - 5, py - 14, 10, 8, K); triangulo(ctx, cx - 4, py - 13, 8, 7, C.branco); ret(ctx, cx - 4, py - 7, 8, 1, GELO);
      ret(ctx, cx - 1, py - 12, 1, 3, GELO2);
      ret(ctx, px + 3, py - 14, 1, 20, C.branco);
      ret(ctx, px + 25, py - 12, 3, 1, '#9fdcff'); ret(ctx, px + 24, py - 10, 2, 1, '#9fdcff');
    } });
  I.objeto('portugues-barco', { w: 3, h: 2, topo: 18, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      // água do cais embaixo do barco
      ret(ctx, px, py + 18, 48, 14, K); ret(ctx, px + 1, py + 19, 46, 12, MAR); ret(ctx, px + 1, py + 19, 46, 2, MAR3);
      for (var w = 0; w < 5; w++) ret(ctx, px + 4 + w * 9, py + 25 + (w % 2) * 3, 4, 1, MAR3);
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
  I.objeto('portugues-focas', { w: 2, h: 1, topo: 5, solido: true,
    desenhar: function (ctx, px, py) {
      // placa de gelo com duas focas deitadas
      elipse(ctx, px + 16, py + 11, 15, 4, K); elipse(ctx, px + 16, py + 11, 14, 3, GELO); ret(ctx, px + 4, py + 11, 24, 1, GELO2);
      function foca(cx, cy, vira) {
        elipse(ctx, cx, cy, 7, 3, K); elipse(ctx, cx, cy, 6, 2, '#8a94aa'); ret(ctx, cx - 4, cy + 1, 8, 1, '#b9c4d6');
        var hx = cx + vira * 6;
        circulo(ctx, hx, cy - 2, 3, K); circulo(ctx, hx, cy - 2, 2, '#8a94aa');
        ret(ctx, hx + vira, cy - 3, 1, 1, K); ret(ctx, hx + vira * 3, cy - 1, 1, 1, K);
        ret(ctx, cx - vira * 8, cy - 1, 2, 3, K);
      }
      foca(px + 10, py + 8, 1); foca(px + 23, py + 7, -1);
      ret(ctx, px + 21, py + 5, 2, 1, C.branco);
    } });
  I.objeto('portugues-albatroz', { w: 1, h: 1, topo: 20, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      // poste do cais com o albatroz de asas compridas
      ret(ctx, cx - 3, py - 6, 7, 21, K); ret(ctx, cx - 2, py - 5, 5, 19, C.madeira); ret(ctx, cx - 2, py - 5, 1, 19, C.madeiraClara);
      ret(ctx, cx - 2, py + 2, 5, 2, '#e8d2a8'); ret(ctx, cx - 3, py - 7, 7, 2, K);
      elipse(ctx, cx, py - 11, 4, 3, K); elipse(ctx, cx, py - 11, 3, 2, C.branco);
      ret(ctx, cx - 9, py - 14, 8, 2, K); ret(ctx, cx - 8, py - 14, 6, 1, '#5a5a6a');
      ret(ctx, cx + 2, py - 14, 8, 2, K); ret(ctx, cx + 3, py - 14, 6, 1, '#5a5a6a');
      circulo(ctx, cx + 3, py - 15, 2, K); circulo(ctx, cx + 3, py - 15, 1, C.branco);
      ret(ctx, cx + 5, py - 15, 3, 1, '#ffc27a'); ret(ctx, cx + 3, py - 16, 1, 1, K);
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
  I.objeto('portugues-carrossel', { w: 3, h: 3, topo: 18, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 24;
      // plataforma redonda
      elipse(ctx, cx, py + 40, 23, 7, K); elipse(ctx, cx, py + 40, 22, 6, '#ffd1e6'); elipse(ctx, cx, py + 39, 22, 5, '#ffe6f2');
      ret(ctx, cx - 22, py + 40, 45, 3, '#ff7eb6'); ret(ctx, cx - 22, py + 43, 45, 1, K);
      // poste central
      ret(ctx, cx - 2, py - 4, 5, 44, K); ret(ctx, cx - 1, py - 4, 3, 43, C.ouro); ret(ctx, cx - 1, py - 4, 1, 43, C.ouro3);
      // cavalinhos e unicórnios nos postes (desenhados pelo anim; aqui só os postes)
      [-15, 15, -7, 7].forEach(function (dx) { ret(ctx, cx + dx, py + 2, 1, 36, C.ouro2); });
      // telhado de lona listrada com babados
      triangulo(ctx, cx - 25, py - 18, 51, 16, K);
      for (var j = 0; j < 14; j++) {
        var m = Math.round(24 * (j + 1) / 15);
        for (var i = -m; i < m; i++) ret(ctx, cx + i, py - 17 + j, 1, 1, (Math.floor((i + 48) / 6) % 2) ? C.branco : '#ff5c8a');
      }
      ret(ctx, cx - 25, py - 3, 51, 4, K); ret(ctx, cx - 24, py - 2, 49, 2, C.ouro);
      for (var b = 0; b < 12; b++) { ret(ctx, cx - 24 + b * 4, py + 1, 4, 3, K); ret(ctx, cx - 23 + b * 4, py + 1, 2, 2, b % 2 ? '#5fb4ff' : '#ff5c8a'); }
      ret(ctx, cx, py - 22, 1, 5, K); ret(ctx, cx + 1, py - 22, 5, 3, VERDE);
    },
    anim: function (ctx, px, py, t) {
      bichinhos(ctx, px, py, t);
    } });
  // os cavalinhos e unicórnios sobem e descem; parado (sem animações) eles ficam no meio
  var CAVALINHO = [
    '........y...',
    '.......kkk..',
    '......kmcck.',
    '......kmceck',
    '.kkkkkkmccck',
    'mcccccccckk.',
    'kcccccccck..',
    '.kcckkkcck..',
    '.kk.....kk..',
  ];
  function bichinhos(ctx, px, py, t) {
    var cx = px + 24, cores = [['#ffffff', '#ff7eb6'], ['#ffd1e6', '#b58cff'], ['#e8dcff', '#5fb4ff'], ['#ffe066', '#ff5c8a']];
    [-15, 7, -7, 15].forEach(function (dx, i) {
      var y = py + 16 + Math.round(Math.sin(t / 420 + i * 1.6) * 3), x = cx + dx, vira = dx < 0;
      var pal = { k: K, c: cores[i][0], m: cores[i][1], e: K, y: i % 2 === 0 ? C.ouro : null };
      for (var j = 0; j < CAVALINHO.length; j++) for (var a = 0; a < 12; a++) {
        var ch = CAVALINHO[j][vira ? 11 - a : a], cor = pal[ch];
        if (cor) ret(ctx, x - 6 + a, y + j, 1, 1, cor);
      }
      ret(ctx, x, y + 5, 1, 2, C.ouro2);   // o poste passando pela sela
      ret(ctx, x - 1, y + 4, 3, 1, VERM);
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
  I.objeto('portugues-mel', { w: 1, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      mesinha(ctx, cx, py, py + 1, '#ffe28a');
      // pote redondo de mel, com o mel escorrendo da tampa e o rótulo MEL
      elipse(ctx, cx, py - 4, 7, 5, K); elipse(ctx, cx, py - 4, 6, 4, '#ffb020'); ret(ctx, cx - 5, py - 6, 2, 3, '#ffd34d');
      ret(ctx, cx - 5, py - 11, 11, 4, K); ret(ctx, cx - 4, py - 10, 9, 2, '#e0433f'); ret(ctx, cx - 4, py - 10, 9, 1, '#ff8a8a');
      ret(ctx, cx - 3, py - 8, 2, 3, '#ffb020'); ret(ctx, cx + 2, py - 8, 1, 2, '#ffb020');
      ret(ctx, cx - 7, py - 7, 15, 9, K); ret(ctx, cx - 6, py - 6, 13, 7, C.creme);
      D.matriz(ctx, cx - 6, py - 5, ['#...#', '##.##', '#.#.#', '#...#', '#...#'], { '#': '#b8603a' });
      letra(ctx, 'E', cx, py - 5, '#b8603a'); letra(ctx, 'L', cx + 4, py - 5, '#b8603a');
      // abelhinha voando
      ret(ctx, cx + 5, py - 15, 4, 3, K); ret(ctx, cx + 6, py - 14, 2, 1, BANANA); ret(ctx, cx + 6, py - 16, 2, 1, '#dff4ff');
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
      { tipo: 'tapete-listrado', x: 7, y: 4, w: 4, h: 1, var: { cores: ['#e0433f', '#fff4ec', '#39a860', '#fff4ec'] } },
      { tipo: 'poltrona', x: 8, y: 5, var: { cor: '#e0433f' } }, { tipo: 'cesto', x: 10, y: 5 },
      inter('dicionario', 'Dicionário', { tipo: 'portugues-dicionario', x: 0, y: 8 }),
      { tipo: 'banco', x: 1, y: 9 }, { tipo: 'globo', x: 3, y: 9 },
      { tipo: 'banco', x: 0, y: 10 }, { tipo: 'luminaria-pe', x: 3, y: 10 },
      { tipo: 'pilha-livros', x: 2, y: 10 },
      { tipo: 'tapete-redondo', x: 1, y: 8, w: 1, h: 1 },
      inter('blocos', 'Blocos de letras', { tipo: 'portugues-blocos', x: 7, y: 9 }),
      { tipo: 'mesa', x: 8, y: 9, var: { toalha: '#ffd1e6', itens: ['livro', 'xicara'] } },
      { tipo: 'cabideiro', x: 10, y: 8 }, { tipo: 'relogio-pe', x: 10, y: 10 }, { tipo: 'caixote', x: 10, y: 9, var: { item: 'estrela' } },
      { tipo: 'vaso-planta', x: 0, y: 9 },
      { tipo: 'cesto', x: 7, y: 10 }, { tipo: 'banco', x: 8, y: 10 }, { tipo: 'almofada', x: 7, y: 8, var: { cor: '#ff9cc6' } },
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
      { tipo: 'barril', x: 8, y: 2 }, { tipo: 'caixote', x: 10, y: 2, var: { item: 'estrela' } }, { tipo: 'cesto', x: 9, y: 2 },
      { tipo: 'tapete-listrado', x: 0, y: 4, w: 3, h: 1, var: { cores: ['#ff4f6a', '#fff4ec', '#39a860', '#fff4ec'] } },
      { tipo: 'tapete', x: 1, y: 6, w: 3, h: 2, var: { cor: '#ffd1e6', borda: '#ff4f6a' } },
      inter('salada', 'Salada de frutas', { tipo: 'portugues-salada', x: 1, y: 8 }),
      { tipo: 'cadeira', x: 0, y: 8, var: { almofada: '#ff9cc6' } }, { tipo: 'cadeira', x: 2, y: 8, var: { almofada: '#9fe0a0' } },
      { tipo: 'mesa', x: 4, y: 9, var: { toalha: '#ffc2d8', itens: ['xicara', 'bolo'] } },
      inter('caneca-bolo', 'Bolo de caneca', { tipo: 'portugues-caneca-bolo', x: 6, y: 10 }),
      { tipo: 'portugues-cesta-frutas', x: 0, y: 10 }, { tipo: 'balde', x: 2, y: 10 }, { tipo: 'banco', x: 7, y: 10 },
      { tipo: 'vaso-grande', x: 10, y: 10 }, { tipo: 'cesto', x: 9, y: 10 },
      { tipo: 'almofada', x: 4, y: 7, var: { cor: '#ff9cc6' } },
    ]),
    /* ---------- SALA 2: Horta do H (terra e verde) ---------- */
    sala(25, 13, [
      { tipo: 'quadro-unicornio', x: 0, y: 0, var: { uni: 'p-hibisco' } },
      { tipo: 'janela', x: 2, y: 0 }, { tipo: 'portugues-cartaz-h', x: 3, y: 0, var: { figura: 'hotel' } },
      { tipo: 'janela', x: 4, y: 0 }, { tipo: 'portugues-cartaz-h', x: 5, y: 0, var: { figura: 'helicoptero' } },
      { tipo: 'bandeirinhas', x: 6, y: 0 }, { tipo: 'janela', x: 8, y: 0 }, { tipo: 'relogio-parede', x: 9, y: 0 }, { tipo: 'janela', x: 10, y: 0 },
      { tipo: 'vaso-planta', x: 6, y: 2 },
      inter('placa-horta', 'Placa da horta', { tipo: 'portugues-placa-horta', x: 1, y: 3 }),
      { tipo: 'portugues-canteiro', x: 2, y: 2, var: { planta: 'alface' } },
      { tipo: 'portugues-canteiro', x: 4, y: 2, var: { planta: 'tomate' } },
      inter('hortela', 'Vaso de hortelã', { tipo: 'portugues-hortela', x: 7, y: 3 }),
      { tipo: 'portugues-canteiro', x: 7, y: 2, var: { planta: 'hortela' } },
      { tipo: 'planta-alta', x: 10, y: 2 }, { tipo: 'portugues-regador', x: 1, y: 2 },
      { tipo: 'portugues-canteiro', x: 3, y: 4, var: { planta: 'cenoura' } },
      inter('hibisco', 'Pé de hibisco', { tipo: 'portugues-hibisco', x: 9, y: 5 }),
      { tipo: 'portugues-carrinho', x: 10, y: 6 },
      { tipo: 'tapete-listrado', x: 6, y: 6, w: 3, h: 1, var: { cores: ['#39a860', '#fff4ec', '#ff3b5c', '#fff4ec'] } },
      { tipo: 'tapete', x: 8, y: 8, w: 3, h: 1, var: { cor: '#9fe0a0', borda: '#39a860' } },
      inter('helicoptero', 'Helicóptero de brinquedo', { tipo: 'portugues-helicoptero', x: 5, y: 8 }),
      { tipo: 'portugues-espantalho', x: 3, y: 8 },
      { tipo: 'vaso-grande', x: 0, y: 10 }, { tipo: 'banco', x: 1, y: 10 }, { tipo: 'balde', x: 3, y: 10 },
      { tipo: 'cesto', x: 4, y: 10 }, { tipo: 'flores', x: 6, y: 10 }, { tipo: 'caixote', x: 7, y: 10, var: { item: 'moedas' } },
      { tipo: 'portugues-canteiro', x: 8, y: 9, var: { planta: 'alface' } }, { tipo: 'portugues-canteiro', x: 8, y: 10, w: 2, var: { planta: 'hortela' } },
      { tipo: 'vaso-planta', x: 10, y: 10 }, { tipo: 'almofada', x: 5, y: 6, var: { cor: '#9fe0a0' } },
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
      { tipo: 'barril', x: 1, y: 2 },
      inter('ninho', 'Ninho', { tipo: 'portugues-ninho', x: 9, y: 4 }),
      { tipo: 'portugues-bola-circo', x: 0, y: 6 }, { tipo: 'balde', x: 0, y: 7 },
      { tipo: 'banco', x: 4, y: 10 }, { tipo: 'portugues-banquinho', x: 6, y: 10, var: { cor: '#39c5bb' } },
      { tipo: 'tapete', x: 7, y: 8, w: 3, h: 2, var: { cor: '#ffd34d', borda: '#e0433f' } },
      { tipo: 'caixote', x: 10, y: 10, var: { item: 'estrela' } }, { tipo: 'cesto', x: 8, y: 10 },
      { tipo: 'luminaria-pe', x: 0, y: 10 }, { tipo: 'almofada', x: 5, y: 8, var: { cor: '#ffd34d' } },
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
      { tipo: 'portugues-ancora', x: 3, y: 2 }, { tipo: 'portugues-albatroz', x: 1, y: 4 },
      { tipo: 'barril', x: 8, y: 2 }, { tipo: 'portugues-cordas', x: 9, y: 2 }, { tipo: 'caixote', x: 10, y: 2, var: { item: 'moedas' } },
      inter('pinguins', 'Pinguins', { tipo: 'portugues-pinguins', x: 0, y: 5 }),
      { tipo: 'bau', x: 0, y: 4 },
      { tipo: 'portugues-gelo', x: 0, y: 8, w: 3, h: 2 },
      inter('focas', 'Focas', { tipo: 'portugues-focas', x: 8, y: 5 }),
      inter('diario', 'Diário da expedição', { tipo: 'portugues-diario', x: 9, y: 9 }),
      { tipo: 'caixote', x: 10, y: 10, var: { item: 'estrela' } }, { tipo: 'banco', x: 6, y: 10 }, { tipo: 'globo', x: 10, y: 9 },
      { tipo: 'luminaria-pe', x: 0, y: 10 }, { tipo: 'balde', x: 1, y: 10 }, { tipo: 'portugues-cordas', x: 3, y: 10 },
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
        piso: 'pedra', parede: 'madeira', paleta: { piso: '#e2d4b0', piso2: '#b89a6a', parede: '#e8f6d8', parede2: '#b6d88a', rodape: '#2a7d48' } },
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
  // casinha de cozinha com chaminé, livros e a bandeirinha da expedição; porta no meio da última fileira
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
    // livro aberto no telhado (a placa da casa), com "ABC"
    ret(ctx, cx - 12, py + 17, 25, 12, K);
    ret(ctx, cx - 11, py + 18, 11, 9, C.creme); ret(ctx, cx + 1, py + 18, 11, 9, C.creme);
    ret(ctx, cx, py + 18, 1, 10, det); ret(ctx, cx - 11, py + 27, 23, 1, det2);
    letra(ctx, 'A', cx - 10, py + 20, telhado); letra(ctx, 'B', cx - 5, py + 20, det2); letra(ctx, 'C', cx + 3, py + 20, '#2f6fd6');
    ret(ctx, cx + 7, py + 21, 4, 1, '#c8b8d8'); ret(ctx, cx + 7, py + 23, 3, 1, '#c8b8d8');
    // bandeirinha da expedição no bico do telhado (azul com o floquinho)
    ret(ctx, cx, py - 4, 1, 14, K);
    ret(ctx, cx + 1, py - 4, 10, 7, K); ret(ctx, cx + 1, py - 3, 9, 5, '#2f6fd6'); ret(ctx, cx + 1, py - 3, 9, 1, '#5f9ae8');
    ret(ctx, cx + 5, py - 2, 1, 3, C.branco); ret(ctx, cx + 4, py - 1, 3, 1, C.branco);
    circulo(ctx, cx, py - 5, 1, C.ouro);
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
    // porta verde com arco e janelinha, no meio do tile da porta
    var dx = cx - 7, dy = py + h - 21;
    ret(ctx, dx - 1, dy + 2, 16, 19, C.ouro); elipse(ctx, dx + 7, dy + 3, 8, 3, C.ouro);
    ret(ctx, dx, dy + 3, 14, 18, det); elipse(ctx, dx + 7, dy + 4, 7, 3, det);
    ret(ctx, dx + 1, dy + 5, 12, 1, clarear(det, 0.35));
    ret(ctx, dx + 4, dy + 6, 6, 5, K); ret(ctx, dx + 5, dy + 7, 4, 3, '#bfe9ff'); ret(ctx, dx + 7, dy + 7, 1, 3, K);
    ret(ctx, dx + 10, dy + 13, 2, 2, C.ouro);
    // tapetinho da porta
    ret(ctx, cx - 6, py + h - 2, 13, 2, K); ret(ctx, cx - 5, py + h - 2, 11, 1, '#ff9cc6');
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
