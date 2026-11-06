/* Bosque dos Fantasmas: o desenho do combate (parte de bosque-combate.js, pelo interno Reino._bosqueCombate).
   Quatro inimigos: os três fantasmas fofos (lilás fácil, turquesa médio, rosa-vinho com coroinha difícil) e a mosca
   feia (verde-escura, asas claras, olhos vermelhos), que flutuam, piscam, ficam brancos ao levar golpe e se apagam
   num puf, com a barrinha de vida em cima; a espada na mão dela (só depois de ganhar) e o arco do golpe; o piscar
   dela invencível e as estrelinhas do desmaio. Sem Animações: tudo parado (sem balanço, sem piscar), o golpe e o puf
   continuam (são do jogo). Sprites feitos uma vez, itens fixos reaproveitados, nada criado por quadro (o brilho
   branco dela é cacheado por sprite); nada de Math.random.
   As outras arenas (arenas.md): o inimigo usa o molde de Reino.registrarDesenhoInimigo('<arena>-<tipo>', molde)
   (feito em sprite uma vez por quadro: normal, piscando, branco do golpe e o passo); sem molde, o fantasma do
   mesmo tipo (o voador vira a mosca). */
(function () {
  var R = window.Reino;
  var S = R._bosqueCombate;
  var D = R.Desenho, K = D.K, C = D.C;
  var ALTURA = 6, BALANCO = 1.5;          // px do jogo: quanto o fantasma flutua acima do chão e quanto balança
  var FUNDO_BARRA = '#5b3f6b', COR_BARRA = C.rosa;

  /* ---------- sprites (13 × 17: 3 linhas da coroinha em cima, vazias nos outros) ---------- */
  var COROA = ['....K.K.K....', '...KoKgKoK...', '...KoooooK...'];
  var SEM_COROA = ['.............', '.............', '.............'];
  var CORPO = [
    '....KKKKK....',
    '..KKllbbbKK..',
    '.KllbbbbbbsK.',
    'KlbbbbbbbbbsK',
    'KlbeKbbbeKbsK',
    'KbbKKbbbKKbsK',
    'KbrrbbbbbrrsK',
    'KbbbbKbKbbbsK',
    'KbbbbbKbbbbsK',
    'KbbbbbbbbbbsK',
    'KbbbbbbbbbbsK',
    'KbbbbbbbbbssK',
    'KbbbKbbbKbbsK',
    '.KKK.KKK.KKK.',
  ];
  var PISCA = ['KlbbbbbbbbbsK', 'KbbKKbbbKKbsK'];   // linhas 4 e 5 com os olhinhos fechados
  var CORES = {
    facil: { b: '#cdb4ff', l: '#ece2ff', s: '#a385e0', r: '#ffb8d6' },
    medio: { b: '#8fe3dc', l: '#d8fbf7', s: '#55bdb7', r: '#ffb8cf' },
    dificil: { b: '#cf6a98', l: '#f2a8c8', s: '#a04573', r: '#ffc0d8' },
    mosca: { g: '#3f6b3a', l: '#7fb45a', s: '#24401f', w: '#e6fff2', v: '#9fd8b8', r: '#ff4d4d', e: C.branco },
  };
  var BRANCO = { b: C.branco, l: C.branco, s: '#efe6ff', r: C.branco };
  var SPR = { facil: [], medio: [], dificil: [] };   // 0 olhos abertos, 1 piscando, 2 branco (levou golpe)
  // a mosca feia: sprite próprio 13 × 17 (não usa o corpo do fantasma), asas claras nas laterais
  var MOSCA = [
    '..K.......K..',
    '.K.........K.',
    '..KKKKKKKKK..',
    '.KlllllllllK.',
    'KllgggggggllK',
    'KggrrggggrrgK',
    'KggeeggggeegK',
    'KwwKgggggKwwK',
    'KwvKgggggKwvK',
    'KvwKgggggKvwK',
    '.KKKgggggKKK.',
    '...KgggggK...',
    '...KgsgsgK...',
    '...KgKgKgK...',
    '..K.K.K.K.K..',
    '.K...K...K...',
    'K...K...K...K',
  ];
  var MOSCA_PISCA = ['KggKKggggKKgK', 'KgggggggggggK'];   // linhas 5 e 6 com os olhos fechados
  var BRANCO_MOSCA = { g: C.branco, l: C.branco, s: '#efe6ff', w: C.branco, v: C.branco, r: C.branco, e: C.branco };
  var SPR_MOSCA = [];   // 0 olhos abertos, 1 piscando, 2 branco (levou golpe)
  function desenharMatriz(linhas, paleta, largura, altura) {
    var c = PA.novoCanvas(largura || 13, altura || linhas.length);
    D.matriz(c.getContext('2d'), 0, 0, linhas, paleta);
    return c;
  }
  function fantasma(tipo, q) {
    var lista = SPR[tipo] || SPR.facil;
    if (lista[q]) return lista[q];
    var linhas = (tipo === 'dificil' ? COROA : SEM_COROA).concat(CORPO);
    if (q === 1) { linhas = linhas.slice(); linhas[7] = PISCA[0]; linhas[8] = PISCA[1]; }
    var p = q === 2 ? BRANCO : CORES[tipo] || CORES.facil;
    var c = desenharMatriz(linhas, { K: K, b: p.b, l: p.l, s: p.s, r: p.r, e: C.branco, o: C.ouro, g: C.rosa });
    lista[q] = c;
    return c;
  }
  function mosca(q) {
    if (SPR_MOSCA[q]) return SPR_MOSCA[q];
    var linhas = MOSCA.slice();
    if (q === 1) { linhas[5] = MOSCA_PISCA[0]; linhas[6] = MOSCA_PISCA[1]; }
    var p = q === 2 ? BRANCO_MOSCA : CORES.mosca;
    return (SPR_MOSCA[q] = desenharMatriz(linhas, { K: K, g: p.g, l: p.l, s: p.s, w: p.w, v: p.v, r: p.r, e: p.e }));
  }
  // molde de arena (motor/interiores-arena.js): q 0 normal, 1 piscando, 2 branco (toda cor menos K), 3 o passo; um canvas por quadro
  var MOLDES = {};
  function doMolde(chave, m, q) {
    var lista = MOLDES[chave] || (MOLDES[chave] = []);
    if (lista[q]) return lista[q];
    var linhas = m.linhas.slice(), troca = q === 1 ? m.pisca : q === 3 ? m.passo : null, p = m.paleta;
    if (troca) Object.keys(troca).forEach(function (i) { linhas[+i] = troca[i]; });
    if (q === 2) { p = {}; Object.keys(m.paleta).forEach(function (k) { p[k] = k === 'K' ? m.paleta[k] : C.branco; }); }
    return (lista[q] = desenharMatriz(linhas, p, linhas[0].length, linhas.length));
  }
  // a primeira linha com desenho do molde (a barrinha de vida fica logo acima dela)
  function topoDe(m) {
    if (m._topo === undefined) { var i = 0; while (i < m.linhas.length - 1 && !/[^.]/.test(m.linhas[i])) i++; m._topo = i; }
    return m._topo;
  }
  function moldeDe(arena, tipo) { return arena && arena !== 'bosque' && R.Arenas ? R.Arenas.desenho(arena, tipo) : null; }
  function spriteDe(tipo, q, arena) {
    var m = moldeDe(arena, tipo);
    if (m) return doMolde(arena + '-' + tipo, m, q);
    return tipo === 'mosca' || tipo === 'voador' ? mosca(q) : fantasma(tipo, q);
  }
  var PUF = [
    ['.KK.', 'KwwK', 'KwsK', '.KK.'],
    ['.KKK.', 'KwwwK', 'KwwsK', 'KwssK', '.KKK.'],
    ['..KKK..', '.KwwwK.', 'KwwwwsK', 'KwwwwsK', 'KwwwssK', '.KsssK.', '..KKK..'],
  ];
  var SPR_PUF = [];
  function puf(i) {
    if (SPR_PUF[i]) return SPR_PUF[i];
    var c = PA.novoCanvas(PUF[i][0].length, PUF[i].length);
    D.matriz(c.getContext('2d'), 0, 0, PUF[i], { K: K, w: C.creme, s: '#e3d4ff' });
    return (SPR_PUF[i] = c);
  }
  var ESPADA = ['..K..', '.KwK.', '.KwK.', '.KwK.', '.KlK.', 'KKKKK', 'KogoK', 'KKpKK', '.KpK.', '.KoK.', '..K..'];
  var ESTRELA = ['..K..', '.KoK.', 'KoyoK', '.KoK.', '..K..'];
  var SPR_ESPADA = null, SPR_ESTRELA = null;
  function espada() {
    if (SPR_ESPADA) return SPR_ESPADA;
    SPR_ESPADA = PA.novoCanvas(5, ESPADA.length);
    D.matriz(SPR_ESPADA.getContext('2d'), 0, 0, ESPADA, { K: K, w: '#eef8ff', l: '#c7b8ff', o: C.ouro, g: C.rosa, p: C.roxo });
    return SPR_ESPADA;
  }
  function estrela() {
    if (SPR_ESTRELA) return SPR_ESTRELA;
    SPR_ESTRELA = PA.novoCanvas(5, 5);
    D.matriz(SPR_ESTRELA.getContext('2d'), 0, 0, ESTRELA, { K: K, o: C.ouro, y: C.ouro3 });
    return SPR_ESTRELA;
  }
  // ela branquinha (piscar invencível): uma cópia por sprite dela, feita uma vez
  var brancos = new WeakMap();
  function branca(img) {
    var b = brancos.get(img);
    if (b) return b;
    b = PA.novoCanvas(img.width, img.height);
    var x = b.getContext('2d');
    x.drawImage(img, 0, 0);
    x.globalCompositeOperation = 'source-atop';
    x.fillStyle = 'rgba(255,255,255,0.75)';
    x.fillRect(0, 0, img.width, img.height);
    brancos.set(img, b);
    return b;
  }

  /* ---------- itens do quadro (objetos fixos, reaproveitados) ---------- */
  var P = null, T0 = 0, ANIMAR = false;   // pintor, `t` e animar do quadro em curso
  var itens = [], pool = [];
  var vista = { x: 0, y: 0, w: 0, h: 0 };
  function medirVista(p) {
    var e = p.escala || 1, cv = p.ctx && p.ctx.canvas;
    vista.x = p.cam.x; vista.y = p.cam.y; vista.w = cv ? cv.width / e : 400; vista.h = cv ? cv.height / e : 300;
  }
  function aVista(x, y) { return x > vista.x - 24 && x < vista.x + vista.w + 24 && y > vista.y - 8 && y < vista.y + vista.h + 40; }

  function desenharFantasma() {
    var f = this.f, est = S.estado, cfg = est.cfg, x = Math.round(f.x), y = Math.round(f.y), m = moldeDe(est.arena, f.tipo);
    var alto = m && m.flutua !== undefined ? m.flutua : ALTURA, bal = m && m.balanco !== undefined ? m.balanco : BALANCO;
    var bob = ANIMAR && bal ? Math.round(Math.sin((T0 + f.fase) / 420) * bal) : 0, pe = y + 1 - alto - bob;
    if (f.estado === 'sumindo' || f.estado === 'surgindo') {
      var k = 1 - Math.max(0, f.ate - est.t) / cfg.vencidoMs;
      if (f.estado === 'surgindo') k = 1 - k;
      if (k < 0.25) { P.sprite(spriteDe(f.tipo, 2, est.arena), x, pe); return; }
      pufs(x, pe - 8, (k - 0.25) / 0.75);
      return;
    }
    if (window.Jogador && Jogador.sombra) Jogador.sombra(P, x, y, 4);
    var q = est.t < f.feridoAte ? 2 : ANIMAR && (T0 + f.fase * 7) % 3600 < 140 ? 1 : 0;
    if (q === 0 && m && m.passo && ANIMAR && Math.floor((T0 + f.fase) / 220) % 2) q = 3;
    var img = spriteDe(f.tipo, q, est.arena);
    P.sprite(img, x, pe);
    // barrinha de vida em cima (contorno, fundo e o que sobra)
    var by = pe - img.height + (m ? topoDe(m) : f.tipo === 'dificil' ? 0 : 3) - 4, cheio = Math.round(10 * f.vida / f.max);
    P.ret(x - 6, by, 12, 3, K);
    P.ret(x - 5, by + 1, 10, 1, FUNDO_BARRA);
    if (cheio > 0) P.ret(x - 5, by + 1, cheio, 1, COR_BARRA);
  }
  // puf: 5 nuvenzinhas que se abrem e encolhem, com brilhinhos
  function pufs(x, y, k) {
    var i = k < 0.35 ? 2 : k < 0.7 ? 1 : 0, r = 2 + Math.round(k * 9);
    for (var n = 0; n < 5; n++) {
      var a = n * 1.2566 + 0.3;
      P.sprite(puf(i), Math.round(x + Math.cos(a) * r), Math.round(y + Math.sin(a) * r * 0.8) + 3);
    }
    if (k > 0.3) { P.ret(x - r - 2, y - 1, 1, 1, C.ouro3); P.ret(x + r + 2, y + 1, 1, 1, C.ouro3); P.ret(x, y - r - 2, 1, 1, C.branco); }
  }
  /* a espada na mão dela: do lado da mão de quem olha; de costas, atrás dela; no golpe, avança para onde ela olha.
     Presa à grade de pixels do sprite dela (J.silhueta: a borda esquerda e os pés, já com o pulinho do trote), a um
     número inteiro de px do jogo: o pintor desenha em px da tela sem arredondar ao px do jogo (ela desliza), e a
     espada arredondada sozinha (Math.round(J.x + lado)) e sem o trote tremia 1 px para lá e para cá andando. */
  function desenharEspada() {
    // o olhar do corpo deste quadro (o ataque por alvo pode virá-la depois do corpo escolhido: bosque-alvo.js)
    var J = window.Jogador, est = S.estado, ox = S.olharX, oy = S.olharY, s = J.silhueta, img = espada();
    var montada = J.montado && J.montado();
    // de lado, a mão fica perto do meio (montada, em cima do lombo); de frente ou de costas, ao lado do corpo
    var lado = Math.abs(ox) > Math.abs(oy) ? (ox < 0 ? -1 : 1) * (montada ? 0 : 4) : (oy < 0 ? 5 : -5);
    var w = s && s.img ? s.img.width : 0, esq = s && s.img ? s.x - w / 2 : J.x, pes = s && s.img ? s.yPes : J.y + 1;
    var meia = img.width / 2, dx = Math.round(w / 2 + lado - meia), dy = -maoAltura(J);
    if (est && est.golpe) { dx += Math.round(est.golpe.dx * 4); dy += Math.round(est.golpe.dy * 3); }
    P.sprite(img, esq + dx + meia, pes + dy);
  }
  // o arco do golpe: um risco com contorno num meio-círculo que se abre na direção dela, na altura da mão
  var COR_ARCO = [C.branco, '#fff3c4', C.ouro3, '#ffe9a8'];
  function pontoArco(n, fim, cx, cy, raio, meio, contorno) {
    // o centro sem arredondar (com ela, sem tremer); só o desvio em px inteiros do jogo
    var a = meio - 1.2 + n * 0.2, x = cx + Math.round(Math.cos(a) * raio), y = cy + Math.round(Math.sin(a) * raio * 0.75);
    if (contorno) P.ret(x - 2, y - 2, 4, 4, K);
    else P.ret(x - 1, y - 1, 2, 2, COR_ARCO[Math.min(3, Math.floor((fim - n) / 3))]);
  }
  function desenharArco() {
    var J = window.Jogador, est = S.estado, g = est.golpe, cj = est.cfg.jogador, n;
    if (!g) return;
    var k = Math.min(1, Math.max(0, (est.t - g.em) / cj.golpeMs)), meio = Math.atan2(g.dy, g.dx);
    var s = J.silhueta, cx = J.x, cy = (s && s.img ? s.yPes : J.y + 1) - maoAltura(J) - 4, raio = cj.alcance * 0.8;
    var fim = ANIMAR ? Math.round(k * 12) : 12;
    for (n = 0; n <= fim; n++) pontoArco(n, fim, cx, cy, raio, meio, true);
    for (n = 0; n <= fim; n++) pontoArco(n, fim, cx, cy, raio, meio, false);
  }
  // altura da mão dela acima dos pés (montada, pela altura do sprite do conjunto)
  function maoAltura(J) {
    var s = J.silhueta, h = s && s.img ? s.img.height : 24;
    return J.montado && J.montado() ? Math.round(h * 0.32) : 6;
  }
  // invencível: ela pisca branquinha (só com Animações)
  function desenharPiscar() {
    var s = window.Jogador.silhueta;
    if (s && s.img) P.sprite(branca(s.img), s.x, s.yPes);
  }
  var ITEM_ESPADA = { y: 0, desenhar: desenharEspada }, ITEM_ARCO = { y: 0, desenhar: desenharArco };
  var ITEM_PISCAR = { y: 0, desenhar: desenharPiscar };

  function itensDesenho(p, t, animar) {
    itens.length = 0;
    var est = S.estado, J = window.Jogador;
    if (!est || !J) return itens;
    P = p; T0 = t; ANIMAR = animar; medirVista(p);
    var n = 0;
    for (var i = 0; i < est.fantasmas.length; i++) {
      var f = est.fantasmas[i];
      if (f.estado === 'vencido' || f.estado === 'esperando' || !aVista(f.x, f.y)) continue;
      if (!pool[n]) pool[n] = { y: 0, f: null, desenhar: desenharFantasma };
      pool[n].y = f.y; pool[n].f = f;
      itens.push(pool[n++]);
    }
    if (est.t < est.invencivelAte && animar && Math.floor(t / 100) % 2 === 0 && !S.desmaio) {
      ITEM_PISCAR.y = J.y + 0.001; itens.push(ITEM_PISCAR);
    }
    var temEspada = R.BosqueCombate.temEspada();
    if (temEspada && !S.desmaio) {
      ITEM_ESPADA.y = S.olharY < 0 && Math.abs(S.olharY) >= Math.abs(S.olharX) ? J.y - 0.01 : J.y + 0.002;
      itens.push(ITEM_ESPADA);
    }
    if (est.golpe) { ITEM_ARCO.y = J.y + 0.003; itens.push(ITEM_ARCO); }
    return itens;
  }
  // estrelinhas do desmaio: três girando em volta da cabeça dela (por cima de tudo)
  function sobre(p, t, animar) {
    if (!S.desmaio || !window.Jogador) return;
    var J = window.Jogador, s = J.silhueta, topo = (s && s.img ? s.yPes - s.img.height : J.y - 24) - 2;
    for (var n = 0; n < 3; n++) {
      var a = (animar ? (t - S.desmaio.desde) / 260 : 0) + n * 2.0944;
      p.sprite(estrela(), Math.round(J.x + Math.cos(a) * 9), Math.round(topo + Math.sin(a) * 3));
    }
  }

  S.desenho = { itens: itensDesenho, sobre: sobre };
})();
