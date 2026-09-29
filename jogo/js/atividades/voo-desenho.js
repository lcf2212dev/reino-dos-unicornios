/* Desenho do voo de foguete (Reino.VooDesenho), em pixel art no canvas lógico de Reino.Voo (V.L × V.A).
   Quem chama: atividades/voo.js, a cada quadro. O planeta é o do Planetário (Reino.ObservatorioCenas.desenharPlaneta);
   a piloto é quem joga (PA.mariana); cenário: torre e fumaça na contagem, nebulosa e a Terra no voo, chão no pouso.
   Sem Animações: sem tremida, sem brilhos, céu e cenário parados (a física do voo continua; é a atividade). */
(function () {
  var R = window.Reino;
  var K = '#3a2446';
  // foguete 16×26: k contorno, w branco, c cinza claro, r vermelho, R vermelho escuro, b vidro, f fogo, y fogo claro.
  // A janelinha (aro nas linhas 6 e 14, vidro 8×7 nas colunas 4 a 11, linhas 7 a 13) leva a piloto: piloto()
  var FOGUETE = [
    '.......kk.......',
    '......krrk......',
    '.....krrrrk.....',
    '....krrrrrrk....',
    '...kRrrrrrrRk...',
    '..kwwwwwwwwwwk..',
    '..kcccccccccck..',
    '..kcbbbbbbbbck..',
    '..kcbbbbbbbbck..',
    '..kcbbbbbbbbck..',
    '..kcbbbbbbbbck..',
    '..kcbbbbbbbbck..',
    '..kcbbbbbbbbck..',
    '..kcbbbbbbbbck..',
    '..kcccccccccck..',
    '..kwwrrrrrrwck..',
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
  var COR = { k: K, w: '#ffffff', c: '#c9c3d8', r: '#e8413c', R: '#a82a35', b: '#8fd3ff',
    f: '#ff9a2e', y: '#ffd34d', g: '#9a8f99', d: '#6d6470',
    l: '#fff6a8' };

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
  // o destino: o MESMO desenho do Planetário (Reino.ObservatorioCenas.desenharPlaneta), crescendo no alto; Saturno
  // com o raio menor para o anel caber na tela (120 px). Sem o Observatório: o disco na cor do planeta (reserva)
  var FATOR = { saturno: 0.6 };
  function planeta(x, s, p, V) {
    // k: 0 → 0,25 no voo e continua de 0,25 → 1 na chegada (sem voltar a ficar pequeno quando o voo acaba)
    var k = s.fase === 'chegada' ? 0.25 + 0.75 * Math.min(1, s.t / 2200) : s.fase === 'fim' ? 1 : V.distancia(s) * 0.25;
    if (s.fase === 'contagem') return;
    var raio = Math.round(4 + k * 34), cx = V.L / 2, cy = Math.round(-raio * 0.3 + k * 50);
    var OC = R.ObservatorioCenas;
    if (OC && OC.desenharPlaneta && p.id) {
      try { OC.desenharPlaneta(x, p.id, cx, cy, Math.max(2, Math.round(raio * (FATOR[p.id] || 1)))); return; }
      catch (e) { if (window.console) console.error(e); }
    }
    for (var yy = -raio - 1; yy <= raio + 1; yy++) {
      for (var xx = -raio - 1; xx <= raio + 1; xx++) {
        var d = Math.sqrt(xx * xx + yy * yy);
        if (d > raio + 0.5) continue;
        x.fillStyle = d > raio - 0.7 ? K : (p.cor || '#c9c9d6');
        x.fillRect(cx + xx, cy + yy, 1, 1);
      }
    }
  }

  /* ---------- a piloto: quem joga, na janelinha ---------- */
  // o rosto do sprite do mapa (PA.mariana de frente, a mesma aparência e o mesmo corte): colunas 2 a 8 e linhas 1 a 7
  // do molde (cabelo, laço, olhos, bochechas e a gola da roupa), e na coluna ao lado o chifre e a crina do unicórnio
  var pilotoCache = { chave: null, c: null };
  function piloto() {
    var PA = window.PA, P = R.Progresso;
    if (!PA || !PA.mariana || !P || !P.estado) return null;
    var est = P.estado() || {}, ap = est.aparencia || PA.APARENCIA_PADRAO, def = null;
    try { def = P.defUni(P.montaria()); } catch (e) { def = null; }
    var cores = (def && def.cores) || {}, crina = cores.crina || [];
    var chave = JSON.stringify([ap, def && def.id, cores.chifre, crina]);
    if (pilotoCache.chave === chave) return pilotoCache.c;
    var c = null;
    try {
      var spr = PA.mariana(ap, false, 0, { vista: 'frente' });
      c = PA.novoCanvas(8, 7);
      var cx = c.getContext('2d');
      cx.imageSmoothingEnabled = false;
      cx.drawImage(spr.canvas, 3, 2, 7, 7, 0, 0, 7, 7);   // +1: o contorno que o contornar pôs em volta
      if (def) {
        var ch = cores.chifre || '#ffd34d';
        [[1, PA.cor.clarear(ch, 0.45)], [2, ch], [3, crina[0]], [4, crina[1] || crina[0]], [5, crina[0]], [6, crina[2] || crina[1] || crina[0]]]
          .forEach(function (q) { if (q[1]) { cx.fillStyle = q[1]; cx.fillRect(7, q[0], 1, 1); } });
      }
    } catch (e) { c = null; }
    pilotoCache = { chave: chave, c: c };
    return c;
  }

  /* ---------- cenário: decolagem, fundo do voo e pouso ---------- */
  // tudo em degraus de 120 ms (--rapido) ou em deslocamento inteiro; sem Animações, cada coisa fica parada
  // no lugar final (sem subir, sem descer, sem fumaça mexendo)
  function ret(x, cor, a, b, w, h) { x.fillStyle = cor; x.fillRect(a, b, w, h); }
  function plataforma(x, V, dy) {
    var y = V.A - 12 + dy;
    ret(x, '#4a3f66', 0, y, V.L, 12); ret(x, K, 0, y, V.L, 1);
    ret(x, '#8a7fae', V.L / 2 - 14, y - 2, 28, 3); ret(x, K, V.L / 2 - 14, y - 2, 28, 1);
    // a torre do Hangar, à esquerda: dois postes, travessas em X e o braço que segura o foguete
    var tx = 34, topo = y - 2 - 40;
    ret(x, K, tx - 1, topo - 1, 12, 41);
    ret(x, '#c9c3d8', tx, topo, 2, 40); ret(x, '#c9c3d8', tx + 8, topo, 2, 40);
    ret(x, '#8a7fae', tx + 2, topo, 6, 40);
    for (var j = 0; j < 40; j += 8) {
      for (var i = 0; i < 6; i++) { ret(x, '#c9c3d8', tx + 2 + i, topo + j + i + 1, 1, 1); ret(x, '#c9c3d8', tx + 7 - i, topo + j + i + 1, 1, 1); }
      ret(x, K, tx + 2, topo + j, 6, 1);
    }
    ret(x, '#e8413c', tx + 4, topo - 3, 2, 2); ret(x, K, tx + 3, topo - 4, 4, 1);   // a luzinha vermelha no alto
    ret(x, K, tx + 10, topo + 11, 10, 3); ret(x, '#c9c3d8', tx + 10, topo + 12, 9, 1);   // o braço
  }
  // fumaça da contagem: nuvenzinhas dos dois lados da base; com Animações, trocam de quadro a cada 240 ms
  var FUMACA = [[-12, 0, 4], [-7, 2, 3], [11, 0, 4], [7, 2, 3], [-17, -2, 3], [16, -2, 3]];
  function fumaca(x, V, fx, quadro) {
    var base = V.A - 16;
    FUMACA.forEach(function (f, i) {
      var r = f[2] + ((quadro + i) % 2), cx = fx + 8 + f[0] + (f[0] < 0 ? -(quadro % 2) : quadro % 2), cy = base + f[1] - (quadro % 2);
      for (var j = -r; j <= r; j++) for (var q = -r; q <= r; q++) {
        var d = q * q + j * j;
        if (d > r * r + r * 0.6) continue;
        ret(x, d > (r - 1) * (r - 1) + (r - 1) * 0.6 ? K : (q + j < 0 ? '#ffffff' : '#d9d2ea'), cx + q, cy + j, 1, 1);
      }
    });
  }
  // nebulosa do voo: pontilhado de 2 tons (uma vez, em cache), descendo bem devagar (4 px/s, inteiro)
  var nebulosa = null;
  function desenhoNebulosa() {
    if (nebulosa || !window.PA) return nebulosa;
    var W = 44, H = 30, c = window.PA.novoCanvas(W, H), cx = c.getContext('2d');
    var bolhas = [[14, 16, 12, 9], [28, 12, 13, 8], [24, 21, 9, 6]];
    for (var y = 0; y < H; y++) for (var i = 0; i < W; i++) {
      var f = 0;
      bolhas.forEach(function (b) { var a = (i - b[0]) / b[2], e = (y - b[1]) / b[3]; f = Math.max(f, 1 - (a * a + e * e)); });
      if (f <= 0) continue;
      var xadrez = (i + y) & 1;
      if (f > 0.55) ret(cx, xadrez ? '#33276e' : '#2a2262', i, y, 1, 1);
      else if (f > 0.25 && xadrez) ret(cx, '#241d56', i, y, 1, 1);
      else if (f > 0 && !(i % 2) && !(y % 2)) ret(cx, '#1f1a4c', i, y, 1, 1);
    }
    return (nebulosa = c);
  }
  function fundoDoVoo(x, s, V, animar) {
    var neb = desenhoNebulosa();
    if (neb) {
      var ny = animar ? Math.floor(s.t * 4 / 1000) % (V.A + neb.height) - neb.height : 60;
      x.drawImage(neb, 70, ny);
    }
    // a Terra ficando para trás, embaixo à esquerda: diminui um degrau a cada 1,5 s e desce 1 px por segundo
    var OC = R.ObservatorioCenas;
    if (OC && OC.desenharPlaneta) {
      var r = animar ? Math.max(3, 9 - Math.floor(s.t / 1500)) : 4, ty = animar ? 150 + Math.floor(s.t / 1000) : 156;
      if (ty - r < V.A) try { OC.desenharPlaneta(x, 'terra', 20, ty, r); } catch (e) { /* sem Observatório */ }
    }
  }
  // o chão do planeta no pouso: sobe em 8 degraus de 120 ms até o foguete encostar (topo em V.FOGUETE_Y + 11)
  function chao(x, s, p, V, animar) {
    var PA = window.PA, cor = p.cor || '#c9c9d6';
    var esc = PA && PA.cor ? PA.cor.escurecer(cor, 0.25) : cor, cla = PA && PA.cor ? PA.cor.clarear(cor, 0.3) : cor;
    var t = s.fase === 'fim' ? 1e9 : s.t, dy = animar ? Math.max(0, 8 - Math.floor(t / 120)) * 4 : 0;
    var y = V.FOGUETE_Y + 11 + dy;
    ret(x, cor, 0, y, V.L, V.A - y); ret(x, K, 0, y, V.L, 1); ret(x, cla, 0, y + 1, V.L, 1);
    // pedrinhas e buraquinhos fixos
    [[8, 8, 3], [26, 16, 2], [94, 10, 3], [108, 20, 2], [40, 24, 2], [80, 22, 3]].forEach(function (q) {
      ret(x, esc, q[0], y + q[1], q[2] * 2, q[2]); ret(x, cla, q[0], y + q[1] + q[2], q[2] * 2, 1);
    });
    // o pad de pouso (igual ao da decolagem)
    ret(x, '#8a7fae', V.L / 2 - 14, y, 28, 3); ret(x, K, V.L / 2 - 14, y, 28, 1); ret(x, K, V.L / 2 - 14, y + 3, 28, 1);
    return dy === 0;
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
      if (s.fase === 'voo') fundoDoVoo(x, s, V, animar);
      planeta(x, s, p, V);
      var fx = Math.round(s.x) - 8, pousou = false;
      if (s.fase === 'contagem') plataforma(x, V, 0);
      // decolagem: com Animações, a plataforma e a torre descem e somem em 6 degraus de 120 ms
      else if (s.fase === 'voo' && animar && s.t < 720) plataforma(x, V, (Math.floor(s.t / 120) + 1) * 10);
      if (s.fase === 'chegada' || s.fase === 'fim') pousou = chao(x, s, p, V, animar);
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
      // na plataforma (topo em V.A - 14), sem o fogo: as 22 primeiras linhas, encostadas nela; pousada, idem no chão
      var fy = s.fase === 'contagem' ? V.A - 14 - 22 : V.FOGUETE_Y - 11;
      if (s.fase === 'contagem') { sprite(x, FOGUETE.slice(0, 22), fx, fy); fumaca(x, V, fx, animar ? Math.floor(t / 240) % 2 : 0); }
      else if (pousou) sprite(x, FOGUETE.slice(0, 22), fx, fy);
      else if (!pisca) sprite(x, FOGUETE, fx, fy, claro || (animar && Math.floor(t / 120) % 2 ? { y: 'f' } : null));
      // a piloto na janelinha (vidro nas colunas 4 a 11, linhas 7 a 13)
      var pil = (s.fase === 'contagem' || pousou || !pisca) ? piloto() : null;
      if (pil) x.drawImage(pil, fx + 4, fy + 7);
      x.restore();
    },
  };
})();
