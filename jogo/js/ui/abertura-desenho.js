/* Abertura (tela de início): as camadas PARADAS da cena, desenhadas uma vez por tamanho de tela.
   Céu do entardecer com o sol, montanhas, nuvens, arco-íris, colinas, a estrada e o castelo.
   Pixel de verdade: 1 px lógico = 1 px do canvas (o CSS amplia sem borrar). Degradês com pontilhado
   (matriz de Bayer), como nos jogos de 16 bits. A animação e a tela ficam em abertura.js.
   Também o palco: onde a Mariana pisa e as pistas de voo, longe das caixas do DOM (título, novidade, botão).
   Publica Reino._abertura (interno das duas). Nada de Math.random: a cena sai sempre igual. */
(function () {
  var D = Reino.Desenho, K = D.K, ret = D.ret, circulo = D.circulo, rgb = D.hexRgb;
  var BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  function limiar(x, y) { return (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16; }
  function novo(w, h) { return PA.novoCanvas(Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); }
  function lim(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function mix(a, b, k) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]; }

  /* ---------- medidas: onde fica cada coisa, a partir do tamanho lógico W x H ---------- */
  // tetoCastelo: o pé do bloco do título quando ele fica em cima do castelo; o horizonte desce até 0,78 de H
  // para as bandeiras não sumirem atrás do bloco
  function medidas(W, H, tetoCastelo) {
    var emPe = H > W * 1.15;
    var colina = Math.max(8, Math.round(H * 0.035));             // altura da colina do castelo
    var yH = Math.round(H * (emPe ? 0.63 : 0.7));               // horizonte (pé das montanhas)
    if (tetoCastelo) yH = Math.max(yH, Math.min(Math.round(H * 0.78), Math.round(tetoCastelo) + 14 + 77 + colina));
    var cx = Math.round(W * (emPe ? 0.5 : 0.7));
    var topoColina = yH - colina;
    var castelo = { w: 112, h: 80, x: cx - 56, y: topoColina - 77 };
    var raio = Math.round(Math.max(104, Math.min(Math.max(W * 0.47, 124), yH * 0.8)));
    return {
      W: W, H: H, emPe: emPe, yH: yH, cx: cx, colina: colina, topoColina: topoColina, castelo: castelo,
      sol: { x: cx, y: yH - Math.round(colina * 0.4), r: Math.max(12, Math.round(Math.min(W, H) * 0.11)) },
      arco: { x: cx, y: yH + 6, r: raio, faixa: Math.max(3, Math.round(raio / 24)) },
      frente: yH + Math.round((H - yH) * (emPe ? 0.3 : 0.42)),  // linha dos pés da Mariana (em pé: acima do botão)
    };
  }

  /* ---------- céu: faixas pontilhadas + o sol se pondo com o halo ---------- */
  var CEU = [[0, '#140c3a'], [0.3, '#2c1c66'], [0.56, '#693590'], [0.75, '#c2548f'], [0.9, '#f47f7a'], [1, '#ffc98a']];
  var FAIXAS = 20;
  var PAL_CEU = [];
  (function () {
    for (var n = 0; n <= FAIXAS; n++) {
      var t = n / FAIXAS, i = 1;
      while (i < CEU.length - 1 && t > CEU[i][0]) i++;
      var a = CEU[i - 1], b = CEU[i];
      PAL_CEU.push(mix(rgb(a[1]), rgb(b[1]), lim((t - a[0]) / (b[0] - a[0]))));
    }
  })();
  var HALO = rgb('#ffb070'), SOL_ALTO = rgb('#fff6c8'), SOL_BAIXO = rgb('#ffb45e');

  function ceu(m) {
    var c = novo(m.W, m.H), ctx = c.getContext('2d');
    var img = ctx.createImageData(m.W, m.H), px = img.data;
    var s = m.sol, alcance = s.r * 3.4;
    for (var y = 0; y < m.H; y++) {
      var f = lim(y / m.yH) * FAIXAS, i = Math.floor(f), fr = f - i;
      for (var x = 0; x < m.W; x++) {
        var cor = PAL_CEU[fr > limiar(x, y) && i < FAIXAS ? i + 1 : i];
        var dx = x - s.x, dy = y - s.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d <= s.r) {
          var k = lim((y - (s.y - s.r)) / (s.r * 1.4));
          cor = mix(SOL_ALTO, SOL_BAIXO, Math.floor(k * 4 + limiar(x, y)) / 4);
        } else if (d < alcance) {
          var g = 1 - d / alcance; g = g * g * 0.7;
          cor = mix(cor, HALO, Math.floor(g * 6 + limiar(x, y)) / 6);
        }
        var p = (y * m.W + x) * 4;
        px[p] = cor[0]; px[p + 1] = cor[1]; px[p + 2] = cor[2]; px[p + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    // borda clarinha do sol
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    for (var a = 0; a < 64; a++) {
      var ang = Math.PI + (a / 63) * Math.PI;
      ctx.fillRect(Math.round(s.x + Math.cos(ang) * (s.r - 1)), Math.round(s.y + Math.sin(ang) * (s.r - 1)), 1, 1);
    }
    return c;
  }

  /* ---------- montanhas: duas serras em roxo, a da frente com a borda iluminada pelo pôr do sol ---------- */
  function serra(ctx, m, base, alt, corpo, borda, sem) {
    var r = D.rng(sem), f1 = 0.02 + r() * 0.02, f2 = 0.07 + r() * 0.05, p1 = r() * 6, p2 = r() * 6;
    for (var x = 0; x < m.W; x++) {
      var h = alt * (0.55 + 0.3 * Math.sin(x * f1 + p1) + 0.15 * Math.sin(x * f2 + p2)) + (D.sorte(x >> 1, sem, 3) < 0.3 ? 1 : 0);
      var topo = Math.round(base - h);
      ret(ctx, x, topo, 1, m.H - topo, corpo);
      ret(ctx, x, topo, 1, 1, borda);
      if (D.sorte(x, topo, sem) < 0.5) ret(ctx, x, topo + 1, 1, 1, borda);
    }
  }
  function montanhas(m) {
    var c = novo(m.W, m.H), ctx = c.getContext('2d');
    serra(ctx, m, m.yH + 2, m.H * 0.16, '#452c73', '#7d57a8', 11);
    serra(ctx, m, m.yH + 2, m.H * 0.09, '#583777', '#c46a93', 29);
    // brilho do sol no pé das serras
    for (var x = 0; x < m.W; x++) {
      var d = Math.abs(x - m.sol.x) / (m.sol.r * 4);
      if (d < 1 && D.sorte(x, 7, 5) > d) ret(ctx, x, m.yH - 2, 1, 1, 'rgba(255,190,140,0.45)');
    }
    return c;
  }

  /* ---------- nuvens: faixa que se repete (parallax), bolinhas unidas com luz em cima e sombra embaixo ---------- */
  function nuvens(larg, alt, qtd, tam, cores, sem) {
    var c = novo(larg, alt), ctx = c.getContext('2d'), r = D.rng(sem);
    for (var n = 0; n < qtd; n++) {
      var w = Math.round(tam * (0.7 + r() * 0.7)), x0 = Math.round((n + r() * 0.6) * larg / qtd), yb = Math.round(alt * (0.45 + r() * 0.5));
      var bolas = 3 + Math.floor(r() * 3), bolasXY = [];
      for (var b = 0; b < bolas; b++) {
        var rr = Math.round(w * (0.16 + r() * 0.14)), bx = Math.round(x0 + (b + 0.5) * w / bolas);
        bolasXY.push([bx, yb - Math.round(rr * 0.6), rr]);
      }
      [0, -larg].forEach(function (desl) {   // de novo uma volta antes: a faixa emenda sem costura
        bolasXY.forEach(function (q) { circulo(ctx, q[0] + desl, q[1], q[2], '#fff'); });
        ret(ctx, x0 + desl, yb - 3, w, 4, '#fff');
      });
    }
    // sombreado pela máscara: luz onde o de cima é céu, sombra onde o de baixo é céu
    var img = ctx.getImageData(0, 0, larg, alt), px = img.data;
    var luz = rgb(cores[0]), corpo = rgb(cores[1]), sombra = rgb(cores[2]);
    function vazio(x, y) { return y < 0 || y >= alt || px[(y * larg + x) * 4 + 3] === 0; }
    var saida = new Uint8ClampedArray(px.length);
    for (var y = 0; y < alt; y++) for (var x = 0; x < larg; x++) {
      var p = (y * larg + x) * 4;
      if (!px[p + 3]) continue;
      var cor = vazio(x, y - 1) || vazio(x, y - 2) ? luz : vazio(x, y + 2) || (vazio(x, y + 4) && limiar(x, y) < 0.5) ? sombra : corpo;
      saida[p] = cor[0]; saida[p + 1] = cor[1]; saida[p + 2] = cor[2]; saida[p + 3] = cores[3];
    }
    img.data.set(saida);
    ctx.putImageData(img, 0, 0);
    return c;
  }

  /* ---------- arco-íris: meio anel em 6 faixas, some pontilhado perto do chão ---------- */
  var ARCO = ['#ff5c6a', '#ff9f45', '#ffe066', '#6fdc8c', '#5fb4ff', '#a66bff'].map(rgb);
  function arcoIris(a) {
    var R = a.r, c = novo(R * 2 + 1, R + 1), ctx = c.getContext('2d');
    var img = ctx.createImageData(R * 2 + 1, R + 1), px = img.data;
    for (var y = 0; y <= R; y++) for (var x = 0; x <= R * 2; x++) {
      var d = Math.sqrt((x - R) * (x - R) + (y - R) * (y - R)), k = (R - d) / a.faixa;
      if (k < 0 || k >= 6) continue;
      var baixo = y / R;
      if (baixo > 0.72 && (baixo - 0.72) / 0.28 > limiar(x, y)) continue;
      var cor = ARCO[Math.floor(k)], p = (y * (R * 2 + 1) + x) * 4;
      px[p] = cor[0]; px[p + 1] = cor[1]; px[p + 2] = cor[2]; px[p + 3] = (k % 1) < 0.34 && k > 1 ? 225 : 200;
    }
    ctx.putImageData(img, 0, 0);
    return c;
  }

  /* ---------- chão: colina do castelo, estrada, árvores, o castelo e as colinas da frente ---------- */
  function arvore(ctx, x, yb, r, sem) {
    ret(ctx, x - 1, yb - r - 2, 3, r + 2, K); ret(ctx, x, yb - r - 1, 1, r + 1, '#6b4428');
    circulo(ctx, x, yb - r * 2, r + 1, K);
    circulo(ctx, x, yb - r * 2, r, '#2f6a45');
    circulo(ctx, x - 1, yb - r * 2 - 1, Math.max(1, r - 2), '#3f8a52');
    ret(ctx, x - Math.round(r / 2), yb - r * 3 + 1, 2, 1, '#ffb3a8');   // luz do pôr do sol
    if (D.sorte(x, yb, sem) < 0.5) ret(ctx, x + 1, yb - r * 2 + 1, 1, 1, '#ff9cc6');
  }
  function monte(ctx, m, cx, topo, larg, corpo, borda, sombra, sem) {
    for (var x = Math.max(0, Math.round(cx - larg)); x < Math.min(m.W, Math.round(cx + larg)); x++) {
      var k = (x - cx) / larg, y = Math.round(topo + k * k * (m.H - topo) * 0.9);
      ret(ctx, x, y, 1, m.H - y, corpo);
      ret(ctx, x, y, 1, 1, borda);
      if (limiar(x, y) < 0.5) ret(ctx, x, y + 1, 1, 1, borda);
      for (var j = y + 6; j < m.H; j += 3) if (D.sorte(x, j, sem) < 0.05) ret(ctx, x, j, 1, 1, sombra);
      if (D.sorte(x, y, sem + 1) < 0.08) ret(ctx, x, y - 1, 1, 1, borda);   // tufinhos de grama
    }
  }
  function flores(ctx, m, x0, x1, y0, qtd, sem) {
    var r = D.rng(sem), cores = ['#ff9cc6', '#ffe066', '#ffffff', '#b58cff'];
    for (var n = 0; n < qtd; n++) {
      var x = Math.round(x0 + r() * (x1 - x0)), y = Math.round(y0 + r() * (m.H - y0));
      ret(ctx, x, y, 1, 1, cores[n % 4]);
      if (n % 3 === 0) ret(ctx, x, y + 1, 1, 1, '#2f6a45');
    }
  }
  function chao(m) {
    var c = novo(m.W, m.H), ctx = c.getContext('2d'), W = m.W, H = m.H;
    // campo e a colina do castelo
    ret(ctx, 0, m.yH, W, H - m.yH, '#3b6a48');
    for (var x = 0; x < W; x++) if (limiar(x, m.yH) < 0.5) ret(ctx, x, m.yH, 1, 1, '#6f9e5c');
    var largC = Math.max(W * 0.42, 96);
    for (x = Math.max(0, Math.round(m.cx - largC)); x < Math.min(W, m.cx + largC); x++) {
      var k = (x - m.cx) / largC, y = Math.round(m.topoColina + k * k * m.colina);
      ret(ctx, x, y, 1, m.yH - y + 1, '#467a4c');
      ret(ctx, x, y, 1, 1, '#94c46e');
    }
    // árvores na colina, dos dois lados do castelo
    var cs = m.castelo;
    [[-10, 4], [-22, 5], [-34, 3], [12, 4], [25, 5], [38, 3]].forEach(function (a, i) {
      var ax = a[0] < 0 ? cs.x + a[0] + 4 : cs.x + cs.w + a[0] - 4;
      if (ax > 2 && ax < W - 2) arvore(ctx, ax, m.topoColina + 3 + (i % 3), a[1], i + 3);
    });
    // estrada: do portão do castelo até embaixo, fazendo curva e alargando
    var yP = m.topoColina + 2;
    for (var yy = yP; yy < H; yy++) {
      var t = (yy - yP) / (H - yP), meio = m.cx + Math.sin(t * 3.2) * t * W * 0.12, larg = 5 + t * W * 0.16;
      ret(ctx, Math.round(meio - larg / 2) - 1, yy, Math.round(larg) + 2, 1, '#9a6f4a');
      ret(ctx, Math.round(meio - larg / 2), yy, Math.round(larg), 1, '#e9cf9e');
      if (limiar(Math.round(meio), yy) < 0.2) ret(ctx, Math.round(meio - larg / 4), yy, 1, 1, '#d4b27d');
    }
    // castelo: o mesmo do mapa, com um véu de fim de tarde (lado da sombra mais roxo)
    var cv = novo(cs.w + 8, cs.h + 12), cc = cv.getContext('2d');
    Mapa.PREDIOS.castelo(cc, 4, 12, cs.w, cs.h);
    cc.globalCompositeOperation = 'source-atop';
    ret(cc, 0, 0, cv.width, cv.height, 'rgba(110,50,140,0.16)');
    ret(cc, Math.round(cv.width * 0.62), 0, cv.width, cv.height, 'rgba(60,20,90,0.14)');
    ret(cc, 0, 0, Math.round(cv.width * 0.2), cv.height, 'rgba(255,170,120,0.12)');
    ctx.drawImage(cv, cs.x - 4, cs.y - 12);
    cv.width = cv.height = 0;
    // colinas da frente, com flores e árvores maiores
    var fy = m.frente;
    monte(ctx, m, W * 0.12, fy - Math.round((H - m.yH) * 0.18), Math.max(W * 0.5, 80), '#4f8f4a', '#a8d86e', '#3f7a3e', 41);
    monte(ctx, m, W * 0.92, fy - Math.round((H - m.yH) * 0.05), Math.max(W * 0.45, 70), '#437f45', '#8fc868', '#356a3a', 57);
    flores(ctx, m, 0, W * 0.45, fy, Math.round(W * 0.25), 71);
    flores(ctx, m, W * 0.62, W, fy + 6, Math.round(W * 0.2), 83);
    arvore(ctx, Math.round(W * 0.93), fy + 2, 7, 5);
    if (W > 260) arvore(ctx, Math.round(W * 0.05), fy - 4, 6, 6);
    return c;
  }

  /* ---------- palco: a Mariana e as pistas de voo (px lógicos; caixas { x, y, w, h }) ---------- */
  function cruza(a, b, folga) {
    folga = folga || 0;
    return a.x < b.x + b.w + folga && b.x < a.x + a.w + folga && a.y < b.y + b.h + folga && b.y < a.y + a.h + folga;
  }
  // tam(e) → { w, h } do sprite montado na escala e. Procura, da maior escala para a menor, um lugar no chão (pés na
  // linha da frente ou mais embaixo) que não cruze nenhuma caixa do DOM. A caixa conta o pulinho do trote e a sombra.
  function lugarDaMenina(m, dom, tam) {
    var pref = m.emPe ? [0.2, 0.8, 0.5] : m.W > m.H * 2 ? [0.43, 0.2, 0.1, 0.62, 0.85] : [0.6, 0.45, 0.88, 0.2];
    function lugar(e, f, pe) {
      var t = tam(e), x = Math.max(1, Math.min(m.W - t.w - 1, Math.round(m.W * f - t.w / 2)));
      return { x: x, pe: pe, e: e, w: t.w, h: t.h, caixa: { x: x, y: pe - t.h - e, w: t.w, h: t.h + e + 2 } };
    }
    for (var e = Math.min(m.W, m.H) >= 190 ? 2 : 1; e >= 1; e--) {
      for (var i = 0; i < pref.length; i++) {
        for (var pe = m.frente; pe <= m.H - 3; pe += 2) {
          var l = lugar(e, pref[i], pe);
          if (!dom.some(function (d) { return cruza(l.caixa, d, 4); })) return l;
        }
      }
    }
    return lugar(1, pref[0], m.frente);
  }
  // tiras de y livres em [y0, y1): os voadores cruzam a tela toda, então cada caixa tira a faixa de y inteira dela
  function livres(y0, y1, caixas, folga) {
    var tiras = y1 > y0 ? [[y0, y1]] : [];
    caixas.forEach(function (b) {
      var a = b.y - folga, z = b.y + b.h + folga, novas = [];
      tiras.forEach(function (t) {
        if (z <= t[0] || a >= t[1]) { novas.push(t); return; }
        if (a > t[0]) novas.push([t[0], a]);
        if (z < t[1]) novas.push([z, t[1]]);
      });
      tiras = novas;
    });
    return tiras;
  }
  // cada tira recebe as pistas que couberem (tipos em ordem de preferência), espaçadas por igual
  function encher(tiras, tipos, n, pistas) {
    tiras.forEach(function (t) {
      var y = t[0], aqui = [];
      while (pistas.length + aqui.length < n) {
        var tipo = tipos.filter(function (k) { return !(k.um && pistas.concat(aqui).some(function (p) { return p.tipo === k; })) && t[1] - y >= k.alto; })[0];
        if (!tipo) break;
        aqui.push({ y: y, tipo: tipo });
        y += tipo.alto;
      }
      var sobra = (t[1] - y) / (aqui.length + 1);
      aqui.forEach(function (p, i) { p.y = Math.round(p.y + sobra * (i + 1)); pistas.push(p); });
    });
  }
  // pistas de voo, uma altura para cada voador (nunca dois na mesma): perto, no céu entre o que há em cima e o topo
  // das torres (desenhados na frente); se faltar lugar, longe (menores, atrás do castelo e das montanhas).
  // tipos: { perto: [grande, normal], longe: [pequeno] }, cada um com alto (sprite + balanço + rastro)
  var BEIRAL = 21;   // do topo do castelo (py) ao beiral das torres, no desenho do mapa (mundo/predios.js)
  // o retângulo do castelo do beiral para baixo (as torres de ponta a ponta): o que voa longe some atrás dele
  function atrasDoCastelo(m) { return { x: m.castelo.x - 1, y: m.castelo.y + BEIRAL, w: m.castelo.w + 2, h: m.H }; }
  function pistasDeVoo(m, bloqueios, menina, n, tipos) {
    var pistas = [];
    encher(livres(2, m.castelo.y - 12, bloqueios.concat([menina]), 2), tipos.perto, n, pistas);
    // os de longe nunca na altura dos telhados (apareceriam no vão entre as torres, como se pousassem no castelo):
    // só abaixo do beiral das torres, onde o castelo os esconde inteiros (abertura.js recorta o retângulo atrás dele,
    // atrasDoCastelo). Podem passar atrás da Mariana: ela é desenhada na frente
    var ocupadas = pistas.map(function (p) { return { y: p.y, h: p.tipo.alto }; });
    ocupadas.push({ y: 0, h: m.castelo.y + BEIRAL });
    encher(livres(2, m.yH - Math.round(m.H * 0.03), bloqueios.concat(ocupadas), 1), tipos.longe, n, pistas);
    return pistas;
  }

  function soltar(c) { if (c) { c.width = 0; c.height = 0; } }

  Reino._abertura = { medidas: medidas, ceu: ceu, montanhas: montanhas, nuvens: nuvens, arcoIris: arcoIris, chao: chao, soltar: soltar,
    cruza: cruza, lugarDaMenina: lugarDaMenina, pistasDeVoo: pistasDeVoo, atrasDoCastelo: atrasDoCastelo };
})();
