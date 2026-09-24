/* Interiores: as construções por dentro (cômodos andáveis, móveis, personagens e placas).
   Cada interior é DADOS (Reino.registrarInterior, ver js/interiores/*.js). Aqui fica o motor:
   grade de tiles, biblioteca de pisos/paredes/objetos, desenho pré-renderizado e a cena
   (interface da seção 2 de CONTRATOS-INTERIORES.md).
   No carregamento NADA de DOM, canvas, PA ou Progresso: as ferramentas em Node carregam
   este arquivo num vm. Tudo o que desenha só roda dentro de funções chamadas depois. */
(function () {
  var R = window.Reino = window.Reino || {};
  var T = 16;
  var K = '#3a2446';          // contorno
  var FUNDO = '#24162e';      // vão entre os cômodos

  R.interiores = R.interiores || [];
  R.registrarInterior = function (def) { R.interiores.push(def); };

  /* ================= CORES E DESENHO (os mesmos helpers do mapa.js) ================= */
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
  var LIVROS = ['#ff7eb6', '#5fb4ff', '#ffd34d', '#6fdc8c', '#b58cff', '#ff8a3d', '#7ed9c8', '#fff8ee', '#ff5c6a'];

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

  /* ================= PISOS ================= */
  var PISOS = {
    taco: { cores: { piso: '#eab47c', piso2: '#d09358' }, desenhar: function (ctx, px, py, tx, ty, p) {
      var linha = escurecer(p.piso2, 0.2), luz = clarear(p.piso, 0.28);
      for (var j = 0; j < 2; j++) for (var i = 0; i < 2; i++) {
        var qx = px + i * 8, qy = py + j * 8, horiz = (i + j + tx + ty) % 2 === 0;
        ret(ctx, qx, qy, 8, 8, horiz ? p.piso : misturar(p.piso, p.piso2, 0.45));
        for (var s = 0; s < 2; s++) {
          if (horiz) { ret(ctx, qx, qy + s * 4, 7, 1, luz); ret(ctx, qx, qy + s * 4 + 3, 8, 1, linha); }
          else { ret(ctx, qx + s * 4, qy, 1, 7, luz); ret(ctx, qx + s * 4 + 3, qy, 1, 8, linha); }
        }
        if (sorte(tx * 2 + i, ty * 2 + j, 3) < 0.25) ret(ctx, qx + 2, qy + 1 + (horiz ? 1 : 3), 2, 1, p.piso2);
      }
    } },
    mosaico: { cores: { piso: '#fff1dc', piso2: '#ff9d7a', detalhe: '#7ec8d9' }, desenhar: function (ctx, px, py, tx, ty, p) {
      var junta = misturar(p.piso, p.piso2, 0.35);
      ret(ctx, px, py, 16, 16, p.piso);
      for (var j = 0; j < 2; j++) for (var i = 0; i < 2; i++) {
        var qx = px + i * 8, qy = py + j * 8, par = (i + j + tx + ty) % 2 === 0;
        ret(ctx, qx + 7, qy, 1, 8, junta); ret(ctx, qx, qy + 7, 8, 1, junta);
        var cor = par ? p.piso2 : (p.detalhe || C.agua);
        ret(ctx, qx + 3, qy + 1, 1, 5, cor); ret(ctx, qx + 1, qy + 3, 5, 1, cor);
        ret(ctx, qx + 2, qy + 2, 3, 3, cor); ret(ctx, qx + 3, qy + 3, 1, 1, clarear(cor, 0.6));
        ret(ctx, qx, qy, 1, 1, clarear(p.piso, 0.5));
      }
    } },
    pedra: { cores: { piso: '#e9e0cf', piso2: '#c9b99a' }, desenhar: function (ctx, px, py, tx, ty, p) {
      var junta = escurecer(p.piso2, 0.12), luz = clarear(p.piso, 0.4);
      ret(ctx, px, py, 16, 16, junta);
      for (var r = 0; r < 2; r++) {
        var y = py + r * 8, corte = 4 + Math.floor(sorte(tx, ty * 2 + r, 7) * 8);
        var pedras = [[0, corte], [corte + 1, 16 - corte - 1]];
        pedras.forEach(function (pd, k) {
          var cor = sorte(tx * 3 + k, ty * 2 + r, 11) < 0.4 ? misturar(p.piso, p.piso2, 0.4) : p.piso;
          ret(ctx, px + pd[0], y, pd[1], 7, cor);
          ret(ctx, px + pd[0], y, pd[1] - 1, 1, luz);
          ret(ctx, px + pd[0] + pd[1] - 1, y + 1, 1, 6, misturar(cor, p.piso2, 0.6));
          if (sorte(tx + k, ty + r, 5) < 0.3) ret(ctx, px + pd[0] + 2, y + 3, 2, 1, p.piso2);
        });
      }
    } },
    palha: { cores: { piso: '#f5d77a', piso2: '#d9ab45' }, desenhar: function (ctx, px, py, tx, ty, p) {
      ret(ctx, px, py, 16, 16, p.piso);
      var luz = clarear(p.piso, 0.45);
      for (var k = 0; k < 11; k++) {
        var x = px + Math.floor(sorte(tx, ty, k) * 14), y = py + Math.floor(sorte(ty, tx, k + 40) * 14);
        var cor = k % 3 === 0 ? luz : p.piso2, dir = sorte(tx, k, ty) < 0.5 ? 1 : -1;
        for (var s = 0; s < 3; s++) ret(ctx, x + s * dir + (dir < 0 ? 2 : 0), y + s, 1, 1, cor);
      }
    } },
    tabuas: { cores: { piso: '#dca56c', piso2: '#b9804e' }, desenhar: function (ctx, px, py, tx, ty, p) {
      var escuro = escurecer(p.piso2, 0.2), luz = clarear(p.piso, 0.3);
      for (var r = 0; r < 4; r++) {
        var y = py + r * 4, cor = (ty * 4 + r) % 3 === 1 ? misturar(p.piso, p.piso2, 0.3) : p.piso;
        ret(ctx, px, y, 16, 3, cor);
        ret(ctx, px, y, 16, 1, luz);
        ret(ctx, px, y + 3, 16, 1, escuro);
        if (sorte(tx, ty * 4 + r, 2) < 0.45) {
          var jx = 2 + Math.floor(sorte(tx, ty * 4 + r, 9) * 12);
          ret(ctx, px + jx, y, 1, 3, escuro);
          ret(ctx, px + jx - 2, y + 1, 1, 1, p.piso2); ret(ctx, px + jx + 2, y + 1, 1, 1, p.piso2);
        }
      }
    } },
    azulejo: { cores: { piso: '#eef8ff', piso2: '#b9dcf2', detalhe: '#7fb8ec' }, desenhar: function (ctx, px, py, tx, ty, p) {
      for (var j = 0; j < 2; j++) for (var i = 0; i < 2; i++) {
        var qx = px + i * 8, qy = py + j * 8;
        ret(ctx, qx, qy, 8, 8, p.piso2);
        ret(ctx, qx, qy, 7, 7, p.piso);
        ret(ctx, qx, qy, 3, 1, C.branco); ret(ctx, qx, qy, 1, 2, C.branco);
        if ((i + j + tx + ty) % 2 === 0) {
          var d = p.detalhe || C.azul;
          ret(ctx, qx + 3, qy + 2, 1, 3, d); ret(ctx, qx + 2, qy + 3, 3, 1, d);
        }
      }
    } },
    carpete: { cores: { piso: '#c9a8ff', piso2: '#b08cf0' }, desenhar: function (ctx, px, py, tx, ty, p) {
      ret(ctx, px, py, 16, 16, p.piso);
      for (var j = 0; j < 4; j++) for (var i = 0; i < 4; i++) {
        if ((i + j) % 2) continue;
        ret(ctx, px + i * 4 + 1, py + j * 4 + 1, 1, 1, p.piso2);
        ret(ctx, px + i * 4 + 2, py + j * 4 + 2, 1, 1, clarear(p.piso, 0.25));
      }
    } },
  };

  /* ================= PAREDES (coluna de 16 × 32 px: 2 fileiras) ================= */
  function acabamento(ctx, px, py, p) {
    ret(ctx, px, py, 16, 1, escurecer(p.parede, 0.35));
    ret(ctx, px, py + 1, 16, 1, clarear(p.parede, 0.45));
    ret(ctx, px, py + 2, 16, 1, escurecer(p.parede, 0.14));
    ret(ctx, px, py + 27, 16, 1, escurecer(p.parede, 0.18));
    ret(ctx, px, py + 28, 16, 1, clarear(p.rodape, 0.3));
    ret(ctx, px, py + 29, 16, 2, p.rodape);
    ret(ctx, px, py + 31, 16, 1, escurecer(p.rodape, 0.4));
  }
  var PAREDES = {
    papel: { cores: { parede: '#ffe3ec', parede2: '#ffcadd', rodape: '#c98a4b', detalhe: '#ffffff' }, desenhar: function (ctx, px, py, tx, p) {
      ret(ctx, px, py, 16, 32, p.parede);
      for (var s = 0; s < 4; s++) if ((tx * 4 + s) % 2) ret(ctx, px + s * 4, py + 3, 4, 14, p.parede2);
      var fl = (tx % 2) ? 6 : 12;
      ret(ctx, px + 7, py + fl - 1, 1, 3, p.detalhe); ret(ctx, px + 6, py + fl, 3, 1, p.detalhe);
      ret(ctx, px + 7, py + fl, 1, 1, C.ouro);
      ret(ctx, px, py + 17, 16, 1, clarear(p.rodape, 0.35));
      ret(ctx, px, py + 18, 16, 1, p.rodape);
      var lam = misturar(p.parede2, p.rodape, 0.3);
      ret(ctx, px, py + 19, 16, 8, lam);
      ret(ctx, px + 2, py + 20, 12, 1, escurecer(lam, 0.15)); ret(ctx, px + 2, py + 20, 1, 6, escurecer(lam, 0.15));
      ret(ctx, px + 3, py + 25, 11, 1, clarear(lam, 0.3)); ret(ctx, px + 13, py + 21, 1, 5, clarear(lam, 0.3));
      acabamento(ctx, px, py, p);
    } },
    pedra: { cores: { parede: '#ebe2d2', parede2: '#cdbfa6', rodape: '#a89a86', detalhe: '#ffffff' }, desenhar: function (ctx, px, py, tx, p) {
      var junta = escurecer(p.parede2, 0.15);
      ret(ctx, px, py, 16, 32, junta);
      for (var r = 0; r < 5; r++) {
        var y = py + 3 + r * 5, off = (r % 2) ? 4 : 0;
        for (var b = -1; b < 2; b++) {
          var x0 = px + off + b * 8, x1 = Math.max(px, x0), x2 = Math.min(px + 16, x0 + 7);
          if (x2 <= x1) continue;
          var cor = sorte(tx * 3 + b, r, 21) < 0.35 ? misturar(p.parede, p.parede2, 0.5) : p.parede;
          ret(ctx, x1, y, x2 - x1, 4, cor);
          ret(ctx, x1, y, x2 - x1, 1, clarear(cor, 0.4));
        }
      }
      acabamento(ctx, px, py, p);
    } },
    madeira: { cores: { parede: '#e2a468', parede2: '#c4864c', rodape: '#8a604a', detalhe: '#fff1d0' }, desenhar: function (ctx, px, py, tx, p) {
      ret(ctx, px, py, 16, 32, p.parede);
      for (var s = 0; s < 4; s++) {
        ret(ctx, px + s * 4 + 3, py + 3, 1, 24, p.parede2);
        ret(ctx, px + s * 4, py + 3, 1, 24, clarear(p.parede, 0.2));
        if (sorte(tx * 4 + s, 1, 5) < 0.35) { var ny = py + 6 + Math.floor(sorte(tx, s, 8) * 16); ret(ctx, px + s * 4 + 1, ny, 2, 2, p.parede2); }
      }
      ret(ctx, px, py + 15, 16, 1, clarear(p.parede2, 0.2));
      ret(ctx, px, py + 16, 16, 2, p.parede2);
      ret(ctx, px, py + 18, 16, 1, escurecer(p.parede2, 0.25));
      acabamento(ctx, px, py, p);
    } },
    tijolo: { cores: { parede: '#f2a785', parede2: '#dc8564', rodape: '#9b6a55', detalhe: '#fff1e0' }, desenhar: function (ctx, px, py, tx, p) {
      var massa = clarear(p.parede, 0.55);
      ret(ctx, px, py, 16, 32, massa);
      for (var r = 0; r < 6; r++) {
        var y = py + 3 + r * 4, off = (r % 2) ? 4 : 0;
        for (var b = -1; b < 2; b++) {
          var x0 = px + off + b * 8, x1 = Math.max(px, x0), x2 = Math.min(px + 16, x0 + 7);
          if (x2 <= x1) continue;
          var cor = sorte(tx * 3 + b, r, 31) < 0.3 ? p.parede2 : p.parede;
          ret(ctx, x1, y, x2 - x1, 3, cor);
          ret(ctx, x1, y, x2 - x1, 1, clarear(cor, 0.25));
        }
      }
      acabamento(ctx, px, py, p);
    } },
    azulejo: { cores: { parede: '#fff6e8', parede2: '#9fdcd0', rodape: '#5fae9e', detalhe: '#5fb4ff' }, desenhar: function (ctx, px, py, tx, p) {
      ret(ctx, px, py, 16, 32, p.parede);
      ret(ctx, px, py + 9, 16, 1, clarear(p.parede2, 0.4));
      ret(ctx, px, py + 14, 16, 2, p.detalhe);
      for (var i = 0; i < 4; i++) ret(ctx, px + i * 4 + 1, py + 14, 2, 1, clarear(p.detalhe, 0.5));
      for (var j = 0; j < 3; j++) for (var k = 0; k < 4; k++) {
        var x = px + k * 4, y = py + 16 + j * 4;
        ret(ctx, x, y, 4, 4, escurecer(p.parede2, 0.12));
        ret(ctx, x, y, 3, 3, (j + k + tx) % 2 ? p.parede2 : clarear(p.parede2, 0.45));
        ret(ctx, x, y, 1, 1, C.branco);
      }
      acabamento(ctx, px, py, p);
    } },
  };

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

  /* ================= BIBLIOTECA DE OBJETOS ================= */
  var OBJETOS = {};
  function objeto(tipo, d) { OBJETOS[tipo] = d; return d; }

  function larg(o) { return (o.w || 1) * T; }
  function cor(o, nome, padrao) { return (o.var && o.var[nome]) || padrao; }

  /* ----- na parede (pegada nas 2 fileiras da parede; desenho entre y+9 e y+30) ----- */
  function vidraca(ctx, x, y, w, h, noite) {
    ret(ctx, x, y, w, h, noite ? '#4a3a7a' : C.ceu);
    ret(ctx, x, y + h - 4, w, 4, noite ? '#5a4a8a' : '#d6f2ff');
    if (!noite) {
      ret(ctx, x + 2, y + 3, 4, 1, C.branco); ret(ctx, x + 1, y + 4, 6, 1, C.branco);
      if (w > 10) { ret(ctx, x + w - 6, y + 6, 3, 1, C.branco); ret(ctx, x + w - 7, y + 7, 5, 1, C.branco); }
      ret(ctx, x, y + h - 2, w, 2, '#b6e39a');
    } else {
      ret(ctx, x + 2, y + 2, 1, 1, C.ouro3); ret(ctx, x + w - 3, y + 4, 1, 1, C.branco);
      circulo(ctx, x + w - 4, y + 3, 1, C.ouro3);
    }
  }
  objeto('janela', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var W = larg(o), x = px + 1, y = py + 8, w = W - 2, h = 18, mold = cor(o, 'moldura', C.creme);
      contornoRet(ctx, x, y, w, h, mold);
      vidraca(ctx, x + 2, y + 2, w - 4, h - 4, o.var && o.var.noite);
      ret(ctx, x + Math.floor(w / 2) - 1, y + 2, 2, h - 4, mold);
      ret(ctx, x + 2, y + Math.floor(h / 2) - 1, w - 4, 1, mold);
      ret(ctx, x - 1, y + h - 1, w + 2, 3, K); ret(ctx, x, y + h - 1, w, 2, C.madeiraClara); ret(ctx, x, y + h - 1, w, 1, clarear(C.madeiraClara, 0.4));
      ret(ctx, x + 3, y + h - 3, 2, 2, C.rosa); ret(ctx, x + w - 5, y + h - 3, 2, 2, C.ouro);
    },
    luz: function (ctx, px, py, o) {   // sol entrando no piso logo abaixo
      var W = larg(o);
      for (var j = 0; j < 12; j++) ret(ctx, px + 2 + Math.floor(j / 3), py + 32 + j, W - 4, 1, 'rgba(255,248,200,' + (0.30 - j * 0.02).toFixed(2) + ')');
    } });
  objeto('cortina', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var W = larg(o), c = cor(o, 'cor', C.rosa), c2 = escurecer(c, 0.2);
      contornoRet(ctx, px + 2, py + 9, W - 4, 17, C.creme);
      vidraca(ctx, px + 3, py + 10, W - 6, 15);
      ret(ctx, px, py + 6, W, 2, K); ret(ctx, px + 1, py + 6, W - 2, 1, C.ouro);
      [px + 1, px + W - 6].forEach(function (x, lado) {
        ret(ctx, x - 1, py + 8, 7, 21, K);
        ret(ctx, x, py + 8, 5, 20, c);
        ret(ctx, x + (lado ? 3 : 1), py + 8, 1, 20, c2);
        ret(ctx, x + (lado ? 1 : 3), py + 8, 1, 20, clarear(c, 0.35));
        ret(ctx, x, py + 20, 5, 1, C.ouro);
      });
      ret(ctx, px + 1, py + 8, W - 2, 3, K); ret(ctx, px + 2, py + 8, W - 4, 2, c);
      for (var i = px + 2; i < px + W - 2; i += 3) ret(ctx, i, py + 10, 2, 1, c2);
    },
    luz: function (ctx, px, py, o) { OBJETOS.janela.luz(ctx, px, py, o); } });
  var CENAS_QUADRO = {
    paisagem: function (ctx, x, y, w, h) {
      ret(ctx, x, y, w, h, C.ceu); circulo(ctx, x + w - 3, y + 2, 1, C.ouro);
      elipse(ctx, x + 3, y + h, 5, 4, C.folha); elipse(ctx, x + w - 2, y + h, 6, 3, C.folha2);
      ret(ctx, x + 2, y + h - 4, 1, 1, C.rosa);
    },
    flor: function (ctx, x, y, w, h) {
      ret(ctx, x, y, w, h, '#fff1d0'); var cx = x + Math.floor(w / 2);
      ret(ctx, cx, y + 4, 1, h - 4, C.folha3); ret(ctx, cx + 1, y + h - 4, 2, 1, C.folha);
      circulo(ctx, cx, y + 3, 2, C.rosa); ret(ctx, cx, y + 3, 1, 1, C.ouro);
    },
    mar: function (ctx, x, y, w, h) {
      ret(ctx, x, y, w, h, C.ceu); ret(ctx, x, y + h - 5, w, 5, C.azul); ret(ctx, x, y + h - 5, w, 1, C.branco);
      ret(ctx, x + 2, y + h - 8, 3, 3, C.branco); ret(ctx, x + 3, y + h - 10, 1, 2, C.madeira3);
    },
    retrato: function (ctx, x, y, w, h) {
      ret(ctx, x, y, w, h, '#e6d6ff'); var cx = x + Math.floor(w / 2);
      elipse(ctx, cx, y + h - 1, 4, 3, C.azul); circulo(ctx, cx, y + 4, 2, '#f1c7a5');
      ret(ctx, cx - 2, y + 1, 5, 2, '#5a3825'); ret(ctx, cx - 1, y + 4, 1, 1, K); ret(ctx, cx + 1, y + 4, 1, 1, K);
    },
    castelo: function (ctx, x, y, w, h) {
      ret(ctx, x, y, w, h, '#ffe6f2'); var cx = x + Math.floor(w / 2);
      ret(ctx, cx - 3, y + 4, 7, h - 4, C.creme2); ret(ctx, cx - 3, y + 2, 2, 2, C.laranja); ret(ctx, cx + 2, y + 2, 2, 2, C.laranja);
      ret(ctx, cx - 1, y + h - 3, 2, 3, C.roxo); ret(ctx, x, y + h - 1, w, 1, C.folha);
    },
  };
  objeto('quadro', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var W = larg(o), x = px + 2, y = py + 10, w = W - 4, h = 14;
      ret(ctx, px + Math.floor(W / 2), py + 6, 1, 4, K);
      contornoRet(ctx, x, y, w, h, cor(o, 'moldura', C.ouro));
      ret(ctx, x + 1, y + 1, w - 2, 1, C.ouro3);
      var nomes = Object.keys(CENAS_QUADRO);
      var cena = (o.var && o.var.cena) || nomes[Math.floor(sorte(o.x, o.y, 4) * nomes.length)];
      (CENAS_QUADRO[cena] || CENAS_QUADRO.paisagem)(ctx, x + 2, y + 2, w - 4, h - 4);
      ret(ctx, x + 1, y + h - 1, w - 2, 1, C.ouro2);
    } });
  // quadro que mostra um unicórnio do deck: silhueta até ela ganhar, depois o unicórnio
  function spriteUni(P, id, larguraMax, alturaMax) {
    if (!window.PA || !PA.unicornio || !P || !P.defUni) return null;
    var def = P.defUni(id);
    if (!def) return null;
    for (var e = 3; e >= 0; e--) {
      var s = PA.unicornio(def, e, 0);
      var c = s && (s.canvas || s);
      if (c && c.width <= larguraMax && c.height <= alturaMax) return c;
    }
    var ultimo = PA.unicornio(def, 0, 0);
    return ultimo && (ultimo.canvas || ultimo);
  }
  objeto('quadro-unicornio', { w: 2, h: 2, parede: true, solido: false,
    chave: function (P, o) { var id = o && o.var && o.var.uni; return 'qu:' + id + ':' + (P && P.temUni && id && P.temUni(id) ? 1 : 0); },
    desenhar: function (ctx, px, py, o, P) {
      var W = larg(o), x = px + 2, y = py + 7, w = W - 4, h = 21;
      ret(ctx, x - 1, y - 1, w + 2, h + 2, K);
      ret(ctx, x, y, w, h, C.ouro); ret(ctx, x, y, w, 1, C.ouro3); ret(ctx, x, y + h - 1, w, 1, C.ouro2);
      ret(ctx, x + 2, y + 2, w - 4, h - 4, K);
      var ix = x + 3, iy = y + 3, iw = w - 6, ih = h - 6;
      var tem = !!(P && P.temUni && o.var && o.var.uni && P.temUni(o.var.uni));
      ret(ctx, ix, iy, iw, ih, tem ? '#ffe6f2' : '#e9e0f2');
      ret(ctx, ix, iy + ih - 3, iw, 3, tem ? '#d4f0c0' : '#d8cde6');
      if (tem) { brilho(ctx, ix + 2, iy + 2, C.ouro3); brilho(ctx, ix + iw - 3, iy + 3, C.branco); }
      var spr = o.var && o.var.uni ? spriteUni(P, o.var.uni, iw, ih) : null;
      if (spr) {
        var img = tem ? spr : (PA.silhueta ? PA.silhueta(spr) : spr);
        ctx.save(); ctx.beginPath(); ctx.rect(ix, iy, iw, ih); ctx.clip();
        ctx.drawImage(img, Math.round(ix + (iw - img.width) / 2), Math.round(iy + ih - img.height));
        ctx.restore();
      }
      if (!tem) matriz(ctx, ix + iw - 5, iy + 1, ['.kk.', 'k..k', '..k.', '.k..', '....', '.k..'], { k: '#8a7aa8' });
      // plaquinha dourada
      ret(ctx, px + W / 2 - 4, y + h + 1, 8, 2, K); ret(ctx, px + W / 2 - 3, y + h + 1, 6, 1, C.ouro);
    } });
  objeto('estandarte', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var c = cor(o, 'cor', C.roxo), c2 = clarear(c, 0.35);
      ret(ctx, px + 1, py + 7, 14, 2, K); ret(ctx, px + 2, py + 7, 12, 1, C.ouro);
      circulo(ctx, px + 1, py + 8, 1, C.ouro); circulo(ctx, px + 14, py + 8, 1, C.ouro);
      ret(ctx, px + 3, py + 9, 10, 16, K);
      ret(ctx, px + 4, py + 9, 8, 15, c); ret(ctx, px + 4, py + 9, 1, 15, c2);
      ret(ctx, px + 3, py + 25, 4, 3, K); ret(ctx, px + 9, py + 25, 4, 3, K);
      ret(ctx, px + 4, py + 24, 2, 3, c); ret(ctx, px + 10, py + 24, 2, 3, c);
      var em = cor(o, 'emblema', 'estrela');
      if (em === 'coracao') matriz(ctx, px + 5, py + 13, ['yy.yy', 'yyyyy', '.yyy.', '..y..'], { y: C.ouro });
      else matriz(ctx, px + 5, py + 12, ['..y..', 'yyyyy', '.yyy.', 'y...y'], { y: C.ouro });
      ret(ctx, px + 4, py + 19, 8, 1, C.ouro);
    } });
  objeto('vitral', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var x = px + 3, y = py + 7;
      ret(ctx, x, y + 3, 10, 19, K); elipse(ctx, x + 5, y + 4, 5, 4, K);
      var cores = [C.rosa, C.azul2, C.ouro, C.lilas, C.agua, C.laranja];
      for (var j = 0; j < 4; j++) for (var i = 0; i < 2; i++) ret(ctx, x + 1 + i * 4 + i, y + 4 + j * 4 + j, 3 + (1 - i), 4, cores[(i + j * 2 + o.x) % cores.length]);
      elipse(ctx, x + 5, y + 4, 3, 2, C.ouro3); ret(ctx, x + 5, y + 2, 1, 4, K);
      ret(ctx, x + 1, y + 5, 1, 2, C.branco);
      ret(ctx, x - 1, y + 22, 12, 2, K); ret(ctx, x, y + 22, 10, 1, C.pedra);
    } });
  var CARTAZES = {
    abc: function (ctx, x, y) {
      matriz(ctx, x, y, ['.r..bb..gg', 'r.r.b.b.g.', 'rrr.bb..g.', 'r.r.b.b.g.', 'r.r.bb..gg'], { r: C.vermelho, b: C.azul, g: C.verde });
    },
    estrela: function (ctx, x, y) { miudeza(ctx, 'estrela', x + 5, y + 7); },
    coracao: function (ctx, x, y) { matriz(ctx, x + 2, y, ['.kk.kk.', 'krrkrrk', 'krrrrrk', '.krrrk.', '..krk..', '...k...'], { k: K, r: C.rosa }); },
    numeros: function (ctx, x, y) {
      matriz(ctx, x, y, ['.o..ll..', 'oo.l..l.', '.o...l..', '.o..l...', 'ooo.llll'], { o: C.laranja, l: C.roxo });
    },
    arcoiris: function (ctx, x, y) {
      [C.vermelho, C.laranja, C.ouro, C.verde, C.azul].forEach(function (c, i) { ret(ctx, x + i, y + i, 10 - i * 2, 1, c); ret(ctx, x + i, y + i, 1, 6 - i, c); ret(ctx, x + 9 - i, y + i, 1, 6 - i, c); });
    },
  };
  objeto('cartaz', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var x = px + 1, y = py + 9, fundo = cor(o, 'cor', C.creme);
      contornoRet(ctx, x, y, 14, 16, fundo);
      ret(ctx, x + 1, y + 14, 12, 1, escurecer(fundo, 0.1));
      var d = cor(o, 'desenho', ['abc', 'estrela', 'coracao', 'numeros', 'arcoiris'][Math.floor(sorte(o.x, o.y, 9) * 5)]);
      (CARTAZES[d] || CARTAZES.estrela)(ctx, x + 2, y + 3);
      ret(ctx, x + 1, y, 2, 2, C.vermelho); ret(ctx, x + 11, y, 2, 2, C.azul);
      ret(ctx, x + 3, y + 12, 8, 1, '#c4b4d4');
    } });
  objeto('relogio-parede', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var cx = px + 8, c = cor(o, 'cor', C.madeira);
      ret(ctx, cx - 5, py + 9, 11, 20, K); ret(ctx, cx - 4, py + 10, 9, 18, c);
      triangulo(ctx, cx - 6, py + 5, 13, 5, K); triangulo(ctx, cx - 4, py + 6, 9, 4, clarear(c, 0.2));
      circulo(ctx, cx, py + 14, 4, K); circulo(ctx, cx, py + 14, 3, C.creme);
      ret(ctx, cx, py + 12, 1, 3, K); ret(ctx, cx, py + 14, 2, 1, K);
      ret(ctx, cx - 3, py + 19, 7, 8, escurecer(c, 0.45));
    },
    anim: function (ctx, px, py, t) {
      var cx = px + 8, a = Math.round(Math.sin(t / 500) * 2);
      ret(ctx, cx, py + 19, 1, 4, C.ouro2);
      ret(ctx, cx + Math.round(a / 2), py + 22, 1, 2, C.ouro2);
      circulo(ctx, cx + a, py + 25, 1, C.ouro);
    } });
  objeto('prateleira-parede', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var W = larg(o);
      ret(ctx, px + 1, py + 21, W - 2, 3, K); ret(ctx, px + 2, py + 21, W - 4, 1, C.madeiraClara); ret(ctx, px + 2, py + 22, W - 4, 1, C.madeira);
      ret(ctx, px + 4, py + 24, 2, 3, C.madeira3); ret(ctx, px + W - 6, py + 24, 2, 3, C.madeira3);
      var itens = (o.var && o.var.itens) || ['livro', 'vaso', 'ursinho', 'planta'];
      var passo = (W - 4) / itens.length;
      itens.forEach(function (it, i) { miudeza(ctx, it, Math.round(px + 2 + passo * (i + 0.5)), py + 21); });
    } });
  objeto('arandela', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      ret(ctx, cx - 2, py + 18, 5, 6, K); ret(ctx, cx - 1, py + 19, 3, 4, C.ouro2);
      ret(ctx, cx - 4, py + 17, 9, 2, K); ret(ctx, cx - 3, py + 17, 7, 1, C.ouro);
      ret(ctx, cx - 1, py + 12, 3, 5, K); ret(ctx, cx, py + 12, 1, 5, C.creme);
    },
    anim: function (ctx, px, py, t) {
      var cx = px + 8, f = Math.floor(t / 140) % 3;
      circulo(ctx, cx, py + 9, 4, 'rgba(255,220,120,0.18)');
      circulo(ctx, cx, py + 9, 2, 'rgba(255,230,150,0.25)');
      ret(ctx, cx, py + 8 - (f === 1 ? 1 : 0), 1, 4 + (f === 1 ? 1 : 0), C.laranja);
      ret(ctx, cx + (f === 2 ? 1 : 0), py + 9, 1, 2, C.ouro3);
    } });
  objeto('lousa', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var W = larg(o), x = px + 1, y = py + 9, w = W - 2;
      contornoRet(ctx, x, y, w, 17, C.madeira);
      ret(ctx, x + 2, y + 2, w - 4, 13, cor(o, 'cor', '#4f8a64'));
      matriz(ctx, x + 4, y + 4, ['.w..ww...ww', 'w.w.w.w.w..', 'www.ww..w..', 'w.w.w.w.w..', 'w.w.ww...ww'], { w: '#eef6e8' });
      matriz(ctx, x + 4, y + 10, ['.w......w...ww', 'ww.w.w.ww.ww.w', '.w.www..w....w', '.w.w.w..w...w.', 'www....www.www'].map(function (l) { return l; }), { w: '#dcefd4' });
      ret(ctx, x + 1, y + 16, w - 2, 2, K); ret(ctx, x + 2, y + 16, w - 4, 1, C.madeiraClara);
      ret(ctx, x + w - 8, y + 15, 3, 1, C.branco); ret(ctx, x + w - 4, y + 15, 2, 1, C.rosa2);
    } });
  objeto('mapa-parede', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var W = larg(o), x = px + 2, y = py + 9, w = W - 4;
      contornoRet(ctx, x, y, w, 16, '#f6e2b0');
      ret(ctx, x - 1, y - 1, 3, 18, K); ret(ctx, x, y, 1, 16, C.madeira);
      ret(ctx, x + w - 2, y - 1, 3, 18, K); ret(ctx, x + w - 1, y, 1, 16, C.madeira);
      ret(ctx, x + 3, y + 2, w - 6, 12, '#bfe6ee');
      elipse(ctx, x + 9, y + 7, 5, 3, '#c9dd8a'); elipse(ctx, x + 19, y + 10, 4, 2, '#c9dd8a');
      ret(ctx, x + 8, y + 6, 2, 1, C.folha3); ret(ctx, x + 18, y + 9, 1, 1, C.folha3);
      for (var i = 0; i < 4; i++) ret(ctx, x + 11 + i * 2, y + 8 + (i % 2), 1, 1, C.vermelho);
      matriz(ctx, x + 19, y + 8, ['r.r', '.r.', 'r.r'], { r: C.vermelho });
      brilho(ctx, x + 5, y + 11, C.ouro);
    } });
  objeto('espelho', { w: 1, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py) {
      var cx = px + 8;
      elipse(ctx, cx, py + 17, 6, 9, K); elipse(ctx, cx, py + 17, 5, 8, C.ouro);
      elipse(ctx, cx, py + 17, 4, 7, '#cfe8f5'); elipse(ctx, cx + 1, py + 19, 2, 4, '#e8f6ff');
      ret(ctx, cx - 2, py + 12, 1, 4, C.branco); ret(ctx, cx - 1, py + 13, 1, 1, C.branco);
      ret(ctx, cx - 1, py + 7, 3, 2, K); ret(ctx, cx, py + 7, 1, 1, C.rosa);
    } });
  objeto('bandeirinhas', { w: 2, h: 2, parede: true, solido: false,
    desenhar: function (ctx, px, py, o) {
      var W = larg(o), cores = [C.rosa, C.ouro, C.azul, C.verde, C.lilas, C.laranja];
      for (var i = 0; i < W; i++) { var y = py + 12 + Math.round(Math.sin(i / W * Math.PI) * 3); ret(ctx, px + i, y, 1, 1, K); }
      for (var b = 0; b * 6 + 2 < W - 3; b++) {
        var x = px + 2 + b * 6, yb = py + 13 + Math.round(Math.sin((x - px + 2) / W * Math.PI) * 3);
        var c = cores[(b + o.x) % cores.length];
        ret(ctx, x, yb, 5, 1, c); ret(ctx, x + 1, yb + 1, 3, 1, c); ret(ctx, x + 2, yb + 2, 1, 2, c);
        ret(ctx, x, yb, 1, 1, clarear(c, 0.5));
      }
    } });

  /* ----- no chão (pegada no piso; `topo` = quanto o desenho sobe acima da pegada) ----- */
  objeto('estante', { w: 2, h: 1, topo: 20, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var W = larg(o), x = px + 1, y = py - 20, w = W - 2, h = 35, c = cor(o, 'cor', C.madeira);
      contornoRet(ctx, x, y, w, h, c);
      ret(ctx, x + 1, y + 1, w - 2, 2, clarear(c, 0.3));
      ret(ctx, x + 3, y + 4, w - 6, h - 8, escurecer(c, 0.55));
      for (var p = 0; p < 3; p++) {
        var base = y + 4 + (p + 1) * 9;
        ret(ctx, x + 2, base - 1, w - 4, 2, clarear(c, 0.15)); ret(ctx, x + 2, base + 1, w - 4, 1, escurecer(c, 0.3));
        var bx = x + 3, n = 0;
        while (bx < x + w - 4) {
          var s = sorte(o.x * 7 + n, o.y * 5 + p, 13), bw = s < 0.5 ? 2 : 3, bh = 5 + Math.floor(sorte(n, p, o.x) * 3);
          if (bx + bw > x + w - 3) break;
          if (s > 0.9) { bx += 2; n++; continue; }
          var cl = LIVROS[Math.floor(sorte(o.x + n, p, 17) * LIVROS.length)];
          ret(ctx, bx, base - 1 - bh, bw, bh, cl); ret(ctx, bx, base - 1 - bh, 1, bh, clarear(cl, 0.35));
          ret(ctx, bx, base - bh + 1, bw, 1, escurecer(cl, 0.25));
          ret(ctx, bx + bw, base - 1 - bh, 1, bh, K);
          bx += bw + 1; n++;
        }
      }
      ret(ctx, x + 1, y + h - 1, 3, 1, K); ret(ctx, x + w - 4, y + h - 1, 3, 1, K);
    } });
  objeto('armario', { w: 2, h: 1, topo: 18, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var W = larg(o), x = px + 2, y = py - 18, w = W - 4, h = 33, c = cor(o, 'cor', '#c9e4ff');
      ret(ctx, x - 1, y - 2, w + 2, 4, K); ret(ctx, x, y - 1, w, 2, clarear(c, 0.4));
      contornoRet(ctx, x, y + 1, w, h - 1, c);
      var mw = Math.floor((w - 3) / 2);
      [x + 1, x + 2 + mw].forEach(function (dx) {
        ret(ctx, dx + 1, y + 3, mw - 2, h - 8, escurecer(c, 0.1));
        ret(ctx, dx + 2, y + 4, mw - 4, h - 10, clarear(c, 0.2));
        ret(ctx, dx + 3, y + 5, 1, h - 14, C.branco);
      });
      ret(ctx, x + 1 + mw, y + 2, 1, h - 4, escurecer(c, 0.35));
      circulo(ctx, x + mw - 1, y + 16, 1, C.ouro); circulo(ctx, x + mw + 4, y + 16, 1, C.ouro);
      ret(ctx, x + 1, y + h - 3, w - 2, 2, escurecer(c, 0.25));
      ret(ctx, x, y + h, 3, 1, K); ret(ctx, x + w - 3, y + h, 3, 1, K);
      miudeza(ctx, 'moedas', x + 5, y - 2); miudeza(ctx, 'ursinho', x + w - 7, y - 2);
    } });
  objeto('mesa', { w: 2, h: 1, topo: 6, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var W = larg(o), x = px + 1, w = W - 2, toalha = o.var && o.var.toalha, c = cor(o, 'cor', C.madeiraClara);
      ret(ctx, x + 2, py + 4, 3, 11, K); ret(ctx, x + 3, py + 4, 1, 10, C.madeira2);
      ret(ctx, x + w - 5, py + 4, 3, 11, K); ret(ctx, x + w - 4, py + 4, 1, 10, C.madeira2);
      contornoRet(ctx, x, py - 5, w, 10, c);
      ret(ctx, x + 1, py - 4, w - 2, 1, clarear(c, 0.4));
      ret(ctx, x + 1, py + 2, w - 2, 2, escurecer(c, 0.25));
      if (toalha) {
        var t = typeof toalha === 'string' ? toalha : C.rosa2;
        ret(ctx, x + 1, py - 3, w - 2, 6, t);
        for (var i = x + 1; i < x + w - 1; i += 3) { ret(ctx, i, py + 3, 2, 2, t); ret(ctx, i, py + 5, 2, 1, K); ret(ctx, i + 2, py + 3, 1, 2, K); }
        for (var k = x + 2; k < x + w - 2; k += 4) ret(ctx, k, py - 1, 1, 1, C.branco);
      }
      var itens = (o.var && o.var.itens) || ['vaso', 'livro'];
      var passo = (w - 4) / itens.length;
      itens.forEach(function (it, n) { miudeza(ctx, it, Math.round(x + 2 + passo * (n + 0.5)), py); });
    } });
  objeto('mesa-centro', { w: 2, h: 1, topo: 2, solido: true,
    desenhar: function (ctx, px, py, o) {
      var W = larg(o), x = px + 2, w = W - 4, c = cor(o, 'cor', C.madeira);
      ret(ctx, x + 2, py + 9, 2, 5, K); ret(ctx, x + w - 4, py + 9, 2, 5, K);
      contornoRet(ctx, x, py + 1, w, 9, clarear(c, 0.15));
      ret(ctx, x + 1, py + 2, w - 2, 1, clarear(c, 0.45)); ret(ctx, x + 1, py + 7, w - 2, 2, escurecer(c, 0.2));
      var itens = (o.var && o.var.itens) || ['bule', 'xicara'];
      var passo = (w - 4) / itens.length;
      itens.forEach(function (it, n) { miudeza(ctx, it, Math.round(x + 2 + passo * (n + 0.5)), py + 6); });
    } });
  objeto('escrivaninha', { w: 2, h: 1, topo: 10, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var W = larg(o), x = px + 1, w = W - 2, c = cor(o, 'cor', C.madeira);
      contornoRet(ctx, x, py - 2, w, 17, escurecer(c, 0.1));
      ret(ctx, x + 1, py - 1, w - 2, 5, clarear(c, 0.25)); ret(ctx, x + 1, py - 1, w - 2, 1, clarear(c, 0.5));
      ret(ctx, x + 1, py + 4, w - 2, 1, escurecer(c, 0.35));
      ret(ctx, x + 3, py + 6, 10, 8, escurecer(c, 0.55));
      contornoRet(ctx, x + w - 13, py + 5, 11, 5, c); contornoRet(ctx, x + w - 13, py + 9, 11, 5, c);
      ret(ctx, x + w - 8, py + 7, 2, 1, C.ouro); ret(ctx, x + w - 8, py + 11, 2, 1, C.ouro);
      ret(ctx, x + 3, py - 4, 8, 5, K); ret(ctx, x + 4, py - 4, 6, 4, C.branco); ret(ctx, x + 5, py - 3, 4, 1, '#c4b4d4'); ret(ctx, x + 5, py - 1, 3, 1, '#c4b4d4');
      ret(ctx, x + 14, py - 3, 4, 4, K); ret(ctx, x + 15, py - 2, 2, 2, '#4a6cd4');
      ret(ctx, x + 17, py - 9, 1, 6, C.branco); ret(ctx, x + 18, py - 10, 1, 4, C.creme2); ret(ctx, x + 16, py - 8, 1, 3, C.creme2);
      ret(ctx, x + w - 9, py - 9, 3, 8, K); ret(ctx, x + w - 8, py - 8, 1, 6, C.ouro2);
      triangulo(ctx, x + w - 12, py - 13, 9, 5, K); triangulo(ctx, x + w - 11, py - 12, 7, 4, cor(o, 'abajur', C.verde));
    } });
  objeto('cadeira', { w: 1, h: 1, topo: 8, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var c = cor(o, 'cor', C.madeira), a = cor(o, 'almofada', C.rosa);
      ret(ctx, px + 3, py - 8, 10, 12, K); ret(ctx, px + 4, py - 7, 8, 10, c);
      ret(ctx, px + 5, py - 6, 6, 7, a); ret(ctx, px + 5, py - 6, 6, 1, clarear(a, 0.4));
      ret(ctx, px + 2, py + 3, 12, 5, K); ret(ctx, px + 3, py + 4, 10, 2, clarear(a, 0.2)); ret(ctx, px + 3, py + 6, 10, 1, escurecer(c, 0.2));
      ret(ctx, px + 3, py + 8, 2, 7, K); ret(ctx, px + 11, py + 8, 2, 7, K);
      ret(ctx, px + 3, py + 8, 1, 6, c); ret(ctx, px + 11, py + 8, 1, 6, c);
    } });
  objeto('poltrona', { w: 1, h: 1, topo: 8, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var c = cor(o, 'cor', C.lilas), e = escurecer(c, 0.2), l = clarear(c, 0.35);
      elipse(ctx, px + 8, py - 2, 7, 7, K); elipse(ctx, px + 8, py - 2, 6, 6, c); ret(ctx, px + 4, py - 6, 4, 1, l);
      ret(ctx, px + 1, py + 1, 14, 13, K);
      ret(ctx, px + 2, py + 2, 3, 11, e); ret(ctx, px + 11, py + 2, 3, 11, e);
      ret(ctx, px + 2, py + 2, 3, 1, l); ret(ctx, px + 11, py + 2, 3, 1, l);
      ret(ctx, px + 5, py + 4, 6, 6, l); ret(ctx, px + 5, py + 9, 6, 3, c);
      ret(ctx, px + 2, py + 14, 2, 1, K); ret(ctx, px + 12, py + 14, 2, 1, K);
    } });
  objeto('sofa', { w: 2, h: 1, topo: 8, solido: true, alto: true,
    desenhar: function (ctx, px, py, o) {
      var W = larg(o), c = cor(o, 'cor', C.rosa2), e = escurecer(c, 0.2), l = clarear(c, 0.35);
      ret(ctx, px + 2, py - 8, W - 4, 12, K); ret(ctx, px + 3, py - 7, W - 6, 10, c);
      ret(ctx, px + 4, py - 6, W - 8, 1, l);
      ret(ctx, px + W / 2, py - 6, 1, 8, e);
      ret(ctx, px + 1, py, W - 2, 14, K);
      ret(ctx, px + 2, py + 1, 4, 12, e); ret(ctx, px + W - 6, py + 1, 4, 12, e);
      ret(ctx, px + 2, py + 1, 4, 1, l); ret(ctx, px + W - 6, py + 1, 4, 1, l);
      ret(ctx, px + 6, py + 3, W - 12, 6, l); ret(ctx, px + 6, py + 8, W - 12, 4, c);
      ret(ctx, px + W / 2, py + 3, 1, 9, e);
      var al = cor(o, 'almofada', C.ouro);
      ret(ctx, px + 7, py - 3, 6, 6, K); ret(ctx, px + 8, py - 2, 4, 4, al); ret(ctx, px + 8, py - 2, 2, 1, clarear(al, 0.5));
      ret(ctx, px + 3, py + 14, 2, 1, K); ret(ctx, px + W - 5, py + 14, 2, 1, K);
    } });
  objeto('banco', { w: 2, h: 1, topo: 2, solido: true,
    desenhar: function (ctx, px, py, o) {
      var W = larg(o), c = cor(o, 'cor', C.madeiraClara);
      ret(ctx, px + 3, py + 7, 3, 8, K); ret(ctx, px + W - 6, py + 7, 3, 8, K);
      ret(ctx, px + 4, py + 7, 1, 7, C.madeira2); ret(ctx, px + W - 5, py + 7, 1, 7, C.madeira2);
      contornoRet(ctx, px + 1, py, W - 2, 8, c);
      ret(ctx, px + 2, py + 1, W - 4, 1, clarear(c, 0.4)); ret(ctx, px + 2, py + 4, W - 4, 1, escurecer(c, 0.15));
      ret(ctx, px + 2, py + 6, W - 4, 1, escurecer(c, 0.3));
    } });
  objeto('tapete', { w: 3, h: 2, solido: false, semSombra: true, plano: true,
    desenhar: function (ctx, px, py, o) {
      var W = larg(o), H = (o.h || 2) * T, c = cor(o, 'cor', C.vermelho), b = cor(o, 'borda', C.ouro);
      var x = px + 3, y = py + 2, w = W - 6, h = H - 4;
      for (var f = y + 1; f < y + h - 1; f += 2) { ret(ctx, x - 2, f, 2, 1, C.creme2); ret(ctx, x + w, f, 2, 1, C.creme2); }
      contornoRet(ctx, x, y, w, h, b);
      ret(ctx, x + 2, y + 2, w - 4, h - 4, c);
      ret(ctx, x + 3, y + 3, w - 6, h - 6, escurecer(c, 0.12));
      ret(ctx, x + 4, y + 4, w - 8, h - 8, c);
      var cx = x + Math.floor(w / 2), cy = y + Math.floor(h / 2);
      for (var j = -3; j <= 3; j++) { var m = 3 - Math.abs(j); ret(ctx, cx - m * 2, cy + j, m * 4 + 1, 1, b); }
      ret(ctx, cx, cy, 1, 1, C.branco);
      ret(ctx, x + 6, y + 6, 2, 2, b); ret(ctx, x + w - 8, y + 6, 2, 2, b); ret(ctx, x + 6, y + h - 8, 2, 2, b); ret(ctx, x + w - 8, y + h - 8, 2, 2, b);
    } });
  objeto('tapete-redondo', { w: 2, h: 2, solido: false, semSombra: true, plano: true,
    desenhar: function (ctx, px, py, o) {
      var W = larg(o), H = (o.h || 2) * T, cx = px + Math.floor(W / 2), cy = py + Math.floor(H / 2);
      var rx = Math.floor(W / 2) - 2, ry = Math.floor(H / 2) - 3;
      var cores = (o.var && o.var.cores) || [C.lilas, '#e6d6ff', C.rosa2, C.creme];
      elipse(ctx, cx, cy, rx + 1, ry + 1, K);
      cores.forEach(function (c, i) { elipse(ctx, cx, cy, Math.max(1, rx - i * 3), Math.max(1, ry - i * 3), c); });
      for (var a = 0; a < 8; a++) ret(ctx, Math.round(cx + Math.cos(a * Math.PI / 4) * (rx - 1)), Math.round(cy + Math.sin(a * Math.PI / 4) * (ry - 1)), 1, 1, C.branco);
    } });
  objeto('tapete-listrado', { w: 3, h: 1, solido: false, semSombra: true, plano: true,
    desenhar: function (ctx, px, py, o) {
      var W = larg(o), H = (o.h || 1) * T, cores = (o.var && o.var.cores) || [C.azul2, C.creme, C.agua, C.creme];
      var x = px + 2, y = py + 2, w = W - 4, h = H - 4;
      contornoRet(ctx, x, y, w, h, cores[0]);
      for (var i = x + 1, k = 0; i < x + w - 1; i += 3, k++) ret(ctx, i, y + 1, Math.min(3, x + w - 1 - i), h - 2, cores[k % cores.length]);
      ret(ctx, x + 1, y + 1, w - 2, 1, 'rgba(255,255,255,0.35)');
      for (var f = x + 1; f < x + w - 1; f += 2) { ret(ctx, f, y - 1, 1, 1, C.creme2); ret(ctx, f, y + h, 1, 1, C.creme2); }
    } });
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
      var cx = px + 8, c = cor(o, 'cor', '#5f8bd6');
      ret(ctx, cx - 3, py - 8, 7, 3, K); ret(ctx, cx - 2, py - 7, 5, 1, clarear(c, 0.4));
      elipse(ctx, cx, py + 5, 7, 9, K); elipse(ctx, cx, py + 5, 6, 8, c);
      ret(ctx, cx - 2, py - 5, 5, 2, c);
      ret(ctx, cx - 6, py + 3, 13, 2, C.branco); ret(ctx, cx - 5, py + 7, 11, 1, clarear(c, 0.55));
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
  objeto('papeis', { w: 1, h: 1, solido: false, semSombra: true, plano: true,
    desenhar: function (ctx, px, py, o) {
      [[2, 3, 7, 6], [7, 7, 7, 6], [3, 9, 6, 5]].forEach(function (f, i) {
        ret(ctx, px + f[0] - 1, py + f[1] - 1, f[2] + 2, f[3] + 2, 'rgba(58,36,70,0.35)');
        ret(ctx, px + f[0], py + f[1], f[2], f[3], i === 1 ? '#fff6d8' : C.branco);
        ret(ctx, px + f[0] + 1, py + f[1] + 1, f[2] - 2, 1, '#c4b4d4');
        ret(ctx, px + f[0] + 1, py + f[1] + 3, f[2] - 3, 1, '#c4b4d4');
      });
      ret(ctx, px + 9, py + 9, 1, 1, C.rosa); ret(ctx, px + 11, py + 9, 1, 1, C.rosa); ret(ctx, px + 10, py + 10, 1, 1, C.rosa);
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
  objeto('cesto', { w: 1, h: 1, topo: 2, solido: true,
    desenhar: function (ctx, px, py, o) {
      var c = cor(o, 'cor', '#e7b870');
      circulo(ctx, px + 5, py + 5, 3, K); circulo(ctx, px + 5, py + 5, 2, C.rosa);
      circulo(ctx, px + 10, py + 4, 3, K); circulo(ctx, px + 10, py + 4, 2, C.azul2);
      ret(ctx, px + 4, py + 4, 2, 1, C.branco); ret(ctx, px + 9, py + 3, 2, 1, C.branco);
      ret(ctx, px + 12, py + 6, 1, 4, C.azul2);
      ret(ctx, px + 1, py + 6, 14, 9, K); ret(ctx, px + 2, py + 7, 12, 7, c);
      for (var j = 0; j < 3; j++) for (var i = 0; i < 6; i++) ret(ctx, px + 2 + i * 2 + (j % 2), py + 8 + j * 2, 1, 1, escurecer(c, 0.2));
      ret(ctx, px + 1, py + 6, 14, 1, escurecer(c, 0.35));
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

  /* ================= GRADE (pura: sem DOM) ================= */
  function libDe(o) { return OBJETOS[o.tipo] || {}; }
  function dimensoes(o) {
    var lib = libDe(o);
    return { w: o.w || lib.w || 1, h: o.h || lib.h || 1, topo: o.topo !== undefined ? o.topo : (lib.topo || 0) };
  }
  function solidoDe(o) {
    var lib = libDe(o);
    var s = o.solido !== undefined ? o.solido : (lib.solido !== undefined ? lib.solido : 'base');
    return s;
  }
  function ehParede(o) { return o.parede !== undefined ? !!o.parede : !!libDe(o).parede; }
  function ehAlto(o) { return o.alto !== undefined ? !!o.alto : !!libDe(o).alto; }
  function interativo(o) { return !!(o.fala || o.acao); }
  function noRect(x, y, r) { return x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h; }

  function grade(def) {
    var W = def.tamanho.w, H = def.tamanho.h;
    function matriz2(v) { var m = []; for (var y = 0; y < H; y++) { m.push([]); for (var x = 0; x < W; x++) m[y].push(v); } return m; }
    var g = { w: W, h: H, solido: matriz2(true), chao: matriz2(false), comodo: matriz2(null), parede: matriz2(false),
      porta: matriz2(false), ocupado: matriz2(null), objeto: matriz2(null) };
    function dentro(x, y) { return x >= 0 && y >= 0 && x < W && y < H; }
    g.dentro = dentro;
    (def.comodos || []).forEach(function (c) {
      var r = c.rect;
      for (var y = r.y; y < r.y + r.h; y++) for (var x = r.x; x < r.x + r.w; x++) {
        if (!dentro(x, y)) continue;
        g.comodo[y][x] = c.id;
        if (y < r.y + 2) { g.parede[y][x] = true; g.solido[y][x] = true; g.chao[y][x] = false; }
        else { g.chao[y][x] = true; g.solido[y][x] = false; }
      }
    });
    (def.portas || []).forEach(function (p) {
      for (var y = p.y; y < p.y + (p.h || 1); y++) for (var x = p.x; x < p.x + (p.w || 1); x++) {
        if (!dentro(x, y)) continue;
        g.porta[y][x] = true; g.solido[y][x] = false; g.chao[y][x] = true;
      }
    });
    (def.objetos || []).forEach(function (o, i) {
      var d = dimensoes(o), s = solidoDe(o), parede = ehParede(o);
      for (var y = o.y; y < o.y + d.h; y++) for (var x = o.x; x < o.x + d.w; x++) {
        if (!dentro(x, y)) continue;
        if (g.objeto[y][x] === null || !parede) g.objeto[y][x] = i;
        if (!parede && g.ocupado[y][x] === null) g.ocupado[y][x] = 'objeto';
        if (parede) continue;
        if (s === true || (s === 'base' && y === o.y + d.h - 1)) g.solido[y][x] = true;
      }
    });
    (def.npcs || []).forEach(function (n) { if (dentro(n.x, n.y)) { g.solido[n.y][n.x] = true; g.ocupado[n.y][n.x] = 'npc'; } });
    function andavel(p, marca) { if (p && dentro(p.x, p.y)) { g.solido[p.y][p.x] = false; if (marca) g.ocupado[p.y][p.x] = marca; } }
    andavel(def.saida, 'saida');
    andavel(def.spawn);
    (def.escadas || []).forEach(function (e) { andavel(e, 'escada'); });
    return g;
  }

  /* ================= CAMINHO (igual ao Mapa.caminho: 8 direções sem cortar quina) ================= */
  var VIZINHOS = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
    [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2]];
  function caminhoNa(g, a, b) {
    var W = g.w, H = g.h;
    function sol(x, y) { return x < 0 || y < 0 || x >= W || y >= H || g.solido[y][x]; }
    if (!a || !b || b.x < 0 || b.y < 0 || b.x >= W || b.y >= H) return null;
    var custo = {}, veio = {}, fechado = {};
    var ini = a.y * W + a.x, fim = b.y * W + b.x;
    custo[ini] = 0; veio[ini] = -1;
    var abertos = [ini];
    while (abertos.length) {
      var mi = 0;
      for (var i = 1; i < abertos.length; i++) if (custo[abertos[i]] < custo[abertos[mi]]) mi = i;
      var k = abertos[mi];
      abertos[mi] = abertos[abertos.length - 1]; abertos.pop();
      if (fechado[k]) continue;
      fechado[k] = true;
      if (k === fim) break;
      var cx = k % W, cy = Math.floor(k / W);
      for (var v = 0; v < 8; v++) {
        var d = VIZINHOS[v], nx = cx + d[0], ny = cy + d[1];
        if (sol(nx, ny)) continue;
        if (d[0] && d[1] && (sol(nx, cy) || sol(cx, ny))) continue;
        var nk = ny * W + nx, c = custo[k] + d[2];
        if (fechado[nk] || (nk in custo && custo[nk] <= c)) continue;
        custo[nk] = c; veio[nk] = k;
        abertos.push(nk);
      }
    }
    if (!fechado[fim]) return null;
    var cam = [], k2 = fim;
    while (veio[k2] !== -1) { cam.unshift({ x: k2 % W, y: Math.floor(k2 / W) }); k2 = veio[k2]; }
    cam.custo = custo[fim];
    return cam;
  }

  /* ================= DESENHO DO ESTÁTICO ================= */
  function paletaComodo(c) {
    var piso = PISOS[c.piso] || PISOS.taco, parede = PAREDES[c.parede] || PAREDES.papel;
    var p = Object.assign({ piso2: undefined }, parede.cores, piso.cores, c.paleta || {});
    if (!p.rodape) p.rodape = C.madeira;
    return { piso: piso, parede: parede, p: p };
  }
  function comodoPorId(def, id) { return (def.comodos || []).find(function (c) { return c.id === id; }); }
  // dono visual de um tile de porta/vão: o cômodo que o contém ou o primeiro vizinho
  function comodoDoTile(def, g, x, y) {
    if (g.dentro(x, y) && g.comodo[y][x]) return comodoPorId(def, g.comodo[y][x]);
    var viz = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (var i = 0; i < viz.length; i++) {
      var nx = x + viz[i][0], ny = y + viz[i][1];
      if (g.dentro(nx, ny) && g.comodo[ny][nx] && !g.parede[ny][nx]) return comodoPorId(def, g.comodo[ny][nx]);
    }
    return (def.comodos || [])[0];
  }

  function desenharEscada(ctx, g, e) {
    var px = e.x * T, py = e.y * T;
    if (e.sentido !== 'desce') {
      // sobe: degraus que entram por um arco na parede do fundo (ou só no tile, longe da parede)
      var subeParede = g.dentro(e.x, e.y - 1) && g.parede[e.y - 1][e.x];
      var topo = subeParede ? py - 26 : py - 6;
      ret(ctx, px, topo, 16, py + 16 - topo, K);
      ret(ctx, px + 1, topo + 1, 14, 10, '#4a3358');
      elipse(ctx, px + 8, topo + 2, 6, 3, '#5d4470');
      var y = py + 15, n = 0;
      while (y > topo + 6) {
        var frac = Math.min(1, (py + 15 - y) / (py + 15 - topo));
        var tread = misturar('#f8dcae', '#a07a8a', frac * 0.9), riser = escurecer(tread, 0.28);
        var enc = Math.round(frac * 2);
        ret(ctx, px + 2 + enc, y - 1, 12 - enc * 2, 1, riser);
        ret(ctx, px + 2 + enc, y - 3, 12 - enc * 2, 2, tread);
        ret(ctx, px + 2 + enc, y - 3, 12 - enc * 2, 1, clarear(tread, 0.35));
        y -= 3; n++;
      }
      // laterais (corrimão) com a pontinha dourada
      ret(ctx, px, topo + 8, 2, py + 8 - topo, C.madeira); ret(ctx, px + 14, topo + 8, 2, py + 8 - topo, C.madeira);
      ret(ctx, px, topo + 8, 1, py + 8 - topo, C.madeiraClara); ret(ctx, px + 15, topo + 8, 1, py + 8 - topo, C.madeira3);
      ret(ctx, px - 1, py + 12, 3, 4, K); ret(ctx, px + 14, py + 12, 3, 4, K);
      ret(ctx, px, py + 12, 1, 3, C.ouro); ret(ctx, px + 15, py + 12, 1, 3, C.ouro);
    } else {
      // desce: um vão no chão com degraus que somem no escuro e grades dos dois lados
      ret(ctx, px, py, 16, 16, K);
      for (var k = 0; k < 5; k++) {
        var c = misturar('#f8dcae', '#3a2446', k * 0.2);
        ret(ctx, px + 3, py + 1 + k * 3, 10, 3, c);
        ret(ctx, px + 3, py + 1 + k * 3, 10, 1, clarear(c, 0.3));
      }
      [px, px + 13].forEach(function (x) {
        ret(ctx, x, py - 4, 3, 20, K);
        ret(ctx, x + 1, py - 3, 1, 18, C.madeira);
        ret(ctx, x, py - 5, 3, 2, C.ouro); ret(ctx, x + 1, py - 5, 1, 1, C.ouro3);
      });
      ret(ctx, px + 3, py, 10, 1, C.madeiraClara);
    }
  }
  function desenharSaida(ctx, g, s) {
    var px = s.x * T, py = s.y * T;
    // vão da porta no lábio de baixo, com a luz de fora
    if (g.dentro(s.x, s.y + 1) || true) {
      ret(ctx, px + 1, py + 16, 14, 5, '#fff4c8');
      ret(ctx, px + 1, py + 19, 14, 2, '#c6e15a');
      ret(ctx, px - 1, py + 14, 3, 8, K); ret(ctx, px + 14, py + 14, 3, 8, K);
      ret(ctx, px, py + 14, 1, 7, C.madeiraClara); ret(ctx, px + 15, py + 14, 1, 7, C.madeiraClara);
    }
    // capacho
    ret(ctx, px + 1, py + 2, 14, 13, K);
    ret(ctx, px + 2, py + 3, 12, 11, '#e0506a');
    ret(ctx, px + 3, py + 4, 10, 9, '#ff7a8a');
    for (var i = 0; i < 5; i++) ret(ctx, px + 3 + i * 2, py + 4, 1, 9, '#f06a7c');
    for (var f = px + 2; f < px + 14; f += 2) { ret(ctx, f, py + 1, 1, 1, '#ffd0d8'); ret(ctx, f, py + 15, 1, 1, '#ffd0d8'); }
    // luz entrando
    for (var j = 0; j < 7; j++) ret(ctx, px + 2 + (j >> 1), py + 14 - j * 2, 12 - (j >> 1) * 2, 2, 'rgba(255,244,200,' + (0.28 - j * 0.035).toFixed(3) + ')');
  }
  function setaSaida(ctx, s, t, animar) {
    var px = s.x * T, py = s.y * T, d = animar ? Math.round((Math.sin(t / 260) + 1) * 1) : 1;
    matriz(ctx, px + 4, py + 3 + d, ['..kkkk..', '..kwwk..', '..kwwk..', 'kkkwwkkk', 'kwwwwwwk', '.kwwwwk.', '..kwwk..', '...kk...'], { k: K, w: '#fff3a0' });
  }
  function setaEscada(ctx, e, t, animar) {
    var px = e.x * T, py = e.y * T, d = animar ? Math.round((Math.sin(t / 300) + 1) * 1) : 1;
    var cima = e.sentido !== 'desce';
    var linhas = ['...kk...', '..kwwk..', '.kwwwwk.', 'kwwwwwwk', 'kkkwwkkk', '..kwwk..', '..kwwk..', '..kkkk..'];
    if (!cima) linhas = linhas.slice().reverse();
    matriz(ctx, px + 4, py + 4 + (cima ? -d : d), linhas, { k: K, w: C.ouro });
  }

  function desenharEstatico(ctx, def, g, P, objs) {
    var W = g.w, H = g.h;
    ctx.clearRect(0, 0, W * T, H * T);
    ret(ctx, 0, 0, W * T, H * T, FUNDO);
    var pal = {};
    (def.comodos || []).forEach(function (c) { pal[c.id] = paletaComodo(c); });
    function palTile(x, y) { var c = comodoDoTile(def, g, x, y); return c ? pal[c.id] : paletaComodo({}); }
    function vazio(x, y) { return !g.dentro(x, y) || (!g.comodo[y][x] && !g.porta[y][x]); }
    function ehParedeSolida(x, y) { return g.dentro(x, y) && g.parede[y][x] && !g.porta[y][x]; }
    // paredes do fundo
    (def.comodos || []).forEach(function (c) {
      var r = c.rect, pc = pal[c.id];
      for (var x = r.x; x < r.x + r.w; x++) pc.parede.desenhar(ctx, x * T, r.y * T, x, pc.p);
    });
    // pisos (inclui os vãos das portas)
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      if (!g.chao[y][x]) continue;
      var pt = palTile(x, y);
      pt.piso.desenhar(ctx, x * T, y * T, x, y, pt.p);
    }
    // sombra da parede no chão e dos lábios laterais
    for (var y2 = 0; y2 < H; y2++) for (var x2 = 0; x2 < W; x2++) {
      if (!g.chao[y2][x2]) continue;
      var px = x2 * T, py = y2 * T;
      if (ehParedeSolida(x2, y2 - 1)) { ret(ctx, px, py, 16, 2, 'rgba(58,36,70,0.22)'); ret(ctx, px, py + 2, 16, 2, 'rgba(58,36,70,0.09)'); }
      if (vazio(x2 - 1, y2) || ehParedeSolida(x2 - 1, y2)) ret(ctx, px, py, 2, 16, 'rgba(58,36,70,0.14)');
      // batente das portas que atravessam a parede
      if (g.porta[y2][x2] && g.parede[y2][x2]) {
        var pp = palTile(x2, y2).p;
        if (ehParedeSolida(x2 - 1, y2)) { ret(ctx, px, py, 3, 16, K); ret(ctx, px, py, 2, 16, escurecer(pp.parede, 0.25)); ret(ctx, px + 1, py, 1, 16, C.madeiraClara); }
        if (ehParedeSolida(x2 + 1, y2)) { ret(ctx, px + 13, py, 3, 16, K); ret(ctx, px + 14, py, 2, 16, escurecer(pp.parede, 0.25)); ret(ctx, px + 14, py, 1, 16, C.madeiraClara); }
      }
    }
    // lábios: a espessura das paredes vista de cima, no vão escuro em volta dos cômodos
    var saida = def.saida;
    for (var y3 = -1; y3 <= H; y3++) for (var x3 = -1; x3 <= W; x3++) {
      if (!vazio(x3, y3)) continue;
      var bx = x3 * T, by = y3 * T;
      var cima = !vazio(x3, y3 - 1), baixo = !vazio(x3, y3 + 1), esq = !vazio(x3 - 1, y3), dir = !vazio(x3 + 1, y3);
      if (cima && !(saida && saida.x === x3 && saida.y === y3 - 1)) { ret(ctx, bx, by, 16, 1, C.labioLuz); ret(ctx, bx, by + 1, 16, 3, C.labio); ret(ctx, bx, by + 4, 16, 1, K); }
      if (baixo) { ret(ctx, bx, by + 11, 16, 1, K); ret(ctx, bx, by + 12, 16, 3, C.labio); ret(ctx, bx, by + 15, 16, 1, C.labioLuz); }
      if (esq) { ret(ctx, bx, by, 1, 16, C.labioLuz); ret(ctx, bx + 1, by, 3, 16, C.labio); ret(ctx, bx + 4, by, 1, 16, K); }
      if (dir) { ret(ctx, bx + 11, by, 1, 16, K); ret(ctx, bx + 12, by, 3, 16, C.labio); ret(ctx, bx + 15, by, 1, 16, C.labioLuz); }
      // cantos
      if (!cima && !esq && !vazio(x3 - 1, y3 - 1)) ret(ctx, bx, by, 4, 4, C.labio);
      if (!cima && !dir && !vazio(x3 + 1, y3 - 1)) ret(ctx, bx + 12, by, 4, 4, C.labio);
      if (!baixo && !esq && !vazio(x3 - 1, y3 + 1)) ret(ctx, bx, by + 12, 4, 4, C.labio);
      if (!baixo && !dir && !vazio(x3 + 1, y3 + 1)) ret(ctx, bx + 12, by + 12, 4, 4, C.labio);
      if (cima && esq) ret(ctx, bx, by, 4, 4, C.labio);
      if (cima && dir) ret(ctx, bx + 12, by, 4, 4, C.labio);
      if (baixo && esq) ret(ctx, bx, by + 12, 4, 4, C.labio);
      if (baixo && dir) ret(ctx, bx + 12, by + 12, 4, 4, C.labio);
    }
    // escadas e saída
    (def.escadas || []).forEach(function (e) { desenharEscada(ctx, g, e); });
    if (saida) desenharSaida(ctx, g, saida);
    // luz das janelas no chão
    objs.forEach(function (it) { if (it.lib.luz) it.lib.luz(ctx, it.px, it.py, it.o); });
    // sombras automáticas sob os móveis
    objs.forEach(function (it) {
      if (it.parede || it.lib.semSombra || it.lib.plano) return;
      var cx = it.px + it.W / 2, by2 = it.py + it.H - 2;
      elipse(ctx, Math.round(cx), by2, Math.max(3, Math.round(it.W * 0.42)), 3, 'rgba(58,36,70,0.13)');
      elipse(ctx, Math.round(cx), by2, Math.max(2, Math.round(it.W * 0.32)), 1, 'rgba(58,36,70,0.14)');
    });
    // móveis e enfeites (os altos viram sprites desenhados na ordem por Y)
    objs.filter(function (it) { return !it.alto; })
      .sort(function (a, b) { return (a.ordem - b.ordem) || (a.base - b.base) || (a.px - b.px); })
      .forEach(function (it) { it.lib.desenhar && it.lib.desenhar(ctx, it.px, it.py, it.o, P); });
  }

  /* ================= CENA ================= */
  var cenas = {};
  function progresso() {
    var P = R.Progresso;
    try { return P && P.estado && P.estado() ? P : null; } catch (e) { return null; }
  }
  function sinal(v) { return v > 0 ? 1 : v < 0 ? -1 : 0; }
  function direcao4(o) {
    if (!o) return { x: 0, y: -1 };
    if (Math.abs(o.x) >= Math.abs(o.y) && o.x) return { x: sinal(o.x), y: 0 };
    return { x: 0, y: sinal(o.y) || -1 };
  }
  function naTela(pintor, x, y) {
    if (pintor.tela) return pintor.tela(x, y);
    var c = pintor.cam || { x: 0, y: 0 };
    return { x: Math.round((x - c.x) * pintor.escala), y: Math.round((y - c.y) * pintor.escala) };
  }
  var FONTE_PIXEL = '"Press Start 2P", "Trebuchet MS", sans-serif';

  // retângulos do HUD em px do canvas (poucos getBoundingClientRect por quadro, como as placas do mapa)
  function retangulosHud(canvas, dpr) {
    if (typeof document === 'undefined' || !canvas || !canvas.getBoundingClientRect) return [];
    var c = canvas.getBoundingClientRect();
    if (!c.width) return [];
    var k = canvas.width / c.width || dpr;
    return Array.prototype.map.call(document.querySelectorAll('#hud > *:not(.hud-topo), #hud .hud-topo > * > *'), function (e) {
      var r = e.getBoundingClientRect();
      return { left: (r.left - c.left) * k, right: (r.right - c.left) * k, top: (r.top - c.top) * k, bottom: (r.bottom - c.top) * k };
    }).filter(function (r) { return r.right > r.left && r.bottom > r.top; });
  }
  // posição mais próxima da original em que a placa (com a borda e uma folga) não cruza o HUD
  function desviarDoHud(hud, sx, sy, sw, sh, borda, cw, ch, xMin, xMax) {
    if (!hud.length) return { x: sx, y: sy };
    var folga = borda * 2;
    function cruza(x, y) {
      for (var i = 0; i < hud.length; i++) {
        var r = hud[i];
        if (x - folga < r.right && x + sw + folga > r.left && y - folga < r.bottom && y + sh + folga > r.top) return true;
      }
      return false;
    }
    var lo = Math.max(folga, xMin === undefined ? -1e9 : xMin), hi = Math.min(cw - sw - folga, xMax === undefined ? 1e9 : xMax - sw);
    function dentroX(x) { return hi >= lo ? Math.max(lo, Math.min(x, hi)) : Math.max(folga, Math.min(x, cw - sw - folga)); }
    if (!cruza(sx, sy)) return { x: sx, y: sy };
    var cands = [];
    var ys = [sy], xs = [sx];
    hud.forEach(function (r) {
      ys.push(Math.round(r.bottom + folga * 2));
      xs.push(Math.round(r.right + folga * 2), Math.round(r.left - sw - folga * 2));
    });
    ys.forEach(function (y) { xs.forEach(function (x) { cands.push({ x: dentroX(x), y: y }); }); });
    var melhor = null, custo = Infinity;
    cands.forEach(function (p) {
      if (p.y < sy || p.y + sh > ch || cruza(p.x, p.y)) return;
      // descer é o preferido; andar de lado pesa um pouco mais
      var k = (p.y - sy) + Math.abs(p.x - sx) * 1.3;
      if (k < custo) { custo = k; melhor = p; }
    });
    if (melhor) return melhor;
    var fundo = sy;
    hud.forEach(function (r) { fundo = Math.max(fundo, Math.round(r.bottom + folga * 2)); });
    return { x: dentroX(sx), y: fundo };
  }

  function criarCena(def) {
    var g = grade(def);
    var npcs = def.npcs || [];
    var objs = (def.objetos || []).map(function (o, i) {
      var lib = libDe(o), d = dimensoes(o);
      // cópia com a pegada resolvida (o desenho usa w/h da biblioteca quando o dado não traz)
      o = Object.assign({}, o, { w: d.w, h: d.h });
      var it = { i: i, o: o, lib: lib, w: d.w, h: d.h, topo: d.topo, W: d.w * T, H: d.h * T, px: o.x * T, py: o.y * T,
        parede: ehParede(o), alto: ehAlto(o), interativo: interativo(o), sprite: null };
      it.base = it.py + it.H;
      it.ordem = it.parede ? 0 : lib.plano ? 1 : 2;
      return it;
    });
    var altos = objs.filter(function (it) { return it.alto; });
    var animados = objs.filter(function (it) { return it.lib.anim && !it.alto; });
    var estatico = null, chaveFeita = null, sujo = true;
    var pintorAtual = null, tAtual = 0, animarAtual = false;

    function chaveEstado() {
      var P = progresso();
      return objs.filter(function (it) { return it.lib.chave; }).map(function (it) {
        try { return it.lib.chave(P, it.o); } catch (e) { return '?'; }
      }).join('|');
    }
    function renderizar() {
      var P = progresso();
      var chave = chaveEstado();
      if (estatico && chave === chaveFeita) { sujo = false; return; }
      if (!estatico) estatico = PA.novoCanvas(g.w * T, g.h * T);
      var ctx = estatico.getContext('2d');
      desenharEstatico(ctx, def, g, P, objs);
      // anims parados entram no estático só como base? não: são desenhados a cada quadro (ver desenharFundo)
      altos.forEach(function (it) {
        var w = it.W + 4, h = it.topo + it.H + 2;
        if (!it.sprite || it.sprite.width !== w || it.sprite.height !== h) it.sprite = PA.novoCanvas(w, h);
        var sc = it.sprite.getContext('2d');
        sc.clearRect(0, 0, w, h);
        sc.save(); sc.translate(2 - it.px, it.topo - it.py);
        it.lib.desenhar && it.lib.desenhar(sc, it.px, it.py, it.o, P);
        sc.restore();
      });
      chaveFeita = chave; sujo = false;
    }
    function marcarSujo() { sujo = true; }
    if (R.util && R.util.on) { R.util.on('progresso', marcarSujo); R.util.on('progressoRemoto', marcarSujo); R.util.on('mapaMudou', marcarSujo); }

    // contexto falso para as animações dos móveis altos: desenha com o pintor, em px da tela
    var ctxPintor = { fillStyle: '#000', fillRect: function (x, y, w, h) { pintorAtual.ret(x, y, w, h, this.fillStyle); } };

    function npcEm(x, y) { for (var i = 0; i < npcs.length; i++) if (npcs[i].x === x && npcs[i].y === y) return npcs[i]; return null; }
    function objetoInterativoEm(x, y) {
      for (var i = 0; i < objs.length; i++) {
        var it = objs[i];
        if (!it.interativo) continue;
        if (x >= it.o.x && x < it.o.x + it.w && y >= it.o.y && y < it.o.y + it.h) return it;
      }
      return null;
    }
    function gatilhoEm(x, y) {
      if (def.saida && def.saida.x === x && def.saida.y === y) return { id: 'saida:' + def.id, tipo: 'saida', x: x, y: y };
      var esc = def.escadas || [];
      for (var i = 0; i < esc.length; i++) {
        var e = esc[i];
        if (e.x === x && e.y === y) return { id: 'escada:' + def.id + ':' + i, tipo: 'escada', x: x, y: y, para: e.para, chegada: e.chegada, olhar: e.olhar || { x: 0, y: 1 } };
      }
      return null;
    }
    function ondeEsta() {
      var J = window.Jogador;
      try { if (J && J.tile) { var t = J.tile(); if (t && g.dentro(t.x, t.y)) return t; } } catch (e) {}
      return def.spawn || { x: 0, y: 0 };
    }
    // vizinho livre (4 vizinhos) de um conjunto de tiles, alcançável e mais perto da Mariana
    function melhorVizinho(tiles, alvoCentro) {
      var de = ondeEsta(), cand = [], vistos = {};
      tiles.forEach(function (t) {
        [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(function (d) {
          var nx = t.x + d[0], ny = t.y + d[1], k = nx + ',' + ny;
          if (vistos[k] || !g.dentro(nx, ny) || g.solido[ny][nx]) return;
          if (tiles.some(function (o) { return o.x === nx && o.y === ny; }) && g.solido[t.y][t.x]) return;
          vistos[k] = true;
          cand.push({ x: nx, y: ny, olhar: { x: -d[0], y: -d[1] } });
        });
        if (!g.solido[t.y][t.x]) { var k2 = t.x + ',' + t.y; if (!vistos[k2]) { vistos[k2] = true; cand.push({ x: t.x, y: t.y, olhar: { x: 0, y: -1 } }); } }
      });
      var melhor = null, custo = Infinity;
      cand.forEach(function (c) {
        var cam = caminhoNa(g, de, c);
        var k = cam ? (cam.custo || 0) : 1e6 + Math.abs(c.x - de.x) + Math.abs(c.y - de.y);
        if (k < custo) { custo = k; melhor = c; }
      });
      return melhor;
    }
    function tilesDoObjeto(it) {
      var ts = [];
      for (var y = it.o.y; y < it.o.y + it.h; y++) for (var x = it.o.x; x < it.o.x + it.w; x++) ts.push({ x: x, y: y });
      if (it.parede) {
        // enfeite na parede: ela para no chão logo abaixo
        var baixo = it.o.y + it.h;
        return ts.filter(function (t) { return t.y === baixo - 1; });
      }
      return ts;
    }
    var retratos = {};
    function retratoObjeto(it) {
      if (retratos[it.i]) return retratos[it.i];
      if (!window.PA) return null;
      var topoParede = it.parede ? 6 : 0;
      var w = it.W + 2, h = it.topo + it.H - topoParede + 2;
      var c = PA.novoCanvas(w, h), cx = c.getContext('2d');
      cx.save(); cx.translate(1 - it.px, 1 + it.topo - it.py - topoParede);
      if (it.parede) {
        // fundo de parede para o enfeite não ficar solto
        var com = comodoDoTile(def, g, it.o.x, it.o.y + it.h), pc = paletaComodo(com || {});
        for (var x = it.o.x; x < it.o.x + it.w; x++) pc.parede.desenhar(cx, x * T, it.py, x, pc.p);
      }
      it.lib.desenhar && it.lib.desenhar(cx, it.px, it.py, it.o, progresso());
      if (it.lib.anim) it.lib.anim(cx, it.px, it.py, 0, it.o);
      cx.restore();
      retratos[it.i] = c;
      return c;
    }
    function falarObjeto(it) {
      var o = it.o, Cl = R.Claude;
      var p = Promise.resolve();
      if (o.fala && Cl && Cl.falar) {
        // a fala pode ser uma lista de páginas curtas (cada uma cabe em 2 linhas no celular)
        var quem = { nome: o.nome || '', retrato: retratoObjeto(it), voz: o.voz || 'narradora' };
        var pags = [].concat(o.fala);
        pags.forEach(function (pg, i) {
          var ultima = i === pags.length - 1;
          p = p.then(function (v) {
            if (v === null) return null;
            // botões em todas as páginas: mesmo tamanho de letra dos balões dos personagens
            return Cl.falar(pg, { quem: quem, modal: true, voz: quem.voz,
              botoes: [ultima ? { texto: 'Ok! 👍', valor: 'ok', principal: true } : { texto: 'Continuar →', valor: 'mais', principal: true }] });
          });
        });
      }
      if (o.acao) p = p.then(function (v) { if (v === null) return null; return executarAcao(o.acao, { interior: def, cena: cena, objeto: o }); });
      return p;
    }
    function executarAcao(acao, ctx) {
      if (R.NPCs && R.NPCs.executar) return R.NPCs.executar(acao, ctx);
      var UI = R.UI, P = R.Progresso;
      if (!UI || acao.tipo !== 'tela') return Promise.resolve();
      var m = acao.materia ? R.materia(acao.materia) : R.materias && R.materias[0];
      var mapa = { bau: 'telaBau', loja: 'telaLoja', estabulo: 'telaEstabulo', plano: 'telaPlano' };
      if (mapa[acao.tela] && UI[mapa[acao.tela]]) UI[mapa[acao.tela]]();
      else if (acao.tela === 'livro' && UI.abrirLivro) UI.abrirLivro(m);
      else if (acao.tela === 'ovos' && UI.chocarOvos && P) UI.chocarOvos(P.ovosParaChocar());
      return Promise.resolve();
    }
    function falarNpc(npc) {
      if (R.NPCs && R.NPCs.interagir) return R.NPCs.interagir(npc, { interior: def, cena: cena });
      var Cl = R.Claude, oi = (npc.falas && npc.falas.oi && npc.falas.oi[0]) || 'Oi!';
      var p = Cl && Cl.falar ? Cl.falar(oi, { quem: { nome: npc.nome, voz: npc.voz }, modal: true }) : Promise.resolve();
      return p.then(function (v) { if (v !== null && npc.acao && npc.acao.tipo === 'tela') return executarAcao(npc.acao, {}); });
    }
    function alvoNpc(npc, tileFixo, olharFixo) {
      var v = tileFixo ? { x: tileFixo.x, y: tileFixo.y, olhar: olharFixo } : melhorVizinho([{ x: npc.x, y: npc.y }]);
      if (!v) return null;
      return { tipo: 'npc', id: npc.id, npc: npc, tile: { x: v.x, y: v.y }, olhar: v.olhar, agir: function () { return falarNpc(npc); } };
    }
    function alvoObjeto(it, tileFixo, olharFixo) {
      var v = tileFixo ? { x: tileFixo.x, y: tileFixo.y, olhar: olharFixo } : melhorVizinho(tilesDoObjeto(it));
      if (!v) return null;
      return { tipo: 'objeto', id: def.id + ':' + it.i, objeto: it.o, tile: { x: v.x, y: v.y }, olhar: v.olhar, agir: function () { return falarObjeto(it); } };
    }
    function alvoGatilho(gt) {
      if (gt.tipo === 'saida') return { tipo: 'saida', id: gt.id, gatilho: gt, tile: { x: gt.x, y: gt.y }, olhar: { x: 0, y: 1 },
        agir: function () { return R.Cena && R.Cena.sair ? R.Cena.sair() : Promise.resolve(); } };
      return { tipo: 'escada', id: gt.id, gatilho: gt, tile: { x: gt.x, y: gt.y }, olhar: { x: 0, y: -1 },
        agir: function () { return R.Cena && R.Cena.irPara ? R.Cena.irPara(gt.para, gt.chegada, gt.olhar) : Promise.resolve(); } };
    }

    var cena = {
      id: def.id, tipo: 'interior', lugarId: def.lugar, nome: def.nome, def: def, corFundo: FUNDO,
      spawn: def.spawn, grade: g,
      largura: function () { return g.w * T; },
      altura: function () { return g.h * T; },
      solido: function (tx, ty) { return !g.dentro(tx, ty) || g.solido[ty][tx]; },
      portaEm: function () { return null; },
      saidaEm: function (tx, ty) { return gatilhoEm(tx, ty); },
      caminho: function (a, b) { var c = caminhoNa(g, a, b); if (c) delete c.custo; return c; },
      maisPerto: function (x, y, de) {
        var melhor = null, dist = 1e9;
        de = de || { x: x, y: y };
        for (var r = 0; r <= 3; r++) for (var j = -r; j <= r; j++) for (var i = -r; i <= r; i++) {
          var nx = x + i, ny = y + j;
          if (!g.dentro(nx, ny) || g.solido[ny][nx]) continue;
          var d = Math.abs(nx - de.x) + Math.abs(ny - de.y) + (Math.abs(i) + Math.abs(j)) * 3;
          if (d < dist) { dist = d; melhor = { x: nx, y: ny }; }
        }
        return melhor;
      },
      npcs: function () { return npcs; },
      objetosInterativos: function () { return objs.filter(function (it) { return it.interativo; }).map(function (it) { return it.o; }); },
      // toque em px do jogo: NPC (sprite ~16×24 acima do tile), objeto interativo, tapete/escada
      alvoEm: function (wx, wy) {
        var achados = npcs.filter(function (n) {
          return wx >= n.x * T - 1 && wx < n.x * T + 17 && wy >= n.y * T - 14 && wy < n.y * T + 16;
        }).sort(function (a, b) { return b.y - a.y; });
        if (achados.length) return alvoNpc(achados[0]);
        var its = objs.filter(function (it) {
          if (!it.interativo) return false;
          var topo = it.parede ? 0 : it.topo;
          return wx >= it.px && wx < it.px + it.W && wy >= it.py - topo && wy < it.py + it.H;
        }).sort(function (a, b) { return b.base - a.base; });
        if (its.length) return alvoObjeto(its[0]);
        var tx = Math.floor(wx / T), ty = Math.floor(wy / T);
        var gt = gatilhoEm(tx, ty);
        return gt ? alvoGatilho(gt) : null;
      },
      // Enter/Espaço: gatilho no tile; senão NPC/objeto vizinho, preferindo o da direção do olhar
      alvoPerto: function (tile, olhar) {
        if (!tile) return null;
        var gt = gatilhoEm(tile.x, tile.y);
        if (gt) return alvoGatilho(gt);
        var d0 = direcao4(olhar);
        var dirs = [d0, { x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }]
          .filter(function (d, i, a) { return a.findIndex(function (e) { return e.x === d.x && e.y === d.y; }) === i; });
        for (var i = 0; i < dirs.length; i++) {
          var nx = tile.x + dirs[i].x, ny = tile.y + dirs[i].y;
          var n = npcEm(nx, ny);
          if (n) return alvoNpc(n, tile, dirs[i]);
          var it = objetoInterativoEm(nx, ny);
          if (it) return alvoObjeto(it, tile, dirs[i]);
        }
        var aqui = objetoInterativoEm(tile.x, tile.y);
        return aqui ? alvoObjeto(aqui, tile, d0) : null;
      },
      preparar: function () {
        try {
          if (sujo || !estatico) renderizar();
          aquecerNpcs(npcs);
        } catch (e) { return Promise.reject(e); }
        return Promise.resolve();
      },
      desenharFundo: function (bctx, t, animar) {
        if (!estatico || sujo) renderizar();
        bctx.drawImage(estatico, 0, 0);
        var tt = animar ? t : 0;
        for (var i = 0; i < animados.length; i++) { var it = animados[i]; it.lib.anim(bctx, it.px, it.py, tt, it.o); }
        if (def.saida) setaSaida(bctx, def.saida, t, animar);
        var esc = def.escadas || [];
        for (var k = 0; k < esc.length; k++) setaEscada(bctx, esc[k], t, animar);
      },
      // placas dos cômodos, em px da tela, com a fonte pixel
      desenharTela: function (ctx, pintor, t, animar) {
        var escala = pintor.escala || 3;
        var fonte = 8 * Math.max(2, Math.round(escala / 2));
        var k = fonte / 16;
        function px(v) { return Math.max(1, Math.round(v * k)); }
        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = fonte + 'px ' + FONTE_PIXEL;
        var hud = retangulosHud(ctx.canvas, pintor.dpr || 1);
        (def.comodos || []).forEach(function (c) {
          if (!c.placa) return;
          var r = c.rect;
          var largMax = (r.w * T - 6) * escala;
          var pad = px(10), topo = px(5), lh = px(20), borda = px(3);
          var linhas = [c.placa];
          if (ctx.measureText(c.placa).width + pad * 2 > largMax) {
            // quebra em duas linhas equilibradas
            var pal = c.placa.split(' '), melhor = null;
            for (var q = 1; q < pal.length; q++) {
              var a = pal.slice(0, q).join(' '), b = pal.slice(q).join(' ');
              var m = Math.max(ctx.measureText(a).width, ctx.measureText(b).width);
              if (!melhor || m < melhor.m) melhor = { m: m, l: [a, b] };
            }
            if (melhor) linhas = melhor.l;
          }
          var largura = 0;
          linhas.forEach(function (l) { largura = Math.max(largura, ctx.measureText(l).width); });
          var sw = Math.ceil(largura + pad * 2), sh = topo * 2 + lh * linhas.length;
          var meioX = (r.x + r.w / 2) * T, p0 = naTela(pintor, meioX, r.y * T + 2);
          var sx = Math.round(p0.x - sw / 2), sy = Math.round(p0.y);
          var cw = ctx.canvas.width, ch = ctx.canvas.height;
          if (sx > cw || sy > ch || sx + sw < 0 || sy + sh < 0) return;
          // placa atrás do HUD (chips, botão ↙, montaria): desce para logo abaixo dele ou vai para o lado
          var esq = naTela(pintor, r.x * T, 0).x, dir = naTela(pintor, (r.x + r.w) * T, 0).x;
          var livre = desviarDoHud(hud, sx, sy, sw, sh, borda, cw, ch, esq + borda, dir - borda);
          if (livre.x !== sx || livre.y !== sy) {
            // desviada, a placa não pode invadir outro cômodo: se o dela está quase fora da tela, some
            if (livre.x < esq - borda || livre.x + sw > dir + borda) return;
          }
          sx = livre.x; sy = livre.y;
          ctx.fillStyle = K;
          ctx.fillRect(sx - borda, sy - borda, sw + borda * 2, sh + borda * 2);
          ctx.fillStyle = '#fff8ee';
          ctx.fillRect(sx, sy, sw, sh);
          ctx.fillStyle = '#f3e6c8';
          ctx.fillRect(sx, sy + sh - borda, sw, borda);
          ctx.fillStyle = '#ffd34d';
          ctx.fillRect(sx + px(4), sy + px(4), px(3), px(3));
          ctx.fillRect(sx + sw - px(7), sy + px(4), px(3), px(3));
          ctx.fillStyle = K;
          linhas.forEach(function (l, i) { ctx.fillText(l, Math.round(sx + sw / 2), sy + topo + lh * i + Math.round(lh / 2)); });
        });
        ctx.restore();
        ctx.imageSmoothingEnabled = false;
      },
      itensDesenho: function (pintor, t, animar) {
        pintorAtual = pintor; tAtual = animar ? t : 0; animarAtual = animar;
        if (!estatico || sujo) renderizar();
        return itens;
      },
      // para as ferramentas: objetos com a pegada já resolvida
      _objetos: objs,
      _renderizar: function () { sujo = true; renderizar(); return estatico; },
    };

    // itens por Y (montados uma vez; o pintor e o tempo entram por variável)
    var itens = [];
    npcs.forEach(function (n) {
      itens.push({ y: n.y * T + 12, npc: n, desenhar: function () { desenharNpc(pintorAtual, n, tAtual, animarAtual); } });
    });
    altos.forEach(function (it) {
      itens.push({ y: it.base - 1, objeto: it.o, desenhar: function () {
        if (!it.sprite) return;
        pintorAtual.sprite(it.sprite, it.px + it.W / 2, it.base + 2);
        if (it.lib.anim) it.lib.anim(ctxPintor, it.px, it.py, tAtual, it.o);
      } });
    });
    return cena;
  }

  // desenha cada NPC uma vez num pintor mudo (vários instantes, com e sem animação), para os
  // caches de sprites e ícones do Reino.NPCs ficarem prontos antes de a íris abrir
  var pintorMudo = null;
  function aquecerNpcs(npcs) {
    if (!R.NPCs || !R.NPCs.desenhar || !npcs.length) return;
    if (!pintorMudo) {
      var c = PA.novoCanvas(8, 8);
      pintorMudo = { ctx: c.getContext('2d'), escala: 3, dpr: 1, cam: { x: 0, y: 0 },
        tela: function (x, y) { return { x: x, y: y }; }, ret: function () {}, sprite: function () {} };
    }
    npcs.forEach(function (n) {
      try {
        if (R.NPCs.sprite) { R.NPCs.sprite(n, 0); R.NPCs.sprite(n, 1); }
        if (R.NPCs.retrato) { R.NPCs.retrato(n, 0); R.NPCs.retrato(n, 1); }
        for (var t = 0; t <= 6000; t += 50) R.NPCs.desenhar(pintorMudo, n, n.x * T + 8, n.y * T + 12, t, true);
        R.NPCs.desenhar(pintorMudo, n, n.x * T + 8, n.y * T + 12, 0, false);
      } catch (e) {}
    });
  }

  // NPC: o corpo vem do Reino.NPCs; sem ele, um bonequinho provisório
  function desenharNpc(p, n, t, animar) {
    var x = n.x * T + 8, y = n.y * T + 12;
    if (R.NPCs && R.NPCs.desenhar) { try { R.NPCs.desenhar(p, n, x, y, t, animar); return; } catch (e) { if (window.console) console.error(e); } }
    var s = n.sprite || {};
    var pula = animar ? Math.round(Math.abs(Math.sin(t / 500))) : 0;
    p.ret(x - 5, y - 1, 10, 2, 'rgba(58,36,70,0.25)');
    p.ret(x - 5, y - 13 - pula, 10, 12, K);
    p.ret(x - 4, y - 12 - pula, 8, 10, s.roupa || C.azul);
    p.ret(x - 5, y - 22 - pula, 10, 10, K);
    p.ret(x - 4, y - 21 - pula, 8, 8, s.pele || '#f1c7a5');
    p.ret(x - 4, y - 21 - pula, 8, 3, s.cabelo || '#5a3825');
    p.ret(x - 2, y - 17 - pula, 1, 2, K); p.ret(x + 1, y - 17 - pula, 1, 2, K);
    p.ret(x - 1, y - 28 - pula, 3, 4, C.ouro);
  }

  R.Interiores = {
    T: T,
    def: function (id) { return R.interiores.find(function (d) { return d.id === id; }) || null; },
    doLugar: function (lugarId) {
      var lista = R.interiores.filter(function (d) { return d.lugar === lugarId; });
      return lista.find(function (d) { return d.entrada; }) || lista[0] || null;
    },
    doPredio: function (lugarId) { return R.interiores.filter(function (d) { return d.lugar === lugarId; }); },
    cena: function (id) {
      if (cenas[id]) return cenas[id];
      var def = R.Interiores.def(id);
      if (!def) return null;
      cenas[id] = criarCena(def);
      return cenas[id];
    },
    grade: grade,
    objeto: objeto,
    OBJETOS: OBJETOS, PISOS: PISOS, PAREDES: PAREDES,
    desenho: { C: C, ret: ret, circulo: circulo, elipse: elipse, triangulo: triangulo, contornoRet: contornoRet, matriz: matriz, miudeza: miudeza, sorte: sorte,
      misturar: misturar, escurecer: escurecer, clarear: clarear },
    // utilidades para as ferramentas e o validador (puras)
    caminhoNaGrade: caminhoNa,
    dimensoes: dimensoes, solidoDe: solidoDe, ehParede: ehParede, ehAlto: ehAlto, interativo: interativo,
  };
})();
