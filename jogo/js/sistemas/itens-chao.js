/* O item no chão da arena (docs/contratos/itens.md §5, "Animação no chão"): módulo 'itens-chao' com camada.
   No ITENS 'ganhou' ou 'estrelas' da arena de agora, o ícone do item (item:<id>, ou o emoji da comidinha; nas estrelas,
   uma ⭐ por estrela) salta de onde o inimigo sumiu, quica (chao.quicaMs), brilha no chão (chao.brilhaMs) e voa até ela
   (chao.voaMs), com o contorno do ícone e sem girar; ao chegar toca 'plim' (item) ou 'estrela'.
   O relógio é o do quadro, como o combate (sistemas/bosque-combate.js): com tela aberta ou a cena bloqueada (a pergunta,
   a íris, o desmaio) a animação espera e termina depois. Sem Animações: fica parado no chão por chao.brilhaMs e some.
   Fora da arena (saiu no meio, trocou de cena): esquecida. É só o desenho: o item já foi gravado na hora do drop
   (sistemas/itens-drop.js), e nada aqui grava nem trava o passo do combate.
   Puros (testes no Node): novo(carga), avancar(lista, dt, animar) → os que acabaram, onde(d, animar, jx, jy).
   node: true: nada de DOM, Progresso nem Cena no carregamento (só dentro das funções). */
