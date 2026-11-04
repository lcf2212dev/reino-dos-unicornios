/* Casa do jogador: poses banho (ela na banheira), chuveiro (ela ou o unicórnio) e cozinhar (ela ao lado do fogão,
   panela com vapor) — Reino._casaUsos.poses; docs/contratos/casa.md §13. Ver o cabeçalho de casa-usos-animar.js.
   O banho do unicórnio na banheira é do Reino.Banho (banho.js), não daqui. Tabelas em px da pegada, por lado do
   desenho ('baixo', 'cima', 'lado' = virado para a esquerda; 'dir' sai espelhado). Nada roda no carregamento. */
(function () {
  var R = window.Reino;
  var I = R._casaUsos, H = I.H;
  var K = '#3a2446', BRANCO = '#ffffff', AGUA = '#5fc8e8', AGUA2 = '#a8ecff', AGUA3 = '#2f9ec4';

  /* ---------- banho dela na banheira ----------
     [x do meio dela, linha da água (ela aparece só acima), vista ('lado': olha para a torneira)] */
  var BANHEIRAS = {
    'casa-banheiro-banheira': { baixo: [16, 25, 'frente'], cima: [16, 15, 'frente'], lado: [15, 13, 'diagFrente'] },
  };
  // espuma em volta dela na linha da água: [dx, dy, raio]; as de trás (dy < 0) antes dela
  var ESPUMA = [[-9, 0, 3], [-5, 1, 2], [5, 1, 2], [9, 0, 3], [-12, -1, 2], [12, -1, 2], [0, 2, 2], [-3, -2, 2], [4, -2, 2]];

  I.poses.banho = {
    sons: [[0.06, 'splash'], [0.2, 'bolhas'], [0.55, 'bolhas'], [0.86, 'estrela']],
    geo: function (st) {
      var o = st.obj, tab = BANHEIRAS[o.tipo] || { baixo: [(o.w || 1) * 8, (o.h || 1) * 8, 'frente'] };
      var pt = H.ponto(o, tab), vista = pt.v[2], esp = vista !== 'frente' && o.dir === 'dir';
      var linha = Math.round(pt.y);
      return { x: Math.round(pt.x), linha: linha, yPes: linha + 8, vista: vista, espelhar: esp,
        de: { x: Math.round(Jogador.x), y: Math.round(Jogador.y) }, uni: H.ondeUni(), yItem: H.base(o) + 0.5 };
    },
    itens: function (p, st, e, animar) {
      var g = st.geo, f = H.fase(st, e, animar), s = e / st.dur;
      return [H.itemUniParado(p, st, g.uni), { y: g.yItem, desenhar: function () {
        if (f.nome !== 'la') return pulinho(p, g, f, { x: g.x, y: g.yPes }, g.linha);
        var esp = animar ? H.suave(H.trecho(s, 0.06, 0.22)) : 1;
        espuma(p, g, esp, true);
        H.acima(p, g.linha, function () { H.sprite(p, H.ela(false, g.vista).canvas, g.x, g.yPes + 1, g.espelhar); });
        espuma(p, g, esp, false);
        if (animar) bolhasSubindo(p, g.x, g.linha, e, s);
      } }];
    },
    sobre: function (p, st, e, animar) {
      var s = e / st.dur, g = st.geo;
      if (!animar || (s >= 0.84 && s < 0.93)) H.brilhos(p, g.x, g.linha + 2, 14, e, animar, H.trecho(s, 0.84, 0.9));
    },
  };
  // pulinho para dentro (e para fora): em pé; perto do alvo, já cortado na linha (da água ou do box)
  function pulinho(p, g, f, alvo, linha) {
    var k = f.nome === 'ida' ? f.k : 1 - f.k, pos = H.arco(g.de, alvo, k, 12), v = H.vista(alvo.x - g.de.x, alvo.y - g.de.y);
    var fn = function () { H.sprite(p, H.ela(false, v.vista).canvas, pos.x, pos.y + 1, v.espelhar); };
    if (linha !== null && k > 0.6) H.acima(p, linha, fn); else fn();
  }
  function espuma(p, g, f, deTras) {
    if (f <= 0) return;
    ESPUMA.forEach(function (b) {
      if ((b[1] < 0) !== deTras) return;
      var r = Math.round(b[2] * f);
      if (r >= 1) p.sprite(H.bolha(r), g.x + b[0] + 0.5, g.linha + b[1] + r + 1);
    });
  }
  // bolhinhas que sobem dos lados e estouram em brilho
  function bolhasSubindo(p, x, linha, e, s) {
    if (s < 0.15 || s > 0.84) return;
    for (var k = 0; k < 3; k++) {
      var c = (e / 1400 + k / 3) % 1, bx = Math.round(x + [-11, 10, -6][k] + Math.sin(e / 300 + k)), by = Math.round(linha - 3 - c * 14);
      if (c < 0.8) p.sprite(H.bolha(1), bx + 0.5, by + 2);
      else if (c < 0.92) H.brilho(p, bx, by, 1, BRANCO);
    }
  }

  /* ---------- chuveiro (2×2, uma direção): ela ou o unicórnio debaixo da água ----------
     o lugar de quem toma banho e de onde a água cai, em px da pegada */
  var CHUVEIROS = { 'casa-movel-chuveiro': { pe: [16, 27], agua: [9, 23, -12] } };
  I.poses.chuveiro = {
    sons: [[0.06, 'chuveiro'], [0.4, 'chuveiro'], [0.86, 'estrela']],
    geo: function (st) {
      var o = st.obj, c = CHUVEIROS[o.tipo] || { pe: [(o.w || 1) * 8, (o.h || 1) * 16 - 5], agua: [(o.w || 1) * 8 - 7, (o.w || 1) * 8 + 7, -12] };
      var px = o.x * 16, py = o.y * 16, de = H.ondeUni();
      return { x: px + c.pe[0], y: py + c.pe[1], x0: px + c.agua[0], x1: px + c.agua[1], topo: py + c.agua[2],
        de: st.quem === 'uni' ? { x: Math.round(de.x), y: Math.round(de.y), vista: de.vista, espelhar: de.espelhar } : { x: Math.round(Jogador.x), y: Math.round(Jogador.y) },
        uni: de, yItem: H.base(o) - 0.5 };
    },
    itens: function (p, st, e, animar) {
      var g = st.geo, f = H.fase(st, e, animar), s = e / st.dur, lista = [];
      if (st.quem !== 'uni') lista.push(H.itemUniParado(p, st, g.uni));
      lista.push({ y: g.yItem, desenhar: function () {
        var k = f.nome === 'ida' ? f.k : f.nome === 'volta' ? 1 - f.k : 1, pos = H.arco(g.de, g, k, 12);
        var v = k >= 1 ? { vista: 'frente', espelhar: false } : H.vista(g.x - g.de.x, g.y - g.de.y);
        if (k >= 1) H.sombra(p, g.x, g.y, st.quem === 'uni' ? 8 : 5);
        if (st.quem === 'uni') {
          var spr = H.uni(st, v.vista, false);
          H.sprite(p, H.sujo(st, spr.canvas), pos.x, pos.y + 1, v.espelhar);
        } else H.sprite(p, H.ela(false, v.vista).canvas, pos.x, pos.y + 1, v.espelhar);
        if (k >= 1) agua(p, g, e, s, animar, st.quem === 'uni' ? 24 : 18);
      } });
      return lista;
    },
    sobre: function (p, st, e, animar) {
      var s = e / st.dur, g = st.geo;
      if (!animar || (s >= 0.84 && s < 0.93)) H.brilhos(p, g.x, g.y, st.quem === 'uni' ? 22 : 17, e, animar, H.trecho(s, 0.84, 0.9));
    },
  };
  // a água: fios que caem do chuveiro até o chão (na frente de quem está embaixo) e respingos no chão; para no fim
  function agua(p, g, e, s, animar, alto) {
    if (animar && s > 0.84) return;
    var len = g.y - g.topo, n = g.x1 - g.x0;
    for (var q = 0; q <= n; q += 2) {
      var fq = animar ? (e / 260 + q * 0.37) % 1 : (q * 0.37) % 1, col = g.x0 + q;
      p.ret(col, Math.round(g.topo + fq * len), 1, 3, q % 4 ? AGUA2 : AGUA);
      p.ret(col, Math.round(g.topo + ((fq + 0.5) % 1) * len), 1, 2, q % 3 ? AGUA2 : BRANCO);
    }
    // gotinhas que pulam da cabeça e do chão
    for (var i = 0; i < 6; i++) {
      var c = animar ? (e / 500 + i / 6) % 1 : 0.4, lado = i % 2 ? 1 : -1;
      var base = i < 3 ? g.y - alto : g.y;
      p.ret(Math.round(g.x + lado * (4 + c * 7 + i)), Math.round(base - 3 * Math.sin(c * Math.PI)), 1, 1, i % 3 ? AGUA2 : AGUA3);
    }
  }

  /* ---------- cozinhar: ela ao lado do fogão, panela com vapor ----------
     [x do meio da panela, y da base dela] no tampo do fogão */
  var FOGOES = { 'casa-cozinha-fogao': { baixo: [8, -2], cima: [8, -4], lado: [6, -1] } };
  var PANELA = [
    'kkkkkkkkkkk',
    'kssSsssSssk',
    'kkkkkkkkkkk',
    'kkmMmmmmmkk',
    '.kmMmmmmgk.',
    '.kmmmmmmgk.',
    '..kkkkkkk..',
  ];
  I.poses.cozinhar = {
    sons: [[0.08, 'toque'], [0.3, 'bolhas'], [0.65, 'bolhas'], [0.9, 'plim']],
    geo: function (st) {
      var o = st.obj, pt = H.ponto(o, FOGOES[o.tipo] || { baixo: [(o.w || 1) * 8, -2] }), c = H.centro(o), J = Jogador;
      var v = H.vista(c.x - J.x, c.y - J.y), uni = H.ondeUni();
      if (st.montado) {
        // montada, ela desce ao lado do fogão e o unicórnio dá um passo para o lado (para trás dela, nunca na frente)
        var dx = J.x - c.x, dy = J.y - c.y, d = Math.hypot(dx, dy) || 1, lx = -dy / d, ly = dx / d;
        if (ly > 0 || (ly === 0 && lx < 0)) { lx = -lx; ly = -ly; }
        uni = { x: Math.round(J.x + lx * 16 + dx / d * 3), y: Math.round(J.y + ly * 16 + dy / d * 3), vista: v.vista, espelhar: v.espelhar };
      }
      return { panela: { x: Math.round(pt.x), y: Math.round(pt.y) }, ela: { x: Math.round(J.x), y: Math.round(J.y), vista: v.vista, espelhar: v.espelhar },
        uni: uni, yItem: H.base(o) - 0.5 };
    },
    itens: function (p, st, e, animar) {
      var g = st.geo, s = e / st.dur;
      return [
        H.itemUniParado(p, st, g.uni),
        { y: g.ela.y, desenhar: function () { H.elaEmPe(p, g.ela.x, g.ela.y, g.ela.vista, g.ela.espelhar); } },
        { y: g.yItem, desenhar: function () { panela(p, g.panela, e, s, animar); } },
      ];
    },
  };
  function panela(p, pt, e, s, animar) {
    var img = H.matriz('casa-panela', PANELA, { k: K, s: '#ffb35c', S: '#ffe0a0', m: '#d9e2ee', M: BRANCO, g: '#9aa7ba' });
    var cai = animar ? Math.round((1 - H.suave(H.trecho(s, 0, 0.08))) * 4) : 0;   // ela põe a panela no fogo
    p.sprite(img, pt.x + 0.5, pt.y - cai);
    var topo = pt.y - img.height;
    // a colher mexendo a sopa
    var cx = pt.x + (animar ? Math.round(Math.sin(e / 260) * 2) : 1);
    p.ret(cx, topo - 5, 2, 6, K); p.ret(cx, topo - 4, 1, 4, '#d99a5b');
    // vapor: fiapos que sobem, balançam e somem (encolhem)
    if (animar && s < 0.12) return;
    for (var i = 0; i < 5; i++) {
      var c = animar ? (e / 1500 + i / 5) % 1 : [0.15, 0.5, 0.75, 0.3, 0.6][i], tam = c < 0.35 ? 3 : c < 0.7 ? 2 : 1;
      if (c > 0.92) continue;
      var vx = Math.round(pt.x - 5 + (i % 3) * 4 + Math.sin(c * 7 + i) * 2), vy = Math.round(topo - 3 - c * 18);
      p.ret(vx, vy, tam, tam, i % 2 ? BRANCO : '#e8eef8');
      if (tam === 3) p.ret(vx + 1, vy - 1, 1, 1, BRANCO);
    }
  }
})();
