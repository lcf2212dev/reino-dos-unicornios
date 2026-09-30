/* Interiores, biblioteca de objetos 3/3: enfeites e coisas NO CHÃO (plantas, flores, vasos, baú,
   caixote, barril, pedestal, vitrine, lareira, fonte, bebedouro, cabideiro, globo, livros, papéis,
   almofada, luminária, cesto, balde, placa, cavalete, relógio de pé). Veio de motor/interiores.js.
   Cada objeto('tipo', {...}) entra em Reino._interiores.OBJETOS. Sem DOM no carregamento. */
(function () {
  var R = window.Reino;
  var D = R.Desenho, C = D.C, K = D.K;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet,
    matriz = D.matriz, sorte = D.sorte, misturar = D.misturar, escurecer = D.escurecer, clarear = D.clarear,
    brilho = D.brilho, miudeza = D.miudeza;
  var II = R._interiores, T = II.T, OBJETOS = II.OBJETOS, objeto = II.objeto, larg = II.larg, cor = II.cor;
  var LIVROS = II.LIVROS;

  // kit comum (cesto, vaso-grande, papéis): cada prédio com o seu. O desenho acha o prédio do objeto
  // procurando a entrada igual (tipo, x, y, var) em Reino.interiores; var.cor/var.conteudo mandam.
  function predioDe(o) {
    if (o.__predio !== undefined) return o.__predio;
    var ids = [];
    (R.interiores || []).forEach(function (d) {
      if ((d.objetos || []).some(function (e) { return e.tipo === o.tipo && e.x === o.x && e.y === o.y && e.var === o.var; })) ids.push(d.id);
    });
    var id = ids.join('+');
    try { Object.defineProperty(o, '__predio', { value: id }); } catch (e) { /* congelado: procura de novo */ }
    return id;
  }
  function hash(s) { var n = 7; for (var i = 0; i < s.length; i++) n = (Math.imul(n, 31) + s.charCodeAt(i)) | 0; return n >>> 0; }
  function kitDe(o, tabela, lista) {
    var id = predioDe(o), base = id.split('-')[0];
    return tabela[id] || tabela[base] || lista[hash(id) % lista.length];
  }
  // cesto: [palha, conteúdo, cores do conteúdo]
  var CESTOS = {
    castelo: ['#d9a93a', 'novelos', [C.roxo, C.ouro]], escola: ['#e7b870', 'lapis', [C.vermelho, C.azul, C.verde]],
    estabulo: ['#c98a4b', 'cenouras', [C.laranja]], loja: ['#f0c98a', 'bolinhas', [C.rosa, C.ouro]],
    petshop: ['#b58a5a', 'ossinhos', [C.creme]], salao: ['#e2a8c0', 'toalhas', [C.rosa2, C.branco]],
    bau: ['#d9a93a', 'bolinhas', [C.ouro, C.ouro3]]
  };
  var CESTOS_LISTA = [['#e7b870', 'frutas', [C.vermelho, C.verde]], ['#c9a878', 'novelos', [C.azul, C.lilas]],
    ['#dcb98c', 'bolinhas', [C.verde, C.laranja]], ['#b8905e', 'frutas', [C.laranja, C.ouro]],
    ['#e8c49a', 'lapis', [C.roxo, C.ouro, C.rosa]], ['#d0a070', 'novelos', [C.vermelho, C.creme]]];
  // vaso-grande: [corpo, faixa]
  var VASOS = {
    bau: ['#d9a93a', '#fff3a0'], escola: ['#6fb86f', C.creme], castelo: ['#7c5cff', C.ouro], salao: ['#ff9cc6', C.branco],
    geografia: ['#e07a4a', '#ffe0b0'], museu: ['#c8507a', C.ouro]
  };
  var VASOS_LISTA = [['#5f8bd6', C.branco], ['#3eaea3', '#d9fff4'], ['#b58cff', C.creme], ['#e07a4a', C.creme],
    ['#6fdc8c', C.branco], ['#ff8a3d', C.ouro3], ['#8a94aa', C.azul2]];
  var FITAS = [C.rosa, C.azul, C.verde, C.lilas, C.laranja, C.vermelho, C.ouro2];

  objeto('vaso-planta', { w: 1, h: 1, topo: 12, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var cx = px + 8, v = cor(o, 'vaso', C.terracota);
      ret(ctx, cx - 5, py + 4, 11, 3, K); ret(ctx, cx - 4, py + 5, 9, 1, clarear(v, 0.3));
      ret(ctx, cx - 4, py + 6, 9, 9, K); ret(ctx, cx - 3, py + 7, 7, 7, v); ret(ctx, cx - 3, py + 7, 2, 7, clarear(v, 0.2)); ret(ctx, cx + 2, py + 7, 2, 7, escurecer(v, 0.15));
      [[-4, -3, 4, 4], [4, -5, 4, 4], [0, -9, 4, 5], [-5, -9, 3, 3], [5, -10, 3, 3], [0, 1, 5, 3]].forEach(function (f) {
        elipse(ctx, cx + f[0], py + f[1], f[2] + 1, f[3] + 1, K);
      });
      [[-4, -3, 4, 4, C.folha], [4, -5, 4, 4, C.folha3], [0, -9, 4, 5, C.folha], [-5, -9, 3, 3, C.folha2], [5, -10, 3, 3, C.folha], [0, 1, 5, 3, C.folha3]].forEach(function (f) {
        elipse(ctx, cx + f[0], py + f[1], f[2], f[3], f[4]);
      });
      ret(ctx, cx - 5, py - 5, 2, 1, C.folha4); ret(ctx, cx - 1, py - 12, 2, 1, C.folha4); ret(ctx, cx + 3, py - 7, 2, 1, C.folha4);
    } });
  objeto('planta-alta', { w: 1, h: 1, topo: 22, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var cx = px + 8, v = cor(o, 'vaso', '#f6f0ff');
      ret(ctx, cx - 4, py + 5, 9, 10, K); ret(ctx, cx - 3, py + 6, 7, 8, v); ret(ctx, cx - 3, py + 8, 7, 1, C.lilas);
      ret(ctx, cx, py - 6, 1, 11, C.folha3);
      [[-6, -14, -1], [6, -12, 1], [-5, -6, -1], [5, -3, 1], [0, -20, 0]].forEach(function (f) {
        var fx = cx + f[0], fy = py + f[1];
        elipse(ctx, fx, fy, 4, 3, K); elipse(ctx, fx, fy, 3, 2, f[2] ? C.folha : C.folha2);
        ret(ctx, fx - 2, fy, 5, 1, C.folha3); ret(ctx, fx - 1, fy - 1, 1, 1, C.folha4);
      });
      ret(ctx, cx - 3, py - 11, 3, 1, C.folha3); ret(ctx, cx + 1, py - 9, 3, 1, C.folha3);
    } });
  objeto('flores', { w: 1, h: 1, topo: 2, solido: true,
    desenhar: function (ctx, px, py, o) {
      var cx = px + 8, v = cor(o, 'vaso', C.azul);
      ret(ctx, cx - 4, py + 8, 9, 7, K); ret(ctx, cx - 3, py + 9, 7, 5, v); ret(ctx, cx - 3, py + 9, 7, 1, clarear(v, 0.4));
      ret(ctx, cx - 2, py + 4, 1, 4, C.folha3); ret(ctx, cx + 2, py + 3, 1, 5, C.folha3); ret(ctx, cx, py + 5, 1, 3, C.folha3);
      var cs = (o.var && o.var.cores) || [C.rosa, C.ouro, C.laranja];
      [[-3, 2], [2, 0], [0, 4]].forEach(function (f, i) {
        var x = cx + f[0], y = py + f[1], c = cs[i % cs.length];
        ret(ctx, x - 1, y - 1, 3, 3, K); ret(ctx, x - 1, y, 3, 1, c); ret(ctx, x, y - 1, 1, 3, c); ret(ctx, x, y, 1, 1, C.ouro3);
      });
      ret(ctx, cx - 5, py + 7, 2, 1, C.folha); ret(ctx, cx + 4, py + 6, 2, 1, C.folha);
    } });
  objeto('vaso-grande', { w: 1, h: 1, topo: 8, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var k = kitDe(o, VASOS, VASOS_LISTA), cx = px + 8, c = cor(o, 'cor', k[0]), f = cor(o, 'faixa', k[1]);
      ret(ctx, cx - 3, py - 8, 7, 3, K); ret(ctx, cx - 2, py - 7, 5, 1, clarear(c, 0.4));
      elipse(ctx, cx, py + 5, 7, 9, K); elipse(ctx, cx, py + 5, 6, 8, c);
      elipse(ctx, cx + 1, py + 8, 4, 4, escurecer(c, 0.15)); elipse(ctx, cx, py + 6, 4, 5, c);
      ret(ctx, cx - 2, py - 5, 5, 2, c);
      ret(ctx, cx - 6, py + 3, 13, 2, f); ret(ctx, cx - 5, py + 7, 11, 1, clarear(c, 0.55));
      for (var i = -4; i <= 4; i += 4) ret(ctx, cx + i, py + 3, 1, 2, c);
      ret(ctx, cx - 4, py - 1, 1, 3, clarear(c, 0.5));
      ret(ctx, cx - 3, py + 14, 7, 1, K);
    } });
  objeto('bau', { w: 1, h: 1, topo: 3, solido: true,
    desenhar: function (ctx, px, py, o) {
      var c = cor(o, 'cor', C.madeira);
      ret(ctx, px + 1, py - 1, 14, 16, K);
      ret(ctx, px + 2, py, 12, 5, escurecer(c, 0.1)); ret(ctx, px + 2, py, 12, 1, clarear(c, 0.35));
      ret(ctx, px + 1, py + 5, 14, 1, K);
      ret(ctx, px + 2, py + 6, 12, 8, c); ret(ctx, px + 2, py + 6, 12, 1, clarear(c, 0.25));
      ret(ctx, px + 4, py, 2, 14, C.ouro); ret(ctx, px + 10, py, 2, 14, C.ouro);
      ret(ctx, px + 5, py, 1, 14, C.ouro2); ret(ctx, px + 11, py, 1, 14, C.ouro2);
      ret(ctx, px + 7, py + 4, 3, 4, K); ret(ctx, px + 7, py + 5, 2, 2, C.ouro); ret(ctx, px + 7, py + 5, 1, 1, C.ouro3);
      if (o.var && o.var.moedas) { circulo(ctx, px + 3, py - 2, 1, C.ouro); circulo(ctx, px + 13, py - 2, 1, C.ouro); }
    } });
  objeto('caixote', { w: 1, h: 1, topo: 2, solido: true,
    desenhar: function (ctx, px, py, o) {
      var c = cor(o, 'cor', C.madeiraClara), e = escurecer(c, 0.25);
      contornoRet(ctx, px + 1, py - 1, 14, 16, c);
      ret(ctx, px + 2, py, 12, 2, clarear(c, 0.3));
      ret(ctx, px + 2, py + 4, 12, 1, e); ret(ctx, px + 2, py + 9, 12, 1, e);
      for (var i = 0; i < 10; i++) ret(ctx, px + 3 + i, py + 12 - i, 1, 2, e);
      ret(ctx, px + 2, py + 1, 1, 13, e); ret(ctx, px + 13, py + 1, 1, 13, e);
      if (o.var && o.var.item) miudeza(ctx, o.var.item, px + 8, py - 1);
    } });
  objeto('barril', { w: 1, h: 1, topo: 4, solido: true,
    desenhar: function (ctx, px, py, o) {
      var c = cor(o, 'cor', C.madeira), cx = px + 8;
      ret(ctx, cx - 6, py - 2, 13, 16, K); ret(ctx, cx - 5, py - 1, 11, 14, c);
      ret(ctx, cx - 7, py + 1, 15, 10, K); ret(ctx, cx - 6, py + 1, 13, 10, c);
      ret(ctx, cx - 4, py - 1, 2, 14, clarear(c, 0.25)); ret(ctx, cx + 3, py - 1, 2, 14, escurecer(c, 0.15));
      ret(ctx, cx - 6, py + 2, 13, 1, C.metal2); ret(ctx, cx - 6, py + 9, 13, 1, C.metal2);
      elipse(ctx, cx, py - 2, 5, 1, escurecer(c, 0.3)); ret(ctx, cx - 3, py - 3, 7, 1, clarear(c, 0.3));
    } });
  objeto('pedestal', { w: 1, h: 1, topo: 14, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var c = cor(o, 'cor', '#f4eee4'), e = escurecer(c, 0.15), cx = px + 8;
      ret(ctx, cx - 6, py + 10, 13, 5, K); ret(ctx, cx - 5, py + 11, 11, 3, e); ret(ctx, cx - 5, py + 11, 11, 1, c);
      ret(ctx, cx - 4, py - 1, 9, 12, K); ret(ctx, cx - 3, py - 1, 7, 12, c);
      ret(ctx, cx - 1, py, 1, 10, e); ret(ctx, cx + 2, py, 1, 10, e); ret(ctx, cx - 3, py, 1, 10, clarear(c, 0.5));
      ret(ctx, cx - 6, py - 4, 13, 4, K); ret(ctx, cx - 5, py - 3, 11, 2, c); ret(ctx, cx - 5, py - 3, 11, 1, C.branco);
      miudeza(ctx, (o.var && o.var.item) || 'vaso', cx, py - 4);
    } });
  objeto('vitrine', { w: 2, h: 1, topo: 12, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var W = larg(o), x = px + 1, w = W - 2, c = cor(o, 'cor', C.madeira);
      contornoRet(ctx, x, py + 3, w, 12, c);
      ret(ctx, x + 1, py + 4, w - 2, 1, clarear(c, 0.35)); ret(ctx, x + 3, py + 7, w - 6, 5, escurecer(c, 0.15));
      ret(ctx, x + Math.floor(w / 2) - 2, py + 9, 4, 1, C.ouro);
      ret(ctx, x, py - 12, w, 16, K);
      ret(ctx, x + 1, py - 11, w - 2, 14, '#e2f4fb');
      var itens = (o.var && o.var.itens) || ['medalha', 'gema', 'coroa'];
      var passo = (w - 4) / itens.length;
      itens.forEach(function (it, n) { miudeza(ctx, it, Math.round(x + 2 + passo * (n + 0.5)), py + 3); });
      ret(ctx, x + 2, py - 10, 1, 6, 'rgba(255,255,255,0.9)'); ret(ctx, x + 4, py - 10, 1, 3, 'rgba(255,255,255,0.8)');
      ret(ctx, x + w - 4, py - 3, 1, 4, 'rgba(255,255,255,0.7)');
      ret(ctx, x - 1, py - 14, w + 2, 3, K); ret(ctx, x, py - 13, w, 1, clarear(c, 0.3));
    } });
  objeto('lareira', { w: 2, h: 1, topo: 24, solido: true, alto: false,
    desenhar: function (ctx, px, py, o) {
      var W = larg(o), x = px, w = W, pedra = cor(o, 'cor', '#e8d8c4');
      contornoRet(ctx, x, py - 20, w, 35, pedra);
      for (var r = 0; r < 6; r++) for (var b = 0; b < 5; b++) {
        var bx = x + 1 + b * 7 - (r % 2) * 3, by = py - 19 + r * 6;
        if (bx < x + 1 || bx > x + w - 3) continue;
        ret(ctx, bx, by + 5, Math.min(6, x + w - 1 - bx), 1, escurecer(pedra, 0.15));
        ret(ctx, bx + 6 < x + w - 1 ? bx + 6 : x + w - 2, by, 1, 5, escurecer(pedra, 0.12));
      }
      ret(ctx, x - 2, py - 24, w + 4, 5, K); ret(ctx, x - 1, py - 23, w + 2, 3, C.madeira); ret(ctx, x - 1, py - 23, w + 2, 1, C.madeiraClara);
      miudeza(ctx, 'vela', x + 4, py - 24); miudeza(ctx, 'relogio', x + w / 2, py - 24); miudeza(ctx, 'vela', x + w - 4, py - 24);
      ret(ctx, x + 5, py - 12, w - 10, 24, K);
      elipse(ctx, x + w / 2 - 0.5, py - 12, (w - 10) / 2, 4, K);
      ret(ctx, x + 6, py - 11, w - 12, 23, '#4a2a3e');
      elipse(ctx, x + w / 2 - 0.5, py - 11, (w - 12) / 2, 3, '#4a2a3e');
      ret(ctx, x + 7, py + 8, w - 14, 3, C.madeira3); ret(ctx, x + 8, py + 7, w - 16, 2, C.madeira2);
      ret(ctx, x + 1, py + 12, w - 2, 2, escurecer(pedra, 0.2));
    },
    anim: function (ctx, px, py, t) {
      var cx = px + 16, f = t / 110;
      elipse(ctx, cx, py + 18, 13, 3, 'rgba(255,170,80,' + (0.16 + Math.sin(t / 300) * 0.04).toFixed(3) + ')');
      for (var i = -2; i <= 2; i++) {
        var h = 7 + Math.round(Math.sin(f + i * 1.7) * 2) - Math.abs(i);
        ret(ctx, cx + i * 2 - 1, py + 8 - h, 2, h, i % 2 ? C.laranja : C.vermelho);
        ret(ctx, cx + i * 2 - 1, py + 8 - Math.max(1, h - 3), 2, Math.max(1, h - 3), C.ouro);
      }
      ret(ctx, cx - 1, py + 3 - Math.round(Math.sin(f) * 1), 2, 3, C.ouro3);
      var faisca = Math.floor(t / 90) % 12;
      if (faisca < 4) ret(ctx, cx - 3 + faisca * 2, py - 4 - faisca, 1, 1, C.ouro3);
    } });
  objeto('fonte', { w: 2, h: 2, solido: true,
    desenhar: function (ctx, px, py, o) {
      var cx = px + 16, cy = py + 21, pedra = cor(o, 'cor', '#f3e6c8');
      elipse(ctx, cx, cy, 14, 8, K); elipse(ctx, cx, cy, 13, 7, pedra); elipse(ctx, cx, cy - 1, 11, 5, clarear(pedra, 0.3));
      elipse(ctx, cx, cy - 1, 10, 4, C.agua); elipse(ctx, cx, cy, 6, 2, C.agua3);
      ret(ctx, cx - 2, py + 5, 5, 15, K); ret(ctx, cx - 1, py + 5, 3, 15, C.branco);
      elipse(ctx, cx, py + 6, 6, 2, K); elipse(ctx, cx, py + 6, 5, 1, pedra); ret(ctx, cx - 3, py + 5, 6, 1, C.agua);
      ret(ctx, cx - 13, cy + 3, 27, 1, escurecer(pedra, 0.2));
    },
    anim: function (ctx, px, py, t) {
      var cx = px + 16;
      for (var g = 0; g < 6; g++) {
        var f = ((t / 800) + g / 6) % 1, lado = g % 2 ? 1 : -1;
        var gx = cx + lado * (2 + f * 8), gy = py + 4 - Math.sin(f * Math.PI) * 5 + f * 14;
        ret(ctx, Math.round(gx), Math.round(gy), 1, 2, f < 0.8 ? C.azul2 : C.branco);
      }
      var anel = (t / 900) % 1, m = 2 + Math.round(anel * 7);
      ret(ctx, cx - m, py + 20, m * 2, 1, 'rgba(255,255,255,' + (0.8 * (1 - anel)).toFixed(2) + ')');
      ret(ctx, cx - 1, py + 2, 2, 3, C.azul2);
    } });
  objeto('bebedouro', { w: 1, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 5, py + 1, 11, 14, K); ret(ctx, cx - 4, py + 2, 9, 12, '#f0f4fa'); ret(ctx, cx + 2, py + 2, 2, 12, '#d6dee9');
      ret(ctx, cx - 2, py + 5, 5, 2, K); ret(ctx, cx - 1, py + 5, 1, 1, C.azul); ret(ctx, cx + 1, py + 5, 1, 1, C.vermelho);
      ret(ctx, cx - 4, py + 12, 9, 2, '#c8d2e0');
      ret(ctx, cx - 4, py - 10, 9, 11, K); ret(ctx, cx - 3, py - 9, 7, 10, '#a8dcff');
      ret(ctx, cx - 3, py - 9, 7, 2, '#d6f0ff'); ret(ctx, cx - 2, py - 7, 1, 6, C.branco);
    },
    anim: function (ctx, px, py, t) {
      var f = (t / 1200) % 1;
      ret(ctx, px + 9, Math.round(py - f * 7), 1, 1, C.branco);
      ret(ctx, px + 7, Math.round(py - ((f + 0.5) % 1) * 7), 1, 1, '#e6f7ff');
    } });
  objeto('cabideiro', { w: 1, h: 1, topo: 16, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var cx = px + 8, c = cor(o, 'cor', C.madeira2);
      ret(ctx, cx - 5, py + 13, 11, 2, K); ret(ctx, cx - 4, py + 13, 9, 1, c);
      ret(ctx, cx - 1, py - 14, 3, 28, K); ret(ctx, cx, py - 14, 1, 27, c);
      ret(ctx, cx - 4, py - 12, 9, 1, K); ret(ctx, cx - 5, py - 13, 1, 1, K); ret(ctx, cx + 5, py - 13, 1, 1, K);
      var ch = cor(o, 'chapeu', C.roxo);
      ret(ctx, cx - 6, py - 15, 7, 2, K); ret(ctx, cx - 5, py - 18, 5, 3, K); ret(ctx, cx - 4, py - 17, 3, 2, ch); ret(ctx, cx - 5, py - 15, 5, 1, ch);
      ret(ctx, cx - 4, py - 16, 3, 1, C.ouro);
      var ca = cor(o, 'cachecol', C.rosa);
      ret(ctx, cx + 1, py - 12, 4, 12, K); ret(ctx, cx + 2, py - 12, 2, 11, ca);
      for (var i = 0; i < 11; i += 3) ret(ctx, cx + 2, py - 12 + i, 2, 1, C.branco);
    } });
  objeto('globo', { w: 1, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8, cy = py - 2;
      ret(ctx, cx - 4, py + 12, 9, 3, K); ret(ctx, cx - 3, py + 12, 7, 1, C.madeira);
      ret(ctx, cx - 1, py + 6, 3, 7, K); ret(ctx, cx, py + 6, 1, 6, C.madeira);
      circulo(ctx, cx, cy, 7, K); circulo(ctx, cx, cy, 6, C.azul);
      matriz(ctx, cx - 5, cy - 5, ['...gg.....', '..gggg.g..', '.gggg..gg.', '..gg...ggg', '...g....gg', '.......gg.', '..gg...g..', '..ggg.....', '...g......'], { g: C.verde });
      ret(ctx, cx - 4, cy - 4, 2, 1, 'rgba(255,255,255,0.7)');
      for (var j = -7; j <= 7; j++) { var dx = Math.round(Math.sqrt(Math.max(0, 64 - j * j))); ret(ctx, cx + dx, cy + j, 1, 1, C.ouro2); }
    } });
  objeto('pilha-livros', { w: 1, h: 1, topo: 2, solido: true,
    desenhar: function (ctx, px, py, o) {
      var b = py + 15;
      for (var i = 0; i < 4; i++) {
        var w = 12 - (i % 2) * 2 - Math.floor(sorte(o.x, o.y, i) * 2), x = px + 2 + Math.floor((12 - w) / 2) + (i % 2 ? 1 : -1) * (i > 1 ? 1 : 0);
        var cl = LIVROS[(o.x * 3 + o.y + i * 2) % LIVROS.length];
        ret(ctx, x, b - 4, w, 4, K); ret(ctx, x + 1, b - 4, w - 2, 3, cl); ret(ctx, x + 1, b - 2, w - 3, 1, C.creme);
        b -= 4;
      }
    } });
  // papéis: pilha arrumada e amarrada com fita (não papel solto no chão)
  objeto('papeis', { w: 1, h: 1, solido: false, semSombra: true, plano: true,
    desenhar: function (ctx, px, py, o) {
      var fita = cor(o, 'cor', FITAS[hash(predioDe(o)) % FITAS.length]);
      ret(ctx, px + 1, py + 15, 14, 1, 'rgba(58,36,70,0.22)');
      ret(ctx, px + 2, py + 5, 12, 10, K);
      [[3, 12, '#f3e6c8'], [3, 10, C.branco], [3, 8, '#fff6d8'], [3, 6, C.branco]].forEach(function (f) {
        ret(ctx, px + f[0], py + f[1], 10, 2, f[2]); ret(ctx, px + f[0], py + f[1] + 1, 10, 1, '#c4b4d4');
      });
      ret(ctx, px + 3, py + 6, 10, 1, C.branco); ret(ctx, px + 4, py + 7, 6, 1, '#c4b4d4');
      ret(ctx, px + 7, py + 6, 2, 8, fita); ret(ctx, px + 7, py + 6, 1, 8, clarear(fita, 0.35));
      ret(ctx, px + 5, py + 3, 2, 2, K); ret(ctx, px + 9, py + 3, 2, 2, K); ret(ctx, px + 6, py + 4, 1, 1, fita); ret(ctx, px + 9, py + 4, 1, 1, fita);
    } });
  objeto('almofada', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py, o) {
      var c = cor(o, 'cor', C.ouro);
      elipse(ctx, px + 8, py + 13, 6, 2, 'rgba(58,36,70,0.16)');
      ret(ctx, px + 2, py + 4, 12, 10, K); ret(ctx, px + 3, py + 3, 10, 12, K);
      ret(ctx, px + 3, py + 4, 10, 10, c); ret(ctx, px + 3, py + 4, 10, 2, clarear(c, 0.4)); ret(ctx, px + 3, py + 12, 10, 2, escurecer(c, 0.2));
      ret(ctx, px + 7, py + 8, 2, 2, escurecer(c, 0.35));
      ret(ctx, px + 1, py + 3, 1, 1, c); ret(ctx, px + 14, py + 3, 1, 1, c); ret(ctx, px + 1, py + 14, 1, 1, c); ret(ctx, px + 14, py + 14, 1, 1, c);
    } });
  objeto('luminaria-pe', { w: 1, h: 1, topo: 18, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var cx = px + 8, c = cor(o, 'cor', C.rosa2);
      ret(ctx, cx - 4, py + 12, 9, 3, K); ret(ctx, cx - 3, py + 12, 7, 1, C.ouro);
      ret(ctx, cx - 1, py - 8, 3, 21, K); ret(ctx, cx, py - 8, 1, 20, C.ouro2);
      ctx.fillStyle = K;
      for (var j = 0; j < 9; j++) { var m = 3 + Math.round(j * 0.6); ctx.fillRect(cx - m - 1, py - 18 + j, m * 2 + 3, 1); }
      for (var k = 1; k < 8; k++) { var m2 = 3 + Math.round(k * 0.6); ret(ctx, cx - m2, py - 18 + k, m2 * 2 + 1, 1, k < 3 ? clarear(c, 0.35) : c); }
      ret(ctx, cx - 7, py - 11, 15, 1, C.ouro);
    },
    anim: function (ctx, px, py, t) {
      var cx = px + 8, a = 0.16 + Math.sin(t / 700) * 0.03;
      elipse(ctx, cx, py - 5, 7, 4, 'rgba(255,236,170,' + a.toFixed(3) + ')');
      ret(ctx, cx - 1, py - 10, 3, 2, C.ouro3);
    } });
  // o que vai por cima do cesto (desenhado antes da borda)
  var CONTEUDOS = {
    bolinhas: function (ctx, px, py, cs) {
      circulo(ctx, px + 5, py + 5, 3, K); circulo(ctx, px + 5, py + 5, 2, cs[0]);
      circulo(ctx, px + 10, py + 4, 3, K); circulo(ctx, px + 10, py + 4, 2, cs[1 % cs.length]);
      ret(ctx, px + 4, py + 4, 2, 1, C.branco); ret(ctx, px + 9, py + 3, 2, 1, C.branco);
    },
    novelos: function (ctx, px, py, cs) {
      [[5, 5, cs[0]], [10, 5, cs[1 % cs.length]]].forEach(function (n) {
        circulo(ctx, px + n[0], py + n[1], 3, K); circulo(ctx, px + n[0], py + n[1], 2, n[2]);
        ret(ctx, px + n[0] - 1, py + n[1] - 1, 3, 1, escurecer(n[2], 0.25)); ret(ctx, px + n[0] - 1, py + n[1] + 1, 3, 1, escurecer(n[2], 0.25));
      });
      ret(ctx, px + 12, py + 6, 1, 4, cs[1 % cs.length]);
    },
    frutas: function (ctx, px, py, cs) {
      [[4, 5, cs[0]], [8, 4, cs[1 % cs.length]], [11, 5, cs[0]]].forEach(function (n) {
        circulo(ctx, px + n[0], py + n[1], 2, K); ret(ctx, px + n[0] - 1, py + n[1] - 1, 3, 3, n[2]);
        ret(ctx, px + n[0] - 1, py + n[1] - 1, 1, 1, clarear(n[2], 0.5)); ret(ctx, px + n[0], py + n[1] - 3, 1, 1, C.folha3);
      });
    },
    lapis: function (ctx, px, py, cs) {
      [3, 6, 9, 12].forEach(function (x, i) {
        var c = cs[i % cs.length], y = py + 1 + (i % 2);
        ret(ctx, px + x - 1, y, 3, 6, K); ret(ctx, px + x, y + 1, 1, 5, c); ret(ctx, px + x, y, 1, 1, C.madeiraClara);
      });
    },
    cenouras: function (ctx, px, py, cs) {
      [4, 8, 12].forEach(function (x, i) {
        var y = py + 2 + (i % 2);
        ret(ctx, px + x - 1, y, 3, 5, K); ret(ctx, px + x, y + 1, 1, 4, cs[0]);
        ret(ctx, px + x - 1, y - 2, 1, 2, C.folha3); ret(ctx, px + x + 1, y - 2, 1, 2, C.folha);
      });
    },
    ossinhos: function (ctx, px, py, cs) {
      [[3, 4], [8, 3]].forEach(function (n) {
        ret(ctx, px + n[0], py + n[1], 6, 4, K);
        ret(ctx, px + n[0] + 1, py + n[1] + 1, 4, 2, cs[0]); ret(ctx, px + n[0] + 1, py + n[1] + 1, 4, 1, C.branco);
      });
    },
    toalhas: function (ctx, px, py, cs) {
      [[2, 3, cs[0]], [8, 3, cs[1 % cs.length]]].forEach(function (n) {
        ret(ctx, px + n[0], py + n[1], 6, 4, K); ret(ctx, px + n[0] + 1, py + n[1] + 1, 4, 2, n[2]);
        ret(ctx, px + n[0] + 1, py + n[1] + 1, 4, 1, clarear(n[2], 0.4)); ret(ctx, px + n[0] + 4, py + n[1] + 2, 1, 1, escurecer(n[2], 0.25));
      });
    }
  };
  objeto('cesto', { w: 1, h: 1, topo: 2, solido: true,
    desenhar: function (ctx, px, py, o) {
      var k = kitDe(o, CESTOS, CESTOS_LISTA), c = cor(o, 'cor', k[0]);
      var tipo = (o.var && o.var.conteudo) || k[1], cs = (o.var && o.var.cores) || k[2];
      (CONTEUDOS[tipo] || CONTEUDOS.bolinhas)(ctx, px, py, cs);
      ret(ctx, px + 1, py + 6, 14, 9, K); ret(ctx, px + 2, py + 7, 12, 7, c);
      for (var j = 0; j < 3; j++) for (var i = 0; i < 6; i++) ret(ctx, px + 2 + i * 2 + (j % 2), py + 8 + j * 2, 1, 1, escurecer(c, 0.2));
      ret(ctx, px + 1, py + 6, 14, 1, escurecer(c, 0.35)); ret(ctx, px + 2, py + 7, 12, 1, clarear(c, 0.3));
    } });
  objeto('balde', { w: 1, h: 1, topo: 3, solido: true,
    desenhar: function (ctx, px, py, o) {
      var c = cor(o, 'cor', C.metal), cx = px + 8;
      for (var i = -5; i <= 5; i++) ret(ctx, cx + i, py - 1 + Math.round(Math.abs(i) * Math.abs(i) / 8), 1, 1, K);
      ret(ctx, cx - 6, py + 4, 13, 11, K); ret(ctx, cx - 5, py + 5, 11, 9, c);
      ret(ctx, cx - 5, py + 5, 11, 2, C.agua); ret(ctx, cx - 3, py + 5, 3, 1, C.agua2);
      ret(ctx, cx - 5, py + 8, 11, 1, C.metal2); ret(ctx, cx - 4, py + 9, 2, 4, clarear(c, 0.4));
      ret(ctx, cx - 5, py + 13, 11, 1, C.metal2);
    } });
  var ICONES_PLACA = {
    coracao: ['.rr.rr.', 'rrrrrrr', 'rrrrrrr', '.rrrrr.', '..rrr..', '...r...'],
    seta: ['...y...', '..yyy..', '.yyyyy.', '...y...', '...y...', '...y...'],
    estrela: ['...y...', '..yyy..', 'yyyyyyy', '.yyyyy.', '.yy.yy.', 'y.....y'],
    moeda: ['..yyy..', '.yyYyy.', 'yyYyyyy', 'yyYyyyy', '.yyYyy.', '..yyy..'],
    livro: ['bbb.ppp', 'bwb.pwp', 'bwb.pwp', 'bbbkppp', 'bbbkppp', '..kkk..'],
  };
  objeto('placa-chao', { w: 1, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var c = cor(o, 'cor', C.creme);
      ret(ctx, px + 3, py + 4, 2, 11, K); ret(ctx, px + 11, py + 4, 2, 11, K);
      ret(ctx, px + 4, py + 4, 1, 10, C.madeira); ret(ctx, px + 11, py + 4, 1, 10, C.madeira);
      contornoRet(ctx, px + 1, py - 10, 14, 14, C.madeira);
      ret(ctx, px + 2, py - 9, 12, 12, c);
      matriz(ctx, px + 4, py - 7, ICONES_PLACA[cor(o, 'icone', 'coracao')] || ICONES_PLACA.coracao,
        { r: C.rosa, y: C.ouro, Y: C.ouro3, b: C.azul, p: C.rosa, w: C.branco, k: K });
      ret(ctx, px + 7, py - 12, 2, 2, K);
    } });
  objeto('cavalete', { w: 1, h: 1, topo: 16, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var cx = px + 8;
      for (var j = 0; j < 28; j++) { ret(ctx, cx - 1 - Math.round(j / 5), py - 13 + j, 2, 1, C.madeira2); ret(ctx, cx + Math.round(j / 5), py - 13 + j, 2, 1, C.madeira2); }
      ret(ctx, cx, py - 15, 1, 25, C.madeira3);
      ret(ctx, px + 1, py - 15, 14, 14, K); ret(ctx, px + 2, py - 14, 12, 12, C.branco);
      [C.vermelho, C.laranja, C.ouro, C.verde, C.azul].forEach(function (c, i) {
        for (var a = 0; a < 10 - i * 2; a++) ret(ctx, px + 3 + i + a, py - 5 - i - Math.round(Math.sin(a / (9 - i * 2) * Math.PI) * (5 - i)), 1, 1, c);
      });
      ret(ctx, px + 2, py - 3, 12, 1, C.folha2);
      ret(ctx, px, py - 1, 16, 2, K); ret(ctx, px + 1, py - 1, 14, 1, C.madeiraClara);
      ret(ctx, px + 3, py - 2, 2, 1, C.rosa); ret(ctx, px + 10, py - 2, 3, 1, C.azul);
    } });
  objeto('relogio-pe', { w: 1, h: 1, topo: 20, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var cx = px + 8, c = cor(o, 'cor', C.madeira3);
      triangulo(ctx, cx - 6, py - 23, 13, 4, K);
      ret(ctx, cx - 6, py - 20, 13, 35, K); ret(ctx, cx - 5, py - 19, 11, 33, c);
      ret(ctx, cx - 5, py - 19, 11, 1, clarear(c, 0.4));
      circulo(ctx, cx, py - 13, 4, K); circulo(ctx, cx, py - 13, 3, C.creme);
      ret(ctx, cx, py - 15, 1, 3, K); ret(ctx, cx, py - 13, 2, 1, K);
      ret(ctx, cx - 3, py - 7, 7, 16, K); ret(ctx, cx - 2, py - 6, 5, 14, escurecer(c, 0.4));
      ret(ctx, cx - 5, py + 11, 11, 1, clarear(c, 0.25));
    },
    anim: function (ctx, px, py, t) {
      var cx = px + 8, a = Math.round(Math.sin(t / 600) * 1.6);
      ret(ctx, cx, py - 6, 1, 8, C.ouro2);
      circulo(ctx, cx + a, py + 4, 2, C.ouro); ret(ctx, cx + a - 1, py + 3, 1, 1, C.ouro3);
    } });
})();