(function () {
  var R = window.Reino, U = R.util, EV = R.EVENTOS;
  var SALTO = 14, PULINHO = 3, AFASTA = 8, SUBIDA = 8;   // px do jogo: altura do salto e do quique, quanto anda de lado, a subida até o peito dela
  var S = { lista: [], ultimoT: null, n: 0 };
  function cfg() { return R.config.itens.chao; }
  function duracao(animar) { var c = cfg(); return animar ? c.quicaMs + c.brilhaMs + c.voaMs : c.brilhaMs; }

  /* ================= PURO ================= */
  /** um item no chão a partir da carga do ITENS ('ganhou' ou 'estrelas'; i = qual estrela). x, y = os pés do inimigo */
  function novo(carga, i) {
    var d = R.ItensCatalogo && carga.id ? R.ItensCatalogo.def(carga.id) : null;
    // as estrelas se abrem em leque (uma ao lado da outra, sem se tapar); o item vai para um lado de cada vez
    var lado = carga.tipo === 'estrelas' ? ((i || 0) - ((carga.n || 1) - 1) / 2) * 2 : (S.n % 2 ? -1 : 1);
    S.n++;
    return { icone: carga.tipo === 'estrelas' ? '⭐' : d ? d.icone : '⭐', som: carga.tipo === 'estrelas' ? 'estrela' : 'plim',
      x0: carga.x, y0: carga.y, x1: carga.x + lado * AFASTA, y1: carga.y + (i || 0), idade: -(i || 0) * 80, fim: false };
  }
  /** avança o relógio de todos (dt em ms); devolve os que acabaram agora (e os tira da lista) */
  function avancar(lista, dt, animar) {
    var fim = duracao(animar), feitos = [];
    for (var i = lista.length - 1; i >= 0; i--) {
      lista[i].idade += dt;
      if (lista[i].idade >= fim) { lista[i].fim = true; feitos.push(lista.splice(i, 1)[0]); }
    }
    return feitos;
  }
  /** onde ele está: { x, y (o chão embaixo dele), alto (px acima do chão), fase: 'quica'|'brilha'|'voa'|'parado'|'espera', k } */
  function onde(d, animar, jx, jy) {
    var c = cfg(), t = d.idade, k;
    if (t < 0) return { x: d.x0, y: d.y0, alto: 0, fase: 'espera', k: 0 };
    if (!animar) return { x: d.x1, y: d.y1, alto: 0, fase: 'parado', k: Math.min(1, t / c.brilhaMs) };
    if (t < c.quicaMs) {
      // um salto grande (70% do tempo) e um quique pequeno; anda de lado só no salto
      k = t / c.quicaMs;
      var a = Math.min(1, k / 0.7), alto = k < 0.7 ? SALTO * Math.sin(Math.PI * a) : PULINHO * Math.sin(Math.PI * (k - 0.7) / 0.3);
      return { x: d.x0 + (d.x1 - d.x0) * a, y: d.y0 + (d.y1 - d.y0) * a, alto: alto, fase: 'quica', k: k };
    }
    t -= c.quicaMs;
    if (t < c.brilhaMs) return { x: d.x1, y: d.y1, alto: 0, fase: 'brilha', k: t / c.brilhaMs };
    // voa até ela: devagar no começo e depressa no fim, subindo até o peito
    k = Math.min(1, (t - c.brilhaMs) / c.voaMs);
    var e = k * k;
    return { x: d.x1 + (jx - d.x1) * e, y: d.y1 + (jy - d.y1) * e, alto: SUBIDA * e + 4 * Math.sin(Math.PI * k), fase: 'voa', k: k };
  }

  /* ================= NO JOGO ================= */
  function arenaDeAgora() { var BC = R.BosqueCombate; return BC && BC.arena ? BC.arena() : null; }
  function bloqueado() { return !!(R.Cena && R.Cena.bloqueado && R.Cena.bloqueado()) || !!(R.UI && R.UI.temTela && R.UI.temTela()); }
  function aoItem(c) {
    if (!c || (c.tipo !== 'ganhou' && c.tipo !== 'estrelas')) return;
    var arena = arenaDeAgora(), J = window.Jogador;
    if (!arena || c.arena !== arena) return;   // só o drop desta arena (ganho de outro jeito não salta do chão)
    // sem lugar (o inimigo já tinha sumido da lista): os pés dela
    var carga = { tipo: c.tipo, id: c.id, n: Math.max(1, Math.min(3, c.n || 1)), x: typeof c.x === 'number' ? c.x : J ? J.x : 0, y: typeof c.y === 'number' ? c.y : J ? J.y : 0 };
    var n = c.tipo === 'estrelas' ? carga.n : 1;
    for (var i = 0; i < n; i++) S.lista.push(novo(carga, i));
  }
  function tocar(feitos) {
    if (!R.Som || !R.Som.tocar) return;
    var sons = {};
    feitos.forEach(function (d) { sons[d.som] = 1; });   // várias estrelas juntas: um som só
    Object.keys(sons).forEach(function (s) { R.Som.tocar(s); });
  }

  /* ---------- desenho (itens fixos, um por item no chão) ---------- */
  var P = null, T0 = 0, ANIMAR = false, itens = [];
  var BRILHO = ['#ffffff', '#fff3c4'];
  function imagem(icone) { return window.PA && PA.iconeDesenho ? PA.iconeDesenho(icone.replace(/\uFE0F/g, '')) : null; }
  function desenhar() {
    var d = this.d, J = window.Jogador, w = onde(d, ANIMAR, J.x, J.y - 2), img = imagem(d.icone);
    if (!img || w.fase === 'espera') return;
    var x = Math.round(w.x), y = Math.round(w.y), alto = Math.round(w.alto);
    if (w.fase !== 'voa' && J.sombra) J.sombra(P, x, y, 4);
    P.sprite(img, x, y + 1 - alto);
    if (w.fase !== 'brilha' && w.fase !== 'parado') return;
    // brilhinhos em volta (parados sem Animações), em px inteiros do jogo
    var topo = y + 1 - alto - img.height, pisca = ANIMAR ? Math.floor(T0 / 90) % 2 : 0;
    P.ret(x - 10, topo + 4 + pisca, 1, 1, BRILHO[0]);
    P.ret(x + 9, topo + 9 - pisca, 1, 1, BRILHO[1]);
    P.ret(x + 2, topo - 3 + pisca, 1, 1, BRILHO[0]);
    if (!pisca) { P.ret(x - 9, topo + 4, 3, 1, BRILHO[1]); P.ret(x - 8, topo + 3, 1, 3, BRILHO[1]); }
  }
  var camada = {
    ativo: function () { return S.lista.length > 0 && !!window.Jogador; },
    itensDesenho: function (p, t, animar) {
      itens.length = 0;
      var dt = S.ultimoT === null ? 0 : Math.max(0, Math.min(50, t - S.ultimoT));
      S.ultimoT = t;
      if (!arenaDeAgora()) { S.lista.length = 0; return itens; }
      if (!bloqueado()) tocar(avancar(S.lista, dt, animar));
      P = p; T0 = t; ANIMAR = animar;
      var J = window.Jogador;
      S.lista.forEach(function (d) {
        if (!d.item) d.item = { y: 0, d: d, desenhar: desenhar };
        // voando, passa na frente dela; no chão, na ordem por y
        d.item.y = animar && onde(d, animar, J.x, J.y).fase === 'voa' ? J.y + 0.01 : d.y1;
        itens.push(d.item);
      });
      return itens;
    },
  };
  // camada inativa não é chamada: o relógio recomeça quando aparecer o próximo
  function esquecer() { S.lista.length = 0; S.ultimoT = null; }

  U.on(EV.ITENS, function (c) { if (!S.lista.length) S.ultimoT = null; aoItem(c); });
  U.on(EV.CENA, esquecer);

  R.ItensChao = { novo: novo, avancar: avancar, onde: onde, lista: function () { return S.lista; }, esquecer: esquecer };
  R.registrarModulo({
    id: 'itens-chao',
    camada: camada,
    depurar: function () { return { noChao: S.lista.length, icones: S.lista.map(function (d) { return d.icone; }) }; },
  });
})();
