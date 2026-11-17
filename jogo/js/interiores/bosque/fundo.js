/* Bosque dos Fantasmas, o chão e o céu aberto: o piso 'bosque-grama' (grama, tufos e as trilhas de terra), a parede
   'bosque-copas' (as copas das árvores lá no fundo) e o fundo I.FUNDOS.bosque (mata em volta do cômodo, com
   `saida(ctx, px, py)`: o portal de volta, no lugar do capacho; docs/contratos/bosque.md).
   As trilhas ficam em Reino._predios.bosque (B.trilha), para o layout de bosque.js não pôr árvore em cima delas.
   No carregamento só registra funções: nada de DOM nem canvas aqui fora. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, ret = D.ret, circulo = D.circulo, elipse = D.elipse;
  var K = R.Desenho.K, sorte = R.Desenho.sorte;
  var B = (R._predios = R._predios || {}).bosque = R._predios.bosque || {};

  /* ---------- trilhas de terra (por semente: sempre as mesmas) ---------- */
  // pontos por onde passam (x, y em tiles); a principal sobe do portal de volta até o fundo do bosque
  var CAMINHOS = [
    [[28, 40], [28, 34], [24, 30], [25, 25], [31, 21], [30, 16], [25, 12], [27, 7], [28, 3]],   // a principal
    [[28, 33], [36, 31], [46, 33]], [[25, 30], [15, 32], [7, 30]],                                // fáceis, de lado
    [[31, 21], [44, 20]], [[25, 25], [12, 22]],                                                   // médias
    [[27, 12], [14, 9]], [[30, 16], [42, 10]],                                                    // difíceis
  ];
  var _trilha = null;
  function montarTrilha() {
    var rng = R.Desenho.rng(5011), t = {};
    CAMINHOS.forEach(function (c) {
      for (var s = 0; s < c.length - 1; s++) {
        var a = c[s], b = c[s + 1], n = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])) * 2, fase = rng() * 6;
        for (var i = 0; i <= n; i++) {
          var f = i / n, x = Math.round(a[0] + (b[0] - a[0]) * f), y = Math.round(a[1] + (b[1] - a[1]) * f);
          if (Math.abs(b[0] - a[0]) < Math.abs(b[1] - a[1])) x += Math.round(Math.sin(f * 3.1 + fase) * 1.2);   // balança de leve
          else y += Math.round(Math.sin(f * 3.1 + fase) * 1.2);
          t[y * 100 + x] = 1; t[y * 100 + x + 1] = 1; t[(y + 1) * 100 + x] = 1; t[(y + 1) * 100 + x + 1] = 1;
        }
      }
    });
    return t;
  }
  B.trilha = function (tx, ty) { if (!_trilha) _trilha = montarTrilha(); return !!_trilha[ty * 100 + tx]; };

  /* ---------- copas: folhagem em bolas, na grade global (as emendas dos tiles não aparecem) ---------- */
  var VERDES = ['#2f6b34', '#3b8240', '#4a9a4c'];
  function copas(ctx, x, y, w, h) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ret(ctx, x, y, w, h, VERDES[0]);
    var c0 = Math.floor((x - 8) / 12), c1 = Math.floor((x + w + 8) / 12), r0 = Math.floor((y - 8) / 12), r1 = Math.floor((y + h + 8) / 12);
    for (var cr = r0; cr <= r1; cr++) for (var cc = c0; cc <= c1; cc++) {
      var bx = cc * 12 + 6 + Math.round((sorte(cc, cr, 1) - 0.5) * 8) + (cr & 1) * 6, by = cr * 12 + 6 + Math.round((sorte(cc, cr, 2) - 0.5) * 6);
      circulo(ctx, bx, by, 8, VERDES[0]); circulo(ctx, bx - 1, by - 1, 6, VERDES[1]); circulo(ctx, bx - 2, by - 2, 3, VERDES[2]);
      if (sorte(cc, cr, 3) < 0.16) ret(ctx, bx + 2, by + 1, 1, 1, '#fff3a0');   // lucinha de fada entre as folhas
    }
    ctx.restore();
  }
  B.copas = copas;

  /* ---------- o piso: grama com tufos, flores miúdas e trilha de terra ---------- */
  I.PISOS['bosque-grama'] = { cores: { piso: '#8fcf5e', piso2: '#80c150', detalhe: '#5fa63f', luz: '#b6e57e' },
    desenhar: function (ctx, px, py, tx, ty, p) {
      ret(ctx, px, py, 16, 16, p.piso);
      var i;
      if (B.trilha(tx, ty)) {
        var cima = B.trilha(tx, ty - 1), baixo = B.trilha(tx, ty + 1), esq = B.trilha(tx - 1, ty), dir = B.trilha(tx + 1, ty);
        ret(ctx, px, py, 16, 16, '#dcc896');
        ret(ctx, px + 2, py + 3, 5, 3, '#e8d9ac'); ret(ctx, px + 8, py + 9, 6, 3, '#d0ba82');
        for (i = 0; i < 3; i++) ret(ctx, px + Math.floor(sorte(tx, ty, 30 + i) * 14), py + Math.floor(sorte(tx, ty, 40 + i) * 14), 2, 1, '#b9a26c');
        if (!cima) { ret(ctx, px, py, 16, 2, p.piso2); ret(ctx, px + 3, py + 2, 4, 1, p.piso2); ret(ctx, px + 10, py + 2, 3, 1, '#c4ad78'); }
        if (!baixo) { ret(ctx, px, py + 14, 16, 2, p.piso2); ret(ctx, px + 4, py + 13, 5, 1, '#c4ad78'); }
        if (!esq) { ret(ctx, px, py, 2, 16, p.piso2); ret(ctx, px + 2, py + 5, 1, 4, '#c4ad78'); }
        if (!dir) { ret(ctx, px + 14, py, 2, 16, p.piso2); ret(ctx, px + 13, py + 7, 1, 4, '#c4ad78'); }
        return;
      }
      // manchas mais escuras e mais claras, sem xadrez
      if (sorte(tx, ty, 1) < 0.5) ret(ctx, px + Math.floor(sorte(tx, ty, 2) * 8), py + 2, 8, 5, p.piso2);
      if (sorte(tx, ty, 3) < 0.4) ret(ctx, px + 1, py + 8 + Math.floor(sorte(tx, ty, 4) * 4), 9, 4, p.piso2);
      if (sorte(tx, ty, 5) < 0.3) ret(ctx, px + 6 + Math.floor(sorte(tx, ty, 6) * 6), py + 5, 4, 3, p.luz);
      // tufos de capim: lâminas de 3 px
      for (i = 0; i < 4; i++) {
        var gx = px + 1 + Math.floor(sorte(tx, ty, 10 + i) * 13), gy = py + 3 + Math.floor(sorte(tx, ty, 20 + i) * 11);
        ret(ctx, gx, gy - 2, 1, 3, p.detalhe); ret(ctx, gx + 1, gy - 3, 1, 3, p.detalhe); ret(ctx, gx + 2, gy - 1, 1, 2, p.detalhe);
      }
      // florzinha miúda, de vez em quando
      if (sorte(tx, ty, 50) < 0.1) {
        var fx = px + 2 + Math.floor(sorte(tx, ty, 51) * 11), fy = py + 2 + Math.floor(sorte(tx, ty, 52) * 11);
        ret(ctx, fx, fy, 2, 2, sorte(tx, ty, 53) < 0.5 ? '#ffffff' : '#ffe27a'); ret(ctx, fx, fy, 1, 1, '#ffb0d8');
      }
    } };

  /* ---------- a parede: as copas lá no fundo, com troncos na base e lucinhas ---------- */
  I.PAREDES['bosque-copas'] = { cores: { parede: '#2f6b34', parede2: '#3b8240', rodape: '#244f2a', detalhe: '#4a9a4c' },
    desenhar: function (ctx, px, py, tx) {
      copas(ctx, px, py, 16, 32);
      // troncos escuros aparecendo entre as copas, e a sombra na base (onde a grama começa)
      var t = Math.floor(sorte(tx, 0, 60) * 10);
      ret(ctx, px + t, py + 22, 3, 8, '#5a3a24'); ret(ctx, px + t, py + 22, 1, 8, '#7a5234');
      ret(ctx, px, py + 29, 16, 3, '#244f2a');
    } };

  /* ---------- pedrinha redonda: (x, y) = canto de cima, w × h (h ≥ 3); contorno sem as quinas, luz em cima e sombra embaixo ---------- */
  B.pedra = function (ctx, x, y, w, h, cores) {
    ret(ctx, x + 1, y, w - 2, h, K); ret(ctx, x, y + 1, w, h - 2, K);
    ret(ctx, x + 1, y + 1, w - 2, h - 2, cores[1]);
    ret(ctx, x + 1, y + 1, w - 3, 1, cores[2]); ret(ctx, x + 1, y + 2, 1, 1, cores[2]);                     // luz: em cima, à esquerda
    ret(ctx, x + 2, y + h - 2, w - 3, 1, cores[0]); ret(ctx, x + w - 2, y + h - 3, 1, 1, cores[0]);       // sombra: embaixo, à direita
  };

  /* ---------- o céu aberto: mata em volta; a saída é o portal de volta ---------- */
  var PEDRA = ['#8a8a9c', '#b0b0c2', '#d4d4e0'];
  I.FUNDOS.bosque = { cor: VERDES[0],
    desenhar: function (ctx, w, h) { copas(ctx, 0, 0, w, h); },
    // o portal de volta: o redemoinho de todo portal (Reino.Portal.vortice; arte/portal.js), espiral azul
    saida: function (ctx, px, py) { R.Portal.vortice(ctx, px + 8, py + 9, R.Portal.AZUL, 0); }, };
})();
