/* Observatório, a arte do prédio, parte 2 de 4: Reino.ObservatorioCenas, as cenas do telescópio
   (160×112 px, moldura redonda de luneta) e o desenho dos planetas para o Planetário.
   As outras partes: observatorio/planetas.js (antes), observatorio/robo.js (a base de sprite 'robo',
   o Robô Cosmo) e observatorio/fora.js (o desenho de fora, Mapa.PREDIOS.observatorio).
   No carregamento só registra funções: nada de DOM, canvas nem PA aqui fora (as ferramentas em
   Node o carregam num vm sem DOM). Tudo que cria canvas fica cacheado.
   Nunca há cena do Sol pelo telescópio: olhar o Sol por um telescópio é perigoso. */
(function () {
  var Reino = window.Reino = window.Reino || {};
  var CONTORNO = Reino.Desenho.K;
  var S = Reino._predios.observatorioCenas;
  var esc = S.esc, mis = S.mis, rng = S.rng, Buf = S.Buf, discoBuf = S.discoBuf, estrela = S.estrela,
      dentroDisco = S.dentroDisco, corPlaneta = S.corPlaneta, pintarPlaneta = S.pintarPlaneta,
      spritePlaneta = S.spritePlaneta;

  /* ================= CENAS DO TELESCÓPIO ================= */
  var CW = 160, CH = 112, LX = 79.5, LY = 55.5, LR = 50;   // lente redonda no meio
  // céu de galáxia: azul-marinho profundo, nebulosas em pontilhado (azul → roxo → magenta), toques
  // de ciano e rosa, estrelas em cruz e poeira. Pintado uma vez por tema (a cena parada fica em cache).
  var CEU = '#141852', CEU2 = '#0c0f3a';
  var BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  // [fraca, média, forte] de cada família: azul, roxo, magenta
  var NEB = [['#1a2272', '#24309a', '#2f3fb8'], ['#261c78', '#4a2ca8', '#6c3fd4'], ['#301a6c', '#6e2ea8', '#b24fe0']];
  var CINTILA = ['#ffffff', '#6fd6ff', '#c9b6ff'];

  function ceu(B, semente, qtd, forca) {
    var r = rng(semente);
    forca = forca === undefined ? 1 : forca;
    // 3 nuvens de nebulosa em lugares sorteados; a cor vai do azul (esquerda) ao magenta (direita) ou ao contrário
    var nuvens = [];
    for (var n = 0; n < 3; n++) nuvens.push([20 + r() * 120, 12 + r() * 88, 22 + r() * 22, 12 + r() * 12, r() * Math.PI]);
    var inverte = r() < 0.5;
    B.ceu = {};
    for (var y = 0; y < CH; y++) for (var x = 0; x < CW; x++) {
      var d = Math.sqrt((x - LX) * (x - LX) + (y - LY) * (y - LY));
      if (d > LR) continue;
      var dens = 0;
      for (var k = 0; k < nuvens.length; k++) {
        var nv = nuvens[k], ca = Math.cos(nv[4]), sa = Math.sin(nv[4]);
        var u = ((x - nv[0]) * ca + (y - nv[1]) * sa) / nv[2], v = (-(x - nv[0]) * sa + (y - nv[1]) * ca) / nv[3];
        dens += Math.exp(-(u * u + v * v)) * (0.8 + 0.2 * Math.sin(x * 0.3 + y * 0.2 + k));
      }
      dens *= forca;
      var l = (BAYER4[(y & 3) * 4 + (x & 3)] + 0.5) / 16;
      var nivel = dens > 0.75 + l * 0.35 ? 2 : dens > 0.42 + l * 0.35 ? 1 : dens > 0.14 + l * 0.3 ? 0 : -1;
      var h = x / CW + (l - 0.5) * 0.2;
      if (inverte) h = 1 - h;
      var cor = nivel < 0 ? (d > 36 ? CEU2 : CEU) : NEB[h < 0.36 ? 0 : h < 0.68 ? 1 : 2][nivel];
      B.p(x, y, cor);
      B.ceu[cor] = 1;
    }
    // estrelinhas (brancas, amarelinhas, ciano e rosa), metade apagadinha
    var cores = ['#ffffff', '#fff3c0', '#6fd6ff', '#ffb0e0', '#cfe6ff'];
    for (var i = 0; i < (qtd || 60); i++) {
      var x2 = Math.floor(r() * CW), y2 = Math.floor(r() * CH), c = cores[Math.floor(r() * cores.length)];
      if (!B.g(x2, y2)) continue;
      if (r() < 0.45) c = mis(c, CEU, 0.45);
      B.p(x2, y2, c);
    }
    // estrelas maiores com brilho em cruz
    for (var e = 0; e < 4; e++) {
      var ex = Math.round(LX + (r() - 0.5) * 84), ey = Math.round(LY + (r() - 0.5) * 84);
      if (B.g(ex, ey) && B.g(ex, ey - 2) && B.g(ex, ey + 2)) estrela(B, ex, ey, r() < 0.5 ? 2 : 3, ['#cfe6ff', '#ffd6ec', '#bff0ff', '#fff3c0'][e]);
    }
  }
  // halo em anéis de pixel em volta de um astro (pintado antes dele: ele vem por cima)
  function haloCena(B, cx, cy, r, cor1, cor2) {
    for (var dy = -r - 7; dy <= r + 7; dy++) for (var dx = -r - 7; dx <= r + 7; dx++) {
      var d = Math.sqrt(dx * dx + dy * dy) - r, x = cx + dx, y = cy + dy;
      if (!B.g(x, y)) continue;
      if (d >= 2 && d < 3.2 && ((x + y) & 1)) B.p(x, y, cor1);
      else if (d >= 5 && d < 6 && !(x % 2) && !(y % 2)) B.p(x, y, cor2);
    }
  }
  // poeira cintilante: pontinhos no céu (só onde ficou céu depois do tema), acendendo cada um no seu tempo
  function poeira(B, semente, n) {
    var r = rng(semente), lista = [], tent = 0;
    while (lista.length < n && tent++ < 600) {
      var x = Math.round(LX + (r() - 0.5) * 92), y = Math.round(LY + (r() - 0.5) * 92);
      var k = B.g(x, y);
      if (!k || !B.ceu || !B.ceu[k]) continue;
      if ((x - LX) * (x - LX) + (y - LY) * (y - LY) > (LR - 5) * (LR - 5)) continue;
      lista.push([x, y, 1, CINTILA[lista.length % 3], r(), true]);
    }
    return lista;
  }
  // estrelas que piscam na animação (t): [x, y, tam, cor]
  function piscantes(semente, n, evitar) {
    var r = rng(semente), lista = [], tent = 0;
    while (lista.length < n && tent++ < 400) {
      var ang = r() * Math.PI * 2, raio = 10 + r() * 36;
      var x = Math.round(LX + Math.cos(ang) * raio), y = Math.round(LY + Math.sin(ang) * raio);
      if (evitar && evitar(x, y)) continue;
      lista.push([x, y, r() < 0.4 ? 3 : 2, ['#ffffff', '#fff3a0', '#cfe6ff'][lista.length % 3], r()]);
    }
    return lista;
  }

  // planeta com contorno dentro de uma cena
  var HALO = { saturno: ['#6fd6ff', '#c9b6ff'], jupiter: ['#ffd6ec', '#c9b6ff'], marte: ['#ff9ad8', '#b24fe0'], venus: ['#fff3c0', '#6fd6ff'], lua: ['#cfe6ff', '#c9b6ff'] };
  function planetaNaCena(B, id, cx, cy, r) {
    if (HALO[id]) haloCena(B, cx, cy, r, HALO[id][0], HALO[id][1]);
    var T = new Buf(CW, CH);
    pintarPlaneta(T, id, cx, cy, r);
    T.contornar(CONTORNO);
    T.estampar(B);
  }

  var TEMAS = {
    // Lua cheia: mares escuros, crateras, Tycho com os raios lá embaixo
    lua: function (B) {
      ceu(B, 11, 50, 0.8);
      var T = new Buf(CW, CH), cx = 80, cy = 56, r = 38;
      haloCena(B, cx, cy, r, HALO.lua[0], HALO.lua[1]);
      pintarPlaneta(T, 'lua', cx, cy, r);
      // raios claros de Tycho
      var tx = cx + Math.round(-0.08 * r), ty = cy + Math.round(0.72 * r);
      [[-1, -3], [1, -3], [-3, -1], [3, -2], [-2, 1], [2, 1]].forEach(function (d) {
        for (var k = 3; k < 12; k += 1) {
          var x = tx + Math.round(d[0] * k / 3), y = ty + Math.round(d[1] * k / 3);
          if (T.g(x, y) && k % 3 !== 0) T.p(x, y, '#fffaf0');
        }
      });
      T.contornar(CONTORNO);
      T.estampar(B);
      return piscantes(12, 6, function (x, y) { return (x - cx) * (x - cx) + (y - cy) * (y - cy) < 42 * 42; });
    },
    // Saturno com os anéis inclinados, e Titã (alaranjada) do lado
    saturno: function (B) {
      ceu(B, 21, 60);
      planetaNaCena(B, 'saturno', 80, 57, 17);
      var T = new Buf(CW, CH);
      discoBuf(T, 124, 76, 2, '#f0b060'); T.p(123, 75, '#ffd8a0');
      T.p(38, 44, '#e8e4f0'); T.p(39, 44, '#d0cad8');
      T.contornar(CONTORNO); T.estampar(B);
      return piscantes(22, 7, function (x, y) { return Math.abs(y - 57) < 16 || (x - 80) * (x - 80) + (y - 57) * (y - 57) < 22 * 22; });
    },
    // Júpiter com as faixas, a Grande Mancha Vermelha e as 4 luas de Galileu em fila
    jupiter: function (B) {
      ceu(B, 31, 55);
      planetaNaCena(B, 'jupiter', 80, 56, 22);
      var T = new Buf(CW, CH);
      [[110, 56, 1, '#fff08a'], [121, 57, 1, '#f4ecd8'], [47, 55, 2, '#d8cfc4'], [34, 56, 1, '#b8aca0']].forEach(function (l) {
        discoBuf(T, l[0], l[1], l[2], l[3]);
      });
      T.contornar(CONTORNO); T.estampar(B);
      return piscantes(32, 7, function (x, y) { return Math.abs(y - 56) < 26; });
    },
    // Marte: vermelho, com a calota de gelo no polo, o grande cânion e as luas Fobos e Deimos
    marte: function (B) {
      ceu(B, 41, 55);
      planetaNaCena(B, 'marte', 78, 58, 28);
      var T = new Buf(CW, CH);
      T.p(116, 34, '#b8a898'); T.p(117, 34, '#a09080'); T.p(116, 35, '#a09080');
      T.p(42, 30, '#c8bcb0');
      T.contornar(CONTORNO); T.estampar(B);
      return piscantes(42, 7, function (x, y) { return (x - 78) * (x - 78) + (y - 58) * (y - 58) < 33 * 33; });
    },
    // Cruzeiro do Sul como se vê do chão (a Estrela de Magalhães em cima, a Intrometida pequenina),
    // na faixa clarinha da Via Láctea com o Saco de Carvão (nuvem escura) ao lado
    cruzeiro: function (B) {
      ceu(B, 51, 45, 0.7);
      // faixa da Via Láctea e o Saco de Carvão
      for (var y = 0; y < CH; y++) for (var x = 0; x < CW; x++) {
        if (!B.g(x, y)) continue;
        var dist = Math.abs((y - 86) + (x - 30) * 0.42) / 1.09;
        var sx = (x - 52) / 11, sy = (y - 81) / 8;
        if (sx * sx + sy * sy <= 1) { B.p(x, y, '#150e36'); continue; }
        if (dist < 7) B.p(x, y, '#3a2f7a'); else if (dist < 13) B.p(x, y, '#2e2468');
      }
      var r = rng(52);
      for (var i = 0; i < 40; i++) {
        var t = r(), x2 = Math.round(10 + t * 140), y2 = Math.round(86 - (x2 - 30) * 0.42 + (r() - 0.5) * 18);
        B.p(x2, y2, r() < 0.5 ? '#a99fe0' : '#d8d0ff');
      }
      // linhas da cruz, bem suaves
      function linha(a, b) {
        var n = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]));
        for (var k = 5; k < n - 4; k++) if (k % 3 !== 2) B.p(Math.round(a[0] + (b[0] - a[0]) * k / n), Math.round(a[1] + (b[1] - a[1]) * k / n), '#6a5fb0');
      }
      var gacrux = [78, 22], acrux = [84, 88], mimosa = [55, 51], palida = [100, 40], intrometida = [91, 60];
      linha(gacrux, acrux); linha(mimosa, palida);
      estrela(B, acrux[0], acrux[1], 4, '#cfe6ff');                     // Estrela de Magalhães (Acrux), a maior
      estrela(B, gacrux[0], gacrux[1], 3, '#ffb070', '#fff0dc');        // Rubídea (Gacrux), alaranjada
      estrela(B, mimosa[0], mimosa[1], 3, '#cfe6ff');                    // Mimosa
      estrela(B, palida[0], palida[1], 2, '#e0ecff');                    // Pálida
      estrela(B, intrometida[0], intrometida[1], 1, '#fff3c0');          // Intrometida (pequenininha)
      B.p(intrometida[0] + 1, intrometida[1], '#8f86c8');
      return [[acrux[0], acrux[1], 4, '#ffffff', 0.1], [mimosa[0], mimosa[1], 3, '#ffffff', 0.6], [gacrux[0], gacrux[1], 3, '#ffd8a8', 0.35]]
        .concat(piscantes(53, 4, function (x, y) { return Math.abs(x - 80) < 30 && y > 14 && y < 96; }));
    },
    // cometa: a cabeleira brilhante e duas caudas (a de poeira, curva e clara; a de gás, reta e azul),
    // sempre apontando para longe do Sol
    cometa: function (B) {
      ceu(B, 61, 60);
      // o Sol fica lá embaixo à esquerda, fora da lente: as caudas apontam para o alto à direita
      var nx = 50, ny = 76, dxu = 0.857, dyu = -0.514;
      var BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
      var sorte = rng(63);
      var LP = 74, LG = 88;   // até onde cada cauda chega antes de sumir de vez
      for (var y = 0; y < CH; y++) for (var x = 0; x < CW; x++) {
        if (!B.g(x, y)) continue;
        var rx = x - nx, ry = y - ny;
        var ao = rx * dxu + ry * dyu, lado = -rx * dyu + ry * dxu;
        if (ao < 2) continue;
        var limiar = (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16;
        // cauda de poeira: larga, curva (fica para trás na órbita), clarinha; afina e vira pontinhos
        var meio = 0.0055 * ao * ao, larg = 1.6 + ao * 0.2;
        var q = Math.abs(lado - meio) / larg;
        var bp = q < 1 ? 1.35 * (1 - q * q) * Math.pow(Math.max(0, 1 - ao / LP), 0.8) : 0;
        if (bp > limiar * 0.9) {
          B.p(x, y, bp > 0.8 ? '#fff6dc' : bp > 0.5 ? '#f6e0b8' : bp > 0.28 ? '#e0bfd0' : bp > 0.14 ? '#b196c8' : '#7d6aac');
        } else if (q < 1.5 && ao < LP + 12 && sorte() < 0.05 * (1 - ao / (LP + 12)) + 0.012) {
          B.p(x, y, sorte() < 0.5 ? '#d8c8e8' : '#fff0d0');   // grãozinhos de poeira soltos
        }
        // cauda de gás (íons): reta, estreita e azul, apontando exatamente para longe do Sol
        var lg = 0.9 + ao * 0.045, qg = Math.abs(lado + 1) / lg;
        var bg = qg < 1 ? 1.3 * (1 - qg * qg) * Math.pow(Math.max(0, 1 - ao / LG), 0.7) : 0;
        if (bg > limiar * 0.8) {
          B.p(x, y, bg > 0.7 ? '#dff4ff' : bg > 0.36 ? '#9fe0ff' : bg > 0.16 ? '#6fa8e8' : '#4f6fc8');
        }
      }
      // cabeleira (coma) com brilho pontilhado e o núcleo bem branco
      for (var dy = -9; dy <= 9; dy++) for (var dx = -9; dx <= 9; dx++) {
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d > 6.5 && d <= 9 && ((nx + dx + ny + dy) & 1) && (d <= 7.8 || !((nx + dx) & 1))) B.p(nx + dx, ny + dy, d <= 7.8 ? '#8fb8e8' : '#5f78c0');
      }
      discoBuf(B, nx, ny, 6, '#8fb8e8');
      discoBuf(B, nx, ny, 4, '#cfeaff');
      discoBuf(B, nx, ny, 2, '#ffffff');
      B.p(nx - 1, ny - 1, '#ffffff');
      return piscantes(62, 7, function (x, y) { var rx = x - nx, ry = y - ny; return rx * dxu + ry * dyu > -12 && Math.abs(-rx * dyu + ry * dxu) < 24; });
    },
    // galáxia espiral (como a nossa Via Láctea vista de fora), inclinadinha
    galaxia: function (B) {
      ceu(B, 71, 50, 0.55);
      var ang = -0.4, ca = Math.cos(ang), sa = Math.sin(ang), rr = rng(72);
      for (var y = 0; y < CH; y++) for (var x = 0; x < CW; x++) {
        if (!B.g(x, y)) continue;
        var dx = x - 80, dy = y - 56;
        var gx = dx * ca + dy * sa, gy = (-dx * sa + dy * ca) / 0.55;
        var r = Math.sqrt(gx * gx + gy * gy);
        if (r > 46) continue;
        var th = Math.atan2(gy, gx);
        var braco = Math.cos(2 * th - 2.4 * Math.log(r + 1));
        var b = 1.25 * Math.exp(-r / 7) + Math.max(0, braco) * 0.85 * Math.exp(-r / 30);
        var cor = b > 0.95 ? '#fff6d8' : b > 0.66 ? '#ffe0ee' : b > 0.44 ? '#e0b0ff' : b > 0.28 ? '#9a74e0' : b > 0.17 ? '#4f3f9f' : null;
        if (cor) B.p(x, y, cor);
        if (b > 0.3 && b < 0.66 && r > 10 && rr() < 0.05) B.p(x, y, rr() < 0.5 ? '#ff8ac6' : '#9fe0ff');   // estrelas novas
      }
      return piscantes(73, 7, function (x, y) { return Math.abs(x - 80) < 44 && Math.abs(y - 56) < 30; });
    },
    // Vênus pelo telescópio: tem fases, como a Lua (aqui, crescente), e brilha muito
    venus: function (B) {
      ceu(B, 81, 55);
      var T = new Buf(CW, CH), cx = 80, cy = 56, r = 26;
      haloCena(B, cx, cy, r, HALO.venus[0], HALO.venus[1]);
      for (var dy = -r; dy <= r; dy++) for (var dx = -r; dx <= r; dx++) {
        if (!dentroDisco(dx, dy, r)) continue;
        var u = dx / r, v = dy / r;
        if (u < 0.38 * Math.sqrt(Math.max(0, 1 - v * v))) continue;   // lado da noite (não aparece)
        var cor = corPlaneta('venus', u, v, r);
        if (u < 0.38 * Math.sqrt(Math.max(0, 1 - v * v)) + 0.12) cor = esc(cor, 0.18);
        T.p(cx + dx, cy + dy, cor);
      }
      T.contornar(CONTORNO); T.estampar(B);
      return piscantes(82, 7, function (x, y) { return (x - cx) * (x - cx) + (y - cy) * (y - cy) < 30 * 30; });
    },
    // as Plêiades (as Sete Estrelas), azuladas, com um véu de poeira brilhando em volta
    pleiades: function (B) {
      ceu(B, 91, 45);
      var est = [[80, 58, 4], [58, 56, 3], [56, 47, 2], [104, 50, 3], [98, 66, 3], [99, 40, 3], [110, 34, 2], [88, 44, 1], [70, 70, 1]];
      for (var y = 0; y < CH; y++) for (var x = 0; x < CW; x++) {
        if (!B.g(x, y)) continue;
        for (var i = 0; i < 6; i++) {
          var e = est[i], d = Math.sqrt((x - e[0]) * (x - e[0]) + (y - e[1]) * (y - e[1]));
          if (d < 5 + e[2] * 2) { B.p(x, y, d < 2 + e[2] ? '#34448e' : ((x + y) % 2 ? '#2b2c72' : CEU)); break; }
        }
      }
      est.forEach(function (e) { estrela(B, e[0], e[1], e[2], '#bfe0ff'); });
      return est.slice(0, 6).map(function (e, i) { return [e[0], e[1], e[2], '#ffffff', i / 6]; });
    },
  };

  // moldura redonda de luneta: anel de metal com contorno; fora dela, transparente
  function moldura(B) {
    for (var y = 0; y < CH; y++) for (var x = 0; x < CW; x++) {
      var dx = x - LX, dy = y - LY, d = Math.sqrt(dx * dx + dy * dy);
      if (d <= LR - 3) continue;
      if (d <= LR) { var k = B.g(x, y); if (k) B.p(x, y, esc(k, 0.22)); continue; }
      if (d <= LR + 1.2) { B.p(x, y, CONTORNO); continue; }
      if (d <= LR + 4) {
        var luz = (-dx - dy) / d;   // luz do alto à esquerda
        B.p(x, y, luz > 0.55 ? '#c9bfe6' : luz > -0.2 ? '#9a8cc4' : '#6f6198');
        continue;
      }
      if (d <= LR + 5.3) { B.p(x, y, CONTORNO); continue; }
      B.c[y * CW + x] = null;
    }
    // parafusinhos dourados no anel
    [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(function (p) {
      B.p(Math.round(LX + p[0] * (LR + 2.6)), Math.round(LY + p[1] * (LR + 2.6)), '#ffd34d');
    });
  }

  var cacheCena = {}, cacheAnim = {};
  function cenaEstatica(tema) {
    if (cacheCena[tema]) return cacheCena[tema];
    var B = new Buf(CW, CH);
    var pisca = TEMAS[tema](B) || [];
    // poeira cintilante (22 pontinhos) só onde ficou céu
    var sem = 0;
    for (var i = 0; i < tema.length; i++) sem = sem * 31 + tema.charCodeAt(i);
    pisca = pisca.concat(poeira(B, sem, 22));
    moldura(B);
    var c = B.canvas();
    c.piscantes = pisca;
    cacheCena[tema] = c;
    return c;
  }

  Reino.ObservatorioCenas = {
    temas: function () { return Object.keys(TEMAS); },
    // canvas 160×112 com a moldura da luneta; com t (ms), as estrelinhas piscam por cima de um
    // desenho parado cacheado (um canvas de animação por tema, reaproveitado a cada quadro)
    cena: function (tema, t) {
      if (!TEMAS[tema]) tema = 'lua';
      var fixo = cenaEstatica(tema);
      if (typeof t !== 'number' || !isFinite(t)) return fixo;
      var c = cacheAnim[tema] || (cacheAnim[tema] = window.PA.novoCanvas(CW, CH));
      var ctx = c.getContext('2d');
      ctx.clearRect(0, 0, CW, CH);
      ctx.drawImage(fixo, 0, 0);
      fixo.piscantes.forEach(function (s, i) {
        // poeira: acende e apaga, cada grão no seu ritmo, trocando de cor
        if (s[5]) {
          var fp = ((t / (700 + (i * 137) % 900)) + s[4]) % 1;
          if (fp > 0.45) return;
          ctx.fillStyle = CINTILA[Math.floor(t / 1900 + i) % 3];
          ctx.fillRect(s[0], s[1], 1, 1);
          return;
        }
        // estrela: pisca num ritmo só dela e troca de cor (branco → ciano → lilás)
        var per = 1300 + Math.floor(s[4] * 1400);
        var f = ((t / per) + s[4]) % 1;
        if (f > 0.6) return;
        var brilho = f < 0.3 ? f / 0.3 : (0.6 - f) / 0.3;   // 0 → 1 → 0
        var braco = brilho > 0.6 ? s[2] - 1 : Math.max(1, s[2] - 2);
        var cor = i % 2 ? CINTILA[Math.floor(t / (per * 1.5) + i) % 3] : s[3];
        ctx.globalAlpha = 0.45 + brilho * 0.55;
        ctx.fillStyle = cor;
        ctx.fillRect(s[0] - braco, s[1], braco * 2 + 1, 1);
        ctx.fillRect(s[0], s[1] - braco, 1, braco * 2 + 1);
        ctx.globalAlpha = 1;
        if (brilho > 0.6) { ctx.fillStyle = '#ffffff'; ctx.fillRect(s[0], s[1], 1, 1); }
      });
      return c;
    },
    // desenha o Sol, um planeta ou Plutão com o centro em (cx, cy), raio em px do jogo (4 a 20 ficam bonitos).
    // Os pixels são pintados uma vez por id e raio (cache) e depois só copiados.
    desenharPlaneta: function (ctx, id, cx, cy, raio) {
      var s = spritePlaneta(id, raio);
      ctx.drawImage(s.c, Math.round(cx) - s.ox, Math.round(cy) - s.oy);
    },
  };

  // para as outras partes (Reino._predios.observatorioCenas)
  S.BAYER4 = BAYER4; S.CINTILA = CINTILA;
})();
