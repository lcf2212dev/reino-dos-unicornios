/* Desenho do mapa: cores e ajudantes de pixel, chão (com meio-fio nas ruas), enfeites sorteados (árvore,
   flor, cristal, arbusto, cogumelo, pedra; as árvores em mundo/arvores.js), a imagem fixa (Mapa.prerender) e as partes animadas
   (Mapa.desenharAnimado). O lago fica em mundo/lago.js, a praça e os enfeites postos à mão em
   mundo/cidade-desenho.js, o contorno dourado dos concluídos em mundo/contorno.js e os prédios em
   mundo/predios.js; todos usam as cores e os ajudantes que este arquivo põe em Mapa._interno. */
(function () {
  var Mapa = window.Mapa, I = Mapa._interno;
  var T = Mapa.T, W = Mapa.W, H = Mapa.H;
  var BORDA_BAIXO = 4;      // fileiras de bosque fechado desenhadas abaixo do fim do mapa (só enfeite; mundo/chao.js)

  var C = {
    grama: '#c6e15a', grama2: '#a8cc48', grama3: '#e4f59a',
    rua: '#f7d7a8', rua2: '#e4c07a', rua3: '#fff8e8', meioFio: '#d4ad6c', meioFio2: '#b98f55',
    praca: '#ffe6b0', praca2: '#f0c56e', praca3: '#fff8e8',
    agua: '#7ed9c8', agua2: '#d9fff4', agua3: '#3eaea3', margem: '#f8e2a8',
    tronco: '#a0745a', contorno: '#3a2446',
    miolo: '#fff6a8',
  };
  var FLORES = ['#ff8a3d', '#ffe066', '#ffffff', '#ffb15a', '#7ed9c8'];

  // helpers de pixel: os de Reino.Desenho (js/arte/desenho.js); C acima é a paleta própria do mapa
  var D = window.Reino.Desenho;
  var ret = D.ret, circulo = D.circulo, elipse = D.elipse, triangulo = D.triangulo, K = C.contorno;

  // sombra de chão (ui.md §10.13): elipse de pixel, 2 níveis (0,15 e 0,25), 3 px para fora do pé
  function sombraChao(ctx, cx, y, meia) {
    ret(ctx, cx - meia + 2, y - 1, (meia - 2) * 2, 1, 'rgba(58,36,70,0.15)');
    ret(ctx, cx - meia, y, meia * 2, 1, 'rgba(58,36,70,0.15)');
    ret(ctx, cx - meia + 2, y + 1, (meia - 2) * 2, 1, 'rgba(58,36,70,0.15)');
    ret(ctx, cx - meia + 3, y, (meia - 3) * 2, 1, 'rgba(58,36,70,0.12)');
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
    sombraChao(ctx, px + 8, py + 12, 7);
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
    sombraChao(ctx, px + 8, py + 14, 10);
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
  I.sombraChao = sombraChao;   // também para mundo/arvores.js

  // sombra de chão do prédio, embaixo e fora da base: Mapa.fachada.sombraBase (mundo/fachadas.js, D2A-14)
  function sombraBase(ctx, px, py, w, h) { Mapa.fachada.sombraBase(ctx, px, py, w, h); }

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
      // arbusto com placa de direção logo embaixo: a placa sobe e já ocupa o tile (sólido do mesmo jeito; O-28)
      else if (d === 'arbusto' && !(y + 1 < H && I.decor[y + 1][x] === 'placa')) desenharArbusto(ctx, x, y);
      else if (d === 'cogumelo') desenharCogumelo(ctx, x, y);
      else if ((d === 'pedra' || d === 'pedrinhas') && I.desenharPeca) I.desenharPeca(ctx, d, x, y);
    }
  };

  /* ----- peças altas (sobem acima do próprio tile): cada uma vira um sprite, feito uma vez (as iguais dividem o
     mesmo), desenhado no estático em ordem de cima para baixo e guardado em I.altas para voltar por cima dos
     personagens na ordem por Y (Mapa.itensFrente). O sprite da frente só tem os pixels opacos: a sombra de chão
     fica embaixo dela. ----- */
  var sprites = {};
  function sprite(chave, w, h, desenhar) {
    if (chave && sprites[chave]) return sprites[chave];
    var img = PA.novoCanvas(w, h), sctx = img.getContext('2d');
    desenhar(sctx);
    var frente = PA.novoCanvas(w, h), dados = sctx.getImageData(0, 0, w, h), d = dados.data;
    for (var i = 3; i < d.length; i += 4) if (d[i] < 255) d[i] = 0;
    frente.getContext('2d').putImageData(dados, 0, 0);
    var s = { img: img, frente: frente };
    if (chave) sprites[chave] = s;
    return s;
  }
  var PE = 12 - 0.01;   // linha do pé de uma peça no tile (a Mariana no mesmo tile, J.y = 12, fica na frente)

  Mapa.prerender = function () {
    // mais BORDA_BAIXO fileiras depois do fim do mapa: a câmera passa da borda de baixo para o menu não esconder a
    // última fileira, e ali aparece o bosque fechado (além da borda o mundo não continua em grama)
    // opaco (alpha: false): chão e bosque além da borda cobrem a imagem toda, e colá-la a cada quadro vira cópia
    var c = typeof document !== 'undefined' && typeof document.createElement === 'function' ? document.createElement('canvas') : PA.novoCanvas(W * T, (H + BORDA_BAIXO) * T);
    c.width = W * T; c.height = (H + BORDA_BAIXO) * T;
    var ctx = c.getContext('2d', { alpha: false });
    ctx.imageSmoothingEnabled = false;
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) I.desenharChao(ctx, x, y);
    I.desenharAlemDaBorda(ctx, H * T, BORDA_BAIXO * T);
    I.desenharClareiras(ctx);
    if (I.desenharPraca) I.desenharPraca(ctx);
    I.desenharEnfeites(ctx);
    I.desenharLago(ctx);
    I.contornos = {};
    // prédios, peças da praça, enfeites altos e árvores em ordem de cima para baixo (pela linha do pé)
    var itens = [];
    I.altas = [];
    function alta(ty, chave, x0, y0, w, h, desenhar, antes, anim) {
      var pe = ty * T + PE;
      itens.push({ pe: pe, f: function () {
        if (antes) antes();
        var s = sprite(chave, w, h, function (sc) { sc.translate(-x0, -y0); desenhar(sc); });
        ctx.drawImage(s.img, x0, y0);
        I.altas.push({ x: x0, y: y0, w: w, h: h, pe: pe, frente: s.frente, anim: anim });
      } });
    }
    I.lugares.forEach(function (l) {
      var px = l.rect.x * T, py = l.rect.y * T, w = l.rect.w * T, h = l.rect.h * T;
      var fn = Mapa.PREDIOS[l.sprite] || Mapa.PREDIOS.torre, fa = Mapa.PREDIOS_ANIM[l.sprite];
      alta(l.rect.y + l.rect.h - 1, null, px - 16, py - 40, w + 32, h + 46, function (sc) { fn(sc, px, py, w, h, l.cores); },
        function () { sombraBase(ctx, px, py, w, h); }, fa && function (ac, t) { fa(ac, px, py, w, h, t); });
    });
    (I.objetos || []).forEach(function (o) {
      alta(o.y + o.h - 1, null, o.x * T - 8, o.y * T - 40, o.w * T + 16, o.h * T + 48, function (sc) { I.desenharObjeto(sc, o); },
        null, I.animarObjeto && function (ac, t) { I.animarObjeto(ac, o, t); });
    });
    var memo = [];
    for (var y3 = 0; y3 < H; y3++) for (var x3 = 0; x3 < W; x3++) {
      var d3 = I.decor[y3][x3];
      if (d3 === 'arvore' || d3 === 'frutifera') (function (v, xx, yy) {
        var w = v.w, h = v.h, x0 = xx * T + 8 - w / 2 + v.dx, y0 = yy * T + T - h + v.dy;
        alta(yy, 'arvore:' + [v.chave, v.esp, v.fruta, v.moita].join(':'), x0, y0, w, h,
          function (sc) { sc.translate(x0, y0); I.desenharArvore(sc, v); });
      })(I.varianteArvore(x3, y3, memo), x3, y3);
      else if (I.PECAS_ALTAS && I.PECAS_ALTAS[d3]) (function (tp, xx, yy) {
        var chave = I.chavePeca ? I.chavePeca(tp, xx, yy) : null;
        alta(yy, chave, xx * T - 4, yy * T - 24, T + 8, T + 26, function (sc) { I.desenharPeca(sc, tp, xx, yy); });
      })(d3, x3, y3);
    }
    itens.sort(function (a, b) { return a.pe - b.pe; }).forEach(function (i) { i.f(); });
    I.estatico = c;
    return c;
  };

  // por cima dos personagens: as peças altas cuja caixa encosta na caixa dada (px do jogo; a da Mariana e do bebê;
  // caixa.pe = o menor y de pé entre eles),
  // cada uma com y = linha do pé e só o pedaço dentro da caixa, em px do jogo ampliados como o buffer (sem tremer).
  // As peças ficam em baldes de 64 px (feitos no primeiro pedido depois do Mapa.prerender)
  var BALDE = 64, baldes = null, baldesDe = null, vez = 0;
  function montarBaldes() {
    baldes = {}; baldesDe = I.altas;
    I.altas.forEach(function (a) {
      for (var by = Math.floor(a.y / BALDE); by <= Math.floor((a.y + a.h - 1) / BALDE); by++)
        for (var bx = Math.floor(a.x / BALDE); bx <= Math.floor((a.x + a.w - 1) / BALDE); bx++)
          (baldes[bx + ',' + by] = baldes[bx + ',' + by] || []).push(a);
    });
  }
  Mapa.itensFrente = function (caixa, p, t, animar) {
    if (!I.altas) return [];
    if (baldesDe !== I.altas) montarBaldes();
    var itens = [], marca = ++vez;
    for (var by = Math.floor(caixa.y0 / BALDE); by <= Math.floor((caixa.y1 - 1) / BALDE); by++)
      for (var bx = Math.floor(caixa.x0 / BALDE); bx <= Math.floor((caixa.x1 - 1) / BALDE); bx++) {
        var lista = baldes[bx + ',' + by];
        if (!lista) continue;
        for (var i = 0; i < lista.length; i++) {
          var a = lista[i];
          // a peça atrás de todos eles (pé acima de caixa.pe) já está certa no estático: não volta
          if (a.vez === marca || a.pe < caixa.pe || a.x >= caixa.x1 || a.x + a.w <= caixa.x0 || a.y >= caixa.y1 || a.y + a.h <= caixa.y0) continue;
          a.vez = marca;
          itens.push(itemFrente(a, caixa, p, t, animar));
        }
      }
    return itens;
  };
  function itemFrente(a, caixa, p, t, animar) {
    var x0 = Math.max(a.x, caixa.x0), y0 = Math.max(a.y, caixa.y0);
    var w = Math.min(a.x + a.w, caixa.x1) - x0, h = Math.min(a.y + a.h, caixa.y1) - y0;
    return { y: a.pe, desenhar: function () {
      var ctx = p.ctx, e = p.escala;
      ctx.save();
      ctx.setTransform(e, 0, 0, e, -Math.round(p.cam.x * e), -Math.round(p.cam.y * e));
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(a.frente, x0 - a.x, y0 - a.y, w, h, x0, y0, w, h);
      if (animar && a.anim) { ctx.beginPath(); ctx.rect(x0, y0, w, h); ctx.clip(); a.anim(ctx, t); }
      ctx.restore();
    } };
  }

  // partes animadas: brilho da água, fonte e lampiões (mundo/cidade-desenho.js), ganchos dos prédios e o
  // contorno dourado dos lugares concluídos (mundo/contorno.js; parado sem Animações)
  Mapa.desenharAnimado = function (ctx, t, opcoes) {
    opcoes = opcoes || {};
    if (!I.estatico) Mapa.prerender();
    ctx.drawImage(I.estatico, 0, 0);
    I.desenharLagoVivo(ctx, t, !opcoes.semAnimacao);
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
