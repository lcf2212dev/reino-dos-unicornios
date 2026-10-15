/* Interiores: quem recebe o toque ou o Enter numa cena de interior (NPC, objeto, tapete, escada),
   o caminho até lá e o que acontece (falas dos objetos, ações, conversa com o NPC).
   Veio de motor/interiores.js (as funções de dentro de criarCena). Cada função recebe E, o estado
   de UMA cena (montado em interiores-cena.js): { def, g, npcs, objs, cena, pintorAtual, retratos,
   mascaras, ... }. Registra em Reino._interiores: alvoEm, alvoPerto, quemEm, gatilhoEm.
   Só roda quando chamado (nada de DOM no carregamento). */
(function () {
  var R = window.Reino;
  var II = R._interiores, T = II.T, progresso = II.progresso;
  var caminhoNa = II.caminhoNa, comodoDoTile = II.comodoDoTile, paletaComodo = II.paletaComodo;

  function sinal(v) { return v > 0 ? 1 : v < 0 ? -1 : 0; }
  function direcao4(o) {
    if (!o) return { x: 0, y: -1 };
    if (Math.abs(o.x) >= Math.abs(o.y) && o.x) return { x: sinal(o.x), y: 0 };
    return { x: 0, y: sinal(o.y) || -1 };
  }

  function npcEm(E, x, y) { for (var i = 0; i < E.npcs.length; i++) if (E.npcs[i].x === x && E.npcs[i].y === y) return E.npcs[i]; return null; }
  function objetoInterativoEm(E, x, y) {
    for (var i = 0; i < E.objs.length; i++) {
      var it = E.objs[i];
      if (!it.interativo) continue;
      if (x >= it.o.x && x < it.o.x + it.w && y >= it.o.y && y < it.o.y + it.h) return it;
    }
    return null;
  }
  function gatilhoEm(E, x, y) {
    if (E.def.saida && E.def.saida.x === x && E.def.saida.y === y) return { id: 'saida:' + E.def.id, tipo: 'saida', x: x, y: y };
    var esc = E.def.escadas || [];
    for (var i = 0; i < esc.length; i++) {
      var e = esc[i];
      if (e.x === x && e.y === y) return { id: 'escada:' + E.def.id + ':' + i, tipo: 'escada', x: x, y: y, para: e.para, chegada: e.chegada, olhar: e.olhar || { x: 0, y: 1 }, de: E.def.id };
    }
    return null;
  }
  /* Escadas pareadas: sem `chegada`, ela aparece ao lado da escada do andar `para` que volta para `de`,
     no lado `chegar` dela (padrão (0, 1): logo abaixo). Sem escada de volta: null (quem chama usa o spawn). */
  function defDe(id) { return (R.interiores || []).find(function (d) { return d.id === id; }) || null; }
  function chegadaVindoDe(para, de) {
    var d = defDe(para), esc = (d && d.escadas) || [];
    for (var i = 0; i < esc.length; i++) {
      if (esc[i].para !== de) continue;
      var c = esc[i].chegar || { x: 0, y: 1 };
      return { x: esc[i].x + c.x, y: esc[i].y + c.y };
    }
    return null;
  }
  // onde ela chega pela escada i do interior origemId (a `chegada` explícita vale; senão a do par; senão o spawn)
  function chegadaDaEscada(origemId, i) {
    var o = defDe(origemId), e = o && (o.escadas || [])[i];
    if (!e) return null;
    if (e.chegada) return { x: e.chegada.x, y: e.chegada.y };
    var c = chegadaVindoDe(e.para, origemId), d = defDe(e.para);
    return c || (d && d.spawn ? { x: d.spawn.x, y: d.spawn.y } : null);
  }
  function ondeEsta(E) {
    var J = window.Jogador;
    try { if (J && J.tile) { var t = J.tile(); if (t && E.g.dentro(t.x, t.y)) return t; } } catch (e) {}
    return E.def.spawn || { x: 0, y: 0 };
  }
  // Para um NPC, o tile de baixo custa PENA_BAIXO_NPC passos a mais: montada (34 px) ela cobriria o
  // adulto (~18 px) na conversa; ao lado (ou acima, atrás dele) ele fica inteiro. Só se o lado for longe demais
  // (ou fechado), ela para embaixo.
  var PENA_BAIXO_NPC = 3;
  // vizinho livre (4 vizinhos) de um conjunto de tiles, alcançável e mais perto da Mariana
  function melhorVizinho(E, tiles, ehNpc) {
    var de = ondeEsta(E), cand = [], vistos = {};
    tiles.forEach(function (t) {
      [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(function (d) {
        var nx = t.x + d[0], ny = t.y + d[1], k = nx + ',' + ny;
        if (vistos[k] || !E.g.dentro(nx, ny) || E.g.solido[ny][nx]) return;
        if (tiles.some(function (o) { return o.x === nx && o.y === ny; }) && E.g.solido[t.y][t.x]) return;
        vistos[k] = true;
        cand.push({ x: nx, y: ny, olhar: { x: -d[0], y: -d[1] }, pena: ehNpc && d[1] === 1 ? PENA_BAIXO_NPC : 0 });
      });
      if (!E.g.solido[t.y][t.x]) { var k2 = t.x + ',' + t.y; if (!vistos[k2]) { vistos[k2] = true; cand.push({ x: t.x, y: t.y, olhar: { x: 0, y: -1 } }); } }
    });
    var melhor = null, custo = Infinity;
    cand.forEach(function (c) {
      var cam = caminhoNa(E.g, de, c);
      var k = (cam ? (cam.custo || 0) : 1e6 + Math.abs(c.x - de.x) + Math.abs(c.y - de.y)) + (c.pena || 0);
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
  function retratoObjeto(E, it) {
    if (E.retratos[it.i]) return E.retratos[it.i];
    if (!window.PA) return null;
    var topoParede = it.parede ? 6 : 0;
    var w = it.W + 2, h = it.topo + it.H - topoParede + 2;
    var c = PA.novoCanvas(w, h), cx = c.getContext('2d');
    cx.save(); cx.translate(1 - it.px, 1 + it.topo - it.py - topoParede);
    if (it.parede) {
      // fundo de parede para o enfeite não ficar solto
      var com = comodoDoTile(E.def, E.g, it.o.x, it.o.y + it.h), pc = paletaComodo(com || {});
      for (var x = it.o.x; x < it.o.x + it.w; x++) pc.parede.desenhar(cx, x * T, it.py, x, pc.p);
    }
    it.lib.desenhar && it.lib.desenhar(cx, it.px, it.py, it.o, progresso());
    if (it.lib.anim) it.lib.anim(cx, it.px, it.py, 0, it.o);
    cx.restore();
    E.retratos[it.i] = c;
    return c;
  }
  function falarObjeto(E, it) {
    var o = it.o, Cl = R.Claude;
    var p = Promise.resolve();
    if (o.fala && Cl && Cl.falar) {
      // a fala pode ser uma lista de páginas curtas (cada uma cabe em 2 linhas no celular)
      var quem = { nome: o.nome || '', retrato: retratoObjeto(E, it), voz: o.voz || 'narradora' };
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
    if (o.acao) p = p.then(function (v) { if (v === null) return null; return executarAcao(o.acao, { interior: E.def, cena: E.cena, objeto: o }); });
    return p;
  }
  function executarAcao(acao, ctx) {
    if (R.NPCs && R.NPCs.executar) return R.NPCs.executar(acao, ctx);
    var UI = R.UI, P = R.Progresso;
    if (!UI || acao.tipo !== 'tela') return Promise.resolve();
    var m = acao.materia ? R.materia(acao.materia) : R.materias && R.materias[0];
    var mapa = { bau: 'telaBau', loja: 'telaLoja', estabulo: 'telaEstabulo', plano: 'telaPlano' };
    if (mapa[acao.tela] && UI[mapa[acao.tela]]) UI[mapa[acao.tela]]();
    else if (acao.tela === 'livro' && UI.abrirLivro) UI.abrirLivro(m, null, acao.livro);
    else if (acao.tela === 'ovos' && UI.chocarOvos && P) UI.chocarOvos(P.ovosParaChocar());
    return Promise.resolve();
  }
  function falarNpc(E, npc) {
    if (R.NPCs && R.NPCs.interagir) return R.NPCs.interagir(npc, { interior: E.def, cena: E.cena });
    var Cl = R.Claude, oi = (npc.falas && npc.falas.oi && npc.falas.oi[0]) || 'Oi!';
    var p = Cl && Cl.falar ? Cl.falar(oi, { quem: { nome: npc.nome, voz: npc.voz }, modal: true }) : Promise.resolve();
    return p.then(function (v) { if (v !== null && npc.acao && npc.acao.tipo === 'tela') return executarAcao(npc.acao, {}); });
  }
  function alvoNpc(E, npc, tileFixo, olharFixo) {
    var v = tileFixo ? { x: tileFixo.x, y: tileFixo.y, olhar: olharFixo } : melhorVizinho(E, [{ x: npc.x, y: npc.y }], true);
    if (!v) return null;
    return { tipo: 'npc', id: npc.id, npc: npc, tile: { x: v.x, y: v.y }, olhar: v.olhar, agir: function () { return falarNpc(E, npc); } };
  }
  function alvoObjeto(E, it, tileFixo, olharFixo) {
    var v = tileFixo ? { x: tileFixo.x, y: tileFixo.y, olhar: olharFixo } : melhorVizinho(E, tilesDoObjeto(it));
    if (!v) return null;
    return { tipo: 'objeto', id: E.def.id + ':' + it.i, objeto: it.o, tile: { x: v.x, y: v.y }, olhar: v.olhar, agir: function () { return falarObjeto(E, it); } };
  }
  function alvoGatilho(gt) {
    if (gt.tipo === 'saida') return { tipo: 'saida', id: gt.id, gatilho: gt, tile: { x: gt.x, y: gt.y }, olhar: { x: 0, y: 1 },
      agir: function () { return R.Cena && R.Cena.sair ? R.Cena.sair() : Promise.resolve(); } };
    return { tipo: 'escada', id: gt.id, gatilho: gt, tile: { x: gt.x, y: gt.y }, olhar: { x: 0, y: -1 },
      agir: function () { return R.Cena && R.Cena.irPara ? R.Cena.irPara(gt.para, gt.chegada, gt.olhar, gt.de) : Promise.resolve(); } };
  }

  // balãozinho de status em cima do NPC (px do jogo), no mesmo lugar em que o Reino.NPCs.desenhar
  // o põe: centrado na cabeça, 20 × 23 px do ícone com `s` px da tela cada, 1 de vão e ±1 do balanço
  function bolhaNpc(E, n) {
    var N = R.NPCs;
    if (!N || !N.desenhar || !N.sprite || !E.pintorAtual) return null;
    try {
      var spr = N.sprite(n, 0), esc = E.pintorAtual.escala || 3, s = Math.max(1, Math.round(esc / 2));
      var cabeca = n.y * T + 13 - spr.height + (spr.topo || 0), meia = 10 * s / esc;
      return { x0: n.x * T + 8 - meia, x1: n.x * T + 8 + meia, topo: cabeca - 25 * s / esc };
    } catch (e) { return null; }
  }
  // máscara do desenho de um objeto (o parado + a animação no instante 0), em px do jogo: feita uma vez
  // e refeita quando o desenho muda com o progresso (renderizar)
  function mascaraDe(E, it) {
    if (E.mascaras[it.i] !== undefined) return E.mascaras[it.i];
    var m = null;
    try {
      var x0 = it.px - 8, y0 = it.py - it.topo - 8, w = it.W + 16, h = it.topo + it.H + 16;
      var c = PA.novoCanvas(w, h), cx = c.getContext('2d');
      cx.translate(-x0, -y0);
      if (it.lib.desenhar) it.lib.desenhar(cx, it.px, it.py, it.o, progresso());
      if (it.lib.anim) it.lib.anim(cx, it.px, it.py, 0, it.o);
      var d = cx.getImageData(0, 0, w, h).data, a = new Uint8Array(w * h);
      for (var i = 0; i < w * h; i++) a[i] = d[i * 4 + 3] >= 64 ? 1 : 0;
      m = { x0: x0, y0: y0, w: w, h: h, a: a };
    } catch (e) { m = null; }
    E.mascaras[it.i] = m;
    return m;
  }
  // o ponto cai no desenho do objeto (com `folga` px do jogo em volta)? Sem máscara, vale o retângulo.
  function noDesenho(E, it, wx, wy, folga) {
    var m = mascaraDe(E, it);
    if (!m) return true;
    var x = Math.floor(wx) - m.x0, y = Math.floor(wy) - m.y0;
    for (var dy = -folga; dy <= folga; dy++) for (var dx = -folga; dx <= folga; dx++) {
      var xx = x + dx, yy = y + dy;
      if (xx >= 0 && yy >= 0 && xx < m.w && yy < m.h && m.a[yy * m.w + xx]) return true;
    }
    return false;
  }

  // quem recebe um toque (px do jogo), sem calcular caminho. Prioridade:
  // 1) NPC (o corpo e o balãozinho de status em cima da cabeça);
  // 2) objeto com área de toque própria (lib.toque: ex. os planetas, desenhados maiores que a pegada),
  //    primeiro no desenho exato e depois com folga, o desenhado por cima ganha;
  // 3) objeto interativo cuja PEGADA contém o tile tocado (o mais à frente);
  // 4) objeto cuja parte desenhada acima da pegada (topo) contém o ponto (o mais à frente); no chão
  //    livre, só onde há desenho (o chão em volta do nariz do foguete anda)
  function quemEm(E, wx, wy) {
    var achados = E.npcs.filter(function (n) {
      if (wx >= n.x * T - 1 && wx < n.x * T + 17 && wy >= n.y * T - 14 && wy < n.y * T + 16) return true;
      var b = bolhaNpc(E, n);
      return !!b && wx >= b.x0 && wx < b.x1 && wy >= b.topo && wy < n.y * T - 14;
    }).sort(function (a, b) { return b.y - a.y; });
    var tx = Math.floor(wx / T), ty = Math.floor(wy / T);
    var frente = function (a, b) { return b.base - a.base; };
    if (achados.length) {
      // móvel alto desenhado na frente do NPC (mais embaixo) e com desenho no ponto fica com o toque
      var pes = achados[0].y * T + 12;
      var naFrente = E.objs.filter(function (it) {
        return it.interativo && it.alto && !it.parede && it.base - 1 > pes &&
          wx >= it.px && wx < it.px + it.W && wy >= it.py - it.topo && wy < it.py + it.H && noDesenho(E, it, wx, wy, 0);
      }).sort(frente);
      return naFrente.length ? { it: naFrente[0] } : { npc: achados[0] };
    }
    // móveis altos vão por Y; os outros, na ordem da lista (a mesma do desenho)
    var desenhoPorCima = function (a, b) { return (a.alto || b.alto) ? frente(a, b) : b.i - a.i; };
    for (var folga = 0; folga <= 1; folga++) {
      var proprios = E.objs.filter(function (it) {
        return it.interativo && it.lib.toque && it.lib.toque(wx, wy, it.px, it.py, it.o, folga);
      }).sort(desenhoPorCima);
      if (proprios.length) return { it: proprios[0] };
    }
    var donos = E.objs.filter(function (it) {
      return it.interativo && tx >= it.o.x && tx < it.o.x + it.w && ty >= it.o.y && ty < it.o.y + it.h;
    }).sort(frente);
    if (donos.length) return { it: donos[0] };
    var livre = !E.cena.solido(tx, ty);
    var altos = E.objs.filter(function (it) {
      if (!it.interativo || it.parede || !it.topo) return false;
      if (!(wx >= it.px && wx < it.px + it.W && wy >= it.py - it.topo && wy < it.py)) return false;
      // no chão livre vale o desenho, com 2 px do jogo de folga (~4 px no celular): as partes finas
      // (luneta, poste, pé) ainda se acertam
      return !livre || noDesenho(E, it, wx, wy, 2);
    });
    // se mais de um serve, ganha quem está mesmo desenhado no ponto (a folga de um não passa por
    // cima do desenho do vizinho); entre esses, o mais à frente
    altos.forEach(function (it) { it._exato = noDesenho(E, it, wx, wy, 0) ? 0 : 1; });
    if (altos.length > 1) altos.sort(function (a, b) { return (a._exato - b._exato) || frente(a, b); });
    // só pela folga, no chão livre: se ali está o desenho de outro objeto que se toca (que passa
    // um pouquinho da própria pegada), o toque é dele
    if (altos.length && altos[0]._exato && livre) {
      var desenhado = E.objs.filter(function (it) {
        return it !== altos[0] && it.interativo && !it.parede && noDesenho(E, it, wx, wy, 0);
      }).sort(frente);
      if (desenhado.length) return { it: desenhado[0] };
    }
    if (altos.length) return { it: altos[0] };
    return null;
  }
  // toque em px do jogo: NPC (sprite ~16×24 acima do tile), objeto interativo, tapete/escada (cena.alvoEm)
  function alvoEm(E, wx, wy) {
    var g = E.g, def = E.def, cena = E.cena;
    var q = quemEm(E, wx, wy);
    if (q && q.npc) return alvoNpc(E, q.npc);
    if (q && q.it) return alvoObjeto(E, q.it);
    var tx = Math.floor(wx / T), ty = Math.floor(wy / T);
    var gt = gatilhoEm(E, tx, ty);
    // o arco da escada que sobe é desenhado na parede, até 2 tiles acima do degrau
    if (!gt && g.dentro(tx, ty) && g.parede[ty][tx] && !g.porta[ty][tx]) {
      for (var d = 1; d <= 2 && !gt; d++) {
        var e = gatilhoEm(E, tx, ty + d);
        if (e && e.tipo === 'escada' && (def.escadas[+e.id.split(':').pop()] || {}).sentido !== 'desce') gt = e;
      }
    }
    // toque num tile sólido cujo tile andável mais perto é um gatilho (ex.: o vão da porta abaixo do tapete)
    if (!gt && cena.solido(tx, ty)) {
      var mp = cena.maisPerto(tx, ty, ondeEsta(E));
      if (mp) gt = gatilhoEm(E, mp.x, mp.y);
    }
    return gt ? alvoGatilho(gt) : null;
  }
  // Enter/Espaço: gatilho no tile; senão NPC/objeto vizinho, preferindo o da direção do olhar (cena.alvoPerto)
  function alvoPerto(E, tile, olhar) {
    if (!tile) return null;
    var gt = gatilhoEm(E, tile.x, tile.y);
    if (gt) return alvoGatilho(gt);
    var d0 = direcao4(olhar);
    var dirs = [d0, { x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }]
      .filter(function (d, i, a) { return a.findIndex(function (e) { return e.x === d.x && e.y === d.y; }) === i; });
    for (var i = 0; i < dirs.length; i++) {
      var nx = tile.x + dirs[i].x, ny = tile.y + dirs[i].y;
      var n = npcEm(E, nx, ny);
      if (n) return alvoNpc(E, n, tile, dirs[i]);
      var it = objetoInterativoEm(E, nx, ny);
      if (it) return alvoObjeto(E, it, tile, dirs[i]);
    }
    var aqui = objetoInterativoEm(E, tile.x, tile.y);
    return aqui ? alvoObjeto(E, aqui, tile, d0) : null;
  }

  II.alvoEm = alvoEm; II.alvoPerto = alvoPerto; II.quemEm = quemEm; II.gatilhoEm = gatilhoEm;
  II.chegadaVindoDe = chegadaVindoDe; II.chegadaDaEscada = chegadaDaEscada;
})();
