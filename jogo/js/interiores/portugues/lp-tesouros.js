/* Casa das Palavras, 1º andar: a Galeria dos Tesouros (docs/contratos/quarto-bimestre.md §14.3). Um pedestal por sala
   da Língua Portuguesa do 4º bimestre; aceso, com o acessório lendário da trilha perfeita (ícone 'acessorio:<id>' do
   Reino.premioTrilha(sala)), quando ela ganhou (P.estado().trilhas[sala]); senão, apagado, com um "?".
   Divide em Reino._predios.portugues: tesouros(ox, oy) → os pedestais da galeria (canto do cômodo em ox, oy), uma
   fileira por capítulo; o layout é o portugues/lp-andar1.js. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, matriz = D.matriz;
  var K = R.Desenho.K;
  var S = (R._predios = R._predios || {}).portugues = R._predios.portugues || {};
  var MAT = 'portugues4';

  function salaDe(o) { return (o && o.var && o.var.sala) || ''; }
  function ganhou(P, sala) { var e = P && P.estado && P.estado(); return !!(e && e.trilhas && e.trilhas[sala]); }
  // o ícone do acessório da sala (null se o prêmio ainda não foi registrado ou fora do navegador)
  function icone(sala) {
    var p = R.premioTrilha && R.premioTrilha(sala), a = p && p.acessorio;
    return a && window.PA && PA.iconeDesenho ? PA.iconeDesenho('acessorio:' + a.id) : null;
  }

  /* ================= PEDESTAL DO TESOURO ================= */
  // var: { sala }. Coluna de mármore com a borda dourada; em cima, a almofada roxa com o tesouro aceso (brilho) ou
  // apagada, com um "?" cinza
  I.objeto('lp-pedestal-tesouro', { w: 1, h: 1, topo: 24, solido: true, alto: true,
    chave: function (P, o) { var s = salaDe(o); return (ganhou(P, s) ? 'sim' : 'nao') + (icone(s) ? ':ic' : ''); },
    desenhar: function (ctx, px, py, o, P) {
      var cx = px + 8, s = salaDe(o), tem = ganhou(P, s), ic = tem ? icone(s) : null;
      // base e coluna
      ret(ctx, cx - 6, py + 10, 13, 5, K); ret(ctx, cx - 5, py + 11, 11, 3, '#d8cfe6'); ret(ctx, cx - 5, py + 11, 11, 1, C.ouro);
      ret(ctx, cx - 4, py - 1, 9, 12, K); ret(ctx, cx - 3, py - 1, 7, 12, '#f4eefa');
      ret(ctx, cx - 1, py, 1, 10, '#d8cfe6'); ret(ctx, cx + 2, py, 1, 10, '#d8cfe6'); ret(ctx, cx - 3, py, 1, 10, C.branco);
      ret(ctx, cx - 6, py - 4, 13, 4, K); ret(ctx, cx - 5, py - 3, 11, 2, C.ouro); ret(ctx, cx - 5, py - 3, 11, 1, C.ouro3 || C.ouro);
      // a almofada
      ret(ctx, cx - 5, py - 6, 11, 3, K); ret(ctx, cx - 4, py - 5, 9, 1, tem ? '#8e4fd6' : '#a89cb8');
      if (tem) {
        // brilho atrás do tesouro
        circulo(ctx, cx, py - 14, 8, '#fff2b0');
        if (ic) ctx.drawImage(ic, cx - 8, py - 22);
        else matriz(ctx, cx - 3, py - 17, ['...y...', '..yYy..', '.yYYYy.', 'yYYwYYy', '.yYYYy.', '..yYy..', '...y...'],
          { y: C.ouro, Y: C.ouro2 || C.ouro, w: C.branco });   // sem o desenho ainda: uma estrela dourada
        ret(ctx, cx - 7, py - 20, 1, 1, C.branco); ret(ctx, cx + 7, py - 12, 1, 1, C.branco);
      } else {
        // apagado: a redoma vazia de vidro com um "?" no meio
        ret(ctx, cx - 5, py - 18, 11, 12, K); ret(ctx, cx - 4, py - 17, 9, 11, '#e4def0'); ret(ctx, cx - 4, py - 17, 1, 9, C.branco);
        matriz(ctx, cx - 2, py - 16, ['.kkk.', 'k...k', '....k', '..kk.', '..k..', '.....', '..k..'], { k: '#7a6f8a' });
      }
    } });

  // as fileiras de pedestais: Cap. 10 na fileira 4 (colunas pares, 9 vagas), 11 e 12 nas fileiras 6 e 8 (colunas
  // ímpares, 8 vagas); entre elas (fileiras 3, 5 e 7), passagem livre. Vaga sem sala: pedestal comum (enfeite)
  var FILEIRAS = { 10: { y: 4, x0: 0 }, 11: { y: 6, x0: 1 }, 12: { y: 8, x0: 1 } };
  S.tesouros = function (ox, oy) {
    var M = R.materia && R.materia(MAT), lista = [];
    if (!M) return lista;
    Object.keys(FILEIRAS).forEach(function (cap) {
      var f = FILEIRAS[cap], vagas = f.x0 ? 8 : 9;
      var ss = M.salas.filter(function (s) { return String(s.capitulo) === cap; });
      if (ss.length > vagas) throw new Error('portugues: o capítulo ' + cap + ' tem ' + ss.length + ' salas, mas a Galeria dos Tesouros só tem ' +
        vagas + ' pedestais nessa fileira (portugues/lp-tesouros.js, FILEIRAS)');
      for (var i = 0; i < vagas; i++) {
        var s = ss[i], o = { x: ox + f.x0 + i * 2, y: oy + f.y };
        lista.push(s ? Object.assign(o, { tipo: 'lp-pedestal-tesouro', nome: s.nome, var: { sala: s.id } })
          : Object.assign(o, { tipo: 'pedestal', var: { item: 'estrela' } }));
      }
    });
    return lista;
  };
})();
