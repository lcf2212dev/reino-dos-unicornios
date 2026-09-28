/* Desenho do voo de foguete (Reino.VooDesenho), em pixel art no canvas lógico de Reino.Voo (V.L × V.A).
   Quem chama: atividades/voo.js, a cada quadro. Sem Animações: sem tremida, sem brilhos e céu parado
   (a física do voo continua; é a atividade). */
(function () {
  var R = window.Reino;
  var K = '#3a2446';
  // foguete 16×26: k contorno, w branco, c cinza claro, r vermelho, R vermelho escuro, h cabelo, p pele,
  // e olho, m boca, s blusa, f fogo, y fogo claro. A Mariana na janelinha (linhas 6 a 12)
  var FOGUETE = [
    '.......kk.......',
    '......krrk......',
    '.....krrrrk.....',
    '....krrrrrrk....',
    '...kRrrrrrrRk...',
    '..kwwwwwwwwwwk..',
    '..kwkkkkkkkkwk..',
    '..kwkhhhhhhkwk..',
    '..kwkhpppphkwk..',
    '..kwkpeppepkwk..',
    '..kwkppmmppkwk..',
    '..kwksssssskwk..',
    '..kwkkkkkkkkwk..',
    '..kwwwwwwwwwwk..',
    '..kwwrrrrrrwck..',
    '..kwwwwwwwwwck..',
    '.kkwwwwwwwwwckk.',
    'krkwwwwwwwwwckrk',
    'krrkwwwwwwwckrrk',
    'kRRkwwwwwwwckRRk',
    'kRRkkkkkkkkkkRRk',
    'kkk.kckkkkck.kkk',
    '.....kffffk.....',
    '......fyyf......',
    '......fyyf......',
    '.......ff.......',
  ];
  // estrela 11×11, bem amarela (l = brilho)
  var ESTRELA = [
    '.....k.....',
    '....kyk....',
    '....kyk....',
    'kkkkylykkkk',
    '.kyyllyyyk.',
    '..kyyyyyk..',
    '...kyyyk...',
    '..kyykyyk..',
    '..kyk.kyk..',
    '.kyk...kyk.',
    '.kk.....kk.',
  ];
  var COR = { k: K, w: '#ffffff', c: '#c9c3d8', r: '#e8413c', R: '#a82a35', b: '#8fd3ff', p: '#f6c9a6', h: '#6b3a2a',
    f: '#ff9a2e', y: '#ffd34d', g: '#9a8f99', d: '#6d6470',
    e: '#3a2446', m: '#e0607a', s: '#a45bd6', l: '#fff6a8' };

  function sprite(x, m, px, py, trocar) {
    for (var j = 0; j < m.length; j++) {
      for (var i = 0; i < m[j].length; i++) {
        var ch = m[j].charAt(i);
        if (ch === '.') continue;
        if (trocar && trocar[ch]) ch = trocar[ch];
        x.fillStyle = COR[ch] || ch;
        x.fillRect(px + i, py + j, 1, 1);
      }
    }
  }
  // asteroide redondo de n px com crateras (giro muda onde elas ficam)
  var CRATERAS = [[-0.3, -0.2, 0.22], [0.25, 0.2, 0.18], [0.05, -0.35, 0.12]];
  function pedra(x, o) {
    var n = o.tam || 10, r = n / 2, cx = Math.round(o.x), cy = Math.round(o.y), g = o.giro || 0;
    for (var j = 0; j < n; j++) {
      for (var i = 0; i < n; i++) {
        var dx = i + 0.5 - r, dy = j + 0.5 - r, d = Math.sqrt(dx * dx + dy * dy);
        if (d > r) continue;
        var cor = d > r - 1.2 ? K : (dx + dy > r * 0.5 ? COR.d : COR.g);
        for (var c = 0; c < CRATERAS.length && d <= r - 1.2; c++) {
          var cr = CRATERAS[(c + g) % CRATERAS.length], qx = (g % 2 ? -cr[0] : cr[0]) * n, qy = cr[1] * n;
          var dc = Math.sqrt((dx - qx) * (dx - qx) + (dy - qy) * (dy - qy));
          if (dc < cr[2] * n) cor = dc < cr[2] * n - 1 ? COR.d : K;
        }
        x.fillStyle = cor; x.fillRect(cx - Math.floor(r) + i, cy - Math.floor(r) + j, 1, 1);
      }
    }
  }
  // estrelinhas do fundo: posições fixas (hash do índice, sem gastar sorteio)
  var FUNDO = [];
  for (var n = 0; n < 60; n++) FUNDO.push({ x: (n * 37 + 11) % 120, y: (n * 71 + 29) % 180, camada: n % 3 });

  function ceu(x, s, animar, V) {
    x.fillStyle = '#16123a'; x.fillRect(0, 0, V.L, V.A);
    var anda = animar && s.fase !== 'contagem';
    for (var i = 0; i < FUNDO.length; i++) {
      var e = FUNDO[i], vel = anda ? [8, 16, 30][e.camada] : 0;
      var y = Math.floor(e.y + s.total * vel / 1000) % V.A;
      x.fillStyle = e.camada === 2 ? '#ffffff' : e.camada === 1 ? '#c9c3f0' : '#6f68a8';
      x.fillRect(e.x, y, 1, 1);
    }
  }
  function planeta(x, s, p, V) {
    var k = s.fase === 'chegada' ? Math.min(1, s.t / 2200) : s.fase === 'fim' ? 1 : V.distancia(s) * 0.25;
    if (s.fase === 'contagem') return;
    var raio = Math.round(4 + k * 34), cx = V.L / 2, cy = Math.round(-raio * 0.3 + k * 50);
    for (var yy = -raio - 1; yy <= raio + 1; yy++) {
      for (var xx = -raio - 1; xx <= raio + 1; xx++) {
        var d = Math.sqrt(xx * xx + yy * yy);
        if (d > raio + 0.5) continue;
        x.fillStyle = d > raio - 0.7 ? K : (p.cor || '#c9c9d6');
        x.fillRect(cx + xx, cy + yy, 1, 1);
        // brilho do sol no canto de cima (um véu branco por cima da cor)
        if (d <= raio - 0.7 && xx + yy < -raio * 0.6) { x.fillStyle = 'rgba(255,255,255,0.35)'; x.fillRect(cx + xx, cy + yy, 1, 1); }
      }
    }
  }
  function plataforma(x, V) {
    x.fillStyle = '#4a3f66'; x.fillRect(0, V.A - 12, V.L, 12);
    x.fillStyle = K; x.fillRect(0, V.A - 12, V.L, 1);
    x.fillStyle = '#8a7fae'; x.fillRect(V.L / 2 - 14, V.A - 14, 28, 3);
    x.fillStyle = K; x.fillRect(V.L / 2 - 14, V.A - 14, 28, 1);
  }

  // portal: uma faixa colorida por opção (os textos vão em DOM por cima, voo-portais.js); bordas e postes em pixel
  function portal(x, s, o, animar, t, V) {
    var n = o.p.opcoes.length, a = V.PORTAL_A, y0 = Math.round(o.y - a / 2), lw = V.L / n;
    if (y0 > V.A || y0 + a < 0) return;
    for (var i = 0; i < n; i++) {
      var x0 = Math.round(i * lw), x1 = Math.round((i + 1) * lw);
      x.fillStyle = V.CORES_PORTAL[i % V.CORES_PORTAL.length]; x.fillRect(x0, y0, x1 - x0, a);
      x.fillStyle = 'rgba(255,255,255,0.3)'; x.fillRect(x0, y0 + 1, x1 - x0, 2);
      x.fillStyle = K; x.fillRect(x0, y0, 1, a); x.fillRect(x1 - 1, y0, 1, a);
    }
    x.fillStyle = K; x.fillRect(0, y0, V.L, 1); x.fillRect(0, y0 + a - 1, V.L, 1);
    // passou pela certa: moldura de luz na faixa (só com Animações, piscando)
    if (animar && o.fase === 'passou' && o.escolha === o.p.certa && Math.floor(t / 120) % 2) {
      var c0 = Math.round(o.escolha * lw);
      x.fillStyle = '#fff6a8';
      x.fillRect(c0, y0 - 2, Math.round(lw), 2); x.fillRect(c0, y0 + a, Math.round(lw), 2);
    }
  }

  R.VooDesenho = {
    quadro: function (x, s, p, animar, t) {
      var V = R.Voo;
      x.imageSmoothingEnabled = false;
      x.save();
      if (animar && s.tremer > 0) x.translate(Math.round(Math.sin(s.total / 25) * 2), 0);
      ceu(x, s, animar, V);
      planeta(x, s, p, V);
      if (s.fase === 'contagem') plataforma(x, V);
      if (s.fase === 'voo') (s.portais || []).forEach(function (o) { portal(x, s, o, animar, t, V); });
      s.objs.forEach(function (o) {
        if (o.tipo !== 'estrela') { pedra(x, o); return; }
        var ox = Math.round(o.x), oy = Math.round(o.y);
        sprite(x, ESTRELA, ox - 5, oy - 5);
        // brilho piscando em volta (só com Animações)
        if (animar && Math.floor((t + o.giro * 150) / 300) % 2) {
          x.fillStyle = '#ffffff';
          x.fillRect(ox - 8, oy - 1, 1, 1); x.fillRect(ox + 8, oy + 1, 1, 1); x.fillRect(ox + 1, oy - 8, 1, 1);
        }
      });
      if (animar) s.brilhos.forEach(function (b) {
        var r = Math.round((400 - b.vida) / 60) + 2;
        x.fillStyle = '#fff6a8';
        x.fillRect(Math.round(b.x) - r, Math.round(b.y), 1, 1); x.fillRect(Math.round(b.x) + r, Math.round(b.y), 1, 1);
        x.fillRect(Math.round(b.x), Math.round(b.y) - r, 1, 1); x.fillRect(Math.round(b.x), Math.round(b.y) + r, 1, 1);
      });
      // bateu: com Animações o foguete pisca; sem, fica um tiquinho mais claro (fixo) enquanto dura
      var pisca = animar && s.tremer > 0 && Math.floor(s.tremer / 80) % 2 === 0;
      var claro = !animar && s.tremer > 0 ? { R: 'r', c: 'w', k: '#6a5478' } : null;
      var fx = Math.round(s.x) - 8;
      // na plataforma (topo em V.A - 14), sem o fogo: as 22 primeiras linhas, encostadas nela
      if (s.fase === 'contagem') sprite(x, FOGUETE.slice(0, 22), fx, V.A - 14 - 22);
      else if (!pisca) sprite(x, FOGUETE, fx, V.FOGUETE_Y - 11, claro || (animar && Math.floor(t / 120) % 2 ? { y: 'f' } : null));
      x.restore();
    },
  };
})();
