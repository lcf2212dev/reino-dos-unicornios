/* Parquinho, parte 9: a brincadeira da caixa de areia, o estado e as regras (Reino.ParquinhoAreia;
   docs/contratos/parquinho.md). A tela de perto (ui/parquinho-areia.js) chama estas regras e areia-desenho.js desenha.
   A caixa de perto tem W × H px de arte: moldura de madeira em volta e a areia (AREIA) numa grade de células de
   CEL × CEL px, cada uma com uma altura de MIN (buraco fundo) a MAX (montinho alto). Ela e o unicórnio ficam
   sentados na frente (QUEM: o meio, a linha dos pés e quantas linhas, de baixo, a areia cobre até o pescoço).
   Ferramentas: 'cavar' (pazinha), 'castelo' (balde), 'amontoar' (mão), 'alisar' (rastelo) e 'enfeite' (com o tipo:
   concha, estrela, bandeira, flor). Em cima dela ou do unicórnio, amontoar cobre e cavar/alisar descobrem
   (config.parquinho.areia.cobrirPassadas passadas até o pescoço).
   Tudo em memória: fica até fechar o jogo (recarregar zera); nada no save. A queda do balanço marca a areia por
   P.areiaTombo() (o contrato com o balanço, poses-balanco.js). node: true: nada de DOM nem canvas aqui. */
