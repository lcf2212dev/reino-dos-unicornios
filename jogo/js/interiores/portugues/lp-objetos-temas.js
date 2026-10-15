/* Língua Portuguesa do 4º bimestre (térreo da Casa das Palavras), parte 2 dos objetos: os enfeites de cada capítulo.
   Cap. 10 "Conta uma história?" (O Gato de Botas, a lenda da Vitória-Régia): castelo, gato de botas, moinho,
   lago da vitória-régia, livro de contos na parede. Cap. 11 "Quem canta..." (Rei da Floresta): violão, leão,
   pauta, arara, gramofone. Cap. 12 "O visual do poema": jacaré letrado, ovo, letras, relâmpago, poema na parede,
   máquina de escrever. Animações só com `anim` (Animações ligadas). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet, matriz = D.matriz;
  var K = R.Desenho.K;
  function v(o, k, padrao) { return (o && o.var && o.var[k] !== undefined) ? o.var[k] : padrao; }
  function plinto(ctx, px, py, cor) {   // plinto 1×1: do meio do tile até o chão
    ret(ctx, px + 2, py + 6, 12, 9, K); ret(ctx, px + 3, py + 7, 10, 7, cor || '#f4eee4');
    ret(ctx, px + 3, py + 7, 10, 1, C.branco); ret(ctx, px + 3, py + 12, 10, 2, '#d8cfc0');
  }

  /* ================= CAPÍTULO 10: contos e lendas ================= */
  // maquete do castelo do ogro (O Gato de Botas), num plinto largo
  I.objeto('lp-castelo', { w: 2, h: 1, topo: 18, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 4, 30, 11, K); ret(ctx, px + 2, py + 5, 28, 9, '#f4eee4'); ret(ctx, px + 2, py + 5, 28, 1, C.branco);
      ret(ctx, px + 2, py + 11, 28, 3, '#d8cfc0');
      var pedra = '#cfc6d8', pedra2 = '#a89cb8';
      contornoRet(ctx, px + 6, py - 8, 20, 13, pedra);
      [px + 3, px + 23].forEach(function (x) {
        contornoRet(ctx, x, py - 12, 7, 17, pedra);
        triangulo(ctx, x - 1, py - 18, 9, 6, K); triangulo(ctx, x, py - 17, 7, 5, '#e0433f');
        ret(ctx, x + 3, py - 8, 1, 2, K);
      });
      for (var i = 0; i < 4; i++) ret(ctx, px + 9 + i * 4, py - 10, 2, 2, K);
      ret(ctx, px + 13, py - 3, 6, 8, K); ret(ctx, px + 14, py - 2, 4, 7, '#6b4428');
      ret(ctx, px + 9, py - 5, 2, 2, pedra2); ret(ctx, px + 21, py - 5, 2, 2, pedra2);
      ret(ctx, px + 15, py - 14, 1, 6, K); ret(ctx, px + 16, py - 14, 3, 2, '#8e4fd6');
    } });
  // estátua do Gato de Botas: gato laranja de chapéu com pena azul, capa vermelha e botas
  I.objeto('lp-gato-botas', { w: 1, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      plinto(ctx, px, py);
      matriz(ctx, px + 2, py - 10, [
        '.....fff....', '...kkkkfk...', '...khhhhk...', '.kkkkkkkkkk.', '..koooooook.', '..koeooeook.', '..koooooook.',
        '...koonook..', '..krrooorrk.', '.krrroooorrk', '.krrroooorrk', '..krooooork.', '...koookok..', '..kbbk.kbbk.',
        '..kbbk.kbbk.', '...kk...kk..'],
        { k: K, o: '#ff9a3c', e: '#3a2446', n: C.rosa, r: '#e0433f', h: '#6b4428', f: '#5fb4ff', b: '#5a3a2a' });
    } });
  // moinho de vento vermelho de pás laranja (a herança do primogênito); as pás giram devagar com Animações
  function pas(ctx, cx, cy, a) {
    for (var i = 0; i < 4; i++) {
      var ang = a + i * Math.PI / 2;
      for (var r = 2; r <= 7; r++) ret(ctx, Math.round(cx + Math.cos(ang) * r), Math.round(cy + Math.sin(ang) * r), 2, 2, r === 7 ? K : '#ffb070');
    }
    circulo(ctx, cx, cy, 2, K); circulo(ctx, cx, cy, 1, C.ouro);
  }
  I.objeto('lp-moinho', { w: 1, h: 1, topo: 15, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 5, py - 6, 11, 21, K); ret(ctx, cx - 4, py - 5, 9, 19, '#e0433f'); ret(ctx, cx - 4, py - 5, 2, 19, '#ff7a6a');
      triangulo(ctx, cx - 6, py - 12, 13, 7, K); triangulo(ctx, cx - 5, py - 11, 11, 6, '#8a604a');
      ret(ctx, cx - 1, py + 8, 3, 6, K); ret(ctx, cx, py + 9, 1, 5, '#6b4428');
      ret(ctx, cx - 3, py + 1, 2, 2, K); ret(ctx, cx + 2, py + 1, 2, 2, K);
    },
    anim: function (ctx, px, py, t) { pas(ctx, px + 8, py - 7, Math.PI / 4 + t / 1500); } });
  // lago da lenda da Vitória-Régia: folhas redondas e a flor rosa sob a lua
  I.objeto('lp-vitoria-regia', { w: 2, h: 1, topo: 3, solido: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 16, py + 9, 15, 6, K); elipse(ctx, px + 16, py + 9, 14, 5, '#3eaea3'); elipse(ctx, px + 16, py + 8, 12, 3, '#7ed9c8');
      [[px + 8, py + 9], [px + 21, py + 10], [px + 15, py + 7]].forEach(function (f) {
        elipse(ctx, f[0], f[1], 4, 2, K); elipse(ctx, f[0], f[1], 3, 1, '#5e9a3a'); ret(ctx, f[0] - 3, f[1], 6, 1, '#8fb83a');
      });
      ret(ctx, px + 13, py + 3, 5, 4, K); ret(ctx, px + 14, py + 3, 1, 3, C.rosa2); ret(ctx, px + 16, py + 3, 1, 3, C.rosa2);
      ret(ctx, px + 15, py + 2, 1, 4, C.rosa); ret(ctx, px + 15, py + 5, 1, 1, C.ouro);
    } });
  // livro de contos aberto na parede: "Era uma vez", com castelo e floresta
  I.objeto('lp-livro-conto', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 6, 30, 20, K); ret(ctx, px + 2, py + 24, 28, 1, '#3fae5a');
      ret(ctx, px + 2, py + 7, 13, 17, C.creme); ret(ctx, px + 17, py + 7, 13, 17, C.creme); ret(ctx, px + 15, py + 7, 2, 18, '#2a7a3e');
      ret(ctx, px + 4, py + 9, 2, 3, '#8e4fd6');
      for (var l = 0; l < 5; l++) ret(ctx, px + 4 + (l ? 0 : 3), py + 10 + l * 3, l === 4 ? 6 : 9, 1, '#c8b8d8');
      ret(ctx, px + 18, py + 18, 11, 5, '#9fe0a0');
      [[px + 19, '#5e9a3a'], [px + 26, '#3f7a2a']].forEach(function (a) { triangulo(ctx, a[0], py + 12, 5, 7, a[1]); });
      ret(ctx, px + 22, py + 12, 4, 7, '#cfc6d8'); ret(ctx, px + 22, py + 10, 1, 2, '#cfc6d8'); ret(ctx, px + 25, py + 10, 1, 2, '#cfc6d8');
      ret(ctx, px + 23, py + 16, 2, 3, '#6b4428'); circulo(ctx, px + 27, py + 9, 1, C.ouro);
    } });

  /* ================= CAPÍTULO 11: canções ================= */
  // violão num suporte
  I.objeto('lp-violao', { w: 1, h: 1, topo: 15, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var cx = px + 8, c = v(o, 'cor', '#d9892f');
      ret(ctx, cx - 5, py + 13, 11, 2, K); ret(ctx, cx - 4, py + 9, 1, 5, K); ret(ctx, cx + 4, py + 9, 1, 5, K);
      ret(ctx, cx - 1, py - 14, 3, 12, K); ret(ctx, cx, py - 13, 1, 10, '#6b4428');
      ret(ctx, cx - 2, py - 15, 5, 3, K); ret(ctx, cx - 1, py - 14, 3, 1, '#8a604a');
      circulo(ctx, cx, py, 4, K); circulo(ctx, cx, py + 6, 5, K);
      circulo(ctx, cx, py, 3, c); circulo(ctx, cx, py + 6, 4, c);
      circulo(ctx, cx, py + 3, 1, K); ret(ctx, cx - 2, py + 8, 5, 1, '#6b4428');
      ret(ctx, cx, py - 10, 1, 17, C.ouro3);
    } });
  // estátua do leão de coroa, o rei da floresta da canção
  I.objeto('lp-leao', { w: 1, h: 1, topo: 8, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      plinto(ctx, px, py, '#fff1d6');
      matriz(ctx, px + 1, py - 8, [
        '....y.y.y.....', '....yyyyy.....', '..kkkkkkkkk...', '.kmmmmmmmmmk..', 'kmmkoooooommk.', 'kmkoeooeokmmk.',
        'kmkooooooomk..', 'kmmkoonookmmk.', '.kmmkoookmmk..', '..kkmmmmmkk...', '...kooooook...', '..kooooooook..',
        '..kookkkkook..', '..kkk....kkk..'],
        { k: K, m: '#c8701a', o: '#ffc04a', e: '#3a2446', n: '#8a4a2a', y: C.ouro });
    } });
  // pauta grande na parede, com notas coloridas
  I.objeto('lp-notas', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      contornoRet(ctx, px + 1, py + 7, 30, 17, C.creme);
      for (var l = 0; l < 5; l++) ret(ctx, px + 3, py + 10 + l * 3, 26, 1, '#9a8aaa');
      matriz(ctx, px + 4, py + 9, ['.kk..', 'k..k.', 'k..k.', '.kk..', 'k..k.', 'k..k.', '.kk..'], { k: '#8e4fd6' });
      [[px + 12, 15, '#e0433f'], [px + 17, 12, '#3fae5a'], [px + 22, 18, '#5fb4ff'], [px + 27, 13, '#ff8a3d']].forEach(function (n) {
        elipse(ctx, n[0], py + n[1], 2, 1, n[2]); ret(ctx, n[0] + 2, py + n[1] - 6, 1, 6, K);
      });
    } });
  // arara colorida no poleiro (ela voa na canção)
  I.objeto('lp-arara', { w: 1, h: 1, topo: 17, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 7, py - 4, 2, 19, K); ret(ctx, px + 7, py - 3, 1, 17, '#8a604a');
      ret(ctx, px + 4, py + 13, 8, 2, K);
      ret(ctx, px + 2, py - 5, 12, 2, K); ret(ctx, px + 3, py - 5, 10, 1, '#c98a4b');
      matriz(ctx, px + 4, py - 17, ['..kkk...', '.krrrk..', 'krwkrrk.', 'kyyrrrk.', '.kkrrbk.', '..krbbk.', '..krbgk.', '..kbbgk.',
        '...kbgk.', '...kbk..', '....k...', '........'], { k: K, r: '#e0433f', w: C.branco, y: '#ffd34d', b: '#2f6fd6', g: '#3fae5a' });
    } });
  // gramofone de corneta dourada
  I.objeto('lp-gramofone', { w: 1, h: 1, topo: 12, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      contornoRet(ctx, px + 2, py + 5, 12, 10, '#8a4a2a'); ret(ctx, px + 3, py + 6, 10, 1, '#c98a4b');
      ret(ctx, px + 3, py + 4, 10, 2, K); ret(ctx, px + 4, py + 4, 8, 1, '#3a2446');
      ret(ctx, px + 8, py - 3, 2, 8, K); ret(ctx, px + 8, py - 2, 1, 6, C.ouro2);
      matriz(ctx, px + 4, py - 12, ['....kkkkk..', '...kyyyyyk.', '..kyYYYYyk.', '.kyY...Yyk.', '.kyY...Yyk.', '..kyYYYYyk.', '...kyyyyk..',
        '....kyyk...', '.....kk....'], { k: K, y: C.ouro, Y: C.ouro3 });
    } });

  /* ================= CAPÍTULO 12: poema visual e letras ================= */
  // o jacaré letrado: um jacaré verde feito de letrinhas (a palavra "jacaré" pintada no corpo)
  I.objeto('lp-jacare', { w: 2, h: 1, topo: 2, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 10, 30, 5, K); ret(ctx, px + 2, py + 11, 28, 3, '#f4eee4');
      matriz(ctx, px + 1, py + 1, [
        '.......................kk.kk..', '..........kkkkkkkkkkkkgwkgwk..', '.....kkkkggggggggggggggggggkkk', 'kkkkgggggggggggggggggggggggggk',
        '.kgggggggggggggggggggggggwgwgk', '..kkgggggggggggggggggggggkkkk.', '....kkkkgggkkkkkkkkgggk.......', '.......kggk........kggk.......',
        '.......kkk.........kkk........'],
        { k: K, g: '#5e9a3a', w: C.branco });
      var L = ['#d4ee78', '#fff3a0'];
      for (var x = 0; x < 6; x++) { ret(ctx, px + 7 + x * 3, py + 4, 2, 1, L[x % 2]); ret(ctx, px + 9 + x * 3, py + 6, 1, 1, L[(x + 1) % 2]); }
    } });
  // ovo grande num ninho de palha, no pedestal (o poema visual "um ovo")
  I.objeto('lp-ovo', { w: 1, h: 1, topo: 13, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      plinto(ctx, px, py);
      elipse(ctx, px + 8, py + 4, 7, 3, K); elipse(ctx, px + 8, py + 4, 6, 2, '#d9a93a');
      elipse(ctx, px + 8, py - 4, 5, 8, K); elipse(ctx, px + 8, py - 4, 4, 7, C.creme);
      ret(ctx, px + 6, py - 9, 2, 2, C.branco);
      ret(ctx, px + 5, py - 3, 6, 1, '#c8b8d8'); ret(ctx, px + 6, py - 1, 4, 1, '#c8b8d8');
      ret(ctx, px + 3, py + 3, 10, 1, '#b8862a');
    } });
  // blocos de letras grandes: "A" maiúsculo e "a" minúsculo
  I.objeto('lp-letras', { w: 1, h: 1, topo: 6, solido: true,
    desenhar: function (ctx, px, py, o) {
      var c1 = v(o, 'cor', '#5fb4ff'), c2 = v(o, 'cor2', '#ff7eb6');
      contornoRet(ctx, px + 1, py + 2, 8, 13, c1); contornoRet(ctx, px + 8, py + 6, 7, 9, c2);
      matriz(ctx, px + 3, py + 4, ['.w.', 'w.w', 'www', 'w.w', 'w.w'], { w: C.branco });
      matriz(ctx, px + 10, py + 8, ['ww.', '..w', 'www', 'w.w', 'www'], { w: C.branco });
      contornoRet(ctx, px + 3, py - 6, 9, 9, '#ffd34d');
      matriz(ctx, px + 5, py - 4, ['www.', 'w..w', 'www.', 'w..w', 'www.'], { w: '#8a5200' });
    } });
  // cartaz do relâmpago (o poema "relâmpago"), com o raio em zigue-zague
  I.objeto('lp-relampago', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      contornoRet(ctx, px + 1, py + 7, 14, 18, '#3d4f9a');
      matriz(ctx, px + 4, py + 9, ['....kk', '...kyk', '..kyk.', '.kyyyk', 'kkkyk.', '..kyk.', '.kyk..', '.kk...', '.k....'],
        { k: K, y: C.ouro });
      ret(ctx, px + 3, py + 20, 3, 1, '#9fdcff'); ret(ctx, px + 9, py + 21, 3, 1, '#9fdcff');
    } });
  // poema visual na parede: palavras que desenham uma gota de chuva
  I.objeto('lp-poema', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var c = v(o, 'cor', '#5fb4ff');
      contornoRet(ctx, px + 2, py + 6, 28, 20, C.creme);
      ret(ctx, px + 8, py + 8, 16, 2, '#3a2446');
      var linhas = [[15, 2], [14, 4], [13, 6], [12, 8], [11, 10], [11, 10], [12, 8], [14, 4]];
      linhas.forEach(function (l, i) {
        for (var x = 0; x < l[1]; x += 3) ret(ctx, px + l[0] + x, py + 11 + i * 2, Math.min(2, l[1] - x), 1, c);
      });
      ret(ctx, px + 5, py + 23, 3, 1, '#c8b8d8');
    } });
  // máquina de escrever antiga num banquinho
  I.objeto('lp-maquina', { w: 1, h: 1, topo: 8, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 2, py + 4, 12, 3, K); ret(ctx, px + 3, py + 5, 10, 1, '#8a604a');
      ret(ctx, px + 3, py + 7, 2, 8, K); ret(ctx, px + 11, py + 7, 2, 8, K);
      ret(ctx, px + 2, py - 3, 12, 8, K); ret(ctx, px + 3, py - 2, 10, 6, '#3d4f9a');
      for (var i = 0; i < 4; i++) { ret(ctx, px + 4 + i * 2, py + 1, 1, 1, C.creme); ret(ctx, px + 5 + i * 2, py + 3, 1, 1, C.creme); }
      ret(ctx, px + 5, py - 8, 6, 6, K); ret(ctx, px + 6, py - 7, 4, 5, C.branco); ret(ctx, px + 7, py - 6, 2, 1, '#c8b8d8');
      ret(ctx, px + 1, py - 3, 14, 2, K); ret(ctx, px + 2, py - 3, 12, 1, '#9a8aaa');
    } });
})();
