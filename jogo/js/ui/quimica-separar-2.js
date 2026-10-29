/* Laboratório de Química, 2º andar: a Mesa de Separar Misturas (Cozinha Química), parte 2 de 2 (o desenho em pixel art).
   Contrato: docs/contratos/quimica.md §2 e §9. Acrescenta ao interno Reino._quimicaSeparar (criado na parte 1):
   W, H (o palco, em pixels de arte), desenhar(ctx, mistura, ferramenta, t) e iconeFerramenta(id).
   ferramenta = a certa que está separando (t de 0 a 1; 1 = o quadro final); sem ela, só a mistura parada.
   Pixel art (arte.md): retângulos e os círculos de pixel do Reino.Desenho; sem arc, degradê nem blur. */
(function () {
  var R = window.Reino, D = R.Desenho, K = D.K, C = D.C;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, clarear = D.clarear, escurecer = D.escurecer, sorte = D.sorte;
  var mist = D.misturar;
  var S = R._quimicaSeparar;
  var W = S.W = 160, H = S.H = 96;
  var MESA = 74, PAREDE = '#fff1dc', REJUNTE = '#f3dcbc', VIDRO = '#eef9ff', PELE = '#f1c7a5', MANGA = C.rosa2;
  var SOMBRA = 'rgba(58,36,70,0.2)';
  var AREIA = '#e8c77a', PEDRA = '#9a96a6', FERRO = '#3e3a48', FEIJAO = '#8a4a2a', AGUA = '#bfe6ff';
  // o jeito de cada mistura aparecer: líquido, o fino (pó, areia, terra), os graúdos por cima e os grãos de base
  var VIS = {
    cafe: { liquido: '#7a4424', fino: '#3b2414', limpo: '#7a4424', quente: true },
    feijao: { graos: FEIJAO, graudo: 'pedra' },
    'areia-pedras': { fino: AREIA, graudo: 'pedra' },
    'agua-sal': { liquido: AGUA, sal: true, limpo: AGUA },
    'areia-ferro': { fino: AREIA, ferro: true },
    'agua-barrenta': { liquido: '#a8825a', fino: '#7a5230', limpo: '#cfe8ee' },
  };
  function entre(a, b, t) { return Math.round(a + (b - a) * Math.max(0, Math.min(1, t))); }
  function fase(t, a, b) { return Math.max(0, Math.min(1, (t - a) / (b - a))); }

  /* ================= O CENÁRIO: a parede de azulejo e a mesa da cozinha ================= */
  function fundo(ctx) {
    ret(ctx, 0, 0, W, MESA, PAREDE);
    for (var y = 0; y < MESA; y += 10) {
      ret(ctx, 0, y + 9, W, 1, REJUNTE);
      for (var x = (y / 10) % 2 ? 5 : 0; x < W; x += 10) ret(ctx, x, y, 1, 9, REJUNTE);
    }
    // a janelinha com a cortina xadrez (à esquerda) e o paninho de prato pendurado (à direita)
    ret(ctx, 8, 8, 30, 24, K); ret(ctx, 9, 9, 28, 22, C.ceu); ret(ctx, 22, 9, 2, 22, K); ret(ctx, 9, 19, 28, 2, K);
    ret(ctx, 10, 10, 3, 1, C.branco); ret(ctx, 26, 11, 4, 1, C.branco);
    for (var i = 0; i < 6; i++) { ret(ctx, 6 + i * 2, 6, 2, 8, i % 2 ? C.vermelho : C.creme); ret(ctx, 28 + i * 2, 6, 2, 8, i % 2 ? C.creme : C.vermelho); }
    ret(ctx, 5, 5, 36, 1, K);
    ret(ctx, 140, 20, 12, 1, K); ret(ctx, 142, 21, 8, 12, K); ret(ctx, 143, 21, 6, 11, C.creme);
    ret(ctx, 143, 24, 6, 1, C.azul); ret(ctx, 143, 28, 6, 1, C.azul);
    // a mesa: tampo claro e a frente de madeira
    ret(ctx, 0, MESA - 1, W, 1, escurecer(C.madeiraClara, 0.3));
    ret(ctx, 0, MESA, W, 7, C.madeiraClara); ret(ctx, 0, MESA, W, 1, '#f3c996');
    ret(ctx, 0, MESA + 7, W, 1, K); ret(ctx, 0, MESA + 8, W, H - MESA - 8, C.madeira);
    [[8, 86, 20], [44, 90, 18], [96, 87, 24], [134, 91, 16]].forEach(function (v) { ret(ctx, v[0], v[1], v[2], 1, C.madeira2); });
  }

  /* ================= AS COISINHAS: pedra, feijão, grão de ferro, cristal de sal ================= */
  function pedra(ctx, x, y, n) {
    var cor = n % 2 ? PEDRA : '#83808f';
    ret(ctx, x + 1, y, 3, 4, K); ret(ctx, x, y + 1, 5, 2, K);
    ret(ctx, x + 1, y + 1, 3, 2, cor); ret(ctx, x + 1, y + 1, 1, 1, clarear(cor, 0.5));
  }
  function feijao(ctx, x, y) {
    ret(ctx, x + 1, y, 3, 3, K); ret(ctx, x, y + 1, 5, 1, K);
    ret(ctx, x + 1, y + 1, 3, 1, FEIJAO); ret(ctx, x + 2, y + 1, 1, 1, C.creme2);
  }
  function graudo(ctx, forma, x, y, n) { pedra(ctx, x, y, n); }
  function grao(ctx, x, y, n) { ret(ctx, x, y, n % 3 ? 1 : 2, 1, n % 4 ? FERRO : '#6a6478'); }   // um grão do pó de ferro
  function cristal(ctx, x, y) { ret(ctx, x, y, 2, 2, C.branco); ret(ctx, x + 1, y + 1, 1, 1, '#d5dbe8'); }

  /* ================= OS RECIPIENTES ================= */
  // tigela de barro: meia elipse (boca em `topo`); encher(ctx, j, x0, largura) pinta a linha j (0 = o fundo) por dentro
  function meiaLargura(rx, h, j) { return Math.floor(rx * Math.sqrt(Math.max(0, 1 - (j * j) / (h * h))) + 0.3); }
  function tigela(ctx, cx, topo, rx, h, encher) {
    elipse(ctx, cx, topo + h + 1, rx - 2, 1, SOMBRA);
    // três meias elipses, uma dentro da outra: o contorno, o barro e o esmalte (o contorno fecha os degraus)
    [[rx + 1, h + 1, K], [rx, h, C.terracota], [rx - 1, h - 1, '#f7e3cf']].forEach(function (c) {
      for (var j = 0; j <= c[1]; j++) { var m = meiaLargura(c[0], c[1], j); ret(ctx, cx - m, topo + j, 2 * m + 1, 1, c[2]); }
    });
    if (encher) for (var j = 0; j < h - 1; j++) {
      var m = meiaLargura(rx - 1, h - 1, j);
      if (m > 0) encher(ctx, h - 2 - j, cx - m, 2 * m + 1);
    }
    ret(ctx, cx - rx - 2, topo - 1, 2 * rx + 5, 2, K); ret(ctx, cx - rx - 1, topo - 1, 2 * rx + 3, 1, C.terracota2);
    ret(ctx, cx - rx + 3, topo + 3, 1, 4, C.branco);   // o brilho do esmalte
  }
  // pote de vidro alto: o conteúdo por linha (encher(ctx, j, x, largura, y), j = 0 no fundo)
  function pote(ctx, x, topo, w, base, encher) {
    elipse(ctx, x + w / 2, base + 1, w / 2 + 1, 1, SOMBRA);
    ret(ctx, x, topo, w, base - topo + 1, K); ret(ctx, x + 1, topo, w - 2, base - topo, VIDRO);
    for (var y = base - 1, j = 0; y > topo; y--, j++) if (encher) encher(ctx, j, x + 1, w - 2, y);
    ret(ctx, x - 1, topo - 1, w + 2, 2, K); ret(ctx, x, topo - 1, w, 1, C.branco);
    ret(ctx, x + 2, topo + 3, 1, base - topo - 8, C.branco);
  }
  function linhaDeLiquido(ctx, x, y, w, cor, topoDoLiquido) {
    ret(ctx, x, y, w, 1, topoDoLiquido ? clarear(cor, 0.35) : cor);
    if (!topoDoLiquido) ret(ctx, x + w - 1, y, 1, 1, escurecer(cor, 0.15));
  }

  /* ================= SEM FERRAMENTA: a mistura parada ================= */
  function tigelaCheia(ctx, v, cx, sai, fica) {   // a tigela com o fino/grãos e os graúdos por cima
    var topo = 50, h = 18, base = v.graos || v.fino;
    tigela(ctx, cx, topo, 30, h, function (c, j, x0, w) {
      if (j >= 11 || fica === false) return;
      for (var i = 0; i < w; i++) {
        var r = sorte(x0 + i, j, 7);
        c.fillStyle = r < 0.18 ? escurecer(base, 0.25) : r > 0.86 ? clarear(base, 0.35) : base;
        c.fillRect(x0 + i, topo + h - 2 - j, 1, 1);
      }
    });
    if (v.graos && fica !== false) for (var g = 0; g < 16; g++) feijao(ctx, cx - 24 + (g % 8) * 6 + (g > 7 ? 3 : 0), topo + 3 + (g > 7 ? 3 : 0) - (g % 3 === 0 ? 1 : 0));
    if (v.ferro) { (sai || []).forEach(function (p, n) { grao(ctx, p[0], p[1], n); }); return; }
    (sai || []).forEach(function (p, n) { graudo(ctx, v.graudo, p[0], p[1], n); });
  }
  // o pó de ferro espalhado na areia (cx = centro da tigela): sempre nos mesmos lugares
  var NFERRO = 28;
  function lugaresFerro(cx) {
    var l = [];
    for (var i = 0; i < NFERRO; i++) l.push([cx - 24 + Math.floor(sorte(i, 1, 31) * 48), 53 + Math.floor(sorte(i, 2, 31) * 7)]);
    return l;
  }
  // onde ficam os 5 graúdos na tigela (cx = 64): sempre os mesmos lugares
  function lugaresGraudos(cx) { return [[cx - 22, 49], [cx - 10, 51], [cx + 1, 48], [cx + 12, 51], [cx + 20, 49]]; }
  function poteTurvo(ctx, v, cx) {   // o líquido misturado, com pontinhos do fino boiando
    pote(ctx, cx - 18, 30, 36, 72, function (c, j, x, w, y) {
      if (j > 32) return;
      linhaDeLiquido(c, x, y, w, v.liquido, j === 32);
      if (v.fino) for (var i = 0; i < w; i++) if (sorte(x + i, y, 3) < 0.16) ret(c, x + i, y, 1, 1, v.fino);
      if (v.sal && sorte(x, y, 5) < 0.15) ret(c, x + 3 + Math.floor(sorte(y, x, 6) * (w - 6)), y, 1, 1, C.branco);
    });
  }
  function soMistura(ctx, id) {
    var v = VIS[id];
    if (!v) { tigela(ctx, 80, 52, 30, 18); return; }
    if (v.liquido) poteTurvo(ctx, v, 80);
    else tigelaCheia(ctx, v, 80, v.ferro ? lugaresFerro(80) : lugaresGraudos(80));
  }

  /* ================= AS FERRAMENTAS SEPARANDO (t de 0 a 1) ================= */
  var ANIM = {};
  // coador de pano: a mistura desce pelo pano, o sólido fica no cone e o líquido pinga no bule
  ANIM.coador = function (ctx, v, t) {
    var cx = 80, anel = 26, ponta = 46, liq = v.limpo;
    // o bule de vidro embaixo, enchendo
    var nivel = entre(0, 13, fase(t, 0.08, 0.95));
    pote(ctx, cx - 15, 52, 30, 72, function (c, j, x, w, y) { if (j < nivel) linhaDeLiquido(c, x, y, w, liq, j === nivel - 1); });
    ret(ctx, cx + 15, 56, 4, 2, K); ret(ctx, cx + 17, 56, 2, 11, K); ret(ctx, cx + 15, 65, 4, 2, K);   // a asa
    // o suporte de madeira e o anel de arame com o cabo
    ret(ctx, cx - 20, anel - 1, 40, 3, K); ret(ctx, cx - 19, anel, 38, 1, C.metal);
    ret(ctx, cx - 36, anel - 1, 17, 3, K); ret(ctx, cx - 35, anel, 15, 1, C.madeira);
    // o pano (cone) e o que está dentro: o sólido no bico, o líquido baixando
    var solido = 4, cheio = 13, dentro = entre(cheio, solido, fase(t, 0.05, 0.85));
    for (var j = 0; j <= ponta - anel - 2; j++) {
      var y = anel + 2 + j, m = Math.max(1, Math.round(17 * (1 - j / (ponta - anel))));
      ret(ctx, cx - m - 1, y, 2 * m + 3, 1, K);
      ret(ctx, cx - m, y, 2 * m + 1, 1, C.creme2);
      var desdeBico = ponta - anel - 2 - j;   // 0 = a linha do bico
      var cor = desdeBico < solido ? v.fino : desdeBico < dentro ? v.liquido : null;
      if (cor && m > 1) {
        ret(ctx, cx - m + 1, y, 2 * m - 1, 1, desdeBico === dentro - 1 ? clarear(cor, 0.3) : cor);
        if (cor === v.fino) for (var i = -m + 1; i < m; i++) if (sorte(cx + i, y, 9) < 0.25) ret(ctx, cx + i, y, 1, 1, escurecer(cor, 0.3));
      }
    }
    ret(ctx, cx - 1, ponta, 3, 1, K);
    // as gotas: pingam do bico até a superfície do bule enquanto ainda há líquido
    if (t < 0.9) {
      var sup = 71 - nivel;
      for (var g = 0; g < 3; g++) {
        var gy = ponta + 1 + Math.floor((t * 60 + g * 7) % Math.max(1, sup - ponta - 1));
        ret(ctx, cx, gy, 1, 2, liq);
      }
    }
    // café coado quente: a fumacinha (parada no quadro final)
    if (v.quente && t >= 1) [[cx - 6, 46], [cx + 5, 44]].forEach(function (p) {
      ret(ctx, p[0], p[1], 1, 3, C.branco); ret(ctx, p[0] + 1, p[1] - 3, 1, 3, C.branco); ret(ctx, p[0], p[1] - 5, 1, 2, C.branco);
    });
  };
  // a mão cata os graúdos um por um e põe no pratinho
  var MAO = [
    '...kkkkkk...', '...kmmmmk...', '...kmmmmk...', '..kkkkkkkk..', '.kssssssssk.', '.kssssssssk.',
    '.kssssssssk.', '..kssssssk..', '..ksk..ksk..', '..ksk..ksk..', '...k....k...',
  ];
  ANIM.mao = function (ctx, v, t) {
    var cx = 64, lugares = lugaresGraudos(cx), n = lugares.length, prato = [124, 66];
    var noPrato = lugares.map(function (p, i) { return [prato[0] - 9 + (i % 3) * 6, prato[1] - 5 - (i > 2 ? 3 : 0) + (i % 2)]; });
    // pratinho
    elipse(ctx, prato[0], prato[1] + 3, 16, 3, SOMBRA);
    elipse(ctx, prato[0], prato[1], 16, 3, K); elipse(ctx, prato[0], prato[1], 15, 2, C.branco); elipse(ctx, prato[0], prato[1], 10, 1, '#e5ecf7');
    var k = Math.min(n, Math.floor(t * n)), u = t * n - k;   // k já catados; u: o andamento do atual
    tigelaCheia(ctx, v, cx, lugares.slice(k + (u > 0.35 && k < n ? 1 : 0)));
    for (var i = 0; i < Math.min(k, n); i++) graudo(ctx, v.graudo, noPrato[i][0], noPrato[i][1], i);
    // a mão: desce até o graúdo, pega (u 0,3) e leva ao prato
    var alvo = k < n ? lugares[k] : noPrato[n - 1], hx, hy;
    if (k >= n) { hx = prato[0] + 6; hy = 30; }
    else if (u < 0.35) { var a = fase(u, 0, 0.3); hx = entre(k ? noPrato[k - 1][0] : prato[0] + 6, alvo[0], a); hy = entre(30, alvo[1] - 9, a); }
    else { var b = fase(u, 0.4, 0.95); hx = entre(alvo[0], noPrato[k][0], b); hy = entre(alvo[1] - 9, noPrato[k][1] - 9, b) - Math.round(14 * Math.sin(Math.PI * b)); }
    if (k < n && u >= 0.35) graudo(ctx, v.graudo, hx, hy + 9, k);
    D.matriz(ctx, hx - 3, hy - 3, MAO, { k: K, m: MANGA, s: PELE });
  };
  // a peneira balança: o miúdo cai nos furos para a tigela e o graúdo fica na tela de arame
  ANIM.peneira = function (ctx, v, t) {
    var cx = 80, anda = t < 0.88 ? [0, 2, 0, -2][Math.floor(t * 40) % 4] : 0, px = cx + anda, py = 30;
    var caiu = fase(t, 0.05, 0.85);
    tigela(ctx, cx, 56, 28, 14, function (c, j, x0, w) {
      if (j >= entre(0, 8, caiu)) return;
      for (var i = 0; i < w; i++) { var r = sorte(x0 + i, j, 11); c.fillStyle = r < 0.2 ? escurecer(v.fino, 0.25) : r > 0.86 ? clarear(v.fino, 0.35) : v.fino; c.fillRect(x0 + i, 68 - j, 1, 1); }
    });
    // os grãos caindo entre a peneira e a tigela
    if (t > 0.04 && t < 0.9) for (var g = 0; g < 14; g++) {
      var gx = px - 16 + Math.floor(sorte(g, 1, 13) * 32), gy = py + 10 + Math.floor((t * 90 + sorte(g, 2, 13) * 16) % 16);
      ret(ctx, gx, gy, 1, 1, g % 3 ? v.fino : escurecer(v.fino, 0.25));
    }
    // a peneira: aro de madeira, tela de arame (xadrez) com a areia baixando e o cabo
    ret(ctx, px + 20, py - 1, 16, 3, K); ret(ctx, px + 21, py, 14, 1, C.madeiraClara);
    for (var j = 0; j <= 9; j++) {
      var y = py + j, m = Math.floor(20 * Math.sqrt(Math.max(0, 1 - (j * j) / 81)) + 0.3);
      ret(ctx, px - m - 1, y, 2 * m + 3, 1, K);
      for (var i = -m; i <= m; i++) ret(ctx, px + i, y, 1, 1, (i + j) % 2 ? C.metal2 : '#fff7e6');
      var areia = entre(5, 0, caiu);   // linhas de areia, de baixo para cima
      if (j >= 9 - areia && j > 0) for (var q = -m + 1; q < m; q++) ret(ctx, px + q, y, 1, 1, sorte(px + q, y, 17) < 0.2 ? escurecer(v.fino, 0.25) : v.fino);
    }
    ret(ctx, px - 21, py - 1, 43, 2, K); ret(ctx, px - 20, py - 1, 41, 1, C.madeira);
    var sup = py + 8 - entre(5, 0, caiu);
    lugaresGraudos(px).forEach(function (p, n) { graudo(ctx, v.graudo, p[0] + (n % 2), sup - 3 + (n % 2), n); });
  };
  // o sol esquenta a travessa rasa (como nas salinas): a água sobe em vapor e o sal aparece em cristais
  ANIM.sol = function (ctx, v, t) {
    var sx = 112, sy = 16, raio = t < 1 ? [0, 1][Math.floor(t * 12) % 2] : 0;
    // os raios (piscam só na animação) e o sol
    [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(function (d) { ret(ctx, sx + d[0] * (12 + raio) - (d[0] ? 1 : 0), sy + d[1] * (12 + raio) - (d[1] ? 1 : 0), d[0] ? 3 : 2, d[1] ? 3 : 2, C.ouro); });
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (d) { ret(ctx, sx + d[0] * (9 + raio), sy + d[1] * (9 + raio), 2, 2, C.ouro); });
    circulo(ctx, sx, sy, 8, K); circulo(ctx, sx, sy, 7, C.ouro); circulo(ctx, sx - 1, sy - 1, 5, C.ouro3);
    // a travessa rasa
    var x = 36, y = 60, w = 88, h = 12, agua = entre(8, 0, fase(t, 0.05, 0.9));
    elipse(ctx, x + w / 2, y + h + 1, w / 2, 1, SOMBRA);
    ret(ctx, x, y, w, h, K); ret(ctx, x + 1, y, w - 2, h - 1, '#9fb3cc'); ret(ctx, x - 2, y - 1, w + 4, 2, K); ret(ctx, x - 1, y - 1, w + 2, 1, C.branco);
    for (var j = 0; j < agua; j++) linhaDeLiquido(ctx, x + 1, y + h - 2 - j, w - 2, v.limpo, j === agua - 1);
    // o sal: cristais que aparecem quando a água vai embora (sempre nos mesmos lugares)
    var sal = entre(0, 26, fase(t, 0.3, 1));
    for (var c = 0; c < sal; c++) cristal(ctx, x + 3 + Math.floor(sorte(c, 3, 21) * (w - 8)), y + h - 3 - (c % 3 === 0 ? 1 : 0));
    if (t >= 1) { elipse(ctx, x + w / 2, y + h - 3, 10, 2, C.branco); ret(ctx, x + w / 2 - 4, y + h - 5, 3, 1, '#d5dbe8'); D.brilho(ctx, x + w / 2 + 6, y + h - 7); }
    // o vapor subindo em zigue-zague (só enquanto há água)
    if (agua > 0 && t < 1) for (var n = 0; n < 5; n++) {
      var vx = x + 12 + n * 16, vy = y - 4 - Math.floor((t * 80 + n * 5) % 18);
      ret(ctx, vx + ((vy >> 2) % 2), vy, 1, 3, C.branco); ret(ctx, vx + 1 - ((vy >> 2) % 2), vy - 3, 1, 2, C.branco);
    }
  };
  // o ímã desce, o pó de ferro pula da areia até as pontas dele e ele sobe com a barbinha de ferro; a areia fica
  ANIM.ima = function (ctx, v, t) {
    var cx = 80, lugares = lugaresFerro(cx);
    var desce = fase(t, 0, 0.3), sobe = fase(t, 0.72, 1), my = entre(entre(-24, 24, desce), 10, sobe);
    var pega = fase(t, 0.32, 0.7);
    // cada grão sai numa hora (em ondas) e vai até um lugar da barbinha, embaixo de uma das pontas
    function andamento(i) { var a = (i / NFERRO) * 0.6; return fase(pega, a, a + 0.4); }
    function naPonta(i) { var lado = i % 2 ? 7 : -12; return [cx + lado + (i * 5) % 6, my + 18 + Math.floor(i / 2) % 4]; }
    tigelaCheia(ctx, v, cx, lugares.filter(function (p, i) { return andamento(i) <= 0; }));
    // o ímã em U de ponta para baixo: vermelho, com as pontas de metal
    ret(ctx, cx - 13, my, 27, 6, K); ret(ctx, cx - 12, my + 1, 25, 4, '#e0433f'); ret(ctx, cx - 12, my + 1, 25, 1, '#ff8a86');
    [cx - 13, cx + 6].forEach(function (lx) {
      ret(ctx, lx, my + 5, 8, 14, K); ret(ctx, lx + 1, my + 5, 6, 8, '#e0433f'); ret(ctx, lx + 1, my + 13, 6, 5, C.metal);
      ret(ctx, lx + 1, my + 13, 6, 1, C.branco);
    });
    // os grãos voando e os já grudados nas pontas
    lugares.forEach(function (p, i) {
      var u = andamento(i);
      if (u <= 0) return;
      var alvo = naPonta(i);
      grao(ctx, entre(p[0], alvo[0], u), entre(p[1], alvo[1], u), i);
    });
    // as faíscas da força do ímã, enquanto puxa
    if (pega > 0 && pega < 1) [[cx - 16, my + 20], [cx + 16, my + 20]].forEach(function (p, n) { if ((Math.floor(t * 20) + n) % 2) D.brilho(ctx, p[0], p[1], C.ouro); });
  };
  // esperar: a terra (mais pesada) desce devagar e a água clareia de cima para baixo; a ampulheta marca o tempo
  ANIM.esperar = function (ctx, v, t) {
    var cx = 72, topo = 30, base = 72, alto = base - topo - 2, fundo = entre(0, 6, fase(t, 0.1, 1));
    pote(ctx, cx - 18, topo, 36, base, function (c, j, x, w, y) {
      if (j > 32) return;
      if (j < fundo) {   // a terra assentada
        for (var i = 0; i < w; i++) ret(c, x + i, y, 1, 1, sorte(x + i, j, 23) < 0.2 ? escurecer(v.fino, 0.25) : v.fino);
        if (j === fundo - 1) ret(c, x, y, w, 1, clarear(v.fino, 0.2));
        return;
      }
      var limpo = fase(t * 1.25 - (1 - j / alto) * 0.6, 0, 0.5);   // de cima para baixo
      var cor = mist(v.liquido, v.limpo, Math.round(limpo * 4) / 4);   // em 5 tons (sem degradê)
      linhaDeLiquido(c, x, y, w, cor, j === 32);
      for (var q = 0; q < w; q++) if (sorte(x + q, y, 3) < 0.16 * (1 - limpo)) ret(c, x + q, y, 1, 1, v.fino);
    });
    // a ampulheta
    var ax = 122, ay = 40, cai = fase(t, 0, 1);
    ret(ctx, ax - 1, ay, 15, 2, K); ret(ctx, ax - 1, ay + 30, 15, 2, K); ret(ctx, ax, ay, 13, 1, C.madeira); ret(ctx, ax, ay + 31, 13, 1, C.madeira);
    for (var j = 0; j < 14; j++) {
      var m = Math.max(1, 6 - Math.floor(j / 2.4)), y1 = ay + 2 + j, y2 = ay + 29 - j;
      ret(ctx, ax + 6 - m - 1, y1, 2 * m + 3, 1, K); ret(ctx, ax + 6 - m, y1, 2 * m + 1, 1, VIDRO);
      ret(ctx, ax + 6 - m - 1, y2, 2 * m + 3, 1, K); ret(ctx, ax + 6 - m, y2, 2 * m + 1, 1, VIDRO);
      if (j >= entre(4, 14, cai) && j < 14) ret(ctx, ax + 6 - m, y1, 2 * m + 1, 1, C.ouro);   // em cima, esvaziando
      if (j < entre(0, 9, cai)) ret(ctx, ax + 6 - m, y2, 2 * m + 1, 1, C.ouro);              // embaixo, enchendo
    }
    if (t < 1) ret(ctx, ax + 6, ay + 16, 1, 12 - entre(0, 9, cai), C.ouro2);                  // o fiozinho caindo
  };

  /** O palco: a mistura parada ou a ferramenta certa separando (t 0..1). */
  S.desenhar = function (ctx, mistura, ferramenta, t) {
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, W, H);
    fundo(ctx);
    var v = VIS[mistura];
    if (v && ferramenta && ANIM[ferramenta]) ANIM[ferramenta](ctx, v, t);
    else soMistura(ctx, mistura);
  };

  /* ================= OS BOTÕES SEM EMOJI: coador de pano e peneira (16×16) ================= */
  var BOTOES = {
    coador: { p: { k: K, m: C.metal, p: C.creme2, w: C.branco, c: '#7a4424' }, d: [
      '................', '................', '...kkkkkkkkkk...', 'kkkmmmmmmmmmk...', '...kkkkkkkkkk...', '...kppppppppk...',
      '....kpppppwk....', '....kppppppk....', '.....kppppk.....', '.....kppwpk.....', '......kppk......', '......kppk......',
      '.......kk.......', '.......c........', '................', '................'] },
    peneira: { p: { k: K, m: C.madeira, g: C.metal2, d: '#fff7e6', h: C.madeiraClara }, d: [
      '................', '................', '................', '....kkkkkk......', '..kkmmmmmmkk....', '.kmgdgdgdgdmk...',
      '.kmdgdgdgdgmkkkk', 'kmgdgdgdgdgdmhhk', 'kmdgdgdgdgdgmkkk', '.kmgdgdgdgdmk...', '.kmdgdgdgdgmk...', '..kkmmmmmmkk....',
      '....kkkkkk......', '................', '................', '................'] },
  };
  /** O desenho 16×16 do botão de uma ferramenta sem emoji (canvas) ou null. */
  S.iconeFerramenta = function (id) { var b = BOTOES[id]; return b && window.PA ? PA.matriz(b.d, b.p) : null; };
})();
