/* Torre do Relógio (Inglês): peças baixas de casa e de escola (prefixo torre-) no lugar do "kit de enchimento"
   (balde, barril, cesto, vaso grande, banco, almofada e tapete redondo): tapete de palavras, blocos ABC, mochila,
   caixa de brinquedos, bandeja de peças do relojoeiro e as peças do banheiro (banheira, porta-escovas, patinho, sabonetes). Carrega depois de torre/objetos.js e antes de torre/torre.js. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, contornoRet = D.contornoRet;
  var clarear = D.clarear, escurecer = D.escurecer;
  var K = R.Desenho.K;
  function v(o, k, padrao) { return (o && o.var && o.var[k] !== undefined) ? o.var[k] : padrao; }
  var AMAR = '#e0a020', AZUL = '#2f6fd6', VERM = '#e0433f', VERDE = '#39a860';
  // letras 3×5 das palavras em inglês (só as que os objetos usam)
  var LETRAS = {
    A: ['.#.', '#.#', '###', '#.#', '#.#'], B: ['##.', '#.#', '##.', '#.#', '##.'], C: ['.##', '#..', '#..', '#..', '.##'],
    H: ['#.#', '#.#', '###', '#.#', '#.#'], I: ['###', '.#.', '.#.', '.#.', '###'], S: ['.##', '#..', '.#.', '..#', '##.'],
    U: ['#.#', '#.#', '#.#', '#.#', '###'], N: ['##.', '#.#', '#.#', '#.#', '#.#'], O: ['###', '#.#', '#.#', '#.#', '###'],
    T: ['###', '.#.', '.#.', '.#.', '.#.'], K: ['#.#', '#.#', '##.', '#.#', '#.#'], E: ['###', '#..', '##.', '#..', '###'],
    Y: ['#.#', '#.#', '.#.', '.#.', '.#.'], G: ['.##', '#..', '#.#', '#.#', '.##'],
    D: ['##.', '#.#', '#.#', '#.#', '##.'], M: ['#.#', '###', '###', '#.#', '#.#'],
  };
  function letra(ctx, x, y, l, cor) { if (LETRAS[l]) D.matriz(ctx, x, y, LETRAS[l], { '#': cor }); }

  // tapete com uma palavra em inglês (w×h em tiles; var.palavra, até 4 letras por tile de largura; var.cor)
  I.objeto('torre-tapete-palavras', { w: 1, h: 1, solido: false, semSombra: true, plano: true,
    desenhar: function (ctx, px, py, o) {
      var W = (o.w || 1) * 16, H = (o.h || 1) * 16, c = v(o, 'cor', '#9fcfff');
      var p = String(v(o, 'palavra', 'HI')).slice(0, Math.max(2, (o.w || 1) * 3));
      ret(ctx, px + 1, py + 2, W - 2, H - 3, K); ret(ctx, px + 2, py + 3, W - 4, H - 5, c);
      ret(ctx, px + 3, py + 4, W - 6, 1, clarear(c, 0.45));
      for (var x = px + 3; x < px + W - 3; x += 3) { ret(ctx, x, py + H - 4, 1, 1, escurecer(c, 0.3)); }
      var larg = p.length * 4 - 1, x0 = Math.round(px + (W - larg) / 2), y0 = Math.round(py + (H - 5) / 2);
      p.split('').forEach(function (l, i) { letra(ctx, x0 + i * 4, y0, l, escurecer(c, 0.55)); });
    } });
  // pilha de blocos de letras A, B e C
  I.objeto('torre-blocos-abc', { w: 1, h: 1, topo: 6, solido: true,
    desenhar: function (ctx, px, py) {
      [[1, 5, 'A', VERM], [8, 5, 'B', AZUL], [4, -3, 'C', VERDE]].forEach(function (b) {
        var x = px + b[0], y = py + b[1];
        ret(ctx, x, y, 7, 8, K); ret(ctx, x + 1, y + 1, 5, 6, b[3]); ret(ctx, x + 1, y + 1, 5, 1, clarear(b[3], 0.5));
        letra(ctx, x + 2, y + 2, b[2], C.branco);
      });
    } });
  // mochila da escola encostada no chão
  I.objeto('torre-mochila', { w: 1, h: 1, topo: 6, solido: true,
    desenhar: function (ctx, px, py, o) {
      var c = v(o, 'cor', AMAR);
      ret(ctx, px + 5, py - 6, 6, 3, K); ret(ctx, px + 6, py - 5, 4, 1, escurecer(c, 0.3));   // alça de cima
      ret(ctx, px + 2, py - 3, 12, 17, K); ret(ctx, px + 3, py - 2, 10, 15, c);
      ret(ctx, px + 3, py - 2, 10, 1, clarear(c, 0.45)); ret(ctx, px + 3, py - 1, 1, 12, clarear(c, 0.25));
      ret(ctx, px + 4, py + 5, 8, 7, K); ret(ctx, px + 5, py + 6, 6, 5, escurecer(c, 0.15));   // bolso
      ret(ctx, px + 7, py + 7, 2, 1, C.metal);
      ret(ctx, px + 2, py + 1, 12, 1, escurecer(c, 0.3));
    } });
  // caixa de brinquedos aberta: bola e ursinho aparecendo (w em tiles, padrão 2)
  I.objeto('torre-caixa-brinquedos', { w: 2, h: 1, topo: 6, solido: true,
    desenhar: function (ctx, px, py, o) {
      var W = (o.w || 2) * 16, c = v(o, 'cor', '#5fb4ff');
      circulo(ctx, px + 9, py - 1, 4, K); circulo(ctx, px + 9, py - 1, 3, VERM); ret(ctx, px + 7, py - 3, 2, 1, C.branco);
      circulo(ctx, px + 21, py - 2, 4, K); circulo(ctx, px + 21, py - 2, 3, C.madeira);           // ursinho
      circulo(ctx, px + 18, py - 6, 1, K); circulo(ctx, px + 24, py - 6, 1, K);
      ret(ctx, px + 20, py - 2, 1, 1, K); ret(ctx, px + 22, py - 2, 1, 1, K);
      ret(ctx, px + 1, py + 1, W - 2, 14, K); ret(ctx, px + 2, py + 2, W - 4, 12, c);
      ret(ctx, px + 2, py + 2, W - 4, 1, clarear(c, 0.5)); ret(ctx, px + 2, py + 8, W - 4, 1, escurecer(c, 0.25));
      letra(ctx, px + 6, py + 5, 'A', C.branco); letra(ctx, px + 14, py + 5, 'B', C.branco); letra(ctx, px + 22, py + 5, 'C', C.branco);
    } });
  // bandeja do relojoeiro com engrenagens, molas e parafusos
  I.objeto('torre-caixa-pecas', { w: 1, h: 1, topo: 3, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 5, 14, 9, K); ret(ctx, px + 2, py + 6, 12, 7, C.madeira2); ret(ctx, px + 2, py + 6, 12, 1, C.madeira);
      ret(ctx, px + 2, py + 9, 12, 1, K);
      circulo(ctx, px + 5, py + 4, 3, K); circulo(ctx, px + 5, py + 4, 2, C.ouro2); ret(ctx, px + 5, py + 4, 1, 1, K);
      circulo(ctx, px + 11, py + 5, 2, K); circulo(ctx, px + 11, py + 5, 1, C.metal);
      ret(ctx, px + 4, py + 10, 3, 2, C.metal); ret(ctx, px + 9, py + 11, 1, 1, C.ouro); ret(ctx, px + 11, py + 11, 1, 1, C.ouro);
      ret(ctx, px + 8, py + 1, 1, 1, C.ouro3);
    } });

  /* ---------- banheiro (andar 3) ---------- */
  // banheira de louça com espuma e o patinho (w em tiles, padrão 2)
  I.objeto('torre-banheira', { w: 2, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var W = (o.w || 2) * 16;
      ret(ctx, px + 3, py + 12, 3, 3, K); ret(ctx, px + W - 6, py + 12, 3, 3, K);   // pés
      ret(ctx, px + 1, py - 4, W - 2, 17, K); ret(ctx, px + 2, py - 3, W - 4, 15, C.branco);
      ret(ctx, px + 2, py + 5, W - 4, 1, '#cfe6f2'); ret(ctx, px + 3, py - 2, W - 6, 1, '#e6f6ff');
      ret(ctx, px + 3, py - 3, W - 6, 3, '#7ed9c8');                                     // água
      [[5, -6], [9, -7], [14, -6], [20, -7], [25, -6]].forEach(function (b) { circulo(ctx, px + b[0], py + b[1], 2, C.branco); });
      ret(ctx, px + W - 6, py - 9, 2, 6, K); ret(ctx, px + W - 9, py - 10, 5, 2, K); ret(ctx, px + W - 8, py - 10, 3, 1, C.metal);   // torneira
      ret(ctx, px + 8, py - 9, 5, 4, K); ret(ctx, px + 9, py - 8, 3, 2, C.ouro); ret(ctx, px + 12, py - 7, 2, 1, C.laranja);        // patinho
    } });
  // copo com as escovas de dente
  I.objeto('torre-porta-escovas', { w: 1, h: 1, topo: 6, solido: true,
    desenhar: function (ctx, px, py) {
      mesinhaBaixa(ctx, px, py);
      [[5, VERM], [8, AZUL], [11, VERDE]].forEach(function (e) { ret(ctx, px + e[0], py - 6, 2, 9, K); ret(ctx, px + e[0], py - 5, 1, 3, e[1]); ret(ctx, px + e[0], py - 2, 1, 4, C.branco); });
      ret(ctx, px + 4, py + 1, 9, 7, K); ret(ctx, px + 5, py + 2, 7, 5, C.agua); ret(ctx, px + 5, py + 2, 7, 1, C.agua2);
    } });
  // patinho de borracha numa bacia
  I.objeto('torre-patinho', { w: 1, h: 1, topo: 4, solido: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 8, py + 10, 7, 4, K); elipse(ctx, px + 8, py + 10, 6, 3, '#9fdcff'); ret(ctx, px + 3, py + 8, 10, 1, C.agua2);
      ret(ctx, px + 5, py + 3, 7, 6, K); ret(ctx, px + 6, py + 4, 5, 4, C.ouro); ret(ctx, px + 6, py + 4, 5, 1, C.ouro3);
      ret(ctx, px + 8, py, 5, 5, K); ret(ctx, px + 9, py + 1, 3, 3, C.ouro); ret(ctx, px + 12, py + 2, 2, 1, C.laranja);
      ret(ctx, px + 10, py + 1, 1, 1, K);
    } });
  // frascos de xampu e sabonetes empilhados
  I.objeto('torre-sabonetes', { w: 1, h: 1, topo: 8, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 2, py - 5, 5, 16, K); ret(ctx, px + 3, py - 4, 3, 14, C.rosa); ret(ctx, px + 3, py - 4, 1, 12, C.rosa2); ret(ctx, px + 3, py - 7, 3, 2, K);
      ret(ctx, px + 8, py - 1, 6, 12, K); ret(ctx, px + 9, py, 4, 10, C.agua); ret(ctx, px + 9, py, 4, 1, C.agua2); ret(ctx, px + 10, py - 3, 2, 2, K);
      ret(ctx, px + 1, py + 11, 14, 4, K); ret(ctx, px + 2, py + 12, 5, 2, C.lilas); ret(ctx, px + 8, py + 12, 6, 2, '#ffe066');
    } });
  function mesinhaBaixa(ctx, px, py) { ret(ctx, px + 2, py + 8, 12, 7, K); ret(ctx, px + 3, py + 9, 10, 5, C.madeira); ret(ctx, px + 3, py + 9, 10, 1, C.madeiraClara); }
})();
