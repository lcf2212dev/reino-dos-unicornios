/* Parquinho, parte 5: como ela e o unicórnio brincam nos brinquedos da fase 1 (balanço, escorregador, gangorra,
   caixa de areia), registrado em Reino.ParquinhoBrincar.registrarPose (interiores/parquinho/brincar.js; o esquema está
   no cabeçalho de lá). Desenha no pintor da camada (px do jogo), com as medidas de P.GEO e os desenhos de objetos.js
   (P.pintor faz o pintor aceitar os mesmos helpers). Sem Animações: a pose parada do meio da brincadeira.
   Cria P.H, os ajudantes que poses-2.js também usa. Nada roda no carregamento. */
(function () {
  var R = window.Reino;
  var P = R._predios.parquinho, GEO = P.GEO, T = 16;
  var H = P.H = {};

  /* ---------- ajudantes ---------- */
  function est() { return R.Progresso.estado(); }
  H.ela = function (sentada, vista, quadro) {
    var usa = est().usando || {};
    return PA.mariana(est().aparencia, !!sentada, quadro || 0, { capa: usa.capa, vista: vista || 'frente' }).canvas;
  };
  H.uni = function (vista, quadro) {
    var Pr = R.Progresso, id = Pr.montaria(), u = est().unis[id], usa = est().usando || {};
    return PA.unicornio(Pr.defUni(id), R.Unicornios.estagio(u ? u.xp : 0), quadro || 0,
      { enfeites: usa.enfeites, asasFada: usa.asasFada, vista: vista || 'lado' }).canvas;
  };
  H.spr = function (p, img, x, yPes, espelhar) { Jogador.desenharSprite(p, img, Math.round(x), Math.round(yPes), espelhar); };
  H.sombra = function (p, x, y, larg) { Jogador.sombra(p, Math.round(x), Math.round(y), larg); };
  H.origem = function (st) { return { x: st.obj.x * T, y: st.obj.y * T }; };
  H.base = function (st) { return (st.obj.y + st.obj.h) * T + 0.5; };
  H.lerp = function (a, b, k) { return a + (b - a) * k; };
  H.trecho = function (k, a, b) { return Math.max(0, Math.min(1, (k - a) / (b - a))); };
  // arco de um pulinho de a até b (pés), k de 0 a 1
  H.arco = function (a, b, k, alto) { return { x: Math.round(H.lerp(a.x, b.x, k)), y: Math.round(H.lerp(a.y, b.y, k) - 4 * (alto || 10) * k * (1 - k)) }; };
  // desenha fn() só entre as linhas y0 e y1 (px do jogo)
  H.faixa = function (p, y0, y1, fn) {
    var ctx = p.ctx, a = p.tela(0, y0).y, b = p.tela(0, y1).y;
    ctx.save(); ctx.beginPath(); ctx.rect(0, a, ctx.canvas.width, Math.max(0, b - a)); ctx.clip();
    try { fn(); } finally { ctx.restore(); }
  };
  // passinho: o quadro de andar (0, 1, 2) a cada 140 ms, parado = 0
  H.passo = function (e, animar) { return animar ? [1, 0, 2, 0][Math.floor(e / 140) % 4] : 0; };
  H.onda = function (e, periodo, animar, parado) { return animar ? Math.sin(e / periodo * Math.PI * 2) : (parado === undefined ? 1 : parado); };
  H.item = function (y, fn) { return { y: y, desenhar: fn }; };
  function reg(id, def) { if (R.ParquinhoBrincar) R.ParquinhoBrincar.registrarPose(id, def); }
  P.registrarPose = reg;

  /* ---------- balanço: ela no assento azul e o unicórnio no rosa, balançando juntos (ele um tiquinho atrás) ---------- */
  reg('balanco', {
    esconde: true,
    sons: [[0.05, 'toque'], [0.35, 'toque'], [0.65, 'toque'], [0.97, 'plim']],
    itens: function (p, st, e, animar) {
      var o = H.origem(st), g = GEO.balanco, s = H.onda(e, 1300, animar, 0.6), c = P.pintor(p);
      return [H.item(H.base(st), function () {
        g.assentos.forEach(function (ax, i) {
          var lado = i ? H.onda(e + 160, 1300, animar, 0.6) : s, dx = Math.round(lado * 6), dy = -Math.round(Math.abs(lado) * 3);
          var x = o.x + ax + dx, y = o.y + g.assento + dy;
          P.assento(c, o.x + ax, o.y + g.barra, x, y, g.cores[i]);
          if (i === 0) H.spr(p, H.ela(true, 'frente'), x, y + 6, false);
          else H.spr(p, H.uni('frente'), x, y + 1, false);
          P.linha(c, o.x + ax - 5, o.y + g.barra, x - 5, y, '#8e9ab4'); P.linha(c, o.x + ax + 5, o.y + g.barra, x + 5, y, '#8e9ab4');
        });
      })];
    },
  });

  /* ---------- escorregador: ela sobe a escada, senta e escorrega; o unicórnio vai logo atrás ---------- */
  var ESC = GEO.escorregador;
  function rampa(o, k) {   // ponto da rampa (pés de quem escorrega), k de 0 (topo) a 1 (ponta)
    var a = ESC.rampa[0], b = ESC.rampa[1], f = ESC.fim;
    if (k < 0.85) { var q = k / 0.85; return { x: o.x + H.lerp(a[0], b[0], q), y: o.y + H.lerp(a[1], b[1], q) - 1 }; }
    var r = (k - 0.85) / 0.15;
    return { x: o.x + H.lerp(b[0], f[0], r), y: o.y + b[1] - 1 };
  }
  // onde está quem brinca no tempo k (0 a 1): { x, y, modo: 'sobe'|'senta'|'desce'|'chao', q }
  function percurso(o, k, chegada) {
    var pe = { x: o.x + ESC.escada, y: o.y + 30 }, topo = { x: o.x + ESC.escada, y: o.y + ESC.plataforma - 2 };
    if (k < 0.4) return { x: pe.x, y: Math.round(H.lerp(pe.y, topo.y, k / 0.4)), modo: 'sobe' };
    if (k < 0.5) return { x: o.x + 15, y: topo.y, modo: 'senta' };
    if (k < 0.85) { var r = rampa(o, H.trecho(k, 0.5, 0.85)); return { x: r.x, y: r.y, modo: 'desce' }; }
    var a = rampa(o, 1), q = H.trecho(k, 0.85, 1), pt = H.arco(a, chegada, q, 6);
    return { x: pt.x, y: pt.y, modo: 'chao' };
  }
  reg('escorregador', {
    sons: [[0.48, 'selecionar'], [0.55, 'sacudida'], [0.9, 'plim']],
    saida: function (st) { return { x: st.obj.x + st.obj.w, y: st.obj.y + st.obj.h - 1 }; },
    itens: function (p, st, e, animar) {
      var o = H.origem(st), k = animar ? e / st.dur : 0.45;
      var chegaEla = { x: o.x + 56, y: o.y + 28 }, chegaUni = { x: o.x + 56, y: o.y + 22 };
      // o unicórnio começa onde estava (ao pé da escada) e faz o mesmo caminho, atrasado
      var ku = animar ? H.trecho(k, 0.28, 1) * 0.98 : 0;
      return [H.item(H.base(st), function () {
        var u = percurso(o, ku, chegaUni), ela = percurso(o, Math.min(1, k * 1.25), chegaEla);
        if (!animar || ku === 0) { u = { x: o.x - 4, y: o.y + 30, modo: 'chao' }; }
        desenhar(p, u, true, e, animar);
        desenhar(p, ela, false, e, animar);
      })];
    },
  });
  function desenhar(p, q, uni, e, animar) {
    if (q.modo === 'sobe') {
      H.spr(p, uni ? H.uni('costas', H.passo(e, animar)) : H.ela(false, 'costas', H.passo(e, animar)), q.x, q.y, false);
      return;
    }
    if (q.modo === 'chao') H.sombra(p, q.x, q.y, uni ? 8 : 5);
    if (uni) H.spr(p, H.uni('lado', q.modo === 'chao' ? H.passo(e, animar) : 0), q.x, q.y, false);
    else H.spr(p, H.ela(q.modo !== 'chao', q.modo === 'chao' ? 'frente' : 'lado'), q.x, q.y + (q.modo === 'chao' ? 0 : 4), false);
  }

  /* ---------- gangorra: ela numa ponta e o unicórnio na outra, sobe e desce ---------- */
  reg('gangorra', {
    esconde: true,
    sons: [[0.12, 'toque'], [0.37, 'toque'], [0.62, 'toque'], [0.87, 'toque'], [0.98, 'plim']],
    itens: function (p, st, e, animar) {
      var o = H.origem(st), g = GEO.gangorra, c = P.pintor(p);
      var a = Math.round(H.onda(e, 1100, animar, 0.6) * g.inclina);
      function altura(x) { return o.y + g.pivo + Math.round(a * (g.meio - x) / g.meia); }
      var xe = g.meio - g.meia + 11, xu = g.meio + g.meia - 12;
      return [H.item(H.base(st), function () {
        P.prancha(c, o.x, o.y, a);
        H.spr(p, H.ela(true, 'lado'), o.x + xe, altura(xe) + 3, false);
        H.spr(p, H.uni('lado'), o.x + xu, altura(xu), true);
      })];
    },
  });

  /* ---------- caixa de areia: ela senta na areia e o castelinho sobe em etapas; o unicórnio ajuda ---------- */
  reg('areia', {
    esconde: true,
    sons: [[0.2, 'toque'], [0.45, 'toque'], [0.7, 'toque'], [0.95, 'estrela']],
    itens: function (p, st, e, animar) {
      var o = H.origem(st), g = GEO.areia, c = P.pintor(p), k = e / st.dur;
      var etapa = animar ? Math.min(4, 1 + Math.floor(k * 4.4)) : 4;
      var pula = animar && Math.floor(e / 320) % 2 ? 1 : 0;
      return [H.item(H.base(st), function () {
        P.castelo(c, o.x + g.castelo[0], o.y + g.castelo[1], etapa);
        H.sombra(p, o.x + g.uni[0], o.y + g.uni[1], 8);
        H.spr(p, H.uni('lado'), o.x + g.uni[0], o.y + g.uni[1] - pula, true);
        H.spr(p, H.ela(true, 'frente'), o.x + g.ela[0], o.y + g.ela[1], false);
        if (animar && etapa < 4) {                                            // a areia voando das mãos
          var f = (e % 400) / 400;
          [[-4, 1], [3, 0], [7, 2]].forEach(function (s, i) {
            c.fillStyle = i % 2 ? '#e8c77e' : '#f6e2a8';
            c.fillRect(o.x + g.ela[0] + 8 + s[0] + Math.round(f * 6), o.y + g.ela[1] - 10 - Math.round(Math.sin(f * Math.PI) * 6) + s[1], 1, 1);
          });
        }
      })];
    },
  });
})();
