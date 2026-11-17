/* Vila Arco-Íris, Casa Mal-Assombrada por dentro (docs/contratos/vila.md §2): os enfeites do salão (prefixo
   vila-assombrada-), assombrados de mentirinha. Chão: o caldeirão de sopa verde borbulhando (interativo), o castiçal de
   três velas, o pratinho de velas, o fantasminha amigo de laço (interativo) e o tapete da lua; parede: a teia com a
   aranhinha, a janela da noite (lua e estrelas), o quadro torto (var.n: 0 fantasma, interativo; 1 abóbora) e a viga
   dos morcegos. Usa Reino._predios.vila (V) e V.assombrada (A, de assombrada-objetos.js). Bolhas, chamas, piscar e
   bater de asas só no `anim` (no instante 0 tudo parado); os móveis altos animam com o pintor (só fillRect). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, ret = D.ret, elipse = D.elipse;
  var K = R.Desenho.K, matriz = R.Desenho.matriz;
  var V = R._predios.vila, caixa = V.caixa, MADEIRA = V.MADEIRA, A = V.assombrada, C = A.cores;
  var CHAMA = '#ffd34d', CHAMA2 = '#fff3a0', CHAMA3 = '#ff8a3d', VELA = '#fff8ee', VELA2 = '#e6dccb';
  var OURO = '#c9a35a', OURO2 = '#e8cf8a', SOPA = '#7be05a', SOPA2 = '#c4ff9a';

  // vela de largura 3 com a chama (x, topo y, altura h); mexe = a chama puxada para o lado
  function vela(ctx, x, y, h, mexe) {
    ret(ctx, x, y, 3, h, K); ret(ctx, x + 1, y + 1, 1, h - 1, VELA); ret(ctx, x + 1, y + 1, 1, 1, VELA2);
    var cx = x + 1 + (mexe ? 1 : 0);
    ret(ctx, cx, y - 3, 1, 3, CHAMA); ret(ctx, cx, y - 2, 1, 1, CHAMA2); ret(ctx, x + 1, y - 1, 1, 1, CHAMA3);
  }

  /* ---------- chão ---------- */
  // caldeirão (2 × 1) de pernas, no foguinho, com a sopa verde (interativo)
  I.objeto('vila-assombrada-caldeirao', { w: 2, h: 1, solido: true, alto: true, topo: 16,
    desenhar: function (ctx, px, py) {
      var cx = px + 16;
      ret(ctx, px + 7, py + 9, 3, 6, K); ret(ctx, px + 22, py + 9, 3, 6, K);
      ret(ctx, px + 11, py + 11, 10, 4, CHAMA3); ret(ctx, px + 13, py + 9, 2, 3, CHAMA); ret(ctx, px + 17, py + 10, 2, 2, CHAMA);
      elipse(ctx, cx, py + 1, 13, 9, K); elipse(ctx, cx, py + 1, 12, 8, '#3b3350');
      ret(ctx, px + 6, py - 2, 2, 6, '#5e5478'); ret(ctx, px + 8, py - 4, 2, 2, '#5e5478');
      ret(ctx, px + 2, py - 9, 28, 5, K); ret(ctx, px + 3, py - 8, 26, 3, '#5e5478'); ret(ctx, px + 3, py - 8, 26, 1, '#8a80a8');
      elipse(ctx, cx, py - 10, 12, 2, K); elipse(ctx, cx, py - 10, 11, 1, SOPA); ret(ctx, px + 8, py - 11, 5, 1, SOPA2);
      ret(ctx, px + 12, py - 14, 2, 2, SOPA); ret(ctx, px + 19, py - 13, 2, 2, SOPA2);
    },
    anim: function (ctx, px, py, t) {   // bolhas subindo e o fogo mexendo
      var f = Math.floor(t / 200);
      if (!f) return;
      ret(ctx, px + 10 + (f % 2) * 2, py - 12 - (f % 4), 2, 2, SOPA2);
      ret(ctx, px + 18, py - 13 - ((f + 2) % 3), 1, 1, '#ffffff');
      ret(ctx, px + 13 + (f % 3), py + 8, 2, 2, CHAMA2);
    } });

  // castiçal dourado de pé (1 × 1) com três velas
  I.objeto('vila-assombrada-castical', { w: 1, h: 1, solido: true, alto: true, topo: 20,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 3, py + 11, 10, 4, K); ret(ctx, px + 4, py + 12, 8, 2, OURO); ret(ctx, px + 4, py + 12, 8, 1, OURO2);
      ret(ctx, px + 6, py - 6, 4, 18, K); ret(ctx, px + 7, py - 6, 2, 17, OURO); ret(ctx, px + 7, py - 6, 1, 17, OURO2);
      ret(ctx, px + 1, py - 8, 14, 3, K); ret(ctx, px + 2, py - 7, 12, 1, OURO2);
      vela(ctx, px + 1, py - 13, 6); vela(ctx, px + 6, py - 16, 9); vela(ctx, px + 11, py - 13, 6);
    },
    anim: function (ctx, px, py, t) {   // as chamas tremem
      var f = Math.floor(t / 260) % 3;
      if (!f) return;
      [[2, -16], [7, -19], [12, -16]].forEach(function (c, i) {
        if ((i + f) % 2) { ret(ctx, px + c[0], py + c[1], 1, 1, CHAMA2); ret(ctx, px + c[0] + 1, py + c[1] + 1, 1, 1, CHAMA); }
      });
    } });

  // pratinho com três velas baixas (1 × 1)
  I.objeto('vila-assombrada-velas', { w: 1, h: 1, solido: true, alto: true, topo: 4,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 8, py + 12, 7, 2, K); elipse(ctx, px + 8, py + 12, 6, 1, OURO);
      vela(ctx, px + 2, py + 6, 6); vela(ctx, px + 7, py + 2, 10); vela(ctx, px + 12, py + 7, 5);
    },
    anim: function (ctx, px, py, t) {
      if (Math.floor(t / 300) % 3 === 1) { ret(ctx, px + 8, py - 1, 1, 1, CHAMA2); ret(ctx, px + 3, py + 3, 1, 1, CHAMA2); }
    } });

  // fantasminha amigo de laço rosa (1 × 1), flutuando (interativo)
  var FANTASMA = ['....kkkkk....', '..kkwwwwwkk..', '.kwwwwwwwwwk.', '.kwwwwwwwwsk.', 'kwwwwwwwwwwsk', 'kwwhewwwhewsk',
    'kwweewwweewsk', 'kwpwwkwkwwpsk', 'kwwwwwkwwwwsk', 'kwwwwwwwwwwsk', 'kwwwwwwwwwssk', 'kwwwkwwwkwwwk', '.kwk.kwk.kwk.',
    '..k...k...k..'];
  var PAL_FANTASMA = { k: K, w: C.fantasma, s: C.fantasma2, e: '#2a1838', h: '#ffffff', p: C.rosa };
  I.objeto('vila-assombrada-fantasma', { w: 1, h: 1, solido: true, alto: true, topo: 8,
    desenhar: function (ctx, px, py) {
      matriz(ctx, px + 1, py - 8, FANTASMA, PAL_FANTASMA);
      matriz(ctx, px + 9, py - 8, ['kk.kk', 'kpkpk', 'kk.kk'], { k: K, p: '#ff5c9a' });
    },
    anim: function (ctx, px, py, t) {   // pisca
      if (t % 2800 < 2600) return;
      matriz(ctx, px + 1, py - 3, ['kwwwwwwwwwwsk', 'kwwkkwwwkkwsk'], PAL_FANTASMA);
    } });

  // tapete da lua (4 × 2), não sólido: roxo de franjas, a lua e estrelinhas
  var LUA = ['..kkkk.', '.kyyyk.', 'kyyk...', 'kyk....', 'kyyk...', '.kyyyk.', '..kkkk.'];
  function estrela(ctx, x, y) { ret(ctx, x, y - 1, 1, 3, C.luz); ret(ctx, x - 1, y, 3, 1, C.luz); }
  I.objeto('vila-assombrada-tapete', { w: 4, h: 2, solido: false, semSombra: true,
    desenhar: function (ctx, px, py) {
      for (var i = 0; i < 15; i++) ret(ctx, px + 3 + i * 4, py + 1, 2, 2, '#fff4d8');
      for (i = 0; i < 15; i++) ret(ctx, px + 3 + i * 4, py + 29, 2, 2, '#fff4d8');
      caixa(ctx, px + 1, py + 3, 62, 26, '#7a4fa8');
      ret(ctx, px + 4, py + 6, 56, 1, '#b58cff'); ret(ctx, px + 4, py + 25, 56, 1, '#b58cff');
      ret(ctx, px + 4, py + 6, 1, 20, '#b58cff'); ret(ctx, px + 59, py + 6, 1, 20, '#b58cff');
      ret(ctx, px + 2, py + 4, 60, 1, '#9a6fc8');
      matriz(ctx, px + 28, py + 12, LUA, { k: K, y: C.luz2 });
      estrela(ctx, px + 12, py + 12); estrela(ctx, px + 20, py + 20); estrela(ctx, px + 44, py + 11); estrela(ctx, px + 52, py + 19);
      ret(ctx, px + 9, py + 19, 1, 1, C.luz2); ret(ctx, px + 40, py + 21, 1, 1, C.luz2); ret(ctx, px + 55, py + 10, 1, 1, C.luz2);
    } });

  /* ---------- parede ---------- */
  // teia no canto de cima (1 × 2) com a aranhinha pendurada; var.lado 'dir' = no canto da direita
  var ARANHA = ['k.k.k', '.kkk.', 'kbbbk', 'kpbpk', '.kkk.', 'k.k.k'];
  I.objeto('vila-assombrada-teia', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var dir = o.var && o.var.lado === 'dir';
      A.teia(ctx, dir ? px + 15 : px, py, 15, dir);
      var fx = dir ? px + 6 : px + 9;
      ret(ctx, fx, py + 4, 1, 12, C.teia);
      matriz(ctx, fx - 2, py + 16, ARANHA, { k: K, b: '#5a4078', p: C.rosa });
    } });
  // janela da noite (1 × 2): lua, estrelas, cortinas roxas e o peitoril
  I.objeto('vila-assombrada-janela', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      caixa(ctx, px + 1, py + 5, 14, 20, '#2b3a78'); ret(ctx, px + 2, py + 6, 12, 2, '#3d4f96');
      matriz(ctx, px + 7, py + 7, ['.kk.', 'kyyk', 'kyk.', 'kyyk', '.kk.'], { k: K, y: C.luz2 });
      ret(ctx, px + 4, py + 11, 1, 1, C.luz); ret(ctx, px + 11, py + 17, 1, 1, '#ffffff'); ret(ctx, px + 6, py + 20, 1, 1, C.luz);
      ret(ctx, px + 8, py + 5, 1, 20, K); ret(ctx, px + 1, py + 15, 14, 1, K);
      ret(ctx, px + 2, py + 6, 2, 17, '#7c4ca8'); ret(ctx, px + 12, py + 6, 2, 17, '#7c4ca8');
      ret(ctx, px + 2, py + 6, 1, 17, '#a66bff'); ret(ctx, px + 4, py + 21, 1, 2, '#7c4ca8');
      caixa(ctx, px - 1, py + 24, 18, 4, MADEIRA[0]); ret(ctx, px, py + 25, 16, 1, MADEIRA[2]);
    } });
  // quadro torto (1 × 2): a moldura escorregou para um lado (fileiras deslocadas, sem girar); var.n 0 fantasma, 1 abóbora
  I.objeto('vila-assombrada-quadro', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var n = (o.var && o.var.n) || 0, j;
      ret(ctx, px + 7, py + 2, 2, 2, K);
      for (j = 0; j < 18; j++) {
        var x = px + 1 + Math.floor(j / 6), y = py + 5 + j;
        if (j === 0 || j === 17) { ret(ctx, x, y, 13, 1, K); continue; }
        ret(ctx, x, y, 13, 1, K);
        ret(ctx, x + 1, y, 11, 1, OURO);
        if (j > 1 && j < 16) ret(ctx, x + 2, y, 9, 1, n ? '#3d4f96' : '#e9d8ff');
        if (j === 1) ret(ctx, x + 1, y, 11, 1, OURO2);
      }
      ret(ctx, px + 4, py + 3, 4, 1, K); ret(ctx, px + 9, py + 3, 2, 1, K);   // o barbante
      if (n) A.abobora(ctx, px + 2, py + 11, true);
      else matriz(ctx, px + 5, py + 9, ['..kkk..', '.kwwwk.', 'kwwwwwk', 'kwewewk', 'kpwwwpk', 'kwwkwwk', 'kwwwwwk', '.k.k.k.'],
        { k: K, w: C.fantasma, e: '#2a1838', p: C.rosa });
    } });
  // viga dos morcegos (2 × 2): três morcegos dormindo de cabeça para baixo; um bate as asas
  var MORCEGO = ['.k.k.', 'kbkbk', 'kbbbk', 'kbbbk', 'kpbpk', '.kbk.', 'k...k'];
  I.objeto('vila-assombrada-morcegos', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      caixa(ctx, px, py + 3, 32, 5, MADEIRA[0]); ret(ctx, px + 1, py + 4, 30, 1, MADEIRA[2]);
      [4, 14, 24].forEach(function (x, i) { matriz(ctx, px + x, py + 8 + (i % 2), MORCEGO, { k: K, b: '#9a7ac8', p: C.rosa }); });
    },
    anim: function (ctx, px, py, t) {
      if (t % 2400 < 2100) return;
      ret(ctx, px + 11, py + 10, 3, 2, K); ret(ctx, px + 19, py + 10, 3, 2, K); ret(ctx, px + 10, py + 9, 2, 1, K); ret(ctx, px + 21, py + 9, 2, 1, K);
    } });
})();
