/* Enfeites de 1 tile da cidade (Mapa.CIDADE.enfeites e .motivos, mundo/lugares.js): poste, banco, canteiro, cerca,
   pedra, poço, caixa de correio, placa de direção e pedrinhas; e o halo dos lampiões (só com Animações).
   Usa as cores de mundo/cidade-desenho.js (I.CIDADE_CORES) e os ajudantes de mundo/mapa-desenho.js. Entrega:
     I.desenharPeca(ctx, tipo, x, y)  um enfeite posto à mão (tile x, y)
     I.PECAS_ALTAS                    as que entram na ordem de cima para baixo (sprite em mundo/mapa-desenho.js)
     I.chavePeca(tipo, x, y)          peças iguais dividem o sprite (o desenho não muda com o lugar, só a cerca)
     I.animarPostes(ctx, t)           o halo que respira em volta das lanternas (chamado por I.animarCidade) */
(function () {
  var Mapa = window.Mapa, I = Mapa._interno;
  var T = Mapa.T;
  var ret = I.ret, elipse = I.elipse, triangulo = I.triangulo, sombra = I.sombraChao;
  var K = I.C.contorno, CC = I.CIDADE_CORES;
  var PEDRA = CC.PEDRA, PEDRA2 = CC.PEDRA2, PEDRA3 = CC.PEDRA3, PEDRA4 = CC.PEDRA4;
  var MADEIRA = CC.MADEIRA, MADEIRA2 = CC.MADEIRA2, MADEIRA3 = CC.MADEIRA3, FERRO = CC.FERRO, FERRO2 = CC.FERRO2;

  // poste de ferro (35 px): pé em dois degraus, haste com anel, lanterna de vidro com chama e chapéu
  function poste(ctx, px, py) {
    sombra(ctx, px + 8, py + 15, 6);
    ret(ctx, px + 4, py + 11, 8, 5, K); ret(ctx, px + 5, py + 12, 6, 3, FERRO); ret(ctx, px + 5, py + 12, 6, 1, FERRO2);
    ret(ctx, px + 5, py + 8, 6, 4, K); ret(ctx, px + 6, py + 9, 4, 2, FERRO); ret(ctx, px + 6, py + 9, 1, 2, FERRO2);
    ret(ctx, px + 6, py - 6, 4, 15, K); ret(ctx, px + 7, py - 6, 2, 15, FERRO); ret(ctx, px + 7, py - 6, 1, 15, FERRO2);
    ret(ctx, px + 5, py, 6, 2, K); ret(ctx, px + 6, py, 4, 1, '#ffd34d');
    // braçadeira e lanterna
    ret(ctx, px + 4, py - 7, 8, 2, K); ret(ctx, px + 5, py - 7, 6, 1, FERRO2);
    ret(ctx, px + 3, py - 15, 10, 9, K);
    ret(ctx, px + 4, py - 14, 8, 7, '#ffe98a'); ret(ctx, px + 4, py - 14, 2, 7, '#fff8d0');
    ret(ctx, px + 8, py - 14, 1, 7, K);
    ret(ctx, px + 6, py - 11, 2, 3, '#ff8a3d'); ret(ctx, px + 6, py - 10, 1, 2, '#ffd34d');
    // chapéu em dois andares e a ponta dourada
    ret(ctx, px + 2, py - 17, 12, 3, K); ret(ctx, px + 3, py - 16, 10, 1, FERRO2);
    ret(ctx, px + 5, py - 19, 6, 3, K); ret(ctx, px + 6, py - 18, 4, 1, FERRO2);
    ret(ctx, px + 7, py - 20, 2, 1, K); ret(ctx, px + 7, py - 19, 1, 1, '#ffd34d');
  }
  // banco de praça: encosto de ripas, assento, braços e pés de ferro
  function banco(ctx, px, py) {
    sombra(ctx, px + 8, py + 15, 8);
    ret(ctx, px + 1, py + 1, 14, 8, K);
    ret(ctx, px + 2, py + 2, 12, 2, MADEIRA); ret(ctx, px + 2, py + 2, 12, 1, MADEIRA3);
    ret(ctx, px + 2, py + 5, 12, 2, MADEIRA); ret(ctx, px + 2, py + 5, 12, 1, MADEIRA3);
    ret(ctx, px + 6, py + 3, 1, 1, MADEIRA2); ret(ctx, px + 10, py + 6, 1, 1, MADEIRA2);
    ret(ctx, px + 1, py + 8, 14, 5, K);
    ret(ctx, px + 2, py + 9, 12, 1, MADEIRA3); ret(ctx, px + 2, py + 10, 12, 1, MADEIRA); ret(ctx, px + 2, py + 11, 12, 1, MADEIRA2);
    // braços de ferro com voltinha
    [0, 14].forEach(function (bx) {
      ret(ctx, px + bx, py + 4, 2, 10, K); ret(ctx, px + bx, py + 3, 2, 1, FERRO2);
    });
    ret(ctx, px + 2, py + 13, 2, 3, K); ret(ctx, px + 12, py + 13, 2, 3, K);
    ret(ctx, px + 4, py + 13, 8, 1, FERRO); ret(ctx, px + 1, py + 15, 4, 1, K); ret(ctx, px + 11, py + 15, 4, 1, K);
  }
  // floreira de madeira: tábuas, pregos, terra, folhas e flores
  function canteiro(ctx, px, py) {
    sombra(ctx, px + 8, py + 15, 8);
    ret(ctx, px + 1, py + 7, 14, 9, K);
    ret(ctx, px + 2, py + 8, 12, 7, MADEIRA); ret(ctx, px + 2, py + 8, 12, 1, MADEIRA3); ret(ctx, px + 2, py + 11, 12, 1, MADEIRA2);
    ret(ctx, px + 2, py + 14, 12, 1, MADEIRA2); ret(ctx, px + 2, py + 8, 1, 7, MADEIRA3);
    [[3, 9], [12, 9], [3, 12], [12, 12]].forEach(function (p) { ret(ctx, px + p[0], py + p[1], 1, 1, '#ffd34d'); });
    ret(ctx, px + 2, py + 7, 12, 1, '#8a5a3c');
    elipse(ctx, px + 8, py + 6, 6, 2, '#6e9c2c'); elipse(ctx, px + 8, py + 5, 5, 2, '#8fb83a');
    ret(ctx, px + 3, py + 5, 2, 1, '#b6d24e'); ret(ctx, px + 10, py + 4, 2, 1, '#b6d24e');
    // tulipas atrás e margaridas na frente
    [[4, 3, '#ff8a3d'], [11, 3, '#ff9cc6'], [8, 2, '#b58cff']].forEach(function (f) {
      ret(ctx, px + f[0], py + f[1] + 1, 1, 2, '#6e9c2c'); ret(ctx, px + f[0] - 1, py + f[1] - 2, 3, 3, f[2]);
      ret(ctx, px + f[0], py + f[1] - 3, 1, 1, f[2]); ret(ctx, px + f[0] - 1, py + f[1] - 2, 1, 1, '#ffffff');
    });
    [[6, 6, '#ffffff', '#ffd34d'], [10, 6, '#ffe066', '#ff8a3d']].forEach(function (f) {
      ret(ctx, px + f[0] - 1, py + f[1], 3, 1, f[2]); ret(ctx, px + f[0], py + f[1] - 1, 1, 3, f[2]); ret(ctx, px + f[0], py + f[1], 1, 1, f[3]);
    });
  }
  // cerca branca: estacas pontudas, duas travessas e, na ponta da fileira, um mourão com chapéu
  function cerca(ctx, px, py, x, y) {
    var esq = x > 0 && I.decor[y][x - 1] === 'cerca', dir = x < Mapa.W - 1 && I.decor[y][x + 1] === 'cerca';
    ret(ctx, px + (esq ? 0 : 2), py + 14, (dir ? 16 : 14) - (esq ? 0 : 2), 1, 'rgba(58,36,70,0.15)');
    function estaca(s) {
      ret(ctx, px + s, py + 1, 2, 1, K); ret(ctx, px + s - 1, py + 2, 4, 12, K);
      ret(ctx, px + s, py + 2, 2, 11, '#ffffff'); ret(ctx, px + s + 1, py + 3, 1, 10, '#e8e0f0');
    }
    [3, 8, 13].forEach(estaca);
    var a = esq ? 0 : 3, b = dir ? 16 : 13;
    [5, 10].forEach(function (ty) {
      ret(ctx, px + a, py + ty, b - a, 3, K); ret(ctx, px + a, py + ty + 1, b - a, 1, '#ffffff');
      for (var q = a; q < b; q += 5) ret(ctx, px + q + 2, py + ty + 1, 1, 1, '#e8e0f0');
    });
    [[!esq, 0], [!dir, 11]].forEach(function (m) {
      if (!m[0]) return;
      var mx = px + m[1];
      ret(ctx, mx, py + 1, 5, 14, K); ret(ctx, mx + 1, py + 2, 3, 12, '#ffffff'); ret(ctx, mx + 3, py + 2, 1, 12, '#e8e0f0');
      ret(ctx, mx - 1, py - 1, 7, 3, K); ret(ctx, mx, py, 5, 1, '#ff9cc6');
    });
  }
  function pedra(ctx, px, py) {
    sombra(ctx, px + 8, py + 13, 6);
    elipse(ctx, px + 8, py + 9, 6, 5, K); elipse(ctx, px + 8, py + 9, 5, 4, '#b4a8c6');
    elipse(ctx, px + 7, py + 8, 4, 3, '#c9c0d6'); elipse(ctx, px + 6, py + 7, 2, 1, '#e6e0ee');
    ret(ctx, px + 9, py + 10, 3, 1, '#a89cb8'); ret(ctx, px + 10, py + 7, 1, 3, '#a89cb8');
    ret(ctx, px + 4, py + 5, 3, 1, '#8fb83a'); ret(ctx, px + 5, py + 4, 1, 1, '#b6d24e');
    ret(ctx, px + 2, py + 12, 2, 1, '#8fb83a'); ret(ctx, px + 12, py + 13, 3, 1, '#8fb83a');
  }
  // motivos dos campos (Mapa.CIDADE.motivos): poço, caixa de correio, placa de direção e a trilha de pedras (chão)
  function poco(ctx, px, py) {
    sombra(ctx, px + 8, py + 15, 8);
    // boca de pedra em blocos desencontrados
    ret(ctx, px + 1, py + 5, 14, 11, K); ret(ctx, px + 2, py + 6, 12, 9, PEDRA2); ret(ctx, px + 2, py + 6, 12, 1, PEDRA);
    ret(ctx, px + 2, py + 10, 12, 1, PEDRA3); ret(ctx, px + 2, py + 14, 12, 1, PEDRA3);
    [6, 11].forEach(function (q) { ret(ctx, px + q, py + 7, 1, 3, PEDRA3); });
    [4, 9].forEach(function (q) { ret(ctx, px + q, py + 11, 1, 3, PEDRA3); });
    ret(ctx, px + 2, py + 6, 1, 8, PEDRA);
    ret(ctx, px + 3, py + 4, 10, 3, K); ret(ctx, px + 4, py + 5, 8, 1, '#2a7f78'); ret(ctx, px + 5, py + 5, 2, 1, '#7ed9c8');
    // esteios, sarilho com manivela, corda e balde
    [2, 11].forEach(function (sx) {
      ret(ctx, px + sx, py - 7, 3, 12, K); ret(ctx, px + sx + 1, py - 6, 1, 11, MADEIRA); ret(ctx, px + sx + 1, py - 2, 1, 1, MADEIRA2);
    });
    ret(ctx, px + 4, py - 4, 8, 3, K); ret(ctx, px + 5, py - 3, 6, 1, MADEIRA3);
    ret(ctx, px + 14, py - 4, 2, 1, K); ret(ctx, px + 15, py - 4, 1, 3, K);
    ret(ctx, px + 8, py - 1, 1, 3, '#e8d3a8');
    ret(ctx, px + 6, py + 1, 5, 4, K); ret(ctx, px + 7, py + 2, 3, 2, FERRO2); ret(ctx, px + 7, py + 2, 3, 1, '#c8b8d8');
    // telhadinho de telhas cor-de-rosa
    triangulo(ctx, px - 1, py - 15, 18, 9, K); triangulo(ctx, px + 1, py - 13, 14, 7, '#ff9cc6');
    for (var q = 0; q < 14; q += 3) ret(ctx, px + 1 + q, py - 9, 2, 1, '#e0679a');
    ret(ctx, px + 4, py - 11, 8, 1, '#ffc9df');
    ret(ctx, px - 1, py - 7, 18, 2, K); ret(ctx, px, py - 7, 16, 1, '#e0679a');
  }
  // caixa de correio azul num poste de madeira, com bandeirinha vermelha e coração
  function correio(ctx, px, py) {
    sombra(ctx, px + 8, py + 15, 5);
    ret(ctx, px + 6, py + 13, 5, 3, K); ret(ctx, px + 7, py + 14, 3, 1, MADEIRA2);
    ret(ctx, px + 7, py + 1, 3, 13, K); ret(ctx, px + 8, py + 1, 1, 13, MADEIRA); ret(ctx, px + 8, py + 6, 1, 1, MADEIRA2);
    // caixa de teto redondo
    ret(ctx, px + 1, py - 6, 14, 9, K); ret(ctx, px + 2, py - 8, 12, 2, K); ret(ctx, px + 4, py - 9, 8, 1, K);
    ret(ctx, px + 2, py - 6, 12, 8, '#5fb4ff'); ret(ctx, px + 3, py - 8, 10, 2, '#5fb4ff'); ret(ctx, px + 5, py - 8, 6, 1, '#9fdcff');
    ret(ctx, px + 2, py - 6, 1, 7, '#9fdcff'); ret(ctx, px + 3, py - 7, 1, 1, '#9fdcff');
    ret(ctx, px + 2, py + 1, 12, 1, '#3f7fe0'); ret(ctx, px + 13, py - 6, 1, 7, '#3f7fe0');
    // portinha da frente, fresta e coração
    ret(ctx, px + 4, py - 5, 1, 6, '#3f7fe0'); ret(ctx, px + 6, py - 4, 5, 1, K);
    ret(ctx, px + 7, py - 2, 1, 1, '#ff9cc6'); ret(ctx, px + 9, py - 2, 1, 1, '#ff9cc6'); ret(ctx, px + 7, py - 1, 3, 1, '#ff9cc6'); ret(ctx, px + 8, py, 1, 1, '#ff9cc6');
    // bandeirinha levantada
    ret(ctx, px + 14, py - 12, 2, 9, K); ret(ctx, px + 15, py - 12, 3, 4, K); ret(ctx, px + 15, py - 11, 2, 2, '#ff5c6a');
    ret(ctx, px + 15, py - 11, 1, 1, '#ff9aa2');
  }
  // placa de direção: poste com chapéu e duas tábuas em seta, com coração e estrela pintados
  function placa(ctx, px, py) {
    sombra(ctx, px + 8, py + 15, 5);
    ret(ctx, px + 6, py - 9, 4, 25, K); ret(ctx, px + 7, py - 9, 2, 24, MADEIRA); ret(ctx, px + 7, py - 9, 1, 24, MADEIRA3);
    ret(ctx, px + 8, py + 4, 1, 2, MADEIRA2); ret(ctx, px + 7, py + 10, 1, 2, MADEIRA2);
    ret(ctx, px + 5, py - 11, 6, 3, K); ret(ctx, px + 6, py - 10, 4, 1, '#ff9cc6');
    function tabua(y, dir) {
      var x0 = dir > 0 ? px + 1 : px + 3;
      ret(ctx, x0, y, 12, 7, K);
      ret(ctx, dir > 0 ? x0 + 12 : x0 - 1, y + 1, 1, 5, K); ret(ctx, dir > 0 ? x0 + 13 : x0 - 2, y + 2, 1, 3, K);
      ret(ctx, x0 + 1, y + 1, 11, 5, MADEIRA3); ret(ctx, dir > 0 ? x0 + 12 : x0 - 1, y + 2, 1, 3, MADEIRA3);
      ret(ctx, x0 + 1, y + 5, 11, 1, MADEIRA); ret(ctx, x0 + 1, y + 1, 11, 1, '#f6d2a2');
      ret(ctx, x0 + (dir > 0 ? 1 : 10), y + 3, 1, 1, MADEIRA2);
    }
    tabua(py - 7, 1); tabua(py + 1, -1);
    // coração na de cima, estrela na de baixo
    ret(ctx, px + 4, py - 5, 1, 1, '#ff5c6a'); ret(ctx, px + 6, py - 5, 1, 1, '#ff5c6a'); ret(ctx, px + 4, py - 4, 3, 1, '#ff5c6a'); ret(ctx, px + 5, py - 3, 1, 1, '#ff5c6a');
    ret(ctx, px + 10, py + 3, 3, 1, '#ffd34d'); ret(ctx, px + 11, py + 2, 1, 3, '#ffd34d');
  }
  // pedras chatas de pisar, na metade de cima do tile (a margem do lago cobre a de baixo)
  function pedrinhas(ctx, px, py, x) {
    [[2, 2 + (x % 2) * 2], [9, 5 - (x % 2) * 2]].forEach(function (p) {
      var sx = px + p[0], sy = py + p[1];
      ret(ctx, sx, sy + 4, 6, 1, 'rgba(58,36,70,0.18)');
      ret(ctx, sx, sy, 6, 4, K); ret(ctx, sx - 1, sy + 1, 8, 2, K);
      ret(ctx, sx, sy + 1, 6, 2, PEDRA2); ret(ctx, sx + 1, sy + 1, 3, 1, PEDRA); ret(ctx, sx + 4, sy + 2, 2, 1, PEDRA3);
      ret(ctx, sx + 5, sy + 1, 1, 1, '#8fb83a');
    });
  }
  var PECAS = { poste: poste, banco: banco, canteiro: canteiro, cerca: cerca, pedra: pedra,
    poco: poco, correio: correio, placa: placa, pedrinhas: pedrinhas };
  // as que entram na ordem de cima para baixo (e voltam por cima da Mariana quando ela passa atrás)
  I.PECAS_ALTAS = { poste: true, banco: true, canteiro: true, cerca: true, poco: true, correio: true, placa: true };
  I.desenharPeca = function (ctx, tipo, x, y) { if (PECAS[tipo]) PECAS[tipo](ctx, x * T, y * T, x, y); };
  // peças iguais dividem o mesmo sprite (a cerca muda com os vizinhos)
  I.chavePeca = function (tipo, x, y) {
    if (tipo !== 'cerca') return tipo;
    return 'cerca:' + (x > 0 && I.decor[y][x - 1] === 'cerca') + (x < Mapa.W - 1 && I.decor[y][x + 1] === 'cerca');
  };

  /* ----- halo dos lampiões ----- */
  // anel de 2 px em volta da lanterna e mais 2 px pontilhados (2×2), só FORA do poste
  // (não lava o contorno nem se sobrepõe: um nível de alfa só; arte.md §13). Feito uma vez, na caixa do sprite do poste
  var halo = null;
  function haloPoste() {
    if (halo) return halo;
    var w = T + 8, h = T + 26, ox = 4, oy = 24;
    var base = PA.novoCanvas(w, h), bctx = base.getContext('2d');
    poste(bctx, ox, oy);
    var d = bctx.getImageData(0, 0, w, h).data, dist = new Uint8Array(w * h), fila = [], x, y, i;
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      i = y * w + x;
      if (d[i * 4 + 3] === 255 && y <= oy - 6) { dist[i] = 9; fila.push(i); }
    }
    for (var anel = 1; anel <= 4; anel++) {
      var prox = [];
      fila.forEach(function (k) {
        var kx = k % w, ky = (k - kx) / w;
        for (var j = -1; j <= 1; j++) for (var q = -1; q <= 1; q++) {
          var nx = kx + q, ny = ky + j, nk = ny * w + nx;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h || dist[nk] || d[nk * 4 + 3]) continue;
          dist[nk] = anel; prox.push(nk);
        }
      });
      fila = prox;
    }
    halo = PA.novoCanvas(w, h);
    var hctx = halo.getContext('2d');
    hctx.fillStyle = '#ffe98a';
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      var dd = dist[y * w + x];
      if (dd && dd <= 2 || (dd === 3 || dd === 4) && (x + y) % 2 === 0) hctx.fillRect(x, y, 1, 1);
    }
    return halo;
  }
  var postes = [], postesDe = null;   // os lampiões do mapa de agora (refeitos quando o Mapa.criar troca a grade)
  I.animarPostes = function (ctx, t) {
    var img = haloPoste();
    // respira em 3 degraus de alfa (0,14 · 0,18 · 0,22), não em rampa contínua (arte.md §13 e §15)
    ctx.globalAlpha = 0.18 + 0.04 * Math.round(Math.sin(t / 900));
    if (postesDe !== I.decor) {
      postesDe = I.decor; postes = [];
      for (var y = 0; y < Mapa.H; y++) for (var x = 0; x < Mapa.W; x++) if (I.decor[y][x] === 'poste') postes.push([x * T - 4, y * T - 24]);
    }
    for (var i = 0; i < postes.length; i++) ctx.drawImage(img, postes[i][0], postes[i][1]);
    ctx.globalAlpha = 1;
  };
})();
