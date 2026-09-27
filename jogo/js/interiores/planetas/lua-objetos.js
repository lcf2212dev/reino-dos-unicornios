/* Planeta Lua, os objetos (prefixo lua-): crateras, pedras, cristais, bandeira do Reino, módulo lunar antigo,
   pegadas, placa, telescópio, jipe lunar, antena... As pedras grandes (o Tico escondido), a pedra que flutua
   e os cristais desenham o estado das brincadeiras (Reino._predios.planetas.lua, de lua-brincadeiras.js) no `anim`,
   que roda a cada quadro também sem Animações (com t = 0: parado). Nada de DOM nem canvas no carregamento. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo;
  var K = R.Desenho.K;
  var P = (R._predios = R._predios || {}).planetas = R._predios.planetas || {};
  var tempo = function (t) { return P.tempo ? P.tempo(t) : 0; };
  function L() { return P.lua || null; }
  // cores das rochas da Lua
  var RO = { luz: '#e4e4ee', claro: '#bcbccc', meio: '#9a9ab0', escuro: '#74748e', fundo: '#5c5c76' };
  var OURO = '#ffc94d', OURO2 = '#d99a2a', ROSA = '#ff8ac4', CIANO = '#6fd6ff', LILAS = '#c9a8ff';

  function sombra(ctx, cx, y, rx) { elipse(ctx, cx, y, rx, 2, 'rgba(60,60,90,0.28)'); }
  // pedra arredondada: contorno, corpo, luz em cima à esquerda
  function rocha(ctx, cx, cy, rx, ry) {
    elipse(ctx, cx, cy, rx + 1, ry + 1, K);
    elipse(ctx, cx, cy, rx, ry, RO.meio);
    elipse(ctx, cx - 1, cy - 1, rx - 2, ry - 2, RO.claro);
    ret(ctx, cx - Math.round(rx / 2), cy - ry + 2, 2, 1, RO.luz);
    ret(ctx, cx + Math.round(rx / 3), cy + Math.round(ry / 3), 2, 2, RO.escuro);
  }
  function brilho(ctx, x, y, cor) { ret(ctx, x, y - 1, 1, 3, cor); ret(ctx, x - 1, y, 3, 1, cor); }

  /* ---------- crateras ---------- */
  function cratera(ctx, cx, cy, rx, ry) {
    elipse(ctx, cx, cy, rx + 1, ry + 1, RO.escuro);
    elipse(ctx, cx, cy, rx, ry, RO.luz);
    elipse(ctx, cx, cy + 1, rx - 2, ry - 2, RO.meio);
    elipse(ctx, cx + 1, cy + 2, rx - 4, ry - 3, RO.claro);
  }
  // cratera grande (2×2); var.pula: a cama elástica da Lua, com estrelinhas na borda
  I.objeto('lua-cratera', { w: 2, h: 2, solido: true,
    desenhar: function (ctx, px, py, o) {
      cratera(ctx, px + 16, py + 17, 14, 10);
      if (o.var && o.var.pula) {
        for (var i = 0; i < 6; i++) {
          var a = i / 6 * Math.PI * 2;
          ret(ctx, px + 16 + Math.round(Math.cos(a) * 13), py + 17 + Math.round(Math.sin(a) * 9), 2, 2, i % 2 ? ROSA : OURO);
        }
      }
    },
    anim: function (ctx, px, py, t, o) {
      if (!(o.var && o.var.pula)) return;
      t = tempo(t);
      // setinhas de "pule aqui" subindo e descendo
      var d = t ? Math.round(Math.sin(t / 280) * 2) : 0;
      ret(ctx, px + 15, py + 12 + d, 2, 5, OURO); triangulo(ctx, px + 13, py + 8 + d, 6, 4, OURO);
    } });
  I.objeto('lua-cratera-p', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) { cratera(ctx, px + 8, py + 9, 6, 4); } });

  /* ---------- pedras ---------- */
  I.objeto('lua-pedra', { w: 1, h: 1, topo: 4, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 7);
      rocha(ctx, px + 7, py + 9, 6, 5); rocha(ctx, px + 12, py + 12, 3, 2);
    } });
  I.objeto('lua-seixos', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      [[3, 5], [9, 3], [12, 10], [5, 11], [8, 8]].forEach(function (s, i) {
        ret(ctx, px + s[0], py + s[1], 3, 2, RO.escuro); ret(ctx, px + s[0], py + s[1], 2, 1, i % 2 ? RO.luz : RO.claro);
      });
    } });
  I.objeto('lua-rocha-alta', { w: 1, h: 1, topo: 18, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 7);
      ret(ctx, px + 3, py - 12, 10, 26, K); ret(ctx, px + 4, py - 11, 8, 24, RO.meio);
      ret(ctx, px + 5, py - 16, 6, 5, K); ret(ctx, px + 6, py - 15, 4, 4, RO.claro);
      ret(ctx, px + 4, py - 11, 3, 24, RO.claro); ret(ctx, px + 5, py - 14, 1, 2, RO.luz);
      ret(ctx, px + 9, py - 4, 2, 3, RO.escuro); ret(ctx, px + 7, py + 5, 3, 2, RO.escuro);
    } });
  // o Tico (irmãozinho do Pipo): pequeno ET verde-limão de antenas, espiando atrás da pedra
  function tico(ctx, x, y, t) {
    var tchau = t ? Math.floor(t / 250) % 2 : 0;
    ret(ctx, x + 2, y - 6, 1, 5, K); ret(ctx, x + 7, y - 6, 1, 5, K);
    circulo(ctx, x + 2, y - 7, 2, ROSA); circulo(ctx, x + 7, y - 7, 2, ROSA);
    elipse(ctx, x + 5, y + 2, 6, 5, K); elipse(ctx, x + 5, y + 2, 5, 4, '#a8f07a');
    ret(ctx, x + 2, y + 1, 2, 2, K); ret(ctx, x + 6, y + 1, 2, 2, K);
    ret(ctx, x + 2, y + 1, 1, 1, '#ffffff'); ret(ctx, x + 6, y + 1, 1, 1, '#ffffff');
    ret(ctx, x + 4, y + 4, 2, 1, '#3a7a2a');
    // mãozinha dando tchau
    ret(ctx, x + 11, y - 1 - tchau, 3, 3, K); ret(ctx, x + 12, y - tchau, 1, 1, '#a8f07a');
    brilho(ctx, x - 3, y - 4, OURO); brilho(ctx, x + 14, y - 8, '#ffffff');
  }
  // pedra grande do esconde-esconde (acao.i = qual das 3)
  I.objeto('lua-pedra-grande', { w: 1, h: 1, topo: 14, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 8);
      rocha(ctx, px + 8, py + 4, 8, 10);
      ret(ctx, px + 3, py + 8, 3, 2, RO.escuro); ret(ctx, px + 10, py - 2, 2, 2, RO.escuro);
    },
    anim: function (ctx, px, py, t, o) {
      var l = L(), i = (o.acao && o.acao.i) || 0;
      if (l && l.ticoEm(i)) tico(ctx, px + 3, py - 12, tempo(t));
    } });
  // a pedra que flutua: sobe devagar e desce (só com Animações)
  I.objeto('lua-pedra-flutua', { w: 1, h: 1, topo: 10, solido: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 3, py + 12, 10, 3, 'rgba(60,60,90,0.25)');
      brilho(ctx, px + 2, py - 2, LILAS); brilho(ctx, px + 14, py + 2, CIANO);
    },
    anim: function (ctx, px, py, t) {
      var l = L(), f = l ? l.progresso('flutua', tempo(t)) : null;
      var dy = f === null ? 0 : Math.round(Math.sin(f * Math.PI) * 26);
      rocha(ctx, px + 8, py + 6 - dy, 6, 5);
      ret(ctx, px + 5, py + 4 - dy, 2, 1, LILAS);
      if (dy > 4) { brilho(ctx, px + 3, py + 10 - Math.round(dy / 2), '#ffffff'); brilho(ctx, px + 13, py + 12 - Math.round(dy / 3), LILAS); }
    } });

  /* ---------- cristais (acao.n = qual dos 5) ---------- */
  I.objeto('lua-cristal', { w: 1, h: 1, topo: 10, solido: true,
    desenhar: function (ctx, px, py) { rocha(ctx, px + 8, py + 12, 6, 3); },
    anim: function (ctx, px, py, t, o) {
      var l = L(), n = (o.acao && o.acao.n) || 0, cor = ['#b58cff', CIANO, ROSA, '#8cf0c8', OURO][n % 5];
      if (l && l.cristalPego(n)) { ret(ctx, px + 6, py + 7, 4, 3, K); ret(ctx, px + 7, py + 8, 2, 1, RO.escuro); return; }
      ret(ctx, px + 5, py - 4, 6, 14, K); triangulo(ctx, px + 5, py - 9, 6, 6, K);
      ret(ctx, px + 6, py - 3, 4, 12, cor); triangulo(ctx, px + 6, py - 7, 4, 4, cor);
      ret(ctx, px + 6, py - 3, 1, 11, '#ffffff');
      ret(ctx, px + 10, py + 1, 3, 8, K); ret(ctx, px + 11, py + 2, 1, 6, cor);
      ret(ctx, px + 2, py + 3, 3, 6, K); ret(ctx, px + 3, py + 4, 1, 4, cor);
      t = tempo(t);
      var fase = t ? Math.floor(t / 300 + n * 2) % 6 : 0;
      if (fase < 2) brilho(ctx, px + 12, py - 6 + fase, '#ffffff');
    } });

  /* ---------- coisas dos astronautas ---------- */
  // bandeira do Reino: rosa com a estrela e o chifre; a vareta de cima segura o pano (na Lua não tem vento)
  I.objeto('lua-bandeira', { w: 1, h: 1, topo: 30, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 5, py + 14, 4);
      ret(ctx, px + 3, py - 28, 2, 42, K); ret(ctx, px + 3, py - 28, 1, 42, '#e8ecf5');
      ret(ctx, px + 4, py - 28, 12, 2, K);
      ret(ctx, px + 5, py - 26, 11, 13, K); ret(ctx, px + 5, py - 26, 10, 12, ROSA);
      ret(ctx, px + 5, py - 15, 10, 1, '#d8589a');
      ret(ctx, px + 9, py - 23, 2, 6, OURO); ret(ctx, px + 7, py - 21, 6, 2, OURO);
      ret(ctx, px + 12, py - 25, 1, 3, '#ffffff');
      ret(ctx, px + 2, py + 12, 4, 2, RO.escuro);
    } });
  // módulo lunar antigo (o que levou os astronautas): pés, base dourada e cabine cinza
  I.objeto('lua-modulo', { w: 2, h: 2, topo: 22, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 29, 15);
      ret(ctx, px + 3, py + 12, 2, 16, K); ret(ctx, px + 27, py + 12, 2, 16, K);
      ret(ctx, px + 1, py + 27, 6, 2, K); ret(ctx, px + 25, py + 27, 6, 2, K);
      ret(ctx, px + 5, py + 6, 22, 14, K); ret(ctx, px + 6, py + 7, 20, 12, OURO);
      for (var i = 0; i < 5; i++) ret(ctx, px + 7 + i * 4, py + 8, 2, 10, i % 2 ? OURO2 : '#ffe08a');
      ret(ctx, px + 12, py + 19, 8, 3, K); ret(ctx, px + 13, py + 20, 6, 1, RO.meio);
      ret(ctx, px + 7, py - 14, 18, 21, K); ret(ctx, px + 8, py - 13, 16, 19, '#d8dce8');
      ret(ctx, px + 8, py - 13, 4, 19, '#eef0f6'); ret(ctx, px + 19, py - 13, 5, 19, '#aab0c4');
      ret(ctx, px + 12, py - 9, 7, 5, K); ret(ctx, px + 13, py - 8, 5, 3, '#3a4a7a'); ret(ctx, px + 13, py - 8, 2, 1, CIANO);
      ret(ctx, px + 20, py - 20, 1, 7, K); circulo(ctx, px + 20, py - 21, 2, '#e8ecf5');
      ret(ctx, px + 15, py + 1, 3, 3, '#ffffff');
    } });
  // pegadas de astronauta (var.giro: 1 = andando para o lado)
  I.objeto('lua-pegadas', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py, o) {
      var lado = o.var && o.var.giro;
      for (var i = 0; i < 2; i++) {
        var x = lado ? px + 2 + i * 7 : px + 3 + i * 6, y = lado ? py + 4 + i * 6 : py + 2 + (1 - i) * 7;
        ret(ctx, x, y, 3, 5, RO.meio); ret(ctx, x, y + 5, 3, 1, RO.luz);
        for (var j = 0; j < 2; j++) ret(ctx, x, y + 1 + j * 2, 3, 1, RO.escuro);
      }
    } });
  // placa de boas-vindas com a Lua e uma estrelinha
  I.objeto('lua-placa', { w: 1, h: 1, topo: 14, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 5);
      ret(ctx, px + 7, py - 2, 2, 16, K); ret(ctx, px + 7, py - 2, 1, 16, '#c98a4b');
      ret(ctx, px, py - 14, 16, 13, K); ret(ctx, px + 1, py - 13, 14, 11, '#fff1dc');
      ret(ctx, px + 1, py - 13, 14, 2, ROSA);
      circulo(ctx, px + 5, py - 6, 3, OURO); circulo(ctx, px + 6, py - 7, 2, '#fff1dc');
      brilho(ctx, px + 11, py - 7, '#b58cff');
    } });
  // telescópio mirando a Terra
  I.objeto('lua-telescopio', { w: 1, h: 1, topo: 16, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 6);
      ret(ctx, px + 3, py + 2, 1, 11, K); ret(ctx, px + 12, py + 2, 1, 11, K); ret(ctx, px + 7, py + 2, 2, 12, K);
      for (var i = 0; i < 6; i++) {
        ret(ctx, px + 2 + i * 2, py - 2 - i * 2, 5, 5, K);
        ret(ctx, px + 3 + i * 2, py - 1 - i * 2, 3, 3, i > 3 ? '#5a6ad0' : '#e8ecf5');
      }
      ret(ctx, px + 14, py - 13, 2, 2, CIANO);
    } });
  // jipe lunar: rodas grandes, banquinhos e antena
  I.objeto('lua-jipe', { w: 2, h: 1, topo: 10, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 16, py + 14, 14);
      ret(ctx, px + 3, py - 1, 26, 6, K); ret(ctx, px + 4, py, 24, 4, '#d8dce8'); ret(ctx, px + 4, py, 24, 1, '#ffffff');
      ret(ctx, px + 9, py - 7, 2, 7, K); ret(ctx, px + 19, py - 7, 2, 7, K);
      ret(ctx, px + 8, py - 8, 5, 2, '#3a4a7a'); ret(ctx, px + 18, py - 8, 5, 2, '#3a4a7a');
      ret(ctx, px + 26, py - 10, 1, 9, K); circulo(ctx, px + 26, py - 11, 2, OURO);
      [6, 26].forEach(function (x) { circulo(ctx, px + x, py + 8, 5, K); circulo(ctx, px + x, py + 8, 3, RO.meio); ret(ctx, px + x, py + 8, 1, 1, K); });
    } });
  // antena parabólica
  I.objeto('lua-antena', { w: 1, h: 1, topo: 20, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 5);
      ret(ctx, px + 7, py - 6, 2, 19, K); ret(ctx, px + 4, py + 11, 8, 3, K);
      elipse(ctx, px + 8, py - 12, 8, 5, K); elipse(ctx, px + 8, py - 13, 7, 3, '#eef0f6');
      ret(ctx, px + 8, py - 20, 1, 7, K); ret(ctx, px + 7, py - 21, 3, 2, '#e0433f');
    } });
  // caixa de amostras com uma pazinha
  I.objeto('lua-caixa', { w: 1, h: 1, topo: 6, solido: true,
    desenhar: function (ctx, px, py) {
      sombra(ctx, px + 8, py + 14, 7);
      ret(ctx, px + 1, py + 1, 14, 12, K); ret(ctx, px + 2, py + 2, 12, 10, '#e8ecf5');
      ret(ctx, px + 2, py + 2, 12, 2, '#aab0c4'); ret(ctx, px + 6, py + 6, 4, 2, OURO);
      ret(ctx, px + 12, py - 6, 1, 8, K); ret(ctx, px + 11, py - 7, 3, 3, RO.meio);
      rocha(ctx, px + 5, py - 1, 2, 2);
    } });
  // montinho de poeira da Lua
  I.objeto('lua-poeira', { w: 1, h: 1, solido: false, plano: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 8, py + 10, 7, 3, RO.claro); elipse(ctx, px + 7, py + 9, 4, 2, RO.luz);
      ret(ctx, px + 2, py + 5, 1, 1, RO.meio); ret(ctx, px + 13, py + 6, 1, 1, RO.meio); ret(ctx, px + 11, py + 3, 1, 1, RO.luz);
    } });
})();
