/* Pet Shop, parte 2 de 5: os objetos do Cantinho da Água (o bebedouro grande, a banheira de espuma,
   toalhas, chuveirinho, xampus...). Usa petshop/objetos-loja.js (carregado antes). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var K = '#3a2446';
  var F = (R.FALAS_INTERIORES && R.FALAS_INTERIORES.petshop) || { npcs: {}, objetos: {}, extras: [] };
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};
  var S = R._predios.petshop;
  var MENTA = S.MENTA, MENTA2 = S.MENTA2, MENTA3 = S.MENTA3, ROSA = S.ROSA, ROSA2 = S.ROSA2, ROSA3 = S.ROSA3,
      MAD = S.MAD, MADC = S.MADC, LAR = S.LAR, AGUA = S.AGUA, AGUA2 = S.AGUA2, AGUA3 = S.AGUA3, brilho = S.brilho,
      coracao = S.coracao, bolha = S.bolha, cesta = S.cesta;

  /* ================= OBJETOS DO CANTINHO DA ÁGUA ================= */
  // hora do último gole (mesma base de tempo do quadro: performance.now), para a animação do bebedouro;
  // mora em S porque o gole (petshop/acoes.js) a atualiza
  S.golouEm = -1e9;
  var GOLE_MS = 1800;
  // bebedouro grande: painel de azulejos com a bica de unicórnio dourada e o tanque de pedra
  I.objeto('petshop-bebedouro', { w: 3, h: 2, topo: 14, solido: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 24;
      // painel de azulejos em arco
      ret(ctx, px + 7, py - 6, 34, 22, K); elipse(ctx, cx, py - 6, 17, 8, K);
      ret(ctx, px + 8, py - 5, 32, 20, '#c8eef8'); elipse(ctx, cx, py - 6, 16, 7, '#c8eef8');
      for (var y = py - 8; y < py + 14; y += 5) ret(ctx, px + 8, y, 32, 1, '#9fd6e8');
      for (var x = px + 13; x < px + 40; x += 6) ret(ctx, x, py - 4, 1, 18, '#9fd6e8');
      // estrelinhas no arco
      brilho(ctx, cx - 10, py - 8, C.ouro); brilho(ctx, cx + 10, py - 8, C.ouro);
      // bica: cabecinha de unicórnio dourada com chifre
      // crina lilás e rosa dos lados
      ret(ctx, cx - 7, py - 6, 3, 9, K); ret(ctx, cx - 6, py - 5, 2, 7, '#c9a8ff'); ret(ctx, cx - 6, py - 2, 2, 2, ROSA2);
      ret(ctx, cx + 4, py - 6, 3, 9, K); ret(ctx, cx + 4, py - 5, 2, 7, '#c9a8ff'); ret(ctx, cx + 4, py - 2, 2, 2, ROSA2);
      // cabeça dourada, orelhinhas e chifre em espiral
      ret(ctx, cx - 4, py - 6, 9, 10, K); ret(ctx, cx - 3, py - 5, 7, 8, C.ouro); ret(ctx, cx - 3, py - 5, 7, 1, C.ouro3);
      ret(ctx, cx - 4, py - 8, 2, 3, K); ret(ctx, cx + 3, py - 8, 2, 3, K); ret(ctx, cx - 3, py - 7, 1, 1, ROSA2); ret(ctx, cx + 3, py - 7, 1, 1, ROSA2);
      ret(ctx, cx - 1, py - 14, 3, 9, K); ret(ctx, cx, py - 13, 1, 8, C.branco); ret(ctx, cx, py - 12, 1, 1, C.ouro); ret(ctx, cx, py - 9, 1, 1, C.ouro);
      ret(ctx, cx - 2, py - 2, 1, 2, K); ret(ctx, cx + 2, py - 2, 1, 2, K); ret(ctx, cx - 3, py + 1, 1, 1, ROSA2); ret(ctx, cx + 3, py + 1, 1, 1, ROSA2);
      // focinho que vira bica
      ret(ctx, cx - 2, py + 2, 5, 4, K); ret(ctx, cx - 1, py + 2, 3, 2, C.ouro2); ret(ctx, cx, py + 4, 1, 1, '#2a6a8a');
      // tanque de pedra (o tanque é grande: dá para a montaria inteira beber)
      ret(ctx, px + 1, py + 10, 46, 21, K);
      ret(ctx, px + 2, py + 11, 44, 19, '#f3e6c8');
      ret(ctx, px + 2, py + 11, 44, 2, C.creme);
      ret(ctx, px + 4, py + 14, 40, 9, K);
      ret(ctx, px + 5, py + 15, 38, 7, AGUA); ret(ctx, px + 5, py + 15, 38, 1, AGUA2); ret(ctx, px + 5, py + 20, 38, 2, AGUA3);
      // jato fixo da bica até a água
      ret(ctx, cx - 1, py + 5, 2, 10, AGUA2); ret(ctx, cx, py + 5, 1, 10, C.branco);
      // frente do tanque: pedras e a gotinha
      ret(ctx, px + 2, py + 24, 44, 1, '#d8c6a0');
      for (var i = 0; i < 5; i++) ret(ctx, px + 6 + i * 9, py + 25 + (i % 2) * 2, 5, 1, '#d8c6a0');
      ret(ctx, cx - 3, py + 23, 7, 8, K); ret(ctx, cx - 2, py + 25, 5, 5, AGUA); ret(ctx, cx - 1, py + 24, 3, 1, AGUA); ret(ctx, cx, py + 23, 1, 1, AGUA);
      ret(ctx, cx - 1, py + 26, 1, 2, C.branco);
    },
    // água viva: o jato escorre e faz anéis; logo depois de beber, a água ondula e espirra gotinhas
    anim: function (ctx, px, py, t) {
      if (!t) return;
      var cx = px + 24;
      var f = (t / 90) % 10;
      ret(ctx, cx - 1, py + 5 + Math.floor(f), 2, 1, C.branco);
      ret(ctx, cx - 1, py + 5 + Math.floor((f + 5) % 10), 1, 1, C.branco);
      var anel = (t / 700) % 1, m = 2 + Math.round(anel * 12);
      ret(ctx, cx - m, py + 16, m * 2 + 1, 1, 'rgba(255,255,255,' + (0.85 * (1 - anel)).toFixed(2) + ')');
      var b = Math.floor(t / 260) % 38;
      ret(ctx, px + 5 + b, py + 18, 3, 1, 'rgba(255,255,255,0.55)');
      var d = t - S.golouEm;
      if (d >= 0 && d < GOLE_MS) {
        var k = d / GOLE_MS;
        // ondas atravessando o tanque
        for (var w = 0; w < 3; w++) {
          var off = Math.round((k * 3 + w / 3) % 1 * 36);
          ret(ctx, px + 5 + off, py + 15 + w * 2, 4, 1, C.branco);
          ret(ctx, px + 41 - off, py + 16 + w * 2, 3, 1, AGUA2);
        }
        // repuxo: gotas grandes saltando da bica em arco para os dois lados
        for (var g = 0; g < 8; g++) {
          var lado = g % 2 ? 1 : -1, s = (k * 2.2 + g / 8) % 1;
          var gx = Math.round(cx + lado * (2 + s * 17)), gy = Math.round(py + 2 - Math.sin(s * Math.PI) * 14 + s * 12);
          ret(ctx, gx - 1, gy - 1, 3, 3, AGUA3); ret(ctx, gx, gy, 1, 1, g % 3 ? AGUA2 : C.branco);
        }
        // coraçõezinhos de alegria subindo
        if (k < 0.85) {
          var sobe = Math.round(k * 18);
          coracao(ctx, px + 9, py + 6 - sobe, ROSA2); coracao(ctx, px + 35, py + 2 - sobe, ROSA2);
          brilho(ctx, px + 16, py + 4 - sobe, C.ouro3); brilho(ctx, px + 31, py + 9 - sobe, C.branco);
        }
      }
    } });
  // banheira de espuma com patinho (bolhas sobem com Animações). É onde a montaria toma banho
  // (acao { tipo: 'banho' }, js/sistemas/banho.js): enquanto o banho desenha a espuma e o patinho, os daqui somem.
  // Por isso a espuma e o patinho ficam no anim (um canvas pronto, feito uma vez), fora do desenho parado.
  var espumaParada = null;
  function espumaEPatinho() {
    if (espumaParada) return espumaParada;
    espumaParada = PA.novoCanvas(48, 18);
    var cx = espumaParada.getContext('2d');
    cx.translate(0, 10);
    [[10, 3, 4], [16, 1, 5], [23, 2, 4], [29, 0, 5], [36, 2, 4], [41, 4, 3], [13, -2, 3], [26, -3, 3], [33, -3, 3]].forEach(function (b) {
      bolha(cx, b[0], b[1], b[2]);
    });
    // patinho amarelo
    ret(cx, 20, -7, 8, 5, K); ret(cx, 21, -6, 6, 3, C.ouro);
    ret(cx, 25, -10, 4, 4, K); ret(cx, 26, -9, 2, 2, C.ouro); ret(cx, 29, -8, 2, 1, LAR); ret(cx, 27, -9, 1, 1, K);
    return espumaParada;
  }
  function banhoNaBanheira() {
    try { return !!(R.Banho && R.Banho.desenhandoUni && R.Banho.desenhandoUni()); } catch (e) { return false; }
  }
  I.objeto('petshop-banheira', { w: 3, h: 2, topo: 12, solido: true,
    desenhar: function (ctx, px, py) {
      // pezinhos dourados
      [px + 6, px + 38].forEach(function (x) { ret(ctx, x, py + 25, 5, 5, K); ret(ctx, x + 1, py + 26, 3, 3, C.ouro); });
      // banheira rosa
      ret(ctx, px + 2, py + 4, 44, 23, K); ret(ctx, px + 1, py + 6, 46, 18, K);
      ret(ctx, px + 3, py + 5, 42, 21, ROSA); ret(ctx, px + 2, py + 7, 44, 16, ROSA);
      ret(ctx, px + 3, py + 22, 42, 3, ROSA2); ret(ctx, px + 4, py + 9, 2, 10, ROSA3);
      ret(ctx, px + 2, py + 4, 44, 3, K); ret(ctx, px + 3, py + 5, 42, 1, C.branco);
      for (var x = px + 12; x < px + 40; x += 9) coracao(ctx, x, py + 13, C.branco);
      // torneira à esquerda
      ret(ctx, px + 3, py - 6, 3, 10, K); ret(ctx, px + 3, py - 7, 8, 3, K); ret(ctx, px + 4, py - 6, 6, 1, C.metal); ret(ctx, px + 4, py - 5, 1, 8, C.metal);
      // (a espuma e o patinho vêm no anim)
    },
    anim: function (ctx, px, py, t) {
      // durante o banho, quem desenha a espuma, o patinho e as bolhas é o banho
      if (banhoNaBanheira()) return;
      if (window.PA && PA.novoCanvas) ctx.drawImage(espumaEPatinho(), px, py - 10);
      if (!t) return;
      for (var i = 0; i < 4; i++) {
        var s = (t / 1400 + i * 0.27) % 1, x = px + 12 + i * 8 + Math.round(Math.sin(t / 300 + i) * 2);
        var y = Math.round(py - 4 - s * 14);
        if (s < 0.85) { ret(ctx, x - 1, y - 1, 3, 3, K); ret(ctx, x, y, 1, 1, C.branco); }
        else { brilho(ctx, x, y, C.branco); }
      }
    } });
  // na parede: toalheiro com três toalhas listradas
  I.objeto('petshop-toalhas', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 10, 30, 3, K); ret(ctx, px + 2, py + 11, 28, 1, C.metal);
      ret(ctx, px + 1, py + 9, 2, 5, K); ret(ctx, px + 29, py + 9, 2, 5, K);
      [[3, ROSA, C.branco], [12, MENTA, '#ffd34d'], [21, '#c9a8ff', ROSA3]].forEach(function (tw, i) {
        var x = px + tw[0], h = 15 - (i % 2) * 2;
        ret(ctx, x, py + 11, 8, h, K); ret(ctx, x + 1, py + 12, 6, h - 2, tw[1]);
        ret(ctx, x + 1, py + 11 + h - 5, 6, 1, tw[2]); ret(ctx, x + 1, py + 11 + h - 3, 6, 1, tw[2]);
        ret(ctx, x + 1, py + 12, 6, 1, 'rgba(255,255,255,0.5)');
      });
    } });
  // desenho em mapa de pixels: cada letra é uma cor (o ponto é transparente)
  function mapaPixels(ctx, x0, y0, linhas, cores) {
    for (var j = 0; j < linhas.length; j++) for (var i = 0; i < linhas[j].length; i++) {
      var c = cores[linhas[j][i]];
      if (c) ret(ctx, x0 + i, y0 + j, 1, 1, c);
    }
  }
  // na parede: chuveirinho de mão de dar banho — o cabo apoiado no suporte rosa, a cabeça redonda
  // virada para baixo com os furinhos e os jatinhos, e a mangueira sanfonada descendo até o registro
  // (os pingos correm com Animações). Começa em py + 11, para não encostar na placa do cômodo.
  var CHUVEIRINHO = [
    '...........KKKK.',
    '..........KrbrrK',
    '..........KrrRRK',
    '.........KKKKKK.',
    '........KbmK.KgK',
    '.......KmmK..KmK',
    '......KmmK...KgK',
    '...KKKmmK....KmK',
    '..KrrbrrrK...KgK',
    '.KrrrrrrrrK..KmK',
    '.KRRRRRRRRK.KgK.',
    'KKKKKKKKKKKKKmK.',
    'KmAmAmAmAmmKKK..',
    '.KKKKKKKKKK.KrK.',
    '.a..a..a..a.KRK.',
    'a..a..a..a...K..',
    '.a..a..a.a......',
  ];
  I.objeto('petshop-chuveirinho', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      mapaPixels(ctx, px, py + 11, CHUVEIRINHO, { K: K, r: ROSA, R: ROSA2, b: C.branco, m: C.metal, g: C.metal2, A: AGUA2, a: AGUA3 });
    },
    anim: function (ctx, px, py, t) {
      if (!t) return;
      for (var i = 0; i < 3; i++) {
        var s = (t / 650 + i / 3) % 1;
        ret(ctx, px + 1 + i * 3 - Math.round(s * 2), Math.round(py + 25 + s * 5), 1, 2, AGUA3);
      }
    } });
  // pilha de toalhas dobradas no banquinho
  I.objeto('petshop-pilha-toalhas', { w: 1, h: 1, topo: 8, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 2, py + 9, 12, 6, K); ret(ctx, px + 3, py + 10, 10, 2, MADC); ret(ctx, px + 3, py + 12, 2, 3, MAD); ret(ctx, px + 11, py + 12, 2, 3, MAD);
      [[ROSA, C.branco], [MENTA, C.branco], ['#ffd34d', ROSA3], ['#c9a8ff', C.branco]].forEach(function (c, i) {
        var y = py + 5 - i * 4, x = px + 2 + (i % 2);
        ret(ctx, x, y, 12, 5, K); ret(ctx, x + 1, y + 1, 10, 3, c[0]); ret(ctx, x + 1, y + 2, 10, 1, c[1]);
      });
    } });
  // cestinho com frascos de xampu
  I.objeto('petshop-xampus', { w: 1, h: 1, topo: 9, solido: true,
    desenhar: function (ctx, px, py) {
      [[3, 8, ROSA2], [7, 10, MENTA2], [11, 7, '#b58cff']].forEach(function (b) {
        var x = px + b[0] - 2, h = b[1];
        ret(ctx, x, py + 8 - h, 5, h + 2, K); ret(ctx, x + 1, py + 9 - h, 3, h, b[2]); ret(ctx, x + 1, py + 11 - h, 1, 3, C.branco);
        ret(ctx, x + 1, py + 6 - h, 3, 2, K);
      });
      cesta(ctx, px, py + 1, '#9fdcff');
    } });
  // tapetinho de banho de bolinhas (plano)
  I.objeto('petshop-tapete-banho', { w: 2, h: 1, solido: false, semSombra: true, plano: true,
    desenhar: function (ctx, px, py, o) {
      var W = (o.w || 2) * 16;
      contornoRet(ctx, px + 2, py + 3, W - 4, 10, '#9fdcff');
      for (var x = px + 5; x < px + W - 4; x += 5) { ret(ctx, x, py + 6, 2, 2, C.branco); ret(ctx, x + 2, py + 9, 1, 1, C.branco); }
      for (var f = px + 3; f < px + W - 3; f += 2) { ret(ctx, f, py + 2, 1, 1, C.creme2); ret(ctx, f, py + 13, 1, 1, C.creme2); }
    } });
  // balde cheio de espuma
  I.objeto('petshop-balde-espuma', { w: 1, h: 1, topo: 8, solido: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      for (var i = -5; i <= 5; i++) ret(ctx, cx + i, py - 1 + Math.round(i * i / 8), 1, 1, K);
      ret(ctx, cx - 6, py + 4, 13, 11, K); ret(ctx, cx - 5, py + 5, 11, 9, MENTA); ret(ctx, cx - 5, py + 9, 11, 1, MENTA2); ret(ctx, cx - 4, py + 6, 2, 6, MENTA3);
      bolha(ctx, cx - 3, py + 3, 3); bolha(ctx, cx + 2, py + 2, 4); bolha(ctx, cx, py - 2, 3);
    } });
  // secador de crina no pedestal
  I.objeto('petshop-secador', { w: 1, h: 1, topo: 22, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 5, py + 12, 11, 3, K); ret(ctx, cx - 4, py + 12, 9, 1, C.metal);
      ret(ctx, cx - 1, py - 8, 3, 21, K); ret(ctx, cx, py - 8, 1, 20, C.metal2);
      // capacete do secador: cúpula rosa aberta embaixo
      elipse(ctx, cx, py - 15, 7, 6, K); elipse(ctx, cx, py - 15, 6, 5, ROSA); ret(ctx, cx - 4, py - 19, 3, 2, ROSA3);
      elipse(ctx, cx, py - 11, 6, 2, K); elipse(ctx, cx, py - 11, 5, 1, '#8a4a7a');
      ret(ctx, cx + 3, py - 17, 2, 2, C.branco); ret(ctx, cx - 1, py - 22, 3, 2, K); ret(ctx, cx, py - 22, 1, 1, C.ouro);
      // ventinho quente saindo
      ret(ctx, cx - 3, py - 8, 1, 2, '#ffc0d8'); ret(ctx, cx + 3, py - 8, 1, 2, '#ffc0d8');
    } });
  // bacia azul com patinhos de borracha
  I.objeto('petshop-patinhos', { w: 1, h: 1, topo: 5, solido: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 8, py + 10, 7, 4, K); elipse(ctx, px + 8, py + 10, 6, 3, '#5fb4ff'); elipse(ctx, px + 8, py + 9, 5, 2, AGUA2);
      [[5, 7], [10, 6]].forEach(function (d) {
        var x = px + d[0], y = py + d[1];
        ret(ctx, x - 3, y - 1, 7, 4, K); ret(ctx, x - 2, y, 5, 2, C.ouro);
        ret(ctx, x, y - 4, 4, 4, K); ret(ctx, x + 1, y - 3, 2, 2, C.ouro); ret(ctx, x + 4, y - 2, 2, 1, LAR); ret(ctx, x + 2, y - 3, 1, 1, K);
      });
    } });
  // poça de espuma no chão (plana, andável): lâmina d'água azul baixinha e brilhante, com bolhas redondas na beira
  // (nada de montinho branco, para não parecer nuvem)
  var POCA = [
    '...........oo...',
    '..oo......owwo..',
    '.owwooooooowwoo.',
    'ooaalwlaaaaaaaao',
    'oaaaaaaaaaaaawao',
    '.ooaaaaaaaaaaoo.',
    '...oooooooooo...',
  ];
  I.objeto('petshop-espuma', { w: 1, h: 1, solido: false, semSombra: true, plano: true,
    desenhar: function (ctx, px, py) {
      mapaPixels(ctx, px, py + 6, POCA, { o: AGUA3, a: AGUA, l: AGUA2, w: C.branco });
    } });
})();
