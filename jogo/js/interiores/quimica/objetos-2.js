/* Laboratório de Química, parte 3: os objetos da Sala do Microscópio e do Cantinho dos Átomos ('quimica-<nome>').
   Vem de objetos.js (cores e vidraria em Reino._predios.quimica). A tabela periódica da parede usa as casas e as
   cores de Reino.QUIMICA (tabela, familias) quando existem, lidas só na hora de desenhar. Nada de canvas no carregamento. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, matriz = D.matriz;
  var K = R.Desenho.K;
  var S = R._predios['quimica'];
  var v = S.v, tempo = S.tempo, LIQ = S.LIQ, VIDRO = S.VIDRO, VIDRO2 = S.VIDRO2, LAB2 = S.LAB2;
  var tampo = S.tampo;

  /* ================= SALA DO MICROSCÓPIO ================= */
  // mesa com o microscópio grande (abre a tela) e uma luminária de mesa
  I.objeto('quimica-microscopio', { w: 2, h: 1, topo: 24, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      tampo(ctx, px, py, py + 2, 2);
      ret(ctx, px + 4, py + 9, 24, 2, K); ret(ctx, px + 5, py + 9, 22, 1, C.metal);
      // pé, braço curvo e platina
      ret(ctx, px + 6, py - 2, 14, 5, K); ret(ctx, px + 7, py - 1, 12, 3, S.COR); ret(ctx, px + 7, py - 1, 12, 1, D.clarear(S.COR, 0.4));
      ret(ctx, px + 15, py - 20, 5, 19, K); ret(ctx, px + 16, py - 19, 3, 17, S.COR); ret(ctx, px + 16, py - 19, 1, 17, D.clarear(S.COR, 0.4));
      ret(ctx, px + 5, py - 9, 12, 3, K); ret(ctx, px + 6, py - 8, 10, 1, C.metal);
      ret(ctx, px + 8, py - 9, 4, 1, VIDRO); ret(ctx, px + 9, py - 10, 2, 1, LIQ.rosa);   // a lâmina
      ret(ctx, px + 9, py - 5, 3, 3, K); ret(ctx, px + 10, py - 4, 1, 1, C.ouro3);         // a luzinha de baixo
      // botão do foco
      ret(ctx, px + 19, py - 12, 4, 4, K); ret(ctx, px + 20, py - 11, 2, 2, C.metal);
      // canhão inclinado e a ocular
      ret(ctx, px + 8, py - 17, 8, 7, K); ret(ctx, px + 9, py - 16, 6, 5, C.metal); ret(ctx, px + 9, py - 16, 2, 5, C.branco);
      ret(ctx, px + 9, py - 11, 2, 2, K); ret(ctx, px + 13, py - 11, 2, 2, K);
      ret(ctx, px + 10, py - 22, 7, 6, K); ret(ctx, px + 11, py - 21, 5, 4, C.metal); ret(ctx, px + 11, py - 21, 1, 4, C.branco);
      ret(ctx, px + 12, py - 25, 6, 4, K); ret(ctx, px + 13, py - 24, 4, 2, K);
      // luminária de mesa à direita
      ret(ctx, px + 23, py - 1, 7, 3, K); ret(ctx, px + 26, py - 12, 2, 12, K);
      ret(ctx, px + 23, py - 16, 8, 5, K); ret(ctx, px + 24, py - 15, 6, 3, LIQ.amarelo); ret(ctx, px + 24, py - 12, 6, 1, C.ouro3);
    } });

  // caixa de madeira aberta com as lâminas de vidro
  I.objeto('quimica-caixa-laminas', { w: 1, h: 1, topo: 4, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py - 4, 14, 6, K); ret(ctx, px + 2, py - 3, 12, 4, C.madeira2);   // a tampa em pé
      ret(ctx, px + 1, py + 2, 14, 12, K); ret(ctx, px + 2, py + 3, 12, 10, C.madeira); ret(ctx, px + 2, py + 3, 12, 1, C.madeiraClara);
      var cores = [LIQ.rosa, LIQ.verde, C.branco, LIQ.amarelo, LIQ.roxo];
      for (var i = 0; i < 5; i++) {
        var x = px + 3 + i * 2;
        ret(ctx, x, py + 1, 2, 10, K); ret(ctx, x + 1, py + 2, 1, 8, VIDRO); ret(ctx, x + 1, py + 5, 1, 2, cores[i]);
      }
    } });

  // mesinha baixa com duas lupas, uma folha e um cristal
  I.objeto('quimica-lupas', { w: 2, h: 1, topo: 8, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      tampo(ctx, px, py, py + 3, 2);
      elipse(ctx, px + 23, py + 1, 4, 2, C.folha3); elipse(ctx, px + 23, py + 1, 3, 1, C.folha); ret(ctx, px + 20, py + 2, 7, 1, C.folha3);
      [[px + 8, py - 3], [px + 20, py - 4]].forEach(function (l, i) {
        circulo(ctx, l[0], l[1], 5, K); circulo(ctx, l[0], l[1], 4, i ? C.ouro : C.metal); circulo(ctx, l[0], l[1], 3, VIDRO);
        ret(ctx, l[0] - 2, l[1] - 2, 1, 2, C.branco);
        ret(ctx, l[0] + 3, l[1] + 4, 3, 3, K); ret(ctx, l[0] + 5, l[1] + 6, 3, 2, K); ret(ctx, l[0] + 4, l[1] + 5, 1, 1, C.madeira);
      });
      ret(ctx, px + 7, py - 4, 3, 3, K); ret(ctx, px + 8, py - 3, 1, 1, C.branco);   // o cristal aumentado
    } });

  // cebolas brotando: num pote de vidro com água (var.vaso: 'barro' = no vaso de barro)
  I.objeto('quimica-cebolas', { w: 1, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var barro = v(o, 'vaso', 'vidro') === 'barro';
      if (barro) { ret(ctx, px + 2, py + 6, 12, 9, K); ret(ctx, px + 3, py + 7, 10, 7, C.terracota); ret(ctx, px + 3, py + 7, 10, 1, C.terracota2); }
      else {
        ret(ctx, px + 3, py + 3, 10, 12, K); ret(ctx, px + 4, py + 4, 8, 10, VIDRO); ret(ctx, px + 4, py + 8, 8, 6, '#bfe6f0');
        ret(ctx, px + 6, py + 9, 1, 4, C.creme); ret(ctx, px + 8, py + 10, 1, 3, C.creme); ret(ctx, px + 10, py + 9, 1, 4, C.creme);   // raízes
        ret(ctx, px + 4, py + 4, 1, 8, C.branco);
      }
      var cy = barro ? py + 4 : py + 5;
      elipse(ctx, px + 8, cy, 4, 3, K); elipse(ctx, px + 8, cy, 3, 2, '#b04a8a'); ret(ctx, px + 6, cy - 1, 2, 1, '#e08ac0');
      ret(ctx, px + 7, cy - 10, 1, 7, C.folha3); ret(ctx, px + 9, cy - 8, 1, 5, C.folha); ret(ctx, px + 5, cy - 7, 1, 4, C.folha3);
      ret(ctx, px + 7, cy - 11, 1, 1, C.folha4);
    } });

  // vitrine de cristais: ametista, quartzo rosa, sulfato azul e um cubo de sal
  I.objeto('quimica-vitrine-cristais', { w: 2, h: 1, topo: 14, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 3, py + 8, 2, 7, K); ret(ctx, px + 27, py + 8, 2, 7, K);
      ret(ctx, px + 1, py + 4, 30, 5, K); ret(ctx, px + 2, py + 5, 28, 3, C.madeira);
      ret(ctx, px + 1, py - 14, 30, 19, K); ret(ctx, px + 2, py - 13, 28, 17, '#eaf6ff'); ret(ctx, px + 2, py + 2, 28, 2, LAB2);
      // ametista (triângulos roxos)
      triangulo(ctx, px + 3, py - 7, 5, 9, K); triangulo(ctx, px + 4, py - 5, 3, 7, LIQ.roxo);
      triangulo(ctx, px + 6, py - 10, 5, 12, K); triangulo(ctx, px + 7, py - 8, 3, 10, '#8a5ad0'); ret(ctx, px + 8, py - 6, 1, 3, C.branco);
      // quartzo rosa
      triangulo(ctx, px + 12, py - 6, 6, 8, K); triangulo(ctx, px + 13, py - 4, 4, 6, S.COR2);
      // sulfato azul
      matriz(ctx, px + 19, py - 5, ['.kkk.', 'kbwbk', 'kbbbk', 'kbbdk', '.kkk.'], { k: K, b: C.azul, w: C.branco, d: '#3f7fd6' });
      // cubinho de sal
      ret(ctx, px + 25, py - 3, 5, 5, K); ret(ctx, px + 26, py - 2, 3, 3, C.branco); ret(ctx, px + 28, py - 2, 1, 3, VIDRO2);
      ret(ctx, px + 2, py + 1, 28, 1, C.metal2);
      ret(ctx, px + 4, py - 12, 1, 3, C.branco); ret(ctx, px + 5, py - 13, 1, 1, C.branco); ret(ctx, px + 16, py - 12, 1, 2, C.branco);
      R.Desenho.brilho(ctx, px + 11, py - 11, C.ouro3);
    } });

  /* ================= CANTINHO DOS ÁTOMOS ================= */
  // a tabela periódica gigante (5×2, abre a tela): as 118 casas coloridas por família
  var CORES_FAM = { 'alcalino': '#ff7b8a', 'alcalino-terroso': '#ffb35c', 'transicao': '#ffb8d8', 'pos-transicao': '#9fd3ff',
    'semimetal': '#7fe0c8', 'nao-metal': '#8fe07a', 'halogenio': '#ffe066', 'gas-nobre': '#c9a8ff',
    'lantanideo': '#ffd6a8', 'actinideo': '#f0c090' };
  var SEMI = { '2,13': 1, '3,14': 1, '4,14': 1, '4,15': 1, '5,15': 1, '5,16': 1 };
  var NAO_METAL = { '1,1': 1, '2,14': 1, '2,15': 1, '2,16': 1, '3,15': 1, '3,16': 1, '4,16': 1 };
  // as casas de sempre (sem os dados do conteúdo): { linha, coluna, familia }; La e Ac na coluna 3, o resto (14+14) embaixo
  function casasPadrao() {
    var l = [];
    function f(li, co) {
      var k = li + ',' + co;
      if (li === 9) return 'lantanideo';
      if (li === 10) return 'actinideo';
      if (co === 3 && li === 6) return 'lantanideo';
      if (co === 3 && li === 7) return 'actinideo';
      if (NAO_METAL[k]) return 'nao-metal';
      if (SEMI[k]) return 'semimetal';
      if (co === 18) return 'gas-nobre';
      if (co === 17) return 'halogenio';
      if (co === 1) return 'alcalino';
      if (co === 2) return 'alcalino-terroso';
      if (co <= 12) return 'transicao';
      return 'pos-transicao';
    }
    for (var li = 1; li <= 7; li++) for (var co = 1; co <= 18; co++) {
      if (li === 1 && co > 1 && co < 18) continue;
      if (li <= 3 && co > 2 && co < 13) continue;
      l.push({ linha: li, coluna: co, familia: f(li, co) });
    }
    for (var lf = 9; lf <= 10; lf++) for (var cf = 4; cf <= 17; cf++) l.push({ linha: lf, coluna: cf, familia: f(lf, cf) });
    return l;
  }
  function casas() {
    var Q = R.QUIMICA || {};
    return (Q.tabela && Q.tabela.length >= 100) ? Q.tabela : casasPadrao();
  }
  function corDaFamilia(fam) {
    var Q = R.QUIMICA || {}, F = Q.familias && Q.familias[fam];
    return (F && F.cor) || CORES_FAM[fam] || C.creme2;
  }
  I.objeto('quimica-tabela-parede', { w: 5, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py, 78, 31, K); ret(ctx, px + 2, py + 1, 76, 29, S.COR); ret(ctx, px + 3, py + 1, 74, 28, '#fffaf0');
      casas().forEach(function (c) {
        var li = c.linha > 7 ? c.linha - 1 : c.linha;
        var x = px + 4 + (c.coluna - 1) * 4, y = py + 2 + (li - 1) * 3 + (c.linha > 7 ? 1 : 0);
        ret(ctx, x, y, 3, 2, corDaFamilia(c.familia));
      });
      // o hidrogênio em destaque
      ret(ctx, px + 4, py + 2, 3, 1, C.branco);
    } });

  // modelo de átomo num pedestal: núcleo e três órbitas (0°, 60° e 120°) com os elétrons girando
  var ORBITAS = [0, Math.PI / 3, Math.PI * 2 / 3], RX = 9, RY = 3;
  function naOrbita(c, giro, a) {
    var x = Math.cos(a) * RX, y = Math.sin(a) * RY;
    return { x: Math.round(c.x + x * Math.cos(giro) - y * Math.sin(giro)), y: Math.round(c.y + x * Math.sin(giro) + y * Math.cos(giro)) };
  }
  function centroAtomo(px, py) { return { x: px + 8, y: py - 14 }; }
  I.objeto('quimica-atomo', { w: 1, h: 1, topo: 26, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 2, py + 11, 12, 4, K); ret(ctx, px + 3, py + 12, 10, 2, S.COR);
      ret(ctx, px + 5, py - 2, 6, 14, K); ret(ctx, px + 6, py - 1, 4, 12, LAB2); ret(ctx, px + 6, py - 1, 1, 12, C.branco);
      ret(ctx, px + 4, py - 3, 8, 2, K); ret(ctx, px + 7, py - 5, 2, 3, K);
      var c = centroAtomo(px, py);
      ORBITAS.forEach(function (g) { for (var i = 0; i < 48; i++) { var p = naOrbita(c, g, i / 48 * Math.PI * 2); ret(ctx, p.x, p.y, 1, 1, C.azul); } });
      // núcleo: prótons vermelhos e nêutrons cinza
      circulo(ctx, c.x, c.y, 3, K);
      ret(ctx, c.x - 2, c.y - 2, 2, 2, LIQ.vermelho); ret(ctx, c.x + 1, c.y - 2, 2, 2, '#b9b4c8');
      ret(ctx, c.x - 2, c.y + 1, 2, 2, '#b9b4c8'); ret(ctx, c.x + 1, c.y + 1, 2, 2, LIQ.vermelho); ret(ctx, c.x, c.y, 1, 1, LIQ.vermelho);
    },
    anim: function (ctx, px, py, t) {
      var tt = tempo(t), c = centroAtomo(px, py);
      ORBITAS.forEach(function (g, i) {
        var p = naOrbita(c, g, tt / (700 + i * 200) + i * 2.1);
        ret(ctx, p.x - 1, p.y - 1, 3, 3, K); ret(ctx, p.x, p.y, 1, 1, C.ouro);
      });
    } });

  // modelo da molécula de água num pedestal: um oxigênio vermelho e dois hidrogênios brancos
  I.objeto('quimica-agua', { w: 1, h: 1, topo: 16, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 2, py + 1, 12, 14, K); ret(ctx, px + 3, py + 2, 10, 12, LAB2); ret(ctx, px + 3, py + 2, 2, 12, C.branco);
      ret(ctx, px + 5, py + 6, 6, 3, K); ret(ctx, px + 6, py + 7, 4, 1, C.azul);
      ret(ctx, px + 1, py - 1, 14, 3, K); ret(ctx, px + 2, py, 12, 1, S.COR);
      var cx = px + 8, cy = py - 9;
      ret(ctx, cx - 6, cy + 3, 4, 2, K); ret(ctx, cx + 3, cy + 3, 4, 2, K);   // as ligações
      circulo(ctx, cx - 6, cy + 6, 3, K); circulo(ctx, cx - 6, cy + 6, 2, C.branco); ret(ctx, cx - 7, cy + 5, 1, 1, LAB2);
      circulo(ctx, cx + 6, cy + 6, 3, K); circulo(ctx, cx + 6, cy + 6, 2, C.branco); ret(ctx, cx + 5, cy + 5, 1, 1, LAB2);
      circulo(ctx, cx, cy, 5, K); circulo(ctx, cx, cy, 4, LIQ.vermelho); ret(ctx, cx - 2, cy - 2, 2, 2, D.clarear(LIQ.vermelho, 0.5));
    } });

  // pufe redondo (var.cor)
  I.objeto('quimica-pufe', { w: 1, h: 1, topo: 2, solido: true,
    desenhar: function (ctx, px, py, o) {
      var cor = v(o, 'cor', S.COR2);
      elipse(ctx, px + 8, py + 9, 7, 5, K); elipse(ctx, px + 8, py + 9, 6, 4, D.escurecer(cor, 0.15));
      elipse(ctx, px + 8, py + 7, 6, 3, cor); ret(ctx, px + 4, py + 6, 3, 1, D.clarear(cor, 0.45));
      ret(ctx, px + 8, py + 7, 1, 1, D.escurecer(cor, 0.3));
    } });
})();
