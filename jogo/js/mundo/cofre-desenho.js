/* O cofre da praça (Mapa.CIDADE.objetos, tipo 'cofre'): um pote de vidro num pedestal de pedra e ouro que enche
   de moedas com as moedas do bimestre (Reino.Progresso.dinheiroBimestre; cheio em Reino.config.cofre.cheio).
   O pote vazio (sombra, pedestal com "COFRE", vidro, tampa com a fenda e a moeda) vai no estático do mapa
   (I.OBJETOS.cofre, a tabela de mundo/cidade-desenho.js). O que muda vem por cima, numa camada (módulo 'cofre'):
   a auréola dourada (fora do desenho do pote, em 2 degraus que pulsam), as moedas até a altura certa, o número na
   plaquinha e os brilhinhos. A imagem da camada só se refaz quando as moedas mudam (EVENTOS.PROGRESSO,
   PROGRESSO_REMOTO e MAPA_MUDOU marcam para reler). Sem Animações: tudo parado.
   Toque: Mapa.alvoObjeto(wx, wy) e Mapa.alvoObjetoPerto(tile) (lidos pelo mapa em motor/cena.js) abrem
   Reino.UI.telaCofre (ui/cofre.js). Entrega Reino.Cofre = { moedas(), fracao(), canvas(moedas) } (o pote para a tela). */
