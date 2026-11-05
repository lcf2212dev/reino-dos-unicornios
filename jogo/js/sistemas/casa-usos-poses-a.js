/* Casa do jogador: poses sentar e deitar (Reino._casaUsos.poses; docs/contratos/casa.md §13). Ver o cabeçalho de
   casa-usos-animar.js. As tabelas dão, por móvel e por lado do desenho ('baixo', 'cima', 'lado' = virado para a
   esquerda; 'dir' sai espelhado), o lugar em px da pegada, lido dos desenhos em js/interiores/casa/moveis-*.js.
   Sentada: PA.mariana(ap, true): de frente no 'baixo', de costas no 'cima' (cortada no encosto), de lado no 'lado'.
   Deitada: a cabeça no travesseiro e a coberta por cima (o corpo girado com a cama). Unicórnio deitado: a pose cansada
   (olhos meio fechados) recortada nas patas, respirando, com "Zzz". Nada roda no carregamento. */
(function () {
  var R = window.Reino;
  var I = R._casaUsos, H = I.H;
  var K = '#3a2446', BRANCO = '#ffffff';

  /* ---------- sentar (ela) ----------
     [x do meio, y dos pés da sentada, linha do encosto (só 'cima': ela aparece só acima dela)] */
  var ASSENTOS = {
    'casa-estar-sofa': { baixo: [24, 22], cima: [24, 7, 4], lado: [13, 27] },
    'casa-estar-poltrona': { baixo: [8, 12], cima: [8, 2, -1], lado: [5, 10] },
    'casa-jantar-cadeira': { baixo: [8, 9], cima: [8, 0, -8], lado: [6, 8] },
    'casa-quarto-jogador-cadeira': { baixo: [8, 10], cima: [8, 1, -8], lado: [6, 9] },
    'casa-cozinha-banquinho': { baixo: [8, 8] },
    'casa-movel-pufe': { baixo: [8, 6] },
    'casa-movel-banco': { baixo: [16, 7], lado: [8, 14] },
    'casa-movel-banco-banho': { baixo: [8, 3], lado: [8, 3] },
  };
  function tabelaOuMeio(tab, obj) {
    if (tab) return tab;
    var w = (obj.w || 1) * 16, h = (obj.h || 1) * 16;
    return { baixo: [w / 2, h / 2 + 4] };
  }
  // vista da sentada: de frente, de costas ou de lado (o desenho 'lado' do móvel olha para a esquerda)
  function vistaDoMovel(obj) {
    var l = H.lado(obj);
    return l === 'baixo' ? { vista: 'frente', espelhar: false } : l === 'cima' ? { vista: 'costas', espelhar: false }
      : { vista: 'lado', espelhar: obj.dir !== 'dir' };
  }

  I.poses.sentar = {
    sons: [[0.93, 'toque']],
    geo: function (st) {
      var pt = H.ponto(st.obj, tabelaOuMeio(ASSENTOS[st.obj.tipo], st.obj));
      var v = vistaDoMovel(st.obj);
      return { x: Math.round(pt.x), y: Math.round(pt.y), corte: pt.v[2] !== undefined ? st.obj.y * 16 + pt.v[2] : null,
        vista: v.vista, espelhar: v.espelhar, de: { x: Math.round(Jogador.x), y: Math.round(Jogador.y) },
        uni: H.ondeUni(), yItem: H.base(st.obj) + 0.5 };
    },
    itens: function (p, st, e, animar) {
      var g = st.geo, f = H.fase(st, e, animar);
      return [H.itemUniParado(p, st, g.uni), { y: g.yItem, desenhar: function () { desenharSentada(p, g, f); } }];
    },
  };
  function desenharSentada(p, g, f) {
    if (f.nome !== 'la') {
      // pulinho até o assento (e de volta), em pé; perto do assento já entra atrás do encosto
      var k = f.nome === 'ida' ? f.k : 1 - f.k;
      var pos = H.arco(g.de, { x: g.x, y: g.y - 2 }, k, 8), v = H.vista(g.x - g.de.x, g.y - g.de.y);
      var fn = function () { H.sprite(p, H.ela(false, v.vista).canvas, pos.x, pos.y + 1, v.espelhar); };
      if (g.corte !== null && k > 0.6) H.acima(p, g.corte, fn); else fn();
      return;
    }
    var img = H.ela(true, g.vista).canvas;
    var fn2 = function () { H.sprite(p, img, g.x, g.y, g.espelhar); };
    if (g.corte !== null) H.acima(p, g.corte, fn2); else fn2();
  }

  /* ---------- deitar ----------
     ela: [x, y do meio da cabeça no travesseiro, linha da cabeceira da frente (só 'cima')] e a cor da coberta;
     o unicórnio: [x, y do meio dele deitado] e a vista ('lado' olha para o travesseiro) */
  var CAMAS = {
    'casa-quarto-jogador-cama': { ela: { baixo: [16, 10], cima: [16, 28, 31], lado: [36, 13] }, coberta: ['#c9a8ff', '#ffd84d'],
      uni: { baixo: [16, 19, 'frente'], cima: [16, 22, 'frente'], lado: [22, 15, 'lado'] } },
    'casa-movel-cama-dossel': { ela: { baixo: [16, 10], cima: [16, 28, 33], lado: [36, 14] }, coberta: ['#ff8fc4', BRANCO],
      uni: { baixo: [16, 19, 'frente'], cima: [16, 21, 'frente'], lado: [21, 15, 'lado'] } },
    'casa-movel-beliche': { ela: { baixo: [16, 15], cima: [16, 28, 34], lado: [39, 10] }, coberta: ['#ff8fc4', BRANCO],
      uni: { baixo: [16, 27, 'frente'], cima: [16, 20, 'frente'], lado: [20, 13, 'lado'] } },
    'casa-movel-cama-foguete': { ela: { baixo: [16, 13], cima: [16, 27, 33], lado: [34, 14] }, coberta: ['#2b3a7a', '#ffd84d'],
      uni: { baixo: [16, 22, 'frente'], cima: [16, 21, 'frente'], lado: [21, 15, 'lado'] } },
    'casa-quarto-uni-almofadao': { uni: { baixo: [24, 14, 'lado'], lado: [16, 22, 'frente'] } },
    'casa-movel-caminha-nuvem': { uni: { baixo: [16, 13, 'lado'], lado: [20, 15, 'lado'] } },
  };
  // quartos de volta (horário) do corpo deitado: cabeça para cima ('baixo'), para baixo ('cima'), para o lado do travesseiro
  function quartos(obj) { var l = H.lado(obj); return l === 'baixo' ? 0 : l === 'cima' ? 2 : obj.dir === 'dir' ? 3 : 1; }

  I.poses.deitar = {
    sons: [[0.2, 'respira'], [0.93, 'toque']],
    geo: function (st) {
      var c = CAMAS[st.obj.tipo] || {}, de = H.ondeUni(), g = { yItem: H.base(st.obj) + 0.5 };
      if (st.quem === 'uni') {
        var tab = c.uni || { baixo: [(st.obj.w || 1) * 8, (st.obj.h || 1) * 8, 'lado'] };
        var pu = H.ponto(st.obj, tab), vu = pu.v[2];
        // de lado ele olha para o travesseiro (à direita no 'esq'; o 'dir' sai espelhado)
        g.uni = { x: Math.round(pu.x), y: Math.round(pu.y), vista: vu, espelhar: vu === 'lado' && st.obj.dir === 'dir' };
        g.de = { x: Math.round(de.x), y: Math.round(de.y), vista: de.vista, espelhar: de.espelhar };
        return g;
      }
      var tabE = c.ela || { baixo: [(st.obj.w || 1) * 8, 10] };
      var pe = H.ponto(st.obj, tabE);
      g.cabeca = { x: Math.round(pe.x), y: Math.round(pe.y) };
      g.corte = pe.v[2] !== undefined ? st.obj.y * 16 + pe.v[2] : null;
      g.q = quartos(st.obj);
      g.coberta = c.coberta || ['#c9a8ff', null];
      g.de = { x: Math.round(Jogador.x), y: Math.round(Jogador.y) };
      g.uni = de;
      return g;
    },
    itens: function (p, st, e, animar) {
      var g = st.geo, f = H.fase(st, e, animar);
      if (st.quem === 'uni') return [{ y: f.nome === 'la' ? g.yItem : Math.max(g.de.y, g.uni.y), desenhar: function () { uniDeitado(p, st, e, f, animar); } }];
      return [H.itemUniParado(p, st, g.uni), { y: g.yItem, desenhar: function () { elaDeitada(p, st, f); } }];
    },
    // "Zzz" por cima de tudo, saindo da cabeça de quem dorme
    sobre: function (p, st, e, animar) {
      var g = st.geo, f = H.fase(st, e, animar);
      if (f.nome !== 'la') return;
      var z;
      if (st.quem === 'uni') {
        var spr = recortado(st, g.uni.vista), lado = g.uni.vista === 'lado' ? (g.uni.espelhar ? -1 : 1) : 0;
        z = { x: g.uni.x + lado * Math.round(spr.width * 0.3) + 3, y: g.uni.y - Math.round(spr.height / 2) - 2 };
      } else z = { x: g.cabeca.x + 6, y: g.cabeca.y - 6 };
      zzz(p, z.x, z.y, e, animar);
    },
  };

  /* ela deitada: a cabeça (o desenho de frente, em pé) em cima e a coberta por cima do corpo, de pé num canvas
     17 × 30 (cabeça para cima), girado com a cama. Feito uma vez por aparência e cor. */
  var DW = 17, DH = 30, CAB = { x: 8.5, y: 5.5 }, compostas = new WeakMap();
  function composta(cor) {
    var ap = H.aparencia(), cabeca = H.ela(false, 'frente').canvas, m = compostas.get(cabeca) || {}, chave = cor.join('|');
    if (m[chave]) return m[chave];
    var c = PA.novoCanvas(DW, DH);
    (function (ctx) {
      ctx.drawImage(cabeca, 0, 0, cabeca.width, 11, 2, 0, cabeca.width, 11);
      function r(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }
      r(1, 9, DW - 2, DH - 9, K); r(0, 10, DW, DH - 11, K);                      // a coberta, cantos cortados
      r(1, 10, DW - 2, DH - 11, cor[0]); r(2, DH - 3, DW - 4, 1, R.Desenho.escurecer(cor[0], 0.2));
      for (var j = 15; j < DH - 3; j += 5) for (var i = 3 + (j % 10 ? 2 : 0); i < DW - 3; i += 6) if (cor[1]) r(i, j, 2, 2, cor[1]);
      r(1, 10, DW - 2, 2, BRANCO); r(1, 12, DW - 2, 1, '#e4dcff');               // a dobra do lençol
      r(4, 10, 2, 1, ap.pele); r(11, 10, 2, 1, ap.pele);                          // as mãozinhas por cima
    })(c.getContext('2d'));
    m[chave] = c; compostas.set(cabeca, m);
    return c;
  }
  // canvas girado q quartos de volta (horário), feito uma vez
  var girados = new WeakMap();
  function girado(c, q) {
    if (!q) return c;
    var m = girados.get(c) || {};
    if (!m[q]) {
      var w = q % 2 ? c.height : c.width, h = q % 2 ? c.width : c.height, n = PA.novoCanvas(w, h), ctx = n.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.translate(q === 1 ? w : q === 2 ? w : 0, q === 2 ? h : q === 3 ? h : 0);
      ctx.rotate(q * Math.PI / 2);
      ctx.drawImage(c, 0, 0);
      m[q] = n; girados.set(c, m);
    }
    return m[q];
  }
  // onde fica o meio da cabeça depois de girar
  function cabecaGirada(q) {
    if (q === 1) return { x: DH - CAB.y, y: CAB.x };
    if (q === 2) return { x: DW - CAB.x, y: DH - CAB.y };
    if (q === 3) return { x: CAB.y, y: DW - CAB.x };
    return CAB;
  }
  function elaDeitada(p, st, f) {
    var g = st.geo;
    if (f.nome !== 'la') {
      var k = f.nome === 'ida' ? f.k : 1 - f.k, alvo = { x: g.cabeca.x, y: g.cabeca.y + 8 };
      var pos = H.arco(g.de, alvo, k, 10), v = H.vista(alvo.x - g.de.x, alvo.y - g.de.y);
      H.sprite(p, H.ela(false, v.vista).canvas, pos.x, pos.y + 1, v.espelhar);
      return;
    }
    var img = girado(composta(g.coberta), g.q), cg = cabecaGirada(g.q);
    var x0 = Math.round(g.cabeca.x - cg.x), y0 = Math.round(g.cabeca.y - cg.y);
    var fn = function () { p.sprite(img, x0 + img.width / 2, y0 + img.height); };
    if (g.corte !== null) H.acima(p, g.corte, fn); else fn();
  }

  /* o unicórnio deitado: a pose cansada recortada nas patas (a linha de baixo vira contorno), feita uma vez */
  var cortes = new WeakMap();
  function pernas(st, vista) {
    try {
      var P = R.Progresso, u = P.estado().unis[st.uniId || P.montaria()], grande = R.Unicornios.estagio(u ? u.xp : 0) >= 2;
      var m = PA._interno.UNI[grande ? 'adulto' : 'filhote'][vista];
      return Math.max(2, (m.pernas[0] || m.pernas[1]).length - 1);
    } catch (e) { return 4; }
  }
  function recortado(st, vista) {
    var src = H.sujo(st, H.uni(st, vista, true).canvas), c = cortes.get(src);
    if (c) return c;
    var h = src.height - pernas(st, vista), w = src.width;
    c = PA.novoCanvas(w, h);
    var ctx = c.getContext('2d');
    ctx.drawImage(src, 0, 0, w, h, 0, 0, w, h);
    try {
      var img = ctx.getImageData(0, h - 1, w, 1), d = img.data;
      for (var i = 0; i < w; i++) if (d[i * 4 + 3] > 0) { d[i * 4] = 0x3a; d[i * 4 + 1] = 0x24; d[i * 4 + 2] = 0x46; d[i * 4 + 3] = 255; }
      ctx.putImageData(img, 0, h - 1);
    } catch (e) {}
    cortes.set(src, c);
    return c;
  }
  function uniDeitado(p, st, e, f, animar) {
    var g = st.geo;
    if (f.nome !== 'la') {
      // pulinho até a cama (e de volta), em pé
      var k = f.nome === 'ida' ? f.k : 1 - f.k, de = { x: g.de.x, y: g.de.y };
      var alvo = { x: g.uni.x, y: g.uni.y + 6 }, pos = H.arco(de, alvo, k, 12);
      var v = k > 0.98 || k < 0.02 ? (k < 0.02 ? g.de : g.uni) : H.vista(alvo.x - de.x, alvo.y - de.y);
      var spr = H.uni(st, v.vista, false);
      if (k < 0.3) H.sombra(p, pos.x, pos.y, spr.w / 2.6);
      H.sprite(p, H.sujo(st, spr.canvas), pos.x, pos.y + 1, v.espelhar);
      return;
    }
    var img = recortado(st, g.uni.vista);
    var respira = animar ? Math.floor(e / 900) % 2 : 0;   // sobe e desce 1 px, devagar
    H.sprite(p, img, Math.round(g.uni.x - img.width / 2) + img.width / 2, Math.round(g.uni.y + img.height / 2) + respira, g.uni.espelhar);
  }

  /* "Zzz": três letras que sobem e somem, uma atrás da outra; parado, duas no lugar */
  var Z = ['kkkkkk', 'kwwwwk', 'kkkwkk', '.kwkk.', 'kwwwwk', 'kkkkkk'];
  var ZP = ['kkkkk', 'kwwwk', 'kkwkk', 'kwkkk', 'kwwwk', 'kkkkk'];
  function zzz(p, x, y, e, animar) {
    var g = H.matriz('casa-z', Z, { k: K, w: BRANCO }), pq = H.matriz('casa-zp', ZP, { k: K, w: '#e4dcff' });
    if (!animar) { p.sprite(pq, x + 3, y); p.sprite(g, x + 9, y - 9); return; }
    for (var i = 0; i < 3; i++) {
      var c = (e / 1800 + i / 3) % 1;
      if (c > 0.85) continue;
      p.sprite(c < 0.35 ? pq : g, Math.round(x + c * 9 + Math.sin(c * 6) * 1.5), Math.round(y - c * 24));
    }
  }
})();
