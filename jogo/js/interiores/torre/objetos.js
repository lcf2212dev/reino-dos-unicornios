/* Torre do Relógio, parte 1 de 2: os objetos temáticos (prefixo torre-), os pictogramas e a fonte
   3×5 dos cartazes e os desenhos pequenos que eles usam.
   O que as outras partes usam fica em Reino._predios.torre (ver o fim do arquivo). */
(function () {
  var R = window.Reino;
  var I = R.Interiores, D = I.desenho, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, contornoRet = D.contornoRet;
  var K = '#3a2446';
  var F = (R.FALAS_INTERIORES && R.FALAS_INTERIORES.torre) || { npcs: {}, objetos: {} };
  var ELENCO = (R.NPCs && R.NPCs.ELENCO) || {};
  // o que as partes do prédio compartilham (criado aqui; cada parte põe o seu no fim do arquivo)
  var S = (R._predios = R._predios || {}).torre = {};
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

  // para as outras partes (R._predios.torre)
  S.BRONZE = BRONZE; S.BRONZE2 = BRONZE2;
})();
