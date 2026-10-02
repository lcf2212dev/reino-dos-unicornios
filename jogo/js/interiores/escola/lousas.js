/* Escola do Reino: a lousa própria de cada sala de prova (D2A-09) e o que ela diz.
   Carregado depois de escola/objetos.js e antes de escola/escola.js (que põe a lousa na parede). */
Reino.falasDoPredio('escola', {
  objetos: {
    'lousa-ingles': [Reino.Bimestres.aviso],
    'lousa-matematica': [Reino.Bimestres.aviso],
    'lousa-geografia': [Reino.Bimestres.aviso],
    'lousa-ciencias': [Reino.Bimestres.aviso],
    'lousa-portugues': [Reino.Bimestres.aviso],
    'lousa-historia': [Reino.Bimestres.aviso],
  },
});
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, matriz = D.matriz;
  var K = R.Desenho.K;
  var S = R._predios.escola;
  // letras e algarismos 3×5 do giz (só os que as lousas usam)
  var GIZ = {
    H: ['x.x', 'x.x', 'xxx', 'x.x', 'x.x'], E: ['xxx', 'x..', 'xx.', 'x..', 'xxx'], L: ['x..', 'x..', 'x..', 'x..', 'xxx'],
    O: ['.x.', 'x.x', 'x.x', 'x.x', '.x.'], N: ['x.x', 'xxx', 'xxx', 'x.x', 'x.x'], B: ['xx.', 'x.x', 'xx.', 'x.x', 'xx.'],
    A: ['.x.', 'x.x', 'xxx', 'x.x', 'x.x'], I: ['xxx', '.x.', '.x.', '.x.', 'xxx'],
    3: ['xx.', '..x', '.x.', '..x', 'xx.'], 4: ['x.x', 'x.x', 'xxx', '..x', '..x'], 7: ['xxx', '..x', '.x.', '.x.', '.x.'],
    '+': ['...', '.x.', 'xxx', '.x.', '...'], '=': ['...', 'xxx', '...', 'xxx', '...'], '-': ['...', '...', 'xxx', '...', '...'],
  };
  function giz(ctx, texto, x, y, cor) {
    for (var i = 0; i < texto.length; i++) if (GIZ[texto[i]]) matriz(ctx, x + i * 4, y, GIZ[texto[i]], { x: cor });
  }
  // desenho da lousa de cada matéria (as outras salas ficam com a lousa do ABC)
  var DESENHO = { ingles: 'hello', matematica: 'conta', geografia: 'mapa', ciencias: 'planta', portugues: 'silabas', historia: 'tempo' };
  var ROSA = '#ffd0d6';

  // lousa larga (3 tiles) com moldura de madeira; var.desenho escolhe o que está escrito
  I.objeto('escola-lousa', { w: 3, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var d = (o.var && o.var.desenho) || 'conta', azul = d === 'hello';
      var x = px + 4, y = py + 9;        // quadro: 40×14
      ret(ctx, px + 1, py + 6, 46, 21, K); ret(ctx, px + 2, py + 7, 44, 19, C.madeira);
      ret(ctx, x, y, 40, 14, azul ? '#2f4f7a' : '#2e6b45'); ret(ctx, x, y, 40, 1, azul ? '#4a6c9c' : '#3f8a5a');
      if (d === 'hello') {
        giz(ctx, 'HELLO', x + 10, y + 2, C.branco);
        ret(ctx, x + 9, y + 9, 21, 1, ROSA);
        matriz(ctx, x + 18, y + 10, ['x.x', '.x.'], { x: C.ouro3 });          // sorrisinho
      } else if (d === 'conta') {
        giz(ctx, '3+4=7', x + 10, y + 2, C.branco);
        for (var i = 0; i < 7; i++) ret(ctx, x + 9 + i * 3, y + 10, 2, 2, i < 3 ? ROSA : C.ouro3);   // bolinhas para contar
      } else if (d === 'mapa') {       // mar, duas terras, rio e a rosa dos ventos com o N
        ret(ctx, x + 1, y + 1, 38, 12, '#6fb8d8');
        matriz(ctx, x + 3, y + 2, ['.gggg.....', 'gggggg....', 'gggkggg...', '.gggggg...', '..gggg....', '...gg.....'], { g: '#7cc86a', k: '#4f9a4a' });
        matriz(ctx, x + 16, y + 6, ['..gggg', '.ggggg', 'gggggg', '.gggg.'], { g: '#e8c86a' });
        ret(ctx, x + 6, y + 4, 1, 4, '#3a7ab8');
        giz(ctx, 'N', x + 32, y + 1, C.branco);
        matriz(ctx, x + 32, y + 8, ['.x.', 'xvx', '.x.'], { x: C.branco, v: C.vermelho });
      } else if (d === 'planta') {     // vasinho com broto e a lupa olhando a folha
        matriz(ctx, x + 8, y + 1, ['..gg.gg..', '.gggggggg', '..gg.g.g.', '....g....', '....g....', '....g....', '..vvvvv..', '..vvvvv..', '...vvv...'],
          { g: '#8ee07a', v: '#e0884a' });
        circulo(ctx, x + 28, y + 5, 4, C.branco); circulo(ctx, x + 28, y + 5, 3, '#9fd4ee');
        ret(ctx, x + 27, y + 4, 1, 1, C.branco);
        matriz(ctx, x + 31, y + 8, ['x..', '.x.', '..x'], { x: C.ouro3 });   // cabo
        ret(ctx, x + 20, y + 11, 6, 1, ROSA);
      } else if (d === 'silabas') {
        giz(ctx, 'BA-BE-BI', x + 5, y + 2, C.branco);
        ret(ctx, x + 5, y + 9, 7, 1, ROSA); ret(ctx, x + 17, y + 9, 7, 1, C.ouro3); ret(ctx, x + 29, y + 9, 7, 1, '#9fd4ee');
      } else {                         // linha do tempo: três marcos, do castelo antigo à casinha de hoje
        ret(ctx, x + 3, y + 10, 35, 1, C.branco);
        matriz(ctx, x + 36, y + 9, ['x.', '.x', 'x.'], { x: C.branco });   // seta
        [6, 19, 31].forEach(function (cx, n) { ret(ctx, x + cx, y + 9, 3, 3, [ROSA, C.ouro3, '#9fd4ee'][n]); });
        matriz(ctx, x + 4, y + 2, ['x.x.x', 'xxxxx', 'xxxxx', 'xx.xx'], { x: '#e8c86a' });                // castelo
        matriz(ctx, x + 17, y + 2, ['..x..', '.xxx.', 'xxxxx', '.x.x.'], { x: C.branco });               // tenda
        matriz(ctx, x + 29, y + 2, ['..x..', '.xxx.', 'xxxxx', 'x.x.x'], { x: ROSA });                   // casinha
      }
      ret(ctx, x - 1, y + 14, 42, 2, C.madeira3);                                    // aparador do giz
      ret(ctx, x + 3, y + 13, 4, 1, C.branco); ret(ctx, x + 32, y + 12, 5, 2, K); ret(ctx, x + 33, y + 12, 3, 1, C.ouro);
    } });

  // para escola/escola.js: o desenho da lousa de cada matéria
  S.lousaDaMateria = function (materiaId) { return DESENHO[materiaId] || null; };
})();
