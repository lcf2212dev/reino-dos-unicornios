/* Vida no mapa (módulo 'vida-mapa'): bichinhos de enfeite que deixam a cidade viva, só com Animações.
   Borboletas voando perto das flores e canteiros, libélulas sobre o lago, folhinhas caindo das árvores
   (itens por Y, junto com a Mariana) e, de vez em quando, um bando de passarinhos cruzando o céu com a
   sombrinha no chão (camada de cima). Só desenho: nada de toque, som, fala nem prêmio.
   Tudo sai do tempo `t` e de sementes fixas (Reino.Desenho.sorte): nada de Math.random nem de estado.
   Sprites feitos uma vez; os itens do quadro são objetos fixos reaproveitados (nada novo por quadro).
   Números em Reino.config.vidaMapa. Nada de DOM, canvas nem Mapa no carregamento. */
(function () {
  var R = window.Reino;
  var D = R.Desenho, K = D.K, C = D.C, sorte = D.sorte;
  var SOMBRA = 'rgba(58,36,70,0.25)';

  function cfg() {
    return (R.config && R.config.vidaMapa) ||
      { borboletas: 10, libelulas: 3, folhas: 4, passarinhoACadaMs: 14000, passarinhoPxS: 46, asaMs: 160 };
  }
  function animacoesLigadas() {
    var P = R.Progresso, e = P && P.estado && P.estado();
    return !!(e && e.ajustes && e.ajustes.animacoes !== false) && !(R.util && R.util.reduzMovimentoSistema);
  }
  function noMapa() {
    var c = R.Cena && R.Cena.atual && R.Cena.atual();
    return !!(c && c.tipo === 'mapa' && window.Mapa && Mapa._interno && Mapa._interno.tipo.length);
  }

  /* ---------- sprites (2 quadros de asa; feitos na primeira vez) ---------- */
  // cache por índice (nada de chave em texto montada por quadro)
  var SPR_BORB = [[], [], [], [], []], SPR_LIB = [], SPR_AVE = [], SPR_FOLHA = [[], []];
  function sprite(cache, i, linhas, cores) {
    if (!cache[i]) {
      var c = PA.novoCanvas(linhas[0].length, linhas.length);
      D.matriz(c.getContext('2d'), 0, 0, linhas, cores);
      cache[i] = c;
    }
    return cache[i];
  }
  var BORB = [
    ['KK...KK', 'KlK.KwK', 'KwwKwwK', '.KwKwK.', '..K.K..'],    // asas abertas
    ['.......', '..K.K..', '.KlKwK.', '.KwKwK.', '..KKK..'],    // asas fechadas (para cima)
  ];
  var CORES_BORB = [[C.rosa2, C.creme], [C.ouro, C.ouro3], [C.lilas, '#e3d4ff'], [C.azul2, C.creme], [C.laranja, C.ouro3]];
  function borboleta(cor, q) {
    if (SPR_BORB[cor][q]) return SPR_BORB[cor][q];
    var p = CORES_BORB[cor];
    return sprite(SPR_BORB[cor], q, BORB[q], { K: K, w: p[0], l: p[1] });
  }
  var LIB = [
    ['..K...K..', '.KaK.KaK.', 'KbbbbbbbK', '.KKKKKKK.'],
    ['.........', '.KKKKKKK.', 'KbbbbbbbK', '.KaK.KaK.'],
  ];
  function libelula(q) { return SPR_LIB[q] || sprite(SPR_LIB, q, LIB[q], { K: K, a: C.azul2, b: C.agua3 }); }
  var AVE = [
    ['KK...KK', 'KwK.KwK', '.KwbwK.', '..KKK..'],
    ['..KKK..', '.KwbwK.', 'KwK.KwK', 'K.....K'],
  ];
  function ave(q) { return SPR_AVE[q] || sprite(SPR_AVE, q, AVE[q], { K: K, w: C.creme, b: C.azul }); }
  var FOLHA = [['oo.', '.vo'], ['.oo', 'ov.']];
  function folha(q, cor) { var lista = SPR_FOLHA[cor ? 1 : 0]; return lista[q] || sprite(lista, q, FOLHA[q], cor ? { o: C.ouro2, v: C.laranja } : { o: '#8fcf4a', v: '#5f9e3a' }); }

  /* ---------- onde ficam (calculado uma vez, da grade do mapa) ---------- */
  var lugares = null;   // { flores: [[x, y]], arvores: [[x, y]], lago }
  function preparar() {
    if (lugares && lugares.grade === Mapa._interno.tipo) return lugares;
    var I = Mapa._interno, T = Mapa.T, canteiros = [], flores = [], arvores = [], x, y;
    for (var i = 0; i < I.objetos.length; i++) {
      var o = I.objetos[i];
      if (o.tipo === 'canteiro') canteiros.push([(o.x + o.w / 2) * T, (o.y + o.h / 2) * T]);
    }
    for (y = 1; y < Mapa.H - 1; y++) for (x = 1; x < Mapa.W - 1; x++) {
      var d = I.decor[y][x], tp = I.tipo[y][x];
      if (tp === 'a') continue;
      if (d === 'canteiro' || d === 'flor' || tp === 'f') flores.push([x * T + T / 2, y * T + T / 2]);
      // árvore da beira do bosque: a de baixo dela é chão livre, a folha cai à vista
      else if (d === 'arvore' && !I.solido[y + 1][x]) arvores.push([x * T + T / 2, y * T]);
    }
    // borboletas: primeiro nos canteiros da praça, depois espalhadas pelas flores (passo fixo)
    var n = cfg().borboletas, pontos = canteiros.slice(0, n), passo = flores.length / Math.max(1, n - pontos.length);
    for (i = 0; pontos.length < n && flores.length; i++) pontos.push(flores[Math.floor(i * passo + passo / 2) % flores.length]);
    var Lg = Mapa.CIDADE && Mapa.CIDADE.lago;
    lugares = { grade: I.tipo, borboletas: pontos, arvores: arvores,
      lago: Lg ? { cx: Lg.cx * T, cy: Lg.cy * T, rx: Lg.rx * T * 0.7, ry: Lg.ry * T * 0.6 } : null };
    return lugares;
  }

  /* ---------- itens do quadro (objetos fixos, reaproveitados) ---------- */
  var P = null;                   // o pintor do quadro em curso
  var itens = [], pool = [];
  function item(i) {
    if (!pool[i]) pool[i] = { y: 0, x: 0, yy: 0, img: null, desenhar: null };
    return pool[i];
  }
  function desenharItem() { P.sprite(this.img, this.x, this.yy); }
  // a vista (px do jogo), com folga
  var vista = { x: 0, y: 0, w: 0, h: 0 };
  function medirVista(p) {
    var e = p.escala || 1, cv = p.ctx && p.ctx.canvas;
    vista.x = p.cam.x; vista.y = p.cam.y;
    vista.w = cv ? cv.width / e : 400; vista.h = cv ? cv.height / e : 300;
  }
  function aVista(x, y) { return x > vista.x - 16 && x < vista.x + vista.w + 16 && y > vista.y - 16 && y < vista.y + vista.h + 24; }
  function por(n, x, y, yPes, img) {
    var it = item(n); it.x = x; it.yy = yPes; it.y = y; it.img = img; it.desenhar = desenharItem;
    itens.push(it);
  }

  function itensDesenho(pintor, t, animar) {
    itens.length = 0;
    if (!animar) return itens;
    var L = preparar(), c = cfg(), n = 0, i, s, q;
    P = pintor; medirVista(pintor);
    // borboletas: rodeiam o ponto num laço suave, em pixels inteiros; as asas batem em 2 quadros
    for (i = 0; i < L.borboletas.length; i++) {
      var b = L.borboletas[i], f = sorte(i, 3, 11) * 6.28, vel = 0.0007 + sorte(i, 5, 11) * 0.0005;
      var bx = b[0] + Math.round(Math.sin(t * vel + f) * 11 + Math.sin(t * vel * 2.3 + f) * 4);
      var by = b[1] - 8 + Math.round(Math.sin(t * vel * 1.7 + f) * 5);
      if (!aVista(bx, by)) continue;
      q = Math.floor(t / c.asaMs + i) % 2;
      por(n++, bx, b[1] + 6, by, borboleta(i % CORES_BORB.length, q));
    }
    // libélulas: param no ar e dão um pulinho rápido para outro ponto do lago
    if (L.lago) for (i = 0; i < c.libelulas; i++) {
      var tt = t + i * 700, seg = Math.floor(tt / 1900), k = (tt - seg * 1900) / 300;
      var ax = ponto(L.lago.cx, L.lago.rx, seg - 1, i, 1), ay = ponto(L.lago.cy, L.lago.ry, seg - 1, i, 2);
      var zx = ponto(L.lago.cx, L.lago.rx, seg, i, 1), zy = ponto(L.lago.cy, L.lago.ry, seg, i, 2);
      if (k > 1) k = 1;
      var lx = Math.round(ax + (zx - ax) * k), ly = Math.round(ay + (zy - ay) * k) - 6 + (Math.floor(tt / 400) % 2);
      if (!aVista(lx, ly)) continue;
      por(n++, lx, ly + 10, ly, libelula(Math.floor(t / 60) % 2));
    }
    // folhinhas: cada uma escolhe, a cada ciclo, uma árvore à vista e cai balançando
    if (L.arvores.length) for (i = 0; i < c.folhas; i++) {
      var ciclo = 5200, tf = t + i * 1300; s = Math.floor(tf / ciclo);
      var kf = (tf - s * ciclo) / 3200;
      if (kf >= 1) continue;
      var arv = arvoreAVista(L.arvores, s, i);
      if (!arv) continue;
      var fx = arv[0] - 4 + Math.round(sorte(s, i, 21) * 8) + Math.round(Math.sin(kf * 9) * 3);
      var fy = arv[1] - 2 + Math.round(kf * 18);
      por(n++, fx, arv[1] + 17, fy, folha(Math.floor(kf * 9) % 2, (i + s) % 2));
    }
    return itens;
  }
  function ponto(meio, raio, seg, i, eixo) { return meio + (sorte(seg, i, eixo + 30) * 2 - 1) * raio; }
  // a árvore do ciclo s: a k-ésima das que estão à vista (k fixo pela semente); nenhuma à vista: nada
  function arvoreAVista(lista, s, i) {
    var vistas = 0, j;
    for (j = 0; j < lista.length; j++) if (aVista(lista[j][0], lista[j][1])) vistas++;
    if (!vistas) return null;
    var alvo = Math.floor(sorte(s, i, 20) * vistas);
    for (j = 0; j < lista.length; j++) if (aVista(lista[j][0], lista[j][1]) && alvo-- === 0) return lista[j];
    return null;
  }

  /* ---------- passarinhos (por cima de tudo) ---------- */
  function sobre(ctx, pintor, t, animar) {
    if (!animar) return;
    var c = cfg(), per = c.passarinhoACadaMs, nb = Math.floor(t / per), k = t - nb * per;
    medirVista(pintor);
    var dist = vista.w + 60, dur = dist / c.passarinhoPxS * 1000;
    if (k > dur) return;
    var praDireita = sorte(nb, 7, 1) < 0.5, quantos = 1 + Math.floor(sorte(nb, 7, 2) * 3);
    var andou = Math.round(k * c.passarinhoPxS / 1000);
    var y0 = Math.round(vista.y + vista.h * (0.1 + 0.3 * sorte(nb, 7, 3)));
    for (var j = 0; j < quantos; j++) {
      var x = praDireita ? vista.x - 30 + andou - j * 10 : vista.x + vista.w + 30 - andou + j * 10;
      var y = y0 + (j % 2) * 5 + (Math.floor((t + j * 90) / 500) % 2);
      pintor.ret(x - 2, y + 40, 5, 1, SOMBRA);   // a sombrinha no chão, lá embaixo
      pintor.sprite(ave(Math.floor((t + j * 110) / 180) % 2), x, y);
    }
  }

  R.VidaMapa = { depurar: function () { return { ativo: camada.ativo(), lugares: lugares && { borboletas: lugares.borboletas.length, arvores: lugares.arvores.length } }; } };
  var camada = {
    ativo: function () { return animacoesLigadas() && noMapa(); },
    itensDesenho: itensDesenho,
    sobre: sobre,
  };
  if (R.registrarModulo) R.registrarModulo({ id: 'vida-mapa', depurar: R.VidaMapa.depurar, camada: camada });
})();
