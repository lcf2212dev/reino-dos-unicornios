/* Laboratório de Ciências (3º andar do Observatório), parte 3 de 3: os objetos da sala 5 (Detetives da
   Natureza). Prefixo lab-; cores e ajudantes em S.lab (lab-objetos-1.js e lab-objetos-2.js). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo;
  var K = R.Desenho.K;
  var L = R._predios.observatorio.lab;
  var bicho = L.bicho, FOLHA = L.FOLHA, FOLHA2 = L.FOLHA2, AREIA = L.AREIA, AREIA2 = L.AREIA2, TERRA2 = L.TERRA2;
  var AMARELO = L.AMARELO, GELO = L.GELO, GELO2 = L.GELO2;

  // pegadas de detetive no chão (var.bicho: 'gato' = patinhas, senão pés de pinguim)
  I.objeto('lab-pegadas', { w: 1, h: 1, solido: false, plano: true, semSombra: true,
    desenhar: function (ctx, px, py, o) {
      var gato = L.v(o, 'bicho', 'gato') === 'gato';
      for (var i = 0; i < 3; i++) {
        var x = px + 3 + i * 5, y = py + 12 - i * 4;
        if (gato) { elipse(ctx, x, y, 2, 1, TERRA2); ret(ctx, x - 2, y - 3, 1, 1, TERRA2); ret(ctx, x, y - 3, 1, 1, TERRA2); ret(ctx, x + 2, y - 3, 1, 1, TERRA2); }
        else { triangulo(ctx, x - 2, y - 3, 5, 4, '#6b8aa8'); }
      }
    } });
  // mesa grande do detetive: lupa, fotos das pistas, mapa e caderninho
  I.objeto('lab-mesa-detetive', { w: 3, h: 3, topo: 8, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 24, py + 42, 22, 4, 'rgba(0,0,0,0.12)');
      ret(ctx, px + 4, py + 20, 3, 24, K); ret(ctx, px + 41, py + 20, 3, 24, K); ret(ctx, px + 5, py + 20, 1, 23, C.madeira2); ret(ctx, px + 42, py + 20, 1, 23, C.madeira2);
      ret(ctx, px + 1, py - 2, 46, 24, K); ret(ctx, px + 2, py - 1, 44, 21, C.madeira); ret(ctx, px + 2, py - 1, 44, 2, C.madeiraClara);
      ret(ctx, px + 2, py + 19, 44, 2, C.madeira3);
      // mapa do mundo
      ret(ctx, px + 5, py + 2, 18, 12, K); ret(ctx, px + 6, py + 3, 16, 10, '#9fd6f0');
      ret(ctx, px + 8, py + 5, 4, 5, FOLHA); ret(ctx, px + 15, py + 4, 5, 3, FOLHA); ret(ctx, px + 6, py + 3, 16, 1, C.branco);
      circulo(ctx, px + 10, py + 7, 1, C.vermelho); circulo(ctx, px + 18, py + 5, 1, C.vermelho);
      // fotos das pistas
      ret(ctx, px + 26, py + 2, 8, 8, K); ret(ctx, px + 27, py + 3, 6, 6, GELO); ret(ctx, px + 29, py + 5, 2, 3, K);
      ret(ctx, px + 36, py + 4, 8, 8, K); ret(ctx, px + 37, py + 5, 6, 6, AREIA); ret(ctx, px + 38, py + 6, 1, 2, '#d9a86a'); ret(ctx, px + 41, py + 6, 1, 2, '#d9a86a');
      // a lupa
      circulo(ctx, px + 30, py + 15, 4, K); circulo(ctx, px + 30, py + 15, 3, '#d9f3ff'); ret(ctx, px + 29, py + 14, 1, 1, C.branco);
      ret(ctx, px + 33, py + 17, 2, 2, K); ret(ctx, px + 35, py + 18, 4, 2, C.madeiraEscura);
      // caderninho
      ret(ctx, px + 8, py + 15, 9, 4, K); ret(ctx, px + 9, py + 16, 7, 2, C.creme); ret(ctx, px + 10, py + 16, 4, 1, C.azul);
    } });
  I.objeto('lab-preguica', { w: 1, h: 1, topo: 28, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 6, py - 12, 5, 27, K); ret(ctx, px + 7, py - 11, 3, 26, C.madeira2);
      elipse(ctx, px + 8, py - 20, 8, 7, K); elipse(ctx, px + 8, py - 20, 7, 6, FOLHA); elipse(ctx, px + 5, py - 22, 3, 2, '#9fd65a');
      ret(ctx, px + 1, py - 8, 14, 2, K); ret(ctx, px + 2, py - 8, 12, 1, C.madeira2);   // o galho
      // o bicho-preguiça pendurado de cabeça para baixo, sorrindo
      bicho(ctx, px + 8, py + 2, [
        'k.k..k.k', 'kbk..kbk', '.kbbbbk.', 'kbbbbbbk', 'kbbbbbbk', 'kbfffbbk', 'kfkffkfk', '.kffffk.', '..kkkk..',
      ], { b: '#a08a6a', f: '#f0e0c0' });
    } });
  I.objeto('lab-pinguim', { w: 1, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 8, py + 13, 7, 2, GELO2);
      bicho(ctx, px + 8, py + 14, [
        '..kkkk..', '.kppppk.', '.kpwwpk.', '.kwkwkw.', '.kwwoow.', 'kpwwwwpk', 'kpwwwwpk', 'kpwwwwpk', 'kpwwwwpk', '.kwwwwk.', '.kwwwwk.', '.oo..oo.',
      ].map(function (l) { return l.replace('.kwkwkw.', '.kpkwkpk'); }), { p: '#2f3a5a', w: C.branco, o: C.laranja });
    } });
  I.objeto('lab-tartaruga', { w: 1, h: 1, topo: 2, solido: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 8, py + 12, 7, 3, AREIA2);
      bicho(ctx, px + 8, py + 14, [
        '.k........k.', 'kgk.kkkk.kgk', '.kkcsccsckk.', '..kcsccsckgk', '.kgcccccckkw', 'kgkkkkkkkgk.', '.k........k.',
      ], { g: '#6fb88a', c: '#7a9a4a', s: '#a8c070', w: K });
      elipse(ctx, px + 3, py + 13, 1, 1, C.creme); elipse(ctx, px + 5, py + 14, 1, 1, C.creme);   // os ovinhos na areia
    } });
  I.objeto('lab-feneco', { w: 1, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 8, py + 13, 7, 2, AREIA2);
      bicho(ctx, px + 8, py + 14, [
        'kk......kk', 'kak....kak', 'kaak..kaak', 'kaaakkaaak', '.kffffffk.', '.kfkffkfk.', '..kffkfk..', '...kffk...', '..kffffk..', '.kffffffk.', '.kffffffkk', '..kk..kkfk',
      ], { a: '#ffc2a0', f: '#f0d090' });
    } });
  I.objeto('lab-lagarto', { w: 1, h: 1, topo: 6, solido: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 8, py + 13, 7, 2, AREIA2);
      // a gola aberta (em leque) em volta da cabeça
      bicho(ctx, px + 8, py + 14, [
        '.koook......', 'koyyyok.....', 'koykgyok....', 'koyggyokkk..', '.koyyokgggk.', '..kkkkggggkk', '....k.k.k.k.',
      ], { o: C.laranja, y: AMARELO, g: '#a0a060' });
      ret(ctx, px + 6, py + 10, 1, 1, K);
    } });
  I.objeto('lab-lobo', { w: 1, h: 1, topo: 8, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 8, py + 13, 7, 2, GELO2);
      bicho(ctx, px + 8, py + 14, [
        'k.k.........', 'kwkk........', 'kwwwk.......', 'kwkwwk...kk.', '.kwwwkkkkwk.', '..kwwwwwwwk.', '..kwwwwwwwk.', '..kwk..kwk..', '..kwk..kwk..', '..kk...kk...',
      ], { w: '#f4f8ff' });
      ret(ctx, px + 4, py + 6, 1, 1, K);
    } });
  I.objeto('lab-neve', { w: 1, h: 1, solido: false, plano: true, semSombra: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 8, py + 9, 7, 5, GELO); ret(ctx, px + 4, py + 7, 3, 1, C.branco); ret(ctx, px + 10, py + 10, 2, 1, GELO2);
    } });
})();
