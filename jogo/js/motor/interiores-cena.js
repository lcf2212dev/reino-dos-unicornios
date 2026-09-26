/* Interiores: a cena de um interior (o que o motor/laco.js desenha e a Cena usa: grade, caminho, alvos,
   desenho do fundo, dos móveis altos e dos NPCs, placas por cima), o NPC genérico e a API pública
   Reino.Interiores. Veio de motor/interiores.js. A interface da cena é a da seção 2 de
   CONTRATOS-INTERIORES.md. O estado de cada cena que as outras partes usam fica em E
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
    var tAtual = 0, animarAtual = false;
    // estado desta cena usado pelas funções de interiores-toque.js (pintorAtual: o pintor do último quadro;
    // mascaras: máscaras do desenho dos objetos, refeitas em renderizar; retratos: retrato de cada objeto que fala)
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
      E.mascaras = {};
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
    if (R.util && R.util.on) { R.util.on(R.EVENTOS.PROGRESSO, marcarSujo); R.util.on(R.EVENTOS.PROGRESSO_REMOTO, marcarSujo); R.util.on(R.EVENTOS.MAPA_MUDOU, marcarSujo); }

    // contexto falso para as animações dos móveis altos: desenha com o pintor, em px da tela
    var ctxPintor = { fillStyle: '#000', fillRect: function (x, y, w, h) { E.pintorAtual.ret(x, y, w, h, this.fillStyle); } };

    var cena = {
      id: def.id, tipo: 'interior', lugarId: def.lugar, nome: def.nome, def: def, corFundo: FUNDO,
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
      // antes dos personagens: nada (as placas vão por cima, em desenharSobre)
      desenharTela: function () {},
      // placas dos cômodos, em px da tela, com a fonte pixel, por cima de móveis e personagens (interiores-placas.js)
      desenharSobre: function (ctx, pintor, t, animar) { II.desenharPlacas(def, ctx, pintor, t, animar); },
      itensDesenho: function (pintor, t, animar) {
        E.pintorAtual = pintor; tAtual = animar ? t : 0; animarAtual = animar;
        if (!estatico || sujo) renderizar();
        return itens;
      },
      // para as ferramentas: objetos com a pegada já resolvida
      _objetos: objs,
      _quemEm: function (wx, wy) { var q = II.quemEm(E, wx, wy); return q ? (q.npc ? 'npc:' + q.npc.id : 'obj:' + q.it.i) : null; },
      _renderizar: function () { sujo = true; renderizar(); return estatico; },
    };
    E.cena = cena;

    // itens por Y (montados uma vez; o pintor e o tempo entram por variável)
    var itens = [];
    npcs.forEach(function (n) {
      itens.push({ y: n.y * T + 12, npc: n, desenhar: function () { desenharNpc(E.pintorAtual, n, tAtual, animarAtual); } });
    });
    altos.forEach(function (it) {
      itens.push({ y: it.base - 1, objeto: it.o, desenhar: function () {
        if (!it.sprite) return;
        E.pintorAtual.sprite(it.sprite, it.px + it.W / 2, it.base + 2);
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
    OBJETOS: OBJETOS, PISOS: II.PISOS, PAREDES: II.PAREDES,
    desenho: { C: C, ret: D.ret, circulo: D.circulo, elipse: D.elipse, triangulo: D.triangulo, contornoRet: D.contornoRet, matriz: D.matriz, miudeza: D.miudeza, sorte: D.sorte,
      misturar: D.misturar, escurecer: D.escurecer, clarear: D.clarear },
    // utilidades para as ferramentas e o validador (puras)
    caminhoNaGrade: caminhoNa,
    dimensoes: dimensoes, solidoDe: solidoDe, ehParede: ehParede, ehAlto: ehAlto, interativo: interativo,
  };
})();
