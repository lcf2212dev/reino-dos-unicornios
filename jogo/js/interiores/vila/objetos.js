/* Vila Arco-Íris, os objetos da rua (prefixo vila-; docs/contratos/vila.md): as 4 fachadas das lojas (sólidas, a porta
   desenhada embaixo, logo acima do tile da escada `portal`), a fonte arco-íris, o poste, as bandeirolas, o canteiro,
   a árvore florida, o poço, a placa de boas-vindas, o terreno livre cercado e a placa dele, o carrinho de flores e o
   portal de volta para o Bosque (as cores do bosque/portal-vila.js). Os da dentro das lojas estão em objetos-2.js.
   Usa Reino._predios.vila (V, de fundo.js). Animações (fumaça da forja, água da fonte, portal) só no `anim`. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo;
  var K = R.Desenho.K;
  var V = R._predios.vila, caixa = V.caixa, ARCO = V.ARCO;
  var MADEIRA = ['#7a5234', '#9a6c46', '#c08a5a'];

  /* ---------- fachadas (7 × 5 tiles; a porta no meio, sobre a fileira de baixo) ---------- */
  // tema: { parede, parede2, telhado, telhado2, porta, emblema(ctx, cx, cy), vitrine(ctx, x, y), extra?(ctx, px, py) }
  function fachada(ctx, px, py, t) {
    var W = 112, i;
    ret(ctx, px + 2, py + 78, W - 4, 3, 'rgba(58,36,70,0.25)');                       // sombra no chão
    caixa(ctx, px + 4, py + 14, W - 8, 66, t.parede);                                  // a parede
    for (i = 0; i < 6; i++) ret(ctx, px + 5, py + 22 + i * 10, W - 10, 1, t.parede2);  // tábuas/fiadas
    ret(ctx, px + 5, py + 72, W - 10, 7, t.parede2); ret(ctx, px + 5, py + 72, W - 10, 1, K);   // rodapé
    // telhado em escada (pixel) com beiral recortado
    for (i = 0; i < 6; i++) ret(ctx, px + 14 - i * 2 - (i ? 0 : 0), py - 6 + i * 4, W - 28 + i * 4, 4, K);
    for (i = 0; i < 6; i++) ret(ctx, px + 15 - i * 2, py - 5 + i * 4, W - 30 + i * 4, 3, i % 2 ? t.telhado2 : t.telhado);
    ret(ctx, px + 2, py + 18, W - 4, 3, K);
    for (i = 0; i < 13; i++) { circulo(ctx, px + 6 + i * 8, py + 20, 4, K); circulo(ctx, px + 6 + i * 8, py + 20, 3, i % 2 ? t.telhado2 : t.telhado); }
    // janelas com vitrine e floreira
    [10, 74].forEach(function (x) {
      caixa(ctx, px + x, py + 38, 28, 24, '#dff4ff'); ret(ctx, px + x + 1, py + 39, 26, 4, '#bfe6ff');
      ret(ctx, px + x + 13, py + 38, 2, 24, K); ret(ctx, px + x + 2, py + 41, 3, 3, '#ffffff');
      t.vitrine(ctx, px + x + 1, py + 43);
      caixa(ctx, px + x - 2, py + 62, 32, 5, MADEIRA[1]);
      for (var f = 0; f < 6; f++) { ret(ctx, px + x + f * 5, py + 59, 3, 3, K); ret(ctx, px + x + f * 5, py + 59, 2, 2, ARCO[f]); }
    });
    // a porta (arco), com degrau saindo para a rua e a maçaneta dourada
    ret(ctx, px + 46, py + 50, 20, 30, K); ret(ctx, px + 48, py + 46, 16, 4, K);
    ret(ctx, px + 47, py + 51, 18, 29, t.porta); ret(ctx, px + 49, py + 47, 14, 4, t.porta);
    ret(ctx, px + 55, py + 49, 2, 31, 'rgba(58,36,70,0.35)'); ret(ctx, px + 49, py + 56, 4, 8, '#ffffff'); ret(ctx, px + 59, py + 56, 4, 8, '#ffffff');
    ret(ctx, px + 60, py + 68, 2, 2, '#ffe066');
    caixa(ctx, px + 42, py + 79, 28, 5, '#d4d4e0');
    // a placa grande com o emblema da loja, presa por duas correntinhas
    ret(ctx, px + 36, py + 22, 1, 4, K); ret(ctx, px + 75, py + 22, 1, 4, K);
    caixa(ctx, px + 30, py + 25, 52, 20, '#fff4d8'); ret(ctx, px + 31, py + 26, 50, 2, '#ffffff'); ret(ctx, px + 31, py + 42, 50, 2, '#f0d8a8');
    t.emblema(ctx, px + 56, py + 35);
    if (t.extra) t.extra(ctx, px, py);
  }
  function lojaFachada(id, t, anim) {
    var def = { w: 7, h: 5, solido: true, alto: false, topo: t.topo || 10, junto: true,
      desenhar: function (ctx, px, py) { fachada(ctx, px, py, t); } };
    if (anim) def.anim = anim;
    I.objeto('vila-fachada-' + id, def);
  }
  // emblemas e vitrines de cada loja
  function vaso(ctx, x, y, cor) { caixa(ctx, x, y + 4, 7, 8, cor); ret(ctx, x + 1, y + 5, 2, 6, '#ffffff'); ret(ctx, x + 3, y, 1, 4, '#3f8f45'); circulo(ctx, x + 3, y, 2, '#ff7eb6'); }
  function almofada(ctx, x, y, cor) { caixa(ctx, x, y, 10, 7, cor); ret(ctx, x + 2, y + 2, 2, 2, '#ffffff'); ret(ctx, x - 1, y, 2, 2, K); ret(ctx, x + 9, y + 5, 2, 2, K); }
  function espada(ctx, x, y, h, cor) { ret(ctx, x - 1, y, 3, h, K); ret(ctx, x, y + 1, 1, h - 2, cor || '#e8e8f4'); ret(ctx, x - 3, y + h - 4, 7, 2, '#ffe066'); ret(ctx, x, y + h - 2, 1, 4, MADEIRA[0]); }
  function bigorna(ctx, x, y) { ret(ctx, x, y, 18, 5, K); ret(ctx, x + 1, y + 1, 16, 3, '#8a8a9c'); ret(ctx, x - 3, y + 1, 4, 2, K); ret(ctx, x + 5, y + 5, 8, 4, K); ret(ctx, x + 6, y + 5, 6, 3, '#6a6a7c'); ret(ctx, x + 3, y + 9, 12, 2, K); }
  function chapeu(ctx, cx, y, w, cor, fita) {
    elipse(ctx, cx, y + w / 3, w / 2 + 1, 3, K); elipse(ctx, cx, y + w / 3, w / 2, 2, cor);
    ret(ctx, cx - w / 4 - 1, y - 1, w / 2 + 2, w / 3 + 1, K); ret(ctx, cx - w / 4, y, w / 2, w / 3, cor);
    ret(ctx, cx - w / 4, y + w / 3 - 3, w / 2, 2, fita);
  }
  function escudo(ctx, x, y, cor) {
    ret(ctx, x, y, 14, 10, K); ret(ctx, x + 1, y + 10, 12, 3, K); ret(ctx, x + 3, y + 13, 8, 2, K); ret(ctx, x + 5, y + 15, 4, 2, K);
    ret(ctx, x + 1, y + 1, 12, 10, cor); ret(ctx, x + 3, y + 11, 8, 2, cor); ret(ctx, x + 5, y + 13, 4, 2, cor);
    ret(ctx, x + 6, y + 2, 2, 11, '#ffe066'); ret(ctx, x + 2, y + 5, 10, 2, '#ffe066');
  }
  function bota(ctx, x, y, cor) { ret(ctx, x, y, 7, 10, K); ret(ctx, x, y + 7, 12, 5, K); ret(ctx, x + 1, y + 1, 5, 9, cor); ret(ctx, x + 1, y + 8, 10, 3, cor); ret(ctx, x + 1, y + 1, 5, 2, '#ffe066'); }
  // os mesmos desenhos da mercadoria, dentro das lojas (objetos-2.js)
  V.MADEIRA = MADEIRA; V.vaso = vaso; V.almofada = almofada; V.espada = espada; V.bigorna = bigorna; V.chapeu = chapeu; V.escudo = escudo; V.bota = bota;

  lojaFachada('casa', { parede: '#ffd1e6', parede2: '#ffb8d6', telhado: '#e05a9a', telhado2: '#ff86bb', porta: '#c86aa0',
    emblema: function (ctx, cx, cy) { vaso(ctx, cx - 14, cy - 6, '#5fb4ff'); almofada(ctx, cx + 2, cy - 1, '#ff86bb'); circulo(ctx, cx + 1, cy - 4, 2, '#ffe066'); },
    vitrine: function (ctx, x, y) { vaso(ctx, x + 2, y + 2, '#a66bff'); almofada(ctx, x + 14, y + 8, '#ffe066'); },
    extra: function (ctx, px, py) {   // coração no alto do telhado
      ret(ctx, px + 51, py - 14, 4, 4, K); ret(ctx, px + 57, py - 14, 4, 4, K); ret(ctx, px + 51, py - 12, 10, 4, K); ret(ctx, px + 53, py - 8, 6, 3, K);
      ret(ctx, px + 52, py - 13, 3, 3, '#ff5c8a'); ret(ctx, px + 57, py - 13, 3, 3, '#ff5c8a'); ret(ctx, px + 52, py - 11, 8, 3, '#ff5c8a'); ret(ctx, px + 54, py - 8, 4, 2, '#ff5c8a');
    } });
  var FUMACA = ['#e8e8f4', '#d4d4e0', '#c0c0d0'];
  lojaFachada('armas', { parede: '#d4d4e0', parede2: '#b0b0c2', telhado: '#b8443a', telhado2: '#d8604a', porta: '#7a5234', topo: 30,
    emblema: function (ctx, cx, cy) { bigorna(ctx, cx - 9, cy - 1); espada(ctx, cx - 14, cy - 8, 16); espada(ctx, cx + 14, cy - 8, 16, '#bfe6ff'); },
    vitrine: function (ctx, x, y) { espada(ctx, x + 6, y, 16); espada(ctx, x + 13, y + 1, 15, '#ffe066'); espada(ctx, x + 20, y, 16, '#bfe6ff'); },
    extra: function (ctx, px, py) {   // a chaminé da forja, com o brilho do fogo
      caixa(ctx, px + 82, py - 22, 14, 26, '#8a6a5a'); ret(ctx, px + 83, py - 21, 12, 3, '#6a4a3a'); ret(ctx, px + 85, py - 4, 8, 3, '#ff9f45');
    } }, function (ctx, px, py, t) {   // fumacinha subindo
      for (var i = 0; i < 3; i++) {
        var f = ((t / 1800) + i / 3) % 1, x = px + 89 + Math.round(Math.sin(f * 6 + i) * 3), y = py - 26 - Math.round(f * 26);
        circulo(ctx, x, y, 2 + Math.round(f * 3), FUMACA[i]);
      }
    });
  lojaFachada('cabecas', { parede: '#d8c8ff', parede2: '#c4b0f4', telhado: '#6a3fb0', telhado2: '#8a5ad8', porta: '#5a3a8a', topo: 30,
    emblema: function (ctx, cx, cy) { ret(ctx, cx - 18, cy - 1, 10, 7, K); ret(ctx, cx - 17, cy, 8, 5, '#b0b0c2'); ret(ctx, cx - 16, cy + 2, 6, 1, K); ret(ctx, cx - 14, cy - 4, 2, 4, '#ff5c6a'); },
    vitrine: function (ctx, x, y) { chapeu(ctx, x + 7, y + 6, 12, '#ff86bb', '#ffe066'); chapeu(ctx, x + 20, y + 8, 12, '#5fb4ff', '#ffffff'); },
    extra: function (ctx, px, py) {   // o chapéu ENORME sentado na placa, com pena
      chapeu(ctx, px + 56, py + 10, 48, '#8a4fd0', '#ffe066');
      ret(ctx, px + 46, py + 13, 4, 4, '#ffffff');
      ret(ctx, px + 66, py - 6, 3, 18, K); ret(ctx, px + 67, py - 5, 1, 16, '#ff9ed2'); ret(ctx, px + 68, py - 8, 4, 4, K); ret(ctx, px + 68, py - 7, 3, 3, '#ffc8e6');
    } });
  lojaFachada('armaduras', { parede: '#c8dcff', parede2: '#a8c4f0', telhado: '#2f4f9a', telhado2: '#3f6fd8', porta: '#3a3a5a',
    emblema: function (ctx, cx, cy) { escudo(ctx, cx - 16, cy - 8, '#5fb4ff'); bota(ctx, cx + 3, cy - 6, '#9a6c46'); },
    vitrine: function (ctx, x, y) { escudo(ctx, x + 2, y + 1, '#ff5c6a'); bota(ctx, x + 15, y + 4, '#c08a5a'); },
    extra: function (ctx, px, py) {   // bandeirinha azul na ponta do telhado
      ret(ctx, px + 55, py - 22, 2, 18, K); ret(ctx, px + 57, py - 22, 9, 6, K); ret(ctx, px + 57, py - 21, 8, 4, '#5fb4ff');
    } });

  /* ---------- a praça ---------- */
  // fonte redonda (3 × 2): bacia de pedra, água azul e o jato de arco-íris
  I.objeto('vila-fonte', { w: 3, h: 2, solido: true, alto: true, topo: 20,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 24, py + 24, 24, 9, 'rgba(58,36,70,0.22)');
      elipse(ctx, px + 24, py + 18, 23, 11, K); elipse(ctx, px + 24, py + 18, 22, 10, '#e8e0f0'); elipse(ctx, px + 24, py + 21, 21, 7, '#c4b8d8');
      elipse(ctx, px + 24, py + 16, 18, 7, K); elipse(ctx, px + 24, py + 16, 17, 6, '#5fb4ff'); elipse(ctx, px + 24, py + 15, 13, 4, '#8fd0ff');
      ret(ctx, px + 21, py - 2, 7, 18, K); ret(ctx, px + 22, py - 1, 5, 17, '#e8e0f0'); ret(ctx, px + 22, py - 1, 2, 17, '#ffffff');
      elipse(ctx, px + 24, py - 3, 8, 3, K); elipse(ctx, px + 24, py - 3, 7, 2, '#e8e0f0');
      ARCO.forEach(function (c, i) { ret(ctx, px + 14 + i * 4, py - 12 + Math.abs(i - 2.5) * 2, 3, 3, c); });
    },
    anim: function (ctx, px, py, t) {   // gotinhas coloridas caindo do jato
      for (var i = 0; i < 6; i++) {
        var f = ((t / 1200) + i / 6) % 1, lado = i % 2 ? 1 : -1;
        ret(ctx, px + 24 + lado * Math.round(4 + f * 12), py - 10 + Math.round(f * f * 24), 2, 2, ARCO[i]);
      }
    } });
  // poste com lampião e cestinha de flores
  I.objeto('vila-poste', { w: 1, h: 1, solido: true, alto: true, topo: 30,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 8, py + 14, 5, 2, 'rgba(58,36,70,0.25)');
      ret(ctx, px + 6, py - 18, 4, 33, K); ret(ctx, px + 7, py - 17, 2, 31, '#5a5a7a');
      caixa(ctx, px + 4, py + 11, 8, 4, '#5a5a7a');
      caixa(ctx, px + 3, py - 28, 10, 11, '#fff3a0'); ret(ctx, px + 4, py - 27, 8, 2, '#ffffff'); ret(ctx, px + 2, py - 30, 12, 3, K); ret(ctx, px + 3, py - 29, 10, 1, '#5a5a7a');
      caixa(ctx, px + 2, py - 12, 12, 5, MADEIRA[1]);
      for (var i = 0; i < 4; i++) { ret(ctx, px + 2 + i * 3, py - 14, 3, 3, K); ret(ctx, px + 3 + i * 3, py - 13, 2, 2, ARCO[i + 1]); }
    } });
  // bandeirolas de arco-íris penduradas entre dois postes (o poste fica no tile de cada ponta, fora da pegada)
  I.objeto('vila-bandeirolas', { w: 5, h: 1, solido: false, alto: true, topo: 30, semSombra: true, junto: true,
    desenhar: function (ctx, px, py) {
      for (var x = -6; x < 86; x++) { var y = py - 22 + Math.round(Math.sin(((x + 6) / 92) * Math.PI) * 6); ret(ctx, px + x, y, 1, 1, K); }
      for (var i = 0; i < 9; i++) {
        var bx = px + 1 + i * 9, by = py - 21 + Math.round(Math.sin(((i * 9 + 11) / 92) * Math.PI) * 6);
        for (var j = 0; j < 7; j++) {   // triângulo de ponta para baixo, contornado
          var m = 3 - Math.floor(j / 2);
          ret(ctx, bx + 3 - m - 1, by + j, m * 2 + 3, 1, K);
          if (j < 6 && m > 0) ret(ctx, bx + 3 - m, by + j, m * 2 + 1, 1, ARCO[i % 6]);
        }
      }
    } });
  // canteiro de madeira cheio de flores (2 × 1)
  I.objeto('vila-canteiro', { w: 2, h: 1, solido: true,
    desenhar: function (ctx, px, py) {
      caixa(ctx, px + 1, py + 6, 30, 9, MADEIRA[1]); ret(ctx, px + 2, py + 7, 28, 2, MADEIRA[2]);
      for (var i = 0; i < 7; i++) {
        var x = px + 3 + i * 4, y = py + 1 + (i % 2) * 2;
        ret(ctx, x + 1, y + 3, 1, 3, '#3f8f45'); ret(ctx, x, y - 1, 3, 4, K); ret(ctx, x, y, 3, 2, ARCO[i % 6]); ret(ctx, x + 1, y, 1, 1, '#ffffff');
      }
    } });
  // árvore redondinha, de copa florida (var.n escolhe a cor das flores)
  I.objeto('vila-arvore', { w: 1, h: 1, solido: true, alto: true, topo: 32,
    desenhar: function (ctx, px, py, o) {
      var c = ARCO[((o.var && o.var.n) || 0) % 6];
      elipse(ctx, px + 8, py + 14, 7, 2, 'rgba(40,70,40,0.3)');
      ret(ctx, px + 5, py - 4, 6, 19, K); ret(ctx, px + 6, py - 4, 4, 18, MADEIRA[1]); ret(ctx, px + 6, py - 4, 1, 18, MADEIRA[2]);
      circulo(ctx, px + 8, py - 14, 11, K); circulo(ctx, px + 8, py - 14, 10, '#55ad55'); circulo(ctx, px + 6, py - 16, 6, '#7fcf6a'); circulo(ctx, px + 4, py - 18, 2, '#a8e88a');
      [[2, -12], [12, -18], [10, -8], [5, -22], [14, -12]].forEach(function (f) { ret(ctx, px + f[0], py + f[1], 2, 2, c); ret(ctx, px + f[0], py + f[1], 1, 1, '#ffffff'); });
    } });
  // o poço dos desejos (interativo)
  I.objeto('vila-poco', { w: 1, h: 1, solido: true, alto: true, topo: 20,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 8, py + 14, 8, 2, 'rgba(58,36,70,0.25)');
      caixa(ctx, px + 1, py + 2, 14, 13, '#b0b0c2'); ret(ctx, px + 2, py + 6, 12, 1, '#8a8a9c'); ret(ctx, px + 2, py + 10, 12, 1, '#8a8a9c');
      elipse(ctx, px + 8, py + 2, 7, 2, K); elipse(ctx, px + 8, py + 2, 6, 1, '#3f6fd8');
      ret(ctx, px + 1, py - 14, 2, 16, K); ret(ctx, px + 13, py - 14, 2, 16, K);
      triangulo(ctx, px - 2, py - 22, 20, 9, K); triangulo(ctx, px, py - 20, 16, 7, '#ff86bb');
      ret(ctx, px + 3, py - 10, 10, 1, MADEIRA[0]); ret(ctx, px + 7, py - 10, 2, 6, '#c08a5a');
    } });
  // placa de boas-vindas: arco-íris pintado na tábua (interativa)
  I.objeto('vila-placa', { w: 1, h: 1, solido: true, alto: true, topo: 14,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 7, py - 2, 3, 17, K); ret(ctx, px + 8, py - 2, 1, 16, MADEIRA[1]);
      caixa(ctx, px - 2, py - 14, 20, 13, '#fff4d8');
      ARCO.forEach(function (c, i) { ret(ctx, px + 1 + i, py - 11 + i, 14 - i * 2, 1, c); });
      ret(ctx, px + 1, py - 4, 3, 2, '#ffffff'); ret(ctx, px + 12, py - 4, 3, 2, '#ffffff');
    } });
  // carrinho de flores (2 × 1)
  I.objeto('vila-carrinho', { w: 2, h: 1, solido: true, alto: true, topo: 18,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 16, py + 14, 14, 2, 'rgba(58,36,70,0.25)');
      caixa(ctx, px + 2, py + 2, 28, 9, '#ff9ed2'); ret(ctx, px + 3, py + 3, 26, 2, '#ffc8e6');
      circulo(ctx, px + 8, py + 12, 3, K); circulo(ctx, px + 8, py + 12, 2, MADEIRA[1]); circulo(ctx, px + 24, py + 12, 3, K); circulo(ctx, px + 24, py + 12, 2, MADEIRA[1]);
      ret(ctx, px + 29, py - 2, 2, 6, K);
      for (var i = 0; i < 8; i++) { var x = px + 3 + i * 3, y = py - 3 - (i % 3) * 2; ret(ctx, x, y + 2, 1, 4, '#3f8f45'); ret(ctx, x - 1, y, 3, 3, K); ret(ctx, x, y + 1, 1, 1, ARCO[i % 6]); }
      ret(ctx, px + 1, py - 10, 30, 2, K); [0, 1, 2, 3, 4].forEach(function (i) { ret(ctx, px + 2 + i * 6, py - 9, 6, 3, i % 2 ? '#ffffff' : '#ff5c8a'); });
      ret(ctx, px + 2, py - 7, 1, 10, K); ret(ctx, px + 29, py - 7, 1, 5, K);
    } });

  /* ---------- os terrenos livres ---------- */
  // lote de grama aparada com cerquinha branca em volta (pegada var.w × var.h; sólido: ela não entra)
  I.objeto('vila-terreno', { w: 6, h: 5, solido: true, semSombra: true,
    desenhar: function (ctx, px, py, o) {
      var w = (o.w || 6) * 16, h = (o.h || 5) * 16, x, y;
      ret(ctx, px + 2, py + 4, w - 4, h - 6, '#b2e283');
      for (y = 8; y < h - 6; y += 8) for (x = 6 + (y % 16 ? 4 : 0); x < w - 8; x += 12) ret(ctx, px + x, py + y, 3, 1, '#8ccc5c');
      ret(ctx, px + w / 2 - 6, py + h / 2 - 2, 3, 2, '#3f8f45'); ret(ctx, px + w / 2 - 5, py + h / 2 - 4, 1, 2, '#3f8f45');   // brotinho
      function ripa(x0, y0) { ret(ctx, x0, y0 - 6, 4, 9, K); ret(ctx, x0 + 1, y0 - 5, 2, 7, '#ffffff'); }
      ret(ctx, px + 2, py + 2, w - 4, 1, K); ret(ctx, px + 2, py + 3, w - 4, 1, '#ffffff');
      ret(ctx, px + 2, py + h - 4, w - 4, 1, K); ret(ctx, px + 2, py + h - 3, w - 4, 1, '#ffffff');
      ret(ctx, px + 2, py + 2, 1, h - 5, K); ret(ctx, px + w - 3, py + 2, 1, h - 5, K);
      for (x = 2; x < w - 2; x += 8) { ripa(px + x, py + 6); ripa(px + x, py + h - 2); }
      for (y = 14; y < h - 6; y += 8) { ripa(px + 1, py + y); ripa(px + w - 5, py + y); }
    } });
  // a placa do terreno: uma casinha tracejada e o "+" de novidade (interativa)
  I.objeto('vila-placa-terreno', { w: 1, h: 1, solido: true, alto: true, topo: 12,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 7, py, 3, 15, K); ret(ctx, px + 8, py, 1, 14, MADEIRA[1]);
      caixa(ctx, px, py - 12, 17, 13, '#fff4d8');
      triangulo(ctx, px + 3, py - 10, 8, 3, '#ff86bb'); ret(ctx, px + 4, py - 7, 6, 5, '#ffd1e6'); ret(ctx, px + 6, py - 5, 2, 3, '#c86aa0');
      ret(ctx, px + 12, py - 8, 1, 5, '#6fdc8c'); ret(ctx, px + 10, py - 6, 5, 1, '#6fdc8c');
    } });

  /* ---------- o portal de volta para o Bosque (não sólido: pisou, viaja) ---------- */
  var portal = R.Portal.criar(R._predios.bosque.CORES_VILA);
  I.objeto('vila-portal', { w: 1, h: 1, solido: false, semSombra: true,
    desenhar: function (ctx, px, py) { portal.desenhar(ctx, px, py); },
    anim: function (ctx, px, py, t) { portal.animar(ctx, px, py, 16, 16, t); } });
})();