(function () {
  var Mapa = window.Mapa, I = Mapa._interno, D = window.Reino.Desenho;
  var T = Mapa.T, ret = I.ret, elipse = I.elipse, K = I.C.contorno;
  var CC = I.CIDADE_CORES;
  var OURO = '#ffd34d', OURO2 = '#fff4a0', OURO3 = '#e0a020', OURO4 = '#b8780e', MARROM = '#8a5200', BRANCO = '#ffffff';

  /* ----- a forma do pote: meia-largura de cada fileira, de cima (a boca) para baixo ----- */
  var JARRO = [10, 10, 10, 10, 10, 10, 12, 14, 15];
  for (var n = 0; n < 32; n++) JARRO.push(16);
  JARRO.push(15, 14);
  var TOPO_JARRO = -60;          // fileira da boca, contada da base (b); o fundo do pote fica em b - 18
  var TAMPA = [9, 12, 13, 13, 13, 12, 9], TOPO_TAMPA = -66;
  // miolo de cada fileira (a regra da elipse contornada: fecha o degrau até a vizinha)
  function miolo(lista, j) {
    if (j <= 0 || j >= lista.length - 1) return -1;
    return Math.min(lista[j] - 1, lista[j - 1], lista[j + 1]);
  }
  // forma com contorno K; corDe(x, y, u) pinta o miolo (u = -1 na parede esquerda a 1 na direita)
  function forma(ctx, cx, y0, lista, corDe) {
    lista.forEach(function (a, j) {
      ret(ctx, cx - a, y0 + j, a * 2 + 1, 1, K);
      var d = miolo(lista, j);
      for (var x = -d; x <= d; x++) ret(ctx, cx + x, y0 + j, 1, 1, corDe(cx + x, y0 + j, d ? x / d : 0, j));
    });
  }

  /* ----- letras e algarismos 3×5 (a plaquinha e a faixa) ----- */
  var LETRAS = {
    0: '111101101101111', 1: '010110010010111', 2: '111001111100111', 3: '111001011001111', 4: '101101111001001',
    5: '111100111001111', 6: '111100111101111', 7: '111001001010010', 8: '111101111101111', 9: '111101111001111',
    '/': '001001010100100', C: '111100100100111', O: '111101101101111', F: '111100110100100', R: '110101110101101',
    E: '111100110100111',
  };
  function escrever(ctx, x, y, texto, cor) {
    String(texto).split('').forEach(function (ch, i) {
      var m = LETRAS[ch] || '';
      for (var k = 0; k < m.length; k++) if (m[k] === '1') ret(ctx, x + i * 4 + (k % 3), y + Math.floor(k / 3), 1, 1, cor);
    });
  }
  function larguraTexto(texto) { return String(texto).length * 4 - 1; }

  /* ----- o pote vazio (estático): cx = coluna do meio, b = última fileira do pedestal ----- */
  function desenharPote(ctx, cx, b) {
    // sombra de chão (2 níveis)
    elipse(ctx, cx, b + 1, 24, 3, 'rgba(58,36,70,0.15)'); elipse(ctx, cx, b, 20, 2, 'rgba(58,36,70,0.12)');
    // degrau de baixo: pedra com tachas de ouro e a plaquinha do número (o número vem pela camada)
    ret(ctx, cx - 21, b - 10, 43, 11, K); ret(ctx, cx - 20, b - 9, 41, 9, CC.PEDRA2);
    ret(ctx, cx - 20, b - 9, 41, 1, CC.PEDRA); ret(ctx, cx - 20, b - 9, 1, 8, CC.PEDRA); ret(ctx, cx - 20, b - 1, 41, 1, CC.PEDRA3);
    [-18, 16].forEach(function (dx) { ret(ctx, cx + dx, b - 6, 3, 3, OURO3); ret(ctx, cx + dx, b - 6, 2, 2, OURO); ret(ctx, cx + dx, b - 6, 1, 1, BRANCO); });
    plaquinha(ctx, cx, b);
    // degrau de cima: faixa de ouro com "COFRE"
    ret(ctx, cx - 17, b - 18, 35, 9, K); ret(ctx, cx - 16, b - 17, 33, 7, OURO);
    ret(ctx, cx - 16, b - 17, 33, 1, OURO2); ret(ctx, cx - 16, b - 11, 33, 1, OURO3); ret(ctx, cx - 16, b - 17, 1, 7, OURO2);
    escrever(ctx, cx - 9, b - 16, 'COFRE', MARROM);
    // o pote de vidro: azul-claro no meio, mais fundo nas paredes
    forma(ctx, cx, b + TOPO_JARRO, JARRO, function (x, y, u) {
      return Math.abs(u) > 0.82 ? '#b9e0f2' : (u > 0.45 ? '#d2eefa' : '#e6f7ff');
    });
    reflexo(ctx, cx, b, null);
    // a tampa de ouro (uma moeda grande), com a fenda e uma moeda entrando nela
    forma(ctx, cx, b + TOPO_TAMPA, TAMPA, function (x, y, u, j) {
      if (j >= 4) return u < -0.6 ? OURO : OURO3;
      return u < -0.5 && j === 1 ? OURO2 : OURO;
    });
    ret(ctx, cx - 10, b + TOPO_TAMPA + 1, 6, 1, OURO2);
    ret(ctx, cx - 5, b + TOPO_TAMPA + 2, 11, 1, K); ret(ctx, cx - 4, b + TOPO_TAMPA + 3, 9, 1, MARROM);
    var MOEDA = [1, 2, 3, 3, 3, 3, 3];
    forma(ctx, cx, b + TOPO_TAMPA - 6, MOEDA, function (x, y, u, j) {
      return Math.abs(u) > 0.5 || j === 1 ? (u < 0 && j < 3 ? OURO2 : OURO3) : OURO;
    });
    ret(ctx, cx - 1, b + TOPO_TAMPA - 4, 1, 1, BRANCO);
    ret(ctx, cx - 3, b + TOPO_TAMPA + 1, 7, 1, K);   // a moeda some dentro da fenda
  }
  // reflexo do vidro: faixa clara à esquerda e um risco à direita (sobre as moedas, um ouro claro)
  function reflexo(ctx, cx, b, nivelY) {
    var y0 = b + TOPO_JARRO;
    function risco(x, de, ate) {
      for (var y = de; y < ate; y++) ret(ctx, x, y0 + y, 1, 1, nivelY !== null && y0 + y >= nivelY ? '#fff8d8' : BRANCO);
    }
    risco(cx - 12, 11, 34); risco(cx - 11, 13, 22); risco(cx - 8, 3, 6); risco(cx + 12, 14, 19);
  }
  function plaquinha(ctx, cx, b) { ret(ctx, cx - 16, b - 9, 33, 9, K); ret(ctx, cx - 15, b - 8, 31, 7, '#fff8e4'); ret(ctx, cx - 15, b - 8, 31, 1, BRANCO); }

  /* ----- as moedas dentro do pote (camada) ----- */
  function moedasDe() { try { return Math.max(0, Reino.Progresso.dinheiroBimestre() || 0); } catch (e) { return 0; } }
  function cheio() { return (Reino.config.cofre && Reino.config.cofre.cheio) || 300; }
  function fracaoDe(m) { return Math.min(1, m / cheio()); }
  // fileiras do miolo do pote, de baixo para cima: [{ y, d }]
  var FILEIRAS = [];
  for (var j = JARRO.length - 2; j >= 1; j--) FILEIRAS.push({ j: j, d: miolo(JARRO, j) });
  function desenharMoedas(ctx, cx, b, m) {
    var f = fracaoDe(m), total = FILEIRAS.length;
    var nivel = m <= 0 ? 0 : (f >= 1 ? total : Math.max(3, Math.min(total - 2, Math.round(f * total))));
    var nivelY = null;
    FILEIRAS.forEach(function (fi, h) {
      var y = b + TOPO_JARRO + fi.j;
      for (var x = -fi.d; x <= fi.d; x++) {
        // monte em degraus (cheio: reto até a boca)
        var topo = f >= 1 ? nivel : nivel + degrau(x);
        if (h >= topo) continue;
        if (nivelY === null || y < nivelY) nivelY = y;
        ret(ctx, cx + x, y, 1, 1, corMoeda(x, h, topo, fi.d));
      }
    });
    if (nivel) reflexo(ctx, cx, b, nivelY);
    // o número na plaquinha: "30/300" (só o número, se não couber)
    plaquinha(ctx, cx, b);
    var texto = Math.round(m) + '/' + cheio();
    if (larguraTexto(texto) > 29) texto = String(Math.round(m));
    escrever(ctx, cx - Math.floor(larguraTexto(texto) / 2), b - 7, texto, K);
  }
  // pilha de moedas deitadas, de lado: cada moeda tem 5 px (beiradas escuras, luz em cima) e 3 fileiras; as
  // fileiras se desencontram e umas poucas brilham
  function corMoeda(x, h, topo, d) {
    var faixa = Math.floor(h / 3), r = h % 3, beira = Math.abs(x) >= d - 1;
    var col = (x + 40 + Math.floor(D.sorte(faixa, 3, 41) * 6)) % 6;
    if (col === 0) return h === topo - 1 ? OURO3 : OURO4;          // o vão entre duas moedas
    var ponta = col === 1 || col === 5;
    if (h === topo - 1 || r === 2) return ponta ? OURO3 : (D.sorte(x + 40, faixa, 37) < 0.1 ? BRANCO : OURO2);
    if (r === 0) return ponta ? OURO4 : '#c98a1a';
    return beira || ponta ? '#f0b830' : OURO;
  }
  // o topo do monte em degraus: o meio mais alto, as beiradas mais baixas, e um dente aqui e ali
  var DENTES = [0, 0, 1, 0, -1, 0, 1, 1, 0, 0, -1, 0];
  function degrau(x) {
    var ax = Math.abs(x);
    return (ax < 5 ? 2 : ax < 10 ? 1 : 0) + DENTES[Math.floor((x + 40) / 3) % DENTES.length] - 1;
  }

  /* ----- auréola: brilho em volta do desenho, por distância ao pote (fora dele) ----- */
  var LARG = 61, ALT = 92, MEIO = 30, BASE = 86;   // a imagem da camada: o pote com cx = MEIO e b = BASE
  var mascara = null;
  function lerMascara() {
    if (mascara) return mascara;
    var c = PA.novoCanvas(LARG, ALT), cx = c.getContext('2d');
    desenharPote(cx, MEIO, BASE);
    var d = cx.getImageData(0, 0, LARG, ALT).data;
    mascara = new Uint8Array(LARG * ALT);
    for (var i = 0; i < LARG * ALT; i++) mascara[i] = d[i * 4 + 3] === 255 ? 1 : 0;
    return mascara;
  }
  // degraus: 1 = anel claro colado; 2 = xadrez; 3 = pontilhado ralo. Cheio: um degrau a mais e mais claro
  var AURA = { normal: ['#ffe066', OURO, '#ffb020'], cheio: [BRANCO, '#ffe066', OURO, '#ffb020'] };
  function desenharAura(ctx, ate, cheioJa) {
    var mk = lerMascara(), cores = cheioJa ? AURA.cheio : AURA.normal;
    for (var y = 0; y < BASE - 11; y++) for (var x = 0; x < LARG; x++) {
      if (mk[y * LARG + x]) continue;
      var dist = 9;
      for (var dy = -ate; dy <= ate && dist > 1; dy++) for (var dx = -ate; dx <= ate; dx++) {
        var xx = x + dx, yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= LARG || yy >= ALT || !mk[yy * LARG + xx]) continue;
        dist = Math.min(dist, Math.max(Math.abs(dx), Math.abs(dy)));
      }
      if (dist > ate) continue;
      if (dist === 2 && (x + y) % 2) continue;
      if (dist >= 3 && (x % 2 || y % 2)) continue;
      ret(ctx, x, y, 1, 1, cores[Math.min(dist, cores.length) - 1]);
    }
  }
  // confete parado em volta do pote cheio (a festa parada)
  var CONFETE = [[-24, -70], [22, -76], [-27, -44], [26, -50], [-20, -82], [17, -84], [27, -30], [-28, -24]];
  function desenharConfete(ctx, cx, b) {
    var cores = (Reino.config.paleta && Reino.config.paleta.confete) || [OURO];
    CONFETE.forEach(function (p, i) { ret(ctx, cx + p[0], b + p[1], i % 3 ? 2 : 1, 2, cores[i % cores.length]); });
  }

  /* ----- brilhinhos: estrelinhas que acendem em degraus (parados: 3 acesos) ----- */
  var BRILHOS = [[-22, -50, 0], [21, -38, 1], [-19, -26, 2], [22, -62, 3], [-15, -72, 1], [14, -74, 2], [0, -82, 0]];
  function desenharBrilhos(r, cx, b, t, animar, cheioJa) {
    BRILHOS.forEach(function (s, i) {
      if (!cheioJa && i > 4) return;
      var passo = animar ? (Math.floor(t / 300) + s[2] * 2 + i) % 6 : (cheioJa ? 2 + (i % 2) : (i < 3 ? 2 : 0));
      var x = cx + s[0], y = b + s[1];
      if (passo === 1 || passo === 4) r(x, y, 1, 1, BRANCO);
      else if (passo === 2) { r(x - 1, y, 3, 1, OURO); r(x, y - 1, 1, 3, OURO); r(x, y, 1, 1, BRANCO); }
      else if (passo === 3) { r(x - 2, y, 5, 1, OURO); r(x, y - 2, 1, 5, OURO); r(x - 1, y, 3, 1, OURO2); r(x, y - 1, 1, 3, OURO2); r(x, y, 1, 1, BRANCO); }
    });
  }

  /* ----- a camada no mapa ----- */
  var EV = Reino.EVENTOS, U = Reino.util;
  var sujo = true, moedas = 0, imagens = null;
  if (U && U.on && EV) [EV.PROGRESSO, EV.PROGRESSO_REMOTO, EV.MAPA_MUDOU].forEach(function (e) { U.on(e, function () { sujo = true; }); });
  function cofre() { return (I.objetos || []).find(function (o) { return o.tipo === 'cofre'; }); }
  function centro(o) { return { x: o.x * T + Math.floor(o.w * T / 2), b: (o.y + o.h) * T - 2 }; }
  // as 2 imagens (auréola menor e maior) com as moedas por cima; refeitas só quando as moedas mudam
  function lerImagens() {
    if (sujo) { sujo = false; var m = moedasDe(); if (m !== moedas || !imagens) { moedas = m; imagens = null; } }
    if (imagens) return imagens;
    var ch = fracaoDe(moedas) >= 1;
    imagens = [ch ? 3 : 2, ch ? 4 : 3].map(function (ate) {
      var c = PA.novoCanvas(LARG, ALT), x = c.getContext('2d');
      desenharAura(x, ate, ch);
      desenharMoedas(x, MEIO, BASE, moedas);
      if (ch) desenharConfete(x, MEIO, BASE);
      return c;
    });
    return imagens;
  }
  if (Reino.registrarModulo) Reino.registrarModulo({ id: 'cofre',
    depurar: function () { return { moedas: moedasDe(), fracao: fracaoDe(moedasDe()) }; },
    camada: {
      ativo: function () { return !!(Reino.Cena && Reino.Cena.atual && Reino.Cena.atual().tipo === 'mapa' && cofre()); },
      itensDesenho: function (p, t, animar) {
        var o = cofre(), c = centro(o), pe = (o.y + o.h - 1) * T + 12 - 0.005;   // logo depois do pote (itensFrente), antes de quem pisa a fileira dele
        return [{ y: pe, desenhar: function () {
          var im = lerImagens(), ctx = p.ctx, e = p.escala, ch = fracaoDe(moedas) >= 1;
          ctx.save();
          ctx.setTransform(e, 0, 0, e, -Math.round(p.cam.x * e), -Math.round(p.cam.y * e));
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(im[animar && Math.floor(t / 600) % 2 ? 1 : 0], c.x - MEIO, c.b - BASE);
          desenharBrilhos(function (x, y, w, h, cor) { ret(ctx, x, y, w, h, cor); }, c.x, c.b, t, animar, ch);
          ctx.restore();
        } }];
      },
    } });

  /* ----- o estático e o toque ----- */
  I.OBJETOS.cofre = function (ctx, o) { var c = centro(o); desenharPote(ctx, c.x, c.b); };
  function abrir() { Reino.Som.tocar('moeda'); if (Reino.UI && Reino.UI.telaCofre) Reino.UI.telaCofre(); }
  function noCofre(o, tx, ty) { return tx >= o.x && tx < o.x + o.w && ty >= o.y && ty < o.y + o.h; }
  // toque em px do jogo: o pote sobe 3 tiles acima do rect; ela para na frente dele, olhando para cima
  Mapa.alvoObjeto = function (wx, wy) {
    var o = cofre();
    if (!o || wx < o.x * T || wx >= (o.x + o.w) * T || wy < o.y * T - 48 || wy >= (o.y + o.h) * T) return null;
    var frente = { x: o.x + Math.floor(o.w / 2), y: o.y + o.h };
    var tile = Mapa.solido(frente.x, frente.y) ? Mapa.maisPerto(frente.x, frente.y, window.Jogador && Jogador.tile()) : frente;
    tile = tile || frente;
    // vira para o tile do pote mais perto (na quina, para cima ou para baixo)
    var dx = Math.sign(Math.max(o.x, Math.min(o.x + o.w - 1, tile.x)) - tile.x), dy = Math.sign(Math.max(o.y, Math.min(o.y + o.h - 1, tile.y)) - tile.y);
    var olhar = dy ? { x: 0, y: dy } : { x: dx, y: 0 };
    return { tipo: 'objeto', id: 'cofre', tile: tile, olhar: olhar, agir: abrir };
  };
  // Enter/Espaço: o pote num dos 4 vizinhos (o da direção do olhar primeiro)
  Mapa.alvoObjetoPerto = function (tl, olhar) {
    var o = cofre();
    if (!o) return null;
    var viz = [olhar && { x: olhar.x, y: olhar.y }, { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];
    for (var i = 0; i < viz.length; i++) {
      var v = viz[i];
      if (v && (v.x || v.y) && noCofre(o, tl.x + v.x, tl.y + v.y)) return { tipo: 'objeto', id: 'cofre', tile: { x: tl.x, y: tl.y }, olhar: v, agir: abrir };
    }
    return null;
  };

  /* ----- para a tela do cofre ----- */
  Reino.Cofre = {
    moedas: moedasDe,
    fracao: function () { return fracaoDe(moedasDe()); },
    cheio: cheio,
    // o pote inteiro, parado, numa imagem LARG × ALT (px de arte), com as moedas dadas
    canvas: function (m) {
      var c = PA.novoCanvas(LARG, ALT), x = c.getContext('2d'), ch = fracaoDe(m) >= 1;
      desenharAura(x, ch ? 4 : 3, ch);
      desenharPote(x, MEIO, BASE);
      desenharMoedas(x, MEIO, BASE, m);
      if (ch) desenharConfete(x, MEIO, BASE);
      desenharBrilhos(function (a, y, w, h, cor) { ret(x, a, y, w, h, cor); }, MEIO, BASE, 0, false, ch);
      return c;
    },
  };
})();