(function () {
  var R = window.Reino;
  var P = R._predios.parquinho;
  var W = 80, H = 60, CEL = 2;
  var AREIA = { x: 4, y: 4, w: 72, h: 48 }, COLS = AREIA.w / CEL, LINS = AREIA.h / CEL;
  var MIN = -3, MAX = 5;
  // cx = o meio, pe = a linha dos pés (px de arte; a sombra e o monte vão até pe + 1, a última fileira de areia);
  // w × h = o tamanho do desenho (o desenho mede de novo na hora);
  // pescoco = linhas cobertas no máximo (a cabeça fica de fora); larg = a largura do monte de areia
  var QUEM = {
    ela: { cx: 17, pe: 50, w: 13, h: 16, pescoco: 8, larg: 15 },
    uni: { cx: 61, pe: 50, w: 20, h: 23, pescoco: 9, larg: 22 },
  };
  var ANDAR = 5, TORRE_LARG = 11;   // cada andar do castelo: 5 px de altura; a base tem 11 px de largura
  var ENFEITES = ['concha', 'estrela', 'bandeira', 'flor'];
  // a queda do balanço: a marca dela (cabeça e corpo) e a do unicórnio (corpo comprido e cabeça), em células
  var MARCAS = [
    { c: 9, l: 3, d: ['.###.', '#####', '.###.', '..#..', '.###.', '#####', '.#.#.'] },
    { c: 19, l: 6, d: ['.......##', '.#####.##', '#######..', '.#####...', '.#...#...'] },
  ];
  // a pazinha: a célula e as 4 em volta; a bordinha do que se cava vai para uma célula a 2 de distância
  var PINCEL = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]];
  var ANEL = [[2, 0], [2, 1], [1, 2], [0, 2], [-1, 2], [-2, 1], [-2, 0], [-2, -1], [-1, -2], [0, -2], [1, -2], [2, -1]];

  function cfg() { return R.config.parquinho.areia; }
  function novo() {
    var alt = [];
    for (var i = 0; i < COLS * LINS; i++) alt.push(0);
    // versaoMundo: a que o desenho parado da caixa (objetos.js) mostra; muda ao fechar a tela e na queda
    return { alt: alt, torres: [], enfeites: [], cobre: { ela: 0, uni: 0 }, risadas: { ela: 0, uni: 0 }, versao: 0, versaoMundo: 0, pazadas: 0, tombos: 0 };
  }
  var st = novo(), gesto = null;
  var corpos = {};   // o tamanho de verdade do desenho de cada um (areia-desenho.js mede): { ela: { w, h }, uni }

  /* ---------- a grade ---------- */
  function dentro(c, l) { return c >= 0 && c < COLS && l >= 0 && l < LINS; }
  function altura(c, l) { return dentro(c, l) ? st.alt[l * COLS + c] : 0; }
  function poe(c, l, v) {
    if (!dentro(c, l)) return false;
    v = Math.max(MIN, Math.min(MAX, v));
    if (st.alt[l * COLS + c] === v) return false;
    st.alt[l * COLS + c] = v;
    return true;
  }
  function celula(x, y) {
    var c = Math.floor((x - AREIA.x) / CEL), l = Math.floor((y - AREIA.y) / CEL);
    return dentro(c, l) ? { c: c, l: l } : null;
  }

  /* ---------- ela, o unicórnio e as torres ---------- */
  function corpo(q) {
    var Q = QUEM[q], m = corpos[q] || {}, w = m.w || Q.w, h = m.h || Q.h;
    return { x: Q.cx - (w >> 1), y: Q.pe - h, w: w, h: h, cx: Q.cx, pe: Q.pe, pescoco: Math.round(Q.pescoco * h / Q.h), larg: Q.larg };
  }
  function quem(x, y) {
    for (var q in QUEM) {
      var r = corpo(q);
      if (x >= r.x && x < r.x + r.w && y >= r.y && y <= r.pe + 1) return q;
    }
    return null;
  }
  // a célula está embaixo dela ou do unicórnio (lá não se cava, o monte de areia é o "cobrir")
  function soboCorpo(c, l) {
    var x = AREIA.x + c * CEL + 1, y = AREIA.y + l * CEL + 1;
    for (var q in QUEM) { var r = corpo(q); if (x >= r.x - 1 && x <= r.x + r.w && y >= r.pe - 4 && y <= r.pe + 2) return true; }
    return false;
  }
  function alturaTorre(t) { return t.andares * ANDAR + 2; }
  // a torre que está no ponto (x, y): a base (t.x, t.y) desce com a areia embaixo (t.base) e ela sobe alturaTorre
  function torreEm(x, y) {
    for (var i = st.torres.length - 1; i >= 0; i--) {
      var t = st.torres[i], pe = t.y - t.base;
      if (Math.abs(x - t.x) <= (TORRE_LARG >> 1) + 1 && y <= pe + 1 && y >= pe - alturaTorre(t) - 1) return i;
    }
    return -1;
  }
  function tirarTorre(i) {
    var t = st.torres[i];
    st.torres.splice(i, 1);
    st.enfeites = st.enfeites.filter(function (e) { return e.torre !== t; });
  }

  /* ---------- as ferramentas: cada uma devolve { mudou, som, risada } ---------- */
  function res(mudou, som, risada) { return { mudou: !!mudou, som: som || null, risada: risada || null }; }
  function cobrir(q, delta) {
    var max = cfg().cobrirPassadas, antes = st.cobre[q], depois = Math.max(0, Math.min(max, antes + delta));
    if (depois === antes) return res(false);
    st.cobre[q] = depois;
    if (depois === max) { st.risadas[q]++; return res(true, 'estrela', q); }   // coberto até o pescoço: risadinha
    return res(true, delta > 0 ? 'esfregar' : 'rachar');
  }
  function cavar(x, y) {
    var q = quem(x, y);
    if (q) return cobrir(q, -2);
    var ce = celula(x, y);
    if (!ce || torreEm(x, y) >= 0 || soboCorpo(ce.c, ce.l)) return res(false);
    // a pazinha tira a célula do dedo e as 4 em volta (o buraco tem 3 células de largura)
    var mudou = false;
    PINCEL.forEach(function (d) {
      var c = ce.c + d[0], l = ce.l + d[1];
      if (dentro(c, l) && !soboCorpo(c, l)) mudou = poe(c, l, altura(c, l) - 1) || mudou;
    });
    if (!mudou) return res(false);
    st.pazadas++;
    // a bordinha: a areia tirada vai para fora do buraco, onde ainda é chão (baixinha, de 1); arrastando, para os
    // dois lados do caminho (a valeta ganha beirada); num toque, gira em volta
    var lados = gesto && gesto.dir ? (gesto.dir.x ? [[0, 2], [0, -2]] : [[2, 0], [-2, 0]]) : null;
    var n = st.pazadas % ANEL.length, viz = lados || ANEL.slice(n).concat(ANEL.slice(0, n));
    for (var k = 0, postas = 0; k < viz.length && postas < (lados ? 2 : 1); k++) {
      var c = ce.c + viz[k][0], l = ce.l + viz[k][1], h = altura(c, l);
      if (dentro(c, l) && h >= 0 && h < 1 && !soboCorpo(c, l) && poe(c, l, h + 1)) postas++;
    }
    tirarEnfeitesPerto(x, y, 4);
    return res(true, 'rachar');
  }
  function amontoar(x, y) {
    var q = quem(x, y);
    if (q) return cobrir(q, 1);
    var ce = celula(x, y);
    if (!ce || torreEm(x, y) >= 0 || soboCorpo(ce.c, ce.l)) return res(false);
    var v = altura(ce.c, ce.l) + 1;
    if (!poe(ce.c, ce.l, v)) return res(false);
    // a areia escorre: nenhum vizinho fica 2 abaixo (o montinho sai redondo)
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
      var c = ce.c + d[0], l = ce.l + d[1];
      if (dentro(c, l) && altura(c, l) < v - 1 && !soboCorpo(c, l)) poe(c, l, v - 1);
    });
    return res(true, 'esfregar');
  }
  function alisar(x, y) {
    var q = quem(x, y);
    if (q) return cobrir(q, -1);
    var i = torreEm(x, y);
    if (i >= 0) {   // o rastelo derruba a torre, um andar por passada
      var t = st.torres[i];
      if (--t.andares <= 0) tirarTorre(i);
      return res(true, 'rachar');
    }
    var ce = celula(x, y), mudou = false;
    if (!ce) return res(false);
    for (var l = ce.l - 1; l <= ce.l + 1; l++) for (var c = ce.c - 1; c <= ce.c + 1; c++) {
      var v = altura(c, l);
      if (v) mudou = poe(c, l, v > 0 ? v - 1 : v + 1) || mudou;
    }
    mudou = tirarEnfeitesPerto(x, y, 4) || mudou;
    return res(mudou, mudou ? 'esfregar' : null);
  }
  function castelo(x, y) {
    if (quem(x, y)) return res(false, 'toque');
    var i = torreEm(x, y);
    if (i >= 0) {   // tocar de novo na torre: mais um andar, até andaresMax
      var t = st.torres[i];
      if (t.andares >= cfg().andaresMax) return res(false, 'plim');
      t.andares++;
      return res(true, 'estrela');
    }
    var ce = celula(x, y);
    if (!ce || st.torres.length >= cfg().torresMax) return res(false, 'toque');
    var tx = Math.max(AREIA.x + 6, Math.min(AREIA.x + AREIA.w - 7, Math.round(x)));
    var ty = AREIA.y + ce.l * CEL + CEL - 1;
    var perto = st.torres.some(function (o) { return Math.abs(o.x - tx) < TORRE_LARG && Math.abs(o.y - ty) < 5; });
    var r = null;
    for (var q in QUEM) { var b = corpo(q); if (tx + 6 > b.x - 1 && tx - 6 < b.x + b.w + 1 && ty >= b.pe - 6) r = q; }
    if (perto || r) return res(false, 'toque');
    st.torres.push({ x: tx, y: ty, base: altura(ce.c, ce.l), andares: 1 });
    return res(true, 'selecionar');
  }
  function enfeitar(x, y, tipo) {
    if (ENFEITES.indexOf(tipo) < 0 || quem(x, y)) return res(false, 'toque');
    var i = torreEm(x, y), e;
    if (i >= 0) {
      var t = st.torres[i], ja = st.enfeites.filter(function (o) { return o.torre === t; }).length;
      e = { tipo: tipo, torre: t, dx: [0, -3, 3, -1, 1][ja % 5] };
    } else {
      var ce = celula(x, y);
      if (!ce) return res(false, 'toque');
      e = { tipo: tipo, x: Math.round(x), y: Math.round(y), c: ce.c, l: ce.l };
    }
    st.enfeites.push(e);
    while (st.enfeites.length > cfg().enfeitesMax) st.enfeites.shift();   // passou do máximo: o mais antigo sai
    return res(true, 'plim');
  }
  function tirarEnfeitesPerto(x, y, raio) {
    var antes = st.enfeites.length;
    st.enfeites = st.enfeites.filter(function (e) { return e.torre || Math.abs(e.x - x) > raio || Math.abs(e.y - y) > raio; });
    return st.enfeites.length !== antes;
  }
  var FERRAMENTAS = { cavar: cavar, amontoar: amontoar, alisar: alisar, castelo: castelo, enfeite: enfeitar };
  var CONTINUAS = { cavar: 1, amontoar: 1, alisar: 1 };   // essas agem pelo caminho do dedo

  function usar(ferr, x, y, tipo) {
    var f = FERRAMENTAS[ferr];
    if (!f) return res(false);
    var r = f(x, y, tipo);
    if (r.mudou) st.versao++;
    return r;
  }
  // junta os resultados de várias passadas: a risada vale mais que o som de cada uma
  function somar(a, b) { return res(a.mudou || b.mudou, b.risada ? b.som : (a.risada ? a.som : (b.som || a.som)), a.risada || b.risada); }
  // por onde o dedo passa: uma passada por célula nova (em cima dela ou do unicórnio, a cada 4 px)
  function chaveDo(x, y) {
    var q = quem(x, y);
    if (q) return q + ':' + Math.floor(x / 4) + ',' + Math.floor(y / 4);
    var ce = celula(x, y);
    return ce ? ce.c + ',' + ce.l : 'fora';
  }

  /* ---------- a queda do balanço ---------- */
  function tombo() {
    MARCAS.forEach(function (m) {
      var marcadas = {};
      m.d.forEach(function (linha, j) {
        for (var i = 0; i < linha.length; i++) if (linha[i] === '#') marcadas[(m.c + i) + ',' + (m.l + j)] = true;
      });
      Object.keys(marcadas).forEach(function (k) {
        var p = k.split(',').map(Number), c = p[0], l = p[1];
        var miolo = marcadas[(c + 1) + ',' + l] && marcadas[(c - 1) + ',' + l] && marcadas[c + ',' + (l + 1)] && marcadas[c + ',' + (l - 1)];
        poe(c, l, Math.min(altura(c, l), miolo ? -2 : -1));
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {   // a areia espirrada em volta
          var cc = c + d[0], ll = l + d[1];
          if (!marcadas[cc + ',' + ll] && altura(cc, ll) >= 0 && altura(cc, ll) < 2 && !soboCorpo(cc, ll)) poe(cc, ll, altura(cc, ll) + 1);
        });
      });
      // a torre que estava onde eles caíram desmancha
      for (var i = st.torres.length - 1; i >= 0; i--) {
        var ce = celula(st.torres[i].x, st.torres[i].y);
        if (ce && marcadas[ce.c + ',' + ce.l]) tirarTorre(i);
      }
    });
    st.tombos++; st.versao++;
    mostrarNoParque();
    return true;
  }
  // a caixa do parque redesenha a parte parada (o interior só refaz o desenho quando pedem)
  function mostrarNoParque() {
    st.versaoMundo = st.versao;
    var I = R.Interiores;
    if (I && I.refazer) { try { I.refazer('parquinho'); } catch (e) { console.error(e); } }
  }

  var A = R.ParquinhoAreia = {
    W: W, H: H, CEL: CEL, AREIA: AREIA, COLS: COLS, LINS: LINS, MIN: MIN, MAX: MAX, QUEM: QUEM, ANDAR: ANDAR,
    TORRE_LARG: TORRE_LARG, ENFEITES: ENFEITES,
    estado: function () { return st; },
    altura: altura, celula: celula, quem: quem, corpo: corpo, torreEm: torreEm, alturaTorre: alturaTorre,
    // o desenho de verdade dela e do unicórnio (o bebê é menor): areia-desenho.js mede e avisa
    medir: function (q, w, h) { if (QUEM[q] && w > 0 && h > 0) corpos[q] = { w: w, h: h }; },
    // um toque (ou Enter): a ferramenta age uma vez no ponto (px de arte da caixa de perto)
    usar: usar,
    // arrastar: comecar no toque, mover a cada passo do dedo (age pelo caminho, de 1 em 1 px), soltar no fim
    comecar: function (ferr, x, y, tipo) {
      gesto = { ferr: ferr, tipo: tipo, x: x, y: y, chave: chaveDo(x, y) };
      return usar(ferr, x, y, tipo);
    },
    mover: function (x, y) {
      var g = gesto, total = res(false);
      if (!g || !CONTINUAS[g.ferr]) return total;
      var dx = x - g.x, dy = y - g.y, n = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy))));
      for (var k = 1; k <= n; k++) {
        var px = g.x + dx * k / n, py = g.y + dy * k / n, ch = chaveDo(px, py);
        if (ch === g.chave) continue;
        g.chave = ch;
        g.dir = Math.abs(dx) >= Math.abs(dy) ? { x: 1, y: 0 } : { x: 0, y: 1 };   // a direção do arrasto (a bordinha vai para os lados)
        if (ch !== 'fora') total = somar(total, usar(g.ferr, px, py, g.tipo));
      }
      g.x = x; g.y = y;
      return total;
    },
    soltar: function () { gesto = null; },
    tombo: tombo,
    // a tela fechou: o desenho parado da caixa passa a mostrar o que ela fez
    fechou: function () { if (st.versaoMundo !== st.versao) mostrarNoParque(); },
    temCastelo: function () { return st.torres.length > 0; },
    // a chave do desenho parado da caixa do parque: com a tela de perto aberta, a de quando ela abriu (o parque atrás
    // não se refaz a cada passada); sem tela, a de agora (fechar por qualquer caminho atualiza)
    chaveMundo: function () {
      var UI = R.UI;
      if (!(UI && UI.temTela && UI.temTela())) st.versaoMundo = st.versao;
      return 'v' + st.versaoMundo;
    },
    zerar: function () { st = novo(); gesto = null; },
    depurar: function () {
      var buracos = 0, montes = 0;
      st.alt.forEach(function (v) { if (v < 0) buracos++; else if (v > 0) montes++; });
      return {
        torres: st.torres.map(function (t) { return t.andares; }), enfeites: st.enfeites.map(function (e) { return e.tipo + (e.torre ? '@torre' : ''); }),
        cobre: { ela: st.cobre.ela, uni: st.cobre.uni }, risadas: { ela: st.risadas.ela, uni: st.risadas.uni },
        buracos: buracos, montes: montes, tombos: st.tombos, versao: st.versao,
      };
    },
  };
  // o contrato com o balanço (poses-balanco.js): ela e o unicórnio caíram na caixa
  P.areiaTombo = function () { return A.tombo(); };
})();
