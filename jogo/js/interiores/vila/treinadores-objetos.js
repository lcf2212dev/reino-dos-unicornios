/* Vila Arco-Íris, Treinadores de Monstros (docs/contratos/monstros.md §2): os objetos do prédio (prefixo
   vila-treinadores-). Por fora, a fachada 6 × 5 no terreno da direita (porta desenhada embaixo, logo acima do tile da
   escada `portal`) com o letreiro da MonsterBall; por dentro, o letreiro de parede, a prateleira de MonsterBalls, a
   vitrine com três monstrinhos (os moldes das arenas, Reino.desenhosInimigo, lidos na hora de desenhar), o tapete de
   treino e a MonsterBall gigante. Usa Reino._predios.vila (V, de fundo.js e objetos.js). Animação só no `anim`. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, ret = D.ret, circulo = D.circulo, elipse = D.elipse;
  var K = R.Desenho.K;
  var V = R._predios.vila, caixa = V.caixa, ARCO = V.ARCO;
  var ROSA = '#ff5c9a', ROSA2 = '#c8336e', VERMELHO = '#e8384f', AMARELO = '#ffe066';

  // a MonsterBall (diâmetro d, canto x, y): metade de cima rosa, de baixo branca, faixa escura e o botão
  function bola(ctx, x, y, d) {
    var r = Math.floor(d / 2), cx = x + r, cy = y + r;
    circulo(ctx, cx, cy, r, K);
    circulo(ctx, cx, cy, r - 1, '#ffffff');
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, d + 1, r); ctx.clip();
    circulo(ctx, cx, cy, r - 1, ROSA);
    ret(ctx, cx - Math.floor(r / 2), cy - r + 2, Math.max(1, Math.floor(r / 3)), Math.max(1, Math.floor(r / 4)), '#ffb3d0');
    ctx.restore();
    ret(ctx, x + 1, cy - 1, d - 1, Math.max(2, Math.floor(d / 8)), K);
    var b = Math.max(1, Math.floor(r / 3));
    circulo(ctx, cx, cy, b + 1, K); circulo(ctx, cx, cy, b, '#fff6a8');
  }
  V.bolaMonstro = bola;

  /* ---------- por fora: a fachada (6 × 5; a porta no tile 2, sobre a fileira de baixo) ---------- */
  I.objeto('vila-treinadores-predio', { w: 6, h: 5, solido: true, alto: false, topo: 30, junto: true,
    desenhar: function (ctx, px, py) {
      var W = 96, i;
      ret(ctx, px + 2, py + 78, W - 4, 3, 'rgba(58,36,70,0.25)');                         // sombra no chão
      caixa(ctx, px + 4, py + 14, W - 8, 66, '#fff1f6');                                   // a parede
      for (i = 0; i < 6; i++) ret(ctx, px + 5, py + 22 + i * 10, W - 10, 1, '#ffd6e6');
      ret(ctx, px + 5, py + 72, W - 10, 7, '#ffc0d8'); ret(ctx, px + 5, py + 72, W - 10, 1, K);   // rodapé
      // telhado em escada: faixas rosa e vermelha, como a bola
      for (i = 0; i < 6; i++) ret(ctx, px + 12 - i * 2, py - 6 + i * 4, W - 24 + i * 4, 4, K);
      for (i = 0; i < 6; i++) ret(ctx, px + 13 - i * 2, py - 5 + i * 4, W - 26 + i * 4, 3, i % 2 ? ROSA2 : ROSA);
      ret(ctx, px + 2, py + 18, W - 4, 3, K);
      for (i = 0; i < 11; i++) { circulo(ctx, px + 6 + i * 8, py + 20, 4, K); circulo(ctx, px + 6 + i * 8, py + 20, 3, i % 2 ? '#ffffff' : VERMELHO); }
      // a MonsterBall grande em cima do telhado
      bola(ctx, px + 38, py - 22, 20);
      // janelas: uma com bolas na vitrine, outra com um monstrinho de pelúcia
      [6, 64].forEach(function (x, k) {
        caixa(ctx, px + x, py + 38, 24, 22, '#dff4ff'); ret(ctx, px + x + 1, py + 39, 22, 4, '#bfe6ff');
        ret(ctx, px + x + 11, py + 38, 2, 22, K); ret(ctx, px + x + 2, py + 41, 3, 3, '#ffffff');
        if (k === 0) { bola(ctx, px + x + 2, py + 47, 8); bola(ctx, px + x + 13, py + 49, 8); }
        else {   // pelúcia redondinha lilás de orelhas
          circulo(ctx, px + x + 12, py + 52, 6, K); circulo(ctx, px + x + 12, py + 52, 5, '#a66bff');
          ret(ctx, px + x + 7, py + 44, 3, 4, K); ret(ctx, px + x + 15, py + 44, 3, 4, K);
          ret(ctx, px + x + 9, py + 50, 2, 2, K); ret(ctx, px + x + 14, py + 50, 2, 2, K); ret(ctx, px + x + 11, py + 54, 3, 1, K);
        }
        caixa(ctx, px + x - 2, py + 60, 28, 5, '#9a6c46');
        for (var f = 0; f < 5; f++) { ret(ctx, px + x + f * 5, py + 57, 3, 3, K); ret(ctx, px + x + f * 5, py + 57, 2, 2, ARCO[f]); }
      });
      // a porta (centrada no tile 2 da pegada: x 32..48), com degrau e maçaneta
      ret(ctx, px + 30, py + 50, 20, 30, K); ret(ctx, px + 32, py + 46, 16, 4, K);
      ret(ctx, px + 31, py + 51, 18, 29, VERMELHO); ret(ctx, px + 33, py + 47, 14, 4, VERMELHO);
      ret(ctx, px + 39, py + 49, 2, 31, 'rgba(58,36,70,0.35)');
      bola(ctx, px + 35, py + 54, 10);
      ret(ctx, px + 44, py + 68, 2, 2, AMARELO);
      caixa(ctx, px + 26, py + 79, 28, 5, '#d4d4e0');
      // o letreiro: placa creme com a bola e as letras em tracinhos coloridos
      ret(ctx, px + 24, py + 22, 1, 4, K); ret(ctx, px + 71, py + 22, 1, 4, K);
      caixa(ctx, px + 18, py + 25, 60, 18, '#fff4d8'); ret(ctx, px + 19, py + 26, 58, 2, '#ffffff');
      bola(ctx, px + 22, py + 28, 12);
      for (i = 0; i < 7; i++) { ret(ctx, px + 38 + i * 5, py + 30, 4, 3, i % 2 ? ROSA2 : VERMELHO); ret(ctx, px + 38 + i * 5, py + 36, 4, 3, ARCO[(i + 2) % 6]); }
    },
    anim: function (ctx, px, py, t) {   // brilhinho piscando na bola do telhado
      if (Math.floor(t / 700) % 3 === 0) { ret(ctx, px + 42, py - 18, 1, 3, '#ffffff'); ret(ctx, px + 41, py - 17, 3, 1, '#ffffff'); }
    } });

  /* ---------- por dentro ---------- */
  // letreiro de parede (2 × 2) com a MonsterBall
  I.objeto('vila-treinadores-letreiro', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 8, py + 2, 1, 4, K); ret(ctx, px + 23, py + 2, 1, 4, K);
      caixa(ctx, px, py + 5, 32, 22, '#fff4d8'); ret(ctx, px + 1, py + 6, 30, 2, '#ffffff');
      ARCO.forEach(function (c, i) { ret(ctx, px + 2 + i * 5, py + 24, 5, 2, c); });
      bola(ctx, px + 9, py + 8, 14);
    } });
  // prateleira alta (2 × 1) cheia de MonsterBalls (interativa)
  I.objeto('vila-treinadores-prateleira', { w: 2, h: 1, solido: true, alto: true, topo: 30,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 16, py + 15, 14, 2, 'rgba(58,36,70,0.25)');
      caixa(ctx, px + 1, py - 28, 30, 43, '#9a6c46'); ret(ctx, px + 2, py - 27, 28, 41, '#7a5234');
      [-14, 0].forEach(function (y) { caixa(ctx, px + 1, py + y, 30, 3, '#c08a5a'); });
      bola(ctx, px + 3, py - 24, 9); bola(ctx, px + 12, py - 24, 9); bola(ctx, px + 21, py - 24, 9);
      bola(ctx, px + 7, py - 10, 9); bola(ctx, px + 17, py - 10, 9);
      caixa(ctx, px + 4, py + 4, 24, 8, '#c08a5a'); bola(ctx, px + 12, py + 4, 7);
    } });
  // vitrine de vidro (3 × 1) com três monstrinhos das arenas, um em cada nicho (interativa)
  var VITRINE = ['orvalho-facil', 'gelo-medio', 'lua-facil'];
  I.objeto('vila-treinadores-vitrine', { w: 3, h: 1, solido: true, alto: true, topo: 26,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 24, py + 15, 22, 2, 'rgba(58,36,70,0.25)');
      caixa(ctx, px + 1, py + 2, 46, 13, '#9a6c46'); ret(ctx, px + 2, py + 3, 44, 2, '#c08a5a');
      caixa(ctx, px + 1, py - 22, 46, 25, '#dff4ff'); ret(ctx, px + 2, py - 21, 44, 3, '#ffffff');
      ret(ctx, px + 16, py - 22, 1, 25, K); ret(ctx, px + 31, py - 22, 1, 25, K);
      VITRINE.forEach(function (chave, i) {
        var m = R.desenhosInimigo && R.desenhosInimigo[chave], x0 = px + 2 + i * 15;
        ctx.save(); ctx.beginPath(); ctx.rect(x0, py - 19, 14, 21); ctx.clip();
        if (m && m.linhas) R.Desenho.matriz(ctx, x0 + 7 - Math.floor(m.linhas[0].length / 2), py + 2 - m.linhas.length, m.linhas, m.paleta);
        else { circulo(ctx, x0 + 7, py - 5, 5, K); circulo(ctx, x0 + 7, py - 5, 4, ARCO[i * 2]); }
        ctx.restore();
      });
      ret(ctx, px + 4, py - 19, 2, 6, 'rgba(255,255,255,0.7)');
    } });
  // tapete de treino (3 × 2), não sólido: a arena redondinha com a bola no meio
  I.objeto('vila-treinadores-tapete', { w: 3, h: 2, solido: false, semSombra: true,
    desenhar: function (ctx, px, py) {
      caixa(ctx, px + 1, py + 1, 46, 30, '#6fdc8c'); ret(ctx, px + 2, py + 2, 44, 2, '#a8f0b8');
      ret(ctx, px + 2, py + 15, 44, 2, '#ffffff');
      circulo(ctx, px + 24, py + 16, 9, '#ffffff'); circulo(ctx, px + 24, py + 16, 7, '#6fdc8c');
      bola(ctx, px + 19, py + 11, 10);
    } });
  // a MonsterBall gigante num pedestal (1 × 1; interativa), com um brilho que pisca
  I.objeto('vila-treinadores-estatua', { w: 1, h: 1, solido: true, alto: true, topo: 22,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 8, py + 14, 7, 2, 'rgba(58,36,70,0.25)');
      caixa(ctx, px + 1, py + 6, 14, 9, '#d4d4e0'); ret(ctx, px + 2, py + 7, 12, 2, '#ffffff');
      bola(ctx, px, py - 10, 16);
    },
    anim: function (ctx, px, py, t) {
      if (Math.floor(t / 600) % 4 === 0) { ret(ctx, px + 4, py - 7, 1, 3, '#ffffff'); ret(ctx, px + 3, py - 6, 3, 1, '#ffffff'); }
    } });
})();
