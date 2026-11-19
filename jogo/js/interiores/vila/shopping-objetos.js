/* Vila Arco-Íris, Shopping Terrazo (docs/contratos/vila.md §2): o terreno de baixo da esquerda virou o shopping. Objetos,
   parte 1 de 3 (prefixo vila-shopping-; nenhuma marca de loja de verdade, só o tipo de loja):
   - por fora: a fachada 6 × 5 (vidro azul, toldos, plantas na entrada e, no telhado, o letreiro com o "T" e as letrinhas
     SHOPPING TERRAZO; a porta de vidro desenhada embaixo, no tile 2 da pegada, logo acima do tile da escada `portal`) e o
     totem do "T", no lugar da placa do terreno;
   - no Corredor das Lojas: a vitrine de loja (3 × 1, encostada na parede; var.tipo roupas, brinquedos ou cinema), o
     quiosque de sapatos, o manequim, os balões, a lixeira, a escada rolante de enfeite e o carro antigo.
   Usa Reino._predios.vila (V, de fundo.js e objetos.js) e cria V.shopping (S), que as partes 2 e 3 usam:
     S.cores (a paleta)   S.letras(ctx, x, y, texto, cor, escala?) e S.largura(texto, escala?) (letrinhas de pixel de 5
     de altura)   S.toldo(ctx, x, y, w, cor) (toldo listrado, 8 de altura)   S.vidro(ctx, x, y, w, h) e
     S.reflexo(ctx, x, y, n) (vidraça e o risco de reflexo)   S.cartaz(ctx, x, y, tema) (cartaz de filme 10 × 16)
   Os brilhos só no `anim` (móvel alto anima só com retângulos: o pintor). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, ret = D.ret, circulo = D.circulo, triangulo = D.triangulo, matriz = D.matriz;
  var clarear = D.clarear, escurecer = D.escurecer;
  var K = R.Desenho.K;
  var V = R._predios.vila, caixa = V.caixa, ARCO = V.ARCO;
  var S = V.shopping = {};

  var C = S.cores = {
    parede: '#fff4e8', parede2: '#f3dcc4', branco: '#ffffff', creme: '#fff8ee',
    vidro: '#bfe6ff', vidro2: '#9fd4ff', vidroLuz: '#e8f7ff',
    laranja: '#ff8a3d', laranja2: '#e0621e', laranjaLuz: '#ffb06a',
    agua: '#4fc8b8', agua2: '#2f9e90', coral: '#ff6f7d', amarelo: '#ffd34d', lilas: '#b58cff', rosa: '#ff86bb',
    azul: '#5fb4ff', vermelho: '#e8384f', cereja: '#c8336e', noite: '#3a2a5a',
    metal: '#b9c4d6', metal2: '#8a94aa', metalLuz: '#e6ecf4', piso: '#d8dee8',
    folha: '#5e9a3a', folha2: '#8fb83a', folha3: '#b6d24e', vaso: '#e07a4a', pele: '#fff0e0',
    marrom: '#a0683a', marrom2: '#7a4a2a', bege: '#e8c49a',
  };

  /* ---------- pecinhas (também usadas pelas partes 2 e 3) ---------- */
  var LETRAS = {
    A: ['.x.', 'x.x', 'xxx', 'x.x', 'x.x'], B: ['xx.', 'x.x', 'xx.', 'x.x', 'xx.'], C: ['.xx', 'x..', 'x..', 'x..', '.xx'],
    D: ['xx.', 'x.x', 'x.x', 'x.x', 'xx.'], E: ['xxx', 'x..', 'xx.', 'x..', 'xxx'], G: ['.xx', 'x..', 'x.x', 'x.x', '.xx'],
    H: ['x.x', 'x.x', 'xxx', 'x.x', 'x.x'], I: ['xxx', '.x.', '.x.', '.x.', 'xxx'], K: ['x.x', 'x.x', 'xx.', 'x.x', 'x.x'],
    M: ['x...x', 'xx.xx', 'x.x.x', 'x...x', 'x...x'], N: ['x..x', 'xx.x', 'x.xx', 'x..x', 'x..x'],
    O: ['.x.', 'x.x', 'x.x', 'x.x', '.x.'], P: ['xx.', 'x.x', 'xx.', 'x..', 'x..'], Q: ['.x.', 'x.x', 'x.x', 'xx.', '.xx'],
    R: ['xx.', 'x.x', 'xx.', 'x.x', 'x.x'], S: ['.xx', 'x..', '.x.', '..x', 'xx.'], T: ['xxx', '.x.', '.x.', '.x.', '.x.'],
    U: ['x.x', 'x.x', 'x.x', 'x.x', 'xxx'], Z: ['xxx', '..x', '.x.', 'x..', 'xxx'], ' ': ['.', '.', '.', '.', '.'],
  };
  S.largura = function (texto, e) {
    var w = 0;
    for (var i = 0; i < texto.length; i++) w += (LETRAS[texto[i]] || LETRAS.O)[0].length + 1;
    return (w - 1) * (e || 1);
  };
  S.letras = function (ctx, x, y, texto, cor, e) {
    e = e || 1;
    for (var i = 0; i < texto.length; i++) {
      var L = LETRAS[texto[i]] || LETRAS.O;
      for (var j = 0; j < 5; j++) for (var k = 0; k < L[j].length; k++) if (L[j][k] === 'x') ret(ctx, x + k * e, y + j * e, e, e, cor);
      x += (L[0].length + 1) * e;
    }
  };
  // toldo: faixas de 3 px (cor e branco), uma sim outra não com o dentinho pendurado embaixo
  S.toldo = function (ctx, x, y, w, cor) {
    ret(ctx, x, y, w, 6, K);
    for (var i = 1; i < w - 1; i += 3) {
      var c = Math.floor((i - 1) / 3) % 2 ? C.branco : cor, l = Math.min(3, w - 1 - i);
      ret(ctx, x + i, y + 1, l, 4, c); ret(ctx, x + i, y + 1, l, 1, clarear(c, 0.4));
      if (c !== C.branco && l === 3) { ret(ctx, x + i - 1, y + 5, 5, 3, K); ret(ctx, x + i, y + 5, 3, 2, c); }
    }
  };
  S.vidro = function (ctx, x, y, w, h) { caixa(ctx, x, y, w, h, C.vidro); ret(ctx, x + 1, y + 1, w - 2, 2, C.vidroLuz); };
  // risco de reflexo em diagonal (n pixels), subindo para a direita a partir de (x, y)
  S.reflexo = function (ctx, x, y, n) { for (var j = 0; j < n; j++) { ret(ctx, x + j, y - j, 2, 1, C.vidroLuz); ret(ctx, x + j + 4, y - j, 1, 1, C.vidroLuz); } };
  var ESTRELA = ['...y...', '..yyy..', 'yyyyyyy', '.yyyyy.', '..yyy..', '.yy.yy.', 'y.....y'];
  // cartaz de filme 10 × 16 com moldura: 'arco' (arco-íris no céu lilás) ou 'estrela' (estrela na noite)
  S.cartaz = function (ctx, x, y, tema) {
    caixa(ctx, x, y, 10, 16, tema === 'arco' ? '#d9c2ff' : C.noite);
    if (tema === 'arco') {
      for (var i = 0; i < 4; i++) { ret(ctx, x + 1 + i, y + 3 + i, 8 - 2 * i, 1, ARCO[i]); ret(ctx, x + 1 + i, y + 4 + i, 1, 4 - i, ARCO[i]); ret(ctx, x + 8 - i, y + 4 + i, 1, 4 - i, ARCO[i]); }
      ret(ctx, x + 2, y + 10, 6, 2, C.branco); ret(ctx, x + 6, y + 9, 2, 1, C.branco);
    } else matriz(ctx, x + 2, y + 3, ESTRELA, { y: C.amarelo });
    ret(ctx, x + 2, y + 13, 6, 1, C.amarelo);
  };

  // roupinhas e brinquedos das vitrines
  function camiseta(ctx, x, y, c) {   // 9 × 9
    ret(ctx, x, y, 9, 4, K); ret(ctx, x + 2, y + 4, 5, 5, K);
    ret(ctx, x + 1, y + 1, 7, 2, c); ret(ctx, x + 3, y + 3, 3, 5, c); ret(ctx, x + 1, y + 1, 2, 1, clarear(c, 0.5));
    ret(ctx, x + 4, y, 1, 2, K);
  }
  function vestido(ctx, x, y, c) {   // 9 × 11
    ret(ctx, x + 2, y, 5, 5, K); ret(ctx, x + 3, y + 1, 3, 4, c);
    triangulo(ctx, x, y + 4, 9, 7, K); triangulo(ctx, x + 1, y + 5, 7, 5, c);
    ret(ctx, x + 3, y + 4, 3, 1, C.amarelo);
  }
  function tenis(ctx, x, y, c) {   // 9 × 6, bico para a direita
    ret(ctx, x, y, 5, 6, K); ret(ctx, x, y + 2, 9, 4, K);
    ret(ctx, x + 1, y + 1, 3, 3, c); ret(ctx, x + 1, y + 3, 7, 1, c); ret(ctx, x + 1, y + 4, 7, 1, C.branco);
    ret(ctx, x + 1, y + 1, 1, 1, clarear(c, 0.5));
  }
  function urso(ctx, cx, by, c) {   // ursinho de pelúcia sentado (12 × 14), base em by
    circulo(ctx, cx, by - 5, 5, K); circulo(ctx, cx, by - 5, 4, c);
    circulo(ctx, cx - 4, by - 14, 2, K); circulo(ctx, cx + 4, by - 14, 2, K);
    circulo(ctx, cx, by - 11, 4, K); circulo(ctx, cx, by - 11, 3, c);
    ret(ctx, cx - 4, by - 14, 1, 1, c); ret(ctx, cx + 4, by - 14, 1, 1, c);
    ret(ctx, cx - 2, by - 12, 1, 1, K); ret(ctx, cx + 2, by - 12, 1, 1, K); ret(ctx, cx - 1, by - 10, 3, 2, C.bege); ret(ctx, cx, by - 10, 1, 1, K);
    ret(ctx, cx - 2, by - 7, 5, 1, C.coral);   // lacinho
  }
  function bola(ctx, cx, cy) {
    circulo(ctx, cx, cy, 4, K); circulo(ctx, cx, cy, 3, C.vermelho);
    ret(ctx, cx - 3, cy, 7, 1, C.branco); ret(ctx, cx - 2, cy - 2, 1, 1, C.branco);
  }
  function bloco(ctx, x, y, c, l) { caixa(ctx, x, y, 7, 7, c); S.letras(ctx, x + 2, y + 1, l, C.branco, 1); }   // 7 × 7
  S.camiseta = camiseta; S.tenis = tenis; S.urso = urso; S.bola = bola;
  var MERCADORIA = {   // área de 29 × 22 a partir de (x, y)
    roupas: function (ctx, x, y) {
      ret(ctx, x + 1, y + 2, 27, 1, C.metal2);
      [[1, C.azul], [19, C.amarelo]].forEach(function (p) { ret(ctx, x + p[0] + 4, y + 2, 1, 2, K); camiseta(ctx, x + p[0], y + 4, p[1]); });
      ret(ctx, x + 14, y + 2, 1, 2, K); vestido(ctx, x + 10, y + 3, C.rosa);
      ret(ctx, x + 1, y + 21, 27, 1, C.marrom);
      [[2, C.coral], [9, C.lilas], [16, C.agua], [22, C.amarelo]].forEach(function (p) { caixa(ctx, x + p[0], y + 16, 6, 5, p[1]); ret(ctx, x + p[0] + 1, y + 18, 4, 1, clarear(p[1], 0.4)); });
    },
    brinquedos: function (ctx, x, y) {
      urso(ctx, x + 7, y + 21, C.marrom);
      bola(ctx, x + 17, y + 17);
      bloco(ctx, x + 22, y + 14, C.azul, 'A'); bloco(ctx, x + 22, y + 7, C.coral, 'B'); bloco(ctx, x + 22, y, C.agua, 'C');
      ret(ctx, x + 1, y + 21, 27, 1, C.marrom);
    },
    sapatos: function (ctx, x, y) {
      ret(ctx, x + 1, y + 9, 27, 1, C.marrom); ret(ctx, x + 1, y + 21, 27, 1, C.marrom);
      tenis(ctx, x + 2, y + 3, C.rosa); tenis(ctx, x + 16, y + 3, C.azul);
      tenis(ctx, x + 2, y + 15, C.amarelo); tenis(ctx, x + 16, y + 15, C.lilas);
    },
  };

  /* ---------- por fora: a fachada (6 × 5; a porta no tile 2, sobre a fileira de baixo) ---------- */
  function planta(ctx, cx, by) {   // vaso com moita redonda (12 × 19), meio cx, base by
    ret(ctx, cx - 4, by - 7, 9, 7, K); ret(ctx, cx - 3, by - 6, 7, 5, C.vaso); ret(ctx, cx - 3, by - 6, 7, 1, '#ffb08a');
    circulo(ctx, cx, by - 12, 6, K); circulo(ctx, cx, by - 12, 5, C.folha); circulo(ctx, cx - 1, by - 13, 3, C.folha2);
    ret(ctx, cx - 3, by - 15, 2, 1, C.folha3); ret(ctx, cx + 2, by - 10, 1, 1, C.rosa); ret(ctx, cx - 3, by - 9, 1, 1, C.amarelo);
  }
  I.objeto('vila-shopping-predio', { w: 6, h: 5, solido: true, alto: false, topo: 28, junto: true,
    desenhar: function (ctx, px, py) {
      var i;
      ret(ctx, px + 2, py + 78, 92, 3, 'rgba(58,36,70,0.25)');                                     // sombra no chão
      // o prédio: parede creme, platibanda laranja, a faixa de vidro do 2º andar e a laje
      caixa(ctx, px + 3, py + 4, 90, 76, C.parede); ret(ctx, px + 4, py + 8, 1, 62, C.branco);
      caixa(ctx, px + 1, py + 1, 94, 7, C.laranja); ret(ctx, px + 2, py + 2, 92, 1, C.laranjaLuz); ret(ctx, px + 2, py + 6, 92, 1, C.laranja2);
      S.vidro(ctx, px + 7, py + 11, 82, 15);
      for (i = 1; i < 6; i++) ret(ctx, px + 7 + i * 14, py + 11, 1, 15, K);
      S.reflexo(ctx, px + 10, py + 23, 6); S.reflexo(ctx, px + 52, py + 23, 6);
      ret(ctx, px + 4, py + 27, 88, 2, C.parede2);
      // os toldos e o selo do "T" entre eles
      S.toldo(ctx, px + 4, py + 31, 26, C.coral); S.toldo(ctx, px + 51, py + 31, 41, C.agua);
      caixa(ctx, px + 34, py + 29, 12, 9, C.laranja); S.letras(ctx, px + 39 - 1, py + 31, 'T', C.branco);
      // vitrine da esquerda (camiseta e vestido no cabide, roupa dobrada) e da direita (ursinho, bola e os bloquinhos)
      S.vidro(ctx, px + 6, py + 39, 22, 32);
      ret(ctx, px + 8, py + 43, 18, 1, C.metal2);
      ret(ctx, px + 12, py + 43, 1, 2, K); camiseta(ctx, px + 8, py + 45, C.azul);
      ret(ctx, px + 21, py + 43, 1, 2, K); vestido(ctx, px + 17, py + 44, C.rosa);
      caixa(ctx, px + 8, py + 61, 7, 4, C.amarelo); caixa(ctx, px + 8, py + 64, 7, 4, C.agua);
      S.vidro(ctx, px + 53, py + 39, 37, 32);
      urso(ctx, px + 62, py + 68, C.marrom); bola(ctx, px + 74, py + 64);
      bloco(ctx, px + 81, py + 62, C.azul, 'A'); bloco(ctx, px + 81, py + 55, C.coral, 'B'); bloco(ctx, px + 81, py + 48, C.agua, 'C');
      S.reflexo(ctx, px + 9, py + 59, 5); S.reflexo(ctx, px + 55, py + 52, 5);
      // rodapé de pedra clara
      caixa(ctx, px + 3, py + 70, 90, 10, C.parede2); ret(ctx, px + 4, py + 71, 88, 1, C.branco);
      // a porta de vidro dupla (centrada no tile 2: x 32..48), a marquise, o degrau e as plantas dos lados
      caixa(ctx, px + 27, py + 39, 26, 5, C.laranja); ret(ctx, px + 28, py + 40, 24, 1, C.laranjaLuz);
      ret(ctx, px + 31, py + 44, 18, 36, K); ret(ctx, px + 32, py + 45, 16, 35, C.vidro2);
      ret(ctx, px + 39, py + 45, 2, 35, K); ret(ctx, px + 32, py + 45, 7, 2, C.vidroLuz); ret(ctx, px + 41, py + 45, 7, 2, C.vidroLuz);
      ret(ctx, px + 37, py + 58, 1, 7, C.metal2); ret(ctx, px + 42, py + 58, 1, 7, C.metal2);
      S.reflexo(ctx, px + 33, py + 72, 4); S.reflexo(ctx, px + 42, py + 72, 4);
      caixa(ctx, px + 27, py + 79, 26, 5, '#d4d4e0'); ret(ctx, px + 28, py + 80, 24, 1, '#ececf4');
      planta(ctx, px + 24, py + 80); planta(ctx, px + 56, py + 80);
      // o letreiro no telhado: o "T" laranja, SHOPPING e TERRAZO
      ret(ctx, px + 20, py - 4, 3, 6, K); ret(ctx, px + 74, py - 4, 3, 6, K);
      caixa(ctx, px + 7, py - 27, 84, 25, C.branco); ret(ctx, px + 8, py - 5, 82, 2, C.parede2);
      caixa(ctx, px + 10, py - 24, 19, 19, C.laranja); ret(ctx, px + 11, py - 23, 17, 1, C.laranjaLuz); ret(ctx, px + 11, py - 23, 1, 17, C.laranjaLuz);
      S.letras(ctx, px + 15, py - 22, 'T', C.branco, 3);
      S.letras(ctx, px + 33 + ((54 - S.largura('SHOPPING')) >> 1), py - 23, 'SHOPPING', C.agua2);
      S.letras(ctx, px + 33, py - 16, 'TERRAZO', C.laranja2, 2);
    },
    anim: function (ctx, px, py, t) {   // o brilho passando no vidro de cima
      var k = Math.floor(t / 900) % 4;
      if (k < 3) { ret(ctx, px + 16 + k * 28, py + 13, 1, 3, C.branco); ret(ctx, px + 15 + k * 28, py + 14, 3, 1, C.branco); }
    } });

  // o totem do "T" (1 × 1; interativo), no lugar da placa do terreno
  I.objeto('vila-shopping-totem', { w: 1, h: 1, solido: true, alto: true, topo: 22,
    desenhar: function (ctx, px, py) {
      caixa(ctx, px + 1, py + 9, 14, 6, C.metal); ret(ctx, px + 2, py + 10, 12, 1, C.metalLuz);
      caixa(ctx, px + 3, py - 21, 10, 31, C.laranja); ret(ctx, px + 4, py - 20, 8, 1, C.laranjaLuz); ret(ctx, px + 4, py - 20, 1, 29, C.laranjaLuz);
      S.letras(ctx, px + 5, py - 18, 'T', C.branco, 2);
      ret(ctx, px + 5, py - 5, 6, 1, C.coral); ret(ctx, px + 5, py - 3, 6, 1, C.amarelo); ret(ctx, px + 5, py - 1, 6, 1, C.agua);
      ret(ctx, px + 5, py + 2, 6, 5, C.laranja2); ret(ctx, px + 6, py + 3, 4, 3, C.vidro);
    } });

  /* ---------- Corredor das Lojas ---------- */
  var LOJAS = {
    roupas: { faixa: C.coral, letra: C.branco, texto: 'ROUPAS', toldo: C.coral, porta: C.coral },
    brinquedos: { faixa: C.amarelo, letra: C.laranja2, texto: 'BRINQUEDOS', toldo: C.lilas, porta: C.lilas },
    sapatos: { faixa: C.agua, letra: C.branco, texto: 'SAPATOS', toldo: C.agua, porta: C.agua },
  };
  function cinema(ctx, px, py) {   // a entrada do cinema: letreiro de luzinhas, cartazes e a porta vermelha
    caixa(ctx, px, py - 30, 48, 46, C.noite); ret(ctx, px + 1, py - 29, 1, 40, '#5a4880');
    caixa(ctx, px + 2, py - 28, 44, 12, C.cereja);
    S.letras(ctx, px + 24 - (S.largura('CINEMA') >> 1), py - 25, 'CINEMA', C.amarelo);
    for (var i = 0; i < 10; i++) { ret(ctx, px + 4 + i * 4, py - 27, 2, 1, C.branco); ret(ctx, px + 4 + i * 4, py - 18, 2, 1, C.branco); }
    S.cartaz(ctx, px + 2, py - 13, 'arco'); S.cartaz(ctx, px + 36, py - 13, 'estrela');
    caixa(ctx, px + 14, py - 13, 20, 26, C.cereja); ret(ctx, px + 24, py - 13, 1, 26, K);
    ret(ctx, px + 15, py - 12, 9, 1, '#ff6f9a'); ret(ctx, px + 25, py - 12, 8, 1, '#ff6f9a');
    [18, 29].forEach(function (x) { caixa(ctx, px + x - 2, py - 8, 5, 5, C.vidro); });
    ret(ctx, px + 22, py, 1, 4, C.amarelo); ret(ctx, px + 26, py, 1, 4, C.amarelo);
    caixa(ctx, px, py + 12, 48, 4, '#2a1d44');
  }
  I.objeto('vila-shopping-loja', { w: 3, h: 1, solido: true, alto: false, topo: 30, junto: true,
    desenhar: function (ctx, px, py, o) {
      var tipo = (o.var && o.var.tipo) || 'roupas';
      if (tipo === 'cinema') { cinema(ctx, px, py); return; }
      var t = LOJAS[tipo] || LOJAS.roupas;
      caixa(ctx, px, py - 30, 48, 46, C.parede);
      caixa(ctx, px, py - 30, 48, 11, t.faixa); ret(ctx, px + 1, py - 29, 46, 1, clarear(t.faixa, 0.45));
      S.letras(ctx, px + 24 - (S.largura(t.texto) >> 1), py - 27, t.texto, t.letra);
      S.toldo(ctx, px + 1, py - 20, 46, t.toldo);
      S.vidro(ctx, px + 2, py - 12, 31, 24);
      MERCADORIA[tipo](ctx, px + 3, py - 11);
      S.reflexo(ctx, px + 4, py + 6, 4);
      caixa(ctx, px + 34, py - 12, 12, 24, t.porta); ret(ctx, px + 35, py - 11, 10, 1, clarear(t.porta, 0.4));
      ret(ctx, px + 36, py - 9, 8, 15, C.vidro); ret(ctx, px + 36, py - 9, 8, 2, C.vidroLuz); ret(ctx, px + 42, py, 1, 4, K);
      caixa(ctx, px, py + 12, 48, 4, C.parede2);
    },
    anim: function (ctx, px, py, t, o) {   // as luzinhas do cinema acendem em roda
      if (!o || !o.var || o.var.tipo !== 'cinema') return;
      var k = Math.floor(t / 300) % 3;
      for (var i = k; i < 10; i += 3) { ret(ctx, px + 4 + i * 4, py - 27, 2, 1, C.amarelo); ret(ctx, px + 40 - i * 4, py - 18, 2, 1, C.amarelo); }
    } });

  // quiosque de sapatos (2 × 1; interativo): balcão verde-água com toldo e os tênis em cima
  I.objeto('vila-shopping-quiosque', { w: 2, h: 1, solido: true, alto: true, topo: 26,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 2, py - 20, 1, 15, K); ret(ctx, px + 29, py - 20, 1, 15, K);
      S.toldo(ctx, px, py - 26, 32, C.agua);
      tenis(ctx, px + 4, py - 11, C.rosa); tenis(ctx, px + 18, py - 11, C.amarelo);
      caixa(ctx, px, py - 6, 32, 4, C.branco);
      caixa(ctx, px + 1, py - 3, 30, 18, C.agua); ret(ctx, px + 2, py - 2, 28, 1, clarear(C.agua, 0.4));
      S.letras(ctx, px + 16 - (S.largura('SAPATOS') >> 1), py + 3, 'SAPATOS', C.branco);
      ret(ctx, px + 2, py + 11, 28, 1, C.agua2);
    } });
  // manequim de vestido (1 × 1)
  I.objeto('vila-shopping-manequim', { w: 1, h: 1, solido: true, alto: true, topo: 20,
    desenhar: function (ctx, px, py, o) {
      var c = (o.var && o.var.cor) || C.lilas;
      ret(ctx, px + 4, py + 12, 8, 2, K); ret(ctx, px + 5, py + 12, 6, 1, C.metal2); ret(ctx, px + 7, py + 3, 2, 10, K);
      circulo(ctx, px + 8, py - 16, 3, K); circulo(ctx, px + 8, py - 16, 2, C.pele); ret(ctx, px + 7, py - 17, 1, 1, C.branco);
      ret(ctx, px + 4, py - 13, 8, 7, K); ret(ctx, px + 5, py - 12, 6, 6, c); ret(ctx, px + 5, py - 12, 2, 1, clarear(c, 0.5));
      triangulo(ctx, px + 1, py - 7, 14, 11, K); triangulo(ctx, px + 2, py - 6, 12, 9, c);
      ret(ctx, px + 5, py - 7, 6, 1, C.amarelo); ret(ctx, px + 6, py - 2, 1, 1, C.branco); ret(ctx, px + 9, py, 1, 1, C.branco);
    } });
  // os balões presos num peso (1 × 1)
  I.objeto('vila-shopping-baloes', { w: 1, h: 1, solido: true, alto: true, topo: 28,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 7, py - 12, 1, 22, '#7a6a8a'); ret(ctx, px + 4, py - 16, 1, 6, '#7a6a8a'); ret(ctx, px + 5, py - 11, 2, 1, '#7a6a8a');
      ret(ctx, px + 11, py - 17, 1, 7, '#7a6a8a'); ret(ctx, px + 8, py - 11, 3, 1, '#7a6a8a');
      [[4, -20, C.coral], [11, -21, C.azul], [8, -24, C.amarelo]].forEach(function (b) {
        circulo(ctx, px + b[0], py + b[1], 4, K); circulo(ctx, px + b[0], py + b[1], 3, b[2]);
        ret(ctx, px + b[0] - 2, py + b[1] - 2, 1, 2, C.branco); ret(ctx, px + b[0], py + b[1] + 4, 1, 1, K);
      });
      caixa(ctx, px + 4, py + 8, 8, 6, C.cereja); ret(ctx, px + 5, py + 9, 6, 1, '#ff6f9a');
    } });
  // lixeira de metal com tampa verde-água (1 × 1)
  I.objeto('vila-shopping-lixeira', { w: 1, h: 1, solido: true, alto: true, topo: 6,
    desenhar: function (ctx, px, py) {
      caixa(ctx, px + 4, py - 2, 8, 16, C.metal); ret(ctx, px + 5, py - 1, 1, 14, C.metalLuz);
      for (var i = 0; i < 3; i++) ret(ctx, px + 7 + i * 2, py + 1, 1, 10, C.metal2);
      caixa(ctx, px + 3, py - 5, 10, 4, C.agua); ret(ctx, px + 4, py - 4, 8, 1, clarear(C.agua, 0.4));
    } });
  // escada rolante de enfeite (2 × 2): os degraus em zigue-zague subindo para a direita, o vidro, o corrimão preto que
  // dá a volta nas pontas, a lateral de metal e a coluna embaixo
  I.objeto('vila-shopping-escada', { w: 2, h: 2, solido: true, alto: true, topo: 30,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 22, py + 4, 6, 28, K); ret(ctx, px + 23, py + 4, 4, 27, C.metal2); ret(ctx, px + 23, py + 4, 1, 27, C.metal);
      for (var i = 0; i < 32; i++) {
        var x = px + i, d = py + 24 - Math.floor(i * 5 / 4), s = py + 19 - 5 * Math.floor(i / 4);
        ret(ctx, x, d - 15, 1, 2, K); ret(ctx, x, d - 13, 1, 7, i % 8 === 2 ? C.vidroLuz : C.vidro); ret(ctx, x, d - 6, 1, 1, C.metal2);
        ret(ctx, x, s, 1, d - s, i % 4 === 3 ? C.metal2 : C.metal); ret(ctx, x, s, 1, 1, i % 4 === 3 ? K : C.metalLuz);
        ret(ctx, x, d, 1, 6, C.metal2); ret(ctx, x, d + 1, 1, 1, C.metalLuz); ret(ctx, x, d + 6, 1, 1, K);
      }
      ret(ctx, px - 1, py + 9, 2, 8, K); ret(ctx, px + 31, py - 29, 2, 8, K);   // as voltas do corrimão
    } });
  // o carro antigo do encontro de carros (3 × 2; interativo), num tablado
  I.objeto('vila-shopping-carro', { w: 3, h: 2, solido: true, alto: true, topo: 4,
    desenhar: function (ctx, px, py, o) {
      var c = (o.var && o.var.cor) || C.agua, cl = clarear(c, 0.35), ce = escurecer(c, 0.25);
      caixa(ctx, px, py + 25, 48, 7, C.cereja); ret(ctx, px + 1, py + 26, 46, 1, '#ff6f9a');
      // a capota branca com as duas janelas
      ret(ctx, px + 13, py - 2, 21, 13, K); ret(ctx, px + 15, py - 3, 17, 1, K);
      ret(ctx, px + 14, py - 1, 19, 11, C.creme); ret(ctx, px + 15, py - 2, 17, 1, C.creme);
      [15, 24].forEach(function (x) { ret(ctx, px + x, py + 1, 8, 7, K); ret(ctx, px + x + 1, py + 2, 6, 5, C.vidro); ret(ctx, px + x + 1, py + 2, 2, 1, C.vidroLuz); });
      // a carroceria arredondada
      ret(ctx, px + 4, py + 9, 40, 16, K); ret(ctx, px + 2, py + 12, 44, 10, K);
      ret(ctx, px + 5, py + 10, 38, 14, c); ret(ctx, px + 3, py + 13, 42, 8, c);
      ret(ctx, px + 5, py + 10, 38, 1, cl); ret(ctx, px + 3, py + 13, 1, 6, cl); ret(ctx, px + 4, py + 20, 40, 2, ce);
      ret(ctx, px + 4, py + 16, 40, 1, C.branco); ret(ctx, px + 26, py + 13, 3, 1, C.metal2);
      ret(ctx, px + 1, py + 18, 4, 4, K); ret(ctx, px + 2, py + 19, 3, 2, C.metalLuz);
      ret(ctx, px + 43, py + 18, 4, 4, K); ret(ctx, px + 43, py + 19, 3, 2, C.metalLuz);
      ret(ctx, px + 3, py + 13, 3, 3, K); ret(ctx, px + 3, py + 14, 2, 1, '#fff3a0'); ret(ctx, px + 44, py + 13, 2, 2, C.vermelho);
      // as rodas de faixa branca
      [12, 36].forEach(function (x) {
        circulo(ctx, px + x, py + 23, 6, K); circulo(ctx, px + x, py + 23, 5, '#3a3a5a');
        circulo(ctx, px + x, py + 23, 3, C.branco); circulo(ctx, px + x, py + 23, 1, C.metal2);
      });
    } });
})();
