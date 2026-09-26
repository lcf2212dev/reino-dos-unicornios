/* Observatório por dentro, parte 4 de 6: as peças da Galeria do Espaço (foguete, traje, pedra da Lua,
   meteorito) e os móveis soltos (luminária da lua, cordão, plaquinha). Usa observatorio/ceu.js. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var T = 16;
  var K = R.Desenho.K;
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};
  var S = R._predios.observatorio;
  var ESTRELA = S.ESTRELA, LILAS = S.LILAS, METAL = S.METAL, METAL2 = S.METAL2, METAL3 = S.METAL3, v = S.v,
      tempo = S.tempo, G_CIANO = S.G_CIANO, G_LILAS = S.G_LILAS, CINTILA = S.CINTILA, haloAnel = S.haloAnel;

  // foguete na plataforma
  I.objeto('observatorio-foguete', { w: 2, h: 1, topo: 46, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 16;
      // plataforma
      ret(ctx, px + 1, py + 7, 30, 8, K); ret(ctx, px + 2, py + 8, 28, 6, METAL2); ret(ctx, px + 2, py + 8, 28, 1, METAL);
      for (var i = 0; i < 7; i++) ret(ctx, px + 3 + i * 4, py + 11, 2, 2, i % 2 ? '#2a2f66' : C.ouro);
      // aletas
      ret(ctx, cx - 11, py - 6, 6, 12, K); ret(ctx, cx - 10, py - 4, 4, 9, C.vermelho); ret(ctx, cx - 10, py - 4, 4, 1, '#ff8a94');
      ret(ctx, cx + 5, py - 6, 6, 12, K); ret(ctx, cx + 6, py - 4, 4, 9, C.vermelho); ret(ctx, cx + 6, py - 4, 4, 1, '#ff8a94');
      // bocal
      ret(ctx, cx - 4, py + 4, 9, 4, K); ret(ctx, cx - 3, py + 5, 7, 2, METAL3);
      // corpo
      ret(ctx, cx - 6, py - 32, 13, 38, K);
      ret(ctx, cx - 5, py - 31, 11, 36, '#f4f6fb');
      ret(ctx, cx + 2, py - 31, 3, 36, '#d0d6e8'); ret(ctx, cx - 5, py - 31, 1, 36, C.branco);
      ret(ctx, cx - 5, py - 8, 11, 2, C.vermelho); ret(ctx, cx - 5, py - 26, 11, 1, METAL2);
      // bico
      triangulo(ctx, cx - 7, py - 45, 15, 14, K);
      triangulo(ctx, cx - 5, py - 43, 11, 12, C.vermelho);
      ret(ctx, cx - 2, py - 38, 1, 5, '#ff8a94');
      // janelinha
      circulo(ctx, cx, py - 19, 3, K); circulo(ctx, cx, py - 19, 2, C.azul); ret(ctx, cx - 1, py - 20, 1, 1, C.branco);
      // bandeirinha do Brasil
      ret(ctx, cx - 3, py - 3, 7, 5, K); ret(ctx, cx - 2, py - 2, 5, 3, '#2e9a4e'); ret(ctx, cx - 1, py - 2, 3, 3, '#ffd34d'); ret(ctx, cx, py - 1, 1, 1, '#2f4fd6');
    },
    anim: function (ctx, px, py, t) {
      t = tempo(t);
      var on = !t || Math.floor(t / 500) % 2 === 0;
      ret(ctx, px + 3, py + 9, 1, 1, on ? C.vermelho : '#7a2a3a');
      ret(ctx, px + 28, py + 9, 1, 1, on ? '#7a2a3a' : C.vermelho);
    } });
  // traje de astronauta no manequim
  I.objeto('observatorio-traje', { w: 1, h: 1, topo: 20, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 5, py + 11, 11, 3, K); ret(ctx, cx - 4, py + 11, 9, 2, '#2a2f66');
      ret(ctx, cx - 1, py + 7, 3, 5, K); ret(ctx, cx, py + 7, 1, 4, METAL);
      // mochila
      ret(ctx, cx - 6, py - 7, 13, 11, K); ret(ctx, cx - 5, py - 6, 11, 9, '#c9d2ea');
      // pernas
      ret(ctx, cx - 4, py + 3, 4, 6, K); ret(ctx, cx + 1, py + 3, 4, 6, K);
      ret(ctx, cx - 3, py + 3, 2, 5, '#f4f6fb'); ret(ctx, cx + 2, py + 3, 2, 5, '#f4f6fb');
      // corpo e braços
      ret(ctx, cx - 5, py - 6, 11, 11, K); ret(ctx, cx - 4, py - 5, 9, 9, '#f4f6fb');
      ret(ctx, cx - 8, py - 5, 4, 9, K); ret(ctx, cx - 7, py - 4, 2, 7, '#e8ecf5');
      ret(ctx, cx + 5, py - 5, 4, 9, K); ret(ctx, cx + 6, py - 4, 2, 7, '#e8ecf5');
      ret(ctx, cx - 7, py + 2, 2, 2, METAL2); ret(ctx, cx + 6, py + 2, 2, 2, METAL2);
      // painel no peito e bandeira do Brasil
      ret(ctx, cx - 2, py - 2, 5, 3, '#2a2f66'); ret(ctx, cx - 1, py - 1, 1, 1, C.vermelho); ret(ctx, cx + 1, py - 1, 1, 1, C.verde);
      ret(ctx, cx - 4, py - 5, 3, 2, '#2e9a4e'); ret(ctx, cx - 3, py - 5, 1, 1, '#ffd34d');
      // capacete com viseira dourada
      circulo(ctx, cx, py - 11, 6, K); circulo(ctx, cx, py - 11, 5, '#f4f6fb');
      elipse(ctx, cx, py - 11, 3, 2, '#d9a93a'); ret(ctx, cx - 2, py - 12, 2, 1, '#fff3a0');
    } });
  // vitrine com a pedra da Lua
  I.objeto('observatorio-pedra-lua', { w: 2, h: 1, topo: 12, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 16;
      ret(ctx, px + 1, py + 1, 30, 14, K); ret(ctx, px + 2, py + 2, 28, 12, '#3a3f8a'); ret(ctx, px + 2, py + 2, 28, 1, C.ouro);
      ret(ctx, cx - 5, py + 7, 10, 4, K); ret(ctx, cx - 4, py + 8, 8, 2, C.ouro); ret(ctx, cx - 3, py + 8, 6, 1, C.ouro3);
      // caixa de vidro
      ret(ctx, px + 3, py - 11, 26, 13, K); ret(ctx, px + 4, py - 10, 24, 11, '#9fb8e0');
      ret(ctx, px + 4, py - 10, 24, 2, '#c8dcf5');
      // suporte: almofadinha roxa
      ret(ctx, cx - 5, py - 1, 11, 3, K); ret(ctx, cx - 4, py - 1, 9, 1, '#7c5cff'); ret(ctx, cx - 4, py, 9, 1, '#5a3fc0');
      // a pedra: bloco cinza irregular, com crateras e brilho
      var PEDRA = ['..KKKK...', '.KbbbbKK.', 'KbllbbbdK', 'KblcbbcdK', 'KbbbbbbdK', 'KbcbbbddK', '.KbbdddK.', '..KKKKK..'];
      var CORES_PEDRA = { K: K, b: '#a8a6b8', l: '#d4d2e0', d: '#7e7c94', c: '#5e5c74' };
      for (var j = 0; j < PEDRA.length; j++) for (var i = 0; i < PEDRA[j].length; i++) {
        var ch = PEDRA[j].charAt(i);
        if (ch !== '.') ret(ctx, cx - 4 + i, py - 9 + j, 1, 1, CORES_PEDRA[ch]);
      }
      // borda clara das crateras (luz vindo de cima, à esquerda) e o brilho
      ret(ctx, cx - 1, py - 7, 1, 1, '#d4d2e0'); ret(ctx, cx + 2, py - 7, 1, 1, '#d4d2e0'); ret(ctx, cx - 2, py - 5, 1, 1, '#d4d2e0');
      ret(ctx, cx - 2, py - 8, 1, 1, C.branco);
      // reflexo no vidro
      ret(ctx, px + 6, py - 9, 1, 5, C.branco); ret(ctx, px + 8, py - 9, 1, 3, C.branco);
    } });
  // meteorito no pedestal
  I.objeto('observatorio-meteorito', { w: 1, h: 1, topo: 12, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 6, py + 10, 13, 4, K); ret(ctx, cx - 5, py + 10, 11, 3, '#2a2f66');
      ret(ctx, cx - 4, py - 2, 9, 13, K); ret(ctx, cx - 3, py - 1, 7, 11, '#3a3f8a'); ret(ctx, cx - 3, py - 1, 2, 11, '#4a52a8');
      ret(ctx, cx - 5, py - 3, 11, 3, K); ret(ctx, cx - 4, py - 3, 9, 1, C.ouro);
      elipse(ctx, cx, py - 7, 5, 4, K); elipse(ctx, cx, py - 7, 4, 3, '#4a3c3c');
      ret(ctx, cx - 2, py - 9, 2, 1, '#8a7c78'); ret(ctx, cx + 1, py - 6, 2, 1, '#2a2020'); ret(ctx, cx - 3, py - 6, 1, 1, '#2a2020');
      ret(ctx, cx + 2, py - 9, 1, 1, '#d8d4e8'); ret(ctx, cx - 1, py - 5, 1, 1, '#c9c4d6');
    } });
  // luminária de pé da noite: haste de latão com uma lua cheia acesa em cima.
  // A luz é só de pixels opacos em pontilhado em volta da lua (nada de semitransparente nem de poça
  // no chão: no piso escuro isso vira mancha cinza).
  I.objeto('observatorio-luminaria', { w: 1, h: 1, topo: 20, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8, cy = py - 12;
      // pé
      ret(ctx, cx - 4, py + 11, 9, 4, K); ret(ctx, cx - 3, py + 12, 7, 2, C.ouro2); ret(ctx, cx - 3, py + 12, 7, 1, C.ouro);
      // haste com um anel no meio
      ret(ctx, cx - 1, py - 6, 3, 18, K); ret(ctx, cx, py - 6, 1, 17, C.ouro);
      ret(ctx, cx - 2, py + 3, 5, 2, K); ret(ctx, cx - 1, py + 3, 3, 1, C.ouro3);
      // colarinho que segura a lua
      ret(ctx, cx - 3, py - 7, 7, 3, K); ret(ctx, cx - 2, py - 6, 5, 1, C.ouro);
      // a lua acesa (creme, sombra dourada embaixo à direita, crateras e brilho)
      circulo(ctx, cx, cy, 6, K);
      circulo(ctx, cx, cy, 5, '#ffe89a');
      circulo(ctx, cx - 1, cy - 1, 4, '#fff6c8');
      ret(ctx, cx + 3, cy + 1, 1, 3, '#f2c24e'); ret(ctx, cx + 1, cy + 4, 3, 1, '#f2c24e'); ret(ctx, cx + 2, cy + 3, 1, 1, '#f2c24e');
      ret(ctx, cx + 1, cy - 2, 2, 2, '#f4d77a'); ret(ctx, cx - 3, cy + 1, 2, 1, '#f4d77a'); ret(ctx, cx, cy + 2, 1, 1, '#f4d77a');
      ret(ctx, cx - 3, cy - 3, 1, 1, C.branco); ret(ctx, cx - 2, cy - 4, 1, 1, C.branco);
    },
    // brilho em volta da lua: anel pontilhado que respira devagar (só com animações)
    anim: function (ctx, px, py, t, o) {
      t = tempo(t);
      var cx = px + 8, cy = py - 12, f = t ? Math.floor(t / 900) % 2 : 0;
      for (var a = 0; a < 28; a++) {
        if ((a + f) % 2) continue;
        var ang = a / 28 * Math.PI * 2;
        ret(ctx, Math.round(cx + Math.cos(ang) * 8), Math.round(cy + Math.sin(ang) * 8), 1, 1, a % 4 === f * 2 ? '#ffe680' : '#ffb347');
      }
      // segundo anel, lilás e ciano, mais espaçado (o halo da galáxia)
      haloAnel(ctx, cx, cy, 11, f ? G_LILAS : G_CIANO, 4, f * 2);
      // poeira cintilante em volta da lua: 3 pontinhos que dão a volta devagar
      for (var p = 0; p < 3; p++) {
        var ap = (t / 5200) + p * 2.09 + (o ? (o.x || 0) : 0), rp = 14 + p % 2;
        var cor = CINTILA[(p + (t ? Math.floor(t / 700) : 0)) % 3];
        ret(ctx, Math.round(cx + Math.cos(ap) * rp), Math.round(cy + Math.sin(ap) * rp * 0.8), 1, 1, cor);
      }
      ret(ctx, cx - 2, cy - 2, 1, 1, f ? C.branco : '#fff6c8');
    } });
  // cordão de isolamento (postes prateados, corda azul)
  I.objeto('observatorio-cordao', { w: 2, h: 1, topo: 3, solido: true,
    desenhar: function (ctx, px, py, o) {
      var W = (o.w || 2) * T;
      for (var x = px + 4; x < px + W - 4; x++) {
        var f = (x - px - 4) / (W - 8), cai = Math.round(Math.sin(f * Math.PI) * 4);
        ret(ctx, x, py + 4 + cai, 1, 2, K); ret(ctx, x, py + 4 + cai, 1, 1, '#5a6ad0');
      }
      [px + 3, px + W - 4].forEach(function (cx) {
        ret(ctx, cx - 2, py + 12, 5, 3, K); ret(ctx, cx - 1, py + 12, 3, 2, METAL2);
        ret(ctx, cx - 1, py + 1, 3, 12, K); ret(ctx, cx, py + 1, 1, 11, METAL);
        circulo(ctx, cx, py + 1, 2, K); circulo(ctx, cx, py + 1, 1, C.branco);
      });
    } });
  // plaquinha de legenda num suporte
  I.objeto('observatorio-placa', { w: 1, h: 1, topo: 6, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var cx = px + 8;
      ret(ctx, cx - 1, py + 2, 3, 11, K); ret(ctx, cx, py + 2, 1, 10, METAL);
      ret(ctx, cx - 4, py + 12, 9, 3, K); ret(ctx, cx - 3, py + 12, 7, 2, METAL2);
      ret(ctx, cx - 6, py - 5, 13, 9, K); ret(ctx, cx - 5, py - 4, 11, 7, v(o, 'cor', '#2a3380'));
      ret(ctx, cx - 4, py - 3, 6, 1, C.ouro); ret(ctx, cx - 4, py - 1, 9, 1, LILAS); ret(ctx, cx - 4, py + 1, 7, 1, LILAS);
      ret(ctx, cx + 3, py - 3, 1, 1, ESTRELA);
    } });

})();
