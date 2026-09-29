/* Laboratório de Ciências (3º andar do Observatório), parte 1 de 3: as cores do laboratório, os bichinhos
   em matriz e os objetos do Hall, da sala 1 (Vivo ou Não Vivo?) e da sala 2 (Quem Ganha, Quem Perde).
   Prefixo lab-. O que as outras partes usam fica em Reino._predios.observatorio.lab (ver o fim do arquivo). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var clarear = D.clarear, escurecer = D.escurecer, matriz = D.matriz;
  var K = R.Desenho.K;
  // cores do laboratório: branco azulado, verde-água e o amarelo dos detalhes
  var LAB = '#f4fbff', LAB2 = '#d6eef8', AGUA = '#39c5bb', AGUA2 = '#1f9a92', AMARELO = '#ffd34d';
  var FOLHA = '#5fb85a', FOLHA2 = '#3f9a45', TERRA = '#a0744a', TERRA2 = '#6b4428', AREIA = '#f0d8a0', AREIA2 = '#d9b878';
  var VIDRO = '#d9f3ff', VIDRO2 = '#a8dcf0';

  function v(o, k, padrao) { return (o && o.var && o.var[k] !== undefined) ? o.var[k] : padrao; }
  // bichinho em matriz, com os pés em (cx, by): cada linha tem a mesma largura
  function bicho(ctx, cx, by, linhas, pal) {
    var w = linhas[0].length;
    matriz(ctx, cx - (w >> 1), by - linhas.length + 1, linhas, Object.assign({ k: K }, pal));
  }
  // frasco de vidro com líquido (base em by)
  function frasco(ctx, x, by, w, h, cor) {
    ret(ctx, x, by - h, w, h, K); ret(ctx, x + 1, by - h + 1, w - 2, h - 2, VIDRO);
    ret(ctx, x + 1, by - (h >> 1), w - 2, (h >> 1) - 1, cor); ret(ctx, x + 1, by - h + 1, 1, h - 3, C.branco);
  }
  // pé de mesa de laboratório (tampo branco, pés de metal), tampo em ty, base em py+15, largura em tiles
  function tampo(ctx, px, py, ty, tiles) {
    var w = tiles * 16 - 2;
    ret(ctx, px + 2, ty + 3, 2, py + 15 - ty - 3, C.metal2); ret(ctx, px + w - 3, ty + 3, 2, py + 15 - ty - 3, C.metal2);
    ret(ctx, px + 1, ty, w, 5, K); ret(ctx, px + 2, ty + 1, w - 2, 3, LAB); ret(ctx, px + 2, ty + 3, w - 2, 1, LAB2);
  }

  /* ================= GERAIS (parede) ================= */
  // cartaz 1×2 na parede com um desenho: vivo, onca, abelha, passaro, sol, neve, peixe, pegada, atomo
  I.objeto('lab-cartaz', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var d = v(o, 'desenho', 'vivo'), cx = px + 8, cy = py + 14;
      contornoRet(ctx, px + 1, py + 4, 14, 20, v(o, 'cor', '#fffaf0'));
      ret(ctx, px + 2, py + 5, 12, 2, v(o, 'faixa', AGUA));
      if (d === 'vivo') { ret(ctx, cx, cy, 1, 6, FOLHA2); elipse(ctx, cx - 3, cy + 1, 3, 2, FOLHA); elipse(ctx, cx + 3, cy - 1, 3, 2, FOLHA); }
      else if (d === 'onca') { circulo(ctx, cx, cy + 2, 5, '#f0a040'); ret(ctx, cx - 3, cy, 1, 1, K); ret(ctx, cx + 2, cy, 1, 1, K); ret(ctx, cx - 1, cy + 3, 2, 1, K); ret(ctx, cx - 4, cy + 4, 1, 1, TERRA2); ret(ctx, cx + 3, cy + 5, 1, 1, TERRA2); ret(ctx, cx - 5, cy - 3, 2, 2, '#f0a040'); ret(ctx, cx + 3, cy - 3, 2, 2, '#f0a040'); }
      else if (d === 'abelha') { elipse(ctx, cx, cy + 2, 5, 3, AMARELO); ret(ctx, cx - 2, cy - 1, 1, 6, K); ret(ctx, cx + 1, cy - 1, 1, 6, K); elipse(ctx, cx - 1, cy - 2, 2, 2, C.vidro); elipse(ctx, cx + 2, cy - 2, 2, 2, C.vidro); }
      else if (d === 'passaro') { elipse(ctx, cx, cy + 2, 4, 3, C.azul); circulo(ctx, cx + 3, cy - 1, 2, C.azul); ret(ctx, cx + 5, cy - 1, 2, 1, C.laranja); ret(ctx, cx + 3, cy - 2, 1, 1, K); }
      else if (d === 'sol') { circulo(ctx, cx, cy + 1, 4, AMARELO); ret(ctx, cx, cy - 6, 1, 2, C.laranja); ret(ctx, cx, cy + 6, 1, 2, C.laranja); ret(ctx, cx - 7, cy + 1, 2, 1, C.laranja); ret(ctx, cx + 6, cy + 1, 2, 1, C.laranja); }
      else if (d === 'neve') { ret(ctx, cx, cy - 4, 1, 11, C.azul); ret(ctx, cx - 5, cy + 1, 11, 1, C.azul); ret(ctx, cx - 3, cy - 2, 7, 7, C.azul); ret(ctx, cx - 2, cy - 1, 5, 5, '#fffaf0'); }
      else if (d === 'peixe') { elipse(ctx, cx - 1, cy + 1, 4, 3, C.laranja); triangulo(ctx, cx + 3, cy - 1, 5, 5, C.laranja); ret(ctx, cx - 3, cy, 1, 1, K); }
      else if (d === 'pegada') { elipse(ctx, cx, cy + 3, 3, 3, TERRA2); circulo(ctx, cx - 4, cy - 2, 1, TERRA2); circulo(ctx, cx, cy - 4, 1, TERRA2); circulo(ctx, cx + 4, cy - 2, 1, TERRA2); }
      else { elipse(ctx, cx, cy + 1, 6, 2, AGUA); elipse(ctx, cx, cy + 1, 2, 5, C.lilas); circulo(ctx, cx, cy + 1, 1, C.vermelho); }
    } });
  // quadro-negro 2×2: seres (vivos × não vivos), memoria, cadeia (quem come quem), mapa (hábitats)
  I.objeto('lab-quadro', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var d = v(o, 'desenho', 'seres');
      ret(ctx, px + 1, py + 3, 30, 23, C.madeira2); ret(ctx, px + 2, py + 4, 28, 21, K); ret(ctx, px + 3, py + 5, 26, 19, '#2f6a5a');
      ret(ctx, px + 4, py + 24, 24, 2, C.madeiraClara); ret(ctx, px + 8, py + 23, 4, 1, C.branco);
      if (d === 'seres') {
        ret(ctx, px + 16, py + 7, 1, 15, C.branco);
        ret(ctx, px + 9, py + 12, 1, 7, FOLHA); elipse(ctx, px + 7, py + 12, 2, 1, FOLHA); elipse(ctx, px + 11, py + 11, 2, 1, FOLHA);
        elipse(ctx, px + 23, py + 16, 4, 3, C.pedra2); ret(ctx, px + 21, py + 15, 2, 1, C.branco);
        ret(ctx, px + 6, py + 7, 6, 1, AMARELO); ret(ctx, px + 20, py + 7, 6, 1, C.azul2);
      } else if (d === 'memoria') {
        for (var i = 0; i < 4; i++) for (var j = 0; j < 2; j++) contornoRet(ctx, px + 5 + i * 6, py + 8 + j * 7, 5, 6, (i + j) % 2 ? C.rosa2 : C.azul2);
      } else if (d === 'cadeia') {
        ret(ctx, px + 6, py + 16, 3, 5, FOLHA); ret(ctx, px + 10, py + 17, 5, 1, C.branco); ret(ctx, px + 14, py + 16, 1, 3, C.branco);
        elipse(ctx, px + 18, py + 17, 2, 2, FOLHA2); ret(ctx, px + 21, py + 12, 1, 4, C.branco);
        elipse(ctx, px + 24, py + 9, 3, 2, '#f0a040'); ret(ctx, px + 23, py + 9, 1, 1, K);
      } else {
        ret(ctx, px + 5, py + 7, 11, 16, AREIA); ret(ctx, px + 16, py + 7, 11, 16, C.azul2);
        ret(ctx, px + 9, py + 12, 2, 7, FOLHA2); ret(ctx, px + 7, py + 14, 2, 1, FOLHA2);
        triangulo(ctx, px + 18, py + 10, 7, 7, C.branco);
      }
    } });

  /* ================= HALL ================= */
  I.objeto('lab-pulpito', { w: 1, h: 1, topo: 12, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 6, py + 11, 13, 4, K); ret(ctx, cx - 5, py + 12, 11, 2, AGUA2);
      ret(ctx, cx - 3, py - 2, 7, 14, K); ret(ctx, cx - 2, py - 2, 5, 13, AGUA); ret(ctx, cx - 2, py - 2, 1, 13, clarear(AGUA, 0.5));
      ret(ctx, cx - 8, py - 7, 17, 6, K); ret(ctx, cx - 7, py - 6, 15, 4, C.madeira2); ret(ctx, cx - 7, py - 6, 15, 1, C.madeiraClara);
      // o Livro de Ciências aberto: uma folha de um lado, um átomo do outro
      ret(ctx, cx - 7, py - 13, 15, 7, K); ret(ctx, cx - 6, py - 12, 6, 5, C.creme); ret(ctx, cx + 1, py - 12, 6, 5, C.creme);
      ret(ctx, cx, py - 12, 1, 6, AGUA2);
      elipse(ctx, cx - 3, py - 10, 2, 1, FOLHA); ret(ctx, cx - 3, py - 9, 1, 2, FOLHA2);
      elipse(ctx, cx + 4, py - 10, 2, 1, C.lilas); ret(ctx, cx + 4, py - 10, 1, 1, C.vermelho);
    } });
  I.objeto('lab-mapa', { w: 2, h: 1, topo: 14, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 5, py + 4, 2, 11, C.madeira2); ret(ctx, px + 25, py + 4, 2, 11, C.madeira2);
      ret(ctx, px + 2, py - 13, 28, 19, K); ret(ctx, px + 3, py - 12, 26, 17, '#fffaf0');
      ret(ctx, px + 3, py - 12, 26, 3, AGUA);
      // as cinco salas em quadradinhos coloridos
      var cores = [FOLHA, '#f0a040', C.rosa2, AREIA2, C.lilas];
      for (var i = 0; i < 5; i++) { ret(ctx, px + 5 + i * 5, py - 6, 4, 4, K); ret(ctx, px + 6 + i * 5, py - 5, 2, 2, cores[i]); }
      ret(ctx, px + 14, py, 4, 3, K); ret(ctx, px + 15, py + 1, 2, 1, AGUA);
    } });
  I.objeto('lab-microscopio', { w: 1, h: 1, topo: 12, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      tampo(ctx, px, py, py + 3, 1);
      ret(ctx, px + 4, py + 1, 9, 3, K); ret(ctx, px + 5, py + 1, 7, 2, C.metal);
      ret(ctx, px + 10, py - 8, 3, 10, K); ret(ctx, px + 11, py - 7, 1, 8, C.metal2);
      ret(ctx, px + 5, py - 11, 5, 9, K); ret(ctx, px + 6, py - 10, 3, 7, C.branco); ret(ctx, px + 6, py - 12, 3, 2, K);
      ret(ctx, px + 4, py - 3, 7, 2, K); ret(ctx, px + 5, py - 3, 5, 1, AGUA);
      ret(ctx, px + 6, py - 1, 3, 2, K); ret(ctx, px + 7, py - 1, 1, 1, VIDRO2);
    } });
  I.objeto('lab-tubos', { w: 1, h: 1, topo: 6, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 9, 14, 6, K); ret(ctx, px + 2, py + 10, 12, 4, C.madeiraClara);
      var cores = [C.vermelho, AMARELO, AGUA, C.lilas];
      for (var i = 0; i < 4; i++) {
        var x = px + 2 + i * 3;
        ret(ctx, x, py - 4, 3, 13, K); ret(ctx, x + 1, py - 3, 1, 11, VIDRO); ret(ctx, x + 1, py + 2, 1, 6, cores[i]);
      }
    } });

  /* ================= SALA 1: Vivo ou Não Vivo? ================= */
  I.objeto('lab-armario-vidro', { w: 1, h: 1, topo: 18, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py - 17, 14, 32, K); ret(ctx, px + 2, py - 16, 12, 30, LAB2);
      ret(ctx, px + 3, py - 15, 10, 13, VIDRO); ret(ctx, px + 3, py, 10, 12, VIDRO);
      ret(ctx, px + 3, py - 3, 10, 1, C.metal2); ret(ctx, px + 3, py + 12, 10, 1, C.metal2);
      frasco(ctx, px + 4, py - 4, 3, 6, C.verde); frasco(ctx, px + 8, py - 4, 4, 8, C.rosa2);
      frasco(ctx, px + 4, py + 11, 4, 7, AMARELO); elipse(ctx, px + 10, py + 9, 2, 2, C.pedra2);
      ret(ctx, px + 7, py - 1, 2, 1, C.ouro);
    } });
  // bancada 2×1 com miudezas: frascos, vasinhos ou pedras (var.itens)
  I.objeto('lab-bancada', { w: 2, h: 1, topo: 8,   // baixa: as miudezas não passam de 8 px (cabe embaixo dos quadros; O-12)
    solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      tampo(ctx, px, py, py + 2, 2);
      ret(ctx, px + 5, py + 8, 20, 6, K); ret(ctx, px + 6, py + 9, 18, 4, LAB2); ret(ctx, px + 15, py + 9, 1, 4, K);
      var itens = v(o, 'itens', 'frascos');
      if (itens === 'frascos') { frasco(ctx, px + 4, py + 2, 4, 8, C.verde); frasco(ctx, px + 10, py + 2, 3, 10, C.lilas); frasco(ctx, px + 16, py + 2, 5, 7, AGUA); ret(ctx, px + 24, py - 2, 4, 4, K); ret(ctx, px + 25, py - 1, 2, 2, AMARELO); }
      else if (itens === 'vasos') { for (var i = 0; i < 3; i++) { var x = px + 4 + i * 9; ret(ctx, x, py - 3, 6, 5, K); ret(ctx, x + 1, py - 2, 4, 3, C.terracota); ret(ctx, x + 3, py - 8, 1, 5, FOLHA2); elipse(ctx, x + 2, py - 7, 2, 1, FOLHA); elipse(ctx, x + 4, py - 6, 1, 1, FOLHA); } }
      else { elipse(ctx, px + 7, py, 4, 2, C.pedra2); elipse(ctx, px + 16, py, 3, 2, C.metal2); elipse(ctx, px + 24, py - 1, 3, 3, '#c8b0e0'); ret(ctx, px + 23, py - 2, 1, 1, C.branco); }
    } });
  I.objeto('lab-formigueiro', { w: 1, h: 1, topo: 14, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 11, 14, 4, K); ret(ctx, px + 2, py + 12, 12, 2, C.madeira);
      ret(ctx, px + 1, py - 13, 14, 25, K); ret(ctx, px + 2, py - 12, 12, 23, VIDRO);
      ret(ctx, px + 2, py - 6, 12, 17, AREIA2);
      // túneis e salinhas
      ret(ctx, px + 5, py - 6, 1, 6, TERRA2); ret(ctx, px + 5, py, 6, 1, TERRA2); ret(ctx, px + 10, py, 1, 6, TERRA2);
      elipse(ctx, px + 7, py + 7, 3, 1, TERRA2); elipse(ctx, px + 11, py - 2, 2, 1, TERRA2);
      ret(ctx, px + 6, py - 1, 1, 1, K); ret(ctx, px + 9, py + 7, 1, 1, K); ret(ctx, px + 7, py - 8, 1, 1, K); ret(ctx, px + 11, py - 9, 1, 1, K);
      ret(ctx, px + 3, py - 12, 1, 5, C.branco);
    } });
  I.objeto('lab-pedras', { w: 1, h: 1, topo: 4, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 7, 14, 8, K); ret(ctx, px + 2, py + 8, 12, 6, C.madeira); ret(ctx, px + 2, py + 10, 12, 1, C.madeira3);
      elipse(ctx, px + 5, py + 6, 3, 2, C.pedra2); elipse(ctx, px + 10, py + 5, 3, 3, C.metal2); elipse(ctx, px + 8, py + 3, 2, 2, '#c8b0e0');
      ret(ctx, px + 9, py + 3, 1, 1, C.branco);
    } });
  I.objeto('lab-broto', { w: 1, h: 1, topo: 8, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 3, py + 6, 10, 9, K); ret(ctx, px + 4, py + 7, 8, 7, C.terracota); ret(ctx, px + 2, py + 5, 12, 3, K); ret(ctx, px + 3, py + 6, 10, 1, C.terracota2);
      ret(ctx, px + 7, py - 5, 2, 11, FOLHA2);
      elipse(ctx, px + 4, py - 3, 3, 2, K); elipse(ctx, px + 4, py - 3, 2, 1, FOLHA);
      elipse(ctx, px + 11, py - 5, 3, 2, K); elipse(ctx, px + 11, py - 5, 2, 1, FOLHA);
      elipse(ctx, px + 8, py + 4, 2, 1, '#f3e6c8');   // o feijão que brotou
    } });
  I.objeto('lab-pedra', { w: 1, h: 1, topo: 6, solido: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 8, py + 9, 7, 6, K); elipse(ctx, px + 8, py + 9, 6, 5, C.pedra2); elipse(ctx, px + 6, py + 7, 3, 2, C.pedra);
      ret(ctx, px + 10, py + 11, 2, 1, C.metal2); ret(ctx, px + 5, py + 6, 1, 1, C.branco);
    } });
  I.objeto('lab-agua', { w: 1, h: 1, topo: 14, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 2, py + 5, 12, 10, K); ret(ctx, px + 3, py + 6, 10, 8, C.metal);
      ret(ctx, px + 3, py - 11, 10, 17, K); ret(ctx, px + 4, py - 10, 8, 15, C.azul2); ret(ctx, px + 4, py - 6, 8, 11, C.azul);
      ret(ctx, px + 6, py - 13, 4, 3, K); ret(ctx, px + 5, py - 9, 1, 12, C.branco);
      ret(ctx, px + 12, py + 7, 3, 2, K); ret(ctx, px + 13, py + 8, 1, 1, C.vermelho);
    } });

  /* ================= SALA 2: Quem Ganha, Quem Perde ================= */
  I.objeto('lab-capim', { w: 2, h: 1, topo: 8, solido: true,
    desenhar: function (ctx, px, py) {
      for (var i = 0; i < 9; i++) {
        var x = px + 2 + i * 3, h = 8 + (i * 5) % 7;
        ret(ctx, x, py + 14 - h, 2, h, K); ret(ctx, x, py + 15 - h, 1, h - 1, i % 2 ? FOLHA : '#9fd65a');
      }
      ret(ctx, px + 1, py + 13, 30, 2, FOLHA2);
    } });
  I.objeto('lab-colmeia', { w: 1, h: 1, topo: 12, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 7, py - 2, 2, 17, C.madeira2);
      elipse(ctx, px + 8, py - 3, 6, 8, K); elipse(ctx, px + 8, py - 3, 5, 7, AMARELO);
      for (var y = -8; y <= 2; y += 3) ret(ctx, px + 3, py + y, 10, 1, C.ouro2);
      ret(ctx, px + 7, py + 1, 3, 2, K);
      bicho(ctx, px + 2, py - 7, ['.kk', 'kyk', '.kk'], { y: AMARELO }); bicho(ctx, px + 14, py - 1, ['kk.', 'kyk', 'kk.'], { y: AMARELO });
    } });
  I.objeto('lab-gafanhoto', { w: 1, h: 1, topo: 8, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 1, 14, 14, K); ret(ctx, px + 2, py + 2, 12, 12, VIDRO); ret(ctx, px + 2, py + 10, 12, 4, TERRA);
      ret(ctx, px + 2, py - 1, 12, 3, K); ret(ctx, px + 3, py, 10, 1, C.metal);
      ret(ctx, px + 4, py + 5, 1, 5, FOLHA2); elipse(ctx, px + 5, py + 6, 2, 1, FOLHA);
      bicho(ctx, px + 10, py + 9, ['....k', '.kggk', 'kgggg', '.k.k.'], { g: '#7ec850' });
      ret(ctx, px + 3, py + 2, 1, 6, C.branco);
    } });
  I.objeto('lab-onca', { w: 1, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      // a onça sentada, de frente, com as pintas
      bicho(ctx, px + 8, py + 14, [
        '.kk......kk.', 'kook....kook', 'kooookkooook', 'kowkooookwok', 'koooopoooook', '.kooakkaook.',
        '..kooooook..', '.kopoooopok.', 'koooopooooko', 'kopooooopook', 'koooopoooook', '.kkk.kk.kkk.',
      ], { o: '#f0a040', w: C.branco, p: TERRA2, a: '#ff9cc6' });
    } });
  I.objeto('lab-caixa', { w: 1, h: 1, topo: 4, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 3, 14, 12, K); ret(ctx, px + 2, py + 4, 12, 10, '#a8b86a'); ret(ctx, px + 2, py + 4, 12, 2, '#c8d890');
      ret(ctx, px + 6, py + 8, 4, 3, K); ret(ctx, px + 7, py + 9, 2, 1, C.ouro);
    } });
  I.objeto('lab-rio', { w: 3, h: 1, solido: false, plano: true, semSombra: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 24, py + 8, 23, 7, AREIA2); elipse(ctx, px + 24, py + 8, 21, 5, C.azul);
      ret(ctx, px + 10, py + 6, 6, 1, C.azul2); ret(ctx, px + 28, py + 9, 7, 1, C.azul2);
      elipse(ctx, px + 38, py + 7, 3, 1, FOLHA);
    } });
  I.objeto('lab-jacare', { w: 1, h: 1, topo: 2, solido: true,
    desenhar: function (ctx, px, py) {
      bicho(ctx, px + 8, py + 14, [
        '..........kk....', '.kkkkkkkkkwkk...', 'kggggggggggggkk.', 'kgdgdgdgdggggggk', '.kggggggggkkkkk.', '..k.k...k.k.....',
      ], { g: '#5a9a3a', d: '#3f7a2a', w: C.branco });
    } });
  I.objeto('lab-cachorro', { w: 1, h: 1, topo: 6, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 8, py + 13, 7, 2, '#ff9cc6');   // a caminha
      bicho(ctx, px + 8, py + 13, [
        'kk......kk..', 'kbk....kbbk.', 'kbbkkkkbbbk.', '.kbwbbwbbbk.', '.kbbkbbbbbbk', '..kbbbbbbbbk', '.kbbbbbbbbk.', '.kk.kk.kk.k.',
      ], { b: '#d9a06a', w: K });
      ret(ctx, px + 4, py + 6, 1, 1, K); ret(ctx, px + 10, py + 8, 1, 1, K); ret(ctx, px + 12, py + 5, 1, 1, K);   // as pulgas
    } });

  // para as outras partes (lab-objetos-2.js e lab-objetos-3.js)
  var S = R._predios.observatorio;
  S.lab = { LAB: LAB, LAB2: LAB2, AGUA: AGUA, AGUA2: AGUA2, AMARELO: AMARELO, FOLHA: FOLHA, FOLHA2: FOLHA2, TERRA: TERRA, TERRA2: TERRA2,
    AREIA: AREIA, AREIA2: AREIA2, VIDRO: VIDRO, VIDRO2: VIDRO2, v: v, bicho: bicho, frasco: frasco, tampo: tampo };
})();
