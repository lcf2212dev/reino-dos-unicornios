/* Interiores: as placas dos cômodos (em px da tela, com a fonte pixel, por cima de móveis e
   personagens): placas de parede que fogem do HUD, do balão e dos objetos da parede e da Mariana.
   Veio de motor/interiores.js (o corpo de cena.desenharSobre e os ajudantes do HUD).
   Registra em Reino._interiores: desenharPlacas. Só roda quando chamado. */
(function () {
  var R = window.Reino;
  var II = R._interiores, T = II.T, K = II.K;

  function naTela(pintor, x, y) {
    if (pintor.tela) return pintor.tela(x, y);
    var c = pintor.cam || { x: 0, y: 0 };
    return { x: Math.round((x - c.x) * pintor.escala), y: Math.round((y - c.y) * pintor.escala) };
  }
  var FONTE_PIXEL = '"Press Start 2P", "Trebuchet MS", sans-serif';
  var FOLGA_HUD = 8;   // px CSS entre a placa e o HUD ou o balão (a folga do ui.md §10.18.2)

  // corpo da Mariana em px da tela (em pé ~16×24 acima dos pés; montada ~28×34)
  function caixaMariana(pintor) {
    var J = window.Jogador;
    if (!J || typeof J.x !== 'number') return null;
    var montada = false;
    try { montada = !!(J.montado && J.montado()); } catch (e) {}
    var w = montada ? 28 : 16, h = montada ? 34 : 24;
    var a = naTela(pintor, J.x - w / 2, J.y - h), b = naTela(pintor, J.x + w / 2, J.y);
    return { esq: a.x, cima: a.y, dir: b.x, baixo: b.y };
  }
  // retângulos do HUD (e do balão aberto, com o retrato e a plaquinha do nome) em px do canvas, medidos no máximo a
  // cada 500 ms (como o mapa fazia com as placas dos prédios); o balão abrir, fechar ou trocar de texto remede na
  // hora. Cada um leva a folga f de 8 px CSS até a placa (ui.md §10.18.2)
  var hudMedido = { chave: '', medidoEm: -1e9, rects: [], dialogo: false, versao: 0, assinatura: '' };
  function balaoAberto() {
    var b = document.getElementById('claude-balao');
    return b && !b.hidden && b.style.visibility !== 'hidden' ? b : null;
  }
  function retangulosHud(canvas, dpr) {
    if (typeof document === 'undefined' || !canvas || !canvas.getBoundingClientRect) return hudMedido;
    var bal = balaoAberto(), tx = bal && bal.querySelector('.claude-texto');
    var agora = performance.now(), chave = canvas.width + 'x' + canvas.height + '@' + dpr + (bal ? '|' + (tx ? tx.textContent.length : 0) : '')
      + (R.UI.areaUtil ? '|' + JSON.stringify(R.UI.areaUtil()) : '')
      + '|' + document.documentElement.style.getPropertyValue('--balao-altura');   // o balão mudou de altura: remede
    if (chave === hudMedido.chave && agora - hudMedido.medidoEm <= 500) return hudMedido;
    var c = canvas.getBoundingClientRect();
    if (!c.width) return hudMedido;
    var k = canvas.width / c.width || dpr, f = Math.ceil(FOLGA_HUD * k) + 1;   // +1: arredondamento do zoom não deixa a folga cair abaixo de 8
    function doCanvas(r) { return { left: (r.left - c.left) * k, right: (r.right - c.left) * k, top: (r.top - c.top) * k, bottom: (r.bottom - c.top) * k, f: f }; }
    // o HUD pela área útil (ui/hud.js, ui.md §10.18): os chips da esquerda, o bloco da direita (montaria e a fileira
    // ⛶ 📷 🖼) e o dock, sem medir o HUD aqui
    var a = R.UI.areaUtil ? R.UI.areaUtil() : null, vw = window.innerWidth, vh = window.innerHeight, rects = [];
    if (a) {
      if (a.esqFundo) rects.push(doCanvas({ left: -1e4, right: a.esqLargura, top: -1e4, bottom: a.esqFundo }));
      if (a.dirFundo) rects.push(doCanvas({ left: vw - a.dirLargura, right: 1e4, top: -1e4, bottom: a.dirFundo }));
      if (a.dock) rects.push(doCanvas({ left: -1e4, right: 1e4, top: vh - a.dock, bottom: 1e4 }));
    }
    if (bal) {
      // o balão entra subindo (animação "subir"): mede sem o deslocamento, onde ele vai parar
      var r = bal.getBoundingClientRect(), dy = 0;
      try { var tr = getComputedStyle(bal).transform; if (tr && tr !== 'none') dy = new DOMMatrixReadOnly(tr).m42; } catch (e) {}
      var rb = doCanvas({ left: r.left, right: r.right, top: r.top - dy, bottom: r.bottom - dy });
      rb.balao = true;
      rects.push(rb);
      // a aba do nome fica acima do balão, fora do retângulo dele: obstáculo à parte
      var nm = bal.querySelector('.claude-nome'), rn = nm && nm.getBoundingClientRect();
      if (rn && rn.width) { var q = doCanvas({ left: rn.left, right: rn.right, top: rn.top - dy, bottom: rn.bottom - dy }); q.balao = true; rects.push(q); }
    }
    hudMedido.rects = rects.filter(function (q) { return q.right > q.left && q.bottom > q.top; });
    hudMedido.dialogo = !!bal;
    // a versão só muda quando algum retângulo mudou de fato (a placa guardada é recalculada por ela)
    var ass = !!bal + hudMedido.rects.map(arred).join(';');
    if (ass !== hudMedido.assinatura) { hudMedido.assinatura = ass; hudMedido.versao++; }
    hudMedido.medidoEm = agora; hudMedido.chave = chave;
    return hudMedido;
  }
  // os objetos pendurados na parede do fundo do cômodo (e os que ocupam as fileiras dela), em px do jogo, uma vez
  // por interior: a placa desliza pela parede até achar um vão entre eles (D2A-08)
  var paredes = typeof WeakMap === 'function' ? new WeakMap() : null;
  function objetosDaParede(def, c) {
    var porComodo = paredes && paredes.get(def);
    if (!porComodo) { porComodo = {}; if (paredes) paredes.set(def, porComodo); }
    if (porComodo[c.id]) return porComodo[c.id];
    var r = c.rect, lista = [];
    (def.objetos || []).forEach(function (o) {
      var d = II.dimensoes(o);
      if (o.x >= r.x + r.w || o.x + d.w <= r.x || o.y >= r.y + r.h || o.y + d.h <= r.y) return;
      // o de chão só conta se o desenho dele (com o topo que sobe) alcança a faixa da parede; conta inteiro
      var y0 = o.y * T - d.topo;
      if (!II.ehParede(o) && y0 >= (r.y + 2) * T) return;
      lista.push({ x0: o.x * T, x1: (o.x + d.w) * T, y0: y0, y1: (o.y + d.h) * T });
    });
    porComodo[c.id] = lista;
    return lista;
  }
  // os outros cômodos em px do jogo, uma vez por cômodo (a placa na moldura de cima ou no chão não invade o vizinho)
  var vizinhos = typeof WeakMap === 'function' ? new WeakMap() : null;
  function outrosComodos(def, c) {
    var porComodo = vizinhos && vizinhos.get(def);
    if (!porComodo) { porComodo = {}; if (vizinhos) vizinhos.set(def, porComodo); }
    if (porComodo[c.id]) return porComodo[c.id];
    return (porComodo[c.id] = (def.comodos || []).filter(function (o) { return o !== c; }).map(function (o) {
      return { x0: o.rect.x * T, y0: o.rect.y * T, x1: (o.rect.x + o.rect.w) * T, y1: (o.rect.y + o.rect.h) * T };
    }));
  }
  // os móveis de chão do cômodo (o desenho inteiro, com o topo que sobe), uma vez por interior; tapete à parte
  // (enfeite plano: a placa no chão prefere não cobrir, mas pode)
  var chaos = typeof WeakMap === 'function' ? new WeakMap() : null;
  function objetosDoChao(def, c) {
    var porComodo = chaos && chaos.get(def);
    if (!porComodo) { porComodo = {}; if (chaos) chaos.set(def, porComodo); }
    if (porComodo[c.id]) return porComodo[c.id];
    var r = c.rect, moveis = [], tapetes = [];
    (def.objetos || []).forEach(function (o) {
      var d = II.dimensoes(o);
      if (o.x >= r.x + r.w || o.x + d.w <= r.x || o.y >= r.y + r.h || o.y + d.h <= r.y) return;
      var lib = II.libDe(o), toca = !!(o.fala || o.acao || lib.pedestal || /pedestal/.test(o.tipo));
      (lib.plano ? tapetes : moveis).push({ x0: o.x * T, x1: (o.x + d.w) * T, y0: o.y * T - d.topo, y1: (o.y + d.h) * T, toca: toca });
    });
    // o tapete de saída e as escadas também se tocam (gatilhos pisados)
    [def.saida].concat(def.escadas || []).forEach(function (e) {
      if (e && e.x >= r.x && e.x < r.x + r.w && e.y >= r.y && e.y < r.y + r.h) moveis.push({ x0: e.x * T, x1: (e.x + 1) * T, y0: e.y * T, y1: (e.y + 1) * T, toca: true });
    });
    return (porComodo[c.id] = { moveis: moveis, tapetes: tapetes });
  }
  function paraTela(pintor, lista, f) {
    return lista.map(function (o) {
      var a = naTela(pintor, o.x0, o.y0), b = naTela(pintor, o.x1, o.y1);
      return { left: a.x, top: a.y, right: b.x, bottom: b.y, f: f };
    });
  }
  // a posição mais perto de (sx, sy) em que a placa (sw×sh, mais a borda) cabe na área e não cruza nenhum obstáculo
  // (cada um com a sua folga f); descer pesa menos que andar de lado. Sem lugar: null
  function lugarLivre(obst, sx, sy, sw, sh, borda, area) {
    var x0 = area.x0 + borda, x1 = area.x1 - borda - sw, y0 = area.y0 + borda, y1 = area.y1 - borda - sh;
    if (x1 < x0 || y1 < y0) return null;
    // só os obstáculos que tocam a área contam
    obst = obst.filter(function (r) { var f = r.f || 0; return r.left - f < area.x1 && r.right + f > area.x0 && r.top - f < area.y1 && r.bottom + f > area.y0; });
    function cruza(x, y) {
      for (var i = 0; i < obst.length; i++) {
        var r = obst[i], f = r.f || 0;
        if (x - borda - f < r.right && x + sw + borda + f > r.left && y - borda - f < r.bottom && y + sh + borda + f > r.top) return true;
      }
      return false;
    }
    var px = Math.max(x0, Math.min(sx, x1)), py = Math.max(y0, Math.min(sy, y1));
    if (!cruza(px, py)) return { x: px, y: py };
    var xs = [px, x0, x1], ys = [py, y0, y1];
    obst.forEach(function (r) {
      var f = (r.f || 0) + borda;
      xs.push(Math.ceil(r.right + f), Math.floor(r.left - f - sw));
      ys.push(Math.ceil(r.bottom + f), Math.floor(r.top - f - sh));
    });
    var melhor = null, custo = Infinity;
    ys.forEach(function (y) {
      if (y < y0 || y > y1) return;
      xs.forEach(function (x) {
        if (x < x0 || x > x1) return;
        var k = Math.abs(y - sy) + Math.abs(x - sx) * 1.3;
        if (k < custo && !cruza(x, y)) { custo = k; melhor = { x: x, y: y }; }
      });
    });
    return melhor;
  }
  // o fundo da placa de parede: --laranja-claro (madeira clara, longe do --papel-quente dos chips), lido do :root uma vez (o canvas não lê variável CSS)
  var fundoPlaca = null;
  function corFundo() {
    if (fundoPlaca) return fundoPlaca;
    var v = '';
    try { v = getComputedStyle(document.documentElement).getPropertyValue('--laranja-claro').trim(); } catch (e) {}
    if (v) fundoPlaca = v;
    return v || '#ffe4c2';
  }

  // as linhas de cada placa, medidas uma vez por texto, fonte e largura máxima (medir texto a cada quadro custava
  // ~0,6 ms no Museu): quebra no menor número de linhas que cabe e, com esse número, na largura mais equilibrada
  var medidas = {};
  function linhasDa(ctx, texto, fonte, largMax) {
    var chave = texto + '|' + fonte + '|' + Math.round(largMax);
    if (medidas[chave]) return medidas[chave];
    // o "•" fica no fim da linha de cima, colado à palavra antes dele (nunca começa uma linha)
    var pal = texto.split(' ').reduce(function (a, w) { if (w === '•' && a.length) a[a.length - 1] += ' •'; else a.push(w); return a; }, []), larg = pal.map(function (w) { return ctx.measureText(w).width; });
    var esp = ctx.measureText(' ').width;
    function quebrar(max) {   // guloso: devolve as linhas (índices de palavra) com largura até max
      var ls = [], l = [0], w = larg[0];
      for (var i = 1; i < pal.length; i++) {
        if (w + esp + larg[i] <= max) { l.push(i); w += esp + larg[i]; } else { ls.push(l); l = [i]; w = larg[i]; }
      }
      ls.push(l);
      return ls;
    }
    function largura(ls) {
      return Math.max.apply(null, ls.map(function (l) { return ctx.measureText(l.map(function (i) { return pal[i]; }).join(' ')).width; }));
    }
    var ls = quebrar(largMax), n = ls.length, lo = Math.max.apply(null, larg), hi = largMax;
    if (n > 1) {   // a menor largura que ainda dá n linhas
      for (var k = 0; k < 12 && hi - lo > 1; k++) { var m = (lo + hi) / 2; if (quebrar(m).length <= n) hi = m; else lo = m; }
      ls = quebrar(Math.max(hi, Math.max.apply(null, larg)));
    }
    var r = { linhas: ls.map(function (l) { return l.map(function (i) { return pal[i]; }).join(' '); }), largura: largura(ls) };
    // guarda só com a fonte pixel já carregada (medida com a fonte reserva ficaria errada para sempre)
    var pronta = true;
    try { pronta = typeof document === 'undefined' || !document.fonts || document.fonts.check(ctx.font); } catch (e) {}
    if (pronta) medidas[chave] = r;
    return r;
  }
  function comMariana(r) {
    var J = window.Jogador;
    if (!J || typeof J.x !== 'number') return false;
    return J.x >= r.x * T && J.x < (r.x + r.w) * T && J.y >= r.y * T && J.y < (r.y + r.h) * T;
  }
  function sobMariana(g, m, borda) {
    return m && g.x - borda < m.dir && g.x + g.sw + borda > m.esq && g.y - borda < m.baixo && g.y + g.sh + borda > m.cima;
  }
  // a placa calculada de cada cômodo (por interior), refeita só quando a chave muda: posição do cômodo na tela (a
  // câmera), tamanho do canvas, versão do HUD e do balão, balãozinhos, célula da Mariana (desempenho, O-06)
  var guardadas = typeof WeakMap === 'function' ? new WeakMap() : null, guardaSemMapa = {};
  function guardaDe(def) {
    if (!guardadas) return guardaSemMapa;
    var g = guardadas.get(def);
    if (!g) { g = {}; guardadas.set(def, g); }
    return g;
  }
  function arred(q) { return Math.round(q.left) + ',' + Math.round(q.top) + ',' + Math.round(q.right) + ',' + Math.round(q.bottom); }

  // placas dos cômodos, em px da tela, com a fonte pixel, por cima de móveis e personagens (ui.md §10.9.5): a letra
  // tem Reino.config.texto.corpo px CSS (× dpr em px de aparelho) nos 3 tamanhos; a moldura é desenhada em px de arte
  // da interface (u = 2 px CSS): placa de parede de madeira (--laranja-claro, borda --tinta de 1 u, dois preguinhos
  // de 1×1 u, sem o degrau de sombra dos chips). Onde ela fica: interiores.md §6.4 e §6.5
  function desenharPlacas(def, ctx, pintor, t, animar) {
    var escala = pintor.escala || 3, dpr = pintor.dpr || 1;
    // "Letras grandes" (ui.md §10.9.4) sobe a letra um degrau (corpo → g, múltiplo de 8: pixel inteiro); a fonte
    // entra na chave das medidas e da guarda, então a troca refaz a placa uma vez só
    var tx = (R.config && R.config.texto) || {}, grande = document.documentElement.classList.contains('letras-grandes');
    var corpo = (grande ? tx.g || 24 : tx.corpo) || 16;
    var fonte = Math.round(corpo * dpr), u = Math.max(1, Math.round(2 * dpr));
    var pad = 5 * u, topo = 2 * u, lh = Math.round(corpo * 10 / 16) * u, borda = u;
    var cw = ctx.canvas.width, ch = ctx.canvas.height;
    var pal = (R.config && R.config.paleta) || {};
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = fonte + 'px ' + FONTE_PIXEL;
    ctx.textRendering = 'optimizeSpeed';   // sem ligadura: com ela "fi"/"fl" viram um glifo só (o CSS não vale no canvas)
    var medido = null, mari = caixaMariana(pintor), J = window.Jogador;
    var mariR = mari ? [{ left: mari.esq, top: mari.cima, right: mari.dir, bottom: mari.baixo, f: borda }] : [];
    var celula = mari ? Math.floor(J.x / T) + ',' + Math.floor(J.y / T) + ',' + (mari.dir - mari.esq) : '';
    // os balãozinhos que N.desenhar pôs neste quadro (npcs-status.js), lidos e esvaziados a cada quadro
    var bq = R._npcs && R._npcs.bolhasQuadro, bolhas = [], corpos = [];
    function daTela(b) { return b.canvas === ctx.canvas; }
    // balãozinho e cadeado de NPC com folga de 8 px CSS
    if (bq) { bolhas = bq.rects.filter(daTela).map(function (b) { return { left: b.left, top: b.top, right: b.right, bottom: b.bottom, f: Math.round(8 * dpr) }; }); corpos = (bq.corpos || []).filter(daTela); bq.rects = []; bq.corpos = []; }
    var assBolhas = null, guarda = guardaDe(def);

    // onde a placa do cômodo c fica: a lista de passos, em ordem; cada um devolve o lugar livre mais perto de (x, y)
    function passos(c, esq, dir, cimaC, baixoC, dela) {
      var r = c.rect;
      var med = linhasDa(ctx, c.placa, fonte, (r.w * T - 6) * escala - pad * 2);
      var sw = Math.ceil(med.largura + pad * 2), sh = topo * 2 + lh * med.linhas.length;
      var sx = Math.round((esq + dir) / 2 - sw / 2), sy = naTela(pintor, 0, r.y * T + 2).y;
      var fimParede = naTela(pintor, 0, (r.y + 2) * T).y;
      var gente = medido.rects.concat(bolhas, mariR);
      var parede = objetosDaParede(def, c), obj = paraTela(pintor, parede, borda);
      var outros = paraTela(pintor, outrosComodos(def, c), 0);
      var xa = Math.max(esq, 0), xb = Math.min(dir, cw), ym = cimaC - Math.round(sh / 2) - borda;
      function p(med, sw, sh, x, y, obst, area) {
        return { med: med, sw: sw, sh: sh, x: x, y: y, achar: function (x, y) { return lugarLivre(obst, x, y, sw, sh, borda, area); } };
      }
      var lista = [
        // 1) na parede do fundo, dentro do cômodo e da tela, fora dos objetos pendurados nela
        p(med, sw, sh, sx, sy, gente.concat(obj), { x0: xa, x1: xb, y0: Math.max(cimaC, 0), y1: Math.min(fimParede, ch) }),
        // 2) na moldura de cima (metade sobre a borda; pode subir até inteira acima dela), encostando nos objetos da
        // parede e sem cruzar nenhum outro cômodo
        p(med, sw, sh, sx, ym, gente.concat(paraTela(pintor, parede, 0), outros),
          { x0: xa, x1: xb, y0: Math.max(cimaC - sh - borda * 2, 0), y1: Math.min(ym + sh + borda * 2, ch) }),
      ];
      if (!dela) return lista;
      // 3) a do cômodo dela nunca some (ui.md §10.18.4): desce para o chão do próprio cômodo, abaixo do HUD e à
      // direita da coluna de chips, fora dos NPCs e da Mariana; depois a tela toda (sem invadir outro cômodo); por
      // fim só fora do HUD e da Mariana. A largura é a da tela que sobra; o texto quebra no que precisar
      var xChips = 0;
      medido.rects.forEach(function (h) { if (!h.balao && h.left < cw / 3 && h.top < ch / 2 && h.bottom > 0) xChips = Math.max(xChips, h.right + h.f); });
      // com Letras grandes a largura é a do chão do cômodo à direita dos chips (senão a placa larga nunca cabia no
      // chão); a palavra que não cabe ao lado dos chips (celular) usa a largura toda, abaixo deles
      function larg3() { return Math.min((r.w * T - 6) * escala, cw - xChips - borda * 4, grande ? xb - Math.max(xChips, xa) - borda * 4 : 1e9) - pad * 2; }
      var m3 = linhasDa(ctx, c.placa, fonte, larg3());
      if (grande && m3.largura > larg3()) { xChips = 0; m3 = linhasDa(ctx, c.placa, fonte, larg3()); }
      var sw3 = Math.ceil(m3.largura + pad * 2), sh3 = topo * 2 + lh * m3.linhas.length;
      var x3 = Math.round((esq + dir) / 2 - sw3 / 2), tela = { x0: xChips, x1: cw, y0: 0, y1: ch };
      var chao = { x0: Math.max(xChips, xa), x1: xb, y0: Math.max(cimaC, 0), y1: Math.min(baixoC, ch) };
      // no chão, meio tile de folga da Mariana, dos NPCs e dos móveis (D2A-08: caía colada nos pés dela)
      var meio = Math.round(T / 2 * escala), ch3 = objetosDoChao(def, c);
      var mariM = mari ? [{ left: mari.esq, top: mari.cima, right: mari.dir, bottom: mari.baixo, f: meio }] : [];
      var genteM = mariM.concat(corpos.map(function (q) { return { left: q.left, top: q.top, right: q.right, bottom: q.bottom, f: meio }; }));
      var perto = genteM.concat(ch3.moveis.map(function (o) { return paraTela(pintor, [o], o.toca ? meio : borda)[0]; }));
      var noChao = medido.rects.concat(bolhas, perto, obj), tapetes = paraTela(pintor, ch3.tapetes, 0);
      var tocaveis = paraTela(pintor, ch3.moveis.filter(function (o) { return o.toca; }), meio);
      var gente3 = medido.rects.concat(bolhas, genteM);   // Mariana e NPCs com meio tile
      var faixa = { x0: chao.x0, x1: chao.x1, y0: chao.y0, y1: Math.min(fimParede + sh3 + borda * 2, chao.y1) };
      // a passadeira (tapete de parede a parede, a do corredor da escola) parece a divisa do cômodo: meio em cima e meio
      // fora, a placa lia como da sala de cima (O-37). Ela fica inteira sobre a passadeira, na largura toda (os chips do
      // HUD já são obstáculo), a 1 u da Mariana e dos NPCs; senão inteira de um lado dela
      var divisas = [], sobreDivisa = [], largoC = { x0: xa, x1: xb, y0: chao.y0, y1: chao.y1 };
      var genteT = gente3.map(function (q) { return q.f === meio ? { left: q.left, top: q.top, right: q.right, bottom: q.bottom, f: borda } : q; });
      ch3.tapetes.forEach(function (o, i) {
        if (o.x1 - o.x0 < (r.w - 1) * T) return;
        var q = tapetes[i], a = { x0: xa, x1: xb, y0: Math.max(chao.y0, q.top), y1: Math.min(chao.y1, q.bottom) };
        divisas.push({ left: q.left, right: q.right, top: q.top, bottom: q.top }, { left: q.left, right: q.right, top: q.bottom, bottom: q.bottom });
        sobreDivisa.push(p(m3, sw3, sh3, x3, Math.round((a.y0 + a.y1 - sh3) / 2), genteT.concat(obj, tocaveis), a));
      });
      return lista.concat([
        // 3a) encostada na parede de cima, fora do tapete; 3b) o fundo do cômodo, fora do tapete; 3c) idem, sobre ele
        p(m3, sw3, sh3, x3, sy, noChao.concat(tapetes), faixa),
        p(m3, sw3, sh3, x3, chao.y1, noChao.concat(tapetes), chao),
        // 3b') inteira sobre a passadeira; 3b'') inteira de um lado dela (fora dos móveis; depois só fora do que se toca)
      ], sobreDivisa, divisas.length ? [p(m3, sw3, sh3, x3, sy, noChao.concat(divisas), largoC), p(m3, sw3, sh3, x3, sy, gente3.concat(obj, tocaveis, divisas), largoC)] : [], [
        p(m3, sw3, sh3, x3, chao.y1, noChao, chao),
        // 3d) só fora do que se toca (móvel comum pode ficar embaixo): de novo a faixa de cima e depois o fundo
        p(m3, sw3, sh3, x3, sy, gente3.concat(obj, tocaveis), faixa),
        p(m3, sw3, sh3, x3, chao.y1, gente3.concat(obj, tocaveis), chao),
        p(m3, sw3, sh3, x3, sy, gente3.concat(obj), chao),
        p(m3, sw3, sh3, x3, sy, gente3.concat(obj, outros), tela),
        p(m3, sw3, sh3, x3, sy, gente3.concat(outros), tela),
        p(m3, sw3, sh3, x3, sy, gente3.concat(obj), tela),
        p(m3, sw3, sh3, x3, sy, medido.rects.concat(mariM), tela),
        p(m3, sw3, sh3, x3, sy, medido.rects.concat(mariR), tela),
      ]);
    }
    function calcular(c, antes, esq, dir, cimaC, baixoC, dela, chave) {
      var lista = passos(c, esq, dir, cimaC, baixoC, dela), i, q, livre;
      // histerese: o lugar de antes (preso ao cômodo, não à tela) vale enquanto continuar livre no mesmo passo
      if (antes && antes.pos && lista[antes.passo]) {
        q = lista[antes.passo];
        var ax = esq + antes.dx, ay = cimaC + antes.dy;
        livre = q.sw === antes.pos.sw ? q.achar(ax, ay) : null;
        if (livre && livre.x === ax && livre.y === ay) return montar(q, livre, antes.passo);
      }
      for (i = 0; i < lista.length; i++) {
        livre = lista[i].achar(lista[i].x, lista[i].y);
        if (livre) return montar(lista[i], livre, i);
      }
      // sem nenhum retângulo livre (exceção do interiores.md §6.5): a placa fica fora deste quadro
      return { chave: chave, pos: null };
      function montar(q, l, passo) {
        return { chave: chave, passo: passo, dx: l.x - esq, dy: l.y - cimaC, pos: { x: l.x, y: l.y, sw: q.sw, sh: q.sh, med: q.med } };
      }
    }

    (def.comodos || []).forEach(function (c) {
      if (!c.placa) return;
      var r = c.rect;
      // o cômodo fora da tela sai antes de medir qualquer coisa
      var esq = naTela(pintor, r.x * T, 0).x, dir = naTela(pintor, (r.x + r.w) * T, 0).x;
      var cimaC = naTela(pintor, 0, r.y * T).y, baixoC = naTela(pintor, 0, (r.y + r.h) * T).y;
      if (dir < 0 || esq > cw || baixoC < 0 || cimaC > ch) return;
      var dela = comMariana(r);
      if (!medido) medido = retangulosHud(ctx.canvas, dpr);
      // com o balão aberto, só a placa do cômodo dela (a vizinha sairia cortada ao lado do balão)
      if (medido.dialogo && !dela) return;
      if (assBolhas === null) assBolhas = bolhas.concat(corpos).map(arred).join(';');
      var chave = esq + ',' + cimaC + ',' + cw + 'x' + ch + ',' + fonte + '|' + medido.versao + '|' + assBolhas + '|' + celula + '|' + dela;
      var g = guarda[c.id];
      // a Mariana andou dentro da célula e passou por baixo: recalcula (a do cômodo dela muda de lugar; a vizinha
      // que não achar outro lugar some enquanto ela estiver embaixo)
      if (!g || g.chave !== chave || (g.pos && sobMariana(g.pos, mari, borda))) g = guarda[c.id] = calcular(c, g, esq, dir, cimaC, baixoC, dela, chave);
      var s = g.pos;
      if (!s || sobMariana(s, mari, borda)) return;
      var sx = s.x, sy = s.y, sw = s.sw, sh = s.sh;
      ctx.fillStyle = K;
      ctx.fillRect(sx - borda, sy - borda, sw + borda * 2, sh + borda * 2);
      ctx.fillStyle = corFundo();
      ctx.fillRect(sx, sy, sw, sh);
      ctx.fillStyle = pal.tintaSuave || '#6b5378';
      ctx.fillRect(sx + 2 * u, sy + 2 * u, u, u);
      ctx.fillRect(sx + sw - 3 * u, sy + 2 * u, u, u);
      ctx.fillStyle = K;
      s.med.linhas.forEach(function (l, i) { ctx.fillText(l, Math.round(sx + sw / 2), sy + topo + lh * i + Math.round(lh / 2)); });
    });
    ctx.restore();
    ctx.imageSmoothingEnabled = false;
  }

  II.desenharPlacas = desenharPlacas;
})();
