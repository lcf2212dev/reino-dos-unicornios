/* Desenho do mapa: cores e ajudantes de pixel, chão (com meio-fio nas ruas), enfeites sorteados (árvore,
   flor, cristal, arbusto, cogumelo, pedra), a imagem fixa (Mapa.prerender) e as partes animadas
   (Mapa.desenharAnimado). O lago fica em mundo/lago.js, a praça e os enfeites postos à mão em
   mundo/cidade-desenho.js, o contorno dourado dos concluídos em mundo/contorno.js e os prédios em
   mundo/predios.js; todos usam as cores e os ajudantes que este arquivo põe em Mapa._interno. */
(function () {
  var Mapa = window.Mapa, I = Mapa._interno;
  var T = Mapa.T, W = Mapa.W, H = Mapa.H;
  var BORDA_BAIXO = 4;      // fileiras de grama desenhadas abaixo do fim do mapa (só enfeite)

  var C = {
    grama: '#c6e15a', grama2: '#a8cc48', grama3: '#e4f59a',
    rua: '#f7d7a8', rua2: '#e4c07a', rua3: '#fff8e8', meioFio: '#d4ad6c', meioFio2: '#b98f55',
    praca: '#ffe6b0', praca2: '#f0c56e', praca3: '#fff8e8',
    agua: '#7ed9c8', agua2: '#d9fff4', agua3: '#3eaea3', margem: '#f8e2a8',
    tronco: '#a0745a', contorno: '#3a2446',
    miolo: '#fff6a8',
  };
  var COPAS = [['#ffc27a', '#f0a04a', '#fff1d0'], ['#d4ee78', '#a8cc48', '#f4f8c8'], ['#e4f59a', '#8fb83a', '#fff6d4']];
  var FLORES = ['#ff8a3d', '#ffe066', '#ffffff', '#ffb15a', '#7ed9c8'];

  // helpers de pixel: os de Reino.Desenho (js/arte/desenho.js); C acima é a paleta própria do mapa
  var D = window.Reino.Desenho;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo;

  function desenharChao(ctx, x, y, r, forcado) {
    var px = x * T, py = y * T, t = forcado || I.tipo[y][x];
    var par = (x + y) % 2 === 0, fio, topo, k, fx, fy, cor;
    if (t === 'g' || t === 'f') {
      ret(ctx, px, py, T, T, t === 'f' ? C.grama3 : C.grama);
      fio = t === 'f' ? C.grama : C.grama3;
      var ax = par ? 1 : 13, ay = par ? 1 : 12;
      var bx = par ? 13 : 1, by = par ? 12 : 1;
      ret(ctx, px + ax, py + ay, 1, 3, C.grama2);
      ret(ctx, px + ax + 1, py + ay + 1, 1, 2, fio);
      ret(ctx, px + bx, py + by, 1, 3, C.grama2);
      ret(ctx, px + bx + 1, py + by + 1, 1, 2, fio);
      if (t === 'f') {
        var pts = [[4, 5], [11, 6], [7, 11]];
        for (k = 0; k < 3; k++) {
          fx = px + pts[k][0]; fy = py + pts[k][1];
          cor = FLORES[(x + y + k) % FLORES.length];
          ret(ctx, fx, fy + 1, 1, 2, C.grama2);
          ret(ctx, fx - 1, fy, 3, 1, cor);
          ret(ctx, fx, fy - 1, 1, 3, cor);
          ret(ctx, fx, fy, 1, 1, C.miolo);
        }
      }
    } else if (t === 'c') {
      topo = (x % 2) ? 3 : 0;
      ret(ctx, px, py, T, T, C.rua2);
      ret(ctx, px + 1, py + topo, 6, 13, C.rua);
      ret(ctx, px + 9, py + (3 - topo), 6, 13, C.rua);
      ret(ctx, px + 1, py + topo, 6, 1, C.rua3);
      ret(ctx, px + 9, py + (3 - topo), 6, 1, C.rua3);
      // meio-fio: onde a rua encosta na grama, uma borda de pedra (a rua fica bem traçada)
      if (!forcado) {
        var rua = function (nx, ny) { var k2 = I.dentro(nx, ny) ? I.tipo[ny][nx] : 'c'; return k2 === 'c' || k2 === 'p'; };
        if (!rua(x, y - 1)) { ret(ctx, px, py, T, 2, C.meioFio); ret(ctx, px, py, T, 1, C.rua3); }
        if (!rua(x, y + 1)) { ret(ctx, px, py + 14, T, 2, C.meioFio); ret(ctx, px, py + 15, T, 1, C.meioFio2); }
        if (!rua(x - 1, y)) { ret(ctx, px, py, 2, T, C.meioFio); ret(ctx, px, py, 1, T, C.rua3); }
        if (!rua(x + 1, y)) { ret(ctx, px + 14, py, 2, T, C.meioFio); ret(ctx, px + 15, py, 1, T, C.meioFio2); }
      }
    } else if (t === 'p') {
      ret(ctx, px, py, T, T, par ? C.praca2 : C.praca);
      ret(ctx, px, py + 15, T, 1, C.praca2);
      ret(ctx, px + 15, py, 1, T, C.praca2);
      ret(ctx, px, py, T, 1, par ? C.praca : C.praca3);
      ret(ctx, px, py, 1, T, par ? C.praca : C.praca3);
      ret(ctx, px + 7, py + 7, 2, 2, par ? C.praca : C.praca2);
    } else if (t === 'a') {
      ret(ctx, px, py, T, T, C.grama);
    }
  }

  function desenharArvore(ctx, x, y, r) {
    var px = x * T, py = y * T;
    var i = Math.floor(r() * COPAS.length);
    var copa = COPAS[i], buque = COPAS[(i + 1) % COPAS.length];
    ret(ctx, px + 6, py + 9, 4, 7, C.tronco);
    ret(ctx, px + 6, py + 9, 1, 7, '#8a604a');
    ret(ctx, px + 4, py + 15, 3, 1, C.tronco);
    ret(ctx, px + 9, py + 15, 3, 1, C.tronco);
    circulo(ctx, px + 8, py + 6, 7, C.contorno);
    circulo(ctx, px + 8, py + 6, 6, copa[1]);
    circulo(ctx, px + 6, py + 5, 4, copa[0]);
    circulo(ctx, px + 5, py + 3, 2, copa[2]);
    circulo(ctx, px + 12, py + 6, 3, C.contorno);
    circulo(ctx, px + 12, py + 6, 2, buque[1]);
    ret(ctx, px + 8, py, 1, 3, '#ffffff');
    ret(ctx, px + 7, py + 1, 3, 1, '#fff6a8');
  }
  function desenharFlor(ctx, x, y, r, soSortear) {
    var px = x * T + 4 + Math.floor(r() * 7), py = y * T + 5 + Math.floor(r() * 5);
    var cor = FLORES[Math.floor(r() * FLORES.length)];
    if (soSortear) return;   // gasta os mesmos 3 números sem pintar (flor que um lugar novo tirou)
    var miolo = (cor === '#ffe066' || cor === '#ffffff') ? '#ff8a3d' : '#fff3a0';
    ret(ctx, px, py + 2, 1, 4, '#7ea832');
    ret(ctx, px - 2, py + 3, 2, 1, '#8fb83a'); ret(ctx, px + 1, py + 4, 2, 1, '#b6d24e');
    ret(ctx, px - 2, py, 5, 1, cor); ret(ctx, px, py - 2, 1, 5, cor);
    ret(ctx, px - 1, py - 1, 1, 1, cor); ret(ctx, px + 1, py - 1, 1, 1, cor);
    ret(ctx, px - 1, py + 1, 1, 1, cor); ret(ctx, px + 1, py + 1, 1, 1, cor);
    ret(ctx, px, py, 1, 1, miolo); ret(ctx, px + 3, py - 2, 1, 1, '#ffffff');
  }
  function desenharCristal(ctx, x, y) {
    var px = x * T, py = y * T;
    elipse(ctx, px + 8, py + 13, 5, 2, '#8fb83a');
    elipse(ctx, px + 8, py + 12, 3, 1, '#b6d24e');
    var larg = [2, 4, 6, 8, 8, 6, 4, 2];
    for (var j = 0; j < larg.length; j++) {
      var w = larg[j], x0 = px + 8 - w / 2;
      ret(ctx, x0 - 1, py + 4 + j, w + 2, 1, C.contorno);
      ret(ctx, x0, py + 4 + j, w / 2, 1, '#d8f2ff');
      ret(ctx, x0 + w / 2, py + 4 + j, w / 2, 1, j < 4 ? '#9fdcff' : '#6bb8ea');
      if (w > 2) ret(ctx, x0 + w - 1, py + 4 + j, 1, 1, '#7ed9c8');
    }
    ret(ctx, px + 7, py + 6, 1, 2, '#ffffff');
    ret(ctx, px + 11, py + 4, 1, 3, '#ffffff');
    ret(ctx, px + 10, py + 5, 3, 1, '#fff6a8');
  }
  function desenharArbusto(ctx, x, y) {
    var px = x * T, py = y * T;
    var cor = ['#ff8a3d', '#ffb15a', '#7ed9c8'][(x + y) % 3];
    elipse(ctx, px + 8, py + 10, 7, 5, C.contorno);
    elipse(ctx, px + 8, py + 10, 6, 4, '#a8cc48');
    elipse(ctx, px + 6, py + 9, 3, 2, '#d4ee78');
    elipse(ctx, px + 12, py + 12, 2, 2, '#8fb83a');
    ret(ctx, px + 4, py + 9, 3, 1, cor); ret(ctx, px + 5, py + 8, 1, 3, cor); ret(ctx, px + 5, py + 9, 1, 1, '#ffffff');
    ret(ctx, px + 10, py + 11, 3, 1, '#ffe066'); ret(ctx, px + 11, py + 10, 1, 3, '#ffe066'); ret(ctx, px + 11, py + 11, 1, 1, '#ffffff');
  }
  function desenharCogumelo(ctx, x, y) {
    var sorte = I.rng(x * 89 + y * 47 + 13);
    var px = x * T + 4 + Math.floor(sorte() * 5);
    var py = y * T + 5 + Math.floor(sorte() * 4);
    var rosa = sorte() < 0.7;
    var chapeu = rosa ? '#ff8a3d' : '#f0a04a';
    var barra = rosa ? '#e07028' : '#d9842f';
    ret(ctx, px, py + 6, 5, 1, C.grama2);
    ret(ctx, px + 1, py + 3, 3, 4, '#fff6ea');
    ret(ctx, px + 3, py + 3, 1, 4, '#e7d4b8');
    circulo(ctx, px + 2, py + 2, 3, C.contorno);
    circulo(ctx, px + 2, py + 1, 3, chapeu);
    ret(ctx, px, py + 2, 5, 1, barra);
    ret(ctx, px + 1, py, 1, 1, '#ffffff');
    ret(ctx, px + 3, py + 1, 1, 1, '#ffffff');
  }

  /* ----- ajudantes dos prédios (mundo/predios.js) ----- */
  var contornoRet = D.contornoRet;   // contorno em D.K, a mesma cor de C.contorno

  // para mundo/lago.js e mundo/predios.js
  I.C = C;
  I.ret = ret; I.circulo = circulo; I.elipse = elipse; I.triangulo = triangulo;
  I.contornoRet = contornoRet;

  function sombraBase(ctx, px, py, w, h) {
    elipse(ctx, px + w / 2, py + h - 1, Math.round(w * 0.38), 3, 'rgba(58,36,70,0.10)');
    elipse(ctx, px + w / 2, py + h - 1, Math.round(w * 0.30), 1, 'rgba(58,36,70,0.18)');
  }

  // enfeites do chão, tile a tile (os altos, postos à mão, vão na ordem de cima para baixo do Mapa.prerender).
  // O sorteio das flores anda pela cópia do reino de hoje (I.decorSorteio):
  // um lugar novo não desloca as flores do resto; flor que só existe no estado final usa sorteio da coordenada
  I.desenharEnfeites = function (ctx) {
    var r = I.rng(4242), base = I.decorSorteio;
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      var d = I.decor[y][x], antes = base[y] && base[y][x] === 'flor';
      if (antes) desenharFlor(ctx, x, y, r, d !== 'flor');
      else if (d === 'flor') desenharFlor(ctx, x, y, I.rng(x * 89 + y * 47 + 13));
      if (d === 'cristal') desenharCristal(ctx, x, y);
      else if (d === 'arbusto') desenharArbusto(ctx, x, y);
      else if (d === 'cogumelo') desenharCogumelo(ctx, x, y);
      else if (d === 'pedra' && I.desenharPeca) I.desenharPeca(ctx, 'pedra', x, y);
    }
  };

  Mapa.prerender = function () {
    // mais BORDA_BAIXO fileiras de grama depois do fim do mapa: a câmera passa da borda de baixo para
    // o menu não esconder a última fileira, e ali aparecia grama lisa, sem os tufinhos
    var c = PA.novoCanvas(W * T, (H + BORDA_BAIXO) * T);
    var ctx = c.getContext('2d');
    var r = I.rng(777);
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) desenharChao(ctx, x, y, r);
    for (var yb = H; yb < H + BORDA_BAIXO; yb++) for (var xb = 0; xb < W; xb++) desenharChao(ctx, xb, yb, r, 'g');
    if (I.desenharPraca) I.desenharPraca(ctx);
    I.desenharEnfeites(ctx);
    I.desenharLago(ctx);
    I.contornos = {};
    // prédios, peças da praça, enfeites altos e árvores em ordem de cima para baixo
    var itens = [];
    I.lugares.forEach(function (l) { itens.push({ y: l.rect.y + l.rect.h, f: function () {
      var fn = Mapa.PREDIOS[l.sprite] || Mapa.PREDIOS.torre;
      sombraBase(ctx, l.rect.x * T, l.rect.y * T, l.rect.w * T, l.rect.h * T);
      fn(ctx, l.rect.x * T, l.rect.y * T, l.rect.w * T, l.rect.h * T, l.cores);
    } }); });
    (I.objetos || []).forEach(function (o) { itens.push({ y: o.y + o.h, f: function () { I.desenharObjeto(ctx, o); } }); });
    for (var y3 = 0; y3 < H; y3++) for (var x3 = 0; x3 < W; x3++) {
      var d3 = I.decor[y3][x3];
      if (d3 === 'arvore') (function (xx, yy) { itens.push({ y: yy + 1, f: function () { desenharArvore(ctx, xx, yy, I.rng(xx * 131 + yy * 71)); } }); })(x3, y3);
      else if (I.PECAS_ALTAS && I.PECAS_ALTAS[d3]) (function (tp, xx, yy) { itens.push({ y: yy + 1, f: function () { I.desenharPeca(ctx, tp, xx, yy); } }); })(d3, x3, y3);
    }
    itens.sort(function (a, b) { return a.y - b.y; }).forEach(function (i) { i.f(); });
    I.estatico = c;
    return c;
  };

  // partes animadas: brilho da água, fonte e lampiões (mundo/cidade-desenho.js), ganchos dos prédios e o
  // contorno dourado dos lugares concluídos (mundo/contorno.js; parado sem Animações)
  Mapa.desenharAnimado = function (ctx, t, opcoes) {
    opcoes = opcoes || {};
    if (!I.estatico) Mapa.prerender();
    ctx.drawImage(I.estatico, 0, 0);
    if (!opcoes.semAnimacao) {
      // brilhos na água
      var L = Mapa.CIDADE.lago, x0 = (L.cx - L.rx) * T, y0 = (L.cy - L.ry) * T;
      var lw = Math.round(L.rx * 2 * T), lh = Math.round(L.ry * 2 * T);
      for (var i = 0; i < 18; i++) {
        var fase = (t / 1400 + i * 0.37) % 1;
        var ax = Math.round(x0 + ((i * 53) % lw)), ay = Math.round(y0 + 6 + ((i * 29) % (lh - 10)));
        if (Mapa.fundura(ax, ay) > 3 && fase < 0.5) {
          ctx.fillStyle = 'rgba(255,255,255,' + (0.9 - fase * 1.6).toFixed(2) + ')';
          ctx.fillRect(ax, ay, 3, 1);
        }
      }
      if (I.animarCidade) I.animarCidade(ctx, t);
      I.lugares.forEach(function (l) {
        var fa = Mapa.PREDIOS_ANIM[l.sprite];
        if (fa) fa(ctx, l.rect.x * T, l.rect.y * T, l.rect.w * T, l.rect.h * T, t);
      });
    }
    // matéria de dentro de um prédio: brilha o prédio anfitrião (uma vez só)
    var feitos = {};
    (opcoes.concluidos || []).forEach(function (id) {
      var l = Mapa.lugar(id);
      if (l && l.dentro) l = I.lugares.find(function (o) { return o.id === l.dentro; });
      if (!l || feitos[l.id] || !I.desenharContorno) return;
      feitos[l.id] = true;
      I.desenharContorno(ctx, l, t, !opcoes.semAnimacao);
    });
  };
})();
