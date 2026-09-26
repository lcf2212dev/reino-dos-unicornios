/* Desenho em pixel: a paleta C e os helpers genéricos (retângulo, círculo, elipse, triângulo,
   contorno, matriz de letras, miudezas, sorte fixa por posição, misturar/escurecer/clarear).
   Fonte única destes helpers (vieram de motor/interiores.js): Reino.Desenho.
   Reino.Interiores.desenho expõe as mesmas funções para os prédios (js/interiores/).
   No carregamento NADA de DOM ou canvas: as ferramentas em Node carregam este arquivo num vm. */
(function () {
  var R = window.Reino = window.Reino || {};
  var K = '#3a2446';          // contorno
  var FUNDO = '#24162e';      // vão entre os cômodos

  /* ================= CORES E DESENHO (os mesmos helpers do mundo/mapa-desenho.js) ================= */
  var C = {
    contorno: K, fundo: FUNDO,
    madeira: '#c98a4b', madeira2: '#a0745a', madeira3: '#8a604a', madeiraClara: '#e8b27a', madeiraEscura: '#6b4428',
    ouro: '#ffd34d', ouro2: '#d9a93a', ouro3: '#fff3a0',
    creme: '#fff8ee', creme2: '#f3e6c8', branco: '#ffffff',
    rosa: '#ff7eb6', rosa2: '#ff9cc6', lilas: '#b58cff', roxo: '#7c5cff', azul: '#5fb4ff', azul2: '#9fdcff',
    verde: '#6fdc8c', laranja: '#ff8a3d', vermelho: '#ff5c6a', agua: '#7ed9c8', agua2: '#d9fff4', agua3: '#3eaea3',
    ceu: '#bfe9ff', vidro: '#d9f3ff',
    folha: '#8fb83a', folha2: '#b6d24e', folha3: '#5e9a3a', folha4: '#d4ee78',
    terracota: '#e07a4a', terracota2: '#b95a36', pedra: '#e6dccb', pedra2: '#cbbd9f', metal: '#b9c4d6', metal2: '#8a94aa',
    labio: '#7a5a8e', labioLuz: '#a888bc',
  };

  function hexRgb(h) {
    h = String(h).replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function misturar(a, b, t) {
    var x = hexRgb(a), y = hexRgb(b);
    return '#' + [0, 1, 2].map(function (i) {
      var v = Math.max(0, Math.min(255, Math.round(x[i] + (y[i] - x[i]) * t)));
      return (v < 16 ? '0' : '') + v.toString(16);
    }).join('');
  }
  function escurecer(c, t) { return misturar(c, K, t); }
  function clarear(c, t) { return misturar(c, '#ffffff', t); }

  function ret(ctx, x, y, w, h, cor) { ctx.fillStyle = cor; ctx.fillRect(x, y, w, h); }
  function circulo(ctx, cx, cy, raio, cor) {
    ctx.fillStyle = cor;
    for (var j = -raio; j <= raio; j++) {
      var meia = Math.floor(Math.sqrt(raio * raio - j * j) + 0.35);
      ctx.fillRect(cx - meia, cy + j, meia * 2 + 1, 1);
    }
  }
  function elipse(ctx, cx, cy, rx, ry, cor) {
    ctx.fillStyle = cor;
    for (var j = -ry; j <= ry; j++) {
      var meia = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (j * j) / (ry * ry))) + 0.3);
      ctx.fillRect(cx - meia, cy + j, meia * 2 + 1, 1);
    }
  }
  function triangulo(ctx, x, y, w, h, cor) { // isósceles apontando para cima
    ctx.fillStyle = cor;
    for (var j = 0; j < h; j++) {
      var meia = Math.round((w / 2) * (j + 1) / h);
      ctx.fillRect(Math.round(x + w / 2 - meia), y + j, meia * 2, 1);
    }
  }
  function contornoRet(ctx, x, y, w, h, cor, fundo) { ret(ctx, x, y, w, h, K); ret(ctx, x + 1, y + 1, w - 2, h - 2, fundo || cor); }
  // matriz de letras com paleta (desenhos pequenos à mão)
  function matriz(ctx, x, y, linhas, pal) {
    for (var j = 0; j < linhas.length; j++) for (var i = 0; i < linhas[j].length; i++) {
      var c = pal[linhas[j][i]];
      if (c) { ctx.fillStyle = c; ctx.fillRect(x + i, y + j, 1, 1); }
    }
  }
  // número pseudoaleatório fixo por posição (o desenho sai sempre igual)
  function sorte(x, y, s) {
    var n = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul((s || 0) | 0, 1442695041);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    n = n ^ (n >>> 16);
    return (n >>> 0) / 4294967296;
  }
  function brilho(ctx, x, y, cor) { ret(ctx, x, y - 1, 1, 3, cor || C.branco); ret(ctx, x - 1, y, 3, 1, cor || C.branco); }

  /* ================= MIUDEZAS (coisinhas em cima de mesas, vitrines, pedestais) ================= */
  // cx = meio, by = linha de apoio (a coisa fica logo acima)
  function miudeza(ctx, tipo, cx, by) {
    switch (tipo) {
      case 'vaso':
        ret(ctx, cx - 2, by - 5, 5, 5, K); ret(ctx, cx - 1, by - 4, 3, 4, C.azul); ret(ctx, cx - 1, by - 4, 1, 3, C.azul2);
        ret(ctx, cx, by - 8, 1, 3, C.folha3);
        ret(ctx, cx - 2, by - 10, 5, 3, K); ret(ctx, cx - 1, by - 10, 3, 2, C.rosa); ret(ctx, cx, by - 10, 1, 1, C.ouro3);
        break;
      case 'livro':
        ret(ctx, cx - 4, by - 3, 9, 3, K); ret(ctx, cx - 3, by - 3, 7, 2, C.rosa); ret(ctx, cx - 3, by - 2, 7, 1, C.creme);
        ret(ctx, cx - 3, by - 6, 7, 3, K); ret(ctx, cx - 2, by - 6, 5, 2, C.azul); ret(ctx, cx - 2, by - 5, 5, 1, C.creme);
        break;
      case 'xicara':
        ret(ctx, cx - 3, by - 1, 7, 1, K); ret(ctx, cx - 2, by - 5, 5, 4, K); ret(ctx, cx - 1, by - 4, 3, 3, C.branco);
        ret(ctx, cx - 1, by - 4, 3, 1, C.madeira); ret(ctx, cx + 3, by - 4, 1, 2, K);
        ret(ctx, cx, by - 7, 1, 1, 'rgba(255,255,255,0.7)'); ret(ctx, cx - 1, by - 8, 1, 1, 'rgba(255,255,255,0.5)');
        break;
      case 'bolo':
        ret(ctx, cx - 4, by - 1, 9, 1, K); ret(ctx, cx - 3, by - 6, 7, 5, K);
        ret(ctx, cx - 2, by - 5, 5, 4, C.creme); ret(ctx, cx - 2, by - 5, 5, 1, C.rosa); ret(ctx, cx - 2, by - 3, 5, 1, C.rosa2);
        ret(ctx, cx, by - 8, 1, 2, K); ret(ctx, cx, by - 8, 1, 1, C.vermelho);
        break;
      case 'vela':
        ret(ctx, cx - 2, by - 1, 5, 1, K); ret(ctx, cx - 1, by - 6, 3, 5, K); ret(ctx, cx, by - 5, 1, 4, C.creme);
        ret(ctx, cx, by - 8, 1, 2, C.ouro); ret(ctx, cx, by - 7, 1, 1, C.laranja);
        break;
      case 'globo':
        ret(ctx, cx - 2, by - 1, 5, 1, K); ret(ctx, cx, by - 3, 1, 2, C.ouro2);
        circulo(ctx, cx, by - 7, 3, K); circulo(ctx, cx, by - 7, 2, C.azul); ret(ctx, cx - 1, by - 8, 2, 2, C.verde);
        break;
      case 'coroa':
        matriz(ctx, cx - 4, by - 6, ['k.k.k.k.k', 'kykkykkyk', 'kyyyyyyyk', 'kyryyybyk', 'kkkkkkkkk', '.kyyyyyk.'], { k: K, y: C.ouro, r: C.vermelho, b: C.azul });
        break;
      case 'ovo':
        elipse(ctx, cx, by - 4, 3, 4, K); elipse(ctx, cx, by - 4, 2, 3, '#fff5fa');
        ret(ctx, cx - 1, by - 6, 1, 1, C.rosa); ret(ctx, cx + 1, by - 3, 1, 1, C.lilas); ret(ctx, cx - 1, by - 2, 1, 1, C.azul);
        break;
      case 'estrela':
        matriz(ctx, cx - 3, by - 7, ['...k...', '..kyk..', 'kkkyykk', 'kyywyyk', '.kyyyk.', 'kyk.kyk', 'kk...kk'], { k: K, y: C.ouro, w: C.ouro3 });
        break;
      case 'pergaminho':
        ret(ctx, cx - 4, by - 5, 9, 5, K); ret(ctx, cx - 3, by - 4, 7, 3, C.creme2);
        ret(ctx, cx - 2, by - 3, 5, 1, C.madeira2); ret(ctx, cx - 4, by - 5, 1, 5, C.madeira); ret(ctx, cx + 4, by - 5, 1, 5, C.madeira);
        break;
      case 'medalha':
        ret(ctx, cx - 2, by - 9, 2, 4, C.azul); ret(ctx, cx, by - 9, 2, 4, C.vermelho);
        circulo(ctx, cx, by - 3, 3, K); circulo(ctx, cx, by - 3, 2, C.ouro); ret(ctx, cx - 1, by - 4, 1, 1, C.ouro3);
        break;
      case 'gema':
        matriz(ctx, cx - 3, by - 6, ['.kkkkk.', 'kbwbbbk', 'kbbbbdk', '.kbbdk.', '..kdk..', '...k...'], { k: K, b: C.azul2, w: C.branco, d: C.azul });
        break;
      case 'bule':
        ret(ctx, cx - 4, by - 1, 8, 1, K); elipse(ctx, cx, by - 4, 4, 3, K); elipse(ctx, cx, by - 4, 3, 2, C.agua);
        ret(ctx, cx - 1, by - 8, 2, 2, K); ret(ctx, cx + 4, by - 5, 2, 1, K); ret(ctx, cx + 5, by - 6, 1, 1, K);
        ret(ctx, cx - 2, by - 5, 1, 1, C.branco);
        break;
      case 'planta':
        ret(ctx, cx - 2, by - 4, 5, 4, K); ret(ctx, cx - 1, by - 3, 3, 3, C.terracota);
        elipse(ctx, cx, by - 7, 3, 2, K); elipse(ctx, cx, by - 7, 2, 1, C.folha); ret(ctx, cx - 1, by - 8, 1, 1, C.folha4);
        break;
      case 'relogio':
        ret(ctx, cx - 3, by - 7, 7, 7, K); ret(ctx, cx - 2, by - 6, 5, 5, C.madeira);
        circulo(ctx, cx, by - 4, 1, C.creme); ret(ctx, cx, by - 5, 1, 1, K);
        break;
      case 'ursinho':
        matriz(ctx, cx - 3, by - 8, ['kk.kk..', 'kbkkbk.', '.kbbbk.', 'kbebebk', 'kbbpbbk', '.kbbbk.', 'kbkkkbk', 'kkk.kkk'], { k: K, b: '#d9a06a', e: K, p: C.rosa });
        break;
      case 'moedas':
        for (var m = 0; m < 3; m++) { ret(ctx, cx - 3, by - 2 - m * 2, 7, 2, K); ret(ctx, cx - 2, by - 2 - m * 2, 5, 1, C.ouro); }
        ret(ctx, cx - 1, by - 6, 2, 1, C.ouro3);
        break;
      case 'concha':
        matriz(ctx, cx - 3, by - 5, ['..kkk..', '.kpwpk.', 'kpwpwpk', 'kpwpwpk', '.kkkkk.'], { k: K, p: C.rosa2, w: C.creme });
        break;
    }
  }

  R.Desenho = {
    K: K, FUNDO: FUNDO, C: C,
    hexRgb: hexRgb, misturar: misturar, escurecer: escurecer, clarear: clarear,
    ret: ret, circulo: circulo, elipse: elipse, triangulo: triangulo, contornoRet: contornoRet, matriz: matriz,
    sorte: sorte, brilho: brilho, miudeza: miudeza,
  };
})();
