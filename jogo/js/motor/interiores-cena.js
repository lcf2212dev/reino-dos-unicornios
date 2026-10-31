/* Interiores: a cena de um interior (o que o motor/laco.js desenha e a Cena usa: grade, caminho, alvos,
   desenho do fundo, dos móveis altos e dos NPCs, placas por cima), o NPC genérico e a API pública
   Reino.Interiores. Veio de motor/interiores.js. A interface da cena é a da seção 2 de
   docs/contratos/cena-e-motor.md §6. O estado de cada cena que as outras partes usam fica em E
   (ver interiores-toque.js). Nada de DOM no carregamento: só monta a API. */
(function () {
  var R = window.Reino;
  var D = R.Desenho, C = D.C, K = D.K;
  var II = R._interiores, T = II.T, FUNDO = II.FUNDO, OBJETOS = II.OBJETOS, objeto = II.objeto, progresso = II.progresso;
  var grade = II.grade, caminhoNa = II.caminhoNa, libDe = II.libDe, dimensoes = II.dimensoes, solidoDe = II.solidoDe;
  var ehParede = II.ehParede, ehAlto = II.ehAlto, interativo = II.interativo;
  var desenharEstatico = II.desenharEstatico, setaSaida = II.setaSaida, setaEscada = II.setaEscada;

  /* ================= CENA ================= */
  var cenas = {};
  // memória: só as LIMITE_CENAS cenas usadas por último guardam o estático e os sprites dos móveis; a que sai é
  // refeita no preparar da próxima visita, com a íris fechada (a cena ativa nunca sai). Em ordem de uso, a mais
  // recente no fim
  var LIMITE_CENAS = 4, vivas = [];
  function usar(cena) {
    var i = vivas.indexOf(cena);
    if (i >= 0) vivas.splice(i, 1);
    vivas.push(cena);
    var atual = R.Cena && R.Cena.atual ? R.Cena.atual() : null;
    for (var k = 0; vivas.length > LIMITE_CENAS && k < vivas.length - 1; ) {
      if (vivas[k] === atual) { k++; continue; }
      vivas.splice(k, 1)[0]._liberar();
    }
  }
  // fora da câmera não se desenha (móveis e animações; os NPCs sempre: o desenho deles guarda as caixas que as placas
  // dos cômodos leem). Quanto a animação pode passar do sprite do móvel (px do jogo): o pior caso real é a fenda do
  // Observatório, 143 px; a folga 256 cobre também os ~179 px da decolagem do foguete da NASA, que hoje nenhum dado
  // dispara; o dos móveis altos, 8 px. O teste interiores-alcance.navegador.test.js desenha todas (com as de toque
  // disparadas) e confere
  var ALCANCE_ANIM = 256, FOLGA_ITEM = 16;
  function vistaDoPintor(p, v) {
    var c = p && p.cam, cv = p && p.ctx && p.ctx.canvas, e = p && p.escala;
    if (!c || !cv || !e) return null;
    v.x0 = c.x; v.y0 = c.y; v.x1 = c.x + cv.width / e; v.y1 = c.y + cv.height / e;
    return v;
  }
  function naVista(v, b) { return b.x1 >= v.x0 && b.x0 <= v.x1 && b.y1 >= v.y0 && b.y0 <= v.y1; }

  // canvas do estático, opaco (alpha: false): o estático pinta o retângulo todo (fundo ou céu por baixo), e colá-lo
  // no buffer a cada quadro vira cópia em vez de mistura (desenho idêntico, mais barato). Sem DOM (testes): PA.novoCanvas.
  function canvasOpaco(w, h) {
    if (typeof document === 'undefined' || typeof document.createElement !== 'function') return PA.novoCanvas(w, h);
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    c.getContext('2d', { alpha: false }).imageSmoothingEnabled = false;
    return c;
  }

  function criarCena(def) {
    var npcs = def.npcs || [];
    // grade, objetos e as listas derivadas: montados de novo pelo refazer (decorável, casa.md §4); quem usa lê a
    // variável na hora (as funções da cena, E e os itens por Y)
    var g, objs, altos, baixos, animados, defPlacas;
    function montarObjetos() {
      var lista = II.objetosDe(def);
      g = grade(def, lista);
      // as placas guardam os objetos da parede por def: com extras, um def só delas, novo a cada montagem
      defPlacas = lista === def.objetos || !def.objetosExtras ? def : Object.assign({}, def, { objetos: lista });
      objs = lista.map(function (o, i) {
        var lib = libDe(o), d = dimensoes(o);
        // cópia com a pegada resolvida (o desenho usa w/h da biblioteca quando o dado não traz)
        o = Object.assign({}, o, { w: d.w, h: d.h });
        var it = { i: i, o: o, lib: lib, w: d.w, h: d.h, topo: d.topo, W: d.w * T, H: d.h * T, px: o.x * T, py: o.y * T,
          parede: ehParede(o), alto: ehAlto(o), interativo: interativo(o), sprite: null };
        it.base = it.py + it.H;
        it.ordem = it.parede ? 0 : lib.plano ? 1 : 2;
        return it;
      });
      altos = objs.filter(function (it) { return it.alto; });
      // móveis baixos e sólidos (vão no estático): voltam por cima dela só quando o sprite dela avança sobre
      // eles e o pé do móvel está mais embaixo que o dela (a montada é mais larga que um tile; O-05)
      baixos = objs.filter(function (it) { var s = solidoDe(it.o); return !it.alto && !it.parede && !it.lib.plano && (s === true || s === 'base'); });
      animados = objs.filter(function (it) { return it.lib.anim && !it.alto; });
    }
    montarObjetos();
    var estatico = null, chaveFeita = null, sujo = true;
    var tAtual = 0, animarAtual = false;
    // estado desta cena usado pelas funções de interiores-toque.js (pintorAtual: o pintor do último quadro;
    // mascaras: máscaras do desenho dos objetos, refeitas em renderizar; retratos: retrato de cada objeto que fala, idem)
    var E = { def: def, g: g, npcs: npcs, objs: objs, cena: null, pintorAtual: null, mascaras: {}, retratos: {} };

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
      E.mascaras = {}; E.retratos = {};
      if (!estatico) { estatico = canvasOpaco(g.w * T, g.h * T); usar(cena); }
      var ctx = estatico.getContext('2d');
      desenharEstatico(ctx, def, g, P, objs);
      // anims parados entram no estático só como base? não: são desenhados a cada quadro (ver desenharFundo)
      altos.forEach(function (it) { pintarSprite(it, P); });
      // os baixos só ganham sprite quando ela chega perto (spriteDoBaixo)
      baixos.forEach(function (it) { it.feito = false; });
      chaveFeita = chave; sujo = false;
    }
    // sprite de um móvel: 2 px de folga dos lados, topo acima do tile, 2 px embaixo (a sombra)
    function pintarSprite(it, P) {
      var w = it.W + 4, h = it.topo + it.H + 2;
      if (!it.sprite || it.sprite.width !== w || it.sprite.height !== h) it.sprite = PA.novoCanvas(w, h);
      var sc = it.sprite.getContext('2d');
      sc.clearRect(0, 0, w, h);
      sc.save(); sc.translate(2 - it.px, it.topo - it.py);
      it.lib.desenhar && it.lib.desenhar(sc, it.px, it.py, it.o, P);
      sc.restore();
    }
    // contexto falso para as animações dos móveis altos: desenha com o pintor, em px da tela
    var ctxPintor = { fillStyle: '#000', fillRect: function (x, y, w, h) { E.pintorAtual.ret(x, y, w, h, this.fillStyle); } };
    // baixo na frente dela; o animado leva a animação junto (numa cópia com 8 px de folga), e o fundo pula ela
    var ANIM_FOLGA = 8;
    // sprite do móvel com a mesma conta do estático (buffer em px inteiros, deslizado em px da tela: laco.js);
    // o pintor.sprite arredonda por conta própria e o móvel pulava ~1 px ao virar sprite (O-33)
    function spriteNoFundo(img, x, yPes) {
      var p = E.pintorAtual, c = p.cam, e = p.escala;
      if (!p.ctx || !c) { p.sprite(img, x, yPes); return; }
      var ox = Math.floor(c.x), oy = Math.floor(c.y);
      p.ctx.drawImage(img, (x - img.width / 2 - ox) * e - Math.round((c.x - ox) * e),
        (yPes - img.height - oy) * e - Math.round((c.y - oy) * e), img.width * e, img.height * e);
    }
    function desenharMovel(it) {
      if (!it.lib.anim) { spriteNoFundo(it.sprite, it.px + it.W / 2, it.base + 2); return; }
      var F = ANIM_FOLGA, w = it.sprite.width + F * 2, h = it.sprite.height + F * 2;
      if (!it.spriteAnim || it.spriteAnim.width !== w || it.spriteAnim.height !== h) it.spriteAnim = PA.novoCanvas(w, h);
      var sc = it.spriteAnim.getContext('2d');
      sc.clearRect(0, 0, w, h);
      sc.drawImage(it.sprite, F, F);
      sc.save(); sc.translate(F + 2 - it.px, F + it.topo - it.py);
      it.lib.anim(sc, it.px, it.py, tAtual, it.o);
      sc.restore();
      spriteNoFundo(it.spriteAnim, it.px + it.W / 2, it.base + 2 + F);
    }
    // baixos que o sprite dela cobre e que ficam na frente dela (pé mais embaixo): entram na ordem por y
    var perto = [], comPerto = [];
    function baixosPerto() {
      perto.length = 0;
      for (var b = 0; b < baixos.length; b++) baixos[b].naFrente = false;
      var J = window.Jogador, s = J && J.silhueta;
      if (!s || !s.img) return perto;
      var w = s.img.width, x0 = s.x - w / 2, x1 = s.x + w / 2, y0 = s.yPes - s.img.height, y1 = s.yPes;
      for (var i = 0; i < baixos.length; i++) {
        var it = baixos[i];
        // pé dela mais embaixo, ou dentro da pegada (ex.: a parte de cima, livre, de um móvel 'base'): fica como está
        if (it.base - 1 <= J.y || (J.x >= it.px && J.x < it.px + it.W && J.y >= it.py)) continue;
        if (it.px - 2 >= x1 || it.px + it.W + 2 <= x0 || it.py - it.topo >= y1 || it.base + 2 <= y0) continue;
        if (!it.feito) { pintarSprite(it, progresso()); it.feito = true; }
        it.naFrente = true; perto.push(it.item);
      }
      return perto;
    }
    function marcarSujo() { sujo = true; }
    // saiu da memória (usar): solta o estático e os sprites; o próximo renderizar refaz tudo
    function liberar() {
      estatico = null; chaveFeita = null; sujo = true;
      E.mascaras = {}; E.retratos = {};
      objs.forEach(function (it) { it.sprite = null; it.spriteAnim = null; it.feito = false; });
    }
    if (R.util && R.util.on) { R.util.on(R.EVENTOS.PROGRESSO, marcarSujo); R.util.on(R.EVENTOS.PROGRESSO_REMOTO, marcarSujo); R.util.on(R.EVENTOS.MAPA_MUDOU, marcarSujo); }


    var cena = {
      id: def.id, tipo: 'interior', lugarId: def.lugar, nome: def.nome, def: def, corFundo: (def.fundo && II.FUNDOS[def.fundo] || {}).cor || FUNDO,
      spawn: def.spawn, grade: g,
      largura: function () { return g.w * T; },
      altura: function () { return g.h * T; },
      solido: function (tx, ty) { return !g.dentro(tx, ty) || g.solido[ty][tx]; },
      portaEm: function () { return null; },
      saidaEm: function (tx, ty) { return II.gatilhoEm(E, tx, ty); },
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
      alvoEm: function (wx, wy) { return II.alvoEm(E, wx, wy); },
      // Enter/Espaço: gatilho no tile; senão NPC/objeto vizinho, preferindo o da direção do olhar
      alvoPerto: function (tile, olhar) { return II.alvoPerto(E, tile, olhar); },
      preparar: function () {
        try {
          if (sujo || !estatico) renderizar();
          usar(cena);
          aquecerNpcs(npcs);
        } catch (e) { return Promise.reject(e); }
        return Promise.resolve();
      },
      desenharFundo: function (bctx, t, animar) {
        if (!estatico || sujo) renderizar();
        // a vista do buffer (px do jogo): só com o deslocamento simples do laço; senão, desenha todos
        var m = bctx.getTransform ? bctx.getTransform() : null, v = null;
        if (m && !m.b && !m.c && m.a > 0 && m.d > 0 && bctx.canvas) {
          v = vistaFundo; v.x0 = -m.e / m.a; v.y0 = -m.f / m.d; v.x1 = v.x0 + bctx.canvas.width / m.a; v.y1 = v.y0 + bctx.canvas.height / m.d;
        }
        // do estático, só o pedaço que a vista pega (mesmos pixels, no mesmo lugar)
        var sx = v ? Math.max(0, Math.floor(v.x0)) : 0, sy = v ? Math.max(0, Math.floor(v.y0)) : 0;
        var sw = v ? Math.min(estatico.width, Math.ceil(v.x1)) - sx : 0, sh = v ? Math.min(estatico.height, Math.ceil(v.y1)) - sy : 0;
        if (!v) bctx.drawImage(estatico, 0, 0);
        else if (sw > 0 && sh > 0) bctx.drawImage(estatico, sx, sy, sw, sh, sx, sy, sw, sh);
        var tt = animar ? t : 0;
        // os baixos na frente dela (mesma silhueta que itensDesenho usa) levam a animação no próprio sprite
        baixosPerto();
        for (var i = 0; i < animados.length; i++) {
          var it = animados[i];
          if (!it.naFrente && (!v || naVista(v, it.caixa))) it.lib.anim(bctx, it.px, it.py, tt, it.o);
        }
        if (def.saida) setaSaida(bctx, def.saida, t, animar);
        var esc = def.escadas || [];
        for (var k = 0; k < esc.length; k++) setaEscada(bctx, esc[k], t, animar);
      },
      // antes dos personagens: nada (as placas vão por cima, em desenharSobre)
      desenharTela: function () {},
      // placas dos cômodos, em px da tela, com a fonte pixel, por cima de móveis e personagens (interiores-placas.js)
      desenharSobre: function (ctx, pintor, t, animar) { II.desenharPlacas(defPlacas, ctx, pintor, t, animar); },
      itensDesenho: function (pintor, t, animar) {
        E.pintorAtual = pintor; tAtual = animar ? t : 0; animarAtual = animar;
        if (!estatico || sujo) renderizar();
        // lista reusada: os itens fixos que a câmera vê (na ordem de sempre) + os baixos da vez (sem alocar por quadro)
        var v = vistaDoPintor(pintor, vistaItens), n = 0;
        for (var i = 0; i < itens.length; i++) if (!v || !itens[i].caixa || naVista(v, itens[i].caixa)) comPerto[n++] = itens[i];
        for (var j = 0; j < perto.length; j++) comPerto[n++] = perto[j];
        comPerto.length = n;
        return comPerto;
      },
      // para as ferramentas: objetos com a pegada já resolvida
      _objetos: objs,
      _quemEm: function (wx, wy) { var q = II.quemEm(E, wx, wy); return q ? (q.npc ? 'npc:' + q.npc.id : 'obj:' + q.it.i) : null; },
      _renderizar: function () { sujo = true; renderizar(); return estatico; },
      _liberar: liberar,
      _temEstatico: function () { return !!estatico; },
    };
    E.cena = cena;
    var vistaFundo = {}, vistaItens = {};
    // caixa de cada animado e de cada móvel alto (px do jogo): o sprite com o alcance da animação
    function caixa(it, F) { return { x0: it.px - 2 - F, y0: it.py - it.topo - F, x1: it.px + it.W + 2 + F, y1: it.base + 2 + F }; }

    // itens por Y (montados uma vez e a cada refazer; o pintor e o tempo entram por variável). Com caixa (os móveis
    // altos), só entram os que a câmera vê; os NPCs, sem caixa, entram sempre
    var itens = [];
    function montarItens() {
      animados.forEach(function (it) { it.caixa = caixa(it, ALCANCE_ANIM); });
      altos.forEach(function (it) { it.caixa = caixa(it, FOLGA_ITEM); });
      itens = [];
      npcs.forEach(function (n) {
        itens.push({ y: n.y * T + 12, npc: n, desenhar: function () { desenharNpc(E.pintorAtual, n, tAtual, animarAtual); } });
      });
      altos.forEach(function (it) {
        itens.push({ y: it.base - 1, objeto: it.o, caixa: it.caixa, desenhar: function () {
          if (!it.sprite) return;
          spriteNoFundo(it.sprite, it.px + it.W / 2, it.base + 2);
          if (it.lib.anim) it.lib.anim(ctxPintor, it.px, it.py, tAtual, it.o);
        } });
      });
      baixos.forEach(function (it) {
        it.item = { y: it.base - 1, objeto: it.o, desenhar: function () { if (it.sprite) desenharMovel(it); } };
      });
    }
    montarItens();
    // refazer (Reino.Interiores.refazer): grade, objetos e itens de novo a partir do def (com os extras de agora); o
    // mesmo objeto cena continua (a Cena guarda ele). O estático é redesenhado no próximo quadro, sem íris
    cena._refazer = function () {
      montarObjetos();
      montarItens();
      E.g = cena.grade = g; E.objs = cena._objetos = objs;
      E.mascaras = {}; E.retratos = {};
      perto.length = 0; comPerto.length = 0;
      chaveFeita = null; sujo = true;
      return cena;
    };
    return cena;
  }

  // desenha cada NPC uma vez num pintor mudo (vários instantes, com e sem animação), para os
  // caches de sprites e ícones do Reino.NPCs ficarem prontos antes de a íris abrir. Os caches do Reino.NPCs não
  // saem da memória: a volta inteira só na 1ª vez de cada sprite; nas outras, um desenho parado (o ícone de agora)
  var pintorMudo = null, aquecidos = typeof WeakMap === 'function' ? new WeakMap() : null;
  function aquecerNpcs(npcs) {
    if (!R.NPCs || !R.NPCs.desenhar || !npcs.length) return;
    if (!pintorMudo) {
      var c = PA.novoCanvas(8, 8);
      pintorMudo = { ctx: c.getContext('2d'), escala: 3, dpr: 1, cam: { x: 0, y: 0 },
        tela: function (x, y) { return { x: x, y: y }; }, ret: function () {}, sprite: function () {} };
    }
    npcs.forEach(function (n) {
      try {
        if (aquecidos && n.sprite && aquecidos.get(n) === n.sprite) { R.NPCs.desenhar(pintorMudo, n, n.x * T + 8, n.y * T + 12, 0, false); return; }
        if (R.NPCs.sprite) { R.NPCs.sprite(n, 0); R.NPCs.sprite(n, 1); }
        if (R.NPCs.retrato) { R.NPCs.retrato(n, 0); R.NPCs.retrato(n, 1); }
        for (var t = 0; t <= 6000; t += 50) R.NPCs.desenhar(pintorMudo, n, n.x * T + 8, n.y * T + 12, t, true);
        R.NPCs.desenhar(pintorMudo, n, n.x * T + 8, n.y * T + 12, 0, false);
        if (aquecidos && n.sprite && typeof n.sprite === 'object') aquecidos.set(n, n.sprite);
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
    // para os testes: as cenas com o estático na memória, da usada há mais tempo à mais recente
    _naMemoria: function () { return vivas.map(function (c) { return c.id; }); },
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
    // decorável (casa.md §4): refaz grade, objetos e estático da cena id a partir do def (com os objetosExtras de
    // agora). A cena ativa continua a mesma, com ela onde está e sem íris. Cena ainda não criada: nada a refazer
    // (a próxima cena(id) já nasce com os extras). Devolve a cena ou null
    refazer: function (id) { return cenas[id] ? cenas[id]._refazer() : null; },
    grade: grade,
    // placa de cômodo (e nome de kit da casa) com {nome}, {a|b} e {uni} trocados (interiores-placas.js)
    textoPlaca: II.textoPlaca,
    objeto: objeto,
    OBJETOS: OBJETOS, PISOS: II.PISOS, PAREDES: II.PAREDES, FUNDOS: II.FUNDOS,
    desenho: { C: C, ret: D.ret, circulo: D.circulo, elipse: D.elipse, triangulo: D.triangulo, contornoRet: D.contornoRet, matriz: D.matriz, miudeza: D.miudeza, sorte: D.sorte,
      misturar: D.misturar, escurecer: D.escurecer, clarear: D.clarear },
    // utilidades para as ferramentas e o validador (puras)
    caminhoNaGrade: caminhoNa,
    // escadas pareadas (interiores-toque.js): onde ela chega pela escada i; vindo do andar `de` para `para`
    chegadaDaEscada: II.chegadaDaEscada, chegadaVindoDe: II.chegadaVindoDe,
    dimensoes: dimensoes, solidoDe: solidoDe, ehParede: ehParede, ehAlto: ehAlto, interativo: interativo,
  };
})();
