/* Torre do Relógio (Inglês): térreo, 5 andares (um por sala) e o mecanismo no alto.
   Cada andar é um interior próprio, ligado por escadas. As falas moram em torre-falas.js. */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var K = '#3a2446';
  var F = (R.FALAS_INTERIORES && R.FALAS_INTERIORES.torre) || { npcs: {}, objetos: {} };
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};
  var BRONZE = '#c8893a', BRONZE2 = '#8f5a24', BRONZE3 = '#f0c078';

  function v(o, k, padrao) { return (o && o.var && o.var[k] !== undefined) ? o.var[k] : padrao; }
  // desenho pequeno à mão: uma letra por pixel
  function matriz(ctx, x, y, linhas, pal) {
    for (var j = 0; j < linhas.length; j++) for (var i = 0; i < linhas[j].length; i++) {
      var c = pal[linhas[j][i]];
      if (c) ret(ctx, x + i, y + j, 1, 1, c);
    }
  }
  // engrenagem: dentes em volta de um disco, girada pelo ângulo `a` (só ret/circulo: serve no pintor)
  function engrenagem(ctx, cx, cy, r, dentes, a, cor, luz) {
    for (var i = 0; i < dentes; i++) {
      var ang = a + i * Math.PI * 2 / dentes;
      var dx = Math.round(Math.cos(ang) * (r + 1)), dy = Math.round(Math.sin(ang) * (r + 1));
      ret(ctx, cx + dx - 2, cy + dy - 2, 4, 4, K);
      ret(ctx, cx + dx - 1, cy + dy - 1, 2, 2, cor);
    }
    circulo(ctx, cx, cy, r, K); circulo(ctx, cx, cy, r - 1, cor);
    circulo(ctx, cx - 1, cy - 1, Math.max(1, r - 3), luz || BRONZE3); circulo(ctx, cx, cy, Math.max(1, r - 3), cor);
    circulo(ctx, cx, cy, 2, K); ret(ctx, cx, cy, 1, 1, luz || BRONZE3);
  }

  /* ---------- pictogramas dos cartazes (10×10) ---------- */
  var P = { k: K, p: '#ffd0a8', y: C.ouro, r: C.vermelho, b: C.azul, w: C.branco, g: C.verde, l: C.lilas, o: C.laranja, s: '#ffb0c8', c: '#cfe8ff', n: '#2a2f66' };
  var ICONES = {
    mao: ['..k.k.k...', '.kpkpkpk..', '.kpkpkpkk.', '.kpkpkpkpk', '.kpppppkpk', '.kpppppppk', '..kppppppk', '..kpppppk.', '...kpppk..', '...kkkkk..'],
    brinquedos: ['......kk..', '.....kyyk.', '..kk.kyyk.', '.krrk.kk..', '.krrk.....', 'kkkkkkkkkk', 'kbbbbbbbbk', 'kbwwbbwwbk', 'kbbbbbbbbk', 'kkkkkkkkkk'],
    apito: ['..........', '...kkkkkk.', '..kyyyyyyk', '.kyykkyyyk', 'kyyk..kyyk', 'kyyk..kkk.', '.kyykk....', '..kkk.....', '....k.....', '...kk.....'],
    torcida: ['........k.', '.......kk.', '..k..kkrk.', '.krkkrrrk.', '.krrrrrrk.', '.krrrrrrk.', '.krkkrrrk.', '..k..kkrk.', '.......kk.', '........k.'],
    amigos: ['.kkk..kkk.', 'kpppkkpppk', 'kpkpkkpkpk', 'kpppkkpppk', '.kpk..kpk.', 'kgggkkbbbk', 'kgggkkbbbk', 'kgggkkbbbk', '.k.k..k.k.', '.k.k..k.k.'],
    estrela: ['....kk....', '....yy....', '...kyyk...', 'kkkyyyykkk', '.kyyyyyyk.', '..kyyyyk..', '..kyyyyk..', '.kyykkyyk.', '.kyk..kyk.', '.kk....kk.'],
    formas: ['kkkk......', 'kbbk...k..', 'kbbk..kgk.', 'kkkk.kgggk', '.....kkkkk', '..kkk.....', '.kyyyk....', '.kyyyk....', '.kyyyk....', '..kkk.....'],
    dente: ['.kkk..kkk.', 'kwwwkkwwwk', 'kwwwwwwwwk', 'kwwwwwwwwk', 'kwwwwwwwck', '.kwwwwwck.', '.kwwkkwck.', '.kwk..kck.', '.kwk..kck.', '..k....k..'],
    escova: ['.......wkw', '......kwkw', '.....kbkkk', '....kbk...', '...kbk....', '..kbk.....', '.kbk......', 'kbk.......', 'kk........', '..........'],
    chuveiro: ['...kkkk...', '..kccccck.', '.kkkkkkkk.', '..b.b.b...', '..........', '.b.b.b.b..', '..........', '..b.b.b...', '.b...b..b.', '..........'],
    lua: ['...kkk....', '..kyyyk...', '.kyyk.....', 'kyyk......', 'kyyk......', 'kyyk......', 'kyyyk....k', '.kyyykkkyk', '..kyyyyyk.', '...kkkkk..'],
    cama: ['..........', 'k.........', 'kkk.......', 'kwwkkkkkkk', 'kwwkllllll', 'kkkkllllll', 'kkkkkkkkkk', 'k........k', 'k........k', '..........'],
    nota: ['....kkkkkk', '....krrrrk', '....kk..kk', '....k....k', '....k....k', '.kkkk..kkk', 'krrrk.krrk', 'krrrk.krrk', '.kkk...kk.', '..........'],
    feliz: ['..kkkkkk..', '.kyyyyyyk.', 'kyykyykyyk', 'kyykyykyyk', 'kyyyyyyyyk', 'kykyyyykyk', 'kyykkkkyyk', '.kyyyyyyk.', '..kkkkkk..', '..........'],
  };
  function icone(ctx, x, y, nome) {
    if (nome === 'sol') {
      for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4; ret(ctx, x + 5 + Math.round(Math.cos(a) * 5), y + 5 + Math.round(Math.sin(a) * 5), 1, 1, C.laranja); }
      circulo(ctx, x + 5, y + 5, 3, K); circulo(ctx, x + 5, y + 5, 2, C.ouro); ret(ctx, x + 4, y + 4, 1, 1, C.ouro3);
      return;
    }
    if (nome === 'planeta') {
      circulo(ctx, x + 5, y + 5, 3, K); circulo(ctx, x + 5, y + 5, 2, C.laranja);
      ret(ctx, x, y + 5, 11, 1, K); ret(ctx, x + 1, y + 5, 2, 1, C.ouro); ret(ctx, x + 8, y + 5, 2, 1, C.ouro);
      return;
    }
    if (nome === 'relogio') {
      circulo(ctx, x + 5, y + 5, 5, K); circulo(ctx, x + 5, y + 5, 4, C.creme);
      ret(ctx, x + 5, y + 2, 1, 4, K); ret(ctx, x + 5, y + 5, 3, 1, K); ret(ctx, x + 5, y + 1, 1, 1, C.vermelho);
      return;
    }
    matriz(ctx, x, y, ICONES[nome] || ICONES.estrela, P);
  }

  // fonte pixel 3×5 (como na Escola), para as palavras em inglês dos cartazes
  var LETRAS = {
    A: ['.x.', 'x.x', 'xxx', 'x.x', 'x.x'], B: ['xx.', 'x.x', 'xx.', 'x.x', 'xx.'], C: ['.xx', 'x..', 'x..', 'x..', '.xx'],
    E: ['xxx', 'x..', 'xx.', 'x..', 'xxx'], G: ['.xx', 'x..', 'x.x', 'x.x', '.xx'], H: ['x.x', 'x.x', 'xxx', 'x.x', 'x.x'],
    I: ['xxx', '.x.', '.x.', '.x.', 'xxx'], L: ['x..', 'x..', 'x..', 'x..', 'xxx'], M: ['x.x', 'xxx', 'xxx', 'x.x', 'x.x'],
    N: ['x.x', 'xxx', 'xxx', 'x.x', 'x.x'], O: ['.x.', 'x.x', 'x.x', 'x.x', '.x.'], P: ['xx.', 'x.x', 'xx.', 'x..', 'x..'],
    R: ['xx.', 'x.x', 'xx.', 'x.x', 'x.x'], S: ['.xx', 'x..', '.x.', '..x', 'xx.'], T: ['xxx', '.x.', '.x.', '.x.', '.x.'],
    U: ['x.x', 'x.x', 'x.x', 'x.x', 'xxx'], Y: ['x.x', 'x.x', '.x.', '.x.', '.x.'], D: ['xx.', 'x.x', 'x.x', 'x.x', 'xx.'],
  };
  function palavra(ctx, texto, cx, y, cor) {
    var x = cx - Math.floor((texto.length * 4 - 1) / 2);
    for (var i = 0; i < texto.length; i++) matriz(ctx, x + i * 4, y, LETRAS[texto[i]] || LETRAS.O, { x: cor });
  }

  /* ================= OBJETOS DA TORRE ================= */
  // cartaz largo com uma palavra em inglês e um pictograma
  I.objeto('torre-palavra', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var fundo = v(o, 'cor', C.creme), faixa = v(o, 'faixa', C.azul), p = v(o, 'palavra', 'HELLO');
      contornoRet(ctx, px + 1, py + 9, 30, 21, fundo);
      ret(ctx, px + 2, py + 10, 28, 2, faixa); ret(ctx, px + 2, py + 27, 28, 1, faixa);
      palavra(ctx, p, px + 16, py + 13, v(o, 'tinta', K));
      if (v(o, 'icone', null)) icone(ctx, px + 11, py + 19, o.var.icone);
      else for (var i = 0; i < 5; i++) ret(ctx, px + 8 + i * 4, py + 22, 2, 2, [C.vermelho, C.ouro, C.verde, C.azul, C.lilas][i]);
      ret(ctx, px + 7, py + 7, 2, 2, K); ret(ctx, px + 23, py + 7, 2, 2, K);
    } });
  // cartaz com pictograma (as palavras em inglês ficam na fala)
  I.objeto('torre-cartaz', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var x = px + 1, y = py + 10, fundo = v(o, 'cor', C.creme), faixa = v(o, 'faixa', C.azul);
      contornoRet(ctx, x, y, 14, 19, fundo);
      ret(ctx, x + 1, y + 1, 12, 2, faixa); ret(ctx, x + 1, y + 17, 12, 1, faixa);
      if (v(o, 'palavra', null)) { palavra(ctx, o.var.palavra, x + 7, y + 4, K); icone(ctx, x + 2, y + 9, v(o, 'icone', 'estrela')); }
      else icone(ctx, x + 2, y + 5, v(o, 'icone', 'estrela'));
      ret(ctx, x + 6, y - 2, 2, 2, K); ret(ctx, x + 6, y - 2, 1, 1, C.metal);
    } });
  // quadro dos andares: a torre inteira em corte
  I.objeto('torre-andares', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      var x = px + 5, y = py + 4;
      contornoRet(ctx, px + 2, py + 3, 28, 26, '#fff3d6');
      triangulo(ctx, x + 4, y + 1, 14, 4, K); triangulo(ctx, x + 6, y + 2, 10, 2, C.vermelho);
      var cs = ['#ffb070', '#bfe9ff', '#2a2f66', '#cfe8ff', '#e8dcff', '#ffc2d8', BRONZE];
      for (var i = 0; i < 7; i++) {
        var yy = y + 5 + i * 3;
        ret(ctx, x + 5, yy, 12, 3, K); ret(ctx, x + 6, yy + 1, 10, 2, cs[6 - i]);
      }
      circulo(ctx, x + 11, y + 7, 2, C.creme); ret(ctx, x + 11, y + 6, 1, 2, K);
      ret(ctx, x + 18, y + 8, 5, 1, C.ouro2); ret(ctx, x + 18, y + 14, 5, 1, C.ouro2); ret(ctx, x + 18, y + 20, 5, 1, C.ouro2);
    } });
  // púlpito do Livro das Palavras
  I.objeto('torre-pulpito', { w: 1, h: 1, topo: 12, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 5, py + 11, 11, 4, K); ret(ctx, cx - 4, py + 12, 9, 2, BRONZE2);
      ret(ctx, cx - 2, py - 3, 5, 15, K); ret(ctx, cx - 1, py - 3, 3, 14, C.madeira); ret(ctx, cx - 1, py - 3, 1, 14, C.madeiraClara);
      ret(ctx, cx - 7, py - 5, 15, 3, K); ret(ctx, cx - 6, py - 4, 13, 1, BRONZE);
      // livro aberto com «ABC» e uma bandeirinha
      ret(ctx, cx - 7, py - 12, 15, 8, K);
      ret(ctx, cx - 6, py - 11, 6, 6, C.branco); ret(ctx, cx + 1, py - 11, 6, 6, C.branco);
      ret(ctx, cx, py - 11, 1, 7, C.azul);
      ret(ctx, cx - 5, py - 10, 1, 3, C.vermelho); ret(ctx, cx - 3, py - 10, 1, 3, C.azul); ret(ctx, cx - 2, py - 8, 1, 1, C.ouro);
      for (var j = 0; j < 3; j++) ret(ctx, cx + 2, py - 10 + j * 2, 4, 1, '#9fcfff');
      ret(ctx, cx + 3, py - 13, 1, 3, C.vermelho);
    } });
  // engrenagens soltas numa bancada (térreo)
  I.objeto('torre-engrenagens', { w: 2, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 1, 30, 5, K); ret(ctx, px + 2, py + 2, 28, 3, C.madeiraClara); ret(ctx, px + 2, py + 2, 28, 1, '#ffd9a8');
      ret(ctx, px + 3, py + 6, 3, 9, K); ret(ctx, px + 26, py + 6, 3, 9, K);
      ret(ctx, px + 4, py + 6, 1, 8, C.madeira2); ret(ctx, px + 27, py + 6, 1, 8, C.madeira2);
      engrenagem(ctx, px + 9, py - 3, 5, 8, 0.2, BRONZE);
      engrenagem(ctx, px + 19, py - 5, 4, 7, 0.5, C.metal, C.branco);
      engrenagem(ctx, px + 25, py - 1, 2, 5, 0, C.ouro);
      ret(ctx, px + 13, py, 3, 1, K); ret(ctx, px + 14, py - 1, 1, 1, C.metal2);
    } });
  // mini trave de futebol com a bola
  I.objeto('torre-trave', { w: 2, h: 1, topo: 14, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 2, py - 12, 28, 3, K); ret(ctx, px + 3, py - 11, 26, 1, C.branco);
      ret(ctx, px + 2, py - 12, 3, 26, K); ret(ctx, px + 27, py - 12, 3, 26, K);
      ret(ctx, px + 3, py - 11, 1, 24, C.branco); ret(ctx, px + 28, py - 11, 1, 24, C.branco);
      for (var x = px + 6; x < px + 27; x += 3) ret(ctx, x, py - 9, 1, 20, '#d8d0e4');
      for (var y = py - 8; y < py + 11; y += 3) ret(ctx, px + 5, y, 22, 1, '#d8d0e4');
      circulo(ctx, px + 16, py + 10, 4, K); circulo(ctx, px + 16, py + 10, 3, C.branco);
      ret(ctx, px + 15, py + 9, 2, 2, K); ret(ctx, px + 13, py + 11, 1, 1, K); ret(ctx, px + 18, py + 8, 1, 1, K);
    } });
  // luneta no tripé, apontada para a janela
  I.objeto('torre-luneta', { w: 1, h: 1, topo: 18, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 5, py + 13, 2, 2, K); ret(ctx, cx + 4, py + 13, 2, 2, K);
      for (var j = 0; j < 12; j++) { ret(ctx, cx - 5 + Math.round(j * 0.4), py + 13 - j, 1, 1, K); ret(ctx, cx + 5 - Math.round(j * 0.4), py + 13 - j, 1, 1, K); }
      ret(ctx, cx, py + 1, 1, 13, K);
      for (var i = 0; i < 14; i++) {
        var x = cx - 7 + i, y = py + 2 - Math.round(i * 0.8);
        ret(ctx, x, y - 2, 1, 5, K); ret(ctx, x, y - 1, 1, 3, i < 5 ? '#5a6ad0' : C.ouro2); ret(ctx, x, y - 1, 1, 1, i < 5 ? '#9fb0ff' : C.ouro3);
      }
      ret(ctx, cx + 7, py - 13, 2, 5, K); ret(ctx, cx + 7, py - 12, 1, 3, C.vidro);
      circulo(ctx, cx, py + 1, 2, K); ret(ctx, cx, py + 1, 1, 1, C.ouro);
    } });
  // móbile de planetas pendurado (balança de leve)
  I.objeto('torre-mobile', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 15, py + 6, 2, 6, K);
      ret(ctx, px + 3, py + 11, 26, 2, K); ret(ctx, px + 4, py + 11, 24, 1, C.ouro2);
    },
    anim: function (ctx, px, py, t) {
      var cs = [['#ffd34d', 4], ['#b9c4d6', 2], ['#ffc27a', 2], ['#5fb4ff', 3], ['#ff7a5a', 2], ['#e8b27a', 4], ['#9fdcff', 3], ['#5a6ad0', 3]];
      for (var i = 0; i < cs.length; i++) {
        var x = px + 4 + i * 3 + (i === 0 ? 0 : 1), fio = 3 + (i % 3) * 4;
        var bal = Math.round(Math.sin(t / 700 + i) * 1);
        ret(ctx, x, py + 13, 1, fio, '#8a7aa8');
        var cy = py + 13 + fio + cs[i][1];
        circulo(ctx, x + bal, cy, cs[i][1] + 1, K); circulo(ctx, x + bal, cy, cs[i][1], cs[i][0]);
        if (i === 5) ret(ctx, x + bal - 5, cy, 11, 1, K);
      }
    } });
  // relógio de sol no pedestal
  I.objeto('torre-relogio-sol', { w: 1, h: 1, topo: 8, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 3, py + 2, 7, 13, K); ret(ctx, cx - 2, py + 3, 5, 11, C.pedra); ret(ctx, cx - 2, py + 3, 1, 11, C.branco);
      elipse(ctx, cx, py, 7, 3, K); elipse(ctx, cx, py, 6, 2, C.pedra2); elipse(ctx, cx, py - 1, 5, 1, C.pedra);
      triangulo(ctx, cx - 1, py - 7, 3, 7, K); ret(ctx, cx, py - 5, 1, 4, C.ouro);
      ret(ctx, cx + 1, py, 5, 1, '#8a7aa8');   // a sombra que mostra a hora
      ret(ctx, cx - 5, py, 1, 1, K); ret(ctx, cx, py + 2, 1, 1, K); ret(ctx, cx + 5, py - 1, 1, 1, K);
    } });
  // protetor solar e óculos numa mesinha
  I.objeto('torre-protetor', { w: 1, h: 1, topo: 8, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 6, py + 1, 13, 3, K); ret(ctx, cx - 5, py + 2, 11, 1, C.madeiraClara);
      ret(ctx, cx - 5, py + 4, 2, 11, K); ret(ctx, cx + 4, py + 4, 2, 11, K);
      ret(ctx, cx - 5, py - 8, 5, 9, K); ret(ctx, cx - 4, py - 7, 3, 8, C.ouro); ret(ctx, cx - 4, py - 5, 3, 2, C.laranja);
      ret(ctx, cx - 3, py - 10, 1, 2, K);
      ret(ctx, cx + 1, py - 2, 6, 3, K); ret(ctx, cx + 1, py - 1, 2, 1, '#5a6ad0'); ret(ctx, cx + 4, py - 1, 2, 1, '#5a6ad0');
    } });
  // pia com espelho redondo
  I.objeto('torre-pia', { w: 1, h: 1, topo: 16, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      circulo(ctx, cx, py - 10, 5, K); circulo(ctx, cx, py - 10, 4, C.vidro); ret(ctx, cx - 2, py - 12, 1, 2, C.branco);
      ret(ctx, cx - 3, py + 3, 7, 12, K); ret(ctx, cx - 2, py + 3, 5, 11, C.branco); ret(ctx, cx + 1, py + 3, 1, 11, '#d8e8f5');
      ret(ctx, cx - 7, py - 3, 15, 7, K); ret(ctx, cx - 6, py - 2, 13, 5, C.branco);
      elipse(ctx, cx, py, 4, 1, '#9fdcff');
      ret(ctx, cx, py - 5, 1, 3, K); ret(ctx, cx - 1, py - 5, 3, 1, C.metal);
      // copinho com escova e pasta
      ret(ctx, cx + 4, py - 6, 3, 4, K); ret(ctx, cx + 5, py - 5, 1, 3, C.rosa); ret(ctx, cx + 5, py - 9, 1, 3, C.azul);
    } });
  // escova de dentes gigante em pé
  I.objeto('torre-escova', { w: 1, h: 1, topo: 24, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      elipse(ctx, cx, py + 13, 5, 2, K); elipse(ctx, cx, py + 13, 4, 1, C.azul2);
      ret(ctx, cx - 2, py - 6, 5, 20, K); ret(ctx, cx - 1, py - 5, 3, 18, C.azul); ret(ctx, cx - 1, py - 5, 1, 18, C.azul2);
      ret(ctx, cx - 1, py + 2, 3, 3, C.branco);
      ret(ctx, cx - 3, py - 20, 7, 15, K); ret(ctx, cx - 2, py - 19, 5, 13, C.branco);
      for (var j = 0; j < 6; j++) ret(ctx, cx - 2 + (j % 2), py - 18 + j * 2, 4, 1, j % 2 ? '#9fdcff' : '#d9f3ff');
      // pasta de dente listrada por cima
      ret(ctx, cx - 3, py - 23, 7, 4, K); ret(ctx, cx - 2, py - 22, 5, 2, C.branco); ret(ctx, cx - 1, py - 22, 1, 2, C.vermelho); ret(ctx, cx + 1, py - 22, 1, 2, C.agua);
    } });
  // toalhas penduradas no gancho
  I.objeto('torre-toalhas', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var c1 = v(o, 'cor', C.rosa2), c2 = v(o, 'cor2', C.agua);
      ret(ctx, px + 1, py + 7, 14, 2, K); ret(ctx, px + 2, py + 7, 12, 1, C.metal);
      ret(ctx, px + 2, py + 9, 6, 16, K); ret(ctx, px + 3, py + 9, 4, 15, c1); ret(ctx, px + 3, py + 20, 4, 1, C.branco);
      ret(ctx, px + 8, py + 9, 6, 13, K); ret(ctx, px + 9, py + 9, 4, 12, c2); ret(ctx, px + 9, py + 18, 4, 1, C.branco);
    } });
  // a rotina do dia: do sol à lua (tira de 3 quadrinhos)
  I.objeto('torre-rotina', { w: 3, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      py += 3;
      var ceus = ['#ffe8a0', '#9fdcff', '#ffb070', '#2a2f66'];
      contornoRet(ctx, px + 1, py + 6, 46, 22, '#fff8ee');
      for (var i = 0; i < 4; i++) {
        var x = px + 3 + i * 11;
        ret(ctx, x, py + 8, 10, 13, K); ret(ctx, x + 1, py + 9, 8, 11, ceus[i]);
        ret(ctx, x + 1, py + 17, 8, 3, i === 3 ? '#4a3a7a' : '#8fd06a');
        if (i < 3) { circulo(ctx, x + 5, py + 13 + (i === 1 ? -2 : i === 2 ? 1 : 2), 2, K); circulo(ctx, x + 5, py + 13 + (i === 1 ? -2 : i === 2 ? 1 : 2), 1, i === 2 ? C.laranja : C.ouro); }
        else { circulo(ctx, x + 5, py + 12, 2, C.ouro3); ret(ctx, x + 6, py + 11, 2, 2, ceus[3]); ret(ctx, x + 2, py + 10, 1, 1, C.branco); ret(ctx, x + 8, py + 14, 1, 1, C.branco); }
        if (i < 3) ret(ctx, x + 10, py + 14, 1, 1, K);
      }
      // setinhas e um reloginho no meio
      ret(ctx, px + 4, py + 23, 40, 1, '#c4b4d4');
      for (var j = 0; j < 4; j++) ret(ctx, px + 7 + j * 11, py + 22, 2, 3, [C.ouro, C.azul, C.laranja, C.lilas][j]);
    } });
  // cama arrumada com travesseiro e estrelinhas
  I.objeto('torre-cama', { w: 2, h: 1, topo: 8, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var c = v(o, 'cor', '#9b7bff');
      ret(ctx, px + 1, py - 8, 4, 22, K); ret(ctx, px + 2, py - 7, 2, 20, C.madeira);
      ret(ctx, px + 4, py - 1, 27, 12, K); ret(ctx, px + 5, py, 25, 10, C.branco);
      ret(ctx, px + 5, py - 1, 7, 6, K); ret(ctx, px + 6, py, 5, 4, '#fff3c8');
      ret(ctx, px + 12, py, 18, 10, c); ret(ctx, px + 12, py, 18, 1, C.lilas);
      ret(ctx, px + 16, py + 3, 1, 1, C.ouro); ret(ctx, px + 22, py + 6, 1, 1, C.ouro); ret(ctx, px + 27, py + 2, 1, 1, C.ouro);
      ret(ctx, px + 29, py + 1, 3, 13, K); ret(ctx, px + 30, py + 2, 1, 11, C.madeira);
      ret(ctx, px + 4, py + 11, 2, 3, K); ret(ctx, px + 27, py + 11, 2, 3, K);
    } });
  // piano de brinquedo colorido
  I.objeto('torre-piano', { w: 2, h: 1, topo: 14, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py - 12, 30, 17, K); ret(ctx, px + 2, py - 11, 28, 15, '#ff7eb6'); ret(ctx, px + 2, py - 11, 28, 1, '#ffb0d0');
      ret(ctx, px + 4, py - 9, 24, 4, K); ret(ctx, px + 5, py - 8, 22, 2, C.creme);
      ret(ctx, px + 10, py - 8, 1, 1, K); ret(ctx, px + 14, py - 7, 1, 1, K); ret(ctx, px + 18, py - 8, 1, 1, K);
      ret(ctx, px + 1, py - 1, 30, 6, K);
      for (var i = 0; i < 9; i++) ret(ctx, px + 2 + i * 3, py, 2, 4, C.branco);
      [1, 2, 4, 5, 6].forEach(function (i) { ret(ctx, px + 4 + i * 3, py, 1, 2, K); });
      ret(ctx, px + 3, py + 5, 2, 10, K); ret(ctx, px + 27, py + 5, 2, 10, K);
    } });
  // pandeiro no chão
  I.objeto('torre-pandeiro', { w: 1, h: 1, topo: 2, solido: true,
    desenhar: function (ctx, px, py) {
      elipse(ctx, px + 8, py + 9, 7, 5, K); elipse(ctx, px + 8, py + 9, 6, 4, C.madeiraClara);
      elipse(ctx, px + 8, py + 8, 5, 3, '#fff3d6');
      [[2, 9], [14, 9], [8, 4], [8, 14], [4, 6], [12, 12]].forEach(function (p) { ret(ctx, px + p[0] - 1, py + p[1] - 1, 2, 2, C.ouro); });
      ret(ctx, px + 6, py + 7, 4, 1, C.rosa); ret(ctx, px + 7, py + 6, 2, 3, C.rosa);
    } });
  // cartaz de carinhas: os seis sentimentos
  I.objeto('torre-carinhas', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      contornoRet(ctx, px + 2, py + 8, 28, 23, '#fff8ee');
      var cs = [C.ouro, '#9fcfff', C.vermelho, C.lilas, '#c4b4d4', C.laranja];
      for (var i = 0; i < 6; i++) {
        var cx = px + 8 + (i % 3) * 8, cy = py + 14 + Math.floor(i / 3) * 10;
        circulo(ctx, cx, cy, 3, K); circulo(ctx, cx, cy, 2, cs[i]);
        ret(ctx, cx - 1, cy - 1, 1, 1, K); ret(ctx, cx + 1, cy - 1, 1, 1, K);
        if (i === 0 || i === 5) { ret(ctx, cx - 1, cy + 1, 3, 1, K); if (i === 5) ret(ctx, cx, cy + 2, 1, 1, K); }   // feliz, animado
        else if (i === 1) { ret(ctx, cx, cy + 1, 1, 1, K); ret(ctx, cx - 1, cy + 2, 1, 1, K); ret(ctx, cx + 1, cy + 2, 1, 1, K); }   // triste
        else if (i === 2) { ret(ctx, cx - 1, cy + 1, 3, 1, K); ret(ctx, cx - 2, cy - 2, 2, 1, K); ret(ctx, cx + 1, cy - 2, 2, 1, K); }   // bravo
        else if (i === 3) { ret(ctx, cx - 1, cy, 3, 1, C.lilas); ret(ctx, cx, cy + 1, 1, 1, K); ret(ctx, cx + 3, cy - 4, 2, 1, K); }   // com sono
        else ret(ctx, cx - 1, cy + 1, 3, 1, K);   // entediado
      }
    } });
  // engrenagem grande na parede (gira devagar)
  I.objeto('torre-engrenagem-grande', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 4, py + 4, 24, 24, 'rgba(58,36,70,0.18)');
      ret(ctx, px + 15, py + 3, 2, 26, BRONZE2);
    },
    anim: function (ctx, px, py, t, o) {
      var s = v(o, 'sentido', 1);
      engrenagem(ctx, px + 16, py + 16, 9, 10, s * t / 1800, BRONZE);
      engrenagem(ctx, px + 27, py + 7, 4, 7, -s * t / 820 + 0.3, C.metal, C.branco);
    } });
  // máquina do relógio no chão: engrenagens encaixadas
  I.objeto('torre-maquina', { w: 2, h: 1, topo: 18, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      ret(ctx, px + 1, py + 8, 30, 7, K); ret(ctx, px + 2, py + 9, 28, 5, C.madeira2); ret(ctx, px + 2, py + 9, 28, 1, C.madeiraClara);
      ret(ctx, px + 7, py - 12, 2, 21, K); ret(ctx, px + 23, py - 12, 2, 21, K);
      ret(ctx, px + 7, py - 12, 18, 2, K);
    },
    anim: function (ctx, px, py, t) {
      engrenagem(ctx, px + 11, py - 2, 6, 9, t / 1100, BRONZE);
      engrenagem(ctx, px + 22, py + 1, 4, 7, -t / 700 + 0.2, C.ouro, C.ouro3);
    } });
  // pêndulo do relógio: armação fina de bronze e o prumo que vai e volta
  I.objeto('torre-pendulo', { w: 1, h: 1, topo: 30, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 7, py - 29, 2, 43, K); ret(ctx, cx + 6, py - 29, 2, 43, K);
      ret(ctx, cx - 6, py - 28, 1, 41, BRONZE); ret(ctx, cx + 6, py - 28, 1, 41, BRONZE2);
      ret(ctx, cx - 8, py - 30, 17, 3, K); ret(ctx, cx - 7, py - 29, 15, 1, BRONZE3);
      ret(ctx, cx - 8, py + 12, 17, 3, K); ret(ctx, cx - 7, py + 13, 15, 1, BRONZE2);
      circulo(ctx, cx, py - 28, 1, C.ouro);
    },
    anim: function (ctx, px, py, t) {
      var cx = px + 8, a = Math.sin(t / 520) * 0.18;
      for (var i = 0; i < 30; i++) ret(ctx, cx + Math.round(Math.sin(a) * i), py - 27 + i, 1, 1, C.ouro2);
      var bx = cx + Math.round(Math.sin(a) * 31), by = py - 27 + Math.round(Math.cos(a) * 31);
      circulo(ctx, bx, by, 4, K); circulo(ctx, bx, by, 3, C.ouro); ret(ctx, bx - 1, by - 2, 1, 1, C.ouro3);
    } });
  // mostrador visto por dentro: vidro com os números ao contrário e os ponteiros andando
  I.objeto('torre-mostrador', { w: 3, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      var cx = px + 24, cy = py + 16;
      circulo(ctx, cx, cy, 15, K); circulo(ctx, cx, cy, 14, BRONZE); circulo(ctx, cx, cy, 12, K); circulo(ctx, cx, cy, 11, '#fff3c8');
      circulo(ctx, cx - 3, cy - 3, 5, '#fffbe6');
      for (var i = 0; i < 12; i++) {
        var a = i * Math.PI / 6;
        ret(ctx, cx + Math.round(Math.cos(a) * 9), cy + Math.round(Math.sin(a) * 9), 1, 1, i % 3 ? '#c4b4d4' : K);
      }
    },
    anim: function (ctx, px, py, t) {
      var cx = px + 24, cy = py + 16, am = t / 4000 - 1.2, ah = t / 48000 + 0.6;
      for (var i = 0; i < 8; i++) ret(ctx, cx + Math.round(Math.cos(am) * i), cy + Math.round(Math.sin(am) * i), 1, 1, K);
      for (var j = 0; j < 5; j++) ret(ctx, cx + Math.round(Math.cos(ah) * j), cy + Math.round(Math.sin(ah) * j), 2, 2, K);
      ret(ctx, cx, cy, 1, 1, C.vermelho);
    } });
  // sino da torre
  I.objeto('torre-sino', { w: 1, h: 1, topo: 18, solido: true, alto: true,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 7, py - 16, 2, 31, K); ret(ctx, cx + 6, py - 16, 2, 31, K); ret(ctx, cx - 7, py - 17, 15, 3, K);
      ret(ctx, cx - 6, py - 16, 13, 1, C.madeira);
      ret(ctx, cx, py - 14, 1, 3, K);
      triangulo(ctx, cx - 5, py - 12, 11, 11, K); triangulo(ctx, cx - 4, py - 11, 9, 9, C.ouro);
      ret(ctx, cx - 6, py - 2, 13, 3, K); ret(ctx, cx - 5, py - 1, 11, 1, C.ouro2);
      ret(ctx, cx - 2, py - 8, 1, 4, C.ouro3);
      circulo(ctx, cx, py + 2, 1, K);
    } });

  /* ================= AJUDANTES DE MONTAGEM ================= */
  // coordenadas locais do andar (0..10 × 0..10; fileiras 0 e 1 são a parede); o cômodo começa em (1,1)
  function sala(lista) {
    return lista.map(function (o) { var n = Object.assign({}, o); n.x = o.x + 1; n.y = o.y + 1; return n; });
  }
  function inter(chave, nome, o) {
    return Object.assign(o, { chave: chave, nome: nome, fala: F.objetos[chave] || '(fala de ' + chave + ')' });
  }
  function npc(id, x, y, acao) {
    var e = ELENCO[id] || {};
    return { id: id, nome: e.nome || id, sprite: e.sprite ? Object.assign({ base: 'pessoa' }, e.sprite) : { base: 'pessoa' },
      voz: e.voz || 'npc-' + id, x: x + 1, y: y + 1, acao: acao, falas: F.npcs[id] || {} };
  }
  function acaoSala(s) { return { tipo: 'sala', materia: 'ingles', sala: s }; }

  // todos os andares têm o mesmo esqueleto: 13×13, um cômodo 11×11 em (1,1);
  // sobe no fundo à direita (10,3) e desce no chão à esquerda (2,10); corredor no meio
  var ANDARES = ['torre', 'torre-1', 'torre-2', 'torre-3', 'torre-4', 'torre-5', 'torre-relogio'];
  var SOBE = { x: 10, y: 3 }, DESCE = { x: 2, y: 10 };
  function escadas(i) {
    var e = [];
    if (i < ANDARES.length - 1) e.push({ x: SOBE.x, y: SOBE.y, para: ANDARES[i + 1], chegada: { x: DESCE.x + 1, y: DESCE.y }, olhar: { x: 1, y: 0 }, sentido: 'sobe' });
    if (i > 0) e.push({ x: DESCE.x, y: DESCE.y, para: ANDARES[i - 1], chegada: { x: SOBE.x - 1, y: SOBE.y }, olhar: { x: 0, y: 1 }, sentido: 'desce' });
    return e;
  }
  function andar(i, nome, comodo, objetos, npcs, extra) {
    Reino.registrarInterior(Object.assign({
      id: ANDARES[i],
      lugar: 'materia:ingles',
      nome: nome,
      pacote: 'interior-torre',
      tamanho: { w: 13, h: 13 },
      escadas: escadas(i),
      comodos: [Object.assign({ id: 'andar', nome: nome, rect: { x: 1, y: 1, w: 11, h: 11 } }, comodo)],
      corredores: [{ x: 5, y: 3, w: 3, h: 9 }, { x: 8, y: 3, w: 2, h: 1 }, { x: 3, y: 10, w: 2, h: 1 }],
      objetos: sala(objetos),
      npcs: npcs,
    }, extra || {}));
  }
  function cartaz(x, icone, cor, faixa) { return { tipo: 'torre-cartaz', x: x, y: 0, var: { icone: icone, cor: cor, faixa: faixa } }; }

  /* ---------- TÉRREO: a oficina do relojoeiro (pedra e bronze) ---------- */
  andar(0, 'Torre do Relógio', {
    placa: 'Térreo • Torre do Relógio', piso: 'pedra', parede: 'madeira',
    paleta: { piso: '#e8dcc8', piso2: '#c9b48f', parede: '#d9a86a', parede2: '#b9824a', rodape: BRONZE2, detalhe: C.ouro },
  }, [
    { tipo: 'janela', x: 0, y: 0 },
    inter('andares', 'Quadro dos andares', { tipo: 'torre-andares', x: 1, y: 0 }),
    { tipo: 'estandarte', x: 3, y: 0, var: { cor: '#2f6fd6', emblema: 'estrela' } },
    { tipo: 'arandela', x: 4, y: 0 }, { tipo: 'relogio-parede', x: 5, y: 0 }, { tipo: 'arandela', x: 6, y: 0 },
    cartaz(7, 'relogio', '#fff3d6', BRONZE), { tipo: 'cortina', x: 8, y: 0, var: { cor: '#2f6fd6' } }, { tipo: 'janela', x: 10, y: 0 },
    { tipo: 'vaso-planta', x: 0, y: 2 }, { tipo: 'pilha-livros', x: 2, y: 2 }, { tipo: 'luminaria-pe', x: 3, y: 2 },
    { tipo: 'globo', x: 0, y: 4 },
    inter('livro', 'Livro das Palavras', { tipo: 'torre-pulpito', x: 2, y: 4, acao: { tipo: 'tela', tela: 'livro', materia: 'ingles' } }),
    { tipo: 'tapete-redondo', x: 1, y: 5, w: 2, h: 2, var: { cor: '#9fcfff' } },
    { tipo: 'pilha-livros', x: 0, y: 6 }, { tipo: 'banco', x: 0, y: 8 }, { tipo: 'cesto', x: 3, y: 8 },
    { tipo: 'tapete-listrado', x: 0, y: 9, w: 3, h: 1, var: { cores: ['#2f6fd6', '#fff8ee', '#ff5c6a', '#fff8ee'] } },
    { tipo: 'bau', x: 0, y: 10 }, { tipo: 'caixote', x: 1, y: 10, var: { item: 'relogio' } }, { tipo: 'barril', x: 2, y: 10 }, { tipo: 'vaso-grande', x: 3, y: 10 },
    { tipo: 'vaso-grande', x: 10, y: 2 },
    inter('engrenagens', 'Bancada de engrenagens', { tipo: 'torre-engrenagens', x: 8, y: 4 }),
    inter('relogio-grande', 'Relógio de pé', { tipo: 'relogio-pe', x: 10, y: 4 }),
    { tipo: 'tapete', x: 7, y: 6, w: 3, h: 2, var: { cor: '#ffd9a0', borda: BRONZE } },
    { tipo: 'flores', x: 10, y: 7 }, { tipo: 'cadeira', x: 7, y: 8, var: { almofada: '#2f6fd6' } },
    { tipo: 'mesa', x: 8, y: 8, var: { toalha: '#fff3d6', itens: ['relogio', 'xicara'] } },
    { tipo: 'cabideiro', x: 10, y: 9 }, { tipo: 'balde', x: 7, y: 10 }, { tipo: 'caixote', x: 8, y: 10, var: { item: 'moedas' } },
    { tipo: 'vaso-planta', x: 10, y: 10 }, { tipo: 'balde', x: 10, y: 8 },
  ], [
    npc('ponteiro', 3, 5, { tipo: 'guia', lugar: 'materia:ingles', livro: 'ingles' }),
  ], { entrada: true, saida: { x: 6, y: 11 }, spawn: { x: 6, y: 10 } });

  /* ---------- ANDAR 1: «Living Together» (quadra de madeira e laranja) ---------- */
  andar(1, '«Living Together»', {
    placa: 'Andar 1 • «Living Together»', piso: 'tabuas', parede: 'tijolo',
    paleta: { piso: '#f0c88a', piso2: '#d9a45e', parede: '#ffb070', parede2: '#e8884a', rodape: '#2f4f8a', detalhe: '#ffffff' },
  }, [
    { tipo: 'janela', x: 0, y: 0 }, { tipo: 'quadro-unicornio', x: 1, y: 0, var: { uni: 'i-torcida' } },
    inter('regras-escola', 'Regras da escola', cartaz(3, 'mao', '#fff8ee', C.azul)),
    { tipo: 'torre-palavra', x: 4, y: 0, var: { palavra: 'RULES', faixa: C.laranja } },
    inter('torcida', 'Cartaz da torcida', cartaz(6, 'torcida', '#fff8ee', C.vermelho)),
    inter('regras-casa', 'Regras de casa', cartaz(7, 'brinquedos', '#fff8ee', C.verde)),
    { tipo: 'relogio-parede', x: 8, y: 0 }, cartaz(10, 'apito', '#fff8ee', C.ouro),
    { tipo: 'bau', x: 0, y: 2 }, { tipo: 'caixote', x: 1, y: 2, var: { item: 'medalha' } }, { tipo: 'pilha-livros', x: 2, y: 2 },
    { tipo: 'mesa', x: 0, y: 4, var: { toalha: '#9fcfff', itens: ['livro', 'medalha'] } }, { tipo: 'cadeira', x: 2, y: 4, var: { almofada: '#ff8a3d' } },
    inter('trave', 'Trave de futebol', { tipo: 'torre-trave', x: 0, y: 6 }),
    { tipo: 'tapete-listrado', x: 0, y: 8, w: 3, h: 1, var: { cores: ['#6fdc8c', '#ffffff', '#6fdc8c', '#ffffff'] } },
    { tipo: 'balde', x: 3, y: 8 }, { tipo: 'vaso-planta', x: 0, y: 9 },
    { tipo: 'caixote', x: 0, y: 10, var: { item: 'estrela' } }, { tipo: 'almofada', x: 1, y: 10, var: { cor: '#ff8a3d' } },
    { tipo: 'papeis', x: 2, y: 10 }, { tipo: 'cesto', x: 3, y: 10 },
    { tipo: 'vaso-grande', x: 10, y: 2 },
    { tipo: 'banco', x: 8, y: 4 }, { tipo: 'cabideiro', x: 10, y: 4 },
    { tipo: 'tapete', x: 7, y: 6, w: 3, h: 2, var: { cor: '#8fd06a', borda: '#ffffff' } },
    { tipo: 'bau', x: 10, y: 6 }, { tipo: 'poltrona', x: 7, y: 9, var: { cor: '#ff8a3d' } },
    { tipo: 'mesa-centro', x: 8, y: 9 }, { tipo: 'flores', x: 10, y: 9 },
    { tipo: 'papeis', x: 8, y: 10 }, { tipo: 'caixote', x: 10, y: 10, var: { item: 'medalha' } },
  ], [
    npc('ben', 3, 5, acaoSala('i1')),
  ]);

  /* ---------- ANDAR 2: «Here Comes the Sun» (céu de noite e estrelas) ---------- */
  andar(2, '«Here Comes the Sun»', {
    placa: 'Andar 2 • «Here Comes the Sun»', piso: 'carpete', parede: 'papel',
    paleta: { piso: '#5a6ad0', piso2: '#4a58b8', parede: '#2a2f66', parede2: '#ffe066', rodape: C.ouro2, detalhe: C.ouro },
  }, [
    { tipo: 'janela', x: 0, y: 0 }, { tipo: 'quadro-unicornio', x: 1, y: 0, var: { uni: 'i-planetinha' } },
    inter('sol', 'Cartaz do sol', { tipo: 'torre-cartaz', x: 3, y: 0, var: { icone: 'sol', palavra: 'SUN', cor: '#fff3c8', faixa: C.laranja } }),
    inter('planetas', 'Móbile dos planetas', { tipo: 'torre-mobile', x: 4, y: 0 }),
    { tipo: 'arandela', x: 6, y: 0 },
    inter('arte', 'Cartaz das formas', cartaz(7, 'formas', '#fff8ee', C.rosa)),
    { tipo: 'janela', x: 8, y: 0 }, { tipo: 'torre-cartaz', x: 10, y: 0, var: { icone: 'estrela', faixa: C.ouro } },
        inter('luneta', 'Luneta', { tipo: 'torre-luneta', x: 3, y: 3 }),
    { tipo: 'mesa', x: 0, y: 4, var: { toalha: '#2a2f66', itens: ['estrela', 'globo'] } }, { tipo: 'cadeira', x: 2, y: 4, var: { almofada: '#ffd34d' } },
    { tipo: 'tapete-redondo', x: 0, y: 6, w: 2, h: 2, var: { cor: '#ffe066' } },
    { tipo: 'pilha-livros', x: 2, y: 7 }, { tipo: 'vaso-planta', x: 3, y: 8 },
    { tipo: 'cavalete', x: 0, y: 9 },
    { tipo: 'caixote', x: 0, y: 10, var: { item: 'estrela' } }, { tipo: 'almofada', x: 1, y: 10, var: { cor: '#ffd34d' } },
    { tipo: 'papeis', x: 2, y: 10 }, { tipo: 'flores', x: 3, y: 10 },
    { tipo: 'vaso-planta', x: 10, y: 2 },
    inter('relogio-sol', 'Relógio de sol', { tipo: 'torre-relogio-sol', x: 8, y: 4 }),
    inter('protetor', 'Protetor solar', { tipo: 'torre-protetor', x: 10, y: 4 }),
    { tipo: 'tapete', x: 7, y: 6, w: 3, h: 2, var: { cor: '#ffd34d', borda: '#ff8a3d' } },
    { tipo: 'poltrona', x: 10, y: 7, var: { cor: '#5a6ad0' } },
    { tipo: 'sofa', x: 7, y: 9, var: { cor: '#ffd34d' } }, { tipo: 'flores', x: 10, y: 9 },
    { tipo: 'almofada', x: 7, y: 10, var: { cor: '#b58cff' } }, { tipo: 'cesto', x: 9, y: 10 }, { tipo: 'vaso-grande', x: 10, y: 10 },
  ], [
    npc('stella', 3, 6, acaoSala('i2')),
  ]);

  /* ---------- ANDAR 3: «I Brush My Teeth Every Day» (banheiro de azulejo) ---------- */
  andar(3, '«I Brush My Teeth Every Day»', {
    placa: 'Andar 3 • «Brush My Teeth»', piso: 'azulejo', parede: 'azulejo',
    paleta: { piso: '#eef8ff', piso2: '#bfe3f7', detalhe: '#5fb4ff', parede: '#e6f6ff', parede2: '#9fdcff', rodape: '#2f6fa8' },
  }, [
    { tipo: 'janela', x: 0, y: 0 }, { tipo: 'quadro-unicornio', x: 1, y: 0, var: { uni: 'i-chuveirinho' } },
    inter('toalhas', 'Toalhas', { tipo: 'torre-toalhas', x: 3, y: 0 }),
    { tipo: 'espelho', x: 4, y: 0 },
    inter('sorriso', 'Cartaz do sorriso', cartaz(5, 'dente', '#fff8ee', C.agua)),
    { tipo: 'torre-palavra', x: 6, y: 0, var: { palavra: 'SMILE', faixa: C.agua, icone: 'dente' } },
    { tipo: 'torre-toalhas', x: 8, y: 0, var: { cor: C.ouro, cor2: C.lilas } },
    { tipo: 'torre-cartaz', x: 10, y: 0, var: { icone: 'chuveiro', faixa: C.azul } },
    { tipo: 'flores', x: 0, y: 2 }, { tipo: 'cesto', x: 1, y: 2 },
    inter('pia', 'Pia', { tipo: 'torre-pia', x: 2, y: 2 }),
    { tipo: 'cesto', x: 0, y: 4 }, { tipo: 'balde', x: 1, y: 4 },
    { tipo: 'flores', x: 2, y: 4 },
    { tipo: 'banco', x: 0, y: 6 }, { tipo: 'cabideiro', x: 3, y: 7 },
    { tipo: 'tapete-redondo', x: 1, y: 7, w: 2, h: 2, var: { cor: '#9fdcff' } },
    { tipo: 'vaso-planta', x: 0, y: 8 },
    { tipo: 'caixote', x: 0, y: 9, var: { item: 'concha' } },
    { tipo: 'cesto', x: 0, y: 10 }, { tipo: 'almofada', x: 1, y: 10, var: { cor: '#7ed9c8' } },
    { tipo: 'papeis', x: 2, y: 10 }, { tipo: 'vaso-planta', x: 3, y: 10 },
    { tipo: 'planta-alta', x: 10, y: 2 },
    inter('escova', 'Escova gigante', { tipo: 'torre-escova', x: 7, y: 4 }),
    { tipo: 'mesa', x: 8, y: 4, var: { toalha: '#ffffff', itens: ['vaso', 'concha'] } }, { tipo: 'cadeira', x: 10, y: 4, var: { almofada: '#7ed9c8' } },
    { tipo: 'tapete', x: 7, y: 6, w: 3, h: 2, var: { cor: '#7ed9c8', borda: '#ffffff' } },
    { tipo: 'bebedouro', x: 10, y: 6 },
    { tipo: 'poltrona', x: 7, y: 9, var: { cor: '#9fdcff' } }, { tipo: 'mesa-centro', x: 8, y: 9 }, { tipo: 'flores', x: 10, y: 9 },
    { tipo: 'balde', x: 7, y: 10 }, { tipo: 'pilha-livros', x: 8, y: 10 }, { tipo: 'caixote', x: 9, y: 10 }, { tipo: 'cesto', x: 10, y: 10 },
  ], [
    npc('smile', 3, 5, acaoSala('i3')),
  ]);

  /* ---------- ANDAR 4: «A Day in My Life» (quarto lilás, do sol à lua) ---------- */
  andar(4, '«A Day in My Life»', {
    placa: 'Andar 4 • «A Day in My Life»', piso: 'taco', parede: 'papel',
    paleta: { piso: '#e8c49a', piso2: '#caa078', parede: '#efe2fb', parede2: '#ffe28a', rodape: '#7c5cff' },
  }, [
    { tipo: 'janela', x: 0, y: 0 }, { tipo: 'quadro-unicornio', x: 1, y: 0, var: { uni: 'i-noitinha' } },
    { tipo: 'torre-cartaz', x: 3, y: 0, var: { icone: 'sol', palavra: 'DAY', faixa: C.ouro } },
    inter('rotina', 'O dia na parede', { tipo: 'torre-rotina', x: 4, y: 0 }),
    { tipo: 'torre-palavra', x: 7, y: 0, var: { palavra: 'NIGHT', cor: '#2a2f66', tinta: C.ouro3, faixa: C.lilas, icone: 'lua' } }, { tipo: 'janela', x: 10, y: 0 },
    inter('cama', 'Cama', { tipo: 'torre-cama', x: 0, y: 2 }),
    { tipo: 'armario', x: 0, y: 4 }, { tipo: 'luminaria-pe', x: 2, y: 4 },
    inter('licao', 'Lição de casa', { tipo: 'escrivaninha', x: 0, y: 6 }), { tipo: 'cadeira', x: 2, y: 6, var: { almofada: '#b58cff' } },
    { tipo: 'vaso-planta', x: 0, y: 8 }, { tipo: 'pilha-livros', x: 2, y: 8 },
    { tipo: 'papeis', x: 0, y: 9 },
    { tipo: 'bau', x: 0, y: 10 }, { tipo: 'almofada', x: 1, y: 10, var: { cor: '#ffe066' } },
    { tipo: 'caixote', x: 2, y: 10, var: { item: 'ursinho' } }, { tipo: 'cesto', x: 3, y: 10 },
    { tipo: 'vaso-grande', x: 10, y: 2 },
    inter('lanche', 'Mesa do almoço', { tipo: 'mesa', x: 8, y: 4, var: { toalha: '#ffe066', itens: ['bule', 'bolo'] } }),
    { tipo: 'cadeira', x: 10, y: 4, var: { almofada: '#ffe066' } },
    { tipo: 'tapete', x: 7, y: 6, w: 3, h: 2, var: { cor: '#c9a8ff', borda: '#ffe066' } },
    { tipo: 'relogio-pe', x: 10, y: 6 }, { tipo: 'flores', x: 10, y: 8 },
    { tipo: 'sofa', x: 7, y: 9, var: { cor: '#9b7bff' } },
    { tipo: 'almofada', x: 8, y: 10, var: { cor: '#b58cff' } }, { tipo: 'planta-alta', x: 10, y: 10 },
  ], [
    npc('moon', 3, 4, acaoSala('i4')),
  ]);

  /* ---------- ANDAR 5: «If You're Happy, Clap Your Hands» (sala de música) ---------- */
  andar(5, '«If You\'re Happy, Clap Your Hands»', {
    placa: 'Andar 5 • «Clap Your Hands»', piso: 'mosaico', parede: 'papel',
    paleta: { piso: '#fff0f6', piso2: '#ffc2d8', detalhe: '#ffd34d', parede: '#fff6d8', parede2: '#ffc2d8', rodape: '#ff4f9a' },
  }, [
    { tipo: 'janela', x: 0, y: 0 }, { tipo: 'quadro-unicornio', x: 1, y: 0, var: { uni: 'i-sleepy' } },
    inter('carinhas', 'Cartaz das carinhas', { tipo: 'torre-carinhas', x: 3, y: 0 }),
    { tipo: 'bandeirinhas', x: 5, y: 0 }, { tipo: 'torre-palavra', x: 7, y: 0, var: { palavra: 'HAPPY', faixa: C.rosa, icone: 'feliz' } }, { tipo: 'janela', x: 10, y: 0 },
    inter('piano', 'Piano', { tipo: 'torre-piano', x: 0, y: 2 }),
    { tipo: 'cadeira', x: 0, y: 4, var: { almofada: '#ff7eb6' } },
    inter('pandeiro', 'Pandeiro', { tipo: 'torre-pandeiro', x: 2, y: 4 }),
    { tipo: 'sofa', x: 0, y: 6, var: { cor: '#ffd34d' } }, { tipo: 'vaso-planta', x: 2, y: 7 },
    { tipo: 'tapete-listrado', x: 0, y: 8, w: 3, h: 1, var: { cores: ['#ff7eb6', '#ffd34d', '#5fb4ff', '#6fdc8c'] } },
    { tipo: 'cesto', x: 3, y: 8 }, { tipo: 'almofada', x: 0, y: 9, var: { cor: '#5fb4ff' } },
    { tipo: 'bau', x: 0, y: 10 }, { tipo: 'caixote', x: 1, y: 10, var: { item: 'estrela' } },
    { tipo: 'luminaria-pe', x: 2, y: 10 }, { tipo: 'flores', x: 3, y: 10 },
    { tipo: 'planta-alta', x: 10, y: 2 },
    { tipo: 'mesa', x: 8, y: 4, var: { toalha: '#ffc2d8', itens: ['bolo', 'xicara'] } }, { tipo: 'cadeira', x: 10, y: 4, var: { almofada: '#ffd34d' } },
    { tipo: 'tapete-redondo', x: 7, y: 6, w: 2, h: 2, var: { cor: '#ffd34d' } }, { tipo: 'vaso-grande', x: 10, y: 6 },
    { tipo: 'banco', x: 7, y: 9 }, { tipo: 'cavalete', x: 10, y: 9 },
    { tipo: 'torre-pandeiro', x: 9, y: 8 }, { tipo: 'almofada', x: 8, y: 10, var: { cor: '#ff7eb6' } }, { tipo: 'cesto', x: 10, y: 10 },
  ], [
    npc('joy', 3, 5, acaoSala('i5')),
  ]);

  /* ---------- NO ALTO: o mecanismo do relógio (sem personagem) ---------- */
  andar(6, 'O Relógio', {
    placa: 'No alto • O Relógio', piso: 'tabuas', parede: 'pedra',
    paleta: { piso: '#b98a5e', piso2: '#8f6440', parede: '#d8ccb8', parede2: '#b8a888', rodape: BRONZE2, detalhe: C.ouro },
  }, [
    { tipo: 'torre-engrenagem-grande', x: 0, y: 0 }, { tipo: 'arandela', x: 2, y: 0 },
    { tipo: 'torre-engrenagem-grande', x: 3, y: 0, var: { sentido: -1 } }, { tipo: 'arandela', x: 5, y: 0 }, { tipo: 'janela', x: 6, y: 0 },
    { tipo: 'arandela', x: 7, y: 0 },
    inter('mostrador', 'Mostrador do relógio', { tipo: 'torre-mostrador', x: 8, y: 0 }),
    inter('pendulo', 'Pêndulo', { tipo: 'torre-pendulo', x: 1, y: 2 }),
    { tipo: 'barril', x: 0, y: 3 }, { tipo: 'flores', x: 0, y: 2 },
    inter('engrenagem-grande', 'Engrenagens do relógio', { tipo: 'torre-maquina', x: 2, y: 3 }),
    { tipo: 'caixote', x: 0, y: 5, var: { item: 'relogio' } }, { tipo: 'balde', x: 3, y: 5 },
    { tipo: 'tapete-redondo', x: 1, y: 6, w: 2, h: 2, var: { cor: '#d9a86a' } },
    { tipo: 'bau', x: 0, y: 7 }, { tipo: 'caixote', x: 3, y: 8 },
    { tipo: 'barril', x: 0, y: 9 },
    { tipo: 'cesto', x: 0, y: 10 }, { tipo: 'caixote', x: 2, y: 10 }, { tipo: 'papeis', x: 3, y: 10 },
    inter('sino', 'Sino da torre', { tipo: 'torre-sino', x: 10, y: 3 }),
    { tipo: 'torre-maquina', x: 7, y: 4 },
    { tipo: 'tapete', x: 7, y: 6, w: 3, h: 2, var: { cor: '#c98a4b', borda: C.ouro } },
    { tipo: 'luminaria-pe', x: 10, y: 6 },
    { tipo: 'mesa', x: 8, y: 8, var: { toalha: '#e8dcc8', itens: ['relogio', 'moedas'] } }, { tipo: 'cadeira', x: 10, y: 8 },
    { tipo: 'banco', x: 7, y: 10 }, { tipo: 'relogio-pe', x: 10, y: 10 },
  ], []);
})();
